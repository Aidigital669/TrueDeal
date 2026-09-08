"use server";

import clientPromise, { getDb, getSellerProductsCollection, getSellerProductCollectionName } from "./mongodb";
import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";
import { getCurrentUserSession } from "./auth-actions";
import { cookies } from "next/headers";

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export interface PortfolioReview {
  id: string;
  author: string;
  role?: string;
  rating: number;
  date: string;
  comment: string;
  verified: boolean;
  avatar?: string;
}

export interface PortfolioSpeciality {
  id: string;
  title: string;
  description: string;
  iconName?: string;
  tag?: string;
}

export interface PortfolioGalleryItem {
  id: string;
  url: string;
  caption: string;
  category?: string;
}

export interface PortfolioFAQ {
  id: string;
  question: string;
  answer: string;
}

export interface WorkingDay {
  day: string;
  open: string;
  close: string;
  isClosed: boolean;
}

export interface PortfolioData {
  _id?: string;
  slug: string;
  isPublished: boolean;
  
  // Basic & Branding
  companyName: string;
  tagline: string;
  about: string;
  mission?: string;
  logo: string;
  bannerImage: string;
  businessType: string;
  yearEstablished: string;
  teamSize: string;
  gstin?: string;
  
  // Location & Working Hours
  address: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  landmark?: string;
  mapEmbedUrl?: string;
  workingHours: WorkingDay[];
  
  // Contact & Social
  phone: string;
  whatsapp: string;
  email: string;
  website: string;
  socialLinks: {
    linkedin?: string;
    twitter?: string;
    instagram?: string;
    facebook?: string;
    youtube?: string;
  };
  
  // Specialities & Trust
  specialities: PortfolioSpeciality[];
  certifications: string[];
  achievements: {
    stat: string;
    label: string;
  }[];
  
  // Reviews & Ratings
  rating: number;
  totalReviews: number;
  reviews: PortfolioReview[];
  
  // Gallery & FAQs
  gallery: PortfolioGalleryItem[];
  faqs: PortfolioFAQ[];
  
