"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { MenuGrid } from "@/components/customer/MenuGrid";
import { CategoryTabs } from "@/components/customer/CategoryTabs";
import { CartSheet } from "@/components/customer/CartSheet";
import { useCart } from "@/lib/cart-store";
import { ShoppingBag, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { MenuItem, MenuCategory } from "@prisma/client";

interface MenuItemWithRelations extends MenuItem {
  category: MenuCategory;
  variations: any[];
}

export default function MenuPage() {
  const searchParams = useSearchParams();
  const tableId = searchParams.get("tableId");
  const [menuItems, setMenuItems] = useState<MenuItemWithRelations[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [cartOpen, setCartOpen] = useState(false);
  const cart = useCart();

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        
        if (selectedCategory !== "all") {
          params.append("category", selectedCategory);
        }
        if (searchQuery) {
          params.append("search", searchQuery);
        }

        const response = await fetch(`/api/menu?${params.toString()}`);
        const data = await response.json();
        
        setMenuItems(data);
        
        // Extract unique categories
        if (selectedCategory === "all") {
          const uniqueCategories = Array.from(
            new Map(data.map((item: MenuItemWithRelations) => [item.category.id, item.category])).values()
          );
          setCategories(uniqueCategories);
        }
      } catch (error) {
        console.error("Failed to fetch menu:", error);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchMenu, 300);
    return () => clearTimeout(debounce);
  }, [selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Ericahticos Cafe</h1>
              <p className="text-sm text-slate-500">
                {tableId ? `Table ${tableId}` : "Walk-in Order"}
              </p>
            </div>
            <button
              onClick={() => setCartOpen(true)}
              className="relative inline-flex items-center justify-center p-2 rounded-lg bg-amber-100 hover:bg-amber-200 transition-colors"
            >
              <ShoppingBag className="w-6 h-6 text-amber-700" />
              {cart.items.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cart.items.length}
                </span>
              )}
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search menu items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-50 border-slate-200"
            />
          </div>
        </div>
      </header>

      {/* Category Tabs */}
      {categories.length > 0 && (
        <CategoryTabs
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
      )}

      {/* Menu Grid */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
            </div>
            <p className="mt-4 text-slate-500">Loading menu...</p>
          </div>
        ) : menuItems.length > 0 ? (
          <MenuGrid items={menuItems} tableId={tableId} />
        ) : (
          <div className="text-center py-12">
            <p className="text-slate-500">No items found matching your search</p>
          </div>
        )}
      </main>

      {/* Cart Sheet */}
      <CartSheet open={cartOpen} onOpenChange={setCartOpen} tableId={tableId} />
    </div>
  );
}
