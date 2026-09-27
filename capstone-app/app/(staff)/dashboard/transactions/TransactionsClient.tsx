"use client";

import { formatCurrency, formatDate } from "@/lib/utils";
import type { PaymentMethod, PaymentStatus } from "@/types";

export interface TransactionRow {
  id: number;
  orderId: number;
  staff: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  createdAt: string;
}

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

function downloadCSV(transactions: TransactionRow[]) {
  const headers = ["Txn ID", "Order", "Staff", "Amount (PHP)", "Method", "Status", "Date"];
  const rows = transactions.map((t) => [
    `TXN-${String(t.id).padStart(4, "0")}`,
    `ORD-${String(t.orderId).padStart(4, "0")}`,
    t.staff,
    t.amount.toFixed(2),
    METHOD_LABEL[t.method],
    t.status,
    new Date(t.createdAt).toLocaleString("en-PH"),
  ]);

  const csv = [headers, ...rows].map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `transactions-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

interface TransactionsClientProps {
  transactions: TransactionRow[];
}

export function TransactionsClient({ transactions }: TransactionsClientProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
        <h3 className="font-semibold text-slate-800">Transaction Records</h3>
        <button
          onClick={() => downloadCSV(transactions)}
          className="text-sm font-medium text-slate-600 hover:text-slate-900 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors flex items-center gap-1.5"
        >
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
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                  No transactions recorded yet.
                </td>
              </tr>
            ) : (
              transactions.map((txn) => (
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
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
