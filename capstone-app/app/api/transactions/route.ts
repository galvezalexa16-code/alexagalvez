import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

const TransactionSchema = z.object({
  orderId: z.number(),
  amountPaid: z.number().positive(),
  paymentMethod: z.enum(["CASH", "CARD", "QRPH"]),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = TransactionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid data", details: parsed.error.flatten() }, { status: 400 });
    }

    const staffId = Number(session.user.id);

    // Mark order as completed and create transaction in one go
    const [transaction] = await db.$transaction([
      db.transaction.create({
        data: {
          orderId: parsed.data.orderId,
          staffId,
          amountPaid: parsed.data.amountPaid,
          paymentMethod: parsed.data.paymentMethod,
          status: "PAID",
        },
      }),
      db.order.update({
        where: { id: parsed.data.orderId },
        data: { status: "COMPLETED" },
      }),
    ]);

    return NextResponse.json({ id: transaction.id, status: "PAID" }, { status: 201 });
  } catch (err: any) {
    if (err?.code === "P2002") {
      return NextResponse.json({ error: "Transaction already exists for this order" }, { status: 409 });
    }
    console.error("Transaction creation failed:", err);
    return NextResponse.json({ error: "Failed to record transaction" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const transactions = await db.transaction.findMany({
      include: {
        staff: { select: { name: true } },
        order: { select: { id: true, orderType: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json(
      transactions.map((t) => ({
        id: t.id,
        orderId: t.order.id,
        staff: t.staff.name,
        amount: Number(t.amountPaid),
        method: t.paymentMethod,
        status: t.status,
        createdAt: t.createdAt,
      }))
    );
  } catch {
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 });
  }
}