import { NextRequest, NextResponse } from "next/server";
import { requireUserApiAccess } from "@/lib/user-api-guard";
import { getUserConversations, getConversationMessages, sendMessage, markConversationRead } from "@/lib/user-messages";

export async function GET(request: NextRequest) {
  const guardResult = await requireUserApiAccess(request);
  if (guardResult) return guardResult;

  const email = request.nextUrl.searchParams.get("email")?.trim().toLowerCase();
  const conversationId = request.nextUrl.searchParams.get("conversationId");
  
  if (!email) {
    return NextResponse.json({ message: "Email is required." }, { status: 400 });
  }

  try {
    if (conversationId) {
      const messages = await getConversationMessages(conversationId);
      return NextResponse.json({ messages });
    }

    const conversations = await getUserConversations(email);
    return NextResponse.json({ conversations });
  } catch (error) {
    console.error("User messages GET error", error);
    return NextResponse.json({ message: "Failed to load messages." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const guardResult = await requireUserApiAccess(request);
  if (guardResult) return guardResult;

  try {
    const body = await request.json();
    const { action, conversationId, text } = body;

    if (!conversationId) {
      return NextResponse.json({ message: "conversationId is required." }, { status: 400 });
    }

    if (action === "read") {
      await markConversationRead(conversationId);
      return NextResponse.json({ ok: true });
    }

    if (!text?.trim()) {
      return NextResponse.json({ message: "Message text is required." }, { status: 400 });
    }

    const msg = await sendMessage(conversationId, text);
    return NextResponse.json({ message: msg });
  } catch (error) {
    console.error("User messages POST error", error);
    return NextResponse.json({ message: "Failed to process message." }, { status: 500 });
  }
}
