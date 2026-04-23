import { NextRequest, NextResponse } from "next/server";
import { requireAdminApiAccess } from "@/lib/admin-api-guard";
import { createAdminScholarship, listAdminScholarships } from "@/lib/admin-scholarships";

export async function GET(request: NextRequest) {
  const denial = requireAdminApiAccess(request);
  if (denial) return denial;

  try {
    const sp = request.nextUrl.searchParams;
    const result = await listAdminScholarships({
      search: sp.get("search") || "",
      activeOnly: sp.get("activeOnly") === "true",
      year: sp.get("year") || "All",
      page: Number(sp.get("page") || "1"),
      pageSize: Number(sp.get("pageSize") || "10"),
    });
    return NextResponse.json(result);
  } catch (error) {
    console.error("Admin scholarships GET error", error);
    return NextResponse.json({ message: "Unable to load scholarships." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const denial = requireAdminApiAccess(request);
  if (denial) return denial;

  try {
    const body = await request.json();

    const scholarshipName = body.scholarshipName?.trim();
    const providerNames: string[] = Array.isArray(body.providerNames) ? body.providerNames.filter((p: string) => p.trim()) : [];
    const scholarshipYear = body.scholarshipYear?.trim();
    const amountInr = Number(body.amountInr);
    const seats = Number(body.seats);
    const deadlineDate = body.deadlineDate?.trim();
    const eligibilityCriteria: string[] = Array.isArray(body.eligibilityCriteria) ? body.eligibilityCriteria.filter((c: string) => c.trim()) : [];
    const description = body.description?.trim();
    const contactEmail = body.contactEmail?.trim().toLowerCase();
    const contactPhone = body.contactPhone?.trim();

    if (!scholarshipName || providerNames.length === 0 || !scholarshipYear || !deadlineDate || eligibilityCriteria.length === 0 || !description || !contactEmail || !contactPhone) {
      return NextResponse.json({ message: "All fields are required. Providers and eligibility must have at least one entry." }, { status: 400 });
    }
    if (!Number.isFinite(amountInr) || amountInr < 0) {
      return NextResponse.json({ message: "Amount must be a valid positive number." }, { status: 400 });
    }
    if (!Number.isInteger(seats) || seats <= 0) {
      return NextResponse.json({ message: "Seats must be a valid integer > 0." }, { status: 400 });
    }

    const created = await createAdminScholarship({ scholarshipName, providerNames, scholarshipYear, amountInr, seats, deadlineDate, eligibilityCriteria, description, contactEmail, contactPhone });
    return NextResponse.json({ scholarship: created }, { status: 201 });
  } catch (error) {
    console.error("Admin scholarships POST error", error);
    return NextResponse.json({ message: "Unable to create scholarship." }, { status: 500 });
  }
}
