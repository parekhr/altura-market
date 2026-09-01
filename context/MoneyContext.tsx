"use client";

import { createContext, useContext, useEffect, useState } from "react";

export const MoneyContext = createContext({ money: 5000, addMoney: (amount: number) => {}, subtractMoney: (amount: number) => {} });

export function useMoney() {
  const context = useContext(MoneyContext);
  if (!context) {
    throw new Error("useMoney must be used within a MoneyProvider");
  }
  return context;
}

export default function MoneyProvider({ children, initialMoney }: { children: React.ReactNode; initialMoney: number }) {
  const [money, setMoney] = useState(initialMoney);

  // initialMoney comes from the server (layout.tsx re-fetches it on every
  // navigation/router.refresh()). Without this effect, the client state set
  // on first mount would never pick up a server-side balance change made
  // after that — e.g. from a server action running on another page.
  useEffect(() => {
    setMoney(initialMoney);
  }, [initialMoney]);

  function addMoney(amount: number) {
    setMoney((prevMoney) => prevMoney + amount);
  }

  function subtractMoney(amount: number) {
    setMoney((prevMoney) => prevMoney - amount);
  }

  return (
    <MoneyContext.Provider value={{ money, addMoney, subtractMoney }}>
      {children}
    </MoneyContext.Provider>
  );
}