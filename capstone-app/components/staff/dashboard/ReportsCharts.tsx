"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  ResponsiveContainer,
} from "recharts";

interface RevenueDataPoint {
  date: string;
  revenue: number;
  expenses: number;
}

interface ProfitDataPoint {
  date: string;
  profit: number;
}

interface RevenueChartProps {
  data: RevenueDataPoint[];
}

interface ProfitChartProps {
  data: ProfitDataPoint[];
}

export function RevenueExpensesChart({ data }: RevenueChartProps) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `₱${(v / 1000).toFixed(0)}k`} />
        <Tooltip
          formatter={(value) => {
            const num = typeof value === "number" ? value : Number(value ?? 0);
            return [`₱${num.toLocaleString()}`, undefined] as [string, undefined];
          }}
          contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "12px" }}
        />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }} />
        <Bar dataKey="revenue"  name="Revenue"  fill="#f59e0b" radius={[4, 4, 0, 0]} />
        <Bar dataKey="expenses" name="Expenses" fill="#94a3b8" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function ProfitTrendChart({ data }: ProfitChartProps) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `₱${(v / 1000).toFixed(0)}k`} />
        <Tooltip
          formatter={(value) => {
            const num = typeof value === "number" ? value : Number(value ?? 0);
            return [`₱${num.toLocaleString()}`, "Net Profit"] as [string, string];
          }}
          contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "12px" }}
        />
        <Line
          type="monotone"
          dataKey="profit"
          name="Net Profit"
          stroke="#10b981"
          strokeWidth={2.5}
          dot={{ fill: "#10b981", r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
