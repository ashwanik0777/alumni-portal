import { NextRequest, NextResponse } from "next/server";
import { requireAdminApiAccess } from "@/lib/admin-api-guard";
import { getSettingsStats } from "@/lib/admin-settings-stats";

export async function GET(request: NextRequest) {
  const denial = requireAdminApiAccess(request);
  if (denial) return denial;

  try {
    const stats = await getSettingsStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error("Admin settings stats GET error", error);
    return NextResponse.json({ message: "Unable to load stats." }, { status: 500 });
  }
}
