import { DashboardLayout } from "@/components/staff/layout/DashboardLayout";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { MenuClientView } from "./MenuClientView";

export const dynamic = "force-dynamic";

export default async function MenuManagementPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  // ── Real DB queries ──────────────────────────────────────────────────────
  const [items, categories] = await Promise.all([
    db.menuItem.findMany({
      orderBy: { createdAt: "asc" },
      include: { category: true },
    }),
    db.menuCategory.findMany({
      orderBy: { name: "asc" },
    }),
  ]);

  // Serialize Decimal price → number for client
  const serializedItems = items.map((item) => ({
    id: item.id,
    name: item.name,
    price: Number(item.price),
    imageUrl: item.imageUrl || null,
    isArchived: item.isArchived,
    category: { id: item.category.id, name: item.category.name },
  }));

  const serializedCategories = categories.map((c) => ({
    id: c.id,
    name: c.name,
  }));

  return (
    <DashboardLayout title="Menu Management">
      <MenuClientView initialItems={serializedItems} categories={serializedCategories} />
    </DashboardLayout>
  );
}
