"use client";

import { createContext, useContext, useState } from "react";

export const MoneyContext = createContext({ money: 1000, addMoney: (amount: number) => {}, subtractMoney: (amount: number) => {} });

export function useMoney() {
  const context = useContext(MoneyContext);
  if (!context) {
    throw new Error("useMoney must be used within a MoneyProvider");
  }
  return context;
}

export default function MoneyProvider( {children}: { children: React.ReactNode }) {
 const [money, setMoney] = useState(1000);

 function addMoney(amount: number) {
     setMoney((prevMoney) => prevMoney + amount);
 }

 function subtractMoney(amount: number) {
   setMoney((prevMoney) => prevMoney - amount);
 }

 return(
   <MoneyContext.Provider value={{ money, addMoney, subtractMoney }}>
     {children}
   </MoneyContext.Provider>
 );
}