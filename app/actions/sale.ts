"use server";

import { prisma } from "@/lib/prisma";
import { SALE_WORDS } from "@/lib/saleWords";

const SALE_DURATION_MS = 5 * 60 * 1000;

/**
 * Returns the currently-active sale, creating a new one if none exists or
 * the last one expired. There's only ever a single global Sale row (not
 * per-session) — the whole shop shares one timed sale at a time.
 */
export async function ensureActiveSale() {
  const existing = await prisma.sale.findFirst();

  if (existing && existing.expiresAt > new Date()) {
    return existing;
  }

  // Expired sale: clear out its per-item usage counters along with it so a
  // future sale that happens to reuse the same word starts with a fresh
  // allotment instead of inheriting a used-up one.
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