"use server";

import { prisma } from "@/lib/prisma";
import { getOrCreateSessionId } from "@/app/actions/session";

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

    await prisma.balance.upsert({
    where: { sessionId: item.sessionId },
    create: { sessionId: item.sessionId, money: 5000 + item.sellPrice * sellQuantity },
    update: { money: { increment: item.sellPrice * sellQuantity } },
  });
}

export async function sellAllItems() {
  const sessionId = await getOrCreateSessionId();

  const items = await prisma.inventoryItem.findMany({ where: { sessionId } });
  const totalValue = items.reduce((sum, item) => sum + item.sellPrice * item.quantity, 0);

  await prisma.inventoryItem.deleteMany({ where: { sessionId } });

  await prisma.balance.upsert({
    where: { sessionId },
    create: { sessionId, money: 5000 + totalValue },
    update: { money: { increment: totalValue } },
  });

  return totalValue;
}