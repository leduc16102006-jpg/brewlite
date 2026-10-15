
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const products = [
  { id: 1, name: 'Americano', price: 39000, imageUrl: '/images/americano.jpg' },
  { id: 2, name: 'Latte', price: 55000, imageUrl: '/images/latte.jpg' },
  { id: 3, name: 'Cappuccino', price: 55000, imageUrl: '/images/cappuccino.jpg' },
  { id: 4, name: 'Bac Xiu', price: 45000, imageUrl: '/images/bac-xiu.jpg' },
  { id: 5, name: 'Black coffee', price: 35000, imageUrl: '/images/black-coffee.jpg' },
  { id: 6, name: 'Macchiato', price: 55000, imageUrl: '/images/macchiato.jpg' },
  { id: 7, name: 'Espresso', price: 39000, imageUrl: '/images/espresso.jpg' },
  { id: 8, name: 'Milk coffee', price: 45000, imageUrl: '/images/milk-coffee.jpg' },
  { id: 9, name: 'Mocha', price: 55000, imageUrl: '/images/mocha.jpg' },
  { id: 10, name: 'Salty coffee', price: 45000, imageUrl: '/images/salty-coffee.jpg' },
];

async function main() {
  for (const product of products) {
    await prisma.product.upsert({
      where: { id: product.id },
      update: {
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
      },
      create: {
        ...product,
        stock: 20,
      },
    });
  }

  console.log('Seeded 10 BrewLite products');
}

main()
  .catch((error) => {
    console.error(error);
    throw error;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
