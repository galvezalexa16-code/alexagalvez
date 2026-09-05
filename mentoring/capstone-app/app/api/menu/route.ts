import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const items = await db.menuItem.findMany({
      where: { isArchived: false },
      include: {
        category: true,
        variations: true,
      },
    });
    return NextResponse.json(items);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch menu" }, { status: 500 });
  }
}
