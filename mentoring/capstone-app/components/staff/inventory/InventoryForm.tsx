"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import type { InventoryItem, InventoryCategory } from "@prisma/client";

interface InventoryFormProps {
  categories: InventoryCategory[];
  item?: InventoryItem & { category: InventoryCategory };
  onSubmit?: () => void;
  onCancel?: () => void;
}

export function InventoryForm({
  categories,
  item,
  onSubmit,
  onCancel,
}: InventoryFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: item?.name || "",
    categoryId: item?.categoryId?.toString() || categories[0]?.id?.toString() || "",
    stockQuantity: item?.stockQuantity?.toString() || "",
    unit: item?.unit || "pcs",
    supplier: item?.supplier || "",
    expiryDate: item?.expiryDate
      ? new Date(item.expiryDate).toISOString().split("T")[0]
      : "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        categoryId: parseInt(formData.categoryId),
        stockQuantity: parseFloat(formData.stockQuantity),
        unit: formData.unit,
        supplier: formData.supplier,
        expiryDate: formData.expiryDate
          ? new Date(formData.expiryDate).toISOString()
          : null,
      };

      const url = item
        ? `/api/inventory/${item.id}`
        : "/api/inventory";
      const method = item ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to save inventory item");
      }

      toast.success(
        item ? "Inventory item updated" : "Inventory item created"
      );
      onSubmit?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Item Name
        </label>
        <Input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., Fresh Milk"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Category
          </label>
          <select
            value={formData.categoryId}
            onChange={(e) =>
              setFormData({ ...formData, categoryId: e.target.value })
            }
            className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
            required
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Unit
          </label>
          <Input
            type="text"
            value={formData.unit}
            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
            placeholder="e.g., pcs, kg, L"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Stock Quantity
          </label>
          <Input
            type="number"
            step="0.01"
            value={formData.stockQuantity}
            onChange={(e) =>
              setFormData({ ...formData, stockQuantity: e.target.value })
            }
            placeholder="0"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Supplier
          </label>
          <Input
            type="text"
            value={formData.supplier}
            onChange={(e) =>
              setFormData({ ...formData, supplier: e.target.value })
            }
            placeholder="e.g., Local Dairy"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Expiry Date (Optional)
        </label>
        <Input
          type="date"
          value={formData.expiryDate}
          onChange={(e) =>
            setFormData({ ...formData, expiryDate: e.target.value })
          }
        />
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="flex-1 bg-amber-600 hover:bg-amber-700"
        >
          {loading ? "Saving..." : item ? "Update" : "Add Item"}
        </Button>
      </div>
    </form>
  );
}
