"use server";

import { regenerateShopItems } from "@/lib/shopItems";

export async function randomizeItems() {
  try {
    await regenerateShopItems();
  } catch (err) {
    console.error("[randomizeItems] failed:", err);
    throw err;
  }
}