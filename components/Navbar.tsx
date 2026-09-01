"use client";

import { useState } from "react";
import { useMoney } from "@/context/MoneyContext";
import { useCart } from "@/context/CartContext";
import { useSearch } from "@/context/SearchContext";

import Link from "next/link";

const linkClass =
  "flex items-center rounded-md font-bold px-2 py-2 sm:px-4 text-white transition-colors hover:bg-sky-200 hover:text-slate-500";

export default function Navbar() {

  const { money } = useMoney();
  const { cartItems } = useCart();
  const { setSearch } = useSearch();
  const [menuOpen, setMenuOpen] = useState(false);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <nav className="bg-[#70b8f0] px-3 py-2 sm:px-6">
  <div className="flex min-h-12 items-center justify-between">
    <Link href="/" onClick={() => { setSearch(""); closeMenu(); }} className="flex items-center text-lg font-bold text-white">
      Altura Market
    </Link>

    <div className="flex items-center gap-2">
      <span className="flex items-center rounded-md border border-emerald-700 bg-emerald-500 px-2 py-2 font-bold text-white">
        Balance: {money}¥
      </span>

      {/* Full nav links, shown from sm breakpoint up */}
      <div className="hidden items-stretch gap-2 sm:flex">
        <Link href="/" onClick={() => setSearch("")} className={linkClass}>
          Home
        </Link>
        <Link href="/cart" className={linkClass}>
          {cartItems.length > 0 ? `Cart(${cartItems.length})` : "Cart"}
        </Link>
        <Link href="/inventory" className={linkClass}>
          Inventory
        </Link>
        <Link href="/transactions" className={linkClass}>
          Transactions
        </Link>
      </div>

      {/* Hamburger toggle, shown below sm breakpoint */}
      <button
        onClick={() => setMenuOpen((open) => !open)}
        aria-label={menuOpen ? "Close menu" : "Open menu"}
        aria-expanded={menuOpen}
        className="flex items-center justify-center rounded-md p-2 text-white transition-colors hover:bg-sky-200 hover:text-slate-900 sm:hidden"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="h-6 w-6">
          {menuOpen ? (
            <path d="M6 6l12 12M18 6L6 18" />
          ) : (
            <path d="M4 7h16M4 12h16M4 17h16" />
          )}
        </svg>
      </button>
    </div>
  </div>

  {/* Mobile dropdown with the nav links, only rendered below sm breakpoint */}
  {menuOpen && (
    <div className="mt-2 flex flex-col gap-1 pb-1 sm:hidden">
      <Link href="/" onClick={() => { setSearch(""); closeMenu(); }} className={linkClass}>
        Home
      </Link>
      <Link href="/cart" onClick={closeMenu} className={linkClass}>
        {cartItems.length > 0 ? `Cart(${cartItems.length})` : "Cart"}
      </Link>
      <Link href="/inventory" onClick={closeMenu} className={linkClass}>
        Inventory
      </Link>
      <Link href="/transactions" onClick={closeMenu} className={linkClass}>
        Transactions
      </Link>
    </div>
  )}
</nav>
  );
}