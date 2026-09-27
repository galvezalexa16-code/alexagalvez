"use client";

import { useState, useTransition } from "react";
import { formatCurrency } from "@/lib/utils";
import { MenuFormModal } from "@/components/staff/menu/MenuFormModal";
import { createMenuItem, updateMenuItem, archiveMenuItem } from "./actions";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface MenuItem {
  id: number;
  name: string;
  price: number;
  imageUrl: string | null;
  isArchived: boolean;
  category: { id: number; name: string };
}

interface Category {
  id: number;
  name: string;
}

interface MenuClientViewProps {
  initialItems: MenuItem[];
  categories: Category[];
}

export function MenuClientView({ initialItems, categories }: MenuClientViewProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleOpenAdd = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: MenuItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleSubmit = (data: any) => {
    startTransition(async () => {
      try {
        if (editingItem) {
          await updateMenuItem({
            id: data.id,
            name: data.name,
            price: data.price,
            categoryId: data.categoryId,
            imageUrl: data.imageUrl,
            isArchived: data.isArchived,
          });
          toast.success("Menu item updated.");
        } else {
          await createMenuItem({
            name: data.name,
            price: data.price,
            categoryId: data.categoryId,
            imageUrl: data.imageUrl,
          });
          toast.success("Menu item created.");
        }
        setIsModalOpen(false);
      } catch (err: any) {
        toast.error(err?.message ?? "Something went wrong.");
      }
    });
  };

  const handleArchive = (id: number) => {
    if (!confirm("Archive this menu item? It will be hidden from orders.")) return;
    startTransition(async () => {
      try {
        await archiveMenuItem(id);
        toast.success("Menu item archived.");
      } catch {
        toast.error("Failed to archive item.");
      }
    });
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-slate-800">Menu Items</h2>
        <button
          onClick={handleOpenAdd}
          disabled={isPending}
          className="bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-slate-900 px-4 py-2 rounded-lg font-semibold shadow-sm transition-colors text-sm flex items-center gap-2"
        >
          {isPending ? <Loader2 size={14} className="animate-spin" /> : null}
          + Add Item
        </button>
      </div>

      {initialItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400 bg-white rounded-xl border border-slate-200">
          <p className="text-lg font-medium">No menu items yet</p>
          <p className="text-sm mt-1">Click &quot;+ Add Item&quot; to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {initialItems.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col"
            >
              <div className="h-40 bg-slate-100 relative shrink-0">
                {item.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                    <span className="text-sm font-medium">No Image</span>
                  </div>
                )}
                {item.isArchived && (
                  <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center">
                    <span className="bg-slate-800 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      Archived
                    </span>
                  </div>
                )}
              </div>
              <div className="p-4 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-2 gap-2">
                  <h3 className="font-semibold text-slate-900 line-clamp-2 leading-tight">{item.name}</h3>
                  <span className="font-bold text-amber-600 shrink-0">{formatCurrency(item.price)}</span>
                </div>
                <div className="mt-auto">
                  <p className="text-xs text-slate-500 mb-4 px-2 py-1 bg-slate-100 inline-block rounded-md font-medium">
                    {item.category.name}
                  </p>
                  <div className="flex gap-2 pt-3 border-t border-slate-100 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      disabled={isPending}
                      className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors flex-1 disabled:opacity-60"
                    >
                      Edit
                    </button>
                    {!item.isArchived && (
                      <button
                        onClick={() => handleArchive(item.id)}
                        disabled={isPending}
                        className="text-xs font-semibold text-red-500 hover:text-red-700 px-3 py-2 hover:bg-red-50 rounded-md transition-colors disabled:opacity-60"
                      >
                        Archive
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <MenuFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        item={editingItem}
        categories={categories}
        onSubmit={handleSubmit}
      />
    </>
  );
}
