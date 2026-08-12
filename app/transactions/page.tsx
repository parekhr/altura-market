"use client";

import { useCart } from "@/context/CartContext";

export default function TransactionsPage(){

    const { cartItems } = useCart();

    return(
        <div className="flex h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold text-slate-900">Transactions</h1>
      <p className="text-lg text-slate-700">You currently have no transactions.</p>
    </div>
    );
}