import { NextRequest, NextResponse } from "next/server";
import { submitApplication } from "@/lib/admin-scholarships";
import { requireUserApiAccess } from "@/lib/user-api-guard";

export async function POST(request: NextRequest) {
  const guardResult = requireUserApiAccess(request);
  if (guardResult) return guardResult;

  try {
    const payload = await request.json();
    
    // Ensure all required fields are present
    if (!payload.scholarshipId || !payload.fullName || !payload.email || !payload.mobile) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const application = await submitApplication(payload);

    return NextResponse.json({ message: "Application submitted successfully", application });
  } catch (error) {
    console.error("Failed to submit application", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
