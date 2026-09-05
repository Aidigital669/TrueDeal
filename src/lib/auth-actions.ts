"use server";

import clientPromise from "./mongodb";
import { ObjectId } from "mongodb";
import crypto from "crypto";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

const SESSION_COOKIE_NAME = "truedeal_session";

export interface UserSession {
  userId: string;
  email: string;
  name: string;
  role: "seller" | "customer" | "admin";
  storeName?: string;
  slug?: string;
}

// Secure PBKDF2 Password Hashing
function hashPassword(password: string): { salt: string; hash: string } {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return { salt, hash };
}

function verifyPassword(password: string, salt: string, originalHash: string): boolean {
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return hash === originalHash;
}

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Register a new Seller or Customer
 */
export async function registerUserAction(formData: {
  accountType: "customer" | "seller";
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  // Seller specific fields
  companyName?: string;
  businessType?: string;
  city?: string;
  website?: string;
  gstin?: string;
}) {
  try {
    const client = await clientPromise;
    const db = client.db();

    const email = formData.email.toLowerCase().trim();
    if (!email || !formData.password || !formData.firstName) {
      return { success: false, error: "Please fill in all required fields." };
    }

    // Check if user already exists
    const existingUser = await db.collection("users").findOne({ email });
    if (existingUser) {
      return { success: false, error: "An account with this email already exists. Please sign in instead." };
    }

    const { salt, hash } = hashPassword(formData.password);
    const fullName = `${formData.firstName.trim()} ${formData.lastName.trim()}`.trim();

    // 1. Create User in MongoDB
    const userDoc: any = {
      name: fullName,
      email,
      passwordSalt: salt,
      passwordHash: hash,
      role: formData.accountType,
      phone: formData.phone?.trim() || "",
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const userRes = await db.collection("users").insertOne(userDoc);
    const userId = userRes.insertedId;

    let storeName = "";
    let slug = "";

    // 2. If Seller, create Seller Store Profile and Personalized Portfolio
    if (formData.accountType === "seller") {
      storeName = formData.companyName?.trim() || `${fullName}'s Store`;
      const baseSlug = generateSlug(storeName) || "seller-store";
      
      // Ensure unique slug
      slug = baseSlug;
      let counter = 1;
      while (await db.collection("portfolios").findOne({ slug })) {
        slug = `${baseSlug}-${counter++}`;
      }

      // Create Seller record
      const sellerDoc: any = {
        userId,
        storeName,
        phone: formData.phone?.trim() || "",
        email,
        businessType: formData.businessType?.trim() || "Verified Business",
        city: formData.city?.trim() || "Mumbai",
        website: formData.website?.trim() || "",
        gstin: formData.gstin?.trim() || "",
        description: `${storeName} is a verified partner on TrueDeal offering premium verified products and services.`,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      await db.collection("sellers").insertOne(sellerDoc);

      // Create initial customized Portfolio
      const portfolioDoc: any = {
        userId,
        slug,
        isPublished: true,
        companyName: storeName,
        tagline: formData.businessType 
          ? `Premier ${formData.businessType} in ${formData.city || "India"}`
          : "Verified Products & Services on TrueDeal",
        about: `${storeName} provides authentic, high-quality offerings with dedicated customer support and verified compliance.`,
        logo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&q=80",
        bannerImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&q=80",
        businessType: formData.businessType || "Enterprise Partner",
        yearEstablished: String(new Date().getFullYear()),
        teamSize: "10-25 Members",
        gstin: formData.gstin?.trim() || "",
        
        address: `${formData.city || "Mumbai"}, Maharashtra, India`,
        city: formData.city?.trim() || "Mumbai",
        state: "Maharashtra",
        pincode: "400001",
        country: "India",
        workingHours: [
          { day: "Monday", open: "09:00", close: "19:00", isClosed: false },
          { day: "Tuesday", open: "09:00", close: "19:00", isClosed: false },
          { day: "Wednesday", open: "09:00", close: "19:00", isClosed: false },
          { day: "Thursday", open: "09:00", close: "19:00", isClosed: false },
          { day: "Friday", open: "09:00", close: "19:00", isClosed: false },
          { day: "Saturday", open: "10:00", close: "18:00", isClosed: false },
          { day: "Sunday", open: "10:00", close: "16:00", isClosed: true }
        ],
        
        phone: formData.phone?.trim() || "+91-9820012345",
        whatsapp: (formData.phone?.trim() || "9820012345").replace(/[^0-9]/g, ""),
        email,
        website: formData.website?.trim() || "",
        socialLinks: {},
        
        specialities: [
          {
            id: "spec-1",
            title: "Verified Authenticity Guarantee",
            description: "100% genuine goods, licensed advisory, and transparent documentation."
          },
          {
            id: "spec-2",
            title: "Fast Turnaround & Delivery",
            description: "Dedicated account manager and express fulfillment for all inquiries."
          }
        ],
        certifications: ["TrueDeal Verified Merchant", "GST Registered"],
        achievements: [
          { stat: "100%", label: "Verified Genuine" },
          { stat: "24/7", label: "Dedicated Support" }
        ],
        rating: 4.9,
        totalReviews: 1,
        reviews: [
          {
            id: "rev-init",
            author: fullName,
            role: "Verified Business Owner",
            rating: 5,
            date: "Today",
            comment: `Welcome to ${storeName}! Browse our verified catalog and connect with our team for exclusive inquiries.`,
            verified: true
          }
        ],
        gallery: [],
        faqs: [
          {
            id: "faq-1",
            question: "How do I place an order or submit an inquiry?",
            answer: "You can click on any listing in our catalog or message us directly via WhatsApp/Phone listed above."
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await db.collection("portfolios").insertOne(portfolioDoc);
    }

    // 3. Set Session Cookie
    const sessionPayload: UserSession = {
      userId: userId.toString(),
      email,
      name: fullName,
      role: formData.accountType,
      storeName,
      slug
    };

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, JSON.stringify(sessionPayload), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/"
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/portfolio");
    revalidatePath("/dashboard/business");

    return { 
      success: true, 
      user: sessionPayload,
      redirect: formData.accountType === "seller" ? "/dashboard" : "/"
    };
  } catch (err: any) {
    console.error("Registration error:", err);
    return { success: false, error: err.message || "Failed to create account" };
  }
}

/**
 * Login existing user
 */
export async function loginUserAction(formData: {
  email: string;
  password: string;
  accountType?: "customer" | "seller";
}) {
  try {
    const email = formData.email.toLowerCase().trim();
    if (!email || !formData.password) {
      return { success: false, error: "Please provide both email and password." };
    }

    const client = await clientPromise;
    const db = client.db();

    // 1. Look up user by exact email
    let user = await db.collection("users").findOne({ email });
    
    // Direct initial registration for demo ANV REEALTY if missing
    if (!user && (email === "contact@anvreealty.com" || email === "nikhil@anvreeality.com")) {
      const { salt, hash } = hashPassword(formData.password || "password123");
      const newUserDoc = {
        name: "ANV REEALTY",
        email,
        passwordSalt: salt,
        passwordHash: hash,
        role: "seller",
        phone: "+91 97661 37115",
        createdAt: new Date(),
        updatedAt: new Date()
      };
      const userRes = await db.collection("users").insertOne(newUserDoc);
      user = { ...newUserDoc, _id: userRes.insertedId };
    }

    if (!user) {
      return { success: false, error: "Invalid email or password. Please check your credentials." };
    }

    // Verify password if hash exists
    if (user.passwordSalt && user.passwordHash) {
      const isValid = verifyPassword(formData.password, user.passwordSalt, user.passwordHash);
      if (!isValid) {
        return { success: false, error: "Invalid email or password." };
      }
    }

    // 2. Fetch specific seller profile strictly for this user._id
    let seller = await db.collection("sellers").findOne({ userId: user._id });
    let portfolio = await db.collection("portfolios").findOne({ userId: user._id });

    const isAnvAccount = email.includes("anvreealty") || user.name?.includes("ANV");

    // Heal / Auto-repair corrupted ANV REEALTY records if they were overwritten by scraper
    if (isAnvAccount && seller && (seller.storeName?.includes("Ayurmor") || seller.website?.includes("ayurmor.com"))) {
      await db.collection("sellers").updateOne(
        { _id: seller._id },
        {
          $set: {
            storeName: "ANV REEALTY",
            businessType: "Commercial & Residential Real Estate",
            city: "Pune",
            website: "https://anvreealty.com",
            description: "ANV REEALTY is Pune's leading real estate advisory specializing in Grade-A commercial office space and residential developments.",
            updatedAt: new Date()
          }
        }
      );
      seller.storeName = "ANV REEALTY";
      seller.website = "https://anvreealty.com";
      seller.businessType = "Commercial & Residential Real Estate";
    }

    if (!seller && (user.role === "seller" || formData.accountType === "seller")) {
      const defaultStoreName = isAnvAccount ? "ANV REEALTY" : (user.name || "Seller Store");
      const defaultSellerDoc = {
        userId: user._id,
        storeName: defaultStoreName,
        phone: user.phone || "+91 98200 12345",
        email: user.email,
        businessType: isAnvAccount ? "Commercial & Residential Real Estate" : "Verified Business",
        city: isAnvAccount ? "Pune" : "Mumbai",
        website: isAnvAccount ? "https://anvreealty.com" : "",
        description: `${defaultStoreName} is a verified partner on TrueDeal offering premium verified products and services.`,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      const sRes = await db.collection("sellers").insertOne(defaultSellerDoc);
      seller = { ...defaultSellerDoc, _id: sRes.insertedId };
    }

    let storeName = portfolio?.companyName || seller?.storeName || user.name || "Seller Store";
    let slug = portfolio?.slug || (isAnvAccount ? "anv-reealty" : generateSlug(storeName) || "seller-store");

    if (!portfolio && (user.role === "seller" || formData.accountType === "seller")) {
      const initialPortfolioDoc: any = {
        userId: user._id,
        slug,
        isPublished: true,
        companyName: storeName,
        tagline: isAnvAccount 
          ? "Premier Real Estate Advisory & MahaRERA Certified Commercial Hub"
          : `Premier Products & Services by ${storeName}`,
        about: isAnvAccount
          ? "ANV REEALTY is Pune's leading real estate advisory specializing in Grade-A commercial office space and residential developments."
          : `${storeName} provides authentic, high-quality offerings with dedicated customer support and verified compliance.`,
        logo: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=200&q=80",
        bannerImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&q=80",
        businessType: seller?.businessType || (isAnvAccount ? "Commercial & Residential Real Estate" : "Verified Business"),
        city: seller?.city || "Pune",
        email: user.email,
        phone: seller?.phone || user.phone || "+91 98200 12345",
        website: seller?.website || (isAnvAccount ? "https://anvreealty.com" : ""),
        rating: 4.9,
        totalReviews: isAnvAccount ? 210 : 1,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      await db.collection("portfolios").insertOne(initialPortfolioDoc);
      portfolio = initialPortfolioDoc;
    }

    const sessionPayload: UserSession = {
      userId: user._id.toString(),
      email: user.email,
      name: user.name || storeName,
      role: user.role || formData.accountType || "seller",
      storeName,
      slug
    };

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, JSON.stringify(sessionPayload), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30,
      path: "/"
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/portfolio");
    revalidatePath("/dashboard/catalog");
    revalidatePath("/dashboard/business");

    return {
      success: true,
      user: sessionPayload,
      redirect: sessionPayload.role === "seller" ? "/dashboard" : "/"
    };
  } catch (err: any) {
    console.error("Login error:", err);
    return { success: false, error: err.message || "Unable to sign in. Please check your credentials." };
  }
}

/**
 * Get active logged-in user session
 */
export async function getCurrentUserSession(): Promise<UserSession | null> {
  try {
    const cookieStore = await cookies();
    const cookie = cookieStore.get(SESSION_COOKIE_NAME);
    if (!cookie?.value) return null;
    return JSON.parse(cookie.value) as UserSession;
  } catch {
    return null;
  }
}

/**
 * One-click Login Action for ANV REEALTY
 */
export async function loginAsAnvReealtyAction() {
  try {
    const client = await clientPromise;
    const db = client.db();

    const email = "contact@anvreealty.com";
    let user = await db.collection("users").findOne({ email });

    if (!user) {
      const { salt, hash } = hashPassword("password123");
      const userDoc = {
        name: "ANV REEALTY Director",
        email,
        passwordSalt: salt,
        passwordHash: hash,
        role: "seller",
        phone: "+91 97661 37115",
        createdAt: new Date(),
        updatedAt: new Date()
      };
      const userRes = await db.collection("users").insertOne(userDoc);
      user = { ...userDoc, _id: userRes.insertedId };
    }

    let seller = await db.collection("sellers").findOne({ storeName: "ANV REEALTY" });
    if (!seller) {
      const sellerDoc = {
        userId: user._id,
        storeName: "ANV REEALTY",
        phone: "+91 97661 37115",
        email,
        businessType: "Real Estate Advisory & Commercial Investments",
        city: "Pune",
        website: "https://anvreealty.com",
        gstin: "A52100000055",
        description: "ANV REEALTY is Pune's leading real estate advisory specializing in Grade-A commercial office space and residential developments.",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      const res = await db.collection("sellers").insertOne(sellerDoc);
      seller = { ...sellerDoc, _id: res.insertedId };
    }

    let portfolio = await db.collection("portfolios").findOne({ slug: "anv-reealty" });
    if (!portfolio) {
      const portfolioDoc = {
        userId: user._id,
        slug: "anv-reealty",
        isPublished: true,
        companyName: "ANV REEALTY",
        tagline: "Premier Real Estate Advisory & MahaRERA Certified Commercial Hub",
        about: "ANV REEALTY is Pune's leading real estate advisory specializing in Grade-A commercial office space, high-footfall retail showrooms, and luxury residential developments in Magarpatta, Undri, and Koregaon Park.",
        logo: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=200&q=80",
        bannerImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&q=80",
        businessType: "Real Estate Advisory & Commercial Investments",
        yearEstablished: "2016",
        teamSize: "35+ Property Consultants",
        gstin: "A52100000055",
        address: "Prime Tech Park, Magarpatta City",
        city: "Pune",
        state: "Maharashtra",
        pincode: "411028",
        country: "India",
        phone: "+91 97661 37115",
        whatsapp: "919766137115",
        email,
        website: "https://anvreealty.com",
        rating: 4.9,
        totalReviews: 210,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      const res = await db.collection("portfolios").insertOne(portfolioDoc);
      portfolio = { ...portfolioDoc, _id: res.insertedId };
    }

    const sessionPayload: UserSession = {
      userId: user._id.toString(),
      email: user.email,
      name: "ANV REEALTY",
      role: "seller",
      storeName: "ANV REEALTY",
      slug: "anv-reealty"
    };

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, JSON.stringify(sessionPayload), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30,
      path: "/"
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/portfolio");
    revalidatePath("/dashboard/catalog");

    return {
      success: true,
      user: sessionPayload,
      redirect: "/dashboard"
    };
  } catch (err: any) {
    console.error("ANV REEALTY Login Error:", err);
    return { success: false, error: err.message || "Failed to login as ANV REEALTY" };
  }
}

/**
 * Logout current user
 */
export async function logoutUserAction() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE_NAME);
    revalidatePath("/");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
