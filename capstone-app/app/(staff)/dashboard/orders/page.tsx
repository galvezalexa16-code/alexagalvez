import { DashboardLayout } from "@/components/staff/layout/DashboardLayout";
import { OrderStatusBadge } from "@/components/staff/orders/OrderStatusBadge";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { OrderStatus, OrderType } from "@/types";

export const dynamic = "force-dynamic";

interface MockOrder {
  id: number;
  table: string | null;
  type: OrderType;
  status: OrderStatus;
  totalAmount: number;
  itemCount: number;
  createdAt: string;
}

const MOCK_ORDERS: MockOrder[] = [
  { id: 1, table: "Table 3",   type: "DINE_IN",  status: "PENDING",   totalAmount: 580,  itemCount: 3, createdAt: "2026-09-13T10:05:00" },
  { id: 2, table: "Table 7",   type: "DINE_IN",  status: "PREPARING", totalAmount: 340,  itemCount: 2, createdAt: "2026-09-13T10:12:00" },
  { id: 3, table: null,        type: "TAKE_OUT", status: "READY",     totalAmount: 220,  itemCount: 1, createdAt: "2026-09-13T10:18:00" },
  { id: 4, table: "Table 1",   type: "DINE_IN",  status: "COMPLETED", totalAmount: 960,  itemCount: 5, createdAt: "2026-09-13T09:55:00" },
  { id: 5, table: null,        type: "TAKE_OUT", status: "CANCELLED", totalAmount: 180,  itemCount: 1, createdAt: "2026-09-13T09:40:00" },
  { id: 6, table: "Table 5",   type: "DINE_IN",  status: "PENDING",   totalAmount: 740,  itemCount: 4, createdAt: "2026-09-13T10:22:00" },
  { id: 7, table: "Table 2",   type: "DINE_IN",  status: "PREPARING", totalAmount: 295,  itemCount: 2, createdAt: "2026-09-13T10:25:00" },
  { id: 8, table: null,        type: "TAKE_OUT", status: "COMPLETED", totalAmount: 115,  itemCount: 1, createdAt: "2026-09-13T09:30:00" },
];

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

  const filteredOrders =
    activeFilter === ("ALL" as string)
      ? MOCK_ORDERS
      : MOCK_ORDERS.filter((o) => o.status === (activeFilter as OrderStatus));

  const pendingCount = MOCK_ORDERS.filter((o) => o.status === "PENDING").length;

  return (
    <DashboardLayout title="Orders">
      {/* Summary row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Today",   value: MOCK_ORDERS.length,                          color: "text-slate-800" },
          { label: "Pending",       value: pendingCount,                                 color: "text-yellow-600" },
          { label: "In Progress",   value: MOCK_ORDERS.filter(o => o.status === "PREPARING").length, color: "text-blue-600" },
          { label: "Completed",     value: MOCK_ORDERS.filter(o => o.status === "COMPLETED").length, color: "text-green-600" },
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
              <a
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
              </a>
            );
          })}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-5 py-3 text-left font-semibold text-slate-600">Order ID</th>
                <th className="px-5 py-3 text-left font-semibold text-slate-600">Table / Type</th>
                <th className="px-5 py-3 text-left font-semibold text-slate-600">Items</th>
                <th className="px-5 py-3 text-left font-semibold text-slate-600">Total</th>
                <th className="px-5 py-3 text-left font-semibold text-slate-600">Status</th>
                <th className="px-5 py-3 text-left font-semibold text-slate-600">Time</th>
                <th className="px-5 py-3 text-left font-semibold text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                    No orders found for this status.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3.5 font-mono font-semibold text-slate-800">
                      ORD-{String(order.id).padStart(4, "0")}
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-slate-800 font-medium">
                        {order.table ?? "Walk-in"}
                      </p>
                      <p className="text-xs text-slate-400">
                        {order.type === "DINE_IN" ? "Dine-in" : "Take-out"}
                      </p>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">{order.itemCount}</td>
                    <td className="px-5 py-3.5 font-semibold text-slate-900">
                      {formatCurrency(order.totalAmount)}
                    </td>
                    <td className="px-5 py-3.5">
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 text-xs">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-5 py-3.5">
                      {order.status === "PENDING" && (
                        <button className="text-xs font-medium text-amber-600 hover:text-amber-700 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 rounded-md transition-colors">
                          Mark Preparing
                        </button>
                      )}
                      {order.status === "PREPARING" && (
                        <button className="text-xs font-medium text-green-600 hover:text-green-700 px-3 py-1.5 bg-green-50 hover:bg-green-100 rounded-md transition-colors">
                          Mark Ready
                        </button>
                      )}
                      {(order.status === "READY" || order.status === "COMPLETED" || order.status === "CANCELLED") && (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
