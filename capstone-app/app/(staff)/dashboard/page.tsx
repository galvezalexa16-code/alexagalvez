import { DashboardLayout } from "@/components/staff/layout/DashboardLayout";
import { StatCard } from "@/components/staff/dashboard/StatCard";
import { InventoryStatusCard } from "@/components/staff/dashboard/InventoryStatusCard";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { formatCurrency } from "@/lib/utils";
import { db } from "@/lib/db";
import { Coins, ShoppingBag, Receipt } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role;
  const isOwner = role === "OWNER";

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Real DB queries
  const [transactionAgg, orderCount, activeMenuItems, inventoryStats, lowItems] = await Promise.all([
    db.transaction.aggregate({
      _sum: { amountPaid: true },
      where: {
        status: "PAID",
        createdAt: { gte: today },
      },
    }),
    db.order.count({ where: { createdAt: { gte: today } } }),
    db.menuItem.count({ where: { isArchived: false } }),
    db.inventoryItem.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
    db.inventoryItem.findMany({
      where: { status: { in: ["LOW", "OUT_OF_STOCK"] } },
      include: { category: true },
      orderBy: { status: "asc" },
      take: 5,
    }),
  ]);

  const totalRevenue   = Number(transactionAgg._sum.amountPaid ?? 0);
  const outOfStock     = inventoryStats.find((s) => s.status === "OUT_OF_STOCK")?._count._all ?? 0;
  const lowStock       = inventoryStats.find((s) => s.status === "LOW")?._count._all ?? 0;
  const goodStock      = inventoryStats.find((s) => s.status === "GOOD")?._count._all ?? 0;

  return (
    <DashboardLayout title="Dashboard">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard title="Revenue Today"    value={formatCurrency(totalRevenue)} icon={Coins} />
        <StatCard title="Orders Today"     value={orderCount}                  icon={ShoppingBag} />
        <StatCard title="Active Menu Items" value={activeMenuItems}             icon={Receipt} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inventory Status Overview */}
        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Inventory Status</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <InventoryStatusCard status="OUT_OF_STOCK" count={outOfStock} label="Out of Stock" />
            <InventoryStatusCard status="LOW"          count={lowStock}   label="Low Stock" />
            <InventoryStatusCard status="GOOD"         count={goodStock}  label="In Stock" />
          </div>
        </div>

        {/* Insights & Recommendations */}
        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Insights &amp; Recommendations</h3>
          {lowItems.length === 0 ? (
            <p className="text-sm text-slate-400">All inventory is in good shape! 🎉</p>
          ) : (
            <ul className="space-y-3">
              {lowItems.map((item) => (
                <li key={item.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg text-sm">
                  <span className="text-amber-500">{item.status === "OUT_OF_STOCK" ? "🚨" : "⚠️"}</span>
                  <p className="text-slate-700">
                    <span className="font-semibold">
                      {item.status === "OUT_OF_STOCK" ? "Out of Stock:" : "Low Stock:"}
                    </span>{" "}
                    {item.name} ({item.category.name}) —{" "}
                    <span className="font-semibold">{Number(item.stockQuantity)} {item.unit}</span> remaining.
                  </p>
                </li>
              ))}
              {isOwner && (
                <li className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg text-sm border border-amber-100">
                  <span className="text-amber-500">📈</span>
                  <p className="text-slate-700">
                    <span className="font-semibold">Tip:</span> Review the Reports page for sales trends and top-performing items.
                  </p>
                </li>
              )}
            </ul>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
