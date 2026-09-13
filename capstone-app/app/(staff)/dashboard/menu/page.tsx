import { DashboardLayout } from "@/components/staff/layout/DashboardLayout";
import { formatCurrency } from "@/lib/utils";

import Image from "next/image";

// Force dynamic — DB calls will be wired in Phase F2
export const dynamic = "force-dynamic";

// Mock menu item shape matching what Phase F2 will return from db.menuItem.findMany()
interface MockMenuItem {
  id: number;
  name: string;
  price: number;
  imageUrl: string | null;
  isArchived: boolean;
  category: { name: string };
}

// Empty mock for now — Phase F2 replaces with real db.menuItem.findMany()
const MOCK_ITEMS: MockMenuItem[] = [];

export default async function MenuManagementPage() {
  const items = MOCK_ITEMS;

  return (
    <DashboardLayout title="Menu Management">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-slate-800">Menu Items</h2>
        <button className="bg-amber-500 hover:bg-amber-400 text-slate-900 px-4 py-2 rounded-lg font-medium shadow-sm transition-colors">
          + Add Item
        </button>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400">
          <p className="text-lg font-medium">No menu items yet</p>
          <p className="text-sm mt-1">Menu items will appear here once the database is connected.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div key={item.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <div className="h-40 bg-slate-100 relative">
                {item.imageUrl && (
                  <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                )}
                {item.isArchived && (
                  <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center">
                    <span className="bg-slate-800 text-white px-3 py-1 rounded-full text-xs font-semibold">Archived</span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-slate-900">{item.name}</h3>
                  <span className="font-bold text-amber-600">{formatCurrency(item.price)}</span>
                </div>
                <p className="text-xs text-slate-500 mb-4 px-2 py-1 bg-slate-100 inline-block rounded-md">
                  {item.category.name}
                </p>

                <div className="flex justify-end gap-2 mt-4">
                  <button className="text-sm font-medium text-slate-600 hover:text-slate-900 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors">
                    Edit
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
