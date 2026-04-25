import { NextRequest, NextResponse } from "next/server";
import { requireAdminApiAccess } from "@/lib/admin-api-guard";
import {
  getWebTestimonials,
  addWebTestimonial,
  deleteWebTestimonial,
  toggleTestimonialStatus,
  updateWebTestimonial,
  getWebCommittee,
  addWebCommittee,
  deleteWebCommittee,
  toggleCommitteeStatus,
  updateWebCommittee,
} from "@/lib/admin-web";

export async function GET(request: NextRequest) {
  const guardResult = requireAdminApiAccess(request);
  if (guardResult) return guardResult;

  try {
    const [testimonials, committee] = await Promise.all([
      getWebTestimonials(),
      getWebCommittee(),
    ]);

    return NextResponse.json({ testimonials, committee });
  } catch (error) {
    console.error("Admin web GET error", error);
    return NextResponse.json({ message: "Failed to load website data." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const guardResult = requireAdminApiAccess(request);
  if (guardResult) return guardResult;

  try {
    const body = await request.json();
    const { action, type, payload, id, isActive } = body;

    if (type === "testimonial") {
      if (action === "create") {
        const result = await addWebTestimonial(payload);
        return NextResponse.json({ message: "Testimonial added.", id: result.id });
      }
      if (action === "toggle") {
        await toggleTestimonialStatus(id, isActive);
        return NextResponse.json({ message: "Status updated." });
      }
      if (action === "delete") {
        await deleteWebTestimonial(id);
        return NextResponse.json({ message: "Testimonial deleted." });
      }
      if (action === "update") {
        await updateWebTestimonial(id, payload);
        return NextResponse.json({ message: "Testimonial updated." });
      }
    }

    if (type === "committee") {
      if (action === "create") {
        const result = await addWebCommittee(payload);
        return NextResponse.json({ message: "Member added.", id: result.id });
      }
      if (action === "toggle") {
        await toggleCommitteeStatus(id, isActive);
        return NextResponse.json({ message: "Status updated." });
      }
      if (action === "delete") {
        await deleteWebCommittee(id);
        return NextResponse.json({ message: "Member deleted." });
      }
      if (action === "update") {
        await updateWebCommittee(id, payload);
        return NextResponse.json({ message: "Member updated." });
      }
    }

    return NextResponse.json({ message: "Invalid action or type." }, { status: 400 });
  } catch (error) {
    console.error("Admin web POST error", error);
    return NextResponse.json({ message: "Action failed." }, { status: 500 });
  }
}
