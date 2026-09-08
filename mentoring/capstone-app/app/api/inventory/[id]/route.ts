import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

const LOW_STOCK_THRESHOLD = 20;

function calculateStatus(quantity: number) {
  if (quantity === 0) return "OUT_OF_STOCK";
  if (quantity < LOW_STOCK_THRESHOLD) return "LOW";
  return "GOOD";
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const itemId = parseInt(params.id);
    const body = await request.json();
    const { name, categoryId, stockQuantity, unit, supplier, expiryDate } = body;

    // Get current item
    const item = await db.inventoryItem.findUnique({
      where: { id: itemId },
    });

    if (!item) {
      return NextResponse.json(
        { error: "Item not found" },
        { status: 404 }
      );
    }

    // Calculate new status if quantity changed
    const quantity = stockQuantity !== undefined ? parseFloat(stockQuantity) : Number(item.stockQuantity);
    const status = calculateStatus(quantity);

    const updatedItem = await db.inventoryItem.update({
      where: { id: itemId },
      data: {
        ...(name && { name }),
        ...(categoryId && { categoryId: parseInt(categoryId) }),
        ...(stockQuantity !== undefined && { stockQuantity: quantity }),
        ...(unit && { unit }),
        ...(supplier && { supplier }),
        ...(expiryDate !== undefined && {
          expiryDate: expiryDate ? new Date(expiryDate) : null,
        }),
        status,
        updatedById: parseInt(session.user.id),
      },
      include: {
        category: true,
        updatedBy: true,
      },
    });

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error("Inventory update error:", error);
    return NextResponse.json(
      { error: "Failed to update inventory item" },
      { status: 500 }
    );
  }
}
