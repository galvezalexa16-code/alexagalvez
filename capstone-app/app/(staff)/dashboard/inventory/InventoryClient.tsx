"use client";

import { useState, useTransition } from "react";
import { formatDate } from "@/lib/utils";
import { StockStatusBadge } from "@/components/staff/inventory/StockStatusBadge";
import {
  createInventoryCategory,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
} from "./actions";
import { Loader2, X, Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { StockStatus } from "@/types";

interface InventoryCategory {
  id: number;
  name: string;
}

export interface InventoryItemRow {
  id: number;
  name: string;
  category: { id: number; name: string };
  stockQuantity: number;
  unit: string;
  supplier: string;
  expiryDate: string | null;
  status: StockStatus;
  updatedBy: string;
  updatedAt: string;
}

interface InventoryClientProps {
  items: InventoryItemRow[];
  categories: InventoryCategory[];
  searchQuery?: string;
}

// ── Add Category Modal ────────────────────────────────────────────────────────
function AddCategoryModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: (name: string) => void }) {
  const [name, setName] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    startTransition(async () => {
      try {
        await createInventoryCategory(name.trim());
        toast.success(`Category "${name.trim()}" added.`);
        onSuccess(name.trim());
        onClose();
      } catch (err: any) {
        toast.error(err?.message ?? "Failed to add category.");
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-slate-900">Add Category</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400">
            <X size={16} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Category Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Dairy, Pasta, Syrups"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              autoFocus
            />
          </div>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending || !name.trim()}
              className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-slate-900 font-semibold text-sm transition-colors flex items-center justify-center gap-2"
            >
              {isPending && <Loader2 size={14} className="animate-spin" />}
              Add Category
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Stock Item Modal ──────────────────────────────────────────────────────────
function StockItemModal({
  item,
  categories,
  onClose,
}: {
  item: InventoryItemRow | null;
  categories: InventoryCategory[];
  onClose: () => void;
}) {
  const isEdit = !!item;
  const [name, setName] = useState(item?.name ?? "");
  const [categoryId, setCategoryId] = useState<number>(item?.category.id ?? (categories[0]?.id ?? 0));
  const [stockQuantity, setStockQuantity] = useState<string>(item ? String(item.stockQuantity) : "");
  const [unit, setUnit] = useState(item?.unit ?? "kg");
  const [supplier, setSupplier] = useState(item?.supplier ?? "");
  const [expiryDate, setExpiryDate] = useState(item?.expiryDate ? item.expiryDate.substring(0, 10) : "");
  const [status, setStatus] = useState<StockStatus>(item?.status ?? "GOOD");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseFloat(stockQuantity);
    if (!name.trim() || isNaN(qty) || !supplier.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }
    startTransition(async () => {
      try {
        const payload = {
          name: name.trim(),
          categoryId,
          stockQuantity: qty,
          unit,
          supplier: supplier.trim(),
          expiryDate: expiryDate || null,
          status,
        };
        if (isEdit && item) {
          await updateInventoryItem({ id: item.id, ...payload });
          toast.success("Item updated.");
        } else {
          await createInventoryItem(payload);
          toast.success("Stock item added.");
        }
        onClose();
      } catch (err: any) {
        toast.error(err?.message ?? "Something went wrong.");
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
          <h2 className="font-bold text-slate-900">{isEdit ? "Update Stock Item" : "Add Stock Item"}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400">
            <X size={16} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4 overflow-y-auto flex-1">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Ingredient Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Penne Pasta"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Category *</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Status *</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as StockStatus)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white"
              >
                <option value="GOOD">Good</option>
                <option value="LOW">Low</option>
                <option value="OUT_OF_STOCK">Out of Stock</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Stock Quantity *</label>
              <input
                type="number"
                step="0.001"
                min="0"
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value)}
                placeholder="0.0"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Unit *</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white"
              >
                {["kg", "g", "L", "mL", "pcs", "box", "pack", "bottle", "can", "sachet"].map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Supplier *</label>
              <input
                type="text"
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                placeholder="e.g. Selecta Foods"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                required
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Expiry Date (optional)</label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
          </div>
        </form>
        <div className="px-6 pb-5 flex gap-2 shrink-0">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-colors">
            Cancel
          </button>
          <button
            onClick={(e) => {
              const form = (e.currentTarget.closest(".max-h-\\[90vh\\]") as HTMLElement)?.querySelector("form");
              form?.requestSubmit();
            }}
            disabled={isPending}
            className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-slate-900 font-semibold text-sm transition-colors flex items-center justify-center gap-2"
          >
            {isPending && <Loader2 size={14} className="animate-spin" />}
            {isEdit ? "Update Item" : "Add Item"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export function InventoryClient({ items, categories }: InventoryClientProps) {
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [stockModal, setStockModal] = useState<{ open: boolean; item: InventoryItemRow | null }>({ open: false, item: null });
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();

  const filtered = items.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.supplier.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (id: number, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    startTransition(async () => {
      try {
        await deleteInventoryItem(id);
        toast.success(`"${name}" deleted.`);
      } catch {
        toast.error("Failed to delete item.");
      }
    });
  };

  return (
    <>
      {/* Top bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-sm">🔍</span>
          <input
            type="text"
            placeholder="Search ingredients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent w-64"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCategoryModal(true)}
            className="text-sm font-medium text-slate-600 hover:text-slate-900 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5"
          >
            <Plus size={14} />
            Add Category
          </button>
          <button
            onClick={() => setStockModal({ open: true, item: null })}
            className="bg-amber-500 hover:bg-amber-400 text-slate-900 px-4 py-2 rounded-lg font-medium shadow-sm transition-colors text-sm flex items-center gap-1.5"
          >
            <Plus size={14} />
            Add Stock
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-5 py-3 text-left font-semibold text-slate-600">Ingredient</th>
              <th className="px-5 py-3 text-left font-semibold text-slate-600">Category</th>
              <th className="px-5 py-3 text-left font-semibold text-slate-600">Stock</th>
              <th className="px-5 py-3 text-left font-semibold text-slate-600">Supplier</th>
              <th className="px-5 py-3 text-left font-semibold text-slate-600">Expiry</th>
              <th className="px-5 py-3 text-left font-semibold text-slate-600">Status</th>
              <th className="px-5 py-3 text-left font-semibold text-slate-600">Updated By</th>
              <th className="px-5 py-3 text-left font-semibold text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-5 py-12 text-center text-slate-400">
                  {search ? "No items match your search." : "No ingredients yet. Click \"Add Stock\" to get started."}
                </td>
              </tr>
            ) : (
              filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5 font-medium text-slate-800">{item.name}</td>
                  <td className="px-5 py-3.5 text-slate-500">{item.category.name}</td>
                  <td className="px-5 py-3.5 font-semibold text-slate-800">
                    {item.stockQuantity} {item.unit}
                  </td>
                  <td className="px-5 py-3.5 text-slate-500">{item.supplier}</td>
                  <td className="px-5 py-3.5 text-slate-500 text-xs">
                    {item.expiryDate ? formatDate(item.expiryDate) : "—"}
                  </td>
                  <td className="px-5 py-3.5">
                    <StockStatusBadge status={item.status} />
                  </td>
                  <td className="px-5 py-3.5 text-slate-500">{item.updatedBy}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setStockModal({ open: true, item })}
                        disabled={isPending}
                        className="text-xs font-medium text-slate-600 hover:text-slate-900 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors flex items-center gap-1 disabled:opacity-60"
                      >
                        <Pencil size={11} />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item.id, item.name)}
                        disabled={isPending}
                        className="text-xs font-medium text-red-500 hover:text-red-700 px-2.5 py-1.5 hover:bg-red-50 rounded-md transition-colors flex items-center gap-1 disabled:opacity-60"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      {showCategoryModal && (
        <AddCategoryModal
          onClose={() => setShowCategoryModal(false)}
          onSuccess={() => {}}
        />
      )}
      {stockModal.open && (
        <StockItemModal
          item={stockModal.item}
          categories={categories}
          onClose={() => setStockModal({ open: false, item: null })}
        />
      )}
    </>
  );
}
