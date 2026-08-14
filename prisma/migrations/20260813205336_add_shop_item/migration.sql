-- CreateTable
CREATE TABLE "ShopItem" (
    "id" SERIAL NOT NULL,
    "itemId" INTEGER NOT NULL,
    "itemName" TEXT NOT NULL,
    "imageSrc" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "purchasePrice" INTEGER NOT NULL,
    "sellPrice" INTEGER NOT NULL,

    CONSTRAINT "ShopItem_pkey" PRIMARY KEY ("id")
);
