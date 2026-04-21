import { NextRequest, NextResponse } from "next/server";
import { requireAdminApiAccess } from "@/lib/admin-api-guard";
import { bulkApprovePendingScholarships } from "@/lib/admin-scholarships";

export async function POST(request: NextRequest) {
  const denial = requireAdminApiAccess(request);
  if (denial) return denial;

  try {
    const updatedCount = await bulkApprovePendingScholarships();
    return NextResponse.json({ updatedCount });
  } catch (error) {
    console.error("Admin scholarships bulk approve error", error);
    return NextResponse.json({ message: "Unable to run bulk approve." }, { status: 500 });
  }
}
