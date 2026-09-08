"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { MenuCategory } from "@prisma/client";

interface CategoryTabsProps {
  categories: MenuCategory[];
  selectedCategory: string;
  onSelectCategory: (slug: string) => void;
}

export function CategoryTabs({
  categories,
  selectedCategory,
  onSelectCategory,
}: CategoryTabsProps) {
  return (
    <div className="sticky top-24 z-20 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-4xl mx-auto px-4 py-0">
        <Tabs value={selectedCategory} onValueChange={onSelectCategory}>
          <TabsList className="w-full justify-start bg-transparent border-b border-slate-200 rounded-none h-auto p-0">
            <TabsTrigger
              value="all"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-amber-600 data-[state=active]:bg-transparent px-4 py-3"
            >
              All
            </TabsTrigger>
            {categories.map((category) => (
              <TabsTrigger
                key={category.id}
                value={category.slug}
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-amber-600 data-[state=active]:bg-transparent px-4 py-3"
              >
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
}
