"use client";

import { formatCurrency } from "@/lib/utils";

interface TopItem {
  rank: number;
  name: string;
  revenue: number;
  orders: number;
}

interface ReportsClientProps {
  topItems: TopItem[];
  period: string;
}

const PERIOD_LABEL: Record<string, string> = {
  day: "Today",
  week: "This Week",
  month: "This Month",
  year: "This Year",
};

function downloadCSV(items: TopItem[], period: string) {
  const label = PERIOD_LABEL[period] ?? period;
  const headers = ["Rank", "Item", "Units Sold", "Revenue (PHP)"];
  const rows = items.map((i) => [i.rank, `"${i.name}"`, i.orders, i.revenue.toFixed(2)]);
  const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `top-items-${label.toLowerCase().replace(/\s/g, "-")}-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function printReport(items: TopItem[], period: string) {
  const label = PERIOD_LABEL[period] ?? period;
  const html = `
    <html><head><title>Top Items - ${label}</title>
    <style>body{font-family:sans-serif;padding:20px}table{width:100%;border-collapse:collapse}
    th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f8f8f8}
    h1{margin-bottom:4px}p{color:#666;margin-top:0}</style></head>
    <body>
    <h1>Top Selling Items</h1><p>${label}</p>
    <table><thead><tr><th>#</th><th>Item</th><th>Units Sold</th><th>Revenue</th></tr></thead>
    <tbody>${items.map((i) => `<tr><td>${i.rank}</td><td>${i.name}</td><td>${i.orders}</td><td>${formatCurrency(i.revenue)}</td></tr>`).join("")}</tbody>
    </table></body></html>`;
  const win = window.open("", "_blank");
  if (win) { win.document.write(html); win.document.close(); win.print(); }
}

export function ReportsClient({ topItems, period }: ReportsClientProps) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => printReport(topItems, period)}
        className="text-sm font-medium text-slate-600 hover:text-slate-900 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
      >
        🖨 Print
      </button>
      <button
        onClick={() => downloadCSV(topItems, period)}
        className="text-sm font-medium text-slate-600 hover:text-slate-900 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
      >
        ↓ CSV
      </button>
    </div>
  );
}
