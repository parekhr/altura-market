import { unstable_cache } from "next/cache";
import ItemCard from "@/components/ItemCard";
import { randomizeItems } from "@/app/actions/randomize";

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

export default async function HomePage() {
  const items = await getShopItems();

  return (
    <div className="p-8">
      <form action={randomizeItems} className="mb-4">
        <button
          type="submit"
          className="rounded-md bg-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-600 cursor-pointer transition-colors duration-200"
        >
          Randomize Items
        </button>
      </form>
      <div className="grid grid-cols-4 gap-3 sm:grid-cols-6 md:grid-cols-8">
        {items.map((item) => (
          <ItemCard
            key={item.id}
            id={item.id}
            itemName={item.itemName}
            imageSrc={item.imageSrc}
            text={item.text}
            purchase_price={item.purchase_price}
            sell_price={item.sell_price}
          />
        ))}
      </div>
    </div>
  );
}