"use server";

import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import type { Role } from "@/types";

// ── Guard helper ────────────────────────────────────────────────────────────
async function requireAdminOrOwner() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  const role = session.user.role;
  if (role !== "OWNER" && role !== "ADMIN") redirect("/dashboard");
}

// ── Create User ─────────────────────────────────────────────────────────────
export async function createUser(data: {
  name: string;
  email: string;
  role: Role;
  password: string;
}) {
  await requireAdminOrOwner();

  const hashedPassword = await bcrypt.hash(data.password, 10);

  try {
    await db.user.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase(),
        password: hashedPassword,
        role: data.role,
        status: "ACTIVE",
      },
    });
  } catch (err: any) {
    if (err?.code === "P2002") {
      throw new Error("A user with that email already exists.");
    }
    throw err;
  }

  revalidatePath("/dashboard/users");
  return { success: true };
}

// ── Update User ─────────────────────────────────────────────────────────────
export async function updateUser(data: {
  id: number;
  name: string;
  email: string;
  role: Role;
}) {
  await requireAdminOrOwner();

  await db.user.update({
    where: { id: data.id },
    data: {
      name: data.name,
      email: data.email.toLowerCase(),
      role: data.role,
    },
  });

  revalidatePath("/dashboard/users");
  return { success: true };
}

// ── Archive User ─────────────────────────────────────────────────────────────
export async function archiveUser(id: number) {
  await requireAdminOrOwner();

  await db.user.update({
    where: { id },
    data: { status: "ARCHIVED" },
  });

  revalidatePath("/dashboard/users");
  return { success: true };
}

// ── Restore User ─────────────────────────────────────────────────────────────
export async function restoreUser(id: number) {
  await requireAdminOrOwner();

  await db.user.update({
    where: { id },
    data: { status: "ACTIVE" },
  });

  revalidatePath("/dashboard/users");
  revalidatePath("/dashboard/users/archived");
  return { success: true };
}
