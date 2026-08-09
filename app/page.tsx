import ItemCard from "@/components/ItemCard";


async function getItem(id: number) {
  const res = await fetch(`https://pokeapi.co/api/v2/item/${id}`);
  if (!res.ok) throw new Error(`Failed to fetch item ${id}`);
  return res.json();
}

export default async function HomePage() {
  const itemIds = [1, 2, 3, 4, 5, 6, 7, 8];

  const results = await Promise.all(itemIds.map((id) => getItem(id)));
  const items = results.filter(Boolean);
  return (
    <div className="grid grid-cols-4 gap-3 p-8 sm:grid-cols-6 md:grid-cols-8">
      {items.map((item) => {
        const englishEntry = item.flavor_text_entries?.find(
          (e: any) => e.language.name === "en"
        );

        return (
          <ItemCard
            key={item.id}
            itemName={item.name}
            imageSrc={item.sprites.default}
            text={englishEntry?.text ?? "No description available"}
            purchase_price={item.cost}
            sell_price={item.cost / 2}
          />
        );
      })}
    </div>
  );
}

