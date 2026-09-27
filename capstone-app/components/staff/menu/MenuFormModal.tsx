"use client";

import { useState, useEffect } from "react";
import { X, CheckCircle2, UploadCloud } from "lucide-react";
import { UploadButton } from "@/lib/uploadthing-client";

interface Category {
  id: number;
  name: string;
}

interface MenuFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  item?: {
    id: number;
    name: string;
    price: number;
    imageUrl: string | null;
    isArchived: boolean;
    category: { id: number; name: string };
  } | null;
  categories: Category[];
  onSubmit: (data: any) => void;
}

export function MenuFormModal({ isOpen, onClose, item, categories, onSubmit }: MenuFormModalProps) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState<number>(categories[0]?.id ?? 0);
  const [imageUrl, setImageUrl] = useState("");
  const [isArchived, setIsArchived] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (item) {
      setName(item.name);
      setPrice(item.price.toString());
      setCategoryId(item.category.id);
      setImageUrl(item.imageUrl || "");
      setIsArchived(item.isArchived);
    } else {
      setName("");
      setPrice("");
      setCategoryId(categories[0]?.id ?? 0);
      setImageUrl("");
      setIsArchived(false);
    }
  }, [item, isOpen, categories]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      id: item?.id,
      name,
      price: parseFloat(price),
      categoryId,
      imageUrl: imageUrl || null,
      isArchived,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="font-semibold text-slate-800 text-base">
            {item ? "Edit Menu Item" : "Add Menu Item"}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors rounded-lg p-1 hover:bg-slate-100"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Image Upload Zone */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Item Image</label>

            {/* Preview */}
            <div className="relative w-full h-36 rounded-xl overflow-hidden border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center group">
              {imageUrl ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageUrl}
                    alt="Menu item preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white text-xs font-semibold">Replace image</span>
                  </div>
                  <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-0.5">
                    <CheckCircle2 size={14} />
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-2 text-slate-400">
                  <UploadCloud size={32} />
                  <span className="text-xs font-medium">No image yet</span>
                </div>
              )}
            </div>

            {/* UploadThing Button */}
            <div className="flex justify-center">
              <UploadButton
                endpoint="menuItemImage"
                onUploadBegin={() => setIsUploading(true)}
                onClientUploadComplete={(res) => {
                  setIsUploading(false);
                  if (res?.[0]?.ufsUrl) {
                    setImageUrl(res[0].ufsUrl);
                  }
                }}
                onUploadError={(err) => {
                  setIsUploading(false);
                  alert(`Upload failed: ${err.message}`);
                }}
                appearance={{
                  button:
                    "bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold text-xs px-4 py-2 rounded-lg transition-colors shadow-sm after:bg-amber-400 ut-uploading:cursor-not-allowed ut-uploading:opacity-70",
                  allowedContent: "text-slate-400 text-xs",
                }}
                content={{
                  button({ ready, isUploading }) {
                    if (isUploading) return "Uploading...";
                    if (!ready) return "Loading...";
                    return imageUrl ? "Replace Image" : "Upload Image";
                  },
                  allowedContent: "Images up to 4MB",
                }}
              />
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Item Name</label>
            <input
              required
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
              placeholder="E.g., Spanish Latte"
            />
          </div>

          {/* Price & Category */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Price (₱)</label>
              <input
                required
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white transition"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Archive toggle (edit only) */}
          {item && (
            <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer hover:bg-slate-100 transition">
              <input
                type="checkbox"
                checked={isArchived}
                onChange={(e) => setIsArchived(e.target.checked)}
                className="w-4 h-4 text-amber-500 border-slate-300 rounded focus:ring-amber-500"
              />
              <div>
                <p className="text-sm font-medium text-slate-700">Archive this item</p>
                <p className="text-xs text-slate-400">Hidden from customer orders when archived</p>
              </div>
            </label>
          )}

          {/* Actions */}
          <div className="pt-2 flex justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isUploading}
              className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="px-5 py-2 text-sm font-semibold text-slate-900 bg-amber-500 hover:bg-amber-400 rounded-lg transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isUploading ? "Uploading…" : item ? "Save Changes" : "Create Item"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
