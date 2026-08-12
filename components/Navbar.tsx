"use client";

import { useMoney } from "@/context/MoneyContext";
import { useCart } from "@/context/CartContext";

import Link from "next/link";


export default function Navbar() {

  const { money } = useMoney();
  const { cartItems } = useCart();

  return (
    <nav className="flex h-16 items-stretch justify-between bg-[#70b8f0] px-6">
  <Link href="/" className="flex items-center text-lg font-bold text-sky-900">
    Altura Market
  </Link>

  <div className="flex items-stretch gap-2">
    <span className="my-auto flex items-center rounded-md border border-emerald-700 bg-emerald-100 px-2 py-2 font-bold text-emerald-800">
      Balance: {money}¥
    </span>
    <Link href="/" className="flex items-center font-bold px-4 text-slate-800 transition-colors hover:bg-sky-200 hover:text-slate-900">
      Home
    </Link>
    <Link href="/cart" className="flex items-center font-bold px-4 text-slate-800 transition-colors hover:bg-sky-200 hover:text-slate-900">
      {cartItems.length > 0 ? `Cart(${cartItems.length})` : "Cart"}
    </Link>
    <Link href="/inventory" className="flex items-center font-bold px-4 text-slate-800 transition-colors hover:bg-sky-200 hover:text-slate-900">
      Inventory
    </Link>
    <Link href="/transactions" className="flex items-center font-bold px-4 text-slate-800 transition-colors hover:bg-sky-200 hover:text-slate-900">
      Transactions
    </Link>
  </div>
</nav>
  );
}