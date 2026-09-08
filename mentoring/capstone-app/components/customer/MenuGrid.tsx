"use client";

import Link from "next/link";
import { ItemCard } from "./ItemCard";
import type { MenuItem, MenuCategory } from "@prisma/client";

interface MenuItemWithRelations extends MenuItem {
  category: MenuCategory;
  variations: any[];
}

interface MenuGridProps {
  items: MenuItemWithRelations[];
  tableId?: string | null;
}

export function MenuGrid({ items, tableId }: MenuGridProps) {
  const queryString = tableId ? `?tableId=${tableId}` : "";

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {items.map((item) => (
        <Link
          key={item.id}
          href={`/menu/${item.id}${queryString}`}
        >
          <ItemCard item={item} />
        </Link>
      ))}
    </div>
  );
}
