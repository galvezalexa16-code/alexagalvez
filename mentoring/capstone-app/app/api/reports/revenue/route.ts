import { NextResponse } from "next/server";
import { calculateRevenueTrend } from "@/lib/analytics";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = (searchParams.get("period") as "day" | "week" | "month" | "year") || "week";

    const trend = await calculateRevenueTrend(period);
    return NextResponse.json(trend);
  } catch (error) {
    console.error("Revenue trend error:", error);
    return NextResponse.json(
      { error: "Failed to fetch revenue trend" },
      { status: 500 }
    );
  }
}
