"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-store";
import { formatCurrency } from "@/lib/utils";
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import Link from "next/link";

interface CartSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tableId?: string | null;
}

export function CartSheet({ open, onOpenChange, tableId }: CartSheetProps) {
  const cart = useCart();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[80vh] flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            Your Order
          </SheetTitle>
        </SheetHeader>

        {cart.items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <ShoppingBag className="w-16 h-16 text-slate-300 mb-4" />
            <p className="text-slate-500 font-medium">Your cart is empty</p>
            <p className="text-sm text-slate-400 mt-2">
              Start adding items from the menu to place an order
            </p>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto py-4 space-y-3">
              {cart.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 truncate">
                      {item.name}
                    </p>
                    {item.variationName && (
                      <p className="text-sm text-slate-500">{item.variationName}</p>
                    )}
                    <p className="text-sm font-medium text-amber-600 mt-1">
                      {formatCurrency(item.price)} each
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        cart.updateItem(item.id, item.quantity - 1)
                      }
                      className="p-1 rounded hover:bg-white transition-colors"
                      disabled={item.quantity <= 1}
                    >
                      <Minus className="w-4 h-4 text-slate-600" />
                    </button>
                    <span className="w-8 text-center font-semibold text-slate-900">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        cart.updateItem(item.id, item.quantity + 1)
                      }
                      className="p-1 rounded hover:bg-white transition-colors"
                    >
                      <Plus className="w-4 h-4 text-slate-600" />
                    </button>
                  </div>

                  <button
                    onClick={() => cart.removeItem(item.id)}
                    className="p-1 rounded hover:bg-red-50 transition-colors text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="border-t border-slate-200 pt-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Subtotal</span>
                <span className="font-medium text-slate-900">
                  {formatCurrency(cart.getTotal())}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Items</span>
                <span className="font-medium text-slate-900">
                  {cart.getItemCount()}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="flex-1"
                >
                  Continue Shopping
                </Button>
                <Link
                  href={`/cart/checkout${tableId ? `?tableId=${tableId}` : ""}`}
                  className="flex-1"
                  onClick={() => onOpenChange(false)}
                >
                  <Button className="w-full bg-amber-600 hover:bg-amber-700">
                    Checkout
                  </Button>
                </Link>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
