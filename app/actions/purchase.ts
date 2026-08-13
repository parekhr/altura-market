"use server";

import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { getOrCreateSessionId } from "@/app/actions/session";

type PurchasedItem = {
  id: number;
  itemName: string;
  imageSrc: string;
  purchase_price: number;
  sell_price: number;
  quantity: number;
};

function matchesSaleWord(itemName: string, word: string) {
  return itemName.toLowerCase().split("-").includes(word);
}

export async function purchaseItems(items: PurchasedItem[]) {
  const sessionId = await getOrCreateSessionId();
  const orderId = randomUUID();
  const sale = await prisma.sale.findFirst();
  const saleActive = sale ? sale.expiresAt > new Date() : false;

  let totalCost = 0;

  for (const item of items) {
    let unitPrice = item.purchase_price;

    if (sale && saleActive && matchesSaleWord(item.itemName, sale.word)) {
      const usage = await prisma.saleItemUsage.findUnique({
        where: { saleId_itemId: { saleId: sale.id, itemId: item.id } },
      });
      const usesRemaining = usage ? usage.usesRemaining : 5;

      if (usesRemaining >= item.quantity) {
        unitPrice = Math.round(item.purchase_price * (1 - sale.discountPercent / 100));

        await prisma.saleItemUsage.upsert({
          where: { saleId_itemId: { saleId: sale.id, itemId: item.id } },
          create: { saleId: sale.id, itemId: item.id, usesRemaining: 5 - item.quantity },
          update: { usesRemaining: { decrement: item.quantity } },
        });
      }
    }

    totalCost += unitPrice * item.quantity;

    await prisma.inventoryItem.upsert({
      where: { sessionId_itemId: { sessionId, itemId: item.id } },
      update: { quantity: { increment: item.quantity } },
      create: {
        sessionId,
        itemId: item.id,
        itemName: item.itemName,
        imageSrc: item.imageSrc,
        purchasePrice: unitPrice,
        sellPrice: item.sell_price,
        quantity: item.quantity,
      },
    });

    await prisma.transaction.create({
      data: {
        sessionId,
        itemId: item.id,
        itemName: item.itemName,
        imageSrc: item.imageSrc,
        quantity: item.quantity,
        pricePaid: unitPrice * item.quantity,
        type: "PURCHASE",
        orderId,
      },
    });
  }

  await prisma.balance.upsert({
    where: { sessionId },
    create: { sessionId, money: 5000 - totalCost },
    update: { money: { decrement: totalCost } },
  });
}
