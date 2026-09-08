import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

const LOW_STOCK_THRESHOLD = 20;

function calculateStatus(quantity: number) {
  if (quantity === 0) return "OUT_OF_STOCK";
  if (quantity < LOW_STOCK_THRESHOLD) return "LOW";
  return "GOOD";
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    let where: any = {};

    if (category && category !== "all") {
      where.category = {
        id: parseInt(category),
      };
    }

    if (status && status !== "all") {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { supplier: { contains: search, mode: "insensitive" } },
      ];
    }

    const items = await db.inventoryItem.findMany({
      where,
      include: {
        category: true,
        updatedBy: true,
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(items);
  } catch (error) {
    console.error("Inventory fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch inventory" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, categoryId, stockQuantity, unit, supplier, expiryDate } = body;

    // Validate input
    if (!name || !categoryId || stockQuantity === undefined || !unit || !supplier) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Calculate initial status
    const status = calculateStatus(parseFloat(stockQuantity));

    const item = await db.inventoryItem.create({
      data: {
        name,
        categoryId: parseInt(categoryId),
        stockQuantity: parseFloat(stockQuantity),
        unit,
        supplier,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        status,
        updatedById: parseInt(session.user.id),
      },
      include: {
        category: true,
        updatedBy: true,
      },
    });

    return NextResponse.json(item);
  } catch (error) {
    console.error("Inventory creation error:", error);
    return NextResponse.json(
      { error: "Failed to create inventory item" },
      { status: 500 }
    );
  }
}
