import {
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CreateOrderItemDto } from './dto/create-order.dto';

export interface IngredientRequirement {
    ingredientId: number;
    name: string;
    unit: string;
    quantity: number;
}

export async function calculateIngredientRequirements(
    tx: Prisma.TransactionClient,
    items: CreateOrderItemDto[],
): Promise<IngredientRequirement[]> {
    const totals = new Map<number, IngredientRequirement>();

    if (!items.length) {
        throw new BadRequestException('Đơn hàng không có sản phẩm');
    }

    for (const item of items) {
        if (!Number.isInteger(item.qty) || item.qty < 1) {
        throw new BadRequestException('Số lượng phải lớn hơn 0');
        }

        const size = item.size || 'DEFAULT';

        if (!['DEFAULT', 'S', 'M', 'L'].includes(size)) {
        throw new BadRequestException('Size không hợp lệ');
        }

        // 1. Lấy công thức theo sản phẩm và size
        const recipeRows = await tx.recipeItem.findMany({
        where: {
            productId: item.productId,
            size,
        },
        include: {
            ingredient: true,
        },
    });

    if (recipeRows.length === 0) {
        throw new BadRequestException(
            `Chưa có công thức cho sản phẩm ${item.productId}, size ${size}`,
        );
    }

    // 2. Lấy công thức các topping đã chọn
    const toppingNames = item.toppings ?? [];

    if (new Set(toppingNames).size !== toppingNames.length) {
        throw new BadRequestException('Topping bị trùng lặp');
    }

    const toppingRows = toppingNames.length
        ? await tx.toppingRecipe.findMany({
            where: {
                name: { in: toppingNames },
            },
            include: {
                ingredient: true,
            },
            })
        : [];

    // Không cho phép topping không tồn tại
    const foundNames = new Set(
        toppingRows.map((row) => row.name),
    );

    for (const name of toppingNames) {
        if (!foundNames.has(name)) {
            throw new BadRequestException(
            `Topping không hợp lệ: ${name}`,
            );
        }
    }

    // 3. Cộng nguyên liệu món chính và topping
    for (const row of [...recipeRows, ...toppingRows]) {
      const requiredQuantity = row.quantity * item.qty;
        const existing = totals.get(row.ingredientId);

        if (existing) {
        existing.quantity += requiredQuantity;
        } else {
        totals.set(row.ingredientId, {
            ingredientId: row.ingredientId,
            name: row.ingredient.name,
            unit: row.ingredient.unit,
            quantity: requiredQuantity,
        });
        }
    }
}

  // Sắp xếp theo ID để chuẩn bị cập nhật kho
    return [...totals.values()].sort(
    (a, b) => a.ingredientId - b.ingredientId,
    );
}

export async function reserveIngredients(
    tx: Prisma.TransactionClient,
    requirements: IngredientRequirement[],): Promise<void> {
  // 1. Sắp xếp nguyên liệu theo ID
    const sortedRequirements = [...requirements].sort(
        (a, b) => a.ingredientId - b.ingredientId,
    );

    // 2. Đọc dữ liệu nguyên liệu hiện tại
    const ingredients = await tx.ingredient.findMany({
        where: {
        id: {
            in: sortedRequirements.map(
            (item) => item.ingredientId,
            ),
        },
        },
    });

    const ingredientMap = new Map(
        ingredients.map((item) => [item.id, item]),
    );

  // 3. Kiểm tra và giữ từng nguyên liệu
    for (const requirement of sortedRequirements) {
        const ingredient = ingredientMap.get(
        requirement.ingredientId,
        );

        if (!ingredient) {
        throw new BadRequestException(
            `Nguyên liệu không tồn tại: ${requirement.name}`,
        );
        }

        if (
        !Number.isSafeInteger(requirement.quantity) ||
        requirement.quantity <= 0
        ) {
        throw new BadRequestException(
            'Số lượng nguyên liệu không hợp lệ',
        );
        }

        if (ingredient.stock < requirement.quantity) {
        throw new BadRequestException(
            `Không đủ nguyên liệu: ${ingredient.name}`,
        );
    }

    // 4. Optimistic Locking
    const result = await tx.ingredient.updateMany({
        where: {
            id: ingredient.id,
            version: ingredient.version,
            stock: {
            gte: requirement.quantity,
            },
        },
        data: {
            stock: {
            decrement: requirement.quantity,
            },
            version: {
            increment: 1,
            },
        },
        });

        // 5. Phát hiện xung đột
        if (result.count !== 1) {
        throw new ConflictException(
            `Tồn kho ${ingredient.name} đã thay đổi. Vui lòng thử lại`,
        );
        }
    }
}


export async function releaseOrderIngredients(
    tx: Prisma.TransactionClient,
    orderId: number,
    ): Promise<boolean> {
    const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { ingredientUses: true },
    });

    if (!order) {
        throw new BadRequestException('Đơn hàng không tồn tại');
    }

    // Đơn hàng cũ chưa có dữ liệu nguyên liệu
    if (order.ingredientUses.length === 0) {
        return false;
    }

    // Nguyên liệu đã hoàn trước đó, không hoàn thêm
    if (!order.ingredientsReserved) {
        return true;
    }

    const changed = await tx.order.updateMany({
        where: {
        id: orderId,
        ingredientsReserved: true,
        },
        data: {
        ingredientsReserved: false,
        },
    });

    if (changed.count !== 1) {
        throw new ConflictException(
        'Trạng thái giữ nguyên liệu đã thay đổi',
        );
    }

    // Hoàn số lượng nguyên liệu đã lưu của đơn hàng
    for (const item of order.ingredientUses) {
        await tx.ingredient.update({
        where: { id: item.ingredientId },
        data: {
            stock: { increment: item.quantity },
            version: { increment: 1 },
        },
        });
    }

    return true;
    }

    export async function reserveOrderIngredients(
    tx: Prisma.TransactionClient,
    orderId: number,
    ): Promise<boolean> {
    const order = await tx.order.findUnique({
        where: { id: orderId },
        include: {
        ingredientUses: {
            include: { ingredient: true },
        },
        },
    });

    if (!order) {
        throw new BadRequestException('Đơn hàng không tồn tại');
    }

    // Đơn hàng cũ chưa có dữ liệu nguyên liệu
    if (order.ingredientUses.length === 0) {
        return false;
    }

    // Đã giữ nguyên liệu thì không được trừ lại
    if (order.ingredientsReserved) {
        return true;
    }

    const requirements: IngredientRequirement[] =
        order.ingredientUses.map((item) => ({
        ingredientId: item.ingredientId,
        name: item.ingredient.name,
        unit: item.ingredient.unit,
        quantity: item.quantity,
        }));

    // Sử dụng lại Optimistic Locking đã viết ở Bước 8
    await reserveIngredients(tx, requirements);

    const changed = await tx.order.updateMany({
        where: {
        id: orderId,
        ingredientsReserved: false,
        },
        data: {
        ingredientsReserved: true,
        },
    });

    if (changed.count !== 1) {
        throw new ConflictException(
        'Trạng thái giữ nguyên liệu đã thay đổi',
        );
    }

    return true;
}
