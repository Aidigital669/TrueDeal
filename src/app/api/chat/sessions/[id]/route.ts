import { NextResponse } from "next/server";
import {
  getEffectiveUserId,
  getSessionMessages,
  renameChatSession,
  togglePinChatSession,
  deleteChatSession
} from "@/lib/chat-db";

export async function GET(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const sessionId = params.id;
    const userId = await getEffectiveUserId();

    const messages = await getSessionMessages(sessionId, userId);
    return NextResponse.json({
      success: true,
      sessionId,
      messages
    });
  } catch (error: any) {
    console.error("Failed to load session messages:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load messages" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const sessionId = params.id;
    const userId = await getEffectiveUserId();
    const body = await req.json().catch(() => ({}));

    if (body.title !== undefined) {
      const success = await renameChatSession(sessionId, userId, body.title);
      return NextResponse.json({ success, title: body.title });
    }

    if (body.isPinned !== undefined) {
      const success = await togglePinChatSession(sessionId, userId, Boolean(body.isPinned));
      return NextResponse.json({ success, isPinned: body.isPinned });
    }

    return NextResponse.json({ success: false, error: "No valid action provided" }, { status: 400 });
  } catch (error: any) {
    console.error("Failed to update session:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update session" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const sessionId = params.id;
    const userId = await getEffectiveUserId();

    const success = await deleteChatSession(sessionId, userId);
    return NextResponse.json({
      success
    });
  } catch (error: any) {
    console.error("Failed to delete session:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete session" },
      { status: 500 }
    );
  }
}
