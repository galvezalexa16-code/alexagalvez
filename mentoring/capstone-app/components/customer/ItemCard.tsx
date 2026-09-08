"use client";

import Image from "next/image";
import { formatCurrency } from "@/lib/utils";
import type { MenuItem, MenuCategory } from "@prisma/client";

interface ItemCardProps {
  item: MenuItem & { category: MenuCategory };
}

export function ItemCard({ item }: ItemCardProps) {
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
      <div className="relative h-40 bg-slate-100 overflow-hidden">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-100 to-orange-100">
            <span className="text-3xl">☕</span>
          </div>
        )}
        <div className="absolute top-2 right-2 bg-amber-600 text-white text-xs px-2 py-1 rounded-full font-semibold">
          {item.category.name}
        </div>
      </div>

      <div className="p-3">
        <h3 className="font-semibold text-slate-900 text-sm line-clamp-2">
          {item.name}
        </h3>
        <div className="mt-2 flex items-center justify-between">
          <p className="text-lg font-bold text-amber-600">
            {formatCurrency(Number(item.price))}
          </p>
          <button className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold px-3 py-1 rounded transition-colors">
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
