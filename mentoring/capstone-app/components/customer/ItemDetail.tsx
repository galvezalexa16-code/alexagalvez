"use client";

import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-store";
import { formatCurrency } from "@/lib/utils";
import { Plus, Minus, ShoppingBag, ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { MenuItem, MenuCategory, MenuItemVariation } from "@prisma/client";

interface ItemDetailProps {
  item: MenuItem & {
    category: MenuCategory;
    variations: MenuItemVariation[];
  };
  tableId?: string | null;
}

export function ItemDetail({ item, tableId }: ItemDetailProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedVariation, setSelectedVariation] = useState<MenuItemVariation | null>(
    item.variations.length > 0 ? item.variations[0] : null
  );
  const [isAdding, setIsAdding] = useState(false);
  const cart = useCart();

  const finalPrice = selectedVariation
    ? Number(item.price) + Number(selectedVariation.priceMod)
    : Number(item.price);

  const handleAddToCart = async () => {
    setIsAdding(true);
    try {
      cart.addItem({
        menuItemId: item.id,
        name: item.name,
        price: finalPrice,
        quantity,
        variationId: selectedVariation?.id,
        variationName: selectedVariation?.name,
        image: item.imageUrl,
      });

      // Show success feedback
      setTimeout(() => {
        setIsAdding(false);
        setQuantity(1);
      }, 300);
    } catch (error) {
      console.error("Failed to add to cart:", error);
      setIsAdding(false);
    }
  };

  const queryString = tableId ? `?tableId=${tableId}` : "";

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      {/* Header with Back Button */}
      <div className="sticky top-0 z-20 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center">
          <Link href={`/menu${queryString}`}>
            <button className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors">
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
          </Link>
        </div>
      </div>

      {/* Item Details */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Image */}
          <div className="relative h-96 bg-slate-100">
            {item.imageUrl ? (
              <Image
                src={item.imageUrl}
                alt={item.name}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-100 to-orange-100">
                <span className="text-6xl">☕</span>
              </div>
            )}
            <div className="absolute top-4 right-4 bg-amber-600 text-white px-4 py-2 rounded-full font-semibold">
              {item.category.name}
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">{item.name}</h1>
            <p className="text-2xl font-bold text-amber-600 mb-6">
              {formatCurrency(finalPrice)}
            </p>

            {/* Variations */}
            {item.variations.length > 0 && (
              <div className="mb-8">
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Size/Variation
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {item.variations.map((variation) => (
                    <button
                      key={variation.id}
                      onClick={() => setSelectedVariation(variation)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        selectedVariation?.id === variation.id
                          ? "border-amber-600 bg-amber-50"
                          : "border-slate-200 bg-white hover:border-amber-300"
                      }`}
                    >
                      <div className="font-medium text-slate-900">
                        {variation.name}
                      </div>
                      {variation.priceMod !== 0 && (
                        <div className="text-sm text-amber-600">
                          +{formatCurrency(Number(variation.priceMod))}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="mb-8">
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                Quantity
              </label>
              <div className="flex items-center gap-4 bg-slate-100 rounded-lg p-4 w-fit">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  className="p-2 rounded hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Minus className="w-5 h-5 text-slate-600" />
                </button>
                <span className="text-2xl font-bold text-slate-900 w-12 text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2 rounded hover:bg-white transition-colors"
                >
                  <Plus className="w-5 h-5 text-slate-600" />
                </button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <Button
              onClick={handleAddToCart}
              disabled={isAdding}
              className="w-full bg-amber-600 hover:bg-amber-700 h-14 text-lg font-semibold"
            >
              <ShoppingBag className="w-5 h-5 mr-2" />
              {isAdding ? "Adding..." : "Add to Cart"}
            </Button>

            {/* Order Summary */}
            <div className="mt-8 p-6 bg-slate-50 rounded-lg">
              <div className="flex justify-between mb-2">
                <span className="text-slate-600">Price per item</span>
                <span className="font-semibold text-slate-900">
                  {formatCurrency(finalPrice)}
                </span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-slate-600">Quantity</span>
                <span className="font-semibold text-slate-900">{quantity}</span>
              </div>
              <div className="border-t border-slate-200 pt-2 flex justify-between text-lg">
                <span className="font-semibold text-slate-900">Total</span>
                <span className="font-bold text-amber-600">
                  {formatCurrency(finalPrice * quantity)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
