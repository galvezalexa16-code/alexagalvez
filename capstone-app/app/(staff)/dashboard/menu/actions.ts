"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

// ── Guard helper ────────────────────────────────────────────────────────────
async function requireStaff() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
}

async function requireAdminOrOwner() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  const role = session.user.role;
  if (role !== "OWNER" && role !== "ADMIN") redirect("/dashboard");
}

// ── Create Menu Item ────────────────────────────────────────────────────────
export async function createMenuItem(data: {
  name: string;
  price: number;
  categoryId: number;
  imageUrl: string | null;
}) {
  await requireAdminOrOwner();

  await db.menuItem.create({
    data: {
      name: data.name,
      price: data.price,
      categoryId: data.categoryId,
      imageUrl: data.imageUrl || "",
      isArchived: false,
    },
  });

  revalidatePath("/dashboard/menu");
  return { success: true };
}

// ── Update Menu Item ────────────────────────────────────────────────────────
export async function updateMenuItem(data: {
  id: number;
  name: string;
  price: number;
  categoryId: number;
  imageUrl: string | null;
  isArchived: boolean;
}) {
  await requireAdminOrOwner();

  await db.menuItem.update({
    where: { id: data.id },
    data: {
      name: data.name,
      price: data.price,
      categoryId: data.categoryId,
      imageUrl: data.imageUrl || "",
      isArchived: data.isArchived,
    },
  });

  revalidatePath("/dashboard/menu");
  return { success: true };
}

// ── Archive Menu Item ───────────────────────────────────────────────────────
export async function archiveMenuItem(id: number) {
  await requireAdminOrOwner();

  await db.menuItem.update({
    where: { id },
    data: { isArchived: true },
  });

  revalidatePath("/dashboard/menu");
  return { success: true };
}

// ── Restore Menu Item ───────────────────────────────────────────────────────
export async function restoreMenuItem(id: number) {
  await requireAdminOrOwner();

  await db.menuItem.update({
    where: { id },
    data: { isArchived: false },
  });

  revalidatePath("/dashboard/menu");
  return { success: true };
}
