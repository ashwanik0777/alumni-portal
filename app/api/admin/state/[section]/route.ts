import { NextRequest, NextResponse } from "next/server";
import { requireAdminApiAccess } from "@/lib/admin-api-guard";
import { getAdminState, saveAdminState } from "@/lib/admin-state";

const allowedSections = new Set(["members", "programs", "events", "requests", "finance", "analytics"]);

type RouteContext = {
  params: Promise<{ section: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const denial = requireAdminApiAccess(request);
  if (denial) return denial;

  try {
    const { section } = await context.params;
    if (!allowedSections.has(section)) {
      return NextResponse.json({ message: "Invalid admin section." }, { status: 400 });
    }

    const state = await getAdminState(`section:${section}`);
    return NextResponse.json({ state });
  } catch (error) {
    console.error("Admin state GET error", error);
    return NextResponse.json({ message: "Unable to load admin state." }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const denial = requireAdminApiAccess(request);
  if (denial) return denial;

  try {
    const { section } = await context.params;
    if (!allowedSections.has(section)) {
      return NextResponse.json({ message: "Invalid admin section." }, { status: 400 });
    }

    const body = (await request.json()) as { state?: Record<string, unknown> };
    if (!body.state || typeof body.state !== "object") {
      return NextResponse.json({ message: "State payload is required." }, { status: 400 });
    }

    await saveAdminState(`section:${section}`, body.state);
    return NextResponse.json({ message: "Admin state saved." });
  } catch (error) {
    console.error("Admin state PUT error", error);
    return NextResponse.json({ message: "Unable to save admin state." }, { status: 500 });
  }
}
