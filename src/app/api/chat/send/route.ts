import { NextResponse } from "next/server";
import {
  getEffectiveUserId,
  getOrCreateChatSession,
  saveChatMessage,
  getSessionMessages
} from "@/lib/chat-db";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const message = (body.message || "").trim();
    let sessionId = body.sessionId?.trim() || undefined;

    if (!message) {
      return NextResponse.json(
        { success: false, error: "Message cannot be empty." },
        { status: 400 }
      );
    }

    const userId = await getEffectiveUserId();

    // 1. Get or create session
    const session = await getOrCreateChatSession(sessionId, userId, message);
    sessionId = session.sessionId;

    // 2. Fetch recent conversation history to provide conversational multi-turn context
    const previousMessages = await getSessionMessages(sessionId, userId);
    const conversationHistory = previousMessages.slice(-6).map(m => ({
      role: m.role,
      content: m.content
    }));

    // 3. Persist user message to chat_messages
    const userMsgDoc = await saveChatMessage(sessionId, userId, "user", message);

    // 4. Process the query with TrueDeal's Search & AI Engine
    let assistantText = "I'm looking into your request on TrueDeal.";
    let appliedFilters: string[] = ["✨ TrueDeal Intelligence"];
    let suggestedFollowUps: string[] = [];
    let listings: any[] = [];
    let companyProfile: any = null;

    try {
      // Internal call to /api/search-listings with absolute or relative URL
      const host = req.headers.get("host") || "localhost:3000";
      const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
      const searchRes = await fetch(`${protocol}://${host}/api/search-listings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          query: message, 
          visitorId: userId,
          conversationHistory
        })
      });

      if (searchRes.ok) {
        const searchData = await searchRes.json();
        if (searchData.success) {
          assistantText = searchData.text || assistantText;
          appliedFilters = searchData.appliedFilters || appliedFilters;
          suggestedFollowUps = searchData.suggestedFollowUps || [];
          listings = searchData.listings || [];
          companyProfile = searchData.companyProfile || null;
        }
      }
    } catch (searchErr: any) {
      console.warn("Search engine fetch notice:", searchErr.message);
      assistantText = `I processed your request for "${message}". However, our search index was momentarily busy. Please try asking again.`;
    }

    // 4. Persist assistant response to chat_messages
    const assistantMsgDoc = await saveChatMessage(
      sessionId,
      userId,
      "assistant",
      assistantText,
      {
        appliedFilters,
        suggestedFollowUps,
        listings,
        companyProfile
      }
    );

    return NextResponse.json({
      success: true,
      sessionId,
      sessionTitle: session.title,
      userMessage: userMsgDoc,
      assistantMessage: assistantMsgDoc
    });
  } catch (error: any) {
    console.error("Error in /api/chat/send:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process chat message" },
      { status: 500 }
    );
  }
}
