"use client";

import { createContext, useContext, useState } from "react";

type CartContextType = {
    cartItems: any[];
    addToCart: (item: any) => void;
    removeFromCart: (itemId: number) => void;
    clearCart: () => void;
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
});

export default function CartProvider({ children }: { children: React.ReactNode }) {
    const [cartItems, setCartItems] = useState<any[]>([]);

    function addToCart(item: any) {
        if (!cartItems.some((cartItem) => cartItem.id === item.id)) {
            setCartItems((prevItems) => [...prevItems, { ...item, quantity: 1 }]);
            console.log("here in addToCart");
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

    return (
        <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart }}>
            {children}
        </CartContext.Provider>
    );
}