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

// Item names are stored as hyphenated slugs (e.g. "GREAT-BALL"), and a sale
// targets one whole word (e.g. "ball"). Splitting on "-" and checking for an
// exact word match avoids false positives a plain substring check would hit
// (e.g. "orb" sale wrongly matching "absorb-bulb").
function matchesSaleWord(itemName: string, word: string) {
  return itemName.toLowerCase().split("-").includes(word);
}

/**
 * Buys a batch of items in one order: applies the active sale discount
 * per item (if eligible), records inventory + a transaction row per item
 * under a shared `orderId`, then debits the total from the balance.
 */
export async function purchaseItems(items: PurchasedItem[]) {
  const sessionId = await getOrCreateSessionId();
  const orderId = randomUUID();
  const sale = await prisma.sale.findFirst();
  const saleActive = sale ? sale.expiresAt > new Date() : false;

  let totalCost = 0;

  for (const item of items) {
    let unitPrice = item.purchase_price;

    if (sale && saleActive && matchesSaleWord(item.itemName, sale.word)) {
      // usesRemaining tracks how many discounted units are left for this
      // item under the current sale. No row yet means nobody has bought it
      // on sale before, so it starts at the full allotment of 5.
      const usage = await prisma.saleItemUsage.findUnique({
        where: { saleId_itemId: { saleId: sale.id, itemId: item.id } },
      });
      const usesRemaining = usage ? usage.usesRemaining : 5;

      // Only discount if there's enough remaining allotment to cover the
      // whole quantity being bought — no partial-discount splitting.
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

  // No Balance row yet means this session never had one created (getBalance
  // defaults to 5000 without writing a row), so the starting balance has to
  // be re-derived here rather than just decrementing from a row that isn't there.
  await prisma.balance.upsert({
    where: { sessionId },
    create: { sessionId, money: 5000 - totalCost },
    update: { money: { decrement: totalCost } },
  });
}
