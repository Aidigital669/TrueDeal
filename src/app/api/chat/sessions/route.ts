import { NextResponse } from "next/server";
import {
  listUserChatSessions,
  getOrCreateChatSession,
  clearAllUserChatSessions,
  getEffectiveUserId
} from "@/lib/chat-db";
import { getCurrentUserSession } from "@/lib/auth-actions";

export async function GET(req: Request) {
  try {
    const user = await getCurrentUserSession();
    // History is visible once user logs in
    if (!user || !user.userId) {
      return NextResponse.json({
        success: true,
        isLoggedIn: false,
        sessions: []
      });
    }

    const url = new URL(req.url);
    const searchQuery = url.searchParams.get("q") || undefined;

    const sessions = await listUserChatSessions(user.userId, searchQuery);
    return NextResponse.json({
      success: true,
      isLoggedIn: true,
      userId: user.userId,
      sessions
    });
  } catch (error: any) {
    console.error("Failed to list chat sessions:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load chat history" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUserSession();
    const userId = user?.userId || (await getEffectiveUserId());
    const body = await req.json().catch(() => ({}));
    const initialPrompt = body.prompt || "New Conversation";

    const session = await getOrCreateChatSession(undefined, userId, initialPrompt);
    return NextResponse.json({
      success: true,
      session
    });
  } catch (error: any) {
    console.error("Failed to create chat session:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create session" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const user = await getCurrentUserSession();
    if (!user || !user.userId) {
      return NextResponse.json({ success: true, deletedCount: 0 });
    }

    const deletedCount = await clearAllUserChatSessions(user.userId);
    return NextResponse.json({
      success: true,
      deletedCount
    });
  } catch (error: any) {
    console.error("Failed to clear chat sessions:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to clear history" },
      { status: 500 }
    );
  }
}
