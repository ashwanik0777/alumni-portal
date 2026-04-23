import { NextRequest, NextResponse } from "next/server";
import { requireUserApiAccess } from "@/lib/user-api-guard";
import { listActiveScholarships, submitApplication, listUserApplications } from "@/lib/admin-scholarships";

export async function GET(request: NextRequest) {
  const denial = requireUserApiAccess(request);
  if (denial) return denial;

  try {
    const type = request.nextUrl.searchParams.get("type");

    if (type === "my-applications") {
      const email = request.nextUrl.searchParams.get("email") || "";
      if (!email) return NextResponse.json({ message: "Email is required." }, { status: 400 });
      const apps = await listUserApplications(email);
      return NextResponse.json({ applications: apps });
    }

    const scholarships = await listActiveScholarships();
    return NextResponse.json({ scholarships });
  } catch (error) {
    console.error("User scholarships GET error", error);
    return NextResponse.json({ message: "Unable to load scholarships." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const denial = requireUserApiAccess(request);
  if (denial) return denial;

  try {
    const body = await request.json();
    const { scholarshipId, fullName, email, mobile, passingYear, currentCourse, currentYear, percentage, annualIncome, statement, documentLinks } = body;

    if (!scholarshipId || !fullName?.trim() || !email?.trim() || !mobile?.trim() || !passingYear?.trim() || !currentCourse?.trim() || !currentYear?.trim() || !percentage?.trim() || !annualIncome?.trim() || !statement?.trim()) {
      return NextResponse.json({ message: "All fields are required." }, { status: 400 });
    }

    const application = await submitApplication({
      scholarshipId,
      fullName: fullName.trim(),
      email: email.trim(),
      mobile: mobile.trim(),
      passingYear: passingYear.trim(),
      currentCourse: currentCourse.trim(),
      currentYear: currentYear.trim(),
      percentage: percentage.trim(),
      annualIncome: annualIncome.trim(),
      statement: statement.trim(),
      documentLinks: Array.isArray(documentLinks) ? documentLinks.filter((l: string) => l.trim()) : [],
    });

    return NextResponse.json({ application }, { status: 201 });
  } catch (error) {
    console.error("User scholarship application POST error", error);
    return NextResponse.json({ message: "Unable to submit application." }, { status: 500 });
  }
}
