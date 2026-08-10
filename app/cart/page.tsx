export default async function CartPage() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold text-slate-900">Cart</h1>
      <p className="text-lg text-slate-700">Your cart is currently empty.</p>
    </div>
  );
}