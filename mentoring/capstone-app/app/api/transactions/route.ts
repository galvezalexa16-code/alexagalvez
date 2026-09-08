import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import type { PaymentMethod } from "@prisma/client";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId, amountPaid, paymentMethod } = body;

    // Validate input
    if (!orderId || !amountPaid || !paymentMethod) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get the order
    const order = await db.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Check if transaction already exists
    const existingTransaction = await db.transaction.findUnique({
      where: { orderId },
    });

    if (existingTransaction) {
      return NextResponse.json(
        { error: "Transaction already recorded for this order" },
        { status: 400 }
      );
    }

    // Create transaction (using staff ID 1 as default for demo)
    // In production, this would come from authenticated session
    const transaction = await db.transaction.create({
      data: {
        orderId,
        staffId: 1,
        amountPaid: Number(amountPaid),
        paymentMethod: paymentMethod as PaymentMethod,
        status: "PAID",
      },
    });

    // Update order status to COMPLETED
    await db.order.update({
      where: { id: orderId },
      data: { status: "COMPLETED" },
    });

    return NextResponse.json(transaction);
  } catch (error) {
    console.error("Transaction creation error:", error);
    return NextResponse.json(
      { error: "Failed to create transaction" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("orderId");

    let where: any = {};

    if (orderId) {
      where.orderId = parseInt(orderId);
    }

    const transactions = await db.transaction.findMany({
      where,
      include: {
        order: true,
        staff: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(transactions);
  } catch (error) {
    console.error("Transactions fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}
