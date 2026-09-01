"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ItemCard from "@/components/ItemCard";
import { useSearch } from "@/context/SearchContext";

type DisplayItem = {
  id: number;
  itemName: string;
  imageSrc: string;
  text: string;
  purchase_price: number;
  sell_price: number;
  onSale: boolean;
  discountedPrice: number | undefined;
  usesRemaining: number | undefined;
};

export default function ItemGrid({
  items,
  randomizeAction,
  addMoneyAction,
}: {
  items: DisplayItem[];
  randomizeAction: () => Promise<void>;
  addMoneyAction: () => Promise<void>;
}) {
  const { search, setSearch } = useSearch();
  const [isRandomizing, setIsRandomizing] = useState(false);
  const [isAddingMoney, setIsAddingMoney] = useState(false);
  const router = useRouter();

  const filteredItems = items.filter((item) =>
    item.itemName.toLowerCase().includes(search.toLowerCase())
  );

  async function handleRandomize() {
    setIsRandomizing(true);
    await randomizeAction();
    router.refresh();
    setIsRandomizing(false);
  }

  async function handleAddMoney() {
    setIsAddingMoney(true);
    await addMoneyAction();
    router.refresh();
    setIsAddingMoney(false);
  }

  return (
    <>
      <div className="mb-4 grid grid-cols-1 items-center gap-2 sm:grid-cols-[1fr_auto_1fr]">
        <div className="flex justify-self-start gap-2">
          <button
            onClick={handleRandomize}
            disabled={isRandomizing}
            className="rounded-md bg-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer transition-colors duration-200"
          >
            {isRandomizing ? "Randomizing..." : "Randomize Items"}
          </button>
          <button
            onClick={handleAddMoney}
            disabled={isAddingMoney}
            className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer transition-colors duration-200"
          >
            {isAddingMoney ? "Adding..." : "Add 1000¥"}
          </button>
        </div>
        <div className="relative w-full sm:w-auto">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
          >
            <path
              fillRule="evenodd"
              d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
              clipRule="evenodd"
            />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search items..."
            className="w-full rounded-md border-2 border-gray-400 bg-white py-2 pl-9 pr-3 text-sm sm:w-auto"
          />
        </div>
        <div className="hidden sm:block" />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
        {filteredItems.map((item) => (
          <ItemCard
            key={item.id}
            id={item.id}
            itemName={item.itemName}
            imageSrc={item.imageSrc}
            text={item.text}
            purchase_price={item.purchase_price}
            sell_price={item.sell_price}
            onSale={item.onSale}
            discountedPrice={item.discountedPrice}
            usesRemaining={item.usesRemaining}
          />
        ))}
      </div>
    </>
  );
}
