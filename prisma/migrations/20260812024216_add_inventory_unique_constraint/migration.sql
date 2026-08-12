/*
  Warnings:

  - A unique constraint covering the columns `[sessionId,itemId]` on the table `InventoryItem` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "InventoryItem_sessionId_itemId_key" ON "InventoryItem"("sessionId", "itemId");
