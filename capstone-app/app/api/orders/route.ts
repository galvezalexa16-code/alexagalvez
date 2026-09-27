import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

export const dynamic = "force-dynamic";

const OrderSchema = z.object({
  tableId: z.number().nullable().optional(),
  orderType: z.enum(["DINE_IN", "TAKE_OUT"]),
  items: z.array(
    z.object({
      menuItemId: z.number(),
      variationId: z.number().nullable().optional(),
      quantity: z.number().min(1),
      unitPrice: z.number(),
    })
  ).min(1),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = OrderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid order data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { tableId, orderType, items } = parsed.data;

    const totalAmount = items.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0
    );

    const order = await db.order.create({
      data: {
        tableId: tableId ?? null,
        orderType,
        status: "PENDING",
        totalAmount,
        items: {
          create: items.map((item) => ({
            menuItemId: item.menuItemId,
            variationId: item.variationId ?? null,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
        },
      },
      include: {
        items: {
          include: {
            menuItem: true,
            variation: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        id: order.id,
        orderId: `ORD-${String(order.id).padStart(4, "0")}`,
        status: order.status,
        totalAmount: Number(order.totalAmount),
        orderType: order.orderType,
        items: order.items.map((i) => ({
          name: i.menuItem.name,
          variation: i.variation?.name ?? null,
          quantity: i.quantity,
          unitPrice: Number(i.unitPrice),
        })),
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Order creation failed:", err);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const orders = await db.order.findMany({
      where: { status: { in: ["PENDING", "PREPARING", "READY"] } },
      include: {
        items: { include: { menuItem: true, variation: true } },
        table: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(
      orders.map((o) => ({
        id: o.id,
        orderId: `ORD-${String(o.id).padStart(4, "0")}`,
        status: o.status,
        orderType: o.orderType,
        totalAmount: Number(o.totalAmount),
        table: o.table?.name ?? null,
        createdAt: o.createdAt,
        items: o.items.map((i) => ({
          name: i.menuItem.name,
          variation: i.variation?.name ?? null,
          quantity: i.quantity,
          unitPrice: Number(i.unitPrice),
        })),
      }))
    );
  } catch {
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}
