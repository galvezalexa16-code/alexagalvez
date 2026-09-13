import { DashboardLayout } from "@/components/staff/layout/DashboardLayout";
import { StockStatusBadge } from "@/components/staff/inventory/StockStatusBadge";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { formatDate } from "@/lib/utils";
import type { StockStatus } from "@/types";

export const dynamic = "force-dynamic";

interface MockIngredient {
  id: number;
  name: string;
  category: string;
  stock: number;
  unit: string;
  supplier: string;
  expiryDate: string | null;
  status: StockStatus;
  updatedBy: string;
  updatedAt: string;
}

const MOCK_INGREDIENTS: MockIngredient[] = [
  { id: 1,  name: "Penne Pasta",        category: "Pasta",      stock: 12.5,  unit: "kg",  supplier: "Selecta Foods",   expiryDate: "2027-01-15", status: "GOOD",         updatedBy: "Ana Reyes",   updatedAt: "2026-09-12T09:00:00" },
  { id: 2,  name: "Spaghetti",          category: "Pasta",      stock: 0.8,   unit: "kg",  supplier: "Selecta Foods",   expiryDate: "2026-12-30", status: "LOW",          updatedBy: "Ana Reyes",   updatedAt: "2026-09-12T09:00:00" },
  { id: 3,  name: "Fresh Milk",         category: "Dairy",      stock: 20,    unit: "L",   supplier: "Alaska Dairy",    expiryDate: "2026-09-17", status: "GOOD",         updatedBy: "Liza Bautista", updatedAt: "2026-09-13T07:30:00" },
  { id: 4,  name: "All-Purpose Cream",  category: "Dairy",      stock: 0,     unit: "L",   supplier: "Alaska Dairy",    expiryDate: null,         status: "OUT_OF_STOCK", updatedBy: "Liza Bautista", updatedAt: "2026-09-10T11:00:00" },
  { id: 5,  name: "Vanilla Syrup",      category: "Syrups",     stock: 5.2,   unit: "L",   supplier: "Davinci Gourmet", expiryDate: "2027-06-01", status: "GOOD",         updatedBy: "Ana Reyes",   updatedAt: "2026-09-11T14:00:00" },
  { id: 6,  name: "Espresso Syrup",     category: "Syrups",     stock: 0.5,   unit: "L",   supplier: "Davinci Gourmet", expiryDate: "2027-03-20", status: "LOW",          updatedBy: "Ana Reyes",   updatedAt: "2026-09-13T08:00:00" },
  { id: 7,  name: "Matcha Powder",      category: "Powders",    stock: 2.0,   unit: "kg",  supplier: "Kiyora PH",       expiryDate: "2027-08-10", status: "GOOD",         updatedBy: "Liza Bautista", updatedAt: "2026-09-08T10:00:00" },
  { id: 8,  name: "Chocolate Powder",   category: "Powders",    stock: 0.3,   unit: "kg",  supplier: "Kiyora PH",       expiryDate: "2026-11-05", status: "LOW",          updatedBy: "Liza Bautista", updatedAt: "2026-09-09T10:00:00" },
  { id: 9,  name: "All-Purpose Flour",  category: "Baking",     stock: 25,    unit: "kg",  supplier: "Golden Bake",     expiryDate: "2026-12-01", status: "GOOD",         updatedBy: "Ana Reyes",   updatedAt: "2026-09-07T08:00:00" },
  { id: 10, name: "White Sugar",        category: "Sweeteners", stock: 18,    unit: "kg",  supplier: "Pilmico",         expiryDate: null,         status: "GOOD",         updatedBy: "Liza Bautista", updatedAt: "2026-09-06T09:00:00" },
  { id: 11, name: "Chicken Breast",     category: "Meat",       stock: 3.5,   unit: "kg",  supplier: "San Miguel Foods",expiryDate: "2026-09-15", status: "GOOD",         updatedBy: "Ana Reyes",   updatedAt: "2026-09-13T06:00:00" },
  { id: 12, name: "Ground Beef",        category: "Meat",       stock: 0,     unit: "kg",  supplier: "San Miguel Foods",expiryDate: null,         status: "OUT_OF_STOCK", updatedBy: "Ana Reyes",   updatedAt: "2026-09-11T06:00:00" },
];

