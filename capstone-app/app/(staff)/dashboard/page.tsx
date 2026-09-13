import { DashboardLayout } from "@/components/staff/layout/DashboardLayout";
import { StatCard } from "@/components/staff/dashboard/StatCard";
import { InventoryStatusCard } from "@/components/staff/dashboard/InventoryStatusCard";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { formatCurrency } from "@/lib/utils";
import { Coins, ShoppingBag, Receipt } from "lucide-react";

// Force dynamic so Next.js doesn't try to prerender this page at build time
// (DB calls will be wired in Phase F2; for now we use mock data)
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role;
  const isOwner = role === "OWNER";

  // ── Mock data (Phase F2 will replace with real db.* calls) ──────────────
  const totalRevenue = 0;
  const totalOrders = 0;
  const activeMenuItems = 0;
  const outOfStock = 0;
  const lowStock = 0;
  const goodStock = 0;
  // ─────────────────────────────────────────────────────────────────────────

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
          value={totalOrders}
          icon={ShoppingBag}
        />
        <StatCard
          title="Active Menu Items"
          value={activeMenuItems}
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
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Insights &amp; Recommendations</h3>
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
