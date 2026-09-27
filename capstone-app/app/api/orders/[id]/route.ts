import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

const UpdateSchema = z.object({
  status: z.enum(["PENDING", "PREPARING", "READY", "COMPLETED", "CANCELLED"]),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    const orderId = Number(id);
    if (isNaN(orderId)) {
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
    }
    const body = await req.json();
    const parsed = UpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }
    const updated = await db.order.update({
      where: { id: orderId },
      data: { status: parsed.data.status },
    });
    return NextResponse.json({ id: updated.id, status: updated.status });
  } catch {
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const orderId = Number(id);
    if (isNaN(orderId)) {
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
    }
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: {
        items: { include: { menuItem: true, variation: true } },
        table: true,
      },
    });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    return NextResponse.json({
      id: order.id,
      orderId: `ORD-${String(order.id).padStart(4, "0")}`,
      status: order.status,
      orderType: order.orderType,
      totalAmount: Number(order.totalAmount),
      table: order.table?.name ?? null,
      createdAt: order.createdAt,
      items: order.items.map((i) => ({
        name: i.menuItem.name,
        variation: i.variation?.name ?? null,
        quantity: i.quantity,
        unitPrice: Number(i.unitPrice),
      })),
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 });
  }
}