  // Products
  featuredProductIds?: string[];
  
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

const DEFAULT_PORTFOLIO: PortfolioData = {
  slug: "",
  isPublished: true,
  companyName: "Verified Storefront",
  tagline: "",
  about: "",
  mission: "",
  logo: "",
  bannerImage: "",
  businessType: "",
  yearEstablished: "",
  teamSize: "",
  gstin: "",
  
  address: "",
  city: "",
  state: "",
  pincode: "",
  country: "India",
  workingHours: [],
  
  phone: "",
  whatsapp: "",
  email: "",
  website: "",
  socialLinks: {},
  
  specialities: [],
  certifications: [],
  achievements: [],
  
  rating: 5.0,
  totalReviews: 0,
  reviews: [],
  gallery: [],
  faqs: []
};

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
 * Fetch portfolio for the seller dashboard editor from Truedeal DB
 */
export async function getSellerPortfolio(): Promise<{ success: boolean; portfolio: PortfolioData }> {
  try {
    const session = await getCurrentUserSession();
    const slug = session?.slug || "seller-store";
    const db = await getDb();
    
    let portfolioDoc = await db.collection("portfolios").findOne({
      $or: [{ slug }, { userId: safeObjectId(session?.userId) || undefined }].filter(Boolean)
    });

    if (!portfolioDoc) {
      const sellerDoc = await db.collection("sellers").findOne({ slug });
      const storeName = sellerDoc?.storeName || session?.storeName || session?.name || "Seller Store";
      
      const newDoc: any = {
        ...DEFAULT_PORTFOLIO,
        slug,
        companyName: storeName,
        tagline: sellerDoc?.businessType ? `Verified ${sellerDoc.businessType}` : "",
        about: sellerDoc?.description || "",
        businessType: sellerDoc?.businessType || "Verified Business",
        city: sellerDoc?.city || "",
        address: sellerDoc?.address || "",
        email: sellerDoc?.email || session?.email || "",
        phone: sellerDoc?.phone || "",
        whatsapp: sellerDoc?.whatsapp || sellerDoc?.phone || "",
        website: sellerDoc?.website || "",
        createdAt: new Date(),
        updatedAt: new Date()
      };
      await db.collection("portfolios").insertOne(newDoc);
      portfolioDoc = newDoc;
    }
    
    const plainDoc = portfolioDoc ? JSON.parse(JSON.stringify(portfolioDoc)) : null;
    
    const portfolio: PortfolioData = plainDoc ? {
      ...DEFAULT_PORTFOLIO,
      ...plainDoc,
      _id: plainDoc._id?.toString() || ""
    } : DEFAULT_PORTFOLIO;
    
    return { success: true, portfolio };
  } catch (error: any) {
    console.error("Error retrieving seller portfolio:", error);
    return { success: true, portfolio: DEFAULT_PORTFOLIO };
  }
}

/**
 * Save / Update portfolio from seller dashboard editor into Truedeal DB
 */
export async function saveSellerPortfolio(data: Partial<PortfolioData>): Promise<{ success: boolean; slug?: string; error?: string }> {
  try {
    const session = await getCurrentUserSession();
    const rawSlug = data.slug || session?.slug || "seller-store";
    const newSlug = rawSlug
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "") || "company-portfolio";

    const db = await getDb();

    const updatePayload: any = {
      ...data,
      slug: newSlug,
      updatedAt: new Date()
    };
    delete updatePayload._id;

    // Save into portfolios collection
    await db.collection("portfolios").updateOne(
      { slug: newSlug },
      { $set: updatePayload, $setOnInsert: { createdAt: new Date() } },
      { upsert: true }
    );

    // Sync Sellers Registry
    await db.collection("sellers").updateOne(
      { slug: newSlug },
      { 
        $set: {
          storeName: data.companyName,
          description: data.about,
          phone: data.phone,
          website: data.website,
          city: data.city,
          collectionName: getSellerProductCollectionName(newSlug),
          updatedAt: new Date()
        }
      },
      { upsert: true }
    );

    if (session) {
      try {
        const cookieStore = await cookies();
        cookieStore.set("truedeal_session", JSON.stringify({
          ...session,
          slug: newSlug,
          storeName: data.companyName || session.storeName
        }), {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          maxAge: 60 * 60 * 24 * 30,
          path: "/"
        });
      } catch {}
    }
    
    revalidatePath("/dashboard/portfolio");
    revalidatePath("/dashboard/business");
    revalidatePath("/dashboard");
    revalidatePath(`/portfolio/${newSlug}`);
    revalidatePath(`/p/${newSlug}`);
    
    return { success: true, slug: newSlug };
  } catch (error: any) {
    console.error("Error saving seller portfolio:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Get public portfolio and all active products for a specific company slug
 * Products are loaded directly from the seller's dedicated collection ("products_<cleanSlug>")
 */
export async function getPublicPortfolio(slug: string): Promise<{
  success: boolean;
  portfolio: PortfolioData | null;
  products: any[];
}> {
  try {
    const cleanSlug = (slug || "").toLowerCase().trim();
    if (!cleanSlug) {
      return { success: false, portfolio: null, products: [] };
    }

    const db = await getDb();

    // 1. Fetch portfolio from portfolios collection
    let portfolioDoc: any = await db.collection("portfolios").findOne({
      $or: [{ slug: cleanSlug }, { slug: { $regex: escapeRegex(cleanSlug), $options: "i" } }]
    });

    if (!portfolioDoc) {
      const sellerDoc = await db.collection("sellers").findOne({
        $or: [{ slug: cleanSlug }, { slug: { $regex: escapeRegex(cleanSlug), $options: "i" } }]
      });
      if (sellerDoc) {
        portfolioDoc = {
          ...DEFAULT_PORTFOLIO,
          slug: sellerDoc.slug,
          companyName: sellerDoc.storeName,
          about: sellerDoc.description,
          phone: sellerDoc.phone,
          email: sellerDoc.email,
          website: sellerDoc.website,
          city: sellerDoc.city,
          businessType: sellerDoc.businessType
        };
      }
    }

    if (!portfolioDoc) {
      return { success: false, portfolio: null, products: [] };
    }

    const plainPortfolio = JSON.parse(JSON.stringify(portfolioDoc));
    const portfolio: PortfolioData = {
      ...DEFAULT_PORTFOLIO,
      ...plainPortfolio,
      _id: plainPortfolio._id?.toString() || ""
    };

    // 2. Fetch products strictly from this seller's dedicated collection
    const productsCol = await getSellerProductsCollection(cleanSlug);
    let rawProducts = await productsCol
      .find({ isActive: true })
      .sort({ updatedAt: -1 })
      .limit(100)
      .toArray();

    // Fallback if legacy "products" collection has items
    if (rawProducts.length === 0) {
      rawProducts = await db.collection("products")
        .find({ isActive: true, $or: [{ sellerSlug: cleanSlug }, { portfolioSlug: cleanSlug }] })
        .sort({ updatedAt: -1 })
        .limit(100)
        .toArray();
    }

    const products = rawProducts.map((p) => ({
      id: p._id.toString(),
      title: p.title || p.name || "Untitled Product",
      description: p.description || p.shortDesc || "",
      price: p.price,
      originalPrice: p.originalPrice,
      brand: p.brand || portfolio.companyName,
      category: p.category || "Database Listing",
      inventory: p.inventory,
      image: p.images?.find((img: any) => img.isPrimary)?.url || p.images?.[0]?.url || (p as any).image || "https://images.unsplash.com/photo-1557821552-17105176677c?w=500&q=80",
      badgeType: p.badgeType || "website",
      aiVisibility: p.aiVisibility || 90,
      sourceUrl: p.sourceUrl || p.buyUrl || p.productUrl || "",
      buyUrl: p.buyUrl || p.sourceUrl || p.productUrl || "",
      productUrl: p.productUrl || p.buyUrl || p.sourceUrl || ""
    }));

    return {
      success: true,
      portfolio,
      products
    };
  } catch (error: any) {
    console.error("Error retrieving public portfolio from database:", error.message);
    return {
      success: false,
      portfolio: null,
      products: []
    };
  }
}

/**
 * Handle buyer RFQ / inquiry form submissions into inquiries collection
 */
export async function submitPortfolioInquiry(data: {
  sellerSlug: string;
  name: string;
  email: string;
  phone: string;
  subject?: string;
  message: string;
  productTitle?: string;
}) {
  try {
    const db = await getDb();
    
    await db.collection("inquiries").insertOne({
      ...data,
      status: "NEW",
      createdAt: new Date()
    });
    
    return { success: true };
  } catch (error: any) {
    console.error("Error submitting portfolio inquiry:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Import and synchronize full scraped company data into Truedeal DB
 */
export async function importScrapedPortfolioAction(companyData: any) {
  try {
    const session = await getCurrentUserSession();
    const slug = session?.slug || companyData.slug || "company-portfolio";
    const db = await getDb();

    // Format reviews
    const scrapedReviews: PortfolioReview[] = (companyData.reviews || []).map((r: any, idx: number) => ({
      id: `rev-${Date.now()}-${idx}`,
      author: r.author || "Verified Buyer",
      role: r.role || "Verified Client",
      rating: typeof r.rating === "number" && r.rating > 0 ? r.rating : 5,
      date: r.date || "Recent",
      comment: r.comment || "Great service and verified experience.",
      verified: r.verified !== undefined ? Boolean(r.verified) : true,
      avatar: r.avatar || `https://images.unsplash.com/photo-${1535713875002 + (idx % 10)}?w=120&q=80`
    }));

    let avgRating = 4.9;
    if (scrapedReviews.length > 0) {
      const sum = scrapedReviews.reduce((acc, curr) => acc + (curr.rating || 5), 0);
      avgRating = Number((sum / scrapedReviews.length).toFixed(1));
    }

    // Format gallery
    const scrapedGallery: PortfolioGalleryItem[] = (companyData.gallery || [])
      .filter((g: any) => Boolean(g && g.url))
      .map((g: any, idx: number) => ({
        id: `gal-${Date.now()}-${idx}`,
        url: g.url,
        caption: g.caption || `${companyData.name || "Showcase"} Photo ${idx + 1}`,
        category: g.category || "Showcase"
      }));

    // Format FAQs
    const scrapedFaqs: PortfolioFAQ[] = (companyData.faqs || [])
      .filter((f: any) => Boolean(f && f.question && f.answer))
      .map((f: any, idx: number) => ({
        id: `faq-${Date.now()}-${idx}`,
        question: f.question,
        answer: f.answer
      }));

    // Format Specialities
    const scrapedSpecialities: PortfolioSpeciality[] = (companyData.specialities || []).map((s: any, idx: number) => ({
      id: `spec-${Date.now()}-${idx}`,
      title: s.title,
      description: s.description,
      tag: s.tag || "Signature Service",
      iconName: "Sparkles"
    }));

    // Build update object
    const updatePayload: any = {
      isPublished: true,
      slug,
      updatedAt: new Date()
    };

    if (companyData.name) updatePayload.companyName = companyData.name;
    if (companyData.tagline) updatePayload.tagline = companyData.tagline;
    if (companyData.about) updatePayload.about = companyData.about;
    if (companyData.mission) updatePayload.mission = companyData.mission;
    if (companyData.logo) updatePayload.logo = companyData.logo;
    if (companyData.bannerImage) updatePayload.bannerImage = companyData.bannerImage;
    if (companyData.businessType) updatePayload.businessType = companyData.businessType;
    if (companyData.yearEstablished) updatePayload.yearEstablished = companyData.yearEstablished;
    if (companyData.teamSize) updatePayload.teamSize = companyData.teamSize;
    if (companyData.gstin) updatePayload.gstin = companyData.gstin;

    if (companyData.address) updatePayload.address = companyData.address;
    if (companyData.city) updatePayload.city = companyData.city;
    if (companyData.state) updatePayload.state = companyData.state;
    if (companyData.pincode) updatePayload.pincode = companyData.pincode;
    if (companyData.landmark) updatePayload.landmark = companyData.landmark;
    if (companyData.mapEmbedUrl) updatePayload.mapEmbedUrl = companyData.mapEmbedUrl;
    if (companyData.workingHours) updatePayload.workingHours = companyData.workingHours;

    if (companyData.phone) updatePayload.phone = companyData.phone;
    if (companyData.whatsapp) updatePayload.whatsapp = companyData.whatsapp;
    if (companyData.email) updatePayload.email = companyData.email;
    if (companyData.website) updatePayload.website = companyData.website;
    if (companyData.socialLinks) updatePayload.socialLinks = companyData.socialLinks;

    if (scrapedSpecialities.length > 0) updatePayload.specialities = scrapedSpecialities;
    if (companyData.certifications && companyData.certifications.length > 0) {
      updatePayload.certifications = companyData.certifications;
    }

    if (scrapedReviews.length > 0) {
      updatePayload.reviews = scrapedReviews;
      updatePayload.totalReviews = scrapedReviews.length;
      updatePayload.rating = avgRating;
    }

    if (scrapedGallery.length > 0) {
      updatePayload.gallery = scrapedGallery;
    }

    if (scrapedFaqs.length > 0) {
      updatePayload.faqs = scrapedFaqs;
    }

    await db.collection("portfolios").updateOne(
      { slug },
      { $set: updatePayload, $setOnInsert: { slug, isPublished: true, createdAt: new Date() } },
      { upsert: true }
    );

    // Sync to sellers registry
    const sellerUpdate: any = { 
      collectionName: getSellerProductCollectionName(slug),
      updatedAt: new Date() 
    };
    if (companyData.name) sellerUpdate.storeName = companyData.name;
    if (companyData.about) sellerUpdate.description = companyData.about;
    if (companyData.website) sellerUpdate.website = companyData.website;
    if (companyData.phone) sellerUpdate.phone = companyData.phone;
    if (companyData.address) sellerUpdate.address = companyData.address;
    if (companyData.city) sellerUpdate.city = companyData.city;

    await db.collection("sellers").updateOne(
      { slug },
      { $set: sellerUpdate },
      { upsert: true }
    );

    // Update active session cookie
    if (session) {
      try {
        const cookieStore = await cookies();
        const updatedSession = {
          ...session,
          slug,
          storeName: companyData.name || session.storeName
        };
        cookieStore.set("truedeal_session", JSON.stringify(updatedSession), {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          maxAge: 60 * 60 * 24 * 30,
          path: "/"
        });
      } catch {}
    }

    revalidatePath("/dashboard/portfolio");
    revalidatePath("/dashboard/business");
    revalidatePath("/dashboard");
    revalidatePath(`/portfolio/${slug}`);
    revalidatePath(`/p/${slug}`);
    revalidatePath("/connect");

    return {
      success: true,
      slug,
      message: `Successfully imported portfolio: ${scrapedReviews.length} reviews, ${scrapedGallery.length} photos, and ${scrapedFaqs.length} FAQs synced into your portfolio!`,
      counts: {
        reviews: scrapedReviews.length,
        gallery: scrapedGallery.length,
        faqs: scrapedFaqs.length
      }
    };
  } catch (error: any) {
    console.error("Error importing scraped portfolio:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Import ONLY Scraped Reviews into Portfolio
 */
export async function importScrapedReviewsAction(reviews: Array<any>) {
  try {
    const session = await getCurrentUserSession();
    const slug = session?.slug || "seller-store";
    const db = await getDb();

    const formattedReviews: PortfolioReview[] = (reviews || []).map((r, idx) => ({
      id: `rev-${Date.now()}-${idx}`,
      author: r.author || "Verified Buyer",
      role: r.role || "Verified Client",
      rating: typeof r.rating === "number" && r.rating > 0 ? r.rating : 5,
      date: r.date || "Recent",
      comment: r.comment || "Great service.",
      verified: r.verified !== undefined ? Boolean(r.verified) : true,
      avatar: r.avatar || `https://images.unsplash.com/photo-${1535713875002 + (idx % 10)}?w=120&q=80`
    }));

    let avgRating = 4.9;
    if (formattedReviews.length > 0) {
      const sum = formattedReviews.reduce((acc, curr) => acc + (curr.rating || 5), 0);
      avgRating = Number((sum / formattedReviews.length).toFixed(1));
    }

    await db.collection("portfolios").updateOne(
      { slug },
      {
        $set: {
          reviews: formattedReviews,
          totalReviews: formattedReviews.length,
          rating: avgRating,
          updatedAt: new Date()
        }
      },
      { upsert: true }
    );

    revalidatePath("/dashboard/portfolio");
    revalidatePath("/dashboard");
    revalidatePath("/connect");

    return {
      success: true,
      count: formattedReviews.length,
      message: `Successfully imported ${formattedReviews.length} customer reviews into your portfolio!`
    };
  } catch (error: any) {
    console.error("Error importing reviews:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Import ONLY Scraped Gallery Photos into Portfolio
 */
export async function importScrapedGalleryAction(gallery: Array<any>) {
  try {
    const db = await getDb();
    const session = await getCurrentUserSession();
    const userObjId = session?.userId ? safeObjectId(session.userId) : null;

    let filter: any = userObjId ? { userId: userObjId } : (session?.slug ? { slug: session.slug } : { email: session?.email });
    if (!filter) return { success: false, error: "Unauthorized" };

    const formattedGallery: PortfolioGalleryItem[] = (gallery || [])
      .filter(g => Boolean(g && g.url))
      .map((g, idx) => ({
        id: `gal-${Date.now()}-${idx}`,
        url: g.url,
        caption: g.caption || `Showcase Photo ${idx + 1}`,
        category: g.category || "Showcase"
      }));

    await db.collection("portfolios").updateOne(
      filter,
      {
        $set: {
          gallery: formattedGallery,
          updatedAt: new Date()
        }
      },
      { upsert: true }
    );

    revalidatePath("/dashboard/portfolio");
    revalidatePath("/dashboard");
    revalidatePath("/connect");

    return {
      success: true,
      count: formattedGallery.length,
      message: `Successfully imported ${formattedGallery.length} showcase photos into your portfolio gallery!`
    };
  } catch (error: any) {
    console.error("Error importing gallery:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Import ONLY Scraped FAQs into Portfolio
 */
export async function importScrapedFaqsAction(faqs: Array<any>) {
  try {
    const db = await getDb();
    const session = await getCurrentUserSession();
    const userObjId = session?.userId ? safeObjectId(session.userId) : null;

    let filter: any = userObjId ? { userId: userObjId } : (session?.slug ? { slug: session.slug } : { email: session?.email });
    if (!filter) return { success: false, error: "Unauthorized" };

    const formattedFaqs: PortfolioFAQ[] = (faqs || [])
      .filter(f => Boolean(f && f.question && f.answer))
      .map((f, idx) => ({
        id: `faq-${Date.now()}-${idx}`,
        question: f.question,
        answer: f.answer
      }));

    await db.collection("portfolios").updateOne(
      filter,
      {
        $set: {
          faqs: formattedFaqs,
          updatedAt: new Date()
        }
      },
      { upsert: true }
    );

    revalidatePath("/dashboard/portfolio");
    revalidatePath("/dashboard");
    revalidatePath("/connect");

    return {
      success: true,
      count: formattedFaqs.length,
      message: `Successfully imported ${formattedFaqs.length} FAQs into your portfolio!`
    };
  } catch (error: any) {
    console.error("Error importing FAQs:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Import ONLY Scraped Company Profile Info into Portfolio
 */
export async function importScrapedCompanyProfileAction(companyData: any) {
  try {
    const db = await getDb();
    const session = await getCurrentUserSession();
    const userObjId = session?.userId ? safeObjectId(session.userId) : null;

    let filter: any = userObjId ? { userId: userObjId } : (session?.slug ? { slug: session.slug } : { email: session?.email });
    if (!filter) return { success: false, error: "Unauthorized" };

    const updatePayload: any = { updatedAt: new Date() };
    if (companyData.name) updatePayload.companyName = companyData.name;
    if (companyData.tagline) updatePayload.tagline = companyData.tagline;
    if (companyData.about) updatePayload.about = companyData.about;
    if (companyData.mission) updatePayload.mission = companyData.mission;
    if (companyData.logo) updatePayload.logo = companyData.logo;
    if (companyData.bannerImage) updatePayload.bannerImage = companyData.bannerImage;
    if (companyData.businessType) updatePayload.businessType = companyData.businessType;
    if (companyData.yearEstablished) updatePayload.yearEstablished = companyData.yearEstablished;
    if (companyData.teamSize) updatePayload.teamSize = companyData.teamSize;
    if (companyData.gstin) updatePayload.gstin = companyData.gstin;
    if (companyData.address) updatePayload.address = companyData.address;
    if (companyData.city) updatePayload.city = companyData.city;
    if (companyData.phone) updatePayload.phone = companyData.phone;
    if (companyData.whatsapp) updatePayload.whatsapp = companyData.whatsapp;

    await db.collection("portfolios").updateOne(
      filter,
      { $set: updatePayload },
      { upsert: true }
    );

    revalidatePath("/dashboard/portfolio");
    revalidatePath("/dashboard/business");
    revalidatePath("/dashboard");
    revalidatePath("/connect");

    return {
      success: true,
      message: `Successfully imported company profile info into your portfolio!`
    };
  } catch (error: any) {
    console.error("Error importing company profile:", error);
    return { success: false, error: error.message };
  }
}
