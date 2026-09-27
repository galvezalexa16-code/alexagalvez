import { DashboardLayout } from "@/components/staff/layout/DashboardLayout";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";
import { TransactionsClient } from "./TransactionsClient";

export const dynamic = "force-dynamic";

export default async function TransactionsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const role = session.user.role;
  if (role !== "OWNER" && role !== "SUPERVISOR") redirect("/dashboard");

  const transactions = await db.transaction.findMany({
    include: {
      staff: { select: { name: true } },
      order: { select: { id: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const serialized = transactions.map((t) => ({
    id: t.id,
    orderId: t.order.id,
    staff: t.staff.name,
    amount: Number(t.amountPaid),
    method: t.paymentMethod,
    status: t.status,
    createdAt: t.createdAt.toISOString(),
  }));

  const totalRevenue = serialized
    .filter((t) => t.status === "PAID")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalRefunded = serialized
    .filter((t) => t.status === "REFUNDED")
    .reduce((sum, t) => sum + t.amount, 0);

  const avgOrder = totalRevenue / (serialized.filter((t) => t.status === "PAID").length || 1);

  return (
    <DashboardLayout title="Transactions">
      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Transactions", value: serialized.length,           sub: "all time", color: "text-slate-800" },
          { label: "Total Revenue",       value: formatCurrency(totalRevenue), sub: "paid",    color: "text-green-700" },
          { label: "Refunded",            value: formatCurrency(totalRefunded),sub: "total",   color: "text-red-600" },
          { label: "Avg. Order Value",    value: formatCurrency(avgOrder),    sub: "mean",     color: "text-amber-700" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-xs text-slate-500 mb-1">{s.label}</p>
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-400 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      <TransactionsClient transactions={serialized} />
    </DashboardLayout>
  );
}
