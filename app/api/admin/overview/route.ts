import { NextRequest, NextResponse } from "next/server";
import { requireAdminApiAccess } from "@/lib/admin-api-guard";
import { getAdminState, saveAdminState } from "@/lib/admin-state";

type OverviewStat = {
  label: string;
  value: string;
  delta: string;
};

type OverviewFeedItem = {
  id: string;
  title: string;
  time: string;
  status: "success" | "pending";
  createdAt: string;
};

type OverviewState = {
  fiscalYear: string;
  syncMode: string;
  stats: OverviewStat[];
  feed: OverviewFeedItem[];
};

const OVERVIEW_KEY = "overview:dashboard";

function getDefaultOverviewState(): OverviewState {
  const now = new Date().toISOString();
  return {
    fiscalYear: "FY 2026",
    syncMode: "Live Sync",
    stats: [
      { label: "Registered Alumni", value: "4,284", delta: "+8.2%" },
      { label: "Active Mentorship", value: "326", delta: "+5.1%" },
      { label: "Monthly Donations", value: "₹3.4L", delta: "+12.4%" },
      { label: "Weekly Activity", value: "1,942", delta: "+3.6%" },
    ],
    feed: [
      { id: `OVR-${Date.now()}-1`, title: "25 new alumni profiles approved", time: "10 minutes ago", status: "success", createdAt: now },
      { id: `OVR-${Date.now()}-2`, title: "Mentorship request batch assigned", time: "45 minutes ago", status: "success", createdAt: now },
      { id: `OVR-${Date.now()}-3`, title: "2 profile verification checks pending", time: "1 hour ago", status: "pending", createdAt: now },
      { id: `OVR-${Date.now()}-4`, title: "Monthly donation summary generated", time: "2 hours ago", status: "success", createdAt: now },
    ],
  };
}

function applyQuickAction(current: OverviewState, actionId: string) {
  const actionMap: Record<string, { title: string; status: "success" | "pending" }> = {
    "approve-members": { title: "Bulk approval action executed for pending members", status: "success" },
    "assign-mentors": { title: "Mentors assigned to current active program slots", status: "success" },
    "publish-event": { title: "Upcoming event notice published to community feed", status: "success" },
    "review-donations": { title: "Donation review workflow triggered for finance team", status: "pending" },
  };

  const selectedAction = actionMap[actionId];
  if (!selectedAction) {
    return null;
  }

  const now = new Date();
  const nextFeedItem: OverviewFeedItem = {
    id: `OVR-${Date.now()}`,
    title: selectedAction.title,
    time: "Just now",
    status: selectedAction.status,
    createdAt: now.toISOString(),
  };

  return {
    ...current,
    feed: [nextFeedItem, ...current.feed].slice(0, 20),
  };
}

export async function GET(request: NextRequest) {
  const denial = requireAdminApiAccess(request);
  if (denial) return denial;

  try {
    const existing = (await getAdminState(OVERVIEW_KEY)) as OverviewState | null;
    if (existing?.stats && existing?.feed) {
      return NextResponse.json({ overview: existing });
    }

    const seed = getDefaultOverviewState();
    await saveAdminState(OVERVIEW_KEY, seed);
    return NextResponse.json({ overview: seed });
  } catch (error) {
    console.error("Admin overview GET error", error);
    return NextResponse.json({ message: "Unable to load admin overview data." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const denial = requireAdminApiAccess(request);
  if (denial) return denial;

  try {
    const body = (await request.json()) as { actionId?: string };
    if (!body.actionId) {
      return NextResponse.json({ message: "actionId is required." }, { status: 400 });
    }

    const existing = ((await getAdminState(OVERVIEW_KEY)) as OverviewState | null) || getDefaultOverviewState();
    const updated = applyQuickAction(existing, body.actionId);

    if (!updated) {
      return NextResponse.json({ message: "Invalid quick action." }, { status: 400 });
    }

    await saveAdminState(OVERVIEW_KEY, updated);
    return NextResponse.json({ overview: updated, message: "Overview updated." });
  } catch (error) {
    console.error("Admin overview POST error", error);
    return NextResponse.json({ message: "Unable to run admin action." }, { status: 500 });
  }
}
