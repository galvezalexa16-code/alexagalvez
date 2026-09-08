import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import type { OrderType } from "@prisma/client";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderType, tableId, items } = body;

    // Validate input
    if (!orderType || !items || items.length === 0) {
      return NextResponse.json(
        { error: "Invalid order data" },
        { status: 400 }
      );
    }

    // Validate order type
    if (!["DINE_IN", "TAKE_OUT"].includes(orderType)) {
      return NextResponse.json(
        { error: "Invalid order type" },
        { status: 400 }
      );
    }

    // Validate inventory availability
    for (const item of items) {
      const menuItem = await db.menuItem.findUnique({
        where: { id: item.menuItemId },
      });

      if (!menuItem || menuItem.isArchived) {
        return NextResponse.json(
          { error: `Item not found: ${item.menuItemId}` },
          { status: 400 }
        );
      }
    }

    // Calculate total amount
    let totalAmount = 0;
    const orderItems = items.map((item: any) => {
      const itemTotal = Number(item.unitPrice) * item.quantity;
      totalAmount += itemTotal;
      return {
        menuItemId: item.menuItemId,
        variationId: item.variationId || null,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      };
    });

    // Create order
    const order = await db.order.create({
      data: {
        tableId: tableId || null,
        orderType: orderType as OrderType,
        status: "PENDING",
        totalAmount: totalAmount.toString(),
        items: {
          create: orderItems,
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

    return NextResponse.json(order);
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const orderId = searchParams.get("id");

    let where: any = {};

    if (orderId) {
      where.id = parseInt(orderId);
    }

    if (status) {
      where.status = status;
    }

    const orders = await db.order.findMany({
      where,
      include: {
        items: {
          include: {
            menuItem: true,
            variation: true,
          },
        },
        transaction: true,
        table: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Orders fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
