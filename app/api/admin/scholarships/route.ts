import { NextRequest, NextResponse } from "next/server";
import { requireAdminApiAccess } from "@/lib/admin-api-guard";
import { createAdminScholarship, listAdminScholarships } from "@/lib/admin-scholarships";

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

    const result = await listAdminScholarships({ search, status, year, page, pageSize });
    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "private, max-age=10, stale-while-revalidate=20",
      },
    });
  } catch (error) {
    console.error("Admin scholarships GET error", error);
    return NextResponse.json({ message: "Unable to load scholarships." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const denial = requireAdminApiAccess(request);
  if (denial) return denial;

  try {
    const body = (await request.json()) as {
      scholarshipName?: string;
      providerName?: string;
      scholarshipYear?: string;
      amountInr?: number;
      seats?: number;
      deadlineDate?: string;
      eligibilityCriteria?: string;
      description?: string;
      contactEmail?: string;
      contactPhone?: string;
    };

    const scholarshipName = body.scholarshipName?.trim();
    const providerName = body.providerName?.trim();
    const scholarshipYear = body.scholarshipYear?.trim();
    const amountInr = Number(body.amountInr);
    const seats = Number(body.seats);
    const deadlineDate = body.deadlineDate?.trim();
    const eligibilityCriteria = body.eligibilityCriteria?.trim();
    const description = body.description?.trim();
    const contactEmail = body.contactEmail?.trim().toLowerCase();
    const contactPhone = body.contactPhone?.trim();

    if (!scholarshipName || !providerName || !scholarshipYear || !deadlineDate || !eligibilityCriteria || !description || !contactEmail || !contactPhone) {
      return NextResponse.json({ message: "All scholarship fields are required." }, { status: 400 });
    }

    if (!Number.isFinite(amountInr) || amountInr < 0) {
      return NextResponse.json({ message: "Amount must be a valid positive number." }, { status: 400 });
    }

    if (!Number.isInteger(seats) || seats <= 0) {
      return NextResponse.json({ message: "Seats must be a valid integer greater than 0." }, { status: 400 });
    }

    const created = await createAdminScholarship({
      scholarshipName,
      providerName,
      scholarshipYear,
      amountInr,
      seats,
      deadlineDate,
      eligibilityCriteria,
      description,
      contactEmail,
      contactPhone,
    });

    return NextResponse.json({ scholarship: created }, { status: 201 });
  } catch (error) {
    console.error("Admin scholarships POST error", error);
    return NextResponse.json({ message: "Unable to create scholarship." }, { status: 500 });
  }
}
