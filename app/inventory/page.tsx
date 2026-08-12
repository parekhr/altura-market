import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import InventoryList from '@/components/InventoryList';

export default async function InventoryPage() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('sessionId')?.value;

  const inventoryItems = sessionId
    ? await prisma.inventoryItem.findMany({ where: { sessionId } })
    : [];

  const itemsOwned = inventoryItems.reduce((sum, item) => sum + item.quantity, 0);
  const sellValue = inventoryItems.reduce((sum, item) => sum + item.sellPrice * item.quantity, 0);

  return (
    <div className="flex min-h-screen max-w-2xl mx-auto flex-col justify-center px-4">
      <div className="w-full rounded-2xl border border-gray-200 bg-white p-8 shadow-md">
        <h1 className="text-2xl font-bold">Inventory</h1>
        {inventoryItems.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-sm text-gray-600">Items owned</p>
              <p className="text-2xl font-bold">{itemsOwned}</p>
            </div>
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-sm text-gray-600">Sell value</p>
              <p className="text-2xl font-bold">{sellValue}¥</p>
            </div>
          </div>
        )}
        <InventoryList inventoryItems={inventoryItems} />
      </div>
    </div>
  );
}