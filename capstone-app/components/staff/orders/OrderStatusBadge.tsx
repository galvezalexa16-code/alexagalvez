import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/types";

const STATUS_CONFIG: Record<OrderStatus, { label: string; className: string }> = {
  PENDING:   { label: "Pending",   className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  PREPARING: { label: "Preparing", className: "bg-blue-100 text-blue-800 border-blue-200" },
  READY:     { label: "Ready",     className: "bg-green-100 text-green-800 border-green-200" },
  COMPLETED: { label: "Completed", className: "bg-slate-100 text-slate-700 border-slate-200" },
  CANCELLED: { label: "Cancelled", className: "bg-red-100 text-red-800 border-red-200" },
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const config = STATUS_CONFIG[status];
  return (
    <span className={cn("badge border", config.className)}>
      {config.label}
    </span>
  );
}
