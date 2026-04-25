import { NextRequest, NextResponse } from "next/server";
import { requireAdminApiAccess } from "@/lib/admin-api-guard";
import { getAllTeam, addTeamMember, deleteTeamMember, toggleTeamMember } from "@/lib/site-content";

export async function GET(request: NextRequest) {
  const d = requireAdminApiAccess(request); if (d) return d;
  try { return NextResponse.json({ team: await getAllTeam() }); }
  catch (e) { console.error(e); return NextResponse.json({ message: "Failed" }, { status: 500 }); }
}

export async function POST(request: NextRequest) {
  const d = requireAdminApiAccess(request); if (d) return d;
  try {
    const body = await request.json();
    if (!body.name || !body.role) return NextResponse.json({ message: "Name and role required" }, { status: 400 });
    const result = await addTeamMember(body);
    return NextResponse.json({ message: "Team member added", ...result });
  } catch (e) { console.error(e); return NextResponse.json({ message: "Failed" }, { status: 500 }); }
}

export async function DELETE(request: NextRequest) {
  const d = requireAdminApiAccess(request); if (d) return d;
  try {
    const { id } = await request.json();
    if (!id) return NextResponse.json({ message: "ID required" }, { status: 400 });
    await deleteTeamMember(id);
    return NextResponse.json({ message: "Deleted" });
  } catch (e) { console.error(e); return NextResponse.json({ message: "Failed" }, { status: 500 }); }
}

export async function PATCH(request: NextRequest) {
  const d = requireAdminApiAccess(request); if (d) return d;
  try {
    const { id, isActive } = await request.json();
    await toggleTeamMember(id, isActive);
    return NextResponse.json({ message: "Updated" });
  } catch (e) { console.error(e); return NextResponse.json({ message: "Failed" }, { status: 500 }); }
}
