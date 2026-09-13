import { cn } from "@/lib/utils";
import type { StockStatus } from "@/types";

const STATUS_CONFIG: Record<StockStatus, { label: string; className: string }> = {
  GOOD:         { label: "Good",         className: "bg-green-100 text-green-800 border-green-200" },
  LOW:          { label: "Low",          className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  OUT_OF_STOCK: { label: "Out of Stock", className: "bg-red-100 text-red-800 border-red-200" },
};

export function StockStatusBadge({ status }: { status: StockStatus }) {
  const config = STATUS_CONFIG[status];
  return (
    <span className={cn("badge border", config.className)}>
      {config.label}
    </span>
  );
}
