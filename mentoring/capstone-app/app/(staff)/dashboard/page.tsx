import { DashboardLayout } from "@/components/staff/layout/DashboardLayout";
import { StatCard } from "@/components/staff/dashboard/StatCard";
import { InventoryStatusCard } from "@/components/staff/dashboard/InventoryStatusCard";
import { db } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";
import { Coins, ShoppingBag, Receipt } from "lucide-react";
import { auth } from "@/lib/auth";
import type { Role } from "@/types";

export default async function DashboardPage() {
  const session = await auth();
  const role = (session?.user as { role: Role })?.role;
  const isOwner = role === "OWNER";

  const [orders, items, inventory] = await Promise.all([
    db.order.findMany({ include: { transaction: true } }),
    db.menuItem.count({ where: { isArchived: false } }),
    db.inventoryItem.findMany(),
  ]);

  const totalRevenue = orders.reduce((sum, o) => {
    return sum + (o.transaction?.amountPaid ? Number(o.totalAmount) : 0);
  }, 0);

  const outOfStock = inventory.filter((i) => i.status === "OUT_OF_STOCK").length;
  const lowStock = inventory.filter((i) => i.status === "LOW").length;
  const goodStock = inventory.filter((i) => i.status === "GOOD").length;

  return (
    <DashboardLayout title="Dashboard">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(totalRevenue)}
          icon={Coins}
        />
        <StatCard
          title="Total Orders"
          value={orders.length}
          icon={ShoppingBag}
        />
        <StatCard
          title="Active Menu Items"
          value={items}
          icon={Receipt}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inventory Status Overview */}
        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Inventory Status</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <InventoryStatusCard status="OUT_OF_STOCK" count={outOfStock} label="Out of Stock" />
            <InventoryStatusCard status="LOW" count={lowStock} label="Low Stock" />
            <InventoryStatusCard status="GOOD" count={goodStock} label="In Stock" />
          </div>
        </div>

        {/* Decision Support Insights */}
        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Insights & Recommendations</h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg text-sm">
              <span className="text-amber-500">💡</span>
              <p className="text-slate-700">
                <span className="font-semibold">Restock Needed:</span> Espresso Syrup is running low. Consider ordering from Davinci soon.
              </p>
            </li>
            {isOwner && (
              <li className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg text-sm">
                <span className="text-amber-500">📈</span>
                <p className="text-slate-700">
                  <span className="font-semibold">Trending:</span> Spanish Latte orders increased by 15% this week.
                </p>
              </li>
            )}
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
}
