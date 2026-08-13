"use server";

import { prisma } from "@/lib/prisma";
import { SALE_WORDS } from "@/lib/saleWords";

const SALE_DURATION_MS = 5 * 60 * 1000;

export async function ensureActiveSale() {
  const existing = await prisma.sale.findFirst();

  if (existing && existing.expiresAt > new Date()) {
    return existing;
  }

  if (existing) {
    await prisma.saleItemUsage.deleteMany({ where: { saleId: existing.id } });
    await prisma.sale.delete({ where: { id: existing.id } });
  }

  const word = SALE_WORDS[Math.floor(Math.random() * SALE_WORDS.length)];

  return prisma.sale.create({
    data: {
      word,
      discountPercent: 30,
      expiresAt: new Date(Date.now() + SALE_DURATION_MS),
    },
  });
}