import { NextRequest, NextResponse } from "next/server";
import { requireAdminApiAccess } from "@/lib/admin-api-guard";
import { listAdminRequests, createAdminRequest, type RequestCategory, type RequestPriority } from "@/lib/admin-requests";

export async function GET(request: NextRequest) {
  const denial = requireAdminApiAccess(request);
  if (denial) return denial;

  try {
    const url = new URL(request.url);
    const result = await listAdminRequests({
      search: url.searchParams.get("search") || undefined,
      status: url.searchParams.get("status") || undefined,
      priority: url.searchParams.get("priority") || undefined,
      category: url.searchParams.get("category") || undefined,
      page: Number(url.searchParams.get("page") || "1"),
      pageSize: Number(url.searchParams.get("pageSize") || "10"),
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Admin requests GET error", error);
    return NextResponse.json({ message: "Unable to load requests." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const denial = requireAdminApiAccess(request);
  if (denial) return denial;

  try {
    const body = (await request.json()) as {
      requesterName?: string;
      requesterEmail?: string;
      subject?: string;
      description?: string;
      category?: string;
      priority?: string;
    };

    if (!body.requesterName?.trim() || !body.requesterEmail?.trim() || !body.subject?.trim()) {
      return NextResponse.json({ message: "Name, email, and subject are required." }, { status: 400 });
    }

    const validCategories = ["Support", "Feedback", "Bug Report", "Feature Request", "Account", "Other"];
    const validPriorities = ["Low", "Medium", "High", "Critical"];

    const category = validCategories.includes(body.category || "") ? (body.category as RequestCategory) : "Other";
    const priority = validPriorities.includes(body.priority || "") ? (body.priority as RequestPriority) : "Medium";

    const created = await createAdminRequest({
      requesterName: body.requesterName.trim(),
      requesterEmail: body.requesterEmail.trim().toLowerCase(),
      subject: body.subject.trim(),
      description: (body.description || "").trim(),
      category,
      priority,
    });

    return NextResponse.json({ message: "Request created.", request: created }, { status: 201 });
  } catch (error) {
    console.error("Admin requests POST error", error);
    return NextResponse.json({ message: "Unable to create request." }, { status: 500 });
  }
}
