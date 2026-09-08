"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCart } from "@/lib/cart-store";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertCircle } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tableId = searchParams.get("tableId");
  const cart = useCart();

  const [orderType, setOrderType] = useState<"DINE_IN" | "TAKE_OUT">("DINE_IN");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect to menu if cart is empty
  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center px-4">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-amber-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Cart is Empty</h1>
          <p className="text-slate-600 mb-6">Add items to your cart before checking out</p>
          <Link href={`/menu${tableId ? `?tableId=${tableId}` : ""}`}>
            <Button className="bg-amber-600 hover:bg-amber-700">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const handlePlaceOrder = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderType,
          tableId: tableId ? parseInt(tableId) : null,
          items: cart.items.map((item) => ({
            menuItemId: item.menuItemId,
            variationId: item.variationId,
            quantity: item.quantity,
            unitPrice: item.price,
          })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to place order");
      }

      const order = await response.json();
      cart.clearCart();
      toast.success("Order placed successfully!");
      router.push(`/order/${order.id}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 pb-8">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-20">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center">
          <Link href={`/menu${tableId ? `?tableId=${tableId}` : ""}`}>
            <button className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors">
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
          </Link>
          <h1 className="text-xl font-bold text-slate-900 ml-4">Checkout</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="grid gap-8">
          {/* Order Type Selection */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Order Type</h2>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setOrderType("DINE_IN")}
                className={`p-4 rounded-lg border-2 transition-all ${
                  orderType === "DINE_IN"
                    ? "border-amber-600 bg-amber-50"
                    : "border-slate-200 bg-white hover:border-amber-300"
                }`}
              >
                <div className="text-2xl mb-2">🍽️</div>
                <div className="font-semibold text-slate-900">Dine In</div>
                <div className="text-sm text-slate-500">Eat here</div>
              </button>
              <button
                onClick={() => setOrderType("TAKE_OUT")}
                className={`p-4 rounded-lg border-2 transition-all ${
                  orderType === "TAKE_OUT"
                    ? "border-amber-600 bg-amber-50"
                    : "border-slate-200 bg-white hover:border-amber-300"
                }`}
              >
                <div className="text-2xl mb-2">📦</div>
                <div className="font-semibold text-slate-900">Take Out</div>
                <div className="text-sm text-slate-500">Take away</div>
              </button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Order Summary</h2>
            <div className="space-y-3 mb-6">
              {cart.items.map((item) => (
                <div key={item.id} className="flex justify-between items-center pb-3 border-b border-slate-100 last:border-b-0">
                  <div>
                    <p className="font-medium text-slate-900">
                      {item.quantity}x {item.name}
                    </p>
                    {item.variationName && (
                      <p className="text-sm text-slate-500">{item.variationName}</p>
                    )}
                  </div>
                  <p className="font-semibold text-slate-900">
                    {formatCurrency(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-200 pt-4 space-y-2">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span>{formatCurrency(cart.getTotal())}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-slate-900">
                <span>Total</span>
                <span className="text-amber-600">{formatCurrency(cart.getTotal())}</span>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Place Order Button */}
          <Button
            onClick={handlePlaceOrder}
            disabled={isLoading}
            className="w-full bg-amber-600 hover:bg-amber-700 h-14 text-lg font-semibold"
          >
            {isLoading ? "Placing Order..." : "Place Order"}
          </Button>
        </div>
      </div>
    </div>
  );
}
