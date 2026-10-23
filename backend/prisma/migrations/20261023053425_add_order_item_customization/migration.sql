-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "sizeExtra" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "toppings" JSONB;
