import { PrismaClient } from '@prisma/client';
import { spawnSync } from 'node:child_process';
import { join, resolve } from 'node:path';

const prisma = new PrismaClient();

const scripts = [
  'seed.ts',
  'seed-ingredients.ts',
  'seed-recipes.ts',
  'seed-toppings.ts',
];

async function main() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Không được seed dữ liệu mẫu trên production');
  }

  const root = resolve(__dirname, '..');
  const tsNode = require.resolve('ts-node/dist/bin.js');

  for (const script of scripts) {
    console.log(`\n=== RUN ${script} ===`);

    const result = spawnSync(
      process.execPath,
      [tsNode, join(__dirname, script)],
      {
        cwd: root,
        stdio: 'inherit',
        env: process.env,
      },
    );

    if (result.error) throw result.error;

    if (result.status !== 0) {
      throw new Error(`Seed failed: ${script}`);
    }
  }

  const [products, ingredients, recipes, toppings] =
    await Promise.all([
      prisma.product.findMany({
        where: { id: { in: [1,2,3,4,5,6,7,8,9,10] } },
        include: { recipes: true },
      }),
      prisma.ingredient.count(),
      prisma.recipeItem.count({
        where: { productId: { in: [1,2,3,4,5,6,7,8,9,10] } },
      }),
      prisma.toppingRecipe.count(),
    ]);

  console.table({
    Products: products.length,
    Ingredients: ingredients,
    Recipes: recipes,
    Toppings: toppings,
  });

  if (
    products.length !== 10 ||
    ingredients < 12 ||
    recipes < 100 ||
    toppings < 3
  ) {
    throw new Error('Seed data is incomplete');
  }

  for (const product of products) {
    for (const size of ['DEFAULT', 'S', 'M', 'L']) {
      const items = product.recipes.filter(
        (r) => r.size === size,
      );

      if (
        items.length === 0 ||
        items.some((r) => r.quantity <= 0)
      ) {
        throw new Error(
          `Product ${product.id} missing recipe for ${size}`,
        );
      }
    }
  }

  console.log('\nSEED ALL COMPLETED SUCCESSFULLY');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });