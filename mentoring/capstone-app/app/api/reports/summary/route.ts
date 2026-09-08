import { NextResponse } from "next/server";
import { getSummaryStats } from "@/lib/analytics";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = (searchParams.get("period") as "day" | "week" | "month" | "year") || "week";

    const stats = await getSummaryStats(period);
    return NextResponse.json(stats);
  } catch (error) {
    console.error("Summary stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch summary stats" },
      { status: 500 }
    );
  }
}
