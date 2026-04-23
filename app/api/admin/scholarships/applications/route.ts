import { NextRequest, NextResponse } from "next/server";
import { requireAdminApiAccess } from "@/lib/admin-api-guard";
import { listApplications } from "@/lib/admin-scholarships";

export async function GET(request: NextRequest) {
  const denial = requireAdminApiAccess(request);
  if (denial) return denial;

  try {
    const sp = request.nextUrl.searchParams;
    const result = await listApplications({
      scholarshipId: sp.get("scholarshipId") || undefined,
      status: sp.get("status") || "All",
      page: Number(sp.get("page") || "1"),
      pageSize: Number(sp.get("pageSize") || "20"),
    });
    return NextResponse.json(result);
  } catch (error) {
    console.error("Admin applications GET error", error);
    return NextResponse.json({ message: "Unable to load applications." }, { status: 500 });
  }
}
