"use client";

import { useState } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";

interface DishAvailability {
  id: string;
  name: string;
  category: string;
  trackedBy: string;
  remaining: string;
  status: "SOLD_OUT" | "NO_RECIPE" | "SELLABLE";
}

const MOCK_DATA: DishAvailability[] = [
  { id: "1", name: "Spanish Bread", category: "Bread & Pastries", trackedBy: "Counted by hand", remaining: "0 on hand", status: "SOLD_OUT" },
  { id: "2", name: "Butterfly Peach Lemon", category: "Fruit Tea Series", trackedBy: "Nothing yet", remaining: "—", status: "NO_RECIPE" },
  { id: "3", name: "Strawberry & Peach", category: "Fruit Tea Series", trackedBy: "Nothing yet", remaining: "—", status: "NO_RECIPE" },
  { id: "4", name: "Beef Lasagna", category: "Pasta", trackedBy: "Recipe", remaining: "1 servings", status: "SELLABLE" },
  { id: "5", name: "Oreo Cheesecake", category: "Cakes", trackedBy: "Recipe", remaining: "1 servings", status: "SELLABLE" },
  { id: "6", name: "Chicken Baked Macaroni", category: "Pasta", trackedBy: "Recipe", remaining: "2 servings", status: "SELLABLE" },
  { id: "7", name: "Creamy Aligue Pasta", category: "Pasta", trackedBy: "Recipe", remaining: "2 servings", status: "SELLABLE" },
  { id: "8", name: "Penne Ala King Pasta", category: "Pasta", trackedBy: "Recipe", remaining: "2 servings", status: "SELLABLE" },
  { id: "9", name: "Tuna Carbonara", category: "Pasta", trackedBy: "Recipe", remaining: "2 servings", status: "SELLABLE" },
  { id: "10", name: "Danggit Platter", category: "Platter", trackedBy: "Recipe", remaining: "4 servings", status: "SELLABLE" },
  { id: "11", name: "Flavored Americano", category: "Hot Beverages", trackedBy: "Recipe", remaining: "4 servings", status: "SELLABLE" },
  { id: "12", name: "Green Apple Yogurt Smoothie", category: "Yogurt Smoothie", trackedBy: "Recipe", remaining: "4 servings", status: "SELLABLE" },
  { id: "13", name: "Strawberry Shortcake", category: "Cakes", trackedBy: "Recipe", remaining: "4 servings", status: "SELLABLE" },
  { id: "14", name: "Blueberry Cheesecake", category: "Cakes", trackedBy: "Recipe", remaining: "5 servings", status: "SELLABLE" },
  { id: "15", name: "Cashew Sansrival", category: "Cakes", trackedBy: "Recipe", remaining: "5 servings", status: "SELLABLE" },
];

export function MenuAvailabilityTable() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");

  const filtered = MOCK_DATA.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchesCat = category === "ALL" || item.category === category;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mt-6">
      <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <h3 className="font-semibold text-slate-800 text-lg">All dishes (151)</h3>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search dishes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-amber-500 bg-white"
          >
            <option value="ALL">Any category</option>
            <option value="Bread & Pastries">Bread & Pastries</option>
            <option value="Fruit Tea Series">Fruit Tea Series</option>
            <option value="Pasta">Pasta</option>
            <option value="Cakes">Cakes</option>
            <option value="Platter">Platter</option>
            <option value="Hot Beverages">Hot Beverages</option>
            <option value="Yogurt Smoothie">Yogurt Smoothie</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-slate-600">
          <thead className="text-xs text-slate-500 bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 font-medium">Dish</th>
              <th className="px-6 py-4 font-medium">Category</th>
              <th className="px-6 py-4 font-medium">Tracked by</th>
              <th className="px-6 py-4 font-medium text-right">Remaining</th>
              <th className="px-6 py-4 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((dish) => (
              <tr key={dish.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-800">{dish.name}</td>
                <td className="px-6 py-4">{dish.category}</td>
                <td className="px-6 py-4">{dish.trackedBy}</td>
                <td className="px-6 py-4 text-right">{dish.remaining}</td>
                <td className="px-6 py-4">
                  {dish.status === "SOLD_OUT" && (
                    <span className="inline-flex items-center text-xs font-medium text-red-600">
                      Sold out — count is 0
                    </span>
                  )}
                  {dish.status === "NO_RECIPE" && (
                    <span className="inline-flex items-center text-xs font-medium text-amber-600">
                      No recipe yet
                    </span>
                  )}
                  {dish.status === "SELLABLE" && (
                    <span className="inline-flex items-center text-xs font-medium text-emerald-500">
                      Sellable
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-4 border-t border-slate-200 flex items-center justify-between text-sm text-slate-500">
        <p>Showing 1-15 of 151</p>
        <div className="flex items-center gap-1">
          <button className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-50" disabled>
            <ChevronLeft size={18} />
          </button>
          <button className="w-7 h-7 rounded-full bg-slate-900 text-white font-medium flex items-center justify-center">1</button>
          <button className="w-7 h-7 rounded-full text-slate-600 hover:bg-slate-100 font-medium flex items-center justify-center">2</button>
          <span className="px-1">...</span>
          <button className="w-7 h-7 rounded-full text-slate-600 hover:bg-slate-100 font-medium flex items-center justify-center">11</button>
          <button className="p-1 rounded text-slate-400 hover:text-slate-700">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
