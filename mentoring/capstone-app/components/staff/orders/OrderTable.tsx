"use client";

import { useState } from "react";
import { formatCurrency, generateOrderId, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChefHat, Clock, Package, CheckCircle2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Order } from "@prisma/client";

interface OrderWithItems extends Order {
  items: any[];
  transaction: any;
  table: any;
}

interface OrderTableProps {
  orders: OrderWithItems[];
  onStatusChange?: () => void;
}

const statusConfig = {
  PENDING: {
    icon: Clock,
    label: "Pending",
    color: "text-yellow-600",
    nextStatus: "PREPARING",
  },
  PREPARING: {
    icon: ChefHat,
    label: "Preparing",
    color: "text-blue-600",
    nextStatus: "READY",
  },
  READY: {
    icon: Package,
    label: "Ready",
    color: "text-green-600",
    nextStatus: "COMPLETED",
  },
  COMPLETED: {
    icon: CheckCircle2,
    label: "Completed",
    color: "text-slate-600",
    nextStatus: null,
  },
};

export function OrderTable({ orders, onStatusChange }: OrderTableProps) {
  const [updating, setUpdating] = useState<number | null>(null);

  const handleStatusUpdate = async (orderId: number, newStatus: string) => {
    setUpdating(orderId);
    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      toast.success(`Order updated to ${newStatus}`);
      onStatusChange?.();
    } catch (error) {
      toast.error("Failed to update order status");
    } finally {
      setUpdating(null);
    }
  };

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
        <p className="text-slate-500">No orders found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
              Order
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
              Items
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
              Total
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
              Type
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
              Status
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => {
            const config = statusConfig[order.status as keyof typeof statusConfig];
            const StatusIcon = config?.icon || Clock;

            return (
              <tr
                key={order.id}
                className="border-b border-slate-200 hover:bg-slate-50 transition-colors"
              >
                <td className="px-6 py-4">
                  <div>
                    <p className="font-semibold text-slate-900">
                      {generateOrderId(order.id)}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm">
                    {order.items.map((item, idx) => (
                      <p key={idx} className="text-slate-700">
                        {item.quantity}x {item.menuItem.name}
                      </p>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="font-semibold text-amber-600">
                    {formatCurrency(Number(order.totalAmount))}
                  </p>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-slate-700">
                    {order.orderType === "DINE_IN" ? "🍽️ Dine In" : "📦 Take Out"}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <StatusIcon className={`w-4 h-4 ${config?.color}`} />
                    <span className={`text-sm font-medium ${config?.color}`}>
                      {config?.label}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {config?.nextStatus ? (
                    <Button
                      onClick={() =>
                        handleStatusUpdate(order.id, config.nextStatus)
                      }
                      disabled={updating === order.id}
                      size="sm"
                      className="bg-amber-600 hover:bg-amber-700"
                    >
                      {updating === order.id ? "Updating..." : "Next"}
                    </Button>
                  ) : (
                    <span className="text-xs text-slate-500">Done</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
