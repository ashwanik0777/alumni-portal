import { NextRequest, NextResponse } from "next/server";
import { requireAdminApiAccess } from "@/lib/admin-api-guard";
import { getAnalyticsData } from "@/lib/admin-analytics";

export async function GET(request: NextRequest) {
  const denial = requireAdminApiAccess(request);
  if (denial) return denial;

  try {
    const data = await getAnalyticsData();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Admin analytics GET error", error);
    return NextResponse.json({ message: "Unable to load analytics." }, { status: 500 });
  }
}
