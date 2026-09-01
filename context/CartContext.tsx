"use client";

import { createContext, useContext, useEffect, useState } from "react";

type CartContextType = {
    cartItems: any[];
    addToCart: (item: any) => void;
    removeFromCart: (itemId: number) => void;
    clearCart: () => void;
    decreaseQuantity: (itemId: number) => void;
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
}

export const CartContext = createContext<CartContextType>({
    cartItems: [],
    addToCart: (item: any) => {},
    removeFromCart: (itemId: number) => {},
    clearCart: () => {},
    decreaseQuantity: (itemId: number) => {}
});

export default function CartProvider({ children }: { children: React.ReactNode }) {
    const [cartItems, setCartItems] = useState<any[]>([]);

    const [toastMessage, setToastMessage] = useState<{ imageSrc: string; text: string} | null>(null);

    useEffect(() => {
        if(toastMessage){
            const timeoutId = setTimeout(() => setToastMessage(null), 2000);
            return () => clearTimeout(timeoutId);
        }
    }, [toastMessage]);

    // Adding an item already in the cart bumps its quantity instead of
    // pushing a duplicate row, so the cart list always has at most one entry
    // per item id.
    function addToCart(item: any) {
        if (!cartItems.some((cartItem) => cartItem.id === item.id)) {
            setCartItems((prevItems) => [...prevItems, { ...item, quantity: 1 }]);
            console.log("here in addToCart");
            setToastMessage({ imageSrc: item.imageSrc, text: `Added ${item.itemName} to the cart` });
        }
        else{
            setCartItems((prevItems) => prevItems.map(cartItem => cartItem.id === item.id ? { ...cartItem, quantity: (cartItem.quantity || 1) + 1 } : cartItem));
        }
    }

    function removeFromCart(itemId: number) {
        setCartItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
    }
    
    function clearCart() {
        setCartItems([]);
    }

    function decreaseQuantity(itemId: number) {
        setCartItems((prevItems) =>
        prevItems
            .map(item => item.id === itemId ? { ...item, quantity: item.quantity - 1 } : item)
            .filter(item => item.quantity > 0)
    );
}

    return (
        <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart, decreaseQuantity }}>
            {children}
            {toastMessage && (
                <div className="fixed bottom-4 right-4 flex items-center gap-2 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white shadow-lg">
                    <img src={toastMessage.imageSrc} className="h-6 w-6 object-contain" />
                    <span>{toastMessage.text.replace(/-/g, " ")}</span>
                </div>
            )}
        </CartContext.Provider>
    );
}