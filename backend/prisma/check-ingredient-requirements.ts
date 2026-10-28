
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { calculateIngredientRequirements } from '../src/orders/ingredient-stock';

const prisma = new PrismaClient();

async function main() {
    const result = await prisma.$transaction((tx) =>
        calculateIngredientRequirements(tx, [
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
        ]),
    );

    console.table(result);
}

main()
    .catch((error) => {
        console.error(error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
