"use server";

import { revalidateTag } from "next/cache";

export async function randomizeItems() {
  revalidateTag("shop-items");
}