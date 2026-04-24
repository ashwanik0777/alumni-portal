import { NextRequest, NextResponse } from "next/server";
import { getPageViews, incrementAndGetPageViews } from "@/lib/home-data";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const shouldIncrement = request.nextUrl.searchParams.get("increment") === "true";
    
    let count = 0;
    if (shouldIncrement) {
      count = await incrementAndGetPageViews();
    } else {
      count = await getPageViews();
    }
    
    return NextResponse.json({ count }, {
      headers: { "Cache-Control": "no-store" } // Real-time counter should not be cached
    });
  } catch (error) {
    console.error("Counter API Error:", error);
    return NextResponse.json({ count: 120 }); // Fallback
  }
}
