import { NextRequest, NextResponse } from "next/server";
import { requireUserApiAccess } from "@/lib/user-api-guard";
import { isBlocked } from "@/lib/user-security";
import {
  getUserConversations,
  getConversationMessages,
  sendMessage,
  clearChatHistory,
  editMessage,
} from "@/lib/user-messages";

export async function GET(request: NextRequest) {
  const guardResult = await requireUserApiAccess(request);
  if (guardResult) return guardResult;

  const email = request.cookies.get("auth_email")?.value?.trim().toLowerCase();
  if (!email) {
    return NextResponse.json({ message: "User email not found in session." }, { status: 401 });
  }

  const conversationId = request.nextUrl.searchParams.get("conversationId");

  try {
    if (conversationId) {
      const messages = await getConversationMessages(email, conversationId);
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

  const email = request.cookies.get("auth_email")?.value?.trim().toLowerCase();
  if (!email) {
    return NextResponse.json({ message: "User email not found in session." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { action, conversationId, text, messageId } = body;

    // Handle clear chat action
    if (action === "clear") {
      if (!conversationId) {
        return NextResponse.json({ message: "conversationId is required to clear chat." }, { status: 400 });
      }
      const res = await clearChatHistory(email, conversationId);
      return NextResponse.json(res);
    }

    // Handle edit message action
    if (action === "edit") {
      if (!messageId || !text?.trim()) {
        return NextResponse.json({ message: "messageId and text are required to edit." }, { status: 400 });
      }
      const res = await editMessage(messageId, email, text);
      if (!res.ok) {
        return NextResponse.json({ message: res.message }, { status: 400 });
      }
      return NextResponse.json(res);
    }

    // Handle standard send message
    if (!conversationId || !text?.trim()) {
      return NextResponse.json({ message: "conversationId and text are required to send a message." }, { status: 400 });
    }

    const blocked = await isBlocked(email, conversationId);
    if (blocked) {
      return NextResponse.json(
        { message: "Unable to send message. A block relationship exists between these users." },
        { status: 403 }
      );
    }

    const msg = await sendMessage(email, conversationId, text);
    return NextResponse.json({ message: msg });
  } catch (error) {
    console.error("User messages POST error", error);
    return NextResponse.json({ message: "Failed to process message." }, { status: 500 });
  }
}
