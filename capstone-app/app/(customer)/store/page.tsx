import { db } from "@/lib/db";
import { CartProvider } from "@/lib/cart-context";
import { StoreClient } from "./StoreClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Order Online — Ericahlicious Cafe",
  description: "Browse our menu and place your order online.",
};

export default async function StorePage() {
  const [items, categories] = await Promise.all([
    db.menuItem.findMany({
      where: { isArchived: false },
      include: { category: true, variations: true },
      orderBy: { createdAt: "asc" },
    }),
    db.menuCategory.findMany({ orderBy: { name: "asc" } }),
  ]);

  const serializedItems = items.map((item) => ({
    id: item.id,
    name: item.name,
    price: Number(item.price),
    imageUrl: item.imageUrl || null,
    category: { id: item.category.id, name: item.category.name },
    variations: item.variations.map((v) => ({
      id: v.id,
      name: v.name,
      priceMod: Number(v.priceMod),
    })),
  }));

  const serializedCategories = categories.map((c) => ({ id: c.id, name: c.name }));

  return (
    <CartProvider>
      <StoreClient menuItems={serializedItems} categories={serializedCategories} />
    </CartProvider>
  );
}
