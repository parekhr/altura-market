"use client";

import { useCart } from "@/context/CartContext";
import { useState, useEffect } from "react";
import { useMoney } from "@/context/MoneyContext";
import { purchaseItems } from "@/app/actions/purchase";


export default function CartPage() {

  const { cartItems, removeFromCart , addToCart, decreaseQuantity } = useCart();

  const [ showConfirmModal, setShowConfirmModal] = useState(false);

  const [ showPurchaseCompleteModal, setShowPurchaseCompleteModal] = useState(false);

  const { money, subtractMoney } = useMoney();

  const totalCost = cartItems.reduce((total, item) => total + (item.purchase_price * item.quantity), 0);

  function handlePurchaseClick() {
    setShowConfirmModal(true);
  }

  // Same staggered-animation pattern as InventoryList's sell-all: cart items
  // disappear one by one (500ms apart) for visual effect before the actual
  // purchase is submitted. `subtractMoney` here is an optimistic client-side
  // update of the displayed balance — the authoritative balance is written
  // server-side inside `purchaseItems`.
  function handleConfirmPurchase() {
    setShowConfirmModal(false);
    cartItems.forEach((item, index) => {
      setTimeout(() =>
        removeFromCart(item.id), (index + 1) * 500);
    });
    setTimeout(async () => {
      setShowPurchaseCompleteModal(true);
      subtractMoney(totalCost);
      await purchaseItems(cartItems);
    }, (cartItems.length + 1) * 500);
  }

  function handleClosePurchaseComplete() {
    setShowPurchaseCompleteModal(false);
  }

  function handleCancelPurchase() {
    setShowConfirmModal(false);
  }

  function hasEnoughMoney() {
    return totalCost <= money;
  }


  return (
    <>
  <div className="flex h-screen max-w-2xl mx-auto flex-col items-center justify-center px-4">
    <div className="w-full rounded-2xl border border-gray-200 bg-white p-8 shadow-md">
      <h1 className="text-2xl font-bold">Cart</h1>
      { cartItems.length === 0 ? (
        <p className="mt-4 text-lg text-slate-700">Your cart is currently empty.</p>
        ) : (
        <>
      <p className="text-lg text-slate-700">Items in your cart: {cartItems.length}</p>
      <div className="divide-y divide-gray-300 border-y border-gray-300">
        {cartItems.map((item) => (
          <div key={item.id} className="flex items-center gap-4 py-2">
            <img src={item.imageSrc} alt={item.itemName} className="h-16 w-16 object-contain" />
            <div>
              <h3 className="text-lg font-semibold">{item.itemName.replace(/-/g, " ")}</h3>
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <span>Quantity: {item.quantity}</span>
                <button 
                  className="rounded border border-gray-300 bg-blue-200 px-1 text-xs hover:bg-gray-100 cursor-pointer"
                  onClick={() => addToCart(item)}
                  >▲</button>
                <button 
                  className="rounded border border-gray-300 bg-blue-200 px-1 text-xs hover:bg-gray-100 cursor-pointer"
                  onClick={() => decreaseQuantity(item.id)}
                  >▼</button>
              </div>
              <p className="text-sm text-gray-600">Buy Cost: {item.purchase_price}¥</p>
            </div>
            <button 
              className="ml-auto rounded-md bg-red-500 px-3 py-1 text-white hover:bg-red-600 cursor-pointer transition-colors duration-200"
              onClick={() => removeFromCart(item.id)}>
              Remove
            </button>
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between text-xl font-bold">
        <span>Total Cost:</span>
        <span>{ totalCost }¥</span>
      </div>
        <button 
          className={
            hasEnoughMoney() ? "mx-auto mt-4 block rounded-md bg-green-500 px-6 py-3 text-base font-semibold text-white hover:bg-green-600 cursor-pointer transition-colors duration-200"
                             : "mx-auto mt-4 block rounded-md bg-gray-300 px-6 py-3 text-base font-semibold text-white cursor-not-allowed"
            }
          disabled={!hasEnoughMoney()}
          onClick={() => {
            handlePurchaseClick()
          }}>
          Purchase
       </button>
        </>
      ) }
    </div>
  </div>
    {showConfirmModal && (
      <div className="fixed inset-0 flex items-center justify-center bg-black/50 px-4">
        <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
          <h2 className="text-lg font-bold">Confirm Purchase</h2>
          <p className="mt-2 text-sm text-gray-600">
            Are you sure you want to buy these items?
          </p>
          <div className="mt-4 flex justify-end gap-2">
            <button
              className="rounded-md bg-green-500 px-4 py-2 text-sm font-semibold text-white hover:bg-green-600 cursor-pointer"
              onClick={handleConfirmPurchase}>
              Confirm
            </button>
            <button
              className="rounded-md bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-300 cursor-pointer"
              onClick={handleCancelPurchase}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    )}

    {showPurchaseCompleteModal && (
      <div className="fixed inset-0 flex items-center justify-center bg-black/50 px-4">
        <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
          <h2 className="text-lg font-bold">Purchase Complete</h2>
          <p className="mt-2 text-sm text-gray-600">
            Thanks for your purchase! Your items will be in your inventory.
          </p>
          <div className="mt-4 flex justify-end">
            <button
              className="rounded-md bg-green-500 px-4 py-2 text-sm font-semibold text-white hover:bg-green-600 cursor-pointer"
              onClick={handleClosePurchaseComplete}>
              OK
            </button>
          </div>
        </div>
      </div>
    )}

    </>
  );
}