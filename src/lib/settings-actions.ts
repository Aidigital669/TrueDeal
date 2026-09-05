"use server";

import clientPromise from "@/lib/mongodb";
import { getCurrentUserSession } from "@/lib/auth-actions";
import { ObjectId } from "mongodb";
import crypto from "crypto";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export interface UserSettingsData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar: string;
  role: string;
  storeName: string;
  security: {
    twoFactorEnabled: boolean;
    lastPasswordChange: string;
  };
  billing: {
    plan: "Free" | "Pro" | "Enterprise";
    status: "Active" | "Trial" | "Expired";
    billingCycle: "Monthly" | "Annual";
    nextBillingDate: string;
    amount: string;
  };
  apiKeys: Array<{
    id: string;
    name: string;
    key: string;
    maskedKey: string;
    createdAt: string;
    lastUsed: string;
  }>;
}

const DEFAULT_SETTINGS: UserSettingsData = {
  firstName: "Store",
  lastName: "Owner",
  email: "",
  phone: "",
  avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&q=80",
  role: "Store Owner",
  storeName: "My Store",
  security: {
    twoFactorEnabled: false,
    lastPasswordChange: "Recently updated"
  },
  billing: {
    plan: "Pro",
    status: "Active",
    billingCycle: "Annual",
    nextBillingDate: "01 Sep 2027",
    amount: "₹9,999/yr"
  },
  apiKeys: []
};

function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
}

function safeObjectId(id?: string): ObjectId | null {
  if (!id) return null;
  try {
    if (ObjectId.isValid(id) && String(new ObjectId(id)) === id) {
      return new ObjectId(id);
    }
  } catch {}
  return null;
}

/**
 * Fetch current user settings from database
 */
export async function getAccountSettings(): Promise<{ success: boolean; data: UserSettingsData }> {
  try {
    const client = await clientPromise;
    const db = client.db();
    const session = await getCurrentUserSession();

    let userDoc = null;
    let sellerDoc = null;
    const userObjId = session?.userId ? safeObjectId(session.userId) : null;

    if (userObjId) {
      userDoc = await db.collection("users").findOne({ _id: userObjId });
      sellerDoc = await db.collection("sellers").findOne({ userId: userObjId });
    }

    if (!userDoc && session?.email) {
      userDoc = await db.collection("users").findOne({ email: session.email.toLowerCase().trim() });
    }
    if (!sellerDoc && session?.email) {
      sellerDoc = await db.collection("sellers").findOne({ email: session.email.toLowerCase().trim() });
    }

    const nameParts = (userDoc?.name || sellerDoc?.storeName || session?.name || "Store Owner").split(" ");
    const firstName = nameParts[0] || "Store";
    const lastName = nameParts.slice(1).join(" ") || "Owner";

    const data: UserSettingsData = {
      firstName: userDoc?.firstName || firstName,
      lastName: userDoc?.lastName || lastName,
      email: userDoc?.email || session?.email || "",
      phone: userDoc?.phone || sellerDoc?.phone || "",
      avatar: userDoc?.avatar || DEFAULT_SETTINGS.avatar,
      role: userDoc?.role === "seller" ? "Store Owner / Merchant" : (userDoc?.role || "Store Owner"),
      storeName: sellerDoc?.storeName || session?.storeName || "My Store",
      security: {
        twoFactorEnabled: Boolean(userDoc?.twoFactorEnabled),
        lastPasswordChange: userDoc?.updatedAt ? new Date(userDoc.updatedAt).toLocaleDateString("en-IN") : "Recently updated"
      },
      billing: userDoc?.billing || DEFAULT_SETTINGS.billing,
      apiKeys: userDoc?.apiKeys || DEFAULT_SETTINGS.apiKeys
    };

    return { success: true, data };
  } catch (error: any) {
    console.error("Error loading account settings:", error);
    return { success: true, data: DEFAULT_SETTINGS };
  }
}

/**
 * Update Profile Information
 */
