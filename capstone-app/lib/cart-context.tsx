"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

export interface CartItem {
  menuItemId: number;
  variationId: number | null;
  name: string;
  variationName: string | null;
  price: number;
  quantity: number;
  imageUrl: string | null;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (menuItemId: number, variationId: number | null) => void;
  updateQty: (menuItemId: number, variationId: number | null, qty: number) => void;
  clearCart: () => void;
  total: number;
  count: number;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = useCallback((newItem: Omit<CartItem, "quantity">) => {
    setItems((prev) => {
      const existing = prev.find(
        (i) => i.menuItemId === newItem.menuItemId && i.variationId === newItem.variationId
      );
      if (existing) {
        return prev.map((i) =>
          i.menuItemId === newItem.menuItemId && i.variationId === newItem.variationId
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, { ...newItem, quantity: 1 }];
    });
  }, []);

  const removeItem = useCallback((menuItemId: number, variationId: number | null) => {
    setItems((prev) =>
      prev.filter((i) => !(i.menuItemId === menuItemId && i.variationId === variationId))
    );
  }, []);

  const updateQty = useCallback((menuItemId: number, variationId: number | null, qty: number) => {
    if (qty < 1) {
      removeItem(menuItemId, variationId);
      return;
    }
    setItems((prev) =>
      prev.map((i) =>
        i.menuItemId === menuItemId && i.variationId === variationId ? { ...i, quantity: qty } : i
      )
    );
  }, [removeItem]);

  const clearCart = useCallback(() => setItems([]), []);

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQty, clearCart, total, count }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
