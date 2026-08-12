"use server";

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

export async function purchaseItems(items: PurchasedItem[]) {
  const sessionId = await getOrCreateSessionId();
  const totalCost = items.reduce((sum, item) => sum + item.purchase_price * item.quantity, 0);

  for (const item of items) {
    await prisma.inventoryItem.upsert({
      where: { sessionId_itemId: { sessionId, itemId: item.id } },
      update: { quantity: { increment: item.quantity } },
      create: {
        sessionId,
        itemId: item.id,
        itemName: item.itemName,
        imageSrc: item.imageSrc,
        purchasePrice: item.purchase_price,
        sellPrice: item.sell_price,
        quantity: item.quantity,
      },
    });

    await prisma.transaction.create({
      data: {
        sessionId,
        itemId: item.id,
        itemName: item.itemName,
        quantity: item.quantity,
        pricePaid: item.purchase_price * item.quantity,
      },
    });
  }

    await prisma.balance.upsert({
    where: { sessionId },
    create: { sessionId, money: 5000 - totalCost },
    update: { money: { decrement: totalCost } },
  });
}