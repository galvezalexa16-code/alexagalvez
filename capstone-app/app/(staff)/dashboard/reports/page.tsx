import { DashboardLayout } from "@/components/staff/layout/DashboardLayout";
import { RevenueExpensesChart, ProfitTrendChart } from "@/components/staff/dashboard/ReportsCharts";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import { db } from "@/lib/db";
import Link from "next/link";
import { ReportsClient } from "./ReportsClient";

export const dynamic = "force-dynamic";

const PERIOD_TABS = [
  { key: "day",   label: "Day" },
  { key: "week",  label: "Week" },
  { key: "month", label: "Month" },
  { key: "year",  label: "Year" },
];

function getPeriodRange(period: string): { start: Date; end: Date } {
  const now = new Date();
  const start = new Date(now);
  const end   = new Date(now);
  end.setHours(23, 59, 59, 999);

  if (period === "day") {
    start.setHours(0, 0, 0, 0);
  } else if (period === "week") {
    start.setDate(now.getDate() - 6);
    start.setHours(0, 0, 0, 0);
  } else if (period === "month") {
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
  } else {
    start.setMonth(0, 1);
    start.setHours(0, 0, 0, 0);
  }
  return { start, end };
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const params = await searchParams;
  const period = params.period ?? "week";
  const { start, end } = getPeriodRange(period);

  // Real DB: transactions in period for revenue, expenses from Expense table
  const [transactions, expenses, topItems] = await Promise.all([
    db.transaction.findMany({
      where: { status: "PAID", createdAt: { gte: start, lte: end } },
      select: { amountPaid: true, createdAt: true },
    }),
    db.expense.findMany({
      where: { createdAt: { gte: start, lte: end } },
      select: { amount: true, createdAt: true },
    }),
    db.orderItem.groupBy({
      by: ["menuItemId"],
      _sum: { quantity: true, unitPrice: true },
      _count: { _all: true },
      where: {
        order: {
          status: "COMPLETED",
          createdAt: { gte: start, lte: end },
        },
      },
      orderBy: { _sum: { unitPrice: "desc" } },
      take: 5,
    }),
  ]);

  const totalRevenue  = transactions.reduce((s, t) => s + Number(t.amountPaid), 0);
  const totalExpenses = expenses.reduce((s, e) => s + Number(e.amount), 0);
  const netProfit     = totalRevenue - totalExpenses;
  const totalOrders   = topItems.reduce((s, i) => s + (i._sum.quantity ?? 0), 0);

  // Resolve menu item names for top items
  const menuItemIds = topItems.map((i) => i.menuItemId);
  const menuItems   = await db.menuItem.findMany({
    where: { id: { in: menuItemIds } },
    select: { id: true, name: true },
  });
  const nameMap = Object.fromEntries(menuItems.map((m) => [m.id, m.name]));

  const topItemsSerialized = topItems.map((item, i) => ({
    rank: i + 1,
    name: nameMap[item.menuItemId] ?? `Item #${item.menuItemId}`,
    revenue: Number(item._sum.unitPrice ?? 0) * (item._sum.quantity ?? 0),
    orders: item._sum.quantity ?? 0,
  }));

  return (
    <DashboardLayout title="Reports">
      {/* Period tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl mb-6 w-fit">
        {PERIOD_TABS.map((tab) => (
          <Link
            key={tab.key}
            href={`/dashboard/reports?period=${tab.key}`}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              period === tab.key
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Revenue",  value: formatCurrency(totalRevenue),  color: "text-amber-700",  bg: "from-amber-50 to-orange-50",   border: "border-amber-200" },
          { label: "Total Expenses", value: formatCurrency(totalExpenses), color: "text-red-600",    bg: "from-red-50 to-pink-50",        border: "border-red-200" },
          { label: "Net Profit",     value: formatCurrency(netProfit),     color: "text-green-700",  bg: "from-green-50 to-emerald-50",   border: "border-green-200" },
          { label: "Total Sold",     value: totalOrders,                   color: "text-blue-700",   bg: "from-blue-50 to-indigo-50",     border: "border-blue-200" },
        ].map((card) => (
          <div key={card.label} className={`bg-gradient-to-br ${card.bg} border ${card.border} rounded-xl p-5`}>
            <p className="text-xs text-slate-500 mb-1">{card.label}</p>
            <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Top Menu Items */}
      {topItemsSerialized.length > 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-semibold text-slate-800">Top Selling Items</h3>
            <ReportsClient topItems={topItemsSerialized} period={period} />
          </div>
          <div className="divide-y divide-slate-100">
            {topItemsSerialized.map((item) => {
              const pct = topItemsSerialized[0].revenue > 0
                ? Math.round((item.revenue / topItemsSerialized[0].revenue) * 100)
                : 0;
              return (
                <div key={item.rank} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors">
                  <span className={`w-7 h-7 flex-shrink-0 rounded-full flex items-center justify-center text-xs font-bold ${
                    item.rank === 1 ? "bg-amber-100 text-amber-700"
                    : item.rank === 2 ? "bg-slate-200 text-slate-700"
                    : "bg-slate-100 text-slate-500"
                  }`}>
                    {item.rank}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-slate-800 truncate">{item.name}</p>
                      <div className="flex items-center gap-4 flex-shrink-0">
                        <span className="text-xs text-slate-400">{item.orders} sold</span>
                        <span className="text-sm font-semibold text-slate-900">{formatCurrency(item.revenue)}</span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400">
          <p className="text-lg font-medium mb-1">No data yet</p>
          <p className="text-sm">No completed orders in this period.</p>
        </div>
      )}
    </DashboardLayout>
  );
}
