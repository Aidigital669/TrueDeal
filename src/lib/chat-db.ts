import { getDb } from "./mongodb";
import { ObjectId } from "mongodb";
import { cookies } from "next/headers";
import { getCurrentUserSession } from "./auth-actions";

export const GUEST_COOKIE_NAME = "truedeal_guest_id";

export interface ChatSessionDoc {
  _id?: ObjectId;
  sessionId: string;
  userId: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  isPinned?: boolean;
  messageCount: number;
  lastMessageSnippet?: string;
}

export interface ChatMessageDoc {
  _id?: ObjectId;
  sessionId: string;
  role: "user" | "assistant" | "system";
  content: string;
  metadata?: {
    appliedFilters?: string[];
    suggestedFollowUps?: string[];
    listings?: any[];
    companyProfile?: any;
  };
  createdAt: Date;
}

/**
 * Resolve active User ID or Persistent Guest ID from cookies
 */
export async function getEffectiveUserId(): Promise<string> {
  // 1. Check logged in user session
  const user = await getCurrentUserSession();
  if (user && user.userId) {
    return user.userId;
  }

  // 2. Check guest cookie
  const cookieStore = await cookies();
  let guestId = cookieStore.get(GUEST_COOKIE_NAME)?.value;
  if (!guestId) {
    guestId = `guest_${Math.random().toString(36).substring(2, 12)}_${Date.now()}`;
    cookieStore.set(GUEST_COOKIE_NAME, guestId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 365, // 1 year
      path: "/",
      sameSite: "lax"
    });
  }
  return guestId;
}

/**
 * Generate a friendly chat session title from the first prompt
 */
export function generateChatTitle(query: string): string {
  if (!query) return "New Conversation";
  const clean = query.trim().replace(/^["']|["']$/g, "");
  if (clean.length <= 42) {
    return clean.charAt(0).toUpperCase() + clean.slice(1);
  }
  return clean.slice(0, 40).trim() + "...";
}

/**
 * List all chat sessions for the current user/guest
 */
export async function listUserChatSessions(userId: string, searchQuery?: string): Promise<ChatSessionDoc[]> {
  const db = await getDb();
  const filter: any = { userId };

  if (searchQuery && searchQuery.trim()) {
    filter.title = { $regex: searchQuery.trim(), $options: "i" };
  }

  const sessions = await db
    .collection<ChatSessionDoc>("chat_sessions")
    .find(filter)
    .sort({ isPinned: -1, updatedAt: -1 })
    .limit(100)
    .toArray();

  return sessions;
}

/**
 * Get or create a chat session
 */
export async function getOrCreateChatSession(sessionId: string | undefined, userId: string, initialPrompt?: string): Promise<ChatSessionDoc> {
  const db = await getDb();
  const sessionsCol = db.collection<ChatSessionDoc>("chat_sessions");

  if (sessionId) {
    const existing = await sessionsCol.findOne({ sessionId, userId });
    if (existing) {
      return existing;
    }
  }

  const newSessionId = sessionId || `session_${Math.random().toString(36).substring(2, 10)}_${Date.now()}`;
  const title = generateChatTitle(initialPrompt || "New Conversation");
  const now = new Date();

  const newSession: ChatSessionDoc = {
    sessionId: newSessionId,
    userId,
    title,
    createdAt: now,
    updatedAt: now,
    isPinned: false,
    messageCount: 0,
    lastMessageSnippet: ""
  };

  await sessionsCol.insertOne(newSession);
  return newSession;
}

/**
 * Fetch messages for a specific session
 */
export async function getSessionMessages(sessionId: string, userId: string): Promise<ChatMessageDoc[]> {
  const db = await getDb();
  // Verify session ownership
  const session = await db.collection<ChatSessionDoc>("chat_sessions").findOne({ sessionId, userId });
  if (!session) return [];

  const messages = await db
    .collection<ChatMessageDoc>("chat_messages")
    .find({ sessionId })
    .sort({ createdAt: 1 })
    .toArray();

  return messages;
}

/**
 * Append a message to session and update session timestamp & count
 */
export async function saveChatMessage(
  sessionId: string,
  userId: string,
  role: "user" | "assistant",
  content: string,
  metadata?: ChatMessageDoc["metadata"]
): Promise<ChatMessageDoc> {
  const db = await getDb();
  const now = new Date();

  const msgDoc: ChatMessageDoc = {
    sessionId,
    role,
    content,
    metadata,
    createdAt: now
  };

  await db.collection<ChatMessageDoc>("chat_messages").insertOne(msgDoc);

  // Update session doc
  const snippet = content.length > 80 ? content.slice(0, 80) + "..." : content;
  await db.collection<ChatSessionDoc>("chat_sessions").updateOne(
    { sessionId, userId },
    {
      $set: {
        updatedAt: now,
        lastMessageSnippet: snippet
      },
      $inc: { messageCount: 1 }
    }
  );

  return msgDoc;
}

/**
 * Rename session title
 */
export async function renameChatSession(sessionId: string, userId: string, newTitle: string): Promise<boolean> {
  const db = await getDb();
  const res = await db.collection<ChatSessionDoc>("chat_sessions").updateOne(
    { sessionId, userId },
    { $set: { title: newTitle.trim(), updatedAt: new Date() } }
  );
  return res.modifiedCount > 0;
}

/**
 * Toggle pin status of session
 */
export async function togglePinChatSession(sessionId: string, userId: string, isPinned?: boolean): Promise<boolean> {
  const db = await getDb();
  const session = await db.collection<ChatSessionDoc>("chat_sessions").findOne({ sessionId, userId });
  if (!session) return false;

  const newPinned = typeof isPinned === "boolean" ? isPinned : !session.isPinned;
  const res = await db.collection<ChatSessionDoc>("chat_sessions").updateOne(
    { sessionId, userId },
    { $set: { isPinned: newPinned } }
  );
  return res.modifiedCount > 0;
}

/**
 * Delete a single session and all its messages
 */
export async function deleteChatSession(sessionId: string, userId: string): Promise<boolean> {
  const db = await getDb();
  const session = await db.collection<ChatSessionDoc>("chat_sessions").findOne({ sessionId, userId });
  if (!session) return false;

  await db.collection("chat_messages").deleteMany({ sessionId });
  await db.collection("chat_sessions").deleteOne({ sessionId, userId });
  return true;
}

/**
 * Clear all chat history for a user
 */
export async function clearAllUserChatSessions(userId: string): Promise<number> {
  const db = await getDb();
  const sessions = await db.collection<ChatSessionDoc>("chat_sessions").find({ userId }).toArray();
  const sessionIds = sessions.map(s => s.sessionId);

  if (sessionIds.length > 0) {
    await db.collection("chat_messages").deleteMany({ sessionId: { $in: sessionIds } });
  }
  const res = await db.collection("chat_sessions").deleteMany({ userId });
  return res.deletedCount;
}
