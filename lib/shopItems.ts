import { prisma } from "@/lib/prisma";

const CATALOG_ID = 1;

type StoredShopItem = {
  itemId: number;
  itemName: string;
  imageSrc: string;
  text: string;
  purchasePrice: number;
  sellPrice: number;
};

async function getItem(id: number) {
  try {
    const res = await fetch(`https://pokeapi.co/api/v2/item/${id}`);
    if (!res.ok) return null; // Return null for failed requests
    return res.json();
  } catch {
    // fetch() itself can reject on network errors/timeouts, not just return
    // a bad status — treat that the same as a failed request rather than
    // letting it crash the whole batch.
    return null;
  }
}

function getRandomUniqueIds(count: number, maxId: number) {
  const allIds = Array.from({ length: maxId }, (_, i) => i + 1); // [1, 2, ..., maxId]

  // Fisher-Yates shuffle
  for (let i = allIds.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allIds[i], allIds[j]] = [allIds[j], allIds[i]];
  }

  return allIds.slice(0, count);
}

function getRandomPrice(min: number, max: number) {
  const steps = (max - min) / 50;
  const randomStep = Math.floor(Math.random() * (steps + 1));
  return min + randomStep * 50;
}

// Fetches a fresh random catalog from PokeAPI and writes it to Postgres as a
// single row (id=1). Storing the whole catalog as one JSON row instead of
// many individual rows means "regenerate" is one upsert — Postgres serializes
// concurrent writes to the same row, so there's no window where two
// regenerations can interleave and leave duplicate/combined data behind,
// unlike a delete-then-insert-many-rows approach.
export async function regenerateShopItems() {
  console.log("[regenerateShopItems] starting");
  const itemIds = getRandomUniqueIds(104, 500); // Get 104 unique IDs from 1 to 500

  // Fetch in batches instead of all 104 at once — a single burst this size
  // risks PokeAPI throttling/timing out under production network conditions.
  const batchSize = 20;
  const results = [];
  for (let i = 0; i < itemIds.length; i += batchSize) {
    const batch = itemIds.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map((id) => getItem(id)));
    results.push(...batchResults);
  }
  const items = results.filter(Boolean);
  console.log(`[regenerateShopItems] fetched ${items.length}/${itemIds.length} items from PokeAPI`);

  const shopItems: StoredShopItem[] = items.map((item) => {
    const englishEntry = item.flavor_text_entries?.find(
      (e: any) => e.language.name === "en"
    );

    const purchasePrice = getRandomPrice(100, 1000);
    const sellPrice = getRandomPrice(50, purchasePrice - 50); // Ensure sell price is less than purchase price

    return {
      itemId: item.id,
      itemName: item.name.toUpperCase(),
      imageSrc: item.sprites.default,
      text: englishEntry?.text ?? "No description available",
      purchasePrice,
      sellPrice,
    };
  });

  try {
    await prisma.shopCatalog.upsert({
      where: { id: CATALOG_ID },
      create: { id: CATALOG_ID, items: shopItems },
      update: { items: shopItems },
    });
    console.log(`[regenerateShopItems] upsert succeeded, first item: ${shopItems[0]?.itemName}`);
  } catch (err) {
    console.error("[regenerateShopItems] upsert FAILED:", err);
    throw err;
  }
}

export async function getShopItems() {
  let catalog = await prisma.shopCatalog.findUnique({ where: { id: CATALOG_ID } });

  // First-ever load: no catalog row yet, so seed it once.
  if (!catalog) {
    await regenerateShopItems();
    catalog = await prisma.shopCatalog.findUnique({ where: { id: CATALOG_ID } });
  }

  const items = catalog!.items as unknown as StoredShopItem[];

  return items.map((item) => ({
    id: item.itemId,
    itemName: item.itemName,
    imageSrc: item.imageSrc,
    text: item.text,
    purchase_price: item.purchasePrice,
    sell_price: item.sellPrice,
  }));
}
