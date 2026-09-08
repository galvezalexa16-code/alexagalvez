import { NextResponse } from "next/server";
import { getTopSellingItems } from "@/lib/analytics";

export async function GET() {
  try {
    const items = await getTopSellingItems();
    return NextResponse.json(items);
  } catch (error) {
    console.error("Top items error:", error);
    return NextResponse.json(
      { error: "Failed to fetch top items" },
      { status: 500 }
    );
  }
}
