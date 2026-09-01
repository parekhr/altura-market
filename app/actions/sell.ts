"use server";

import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { getOrCreateSessionId } from "@/app/actions/session";

/**
 * Sells up to `quantity` units of one inventory row. Clamps to what's
 * actually owned, and deletes the row instead of leaving it at 0 so empty
 * inventory rows never accumulate.
 */
export async function sellItem(id: number, quantity: number) {
  const item = await prisma.inventoryItem.findUniqueOrThrow({ where: { id } });
  const sellQuantity = Math.min(quantity, item.quantity);

  if (sellQuantity >= item.quantity) {
    await prisma.inventoryItem.delete({ where: { id } });
  } else {
    await prisma.inventoryItem.update({
      where: { id },
      data: { quantity: { decrement: sellQuantity } },
    });
  }

  await prisma.transaction.create({
    data: {
      sessionId: item.sessionId,
      itemId: item.itemId,
      itemName: item.itemName,
      quantity: sellQuantity,
      imageSrc: item.imageSrc,
      pricePaid: item.sellPrice * sellQuantity,
      type: "SALE",
    },
  });

  await prisma.balance.upsert({
    where: { sessionId: item.sessionId },
    create: { sessionId: item.sessionId, money: 5000 + item.sellPrice * sellQuantity },
    update: { money: { increment: item.sellPrice * sellQuantity } },
  });
}

/**
 * Liquidates the entire inventory in one batch: one Transaction row per
 * item (sharing an `orderId` so the transactions page groups them as a
 * single sale), then credits the total sell value to the balance.
 */
export async function sellAllItems() {
  const sessionId = await getOrCreateSessionId();
  const orderId = randomUUID();

  const items = await prisma.inventoryItem.findMany({ where: { sessionId } });
  const totalValue = items.reduce((sum, item) => sum + item.sellPrice * item.quantity, 0);

  await prisma.inventoryItem.deleteMany({ where: { sessionId } });

  for (const item of items) {
    await prisma.transaction.create({
      data: {
        sessionId,
        itemId: item.itemId,
        itemName: item.itemName,
        quantity: item.quantity,
        imageSrc: item.imageSrc,
        pricePaid: item.sellPrice * item.quantity,
        type: "SALE",
        orderId,
      },
    });
  }

  await prisma.balance.upsert({
    where: { sessionId },
    create: { sessionId, money: 5000 + totalValue },
    update: { money: { increment: totalValue } },
  });

  return totalValue;
}