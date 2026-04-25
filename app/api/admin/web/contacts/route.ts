import { NextRequest, NextResponse } from "next/server";
import { requireAdminApiAccess } from "@/lib/admin-api-guard";
import { getAllContacts, addContact, deleteContact, toggleContact } from "@/lib/site-content";

export async function GET(request: NextRequest) {
  const d = requireAdminApiAccess(request); if (d) return d;
  try { return NextResponse.json({ contacts: await getAllContacts() }); }
  catch (e) { console.error(e); return NextResponse.json({ message: "Failed" }, { status: 500 }); }
}

export async function POST(request: NextRequest) {
  const d = requireAdminApiAccess(request); if (d) return d;
  try {
    const body = await request.json();
    if (!body.title || !body.detail) return NextResponse.json({ message: "Title and detail required" }, { status: 400 });
    const result = await addContact(body);
    return NextResponse.json({ message: "Contact added", ...result });
  } catch (e) { console.error(e); return NextResponse.json({ message: "Failed" }, { status: 500 }); }
}

export async function DELETE(request: NextRequest) {
  const d = requireAdminApiAccess(request); if (d) return d;
  try {
    const { id } = await request.json();
    await deleteContact(id);
    return NextResponse.json({ message: "Deleted" });
  } catch (e) { console.error(e); return NextResponse.json({ message: "Failed" }, { status: 500 }); }
}

export async function PATCH(request: NextRequest) {
  const d = requireAdminApiAccess(request); if (d) return d;
  try {
    const { id, isActive } = await request.json();
    await toggleContact(id, isActive);
    return NextResponse.json({ message: "Updated" });
  } catch (e) { console.error(e); return NextResponse.json({ message: "Failed" }, { status: 500 }); }
}
