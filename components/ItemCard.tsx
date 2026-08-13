"use client";

import { useCart } from "@/context/CartContext";

export default function ItemCard(props: { id: number; itemName: string; imageSrc: string; text: string; purchase_price: number; sell_price: number }) {

    const notForSale = props.purchase_price === 0 && props.sell_price === 0;

    const { addToCart } = useCart();

    function handleAddToCart() {
        addToCart({
            id: props.id,
            itemName: props.itemName,
            imageSrc: props.imageSrc,
            text: props.text,
            purchase_price: props.purchase_price,
            sell_price: props.sell_price,
        });
        console.log(`Added ${props.itemName} to cart`);
    }

    return (
        <div className="flex h-full flex-col items-center rounded-lg border border-black p-3 shadow-lg bg-[oklch(93.2%_0.072_255.585)]">
    <div className="flex w-full flex-col items-end gap-1 text-[10px]">
    <span className="rounded-full border border-black bg-[oklch(96.2%_0.044_156.743)] px-2 py-0.5 font-bold">Buy: {props.purchase_price}¥</span>
    <span className="rounded-full border border-black bg-[oklch(93.6%_0.032_17.717)] px-2 py-0.5 font-bold">Sell: {props.sell_price}¥</span>
</div>
    <img src={props.imageSrc} alt={props.itemName} className="h-16 w-16 object-contain" />
    <h3 className="mt-1 text-center text-sm font-semibold capitalize text-slate-900">
        {props.itemName.replace(/-/g, " ")}
    </h3>
    <p className="mt-1 line-clamp-2 text-center text-xs text-gray-600" title={props.text}>
        {props.text}
    </p>

    {/* pushes the button to the bottom of the card */}
    <div className="mt-auto flex w-full flex-col items-center pt-2">
            <button
                disabled={notForSale}
                onClick={handleAddToCart}
                className={
                    notForSale
                    ? "mt-2 cursor-not-allowed rounded-md bg-gray-300 px-3 py-1 text-xs font-semibold text-gray-500"
                    : "mt-2 rounded-md bg-indigo-500 px-3 py-1 text-xs font-semibold text-white hover:bg-indigo-600 cursor-pointer transition-colors duration-200"
                }>
                {notForSale ? "Unavailable" : "Add to Cart"}
            </button>
        </div>
    </div>
    );
}