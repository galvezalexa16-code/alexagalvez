import { DashboardLayout } from "@/components/staff/layout/DashboardLayout";
import { StatCard } from "@/components/staff/dashboard/StatCard";
import { InventoryStatusCard } from "@/components/staff/dashboard/InventoryStatusCard";
import { db } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";
import { Coins, ShoppingBag, Receipt, AlertTriangle, TrendingUp, Zap } from "lucide-react";
import { auth } from "@/lib/auth";
import {
  getLowStockItems,
  getFastMovingItems,
  predictStockDepletion,
  getSummaryStats,
} from "@/lib/analytics";
import type { Role } from "@/types";

export default async function DashboardPage() {
  const session = await auth();
  const role = (session?.user as { role: Role })?.role;
  const isOwner = role === "OWNER";

  const [orders, items, inventory, lowStock, fastMoving, predictions, stats] = await Promise.all([
    db.order.findMany({ include: { transaction: true } }),
    db.menuItem.count({ where: { isArchived: false } }),
    db.inventoryItem.findMany(),
    getLowStockItems(),
    getFastMovingItems(),
    predictStockDepletion(),
    getSummaryStats("week"),
  ]);

  const totalRevenue = orders.reduce((sum, o) => {
    return sum + (o.transaction?.amountPaid ? Number(o.totalAmount) : 0);
  }, 0);

  const outOfStock = inventory.filter((i) => i.status === "OUT_OF_STOCK").length;
  const lowStockCount = inventory.filter((i) => i.status === "LOW").length;
  const goodStock = inventory.filter((i) => i.status === "GOOD").length;

  return (
    <DashboardLayout title="Dashboard">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(stats.totalRevenue)}
          icon={Coins}
        />
        <StatCard
          title="Total Orders"
          value={stats.totalOrders}
          icon={ShoppingBag}
        />
        <StatCard
          title="Net Profit"
          value={formatCurrency(stats.totalProfit)}
          icon={Receipt}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inventory Status Overview */}
        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Inventory Status</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <InventoryStatusCard status="OUT_OF_STOCK" count={outOfStock} label="Out of Stock" />
            <InventoryStatusCard status="LOW" count={lowStockCount} label="Low Stock" />
            <InventoryStatusCard status="GOOD" count={goodStock} label="In Stock" />
          </div>
        </div>

        {/* Decision Support Insights */}
        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Insights & Recommendations</h3>
          <ul className="space-y-3">
            {lowStock.length > 0 && (
              <li className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg text-sm">
                <AlertTriangle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                <p className="text-yellow-800">
                  <span className="font-semibold">Low Stock Alert:</span> {lowStock[0].name} needs
                  restocking ({Number(lowStock[0].stockQuantity)} remaining)
                </p>
              </li>
            )}

            {fastMoving.length > 0 && (
              <li className="flex items-start gap-3 p-3 bg-green-50 rounded-lg text-sm">
                <TrendingUp className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-green-800">
                  <span className="font-semibold">Best Seller:</span> {fastMoving[0].name} is your
                  top-selling item
                </p>
              </li>
            )}

            {predictions.length > 0 && (
              <li className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg text-sm">
                <Zap className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                <p className="text-orange-800">
                  <span className="font-semibold">Predict Stock:</span> {predictions[0].name} will
                  run out in ~{predictions[0].daysUntilEmpty} day(s)
                </p>
              </li>
            )}

            {lowStock.length === 0 && fastMoving.length === 0 && (
              <li className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg text-sm">
                <span>✅</span>
                <p className="text-slate-700">All systems running smoothly!</p>
              </li>
            )}
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
}
