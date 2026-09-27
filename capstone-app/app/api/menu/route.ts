import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const items = await db.menuItem.findMany({
      where: { isArchived: false },
      include: {
        category: true,
        variations: true,
      },
      orderBy: { createdAt: "asc" },
    });

    const serialized = items.map((item) => ({
      id: item.id,
      name: item.name,
      price: Number(item.price),
      imageUrl: item.imageUrl || null,
      isArchived: item.isArchived,
      category: { id: item.category.id, name: item.category.name },
      variations: item.variations.map((v) => ({
        id: v.id,
        name: v.name,
        priceMod: Number(v.priceMod),
      })),
    }));

    return NextResponse.json(serialized);
  } catch {
    return NextResponse.json({ error: "Failed to fetch menu" }, { status: 500 });
  }
}
