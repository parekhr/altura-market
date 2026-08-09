export default function ItemCard(props: { itemName: string; imageSrc: string; text: string; purchase_price: number; sell_price: number }) {
  return (
    <div className="flex h-full flex-col items-center rounded-lg border border-gray-200 p-3 shadow-sm">
      <img src={props.imageSrc} alt={props.itemName} className="h-16 w-16 object-contain" />
      <h3 className="mt-1 text-center text-sm font-semibold capitalize text-sky-900">
        {props.itemName.replace(/-/g, " ")}
      </h3>
      <p className="mt-1 line-clamp-2 text-center text-xs text-gray-600">{props.text}</p>

      {/* pushes everything below it to the bottom of the card */}
      <div className="mt-auto flex w-full flex-col items-center pt-2">
        <div className="flex gap-2 text-xs">
          <span className="font-bold text-green-600">Buy: {props.purchase_price}</span>
          <span className="font-semibold text-red-600">Sell: {props.sell_price}</span>
        </div>
        <button className="mt-2 rounded-md bg-indigo-500 px-3 py-1 text-xs font-semibold text-white hover:bg-indigo-600">
          Add to Cart
        </button>
      </div>
    </div>
  );
}