"use server";

import clientPromise from "./mongodb";
import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";

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
  
  // Gallery
  gallery: PortfolioGalleryItem[];
  
  // FAQs
  faqs: PortfolioFAQ[];
  
  // Featured Products IDs or filter
  featuredProductIds?: string[];
  
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

const DEFAULT_PORTFOLIO: PortfolioData = {
  slug: "abc-electronics",
  isPublished: true,
  companyName: "ABC Electronics & IT Solutions",
  tagline: "Premier Gaming Gear, Custom PC Builds & Certified Tech Services",
  about: "Founded in 2014, ABC Electronics has grown into one of Mumbai's most trusted destinations for cutting-edge computing hardware, enterprise workstations, and certified chip-level repair services. We partner directly with global leaders including ASUS, Dell, HP, NVIDIA, and Acer to provide authentic products backed by official warranties and round-the-clock technical support.",
  mission: "To empower creators, gamers, and businesses with authentic computing power and unparalleled after-sales engineering expertise.",
  logo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&q=80",
  bannerImage: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1600&q=80",
  businessType: "Authorized Retailer, Distributor & Service Hub",
  yearEstablished: "2014",
  teamSize: "25+ Tech Specialists",
  gstin: "27AADCB2230M1Z2",
  
  address: "Shop 104-106, Prime Tech Park, Lamington Road, Grant Road East",
  city: "Mumbai",
  state: "Maharashtra",
  pincode: "400007",
  country: "India",
  landmark: "Opposite Metro Station Exit 2",
  mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3773.498877028169!2d72.81665677596047!3d18.96458518221535!2m3!1f0!2f0!3f0!3m2!1i1024!2f768!4f13.1!3m3!1m2!1s0x3be7ce6c0989f643%3A0xe54e601c3bf705c7!2sLamington%20Rd%2C%20Grant%20Road%2C%20Mumbai%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin",
  workingHours: [
    { day: "Monday", open: "10:00 AM", close: "08:30 PM", isClosed: false },
    { day: "Tuesday", open: "10:00 AM", close: "08:30 PM", isClosed: false },
    { day: "Wednesday", open: "10:00 AM", close: "08:30 PM", isClosed: false },
    { day: "Thursday", open: "10:00 AM", close: "08:30 PM", isClosed: false },
    { day: "Friday", open: "10:00 AM", close: "08:30 PM", isClosed: false },
    { day: "Saturday", open: "10:00 AM", close: "09:00 PM", isClosed: false },
    { day: "Sunday", open: "11:00 AM", close: "06:00 PM", isClosed: false },
  ],
  
  phone: "+91 98200 12345",
  whatsapp: "919820012345",
  email: "contact@abcelectronics.com",
  website: "https://abcelectronics.com",
  socialLinks: {
    linkedin: "https://linkedin.com/company/abc-electronics",
    twitter: "https://twitter.com/abcelectronics",
    instagram: "https://instagram.com/abcelectronics_tech",
    facebook: "https://facebook.com/abcelectronics",
    youtube: "https://youtube.com/@abcelectronics"
  },
  
  specialities: [
    {
      id: "spec-1",
      title: "Custom Liquid-Cooled Gaming Rigs",
      description: "Handcrafted overclocked gaming and AI workstation builds with precision thermal management and customized RGB aesthetics.",
      tag: "Signature Specialty",
      iconName: "Cpu"
    },
    {
      id: "spec-2",
      title: "Certified Chip-Level Component Repair",
      description: "Advanced BGA rework station for motherboard diagnostics, GPU re-balling, and laptop display matrix restoration.",
      tag: "Authorized Hub",
      iconName: "Wrench"
    },
    {
      id: "spec-3",
      title: "B2B Enterprise Volume Procurement",
      description: "Direct OEM wholesale supply for IT firms, studios, and educational labs with GST input credits and corporate SLA.",
      tag: "Corporate Partner",
      iconName: "Building2"
    },
    {
      id: "spec-4",
      title: "Superfast Same-Day Metro Dispatch",
      description: "Instant express courier and store pickup with live testing before handover across Mumbai, Thane, and Navi Mumbai.",
      tag: "Express Logistics",
      iconName: "Zap"
    }
  ],
  
  certifications: [
    "ASUS ROG Certified Elite Builder 2024",
    "ISO 9001:2015 Quality Assured Service",
    "NVIDIA GeForce Authorized Retail Partner",
    "Dell Premier Solution Partner",
    "100% Genuine Manufacturer Warranty Guarantee"
  ],
  
  achievements: [
    { stat: "10+ Years", label: "Industry Excellence" },
    { stat: "12,500+", label: "Happy Clients Served" },
    { stat: "4.9 / 5.0", label: "Top Customer Rating" },
    { stat: "100%", label: "Genuine Product Guarantee" }
  ],
  
  rating: 4.9,
  totalReviews: 184,
  reviews: [
    {
      id: "rev-1",
      author: "Rohan Malhotra",
      role: "Game Streamer & 3D Artist",
      rating: 5,
      date: "2 days ago",
      comment: "Built my custom RTX 4080 Super workstation here. Cable management is pristine and thermal benchmark temps are fantastic! Highly recommended for any serious gamer or editor.",
      verified: true,
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&q=80"
    },
    {
      id: "rev-2",
      author: "Pooja Deshmukh",
      role: "CTO, NextWave Studio",
      rating: 5,
      date: "1 week ago",
      comment: "We ordered 15 developer laptops for our engineering team. ABC Electronics handled the GST billing smoothly and delivered all configured machines within 24 hours.",
      verified: true,
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&q=80"
    },
    {
      id: "rev-3",
      author: "Karan Singhania",
      role: "Software Engineer",
      rating: 5,
      date: "2 weeks ago",
      comment: "My MacBook motherboard had a short circuit that other shops declared dead. The technician at ABC diagnosed the faulty capacitor in 20 minutes and fixed it at very reasonable cost.",
      verified: true,
      avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&q=80"
    }
  ],
  
  gallery: [
    {
      id: "gal-1",
      url: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80",
      caption: "Our Main Experience Center & Showcase on Lamington Road",
      category: "Storefront"
    },
    {
      id: "gal-2",
      url: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800&q=80",
      caption: "Custom PC Building Lab & Overclocking Bench",
      category: "Workshop"
    },
    {
      id: "gal-3",
      url: "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800&q=80",
      caption: "Enterprise Inventory & High-Performance GPU Depot",
      category: "Depot"
    },
    {
      id: "gal-4",
      url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&q=80",
      caption: "Chip-Level Diagnostic Station with Micro-Soldering Tools",
      category: "Service Lab"
    }
  ],
  
  faqs: [
    {
      id: "faq-1",
      question: "Are all products covered by official manufacturer warranties?",
      answer: "Yes, 100%. We only source directly from brand-authorized distributors. Every purchase includes GST invoice and full brand warranty support across India."
    },
    {
      id: "faq-2",
      question: "Can I request a custom PC configuration or enterprise quotation?",
      answer: "Absolutely! You can reach us on WhatsApp or submit an inquiry right on this portfolio with your desired specs and budget. Our senior hardware engineers will provide optimized part lists and pricing within 2 hours."
    },
    {
      id: "faq-3",
      question: "Do you offer in-store pickup and doorstep delivery?",
      answer: "Yes. In-store demo and pickup is available 7 days a week at our Grant Road showroom. We also offer same-day express delivery across Mumbai/MMR and insured courier shipping pan-India."
    },
    {
      id: "faq-4",
      question: "What payment methods do you accept?",
      answer: "We support UPI, Credit/Debit Cards, Net Banking, No-Cost EMI options on major bank credit cards, and Corporate RTGS/NEFT with GST invoices."
    }
  ]
};

