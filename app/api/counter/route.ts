import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const COUNTER_FILE = path.join(process.cwd(), "public", "counter.json");

function getCount() {
  try {
    if (!fs.existsSync(COUNTER_FILE)) {
        fs.writeFileSync(COUNTER_FILE, JSON.stringify({ count: 1240 })); // Initialize with a realistic number
    }
    const data = fs.readFileSync(COUNTER_FILE, "utf-8");
    return JSON.parse(data).count || 0;
  } catch (error) {
    return 0;
  }
}

function incrementCount() {
    try {
        const count = getCount();
        const newCount = count + 1;
        fs.writeFileSync(COUNTER_FILE, JSON.stringify({ count: newCount }));
        return newCount;
    } catch {
        return getCount();
    }
}

export async function GET(request: Request) {
  // Check for a specific 'increment' query param or just simple logic
  // Real world: check cookies/IP/fingerprint. 
  // Here: We trust the client to tell us if they are "new" via a flag, or we just return the count.
  const { searchParams } = new URL(request.url);
  const shouldIncrement = searchParams.get('increment') === 'true';

  let count = getCount();
  if (shouldIncrement) {
      count = incrementCount();
  }
  
  return NextResponse.json({ count });
}
