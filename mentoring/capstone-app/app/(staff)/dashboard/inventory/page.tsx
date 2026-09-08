"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/staff/layout/DashboardLayout";
import { InventoryTable } from "@/components/staff/inventory/InventoryTable";
import { InventoryForm } from "@/components/staff/inventory/InventoryForm";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { InventoryItem, InventoryCategory, User } from "@prisma/client";

interface InventoryItemWithRelations extends InventoryItem {
  category: InventoryCategory;
  updatedBy: User;
}

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItemWithRelations[]>([]);
  const [categories, setCategories] = useState<InventoryCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItemWithRelations | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch categories
      const catResponse = await fetch("/api/inventory/categories");
      const catData = await catResponse.json();
      setCategories(catData);

      // Fetch items
      const params = new URLSearchParams();
      if (selectedCategory !== "all") {
        params.append("category", selectedCategory);
      }
      if (selectedStatus !== "all") {
        params.append("status", selectedStatus);
      }
      if (searchQuery) {
        params.append("search", searchQuery);
      }

      const itemResponse = await fetch(`/api/inventory?${params.toString()}`);
      const itemData = await itemResponse.json();
      setItems(itemData);
    } catch (error) {
      console.error("Failed to fetch inventory:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedCategory, selectedStatus, searchQuery]);

  const handleEdit = (item: InventoryItemWithRelations) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingItem(null);
  };

  const handleFormSubmit = () => {
    handleFormClose();
    fetchData();
  };

  return (
    <DashboardLayout title="Inventory">
      <div className="space-y-6">
        {/* Header with Add Button */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Inventory Items</h2>
          <Button
            onClick={() => setShowForm(true)}
            className="bg-amber-600 hover:bg-amber-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
        </div>

        {/* Search Bar */}
        <div>
          <Input
            placeholder="Search inventory..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
        </div>

        {/* Category Tabs */}
        {categories.length > 0 && (
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
              <TabsList className="grid w-full gap-2 bg-transparent h-auto p-0 overflow-x-auto">
                <TabsTrigger
                  value="all"
                  className="rounded-lg data-[state=active]:bg-amber-100 data-[state=active]:text-amber-900"
                >
                  All Categories
                </TabsTrigger>
                {categories.map((cat) => (
                  <TabsTrigger
                    key={cat.id}
                    value={cat.id.toString()}
                    className="rounded-lg data-[state=active]:bg-amber-100 data-[state=active]:text-amber-900"
                  >
                    {cat.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        )}

        {/* Status Filter */}
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <Tabs value={selectedStatus} onValueChange={setSelectedStatus}>
            <TabsList className="grid w-full grid-cols-4 gap-2 bg-transparent h-auto p-0">
              <TabsTrigger
                value="all"
                className="rounded-lg data-[state=active]:bg-amber-100 data-[state=active]:text-amber-900"
              >
                All
              </TabsTrigger>
              <TabsTrigger
                value="GOOD"
                className="rounded-lg data-[state=active]:bg-green-100 data-[state=active]:text-green-900"
              >
                In Stock
              </TabsTrigger>
              <TabsTrigger
                value="LOW"
                className="rounded-lg data-[state=active]:bg-yellow-100 data-[state=active]:text-yellow-900"
              >
                Low Stock
              </TabsTrigger>
              <TabsTrigger
                value="OUT_OF_STOCK"
                className="rounded-lg data-[state=active]:bg-red-100 data-[state=active]:text-red-900"
              >
                Out of Stock
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Inventory Table */}
        {loading ? (
          <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
            <div className="inline-flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
            </div>
            <p className="mt-4 text-slate-500">Loading inventory...</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            <InventoryTable
              items={items}
              onEdit={handleEdit}
              onRefresh={fetchData}
            />
          </div>
        )}
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900">
                {editingItem ? "Update Item" : "Add Item"}
              </h2>
              <button
                onClick={handleFormClose}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <InventoryForm
              categories={categories}
              item={editingItem || undefined}
              onSubmit={handleFormSubmit}
              onCancel={handleFormClose}
            />
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
