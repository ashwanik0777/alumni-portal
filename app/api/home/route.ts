import { NextResponse } from "next/server";
import { getHomeDynamicData } from "@/lib/home-data";

// Since this is the public homepage, we can aggressively cache this on the server
// to ensure the homepage loads instantly for all visitors while still updating occasionally.
export const revalidate = 30; // Revalidate every 30 seconds

export async function GET() {
  try {
    const data = await getHomeDynamicData();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Home API Error:", error);
    return NextResponse.json({ message: "Failed to load home data." }, { status: 500 });
  }
}
