/*
  Warnings:

  - You are about to drop the `ShopItem` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "ShopItem";

-- CreateTable
CREATE TABLE "ShopCatalog" (
    "id" INTEGER NOT NULL,
    "items" JSONB NOT NULL,

    CONSTRAINT "ShopCatalog_pkey" PRIMARY KEY ("id")
);
