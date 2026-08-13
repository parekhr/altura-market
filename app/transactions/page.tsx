import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

type TransactionGroup = {
  key: string;
  type: string;
  time: Date;
  items: { itemName: string; imageSrc: string | null; quantity: number; pricePaid: number }[];
};

// Multi-item purchases (and sellAll) write one Transaction row per item, all sharing
// the same orderId. This walks the flat list from the database and bundles rows with
// a matching orderId into a single group, so they render as one entry instead of many.
// Rows with orderId === null (every sellItem call, plus rows from before orderId existed)
// never match anything else and just become their own single-item group.
function groupTransactions(transactions: {
  id: number;
  itemName: string;
  imageSrc: string | null;
  quantity: number;
  pricePaid: number;
  type: string;
  orderId: string | null;
  purchasedAt: Date;
}[]): TransactionGroup[] {
  const groups: TransactionGroup[] = [];
  const orderIdToGroup = new Map<string, TransactionGroup>();

  for (const tx of transactions) {
    if (tx.orderId) {
      let group = orderIdToGroup.get(tx.orderId);
      if (!group) {
        group = { key: tx.orderId, type: tx.type, time: tx.purchasedAt, items: [] };
        orderIdToGroup.set(tx.orderId, group);
        groups.push(group);
      }
      group.items.push({ itemName: tx.itemName, imageSrc: tx.imageSrc, quantity: tx.quantity, pricePaid: tx.pricePaid });
      // Each row in a batch gets its own purchasedAt from the write loop, so keep
      // the earliest one as the group's displayed time (when the order started).
      if (tx.purchasedAt < group.time) group.time = tx.purchasedAt;
    } else {
      groups.push({
        key: `single-${tx.id}`,
        type: tx.type,
        time: tx.purchasedAt,
        items: [{ itemName: tx.itemName, imageSrc: tx.imageSrc, quantity: tx.quantity, pricePaid: tx.pricePaid }],
      });
    }
  }

  // Most recent first.
  groups.sort((a, b) => b.time.getTime() - a.time.getTime());
  return groups;
}

// Server Component: reads cookies() and queries Prisma directly, no client-side
// interactivity needed on this page, so no "use client" and no separate action.
export default async function TransactionsPage() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('sessionId')?.value;

  // No cookie yet means this visitor has never bought or sold anything.
  const transactions = sessionId
    ? await prisma.transaction.findMany({ where: { sessionId } })
    : [];

  const groups = groupTransactions(transactions);

  return (
    <div className="flex min-h-screen max-w-2xl mx-auto flex-col justify-center px-4">
      <div className="w-full rounded-2xl border border-gray-200 bg-white p-8 shadow-md">
        <h1 className="text-2xl font-bold">Transactions</h1>
        {groups.length === 0 ? (
          <p className="mt-2 text-lg text-slate-700">You currently have no transactions.</p>
        ) : (
          <div className="mt-4 divide-y divide-gray-300 border-y border-gray-300">
            {groups.map(group => (
              <div key={group.key} className="flex items-start gap-4 py-3">
                {/* w-16 keeps "Bought" and "Sold" the same column width, so the item
                    list to the right lines up regardless of which word is shown. */}
                <span
                  className={
                    group.type === "PURCHASE"
                      ? "mt-0.5 w-16 shrink-0 rounded-md border border-emerald-700 bg-emerald-100 px-2 py-1 text-center text-xs font-bold text-emerald-800"
                      : "mt-0.5 w-16 shrink-0 rounded-md border border-red-700 bg-red-100 px-2 py-1 text-center text-xs font-bold text-red-800"
                  }
                >
                  {group.type === "PURCHASE" ? "Bought" : "Sold"}
                </span>
                <div className="flex-1">
                  {group.items.map((item, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-slate-700">
                      {/* imageSrc is null for rows written before that column existed
                          — skip the <img> tag entirely rather than showing a broken image. */}
                      {item.imageSrc && (
                        <img src={item.imageSrc} alt={item.itemName} className="h-6 w-6 object-contain" />
                      )}
                      <p>
                        {item.itemName.replace(/-/g, " ")} x{item.quantity}
                        <span className="text-gray-500"> — {item.pricePaid}¥</span>
                      </p>
                    </div>
                  ))}
                </div>
                <span className="whitespace-nowrap text-xs text-gray-500">
                  {group.time.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
