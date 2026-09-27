import { DashboardLayout } from "@/components/staff/layout/DashboardLayout";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { InventoryClient } from "./InventoryClient";
import Link from "next/link";

export const dynamic = "force-dynamic";

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

  // Real DB queries
  const [categories, allItems] = await Promise.all([
    db.inventoryCategory.findMany({ orderBy: { name: "asc" } }),
    db.inventoryItem.findMany({
      include: {
        category: true,
        updatedBy: { select: { name: true } },
      },
      orderBy: { name: "asc" },
    }),
  ]);

  const filteredItems =
    activeCategory === "All"
      ? allItems
      : allItems.filter((i) => i.category.name === activeCategory);

  const outOfStock = allItems.filter((i) => i.status === "OUT_OF_STOCK").length;
  const lowStock   = allItems.filter((i) => i.status === "LOW").length;
  const goodStock  = allItems.filter((i) => i.status === "GOOD").length;

  const serialized = filteredItems.map((item) => ({
    id: item.id,
    name: item.name,
    category: { id: item.category.id, name: item.category.name },
    stockQuantity: Number(item.stockQuantity),
    unit: item.unit,
    supplier: item.supplier,
    expiryDate: item.expiryDate ? item.expiryDate.toISOString() : null,
    status: item.status,
    updatedBy: item.updatedBy.name,
    updatedAt: item.updatedAt.toISOString(),
  }));

  const serializedCategories = categories.map((c) => ({ id: c.id, name: c.name }));

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

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {/* Category tabs */}
        <div className="flex border-b border-slate-200 overflow-x-auto">
          <Link
            href="/dashboard/inventory"
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeCategory === "All"
                ? "border-amber-500 text-amber-600 bg-amber-50"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"
            }`}
          >
            All
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/dashboard/inventory?cat=${encodeURIComponent(cat.name)}`}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeCategory === cat.name
                  ? "border-amber-500 text-amber-600 bg-amber-50"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"
              }`}
            >
              {cat.name}
            </Link>
          ))}
        </div>

        {/* Client view with buttons */}
        <div className="p-5">
          <InventoryClient items={serialized} categories={serializedCategories} />
        </div>
      </div>
    </DashboardLayout>
  );
}
