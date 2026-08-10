import Navbar from "@/components/Navbar";
import "./globals.css";
import MoneyProvider from "@/context/MoneyContext";

export const metadata = {
  title: "My App",
  description: "My app description",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
        <body className="bg-[oklch(95.1%_0.026_236.824)]">
          <MoneyProvider>
            <Navbar />
            {children}
          </MoneyProvider>
        </body>
    </html>
  );
}