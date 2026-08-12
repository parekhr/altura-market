"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMoney } from "@/context/MoneyContext";
import { sellItem, sellAllItems } from "@/app/actions/sell";
import { useEffect } from "react";

type InventoryItem = {
  id: number;
  itemName: string;
  imageSrc: string;
  sellPrice: number;
  quantity: number;
};

export default function InventoryList({ inventoryItems }: { inventoryItems: InventoryItem[] }) {
  const [sellingItem, setSellingItem] = useState<InventoryItem | null>(null);
  const [sellQuantity, setSellQuantity] = useState(1);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSellAllModal, setShowSellAllModal] = useState(false);

  const [visibleItems, setVisibleItems] = useState(inventoryItems);
  const [showSellAllCompleteModal, setShowSellAllCompleteModal] = useState(false);

useEffect(() => {
  setVisibleItems(inventoryItems);
}, [inventoryItems]);

  const { addMoney } = useMoney();
  const router = useRouter();

  const totalSellValue = inventoryItems.reduce((sum, item) => sum + item.sellPrice * item.quantity, 0);

  function handleSellClick(item: InventoryItem) {
    setSellingItem(item);
    setSellQuantity(1);
  }

  function handleCancel() {
    setSellingItem(null);
    setShowConfirmModal(false);
  }

  async function handleConfirmSell() {
    if (!sellingItem) return;
    await sellItem(sellingItem.id, sellQuantity);
    addMoney(sellingItem.sellPrice * sellQuantity);
    setSellingItem(null);
    setShowConfirmModal(false);
    router.refresh();
  }

  function handleConfirmSellAll() {
    setShowSellAllModal(false);

    inventoryItems.forEach((item, index) => {
        setTimeout(() => {
        setVisibleItems((prev) => prev.filter((i) => i.id !== item.id));
        }, (index + 1) * 500);
    });

    setTimeout(async () => {
        const total = await sellAllItems();
        addMoney(total);
        setShowSellAllCompleteModal(true);
        router.refresh();
    }, (inventoryItems.length + 1) * 500);
  }

  return (
    <>
      {visibleItems.length === 0 ? (
        <p className="mt-4 text-lg text-slate-700">Your inventory is currently empty.</p>
      ) : (
        <>
          <div className="mt-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Items</h2>
            <button
              onClick={() => setShowSellAllModal(true)}
              className="rounded-md bg-red-500 px-3 py-1 text-sm font-semibold text-white hover:bg-red-600 cursor-pointer transition-colors duration-200"
            >
              Sell All
            </button>
          </div>

          <div className="mt-2 divide-y divide-gray-300 border-y border-gray-300">
            {visibleItems.map(item => (
              <div key={item.id} className="flex items-center gap-4 py-2">
                <img src={item.imageSrc} alt={item.itemName} className="h-8 w-8 object-contain" />
                <span className="flex-1 text-base text-slate-700">
                  {item.itemName.replace(/-/g, " ")} <span className="text-gray-500">x{item.quantity}</span>
                </span>
                <button
                  onClick={() => handleSellClick(item)}
                  className="rounded-md bg-red-500 px-3 py-1 text-sm text-white hover:bg-red-600 cursor-pointer transition-colors duration-200"
                >
                  Sell
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {sellingItem && !showConfirmModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-bold">Sell {sellingItem.itemName.replace(/-/g, " ")}</h2>
            <p className="mt-2 text-sm text-gray-600">How many would you like to sell?</p>
            <input
              type="number"
              min={1}
              max={sellingItem.quantity}
              value={sellQuantity}
              onChange={(e) => setSellQuantity(Number(e.target.value))}
              className="mt-2 w-full rounded border border-gray-300 px-2 py-1"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                className="rounded-md bg-green-500 px-4 py-2 text-sm font-semibold text-white hover:bg-green-600 cursor-pointer"
                onClick={() => setShowConfirmModal(true)}>
                Continue
              </button>
              <button
                className="rounded-md bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-300 cursor-pointer"
                onClick={handleCancel}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {sellingItem && showConfirmModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-bold">Confirm sale</h2>
            <p className="mt-2 text-sm text-gray-600">
              Sell {sellQuantity} {sellingItem.itemName.replace(/-/g, " ")} for {sellingItem.sellPrice * sellQuantity}¥?
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                className="rounded-md bg-green-500 px-4 py-2 text-sm font-semibold text-white hover:bg-green-600 cursor-pointer"
                onClick={handleConfirmSell}>
                Confirm
              </button>
              <button
                className="rounded-md bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-300 cursor-pointer"
                onClick={handleCancel}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showSellAllModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-bold">Sell all items</h2>
            <p className="mt-2 text-sm text-gray-600">
              Sell everything in your inventory for {totalSellValue}¥?
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                className="rounded-md bg-green-500 px-4 py-2 text-sm font-semibold text-white hover:bg-green-600 cursor-pointer"
                onClick={handleConfirmSellAll}>
                Confirm
              </button>
              <button
                className="rounded-md bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-300 cursor-pointer"
                onClick={() => setShowSellAllModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {showSellAllCompleteModal && (
  <div className="fixed inset-0 flex items-center justify-center bg-black/50 px-4">
    <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
      <h2 className="text-lg font-bold">Sale complete</h2>
      <p className="mt-2 text-sm text-gray-600">
        All items sold. Your balance has been updated.
      </p>
      <div className="mt-4 flex justify-end">
        <button
          className="rounded-md bg-green-500 px-4 py-2 text-sm font-semibold text-white hover:bg-green-600 cursor-pointer"
          onClick={() => setShowSellAllCompleteModal(false)}>
          OK
        </button>
      </div>
    </div>
  </div>
)}
    </>
  );
}