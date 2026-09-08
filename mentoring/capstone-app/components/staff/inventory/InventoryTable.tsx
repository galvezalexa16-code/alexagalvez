"use client";

import { useState } from "react";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2 } from "lucide-react";
import type { InventoryItem, InventoryCategory, User } from "@prisma/client";

interface InventoryItemWithRelations extends InventoryItem {
  category: InventoryCategory;
  updatedBy: User;
}

interface InventoryTableProps {
  items: InventoryItemWithRelations[];
  onEdit?: (item: InventoryItemWithRelations) => void;
  onRefresh?: () => void;
}

const statusConfig = {
  GOOD: { label: "In Stock", color: "bg-green-100 text-green-800" },
  LOW: { label: "Low Stock", color: "bg-yellow-100 text-yellow-800" },
  OUT_OF_STOCK: { label: "Out of Stock", color: "bg-red-100 text-red-800" },
};

export function InventoryTable({
  items,
  onEdit,
  onRefresh,
}: InventoryTableProps) {
  const [updating, setUpdating] = useState<number | null>(null);

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
        <p className="text-slate-500">No inventory items found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
              Ingredient
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
              Category
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
              Stock
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
              Supplier
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
              Status
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
              Updated
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const config =
              statusConfig[item.status as keyof typeof statusConfig];

            return (
              <tr
                key={item.id}
                className="border-b border-slate-200 hover:bg-slate-50 transition-colors"
              >
                <td className="px-6 py-4">
                  <p className="font-semibold text-slate-900">{item.name}</p>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm text-slate-700">{item.category.name}</p>
                </td>
                <td className="px-6 py-4">
                  <p className="font-semibold text-slate-900">
                    {Number(item.stockQuantity)} {item.unit}
                  </p>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm text-slate-700">{item.supplier}</p>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-xs font-semibold px-2 py-1 rounded ${config?.color}`}>
                    {config?.label}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm">
                    <p className="text-slate-700">
                      {formatDate(item.updatedAt)}
                    </p>
                    <p className="text-xs text-slate-500">{item.updatedBy.name}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <Button
                    onClick={() => onEdit?.(item)}
                    size="sm"
                    variant="outline"
                    className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
