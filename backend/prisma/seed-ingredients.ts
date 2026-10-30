import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Dữ liệu nguyên liệu mẫu cho BrewLite.
// Đơn vị stock tương ứng với unit.
const ingredients = [
    { name: 'Bột cà phê', unit: 'g', stock: 5000 },
    { name: 'Sữa tươi', unit: 'ml', stock: 10000 },
    { name: 'Sữa đặc', unit: 'ml', stock: 5000 },
    { name: 'Nước lọc', unit: 'ml', stock: 15000 },
    { name: 'Đường', unit: 'g', stock: 3000 },
    { name: 'Siro vanilla', unit: 'ml', stock: 3000 },
    { name: 'Bột cacao', unit: 'g', stock: 2000 },
    { name: 'Sốt socola', unit: 'ml', stock: 3000 },
    { name: 'Kem cheese', unit: 'g', stock: 2500 },
    { name: 'Trân châu', unit: 'g', stock: 3000 },
    { name: 'Muối', unit: 'g', stock: 1000 },
    { name: 'Đá viên', unit: 'g', stock: 20000 },
];

async function main() {
    for (const ingredient of ingredients) {
        await prisma.ingredient.upsert({
        where: {
            name: ingredient.name,
        },
        update: {},
        create: {
            name: ingredient.name,
            unit: ingredient.unit,
            stock: ingredient.stock,
        },
        });

        console.log(`Đã kiểm tra nguyên liệu: ${ingredient.name}`);
    }

    console.log('Hoàn thành seed nguyên vật liệu BrewLite');
}

main()
    .catch((error) => {
        console.error(error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
