import { NextRequest, NextResponse } from "next/server";
import { requireAdminApiAccess } from "@/lib/admin-api-guard";
import { getAllNews, addNewsStory, deleteNewsStory, toggleNewsStory } from "@/lib/news-mentorship-data";

export async function GET(request: NextRequest) {
  const denial = requireAdminApiAccess(request);
  if (denial) return denial;

  try {
    const stories = await getAllNews();
    return NextResponse.json({ stories });
  } catch (error) {
    console.error("Admin news GET error:", error);
    return NextResponse.json({ message: "Failed to fetch news" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const denial = requireAdminApiAccess(request);
  if (denial) return denial;

  try {
    const body = await request.json();
    const { title, author, excerpt } = body;
    if (!title || !author || !excerpt) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 });
    }
    const result = await addNewsStory({ title, author, excerpt });
    return NextResponse.json({ message: "News story added", ...result });
  } catch (error) {
    console.error("Admin news POST error:", error);
    return NextResponse.json({ message: "Failed to add news" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const denial = requireAdminApiAccess(request);
  if (denial) return denial;

  try {
    const { id } = await request.json();
    if (!id) return NextResponse.json({ message: "ID required" }, { status: 400 });
    await deleteNewsStory(id);
    return NextResponse.json({ message: "News story deleted" });
  } catch (error) {
    console.error("Admin news DELETE error:", error);
    return NextResponse.json({ message: "Failed to delete news" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const denial = requireAdminApiAccess(request);
  if (denial) return denial;

  try {
    const { id, isActive } = await request.json();
    if (!id || typeof isActive !== "boolean") {
      return NextResponse.json({ message: "ID and isActive required" }, { status: 400 });
    }
    await toggleNewsStory(id, isActive);
    return NextResponse.json({ message: "News story updated" });
  } catch (error) {
    console.error("Admin news PATCH error:", error);
    return NextResponse.json({ message: "Failed to update news" }, { status: 500 });
  }
}
