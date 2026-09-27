"use client";

import { useState, useTransition } from "react";
import { formatCurrency } from "@/lib/utils";
import { useCart, CartItem } from "@/lib/cart-context";
import { ShoppingCart, X, Plus, Minus, ChevronRight, Loader2, CheckCircle2, Search } from "lucide-react";
import { toast } from "sonner";

interface Variation {
  id: number;
  name: string;
  priceMod: number;
}

interface MenuItem {
  id: number;
  name: string;
  price: number;
  imageUrl: string | null;
  category: { id: number; name: string };
  variations: Variation[];
}

interface StoreClientProps {
  menuItems: MenuItem[];
  categories: { id: number; name: string }[];
}

type OrderType = "DINE_IN" | "TAKE_OUT";

// ── Item Detail Sheet ────────────────────────────────────────
function ItemSheet({
  item,
  onClose,
  onAdd,
}: {
  item: MenuItem;
  onClose: () => void;
  onAdd: (item: Omit<CartItem, "quantity">) => void;
}) {
  const [qty, setQty] = useState(1);
  const [selectedVar, setSelectedVar] = useState<Variation | null>(
    item.variations.length > 0 ? item.variations[0] : null
  );

  const basePrice = item.price;
  const varMod = selectedVar ? selectedVar.priceMod : 0;
  const unitPrice = basePrice + varMod;
  const totalPrice = unitPrice * qty;

  const handleAdd = () => {
    onAdd({
      menuItemId: item.id,
      variationId: selectedVar?.id ?? null,
      name: item.name,
      variationName: selectedVar?.name ?? null,
      price: unitPrice,
      imageUrl: item.imageUrl,
    });
    toast.success(`${item.name} added to cart!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-sm p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
        {/* Image */}
        <div className="relative h-56 bg-gradient-to-br from-amber-50 to-orange-100 overflow-hidden">
          {item.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl">🍽️</div>
          )}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-slate-600 hover:text-slate-900 shadow-md transition-colors"
          >
            <X size={18} />
          </button>
          <div className="absolute bottom-4 left-4">
            <span className="bg-white/90 backdrop-blur-sm text-slate-600 text-[11px] font-semibold px-3 py-1 rounded-full shadow border border-white">
              {item.category.name}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-bold text-slate-900 flex-1 pr-4 leading-snug">{item.name}</h2>
            <span className="text-xl font-bold text-amber-600 shrink-0">{formatCurrency(unitPrice)}</span>
          </div>

          {/* Variations */}
          {item.variations.length > 0 && (
            <div className="mb-5">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Options</p>
              <div className="flex flex-wrap gap-2">
                {item.variations.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVar(v)}
                    className={`px-4 py-2 text-sm font-medium rounded-xl border-2 transition-all ${
                      selectedVar?.id === v.id
                        ? "border-amber-500 bg-amber-50 text-amber-700"
                        : "border-slate-200 text-slate-600 hover:border-slate-300 bg-white"
                    }`}
                  >
                    {v.name}
                    {v.priceMod !== 0 && (
                      <span className="ml-1 text-xs opacity-70">
                        {v.priceMod > 0 ? `+${formatCurrency(v.priceMod)}` : formatCurrency(v.priceMod)}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Qty + Add */}
          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-3 bg-slate-100 rounded-xl px-3 py-2">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-slate-600 hover:text-slate-900 transition-colors"
              >
                <Minus size={16} />
              </button>
              <span className="w-6 text-center font-bold text-slate-900">{qty}</span>
              <button
                onClick={() => setQty((q) => q + 1)}
                className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-slate-600 hover:text-slate-900 transition-colors"
              >
                <Plus size={16} />
              </button>
            </div>
            <button
              onClick={handleAdd}
              className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold py-3 px-5 rounded-xl shadow-md transition-all hover:shadow-amber-200/60 flex items-center justify-center gap-4"
            >
              <span>Add to Cart</span>
              <span>{formatCurrency(totalPrice)}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Cart Sheet ───────────────────────────────────────────────
function CartSheet({
  onClose,
  orderType,
  setOrderType,
}: {
  onClose: () => void;
  orderType: OrderType;
  setOrderType: (t: OrderType) => void;
}) {
  const { items, removeItem, updateQty, total, clearCart } = useCart();
  const [isPending, startTransition] = useTransition();
  const [orderPlaced, setOrderPlaced] = useState<{ orderId: string; total: number } | null>(null);

  const handlePlaceOrder = () => {
    if (items.length === 0) return;
    startTransition(async () => {
      try {
        const res = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderType,
            tableId: null,
            items: items.map((i) => ({
              menuItemId: i.menuItemId,
              variationId: i.variationId,
              quantity: i.quantity,
              unitPrice: i.price,
            })),
          }),
        });

        if (!res.ok) throw new Error("Order failed");
        const data = await res.json();
        setOrderPlaced({ orderId: data.orderId, total: data.totalAmount });
        clearCart();
      } catch {
        toast.error("Failed to place order. Please try again.");
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-sm h-full flex flex-col shadow-2xl animate-in slide-in-from-right-4 duration-300">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div>
            <h2 className="font-bold text-slate-900 text-lg">Your Cart</h2>
            <p className="text-slate-400 text-xs">{items.length} item type{items.length !== 1 ? "s" : ""}</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-colors">
            <X size={18} />
          </button>
        </div>

        {orderPlaced ? (
          /* ── Success ── */
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-5">
              <CheckCircle2 size={36} className="text-green-500" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Order Placed!</h3>
            <p className="text-slate-500 text-sm mb-1">Order ID: <span className="font-mono font-bold text-slate-700">{orderPlaced.orderId}</span></p>
            <p className="text-slate-500 text-sm mb-6">Total: <span className="font-bold text-amber-600">{formatCurrency(orderPlaced.total)}</span></p>
            <p className="text-xs text-slate-400 mb-6">Please proceed to the counter to pay. Your order is being prepared.</p>
            <button
              onClick={onClose}
              className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold px-6 py-3 rounded-xl transition-colors shadow-md"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            {/* Order type */}
            <div className="px-5 pt-4 pb-2 shrink-0">
              <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
                {(["DINE_IN", "TAKE_OUT"] as OrderType[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setOrderType(t)}
                    className={`py-2 text-sm font-semibold rounded-lg transition-all ${
                      orderType === t
                        ? "bg-white text-amber-600 shadow-sm"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {t === "DINE_IN" ? "🪑 Dine In" : "🥡 Take Out"}
                  </button>
                ))}
              </div>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-5 py-3 space-y-3">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 py-16">
                  <ShoppingCart size={48} className="mb-4 opacity-30" />
                  <p className="font-medium">Your cart is empty</p>
                  <p className="text-xs mt-1">Add items from the menu</p>
                </div>
              ) : (
                items.map((item) => (
                  <div key={`${item.menuItemId}-${item.variationId}`} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="w-14 h-14 rounded-lg bg-amber-50 overflow-hidden shrink-0">
                      {item.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-lg">🍽️</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 text-sm truncate">{item.name}</p>
                      {item.variationName && (
                        <p className="text-xs text-slate-400">{item.variationName}</p>
                      )}
                      <p className="text-amber-600 font-bold text-sm mt-0.5">{formatCurrency(item.price)}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => updateQty(item.menuItemId, item.variationId, item.quantity - 1)}
                        className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 shadow-sm transition-colors text-xs"
                      >
                        <Minus size={11} />
                      </button>
                      <span className="w-5 text-center font-bold text-slate-900 text-sm">{item.quantity}</span>
                      <button
                        onClick={() => updateQty(item.menuItemId, item.variationId, item.quantity + 1)}
                        className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 shadow-sm transition-colors text-xs"
                      >
                        <Plus size={11} />
                      </button>
                      <button
                        onClick={() => removeItem(item.menuItemId, item.variationId)}
                        className="ml-1 w-6 h-6 rounded-lg hover:bg-red-50 flex items-center justify-center text-slate-300 hover:text-red-400 transition-colors"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="px-5 py-5 border-t border-slate-100 shrink-0 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Subtotal</span>
                  <span className="font-bold text-slate-900">{formatCurrency(total)}</span>
                </div>
                <button
                  onClick={handlePlaceOrder}
                  disabled={isPending}
                  className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-slate-900 font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  {isPending ? (
                    <><Loader2 size={18} className="animate-spin" /> Placing Order...</>
                  ) : (
                    <>Place Order · {formatCurrency(total)}</>
                  )}
                </button>
                <p className="text-center text-xs text-slate-400">Pay at the counter after ordering</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ── Main Store View ──────────────────────────────────────────
export function StoreClient({ menuItems, categories }: StoreClientProps) {
  const { addItem, count, total } = useCart();
  const [activeCat, setActiveCat] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [orderType, setOrderType] = useState<OrderType>("DINE_IN");

  const filtered = menuItems.filter((item) => {
    const matchCat = activeCat === null || item.category.id === activeCat;
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen bg-[#fdf8f3]">
      {/* ── TOP BAR ── */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-amber-100 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div>
              <h1 className="font-black text-slate-900 text-lg leading-tight">Ericahlicious</h1>
              <p className="text-slate-400 text-xs">Digital Menu</p>
            </div>
            <button
              onClick={() => setCartOpen(true)}
              className="relative flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold text-sm px-4 py-2.5 rounded-xl shadow-md transition-all"
            >
              <ShoppingCart size={16} />
              {count > 0 && (
                <span className="font-bold">{formatCurrency(total)}</span>
              )}
              {count > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
                  {count}
                </span>
              )}
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search menu..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-100 rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-amber-400 placeholder-slate-400 text-slate-800"
            />
          </div>
        </div>

        {/* Category tabs */}
        <div className="flex overflow-x-auto gap-1.5 px-4 pb-3 scrollbar-hide max-w-3xl mx-auto">
          <button
            onClick={() => setActiveCat(null)}
            className={`shrink-0 px-4 py-1.5 text-xs font-semibold rounded-full transition-all border ${
              activeCat === null
                ? "bg-amber-500 text-slate-900 border-amber-500 shadow-sm"
                : "bg-white text-slate-600 border-slate-200 hover:border-amber-300"
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCat(cat.id)}
              className={`shrink-0 px-4 py-1.5 text-xs font-semibold rounded-full transition-all border whitespace-nowrap ${
                activeCat === cat.id
                  ? "bg-amber-500 text-slate-900 border-amber-500 shadow-sm"
                  : "bg-white text-slate-600 border-slate-200 hover:border-amber-300"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* ── MENU GRID ── */}
      <div className="max-w-3xl mx-auto px-4 py-5 pb-24">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400">
            <p className="text-4xl mb-4">🔍</p>
            <p className="font-medium text-base">No items found</p>
            <p className="text-sm mt-1">Try a different search or category</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {filtered.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className="text-left group bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className="h-36 bg-gradient-to-br from-amber-50 to-orange-50 relative overflow-hidden">
                  {item.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl">🍽️</div>
                  )}
                  {item.variations.length > 0 && (
                    <div className="absolute bottom-2 right-2">
                      <span className="bg-white/90 text-slate-500 text-[9px] font-semibold px-1.5 py-0.5 rounded-full shadow">
                        {item.variations.length} options
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="font-semibold text-slate-900 text-sm leading-snug line-clamp-2 mb-1">{item.name}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-amber-600 font-bold text-sm">{formatCurrency(item.price)}</p>
                    <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center">
                      <Plus size={12} className="text-amber-600" />
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── FLOATING CART BUTTON (mobile) ── */}
      {count > 0 && !cartOpen && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 sm:hidden">
          <button
            onClick={() => setCartOpen(true)}
            className="flex items-center gap-3 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold px-6 py-4 rounded-2xl shadow-2xl transition-all"
          >
            <ShoppingCart size={18} />
            <span>{count} item{count !== 1 ? "s" : ""}</span>
            <span className="font-black">{formatCurrency(total)}</span>
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* ── ITEM DETAIL SHEET ── */}
      {selectedItem && (
        <ItemSheet
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onAdd={addItem}
        />
      )}

      {/* ── CART SHEET ── */}
      {cartOpen && (
        <CartSheet
          onClose={() => setCartOpen(false)}
          orderType={orderType}
          setOrderType={setOrderType}
        />
      )}
    </div>
  );
}
