"use client";

import { useState, useTransition } from "react";
import { OrderStatusBadge } from "@/components/staff/orders/OrderStatusBadge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { updateOrderStatus } from "./actions";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { OrderStatus, OrderType } from "@/types";

interface OrderItem {
  name: string;
  variation: string | null;
  quantity: number;
  unitPrice: number;
}

export interface OrderRow {
  id: number;
  orderId: string;
  status: OrderStatus;
  orderType: OrderType;
  totalAmount: number;
  table: string | null;
  createdAt: string;
  items: OrderItem[];
}

interface OrdersClientProps {
  orders: OrderRow[];
}

function OrderDetailModal({ order, onClose }: { order: OrderRow; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-slate-900 text-lg">{order.orderId}</h2>
            <p className="text-xs text-slate-400">
              {order.table ?? "Walk-in"} · {order.orderType === "DINE_IN" ? "Dine-in" : "Take-out"}
            </p>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>
        <div className="px-6 py-4 max-h-72 overflow-y-auto space-y-2">
          {order.items.map((item, i) => (
            <div key={i} className="flex justify-between text-sm py-1 border-b border-slate-50 last:border-0">
              <div>
                <span className="font-medium text-slate-800">{item.name}</span>
                {item.variation && <span className="text-slate-400 ml-1">({item.variation})</span>}
                <span className="text-slate-400 ml-2">×{item.quantity}</span>
              </div>
              <span className="text-slate-700 font-semibold">{formatCurrency(item.unitPrice * item.quantity)}</span>
            </div>
          ))}
        </div>
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-sm text-slate-500">Total</span>
          <span className="font-bold text-slate-900 text-lg">{formatCurrency(order.totalAmount)}</span>
        </div>
        <div className="px-6 pb-5">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function StatusActionButton({ order, onSuccess }: { order: OrderRow; onSuccess: () => void }) {
  const [isPending, startTransition] = useTransition();

  const advance = () => {
    const next: OrderStatus | null =
      order.status === "PENDING" ? "PREPARING" :
      order.status === "PREPARING" ? "READY" :
      order.status === "READY" ? "COMPLETED" : null;

    if (!next) return;

    startTransition(async () => {
      try {
        await updateOrderStatus(order.id, next);
        toast.success(`Order marked as ${next.charAt(0) + next.slice(1).toLowerCase().replace("_", " ")}`);
        onSuccess();
      } catch {
        toast.error("Failed to update order status.");
      }
    });
  };

  if (order.status === "COMPLETED" || order.status === "CANCELLED") {
    return <span className="text-xs text-slate-400">—</span>;
  }

  const labels: Record<string, string> = {
    PENDING: "Mark Preparing",
    PREPARING: "Mark Ready",
    READY: "Mark Completed",
  };

  const styles: Record<string, string> = {
    PENDING: "text-amber-600 bg-amber-50 hover:bg-amber-100",
    PREPARING: "text-green-600 bg-green-50 hover:bg-green-100",
    READY: "text-blue-600 bg-blue-50 hover:bg-blue-100",
  };

  return (
    <button
      onClick={advance}
      disabled={isPending}
      className={`text-xs font-medium px-3 py-1.5 rounded-md transition-colors disabled:opacity-60 flex items-center gap-1.5 ${styles[order.status]}`}
    >
      {isPending && <Loader2 size={11} className="animate-spin" />}
      {labels[order.status]}
    </button>
  );
}

export function OrdersClient({ orders: initialOrders }: OrdersClientProps) {
  const [orders, setOrders] = useState(initialOrders);
  const [detailOrder, setDetailOrder] = useState<OrderRow | null>(null);

  const refresh = () => window.location.reload();

  return (
    <>
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
            {orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                  No orders found for this status.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5 font-mono font-semibold text-slate-800">
                    <button
                      onClick={() => setDetailOrder(order)}
                      className="hover:text-amber-600 hover:underline transition-colors"
                    >
                      {order.orderId}
                    </button>
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="text-slate-800 font-medium">{order.table ?? "Walk-in"}</p>
                    <p className="text-xs text-slate-400">
                      {order.orderType === "DINE_IN" ? "Dine-in" : "Take-out"}
                    </p>
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">{order.items.length}</td>
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
                    <StatusActionButton order={order} onSuccess={refresh} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {detailOrder && (
        <OrderDetailModal order={detailOrder} onClose={() => setDetailOrder(null)} />
      )}
    </>
  );
}