import { getCurrentUserSession } from "./auth-actions";

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
 * Fetch portfolio for the seller dashboard editor
 */
export async function getSellerPortfolio(): Promise<{ success: boolean; portfolio: PortfolioData }> {
  try {
    const client = await clientPromise;
    const db = client.db();
    const session = await getCurrentUserSession();
    
    let portfolioDoc = null;
    const userObjId = session?.userId ? safeObjectId(session.userId) : null;

    if (userObjId) {
      portfolioDoc = await db.collection("portfolios").findOne({ userId: userObjId });
    }
    
    if (!portfolioDoc && session?.slug) {
      portfolioDoc = await db.collection("portfolios").findOne({ slug: session.slug });
    }
    
    if (!portfolioDoc && session?.email) {
      portfolioDoc = await db.collection("portfolios").findOne({ email: session.email.toLowerCase().trim() });
    }

    // If still not found, fetch the seller's profile and initialize their unique portfolio
    if (!portfolioDoc) {
      let sellerDoc = userObjId ? await db.collection("sellers").findOne({ userId: userObjId }) : null;
      if (!sellerDoc && session?.email) {
        sellerDoc = await db.collection("sellers").findOne({ email: session.email.toLowerCase().trim() });
      }

      const storeName = sellerDoc?.storeName || session?.storeName || session?.name || "Seller Store";
      const isAnv = session?.slug === "anv-reealty" || session?.email?.includes("anvreealty") || storeName.includes("ANV");
      const defaultSlug = isAnv ? "anv-reealty" : (session?.slug || (storeName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")) || "seller-store");

      const newDoc: any = {
        ...DEFAULT_PORTFOLIO,
        userId: userObjId || undefined,
        slug: defaultSlug,
        companyName: storeName,
        tagline: isAnv 
          ? "Premier Real Estate Advisory & MahaRERA Certified Commercial Hub"
          : (sellerDoc?.businessType ? `Premier ${sellerDoc.businessType}` : "Verified Products & Services on TrueDeal"),
        about: sellerDoc?.description || (isAnv 
          ? "ANV REEALTY is Pune's leading real estate advisory specializing in Grade-A commercial office space and residential developments."
          : `${storeName} provides authentic, high-quality offerings with dedicated customer support and verified compliance.`),
        businessType: sellerDoc?.businessType || (isAnv ? "Commercial & Residential Real Estate" : "Verified Business"),
        city: sellerDoc?.city || (isAnv ? "Pune" : "Mumbai"),
        email: sellerDoc?.email || session?.email || "contact@seller.com",
        phone: sellerDoc?.phone || "+91 98200 12345",
        website: sellerDoc?.website || (isAnv ? "https://anvreealty.com" : ""),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      delete newDoc._id;

      if (userObjId) {
        const insertRes = await db.collection("portfolios").insertOne(newDoc);
        portfolioDoc = { ...newDoc, _id: insertRes.insertedId };
      } else {
        portfolioDoc = newDoc;
      }
    }
    
    // Sanitize all ObjectIds, Buffers, and Dates to plain serializable JSON
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

import { cookies } from "next/headers";

/**
 * Save / Update portfolio from seller dashboard editor
 */
export async function saveSellerPortfolio(data: Partial<PortfolioData>): Promise<{ success: boolean; slug?: string; error?: string }> {
  try {
    const client = await clientPromise;
    const db = client.db();
    const session = await getCurrentUserSession();
    
    const userObjId = session?.userId ? safeObjectId(session.userId) : null;
    const isAnv = session?.slug === "anv-reealty" || session?.email?.includes("anvreealty") || data.companyName?.includes("ANV");

    // Clean and normalize the new slug
    const rawSlug = data.slug || session?.slug || (isAnv ? "anv-reealty" : "seller-store");
    const newSlug = rawSlug
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "") || "company-portfolio";

    const updatePayload: any = {
      ...data,
      slug: newSlug,
      updatedAt: new Date()
    };

    let docId = data._id;
    delete updatePayload._id;

    if (userObjId) {
      updatePayload.userId = userObjId;
    }

    // Determine precise update filter strictly bound to this seller
    let updateFilter: any = null;
    if (userObjId) {
      updateFilter = { userId: userObjId };
    } else if (docId && safeObjectId(docId)) {
      updateFilter = { _id: safeObjectId(docId) };
    } else if (session?.slug) {
      updateFilter = { slug: session.slug };
    } else if (session?.email) {
      updateFilter = { email: session.email.toLowerCase().trim() };
    }

    if (!updateFilter) {
      return { success: false, error: "Unauthorized: Active session required to save portfolio." };
    }

    await db.collection("portfolios").updateOne(
      updateFilter,
      { $set: updatePayload },
      { upsert: true }
    );

    // Also sync with sellers collection strictly for this user
    if (userObjId || session?.email) {
      const sellerUpdate: any = {};
      if (data.companyName) sellerUpdate.storeName = data.companyName;
      if (data.about) sellerUpdate.description = data.about;
      if (data.website) sellerUpdate.website = data.website;
      if (data.phone) sellerUpdate.phone = data.phone;
      if (data.address) sellerUpdate.address = data.address;
      if (data.city) sellerUpdate.city = data.city;
      if (userObjId) sellerUpdate.userId = userObjId;

      if (Object.keys(sellerUpdate).length > 0) {
        sellerUpdate.updatedAt = new Date();
        const sellerQuery = userObjId ? { userId: userObjId } : { email: session?.email?.toLowerCase().trim() };
        await db.collection("sellers").updateOne(
          sellerQuery,
          { $set: sellerUpdate },
          { upsert: true }
        );
      }
    }

    // Update active session cookie with new slug and company name
    if (session) {
      try {
        const cookieStore = await cookies();
        const updatedSession = {
          ...session,
          slug: newSlug,
          storeName: data.companyName || session.storeName
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
    revalidatePath(`/portfolio/${newSlug}`);
    revalidatePath(`/p/${newSlug}`);
    
    return { success: true, slug: newSlug };
  } catch (error: any) {
    console.error("Error saving seller portfolio:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Fetch public portfolio details by slug along with real seller catalog products
 */
export async function getPublicPortfolio(slug: string = "anv-reealty") {
  try {
    const client = await clientPromise;
    const db = client.db();
    
    const cleanSlug = slug.toLowerCase().trim();

    // Find by exact slug
    let portfolioDoc = await db.collection("portfolios").findOne({ slug: cleanSlug });
    
    if (!portfolioDoc && (cleanSlug.includes("anv") || cleanSlug.includes("realty") || cleanSlug.includes("reealty"))) {
      portfolioDoc = await db.collection("portfolios").findOne({ slug: "anv-reealty" });
    }
    
    const plainDoc = portfolioDoc ? JSON.parse(JSON.stringify(portfolioDoc)) : null;
    const portfolio: PortfolioData = plainDoc
      ? { ...DEFAULT_PORTFOLIO, ...plainDoc, _id: plainDoc._id?.toString() || "" }
      : {
          ...DEFAULT_PORTFOLIO,
          slug: cleanSlug,
          companyName: cleanSlug.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
        };
      
    // Fetch live products strictly scoped to this company / portfolio
    const sellerConditions: any[] = [
      { sellerSlug: portfolio.slug }
    ];
    if (portfolioDoc?.userId) {
      try {
        const seller = await db.collection("sellers").findOne({ userId: portfolioDoc.userId });
        if (seller?._id) {
          sellerConditions.push({ sellerId: seller._id });
        }
      } catch {}
    }
    if (portfolio.slug === "anv-reealty") {
      sellerConditions.push({ sourceUrl: { $regex: "anvreealty|anvrealty", $options: "i" } });
      sellerConditions.push({ brand: { $regex: "ANV", $options: "i" } });
    }

    const sellerQuery: any = { isActive: true, $or: sellerConditions };

    const rawProducts = await db.collection("products")
      .aggregate([
        { $match: sellerQuery },
        { $sort: { updatedAt: -1 } },
        { $limit: 100 },
        {
          $lookup: {
            from: "categories",
            localField: "categoryId",
            foreignField: "_id",
            as: "cat"
          }
        },
        {
          $unwind: {
            path: "$cat",
            preserveNullAndEmptyArrays: true
          }
        }
      ])
      .toArray();
      
    const products = rawProducts.map((p) => ({
      id: p._id.toString(),
      title: p.title,
      description: p.description || p.shortDesc || "",
      price: p.price,
      originalPrice: p.originalPrice,
      brand: p.brand || portfolio.companyName,
      category: p.cat?.name || p.category || "Commercial Properties",
      inventory: p.inventory,
      image: p.images?.find((img: any) => img.isPrimary)?.url || p.images?.[0]?.url || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=500&q=80",
      badgeType: p.badgeType || "website",
      aiVisibility: p.aiVisibility || 90,
      sourceUrl: p.sourceUrl || ""
    }));
    
    return {
      success: true,
      portfolio,
      products
    };
  } catch (error: any) {
    console.error("Error retrieving public portfolio:", error);
    return {
      success: true,
      portfolio: DEFAULT_PORTFOLIO,
      products: []
    };
  }
}

/**
 * Handle buyer RFQ / inquiry form submissions from public portfolio
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
    const client = await clientPromise;
    const db = client.db();
    
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
 * Import and synchronize full scraped company data (profile, reviews, gallery, faqs, hours, contacts) into the seller's portfolio
 */
export async function importScrapedPortfolioAction(companyData: any) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const session = await getCurrentUserSession();

    const userObjId = session?.userId ? safeObjectId(session.userId) : null;
    
    // Find existing portfolio
    let portfolioDoc = null;
    if (userObjId) {
      portfolioDoc = await db.collection("portfolios").findOne({ userId: userObjId });
    }
    if (!portfolioDoc && session?.slug) {
      portfolioDoc = await db.collection("portfolios").findOne({ slug: session.slug });
    }
    if (!portfolioDoc && session?.email) {
      portfolioDoc = await db.collection("portfolios").findOne({ email: session.email.toLowerCase().trim() });
    }

    const isAnv = session?.slug === "anv-reealty" || session?.email?.includes("anvreealty") || (companyData.name && companyData.name.includes("ANV"));
    const rawSlug = companyData.name 
      ? companyData.name.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "")
      : (session?.slug || (isAnv ? "anv-reealty" : "seller-store"));
    
    const slug = portfolioDoc?.slug || rawSlug || "company-portfolio";

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

    // Calculate rating
    let avgRating = 4.9;
    if (scrapedReviews.length > 0) {
      const sum = scrapedReviews.reduce((acc: number, curr: any) => acc + (curr.rating || 5), 0);
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

    // Working Hours
    const workingHours = companyData.workingHours && companyData.workingHours.length > 0 
      ? companyData.workingHours 
      : (portfolioDoc?.workingHours || DEFAULT_PORTFOLIO.workingHours);

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
    if (workingHours) updatePayload.workingHours = workingHours;

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

    if (userObjId) {
      updatePayload.userId = userObjId;
    }

    // Determine query filter
    let filter: any = null;
    if (userObjId) {
      filter = { userId: userObjId };
    } else if (portfolioDoc?._id) {
      filter = { _id: portfolioDoc._id };
    } else if (session?.slug) {
      filter = { slug: session.slug };
    } else if (session?.email) {
      filter = { email: session.email.toLowerCase().trim() };
    } else {
      filter = { slug };
    }

    await db.collection("portfolios").updateOne(
      filter,
      { $set: updatePayload },
      { upsert: true }
    );

    // Sync to sellers collection
    const sellerUpdate: any = { updatedAt: new Date() };
    if (companyData.name) sellerUpdate.storeName = companyData.name;
    if (companyData.about) sellerUpdate.description = companyData.about;
    if (companyData.website) sellerUpdate.website = companyData.website;
    if (companyData.phone) sellerUpdate.phone = companyData.phone;
    if (companyData.address) sellerUpdate.address = companyData.address;
    if (companyData.city) sellerUpdate.city = companyData.city;
    if (userObjId) sellerUpdate.userId = userObjId;

    const sellerFilter = userObjId 
      ? { userId: userObjId } 
      : (session?.email ? { email: session.email.toLowerCase().trim() } : { slug });

    await db.collection("sellers").updateOne(
      sellerFilter,
      { $set: sellerUpdate },
      { upsert: true }
    );

    // Update active session cookie with new slug and company name
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
    const client = await clientPromise;
    const db = client.db();
    const session = await getCurrentUserSession();
    const userObjId = session?.userId ? safeObjectId(session.userId) : null;

    let filter: any = userObjId ? { userId: userObjId } : (session?.slug ? { slug: session.slug } : { email: session?.email });
    if (!filter) return { success: false, error: "Unauthorized" };

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
      filter,
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
    const client = await clientPromise;
    const db = client.db();
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
    const client = await clientPromise;
    const db = client.db();
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
    const client = await clientPromise;
    const db = client.db();
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
    if (companyData.email) updatePayload.email = companyData.email;
    if (companyData.website) updatePayload.website = companyData.website;
    if (companyData.workingHours && companyData.workingHours.length > 0) {
      updatePayload.workingHours = companyData.workingHours;
    }

    await db.collection("portfolios").updateOne(
      filter,
      { $set: updatePayload },
      { upsert: true }
    );

    revalidatePath("/dashboard/portfolio");
    revalidatePath("/dashboard");
    revalidatePath("/connect");

    return {
      success: true,
      message: `Successfully updated company profile in your portfolio!`
    };
  } catch (error: any) {
    console.error("Error importing company profile:", error);
    return { success: false, error: error.message };
  }
}

