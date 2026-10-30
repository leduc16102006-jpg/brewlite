import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Công thức topping mẫu cho BrewLite
const toppingRecipes = [
    {
        name: 'Trân châu',
        ingredient: 'Trân châu',
        quantity: 30,
    },
    {
        name: 'Extra shot',
        ingredient: 'Bột cà phê',
        quantity: 9,
    },
    {
        name: 'Kem cheese',
        ingredient: 'Kem cheese',
        quantity: 25,
    },
];

async function main() {
    const ingredients = await prisma.ingredient.findMany();

    const ingredientMap = new Map(
        ingredients.map((item) => [item.name, item.id]),
    );

    // Kiểm tra dữ liệu trước khi tạo công thức
    for (const topping of toppingRecipes) {
        if (!ingredientMap.has(topping.ingredient)) {
        throw new Error(
            `Không tìm thấy nguyên liệu: ${topping.ingredient}`,
        );
        }
    }

    await prisma.$transaction(async (tx) => {
        for (const topping of toppingRecipes) {
        const ingredientId = ingredientMap.get(
            topping.ingredient,
        )!;

        await tx.toppingRecipe.upsert({
            where: {
            name_ingredientId: {
                name: topping.name,
                ingredientId,
            },
            },
            update: {},
            create: {
            name: topping.name,
            ingredientId,
            quantity: topping.quantity,
            },
        });

        console.log(
            `Đã tạo topping: ${topping.name}`,
        );
        }
    });

    console.log(
        'Hoàn thành công thức topping BrewLite',
    );
}

main()
    .catch((error) => {
        console.error(error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
