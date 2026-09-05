import { PackageX, AlertTriangle, CheckCircle2 } from "lucide-react";
import { STOCK_STATUS_COLORS } from "@/types";

interface InventoryStatusCardProps {
  status: "GOOD" | "LOW" | "OUT_OF_STOCK";
  count: number;
  label: string;
}

export function InventoryStatusCard({ status, count, label }: InventoryStatusCardProps) {
  const iconMap = {
    GOOD: <CheckCircle2 className="text-green-600" size={24} />,
    LOW: <AlertTriangle className="text-yellow-600" size={24} />,
    OUT_OF_STOCK: <PackageX className="text-red-600" size={24} />,
  };

  const bgMap = {
    GOOD: "bg-green-50 border-green-100",
    LOW: "bg-yellow-50 border-yellow-100",
    OUT_OF_STOCK: "bg-red-50 border-red-100",
  };

  return (
    <div className={`p-5 rounded-xl border ${bgMap[status]} flex items-center gap-4`}>
      <div className={`p-3 rounded-lg bg-white shadow-sm`}>
        {iconMap[status]}
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-800 leading-none">{count}</p>
        <p className="text-sm font-medium text-slate-600 mt-1">{label}</p>
      </div>
    </div>
  );
}
