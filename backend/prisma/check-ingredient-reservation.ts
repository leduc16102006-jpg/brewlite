
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import {
    calculateIngredientRequirements,
    reserveIngredients,
} from '../src/orders/ingredient-stock';

const prisma = new PrismaClient();

async function main() {
    const items = [
        {
        productId: 2,
        qty: 2,
        size: 'M',
        toppings: ['Extra shot'],
        },
        {
        productId: 1,
        qty: 1,
        size: 'M',
        },
    ];

    const requirements = await prisma.$transaction(
        (tx) => calculateIngredientRequirements(tx, items),
    );

    const ids = requirements.map(
        (item) => item.ingredientId,
    );

    const before = await prisma.ingredient.findMany({
        where: { id: { in: ids } },
    });

    console.log('=== TỒN KHO TRƯỚC TEST ===');
    console.table(
        before.map((item) => ({
        name: item.name,
        stock: item.stock,
        version: item.version,
        })),
    );

    try {
        await prisma.$transaction(async (tx) => {
        await reserveIngredients(tx, requirements);

        const during = await tx.ingredient.findMany({
            where: { id: { in: ids } },
        });

        console.log('=== BÊN TRONG TRANSACTION ===');
        console.table(
            during.map((item) => ({
            name: item.name,
            stock: item.stock,
            version: item.version,
            })),
        );

        // Cố tình gây lỗi để kiểm tra rollback
        throw new Error('FORCE_ROLLBACK');
        });
    } catch (error) {
        if (
        !(error instanceof Error) ||
        error.message !== 'FORCE_ROLLBACK'
        ) {
        throw error;
        }

        console.log('Đã chủ động rollback Transaction');
    }

    const after = await prisma.ingredient.findMany({
        where: { id: { in: ids } },
    });

    const unchanged = before.every((item) => {
        const current = after.find(
        (row) => row.id === item.id,
        );

        return (
        current?.stock === item.stock &&
        current?.version === item.version
        );
    });

    console.log('=== TỒN KHO SAU ROLLBACK ===');
    console.table(
        after.map((item) => ({
        name: item.name,
        stock: item.stock,
        version: item.version,
        })),
    );

    if (!unchanged) {
        throw new Error('ROLLBACK TEST FAILED');
    }

    console.log('ROLLBACK TEST PASSED');
}

main()
    .catch((error) => {
        console.error(error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