export async function updateProfileSettings(data: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar?: string;
  storeName?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const client = await clientPromise;
    const db = client.db();
    const session = await getCurrentUserSession();

    const fullName = `${data.firstName} ${data.lastName}`.trim();
    const cleanEmail = data.email.toLowerCase().trim();
    const userObjId = session?.userId ? safeObjectId(session.userId) : null;

    const updatePayload: any = {
      name: fullName,
      firstName: data.firstName,
      lastName: data.lastName,
      email: cleanEmail,
      phone: data.phone,
      updatedAt: new Date()
    };
    if (data.avatar) {
      updatePayload.avatar = data.avatar;
    }

    let filter: any = null;
    if (userObjId) {
      filter = { _id: userObjId };
    } else if (session?.email) {
      filter = { email: session.email.toLowerCase().trim() };
    } else if (cleanEmail) {
      filter = { email: cleanEmail };
    }

    if (!filter) {
      return { success: false, error: "Unauthorized session" };
    }

    await db.collection("users").updateOne(filter, { $set: updatePayload }, { upsert: true });

    // Also update seller store strictly for this user
    if (data.storeName && (userObjId || session?.email)) {
      const sellerFilter = userObjId ? { userId: userObjId } : { email: session?.email?.toLowerCase().trim() };
      await db.collection("sellers").updateOne(
        sellerFilter,
        {
          $set: {
            storeName: data.storeName,
            phone: data.phone,
            email: cleanEmail,
            updatedAt: new Date()
          }
        },
        { upsert: true }
      );
    }

    // Update active cookie
    if (session) {
      const cookieStore = await cookies();
      const updatedSession = {
        ...session,
        name: fullName,
        email: cleanEmail,
        storeName: data.storeName || session.storeName
      };
      cookieStore.set("truedeal_session", JSON.stringify(updatedSession), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 30,
        path: "/"
      });
    }

    revalidatePath("/dashboard/settings");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/business");

    return { success: true };
  } catch (error: any) {
    console.error("Error updating profile settings:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Change Password Action
 */
export async function changePasswordAction(currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
  try {
    const client = await clientPromise;
    const db = client.db();
    const session = await getCurrentUserSession();

    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: "New password must be at least 6 characters." };
    }

    let query: any = {};
    if (session?.userId) {
      try {
        query = { _id: new ObjectId(session.userId) };
      } catch {
        query = { email: session.email };
      }
    } else if (session?.email) {
      query = { email: session.email };
    } else {
      return { success: false, error: "Please log in to change password." };
    }

    const user = await db.collection("users").findOne(query);
    if (!user) {
      return { success: false, error: "User account not found." };
    }

    if (user.passwordSalt && user.passwordHash) {
      const checkHash = hashPassword(currentPassword, user.passwordSalt);
      if (checkHash !== user.passwordHash) {
        return { success: false, error: "Current password does not match." };
      }
    }

    // Generate new salt and hash
    const newSalt = crypto.randomBytes(16).toString("hex");
    const newHash = hashPassword(newPassword, newSalt);

    await db.collection("users").updateOne(
      { _id: user._id },
      {
        $set: {
          passwordSalt: newSalt,
          passwordHash: newHash,
          updatedAt: new Date()
        }
      }
    );

    return { success: true };
  } catch (error: any) {
    console.error("Error changing password:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Generate New API Key
 */
export async function generateApiKey(name: string): Promise<{ success: boolean; apiKey?: any; error?: string }> {
  try {
    const client = await clientPromise;
    const db = client.db();
    const session = await getCurrentUserSession();

    const rawHex = crypto.randomBytes(20).toString("hex");
    const fullKey = `td_live_${rawHex}`;
    const maskedKey = `td_live_${rawHex.slice(0, 4)}••••••••••••${rawHex.slice(-4)}`;

    const newKeyObj = {
      id: "key-" + Date.now(),
      name: name || "New TrueDeal Webhook Key",
      key: fullKey,
      maskedKey,
      createdAt: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
      lastUsed: "Never"
    };

    const query = session?.userId ? { _id: new ObjectId(session.userId) } : { email: session?.email || "" };

    await db.collection("users").updateOne(
      query,
      {
        $push: { apiKeys: newKeyObj } as any,
        $set: { updatedAt: new Date() }
      },
      { upsert: true }
    );

    revalidatePath("/dashboard/settings");
    return { success: true, apiKey: newKeyObj };
  } catch (error: any) {
    console.error("Error generating API key:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Revoke API Key
 */
export async function revokeApiKey(keyId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const client = await clientPromise;
    const db = client.db();
    const session = await getCurrentUserSession();

    const query = session?.userId ? { _id: new ObjectId(session.userId) } : { email: session?.email || "" };

    await db.collection("users").updateOne(
      query,
      {
        $pull: { apiKeys: { id: keyId } } as any,
        $set: { updatedAt: new Date() }
      }
    );

    revalidatePath("/dashboard/settings");
    return { success: true };
  } catch (error: any) {
    console.error("Error revoking API key:", error);
    return { success: false, error: error.message };
  }
}
