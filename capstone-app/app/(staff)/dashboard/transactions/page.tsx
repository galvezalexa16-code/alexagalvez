import { DashboardLayout } from "@/components/staff/layout/DashboardLayout";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { PaymentMethod, PaymentStatus } from "@/types";

export const dynamic = "force-dynamic";

interface MockTransaction {
  id: number;
  orderId: number;
  staff: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  createdAt: string;
}

const MOCK_TRANSACTIONS: MockTransaction[] = [
  { id: 1, orderId: 4, staff: "Ana Reyes",      amount: 960,  method: "CASH",  status: "PAID",     createdAt: "2026-09-13T10:30:00" },
  { id: 2, orderId: 3, staff: "Liza Bautista",  amount: 220,  method: "QRPH",  status: "PAID",     createdAt: "2026-09-13T10:25:00" },
  { id: 3, orderId: 8, staff: "Ana Reyes",      amount: 115,  method: "CARD",  status: "PAID",     createdAt: "2026-09-13T09:45:00" },
  { id: 4, orderId: 6, staff: "Liza Bautista",  amount: 740,  method: "CASH",  status: "PAID",     createdAt: "2026-09-13T09:20:00" },
  { id: 5, orderId: 2, staff: "Ana Reyes",      amount: 340,  method: "QRPH",  status: "REFUNDED", createdAt: "2026-09-12T16:00:00" },
  { id: 6, orderId: 1, staff: "Liza Bautista",  amount: 580,  method: "CASH",  status: "PAID",     createdAt: "2026-09-12T15:30:00" },
];

const METHOD_LABEL: Record<PaymentMethod, string> = {
  CASH: "Cash",
  CARD: "Card",
  QRPH: "QR Ph",
};

const METHOD_STYLE: Record<PaymentMethod, string> = {
  CASH: "bg-green-100 text-green-800 border-green-200",
  CARD: "bg-blue-100 text-blue-800 border-blue-200",
  QRPH: "bg-purple-100 text-purple-800 border-purple-200",
};

export default async function TransactionsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const role = session.user.role;
  if (role !== "OWNER" && role !== "SUPERVISOR") redirect("/dashboard");

  const totalRevenue = MOCK_TRANSACTIONS
    .filter((t) => t.status === "PAID")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalRefunded = MOCK_TRANSACTIONS
    .filter((t) => t.status === "REFUNDED")
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <DashboardLayout title="Transactions">
      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Transactions", value: MOCK_TRANSACTIONS.length,                                    sub: "today", color: "text-slate-800" },
          { label: "Total Revenue",       value: formatCurrency(totalRevenue),                                sub: "paid",  color: "text-green-700" },
          { label: "Refunded",            value: formatCurrency(totalRefunded),                               sub: "total", color: "text-red-600" },
          { label: "Avg. Order Value",    value: formatCurrency(totalRevenue / (MOCK_TRANSACTIONS.length || 1)), sub: "mean",  color: "text-amber-700" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-xs text-slate-500 mb-1">{s.label}</p>
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-400 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-semibold text-slate-800">Transaction Records</h3>
          <button className="text-sm font-medium text-slate-600 hover:text-slate-900 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors flex items-center gap-1.5">
            ↓ Download CSV
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-5 py-3 text-left font-semibold text-slate-600">Txn ID</th>
                <th className="px-5 py-3 text-left font-semibold text-slate-600">Order</th>
                <th className="px-5 py-3 text-left font-semibold text-slate-600">Staff</th>
                <th className="px-5 py-3 text-left font-semibold text-slate-600">Amount</th>
                <th className="px-5 py-3 text-left font-semibold text-slate-600">Method</th>
                <th className="px-5 py-3 text-left font-semibold text-slate-600">Status</th>
                <th className="px-5 py-3 text-left font-semibold text-slate-600">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {MOCK_TRANSACTIONS.map((txn) => (
                <tr key={txn.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5 font-mono font-semibold text-slate-700">
                    TXN-{String(txn.id).padStart(4, "0")}
                  </td>
                  <td className="px-5 py-3.5 font-mono text-slate-500">
                    ORD-{String(txn.orderId).padStart(4, "0")}
                  </td>
                  <td className="px-5 py-3.5 text-slate-800">{txn.staff}</td>
                  <td className="px-5 py-3.5 font-semibold text-slate-900">
                    {formatCurrency(txn.amount)}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`badge border ${METHOD_STYLE[txn.method]}`}>
                      {METHOD_LABEL[txn.method]}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    {txn.status === "PAID" ? (
                      <span className="badge border bg-green-100 text-green-800 border-green-200">Paid</span>
                    ) : (
                      <span className="badge border bg-red-100 text-red-800 border-red-200">Refunded</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-slate-500 text-xs">{formatDate(txn.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
