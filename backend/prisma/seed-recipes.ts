import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Công thức mẫu của size M.
// Số liệu tính theo đơn vị của từng Ingredient.
const recipes: Record<number, Record<string, number>> = {
    1: {
        'Bột cà phê': 18,
        'Nước lọc': 140,
    },
    2: {
        'Bột cà phê': 18,
        'Sữa tươi': 150,
    },
    3: {
        'Bột cà phê': 18,
        'Sữa tươi': 130,
    },
    4: {
        'Bột cà phê': 12,
        'Sữa tươi': 130,
        'Sữa đặc': 30,
    },
    5: {
        'Bột cà phê': 18,
        'Nước lọc': 80,
    },
    6: {
        'Bột cà phê': 18,
        'Sữa tươi': 50,
    },
    7: {
        'Bột cà phê': 18,
        'Nước lọc': 40,
    },
    8: {
        'Bột cà phê': 18,
        'Sữa đặc': 35,
        'Nước lọc': 80,
    },
    9: {
        'Bột cà phê': 18,
        'Sữa tươi': 140,
        'Sốt socola': 20,
    },
    10: {
        'Bột cà phê': 18,
        'Sữa đặc': 20,
        'Sữa tươi': 100,
        'Muối': 1,
    },
};

// Hệ số định lượng theo kích cỡ.
const sizeFactors = {
    S: 0.8,
    M: 1,
    L: 1.3,
    DEFAULT: 1,
};

async function main() {
    const productIds = Object.keys(recipes).map(Number);

    const products = await prisma.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true },
    });

    if (products.length !== productIds.length) {
        throw new Error(
        'Thiếu sản phẩm BrewLite. Hãy kiểm tra bảng Product.',
        );
    }

    const ingredients = await prisma.ingredient.findMany();

    const ingredientMap = new Map(
        ingredients.map((item) => [item.name, item.id]),
    );

    // Kiểm tra tất cả nguyên liệu trước khi ghi dữ liệu.
    for (const recipe of Object.values(recipes)) {
        for (const ingredientName of Object.keys(recipe)) {
        if (!ingredientMap.has(ingredientName)) {
            throw new Error(
            `Nguyên liệu chưa tồn tại: ${ingredientName}`,
            );
        }
        }
    }

    let count = 0;

    await prisma.$transaction(async (tx) => {
        for (const [productIdText, recipe] of Object.entries(recipes)) {
        const productId = Number(productIdText);

        for (const [size, factor] of Object.entries(sizeFactors)) {
            for (const [name, baseQuantity] of Object.entries(recipe)) {
            const ingredientId = ingredientMap.get(name)!;

            const quantity = Math.max(
                1,
                Math.round(baseQuantity * factor),
            );

            await tx.recipeItem.upsert({
                where: {
                productId_size_ingredientId: {
                    productId,
                    size,
                    ingredientId,
                },
                },
                update: {},
                create: {
                productId,
                ingredientId,
                size,
                quantity,
                },
            });

            count++;
            }
        }

        console.log(`Đã tạo công thức Product ID ${productId}`);
        }
    });

    console.log(`Hoàn thành ${count} dòng công thức pha chế`);
}

main()
    .catch((error) => {
        console.error(error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
