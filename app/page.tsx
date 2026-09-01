import { randomizeItems } from "@/app/actions/randomize";
import { addTestMoney } from "@/app/actions/addMoney";
import { prisma } from "@/lib/prisma";
import { getShopItems } from "@/lib/shopItems";
import { ensureActiveSale } from "@/app/actions/sale";
import { SALE_WORD_PLURALS } from "@/lib/saleWords";
import SaleTimer from "@/components/SaleTimer";
import ItemGrid from "@/components/ItemGrid";

export const dynamic = "force-dynamic";

// Kept in sync with the identical helper in app/actions/purchase.ts — this
// one decides what shows as "on sale" in the UI, that one decides what
// actually gets discounted at checkout, so both need the same matching rule.
function matchesSaleWord(itemName: string, word: string) {
  return itemName.toLowerCase().split("-").includes(word);
}

export default async function HomePage() {
  const items = await getShopItems();
  const sale = await ensureActiveSale();

  const saleUsages = await prisma.saleItemUsage.findMany({ where: { saleId: sale.id } });
  const usesRemainingByItemId = new Map(saleUsages.map((u) => [u.itemId, u.usesRemaining]));

  const displayItems = items.map((item) => {
    // No SaleItemUsage row means nobody has bought this item on sale yet,
    // so it still has its full allotment of 5 discounted units.
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
      <ItemGrid items={displayItems} randomizeAction={randomizeItems} addMoneyAction={addTestMoney} />
    </div>
  );
}