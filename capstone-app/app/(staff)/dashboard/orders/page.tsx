import { DashboardLayout } from "@/components/staff/layout/DashboardLayout";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { OrdersClient } from "./OrdersClient";
import Link from "next/link";
import type { OrderStatus } from "@/types";

export const dynamic = "force-dynamic";

const STATUS_TABS: { key: string; label: string; filter: OrderStatus | "ALL" }[] = [
  { key: "all",       label: "All",       filter: "ALL" },
  { key: "pending",   label: "Pending",   filter: "PENDING" },
  { key: "preparing", label: "Preparing", filter: "PREPARING" },
  { key: "ready",     label: "Ready",     filter: "READY" },
  { key: "completed", label: "Completed", filter: "COMPLETED" },
];

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const role = session.user.role;
  if (role !== "OWNER" && role !== "SUPERVISOR") redirect("/dashboard");

  const params = await searchParams;
  const activeFilter: OrderStatus | "ALL" = (params.status?.toUpperCase() as OrderStatus) || "ALL";

  // Real DB query
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const whereStatus = (activeFilter as string) === "ALL"
    ? {}
    : { status: activeFilter as OrderStatus };

  const [orders, allTodayOrders] = await Promise.all([
    db.order.findMany({
      where: {
        ...whereStatus,
        createdAt: { gte: today },
      },
      include: {
        table: true,
        items: {
          include: { menuItem: true, variation: true },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.order.findMany({
      where: { createdAt: { gte: today } },
      select: { status: true },
    }),
  ]);

  const pendingCount    = allTodayOrders.filter((o) => o.status === "PENDING").length;
  const preparingCount  = allTodayOrders.filter((o) => o.status === "PREPARING").length;
  const completedCount  = allTodayOrders.filter((o) => o.status === "COMPLETED").length;

  const serialized = orders.map((o) => ({
    id: o.id,
    orderId: `ORD-${String(o.id).padStart(4, "0")}`,
    status: o.status,
    orderType: o.orderType,
    totalAmount: Number(o.totalAmount),
    table: o.table?.name ?? null,
    createdAt: o.createdAt.toISOString(),
    items: o.items.map((i) => ({
      name: i.menuItem.name,
      variation: i.variation?.name ?? null,
      quantity: i.quantity,
      unitPrice: Number(i.unitPrice),
    })),
  }));

  return (
    <DashboardLayout title="Orders">
      {/* Summary row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Today",  value: allTodayOrders.length, color: "text-slate-800" },
          { label: "Pending",      value: pendingCount,           color: "text-yellow-600" },
          { label: "In Progress",  value: preparingCount,         color: "text-blue-600" },
          { label: "Completed",    value: completedCount,         color: "text-green-600" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-xs text-slate-500 mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Status filter tabs */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="flex border-b border-slate-200 overflow-x-auto">
          {STATUS_TABS.map((tab) => {
            const isActive =
              tab.filter === "ALL"
                ? activeFilter === ("ALL" as string)
                : activeFilter === (tab.filter as string);
            return (
              <Link
                key={tab.key}
                href={tab.filter === "ALL" ? "/dashboard/orders" : `/dashboard/orders?status=${tab.key}`}
                className={`px-5 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  isActive
                    ? "border-amber-500 text-amber-600 bg-amber-50"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                }`}
              >
                {tab.label}
                {tab.filter === "PENDING" && pendingCount > 0 && (
                  <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold bg-amber-500 text-white rounded-full">
                    {pendingCount}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        <OrdersClient orders={serialized} />
      </div>
    </DashboardLayout>
  );
}
