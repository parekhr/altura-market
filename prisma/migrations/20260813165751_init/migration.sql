-- CreateTable
CREATE TABLE "InventoryItem" (
    "id" SERIAL NOT NULL,
    "sessionId" TEXT NOT NULL,
    "itemId" INTEGER NOT NULL,
    "itemName" TEXT NOT NULL,
    "imageSrc" TEXT NOT NULL,
    "purchasePrice" INTEGER NOT NULL,
    "sellPrice" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InventoryItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" SERIAL NOT NULL,
    "sessionId" TEXT NOT NULL,
    "itemId" INTEGER NOT NULL,
    "itemName" TEXT NOT NULL,
    "imageSrc" TEXT,
    "quantity" INTEGER NOT NULL,
    "pricePaid" INTEGER NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'PURCHASE',
    "orderId" TEXT,
    "purchasedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Balance" (
    "sessionId" TEXT NOT NULL,
    "money" INTEGER NOT NULL DEFAULT 5000,

    CONSTRAINT "Balance_pkey" PRIMARY KEY ("sessionId")
);

-- CreateTable
CREATE TABLE "Sale" (
    "id" SERIAL NOT NULL,
    "word" TEXT NOT NULL,
    "discountPercent" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sale_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SaleItemUsage" (
    "id" SERIAL NOT NULL,
    "saleId" INTEGER NOT NULL,
    "itemId" INTEGER NOT NULL,
    "usesRemaining" INTEGER NOT NULL,

    CONSTRAINT "SaleItemUsage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InventoryItem_sessionId_itemId_key" ON "InventoryItem"("sessionId", "itemId");

-- CreateIndex
CREATE UNIQUE INDEX "SaleItemUsage_saleId_itemId_key" ON "SaleItemUsage"("saleId", "itemId");
