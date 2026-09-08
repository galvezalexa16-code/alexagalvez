import { NextResponse } from "next/server";
import { calculateProfitTrend } from "@/lib/analytics";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = (searchParams.get("period") as "day" | "week" | "month" | "year") || "week";

    const trend = await calculateProfitTrend(period);
    return NextResponse.json(trend);
  } catch (error) {
    console.error("Profit trend error:", error);
    return NextResponse.json(
      { error: "Failed to fetch profit trend" },
      { status: 500 }
    );
  }
}
