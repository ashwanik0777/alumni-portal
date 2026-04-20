import { NextRequest, NextResponse } from "next/server";
import { requireAdminApiAccess } from "@/lib/admin-api-guard";
import { createAdminProgram, listAdminPrograms } from "@/lib/admin-programs";

export async function GET(request: NextRequest) {
  const denial = requireAdminApiAccess(request);
  if (denial) return denial;

  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "All";
    const year = searchParams.get("year") || "All";
    const page = Number(searchParams.get("page") || "1");
    const pageSize = Number(searchParams.get("pageSize") || "10");

    const result = await listAdminPrograms({ search, status, year, page, pageSize });
    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "private, max-age=10, stale-while-revalidate=20",
      },
    });
  } catch (error) {
    console.error("Admin programs GET error", error);
    return NextResponse.json({ message: "Unable to load programs." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const denial = requireAdminApiAccess(request);
  if (denial) return denial;

  try {
    const body = (await request.json()) as {
      title?: string;
      category?: string;
      programYear?: string;
      mode?: string;
      coordinatorName?: string;
      coordinatorEmail?: string;
      contactNumber?: string;
    };

    const title = body.title?.trim();
    const category = body.category?.trim();
    const programYear = body.programYear?.trim();
    const mode = body.mode?.trim();
    const coordinatorName = body.coordinatorName?.trim();
    const coordinatorEmail = body.coordinatorEmail?.trim().toLowerCase();
    const contactNumber = body.contactNumber?.trim();

    if (!title || !category || !programYear || !mode || !coordinatorName || !coordinatorEmail || !contactNumber) {
      return NextResponse.json({ message: "All program fields are required." }, { status: 400 });
    }

    const created = await createAdminProgram({
      title,
      category,
      programYear,
      mode,
      coordinatorName,
      coordinatorEmail,
      contactNumber,
    });

    return NextResponse.json({ program: created }, { status: 201 });
  } catch (error) {
    console.error("Admin programs POST error", error);
    return NextResponse.json({ message: "Unable to create program." }, { status: 500 });
  }
}
