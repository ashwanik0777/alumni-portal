import { NextResponse } from "next/server";
import { getActiveContacts } from "@/lib/site-content";

export async function GET() {
  try {
    const contacts = await getActiveContacts();
    return NextResponse.json({ contacts }, { headers: { "Cache-Control": "public, max-age=120, stale-while-revalidate=300" } });
  } catch (error) {
    console.error("Public contacts GET error:", error);
    return NextResponse.json({ message: "Failed to fetch contacts" }, { status: 500 });
  }
}
