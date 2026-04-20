import { NextRequest, NextResponse } from "next/server";
import { requireAdminApiAccess } from "@/lib/admin-api-guard";
import { getAdminState, saveAdminState } from "@/lib/admin-state";

const SETTINGS_STATE_KEY = "settings:admin";

export async function GET(request: NextRequest) {
  const denial = requireAdminApiAccess(request);
  if (denial) return denial;

  try {
    const settings = await getAdminState(SETTINGS_STATE_KEY);
    return NextResponse.json({ settings });
  } catch (error) {
    console.error("Admin settings GET error", error);
    return NextResponse.json({ message: "Unable to load admin settings." }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const denial = requireAdminApiAccess(request);
  if (denial) return denial;

  try {
    const body = (await request.json()) as { settings?: Record<string, unknown> };
    if (!body.settings || typeof body.settings !== "object") {
      return NextResponse.json({ message: "Settings payload is required." }, { status: 400 });
    }

    await saveAdminState(SETTINGS_STATE_KEY, body.settings);
    return NextResponse.json({ message: "Admin settings saved." });
  } catch (error) {
    console.error("Admin settings PUT error", error);
    return NextResponse.json({ message: "Unable to save admin settings." }, { status: 500 });
  }
}
