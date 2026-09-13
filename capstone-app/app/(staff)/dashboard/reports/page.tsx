import { DashboardLayout } from "@/components/staff/layout/DashboardLayout";
import { RevenueExpensesChart, ProfitTrendChart } from "@/components/staff/dashboard/ReportsCharts";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

export const dynamic = "force-dynamic";

const PERIOD_TABS = [
  { key: "day",   label: "Day" },
  { key: "week",  label: "Week" },
  { key: "month", label: "Month" },
  { key: "year",  label: "Year" },
];

// Mock data keyed by period
const REVENUE_DATA: Record<string, { date: string; revenue: number; expenses: number }[]> = {
  day: [
    { date: "8am",  revenue: 2400,  expenses: 800 },
    { date: "10am", revenue: 4800,  expenses: 1200 },
    { date: "12pm", revenue: 9600,  expenses: 2100 },
    { date: "2pm",  revenue: 7200,  expenses: 1800 },
    { date: "4pm",  revenue: 6000,  expenses: 1500 },
    { date: "6pm",  revenue: 8400,  expenses: 1900 },
  ],
  week: [
    { date: "Mon", revenue: 12000, expenses: 4000 },
    { date: "Tue", revenue: 15000, expenses: 5200 },
    { date: "Wed", revenue: 9800,  expenses: 3800 },
    { date: "Thu", revenue: 18200, expenses: 6100 },
    { date: "Fri", revenue: 22000, expenses: 7500 },
    { date: "Sat", revenue: 28000, expenses: 9200 },
    { date: "Sun", revenue: 24000, expenses: 8400 },
  ],
  month: [
    { date: "Wk 1", revenue: 68000,  expenses: 24000 },
    { date: "Wk 2", revenue: 82000,  expenses: 28000 },
    { date: "Wk 3", revenue: 91000,  expenses: 31000 },
    { date: "Wk 4", revenue: 76000,  expenses: 26000 },
  ],
  year: [
    { date: "Jan", revenue: 240000, expenses: 82000 },
    { date: "Feb", revenue: 198000, expenses: 71000 },
    { date: "Mar", revenue: 312000, expenses: 95000 },
    { date: "Apr", revenue: 285000, expenses: 88000 },
    { date: "May", revenue: 340000, expenses: 102000 },
    { date: "Jun", revenue: 378000, expenses: 115000 },
    { date: "Jul", revenue: 420000, expenses: 128000 },
    { date: "Aug", revenue: 395000, expenses: 122000 },
    { date: "Sep", revenue: 288000, expenses: 91000 },
  ],
};

const PROFIT_DATA: Record<string, { date: string; profit: number }[]> = {
  day:   REVENUE_DATA.day.map(d => ({ date: d.date, profit: d.revenue - d.expenses })),
  week:  REVENUE_DATA.week.map(d => ({ date: d.date, profit: d.revenue - d.expenses })),
  month: REVENUE_DATA.month.map(d => ({ date: d.date, profit: d.revenue - d.expenses })),
  year:  REVENUE_DATA.year.map(d => ({ date: d.date, profit: d.revenue - d.expenses })),
};

const TOP_ITEMS = [
  { rank: 1, name: "Spanish Latte",        revenue: 42600, orders: 142 },
  { rank: 2, name: "Chicken Alfredo Pasta",revenue: 38400, orders: 96  },
  { rank: 3, name: "Matcha Frappe",        revenue: 31800, orders: 106 },
  { rank: 4, name: "Filipino Breakfast",   revenue: 28200, orders: 94  },
  { rank: 5, name: "Chocolate Cake Slice", revenue: 24000, orders: 120 },
];

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const params = await searchParams;
  const period = params.period ?? "week";
  const revenueData = REVENUE_DATA[period] ?? REVENUE_DATA.week;
  const profitData  = PROFIT_DATA[period]  ?? PROFIT_DATA.week;

  const totalRevenue  = revenueData.reduce((s, d) => s + d.revenue, 0);
  const totalExpenses = revenueData.reduce((s, d) => s + d.expenses, 0);
  const netProfit     = totalRevenue - totalExpenses;
  const totalOrders   = TOP_ITEMS.reduce((s, i) => s + i.orders, 0);

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
          { label: "Total Orders",   value: totalOrders,                   color: "text-blue-700",   bg: "from-blue-50 to-indigo-50",     border: "border-blue-200" },
        ].map((card) => (
          <div key={card.label} className={`bg-gradient-to-br ${card.bg} border ${card.border} rounded-xl p-5`}>
            <p className="text-xs text-slate-500 mb-1">{card.label}</p>
            <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800">Revenue vs Expenses</h3>
            <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-full">{tab(period)}</span>
          </div>
          <RevenueExpensesChart data={revenueData} />
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800">Profit Trend</h3>
            <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-full">{tab(period)}</span>
          </div>
          <ProfitTrendChart data={profitData} />
        </div>
      </div>

      {/* Top Menu Items */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-semibold text-slate-800">Top Menu Items</h3>
          <div className="flex items-center gap-2">
            <button className="text-sm font-medium text-slate-600 hover:text-slate-900 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors">
              🖨 Print
            </button>
            <button className="text-sm font-medium text-slate-600 hover:text-slate-900 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors">
              ↓ CSV
            </button>
          </div>
        </div>
        <div className="divide-y divide-slate-100">
          {TOP_ITEMS.map((item) => {
            const pct = Math.round((item.revenue / TOP_ITEMS[0].revenue) * 100);
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
                      <span className="text-xs text-slate-400">{item.orders} orders</span>
                      <span className="text-sm font-semibold text-slate-900">{formatCurrency(item.revenue)}</span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}

function tab(period: string): string {
  return { day: "Today", week: "This Week", month: "This Month", year: "This Year" }[period] ?? "This Week";
}
