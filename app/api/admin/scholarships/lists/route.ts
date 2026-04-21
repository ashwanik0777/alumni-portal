import { NextRequest, NextResponse } from "next/server";
import { requireAdminApiAccess } from "@/lib/admin-api-guard";
import { listAdminScholarshipsByStatus } from "@/lib/admin-scholarships";

export async function GET(request: NextRequest) {
  const denial = requireAdminApiAccess(request);
  if (denial) return denial;

  try {
    const type = request.nextUrl.searchParams.get("type");

    if (type !== "approved" && type !== "rejected") {
      return NextResponse.json({ message: "Valid type is required: approved or rejected." }, { status: 400 });
    }

    const status = type === "approved" ? "Approved" : "Rejected";
    const rows = await listAdminScholarshipsByStatus(status);

    return NextResponse.json(
      { rows },
      {
        headers: {
          "Cache-Control": "private, max-age=20, stale-while-revalidate=40",
        },
      },
    );
  } catch (error) {
    console.error("Scholarship status list GET error", error);
    return NextResponse.json({ message: "Unable to load scholarship list." }, { status: 500 });
  }
}
