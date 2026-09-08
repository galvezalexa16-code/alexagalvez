"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/staff/layout/DashboardLayout";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatCard } from "@/components/staff/dashboard/StatCard";
import { formatCurrency } from "@/lib/utils";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Coins, TrendingUp, AlertCircle } from "lucide-react";

interface SummaryStats {
  totalRevenue: number;
  totalExpenses: number;
  totalProfit: number;
  totalOrders: number;
  averageOrderValue: number;
}

interface RevenueData {
  date: string;
  revenue: number;
}

interface ProfitData {
  date: string;
  revenue: number;
  expenses: number;
  profit: number;
}

interface TopItem {
  name: string;
  count: number;
  revenue: number;
}

export default function ReportsPage() {
  const [period, setPeriod] = useState<"day" | "week" | "month" | "year">("week");
  const [stats, setStats] = useState<SummaryStats | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [profitData, setProfitData] = useState<ProfitData[]>([]);
  const [topItems, setTopItems] = useState<TopItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        setLoading(true);
        const [statsRes, revenueRes, profitRes, itemsRes] = await Promise.all([
          fetch(`/api/reports/summary?period=${period}`),
          fetch(`/api/reports/revenue?period=${period}`),
          fetch(`/api/reports/profit?period=${period}`),
          fetch(`/api/reports/top-items`),
        ]);

        const statsData = await statsRes.json();
        const revenueChartData = await revenueRes.json();
        const profitChartData = await profitRes.json();
        const itemsData = await itemsRes.json();

        setStats(statsData);
        setRevenueData(revenueChartData);
        setProfitData(profitChartData);
        setTopItems(itemsData);
      } catch (error) {
        console.error("Failed to fetch report data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, [period]);

  return (
    <DashboardLayout title="Reports">
      <div className="space-y-6">
        {/* Period Selector */}
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <Tabs value={period} onValueChange={(val) => setPeriod(val as any)}>
            <TabsList className="grid w-full grid-cols-4 gap-2 bg-transparent h-auto p-0">
              <TabsTrigger
                value="day"
                className="rounded-lg data-[state=active]:bg-amber-100 data-[state=active]:text-amber-900"
              >
                Today
              </TabsTrigger>
              <TabsTrigger
                value="week"
                className="rounded-lg data-[state=active]:bg-amber-100 data-[state=active]:text-amber-900"
              >
                This Week
              </TabsTrigger>
              <TabsTrigger
                value="month"
                className="rounded-lg data-[state=active]:bg-amber-100 data-[state=active]:text-amber-900"
              >
                This Month
              </TabsTrigger>
              <TabsTrigger
                value="year"
                className="rounded-lg data-[state=active]:bg-amber-100 data-[state=active]:text-amber-900"
              >
                This Year
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {loading ? (
          <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
            <div className="inline-flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
            </div>
            <p className="mt-4 text-slate-500">Loading reports...</p>
          </div>
        ) : (
          <>
            {/* Summary Stats */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard
                  title="Revenue"
                  value={formatCurrency(stats.totalRevenue)}
                  icon={Coins}
                />
                <StatCard
                  title="Expenses"
                  value={formatCurrency(stats.totalExpenses)}
                  icon={AlertCircle}
                />
                <StatCard
                  title="Profit"
                  value={formatCurrency(stats.totalProfit)}
                  icon={TrendingUp}
                />
                <StatCard
                  title="Orders"
                  value={stats.totalOrders}
                  icon={Coins}
                />
              </div>
            )}

            {/* Revenue vs Expenses Chart */}
            {profitData.length > 0 && (
              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                  Revenue vs Expenses
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={profitData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Legend />
                    <Bar dataKey="revenue" fill="#f59e0b" name="Revenue" />
                    <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Profit Trend Chart */}
            {profitData.length > 0 && (
              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                  Profit Trend
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={profitData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="profit"
                      stroke="#10b981"
                      strokeWidth={2}
                      name="Profit"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Top Items */}
            {topItems.length > 0 && (
              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                  Top Selling Items
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50">
                        <th className="px-4 py-2 text-left font-semibold text-slate-700">
                          Item
                        </th>
                        <th className="px-4 py-2 text-left font-semibold text-slate-700">
                          Orders
                        </th>
                        <th className="px-4 py-2 text-left font-semibold text-slate-700">
                          Revenue
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {topItems.map((item, idx) => (
                        <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="px-4 py-3">{item.name}</td>
                          <td className="px-4 py-3 font-medium">{item.count}</td>
                          <td className="px-4 py-3 font-semibold text-amber-600">
                            {formatCurrency(item.revenue)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