const CATEGORIES = ["All", "Pasta", "Dairy", "Syrups", "Powders", "Baking", "Sweeteners", "Meat"];

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const role = session.user.role;
  if (role === "ADMIN") redirect("/dashboard");

  const params = await searchParams;
  const activeCategory = params.cat || "All";

  const filtered =
    activeCategory === "All"
      ? MOCK_INGREDIENTS
      : MOCK_INGREDIENTS.filter((i) => i.category === activeCategory);

  const outOfStock = MOCK_INGREDIENTS.filter((i) => i.status === "OUT_OF_STOCK").length;
  const lowStock = MOCK_INGREDIENTS.filter((i) => i.status === "LOW").length;
  const goodStock = MOCK_INGREDIENTS.filter((i) => i.status === "GOOD").length;

  return (
    <DashboardLayout title="Inventory">
      {/* Summary row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Out of Stock", value: outOfStock, color: "text-red-600",    bg: "bg-red-50",    border: "border-red-200" },
          { label: "Low Stock",    value: lowStock,   color: "text-yellow-600", bg: "bg-yellow-50", border: "border-yellow-200" },
          { label: "In Stock",     value: goodStock,  color: "text-green-600",  bg: "bg-green-50",  border: "border-green-200" },
        ].map((s) => (
          <div key={s.label} className={`${s.bg} rounded-xl border ${s.border} p-4`}>
            <p className="text-xs text-slate-500 mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Top bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            🔍
          </span>
          <input
            type="text"
            placeholder="Search ingredients..."
            className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent w-64"
          />
        </div>
        <div className="flex items-center gap-2">
          <button className="text-sm font-medium text-slate-600 hover:text-slate-900 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
            + Add Category
          </button>
          <button className="bg-amber-500 hover:bg-amber-400 text-slate-900 px-4 py-2 rounded-lg font-medium shadow-sm transition-colors text-sm">
            + Add Stock
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {/* Category tabs */}
        <div className="flex border-b border-slate-200 overflow-x-auto">
          {CATEGORIES.map((cat) => (
            <a
              key={cat}
              href={cat === "All" ? "/dashboard/inventory" : `/dashboard/inventory?cat=${cat}`}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeCategory === cat
                  ? "border-amber-500 text-amber-600 bg-amber-50"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"
              }`}
            >
              {cat}
            </a>
          ))}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-5 py-3 text-left font-semibold text-slate-600">Ingredient</th>
                <th className="px-5 py-3 text-left font-semibold text-slate-600">Category</th>
                <th className="px-5 py-3 text-left font-semibold text-slate-600">Stock</th>
                <th className="px-5 py-3 text-left font-semibold text-slate-600">Supplier</th>
                <th className="px-5 py-3 text-left font-semibold text-slate-600">Expiry</th>
                <th className="px-5 py-3 text-left font-semibold text-slate-600">Status</th>
                <th className="px-5 py-3 text-left font-semibold text-slate-600">Updated By</th>
                <th className="px-5 py-3 text-left font-semibold text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-slate-400">
                    No ingredients in this category.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-slate-800">{item.name}</td>
                    <td className="px-5 py-3.5 text-slate-500">{item.category}</td>
                    <td className="px-5 py-3.5 font-semibold text-slate-800">
                      {item.stock} {item.unit}
                    </td>
                    <td className="px-5 py-3.5 text-slate-500">{item.supplier}</td>
                    <td className="px-5 py-3.5 text-slate-500 text-xs">
                      {item.expiryDate ? formatDate(item.expiryDate) : "—"}
                    </td>
                    <td className="px-5 py-3.5">
                      <StockStatusBadge status={item.status} />
                    </td>
                    <td className="px-5 py-3.5 text-slate-500">{item.updatedBy}</td>
                    <td className="px-5 py-3.5">
                      <button className="text-xs font-medium text-slate-600 hover:text-slate-900 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors">
                        Update
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
