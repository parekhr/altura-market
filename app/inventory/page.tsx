export default async function InventoryPage() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold text-slate-900">Inventory</h1>
      <p className="text-lg text-slate-700">Your inventory is currently empty.</p>
    </div>
  );
}