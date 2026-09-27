"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import type { OrderStatus } from "@/types";

async function requireOwnerOrSupervisor() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  const role = session.user.role;
  if (role !== "OWNER" && role !== "SUPERVISOR") redirect("/dashboard");
  return session;
}

export async function updateOrderStatus(id: number, status: OrderStatus) {
  await requireOwnerOrSupervisor();

  await db.order.update({
    where: { id },
    data: { status },
  });

  revalidatePath("/dashboard/orders");
  return { success: true };
}

export async function cancelOrder(id: number) {
  await requireOwnerOrSupervisor();

  await db.order.update({
    where: { id },
    data: { status: "CANCELLED" },
  });

  revalidatePath("/dashboard/orders");
  return { success: true };
}

export async function markOrderReady(id: number) {
  await requireOwnerOrSupervisor();

  await db.order.update({
    where: { id },
    data: { status: "READY" },
  });

  revalidatePath("/dashboard/orders");
  return { success: true };
}

export async function markOrderCompleted(id: number) {
  await requireOwnerOrSupervisor();

  await db.order.update({
    where: { id },
    data: { status: "COMPLETED" },
  });

  revalidatePath("/dashboard/orders");
  return { success: true };
}
