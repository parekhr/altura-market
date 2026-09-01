import Navbar from "@/components/Navbar";
import "./globals.css";
import MoneyProvider from "@/context/MoneyContext";
import CartProvider from "@/context/CartContext";
import SearchProvider from "@/context/SearchContext";
import { Footer } from "./footer";
import { getBalance } from "@/app/actions/session";

export const metadata = {
  title: "Altura Market",
  description: "A market to buy and sell Pokemon items",
  appleWebApp: {
    title: "Altura Market",
    statusBarStyle: "default",
  },
};

export const viewport = {
  themeColor: "#70b8f0",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const money = await getBalance();

  return (
    <html lang="en">
        <body className="bg-[oklch(95.1%_0.026_236.824)]">
          <CartProvider>
            <MoneyProvider initialMoney={money}>
              <SearchProvider>
                <Navbar />
                  {children}
                  <Footer/>
              </SearchProvider>
            </MoneyProvider>
          </CartProvider>
        </body>
    </html>
  );
}