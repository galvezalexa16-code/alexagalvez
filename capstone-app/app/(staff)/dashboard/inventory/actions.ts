"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import type { StockStatus } from "@/types";

async function requireOwnerOrSupervisor() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  const role = session.user.role;
  if (role !== "OWNER" && role !== "SUPERVISOR") redirect("/dashboard");
  return session;
}

export async function createInventoryCategory(name: string) {
  await requireOwnerOrSupervisor();
  try {
    await db.inventoryCategory.create({ data: { name } });
  } catch (err: any) {
    if (err?.code === "P2002") throw new Error("Category already exists.");
    throw err;
  }
  revalidatePath("/dashboard/inventory");
  return { success: true };
}

export async function createInventoryItem(data: {
  name: string;
  categoryId: number;
  stockQuantity: number;
  unit: string;
  supplier: string;
  expiryDate: string | null;
  status: StockStatus;
}) {
  const session = await requireOwnerOrSupervisor();
  const userId = Number(session.user.id);
  await db.inventoryItem.create({
    data: {
      name: data.name,
      categoryId: data.categoryId,
      stockQuantity: data.stockQuantity,
      unit: data.unit,
      supplier: data.supplier,
      expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
      status: data.status,
      updatedById: userId,
    },
  });
  revalidatePath("/dashboard/inventory");
  return { success: true };
}

export async function updateInventoryItem(data: {
  id: number;
  name: string;
  categoryId: number;
  stockQuantity: number;
  unit: string;
  supplier: string;
  expiryDate: string | null;
  status: StockStatus;
}) {
  const session = await requireOwnerOrSupervisor();
  const userId = Number(session.user.id);
  await db.inventoryItem.update({
    where: { id: data.id },
    data: {
      name: data.name,
      categoryId: data.categoryId,
      stockQuantity: data.stockQuantity,
      unit: data.unit,
      supplier: data.supplier,
      expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
      status: data.status,
      updatedById: userId,
    },
  });
  revalidatePath("/dashboard/inventory");
  return { success: true };
}

export async function deleteInventoryItem(id: number) {
  await requireOwnerOrSupervisor();
  await db.inventoryItem.delete({ where: { id } });
  revalidatePath("/dashboard/inventory");
  return { success: true };
}
