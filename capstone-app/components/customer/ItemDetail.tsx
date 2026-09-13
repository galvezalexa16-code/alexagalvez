"use client";

import { useState } from "react";
import Image from "next/image";
import { Plus, Minus } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface Variation {
  id: string | number;
  name: string;
  priceMod: number | string;
}

interface MenuItem {
  name: string;
  price: number | string;
  imageUrl: string;
  variations?: Variation[];
}

interface ItemDetailProps {
  item: MenuItem;
}

export function ItemDetail({ item }: ItemDetailProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedVariation, setSelectedVariation] = useState<Variation | null>(
    item.variations && item.variations.length > 0 ? item.variations[0] : null
  );

  const basePrice = Number(item.price);
  const varPrice = selectedVariation ? Number(selectedVariation.priceMod) : 0;
  const totalPrice = (basePrice + varPrice) * quantity;

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="relative w-full h-64 bg-slate-100">
        <Image
          src={item.imageUrl}
          alt={item.name}
          fill
          className="object-cover"
        />
      </div>

      <div className="flex-1 p-6 flex flex-col">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">{item.name}</h1>
          <p className="text-xl font-medium text-amber-600 mt-2">
            {formatCurrency(basePrice + varPrice)}
          </p>
        </div>

        {(item.variations?.length ?? 0) > 0 && (
          <div className="mb-8">
            <h3 className="text-sm font-medium text-slate-700 mb-3">Options</h3>
            <div className="flex flex-wrap gap-2">
              {(item.variations ?? []).map((v: Variation) => (
                <button
                  key={v.id}
                  onClick={() => setSelectedVariation(v)}
                  className={`px-4 py-2 text-sm font-medium rounded-full border transition-all ${
                    selectedVariation?.id === v.id
                      ? "border-amber-500 bg-amber-50 text-amber-700"
                      : "border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
                >
                  {v.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-auto pt-6 border-t border-slate-100 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 bg-slate-100 rounded-full px-2 py-1">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm text-slate-600 hover:text-slate-900 transition-colors"
            >
              <Minus size={18} />
            </button>
            <span className="w-6 text-center font-semibold text-slate-900">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm text-slate-600 hover:text-slate-900 transition-colors"
            >
              <Plus size={18} />
            </button>
          </div>

          <button className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold py-3.5 px-6 rounded-full shadow-md transition-colors flex items-center justify-between">
            <span>Add to Cart</span>
            <span>{formatCurrency(totalPrice)}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
