export default function ItemCard(props: { itemName: string; imageSrc: string; text: string; purchase_price: number; sell_price: number }) {

    const notForSale = props.purchase_price === 0 && props.sell_price === 0;

    return (
        <div className="flex h-full flex-col items-center rounded-lg border border-black p-3 shadow-lg bg-[oklch(93.2%_0.072_255.585)]">
        <img src={props.imageSrc} alt={props.itemName} className="h-16 w-16 object-contain" />
        <h3 className="mt-1 text-center text-sm font-semibold capitalize text-slate-900">
            {props.itemName.replace(/-/g, " ")}
        </h3>
        <p className="mt-1 line-clamp-2 text-center text-xs text-gray-600" title={props.text}>
            {props.text}
        </p>

        {/* pushes everything below it to the bottom of the card */}
        <div className="mt-auto flex w-full flex-col items-center pt-2">
            <div className="flex gap-2 text-xs">
            <span className="font-bold rounded-lg border border-black bg-[oklch(96.2%_0.044_156.743)] p-2">Buy: {props.purchase_price}¥</span>
            <span className="font-bold rounded-lg border border-black bg-[oklch(93.6%_0.032_17.717)] p-2">Sell: {props.sell_price}¥</span>
            </div>
            <button
                disabled={notForSale}
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