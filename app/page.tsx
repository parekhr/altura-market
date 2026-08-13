import { unstable_cache } from "next/cache";
import { randomizeItems } from "@/app/actions/randomize";
import { prisma } from "@/lib/prisma";
import { ensureActiveSale } from "@/app/actions/sale";
import { SALE_WORD_PLURALS } from "@/lib/saleWords";
import SaleTimer from "@/components/SaleTimer";
import ItemGrid from "@/components/ItemGrid";

export const dynamic = "force-dynamic";

async function getItem(id: number) {
  const res = await fetch(`https://pokeapi.co/api/v2/item/${id}`);
  if (!res.ok) return null; // Return null for failed requests
  return res.json();
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

const getShopItems = unstable_cache(
  async () => {
    const itemIds = getRandomUniqueIds(104, 500); // Get 104 unique IDs from 1 to 500

    const results = await Promise.all(itemIds.map((id) => getItem(id)));
    const items = results.filter(Boolean);

    return items.map((item) => {
      const englishEntry = item.flavor_text_entries?.find(
        (e: any) => e.language.name === "en"
      );

      const purchasePrice = getRandomPrice(100, 1000);
      const sellPrice = getRandomPrice(50, purchasePrice - 50); // Ensure sell price is less than purchase price

      return {
        id: item.id,
        itemName: item.name.toUpperCase(),
        imageSrc: item.sprites.default,
        text: englishEntry?.text ?? "No description available",
        purchase_price: purchasePrice,
        sell_price: sellPrice,
      };
    });
  },
  ["shop-items"], // cache key
  { revalidate: false , tags: ["shop-items"] } // cache forever, adjust as needed
);

function matchesSaleWord(itemName: string, word: string) {
  return itemName.toLowerCase().split("-").includes(word);
}

export default async function HomePage() {
  const items = await getShopItems();
  const sale = await ensureActiveSale();

  const saleUsages = await prisma.saleItemUsage.findMany({ where: { saleId: sale.id } });
  const usesRemainingByItemId = new Map(saleUsages.map((u) => [u.itemId, u.usesRemaining]));

  const displayItems = items.map((item) => {
    const usesRemaining = usesRemainingByItemId.get(item.id) ?? 5;
    const onSale = matchesSaleWord(item.itemName, sale.word) && usesRemaining > 0;
    const discountedPrice = onSale
      ? Math.round(item.purchase_price * (1 - sale.discountPercent / 100))
      : undefined;

    return {
      ...item,
      onSale,
      discountedPrice,
      usesRemaining: onSale ? usesRemaining : undefined,
    };
  });

  return (
    <div className="p-8">
      <SaleTimer expiresAt={sale.expiresAt.getTime()} />
      <div className="mb-4 rounded-md border border-red-300 bg-red-50 px-4 py-2 text-sm font-bold text-red-800 text-center">
        🔥 {sale.discountPercent}% OFF SALE FOR {SALE_WORD_PLURALS[sale.word].toUpperCase()}! 🔥
      </div>
      <ItemGrid items={displayItems} randomizeAction={randomizeItems} />
    </div>
  );
}