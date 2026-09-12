import { NextResponse } from "next/server";
import clientPromise, { getDb, getAllSellerProductCollectionNames } from "@/lib/mongodb";
import { parseSearchIntentWithGemini, generateGeminiSearchResponse, generateGeminiConversationalAnswer } from "@/lib/gemini";
import { recordSearchQuery } from "@/lib/telemetry";

export interface SearchListingItem {
  id: string;
  title: string;
  price: string;
  rawPrice?: number;
  originalPrice?: string;
  category: string;
  location: string;
  city?: string;
  state?: string;
  badge: string;
  badgeColor?: string;
  image: string;
  description: string;
  specs?: string[];
  link: string;
  websiteUrl?: string;
  productUrl?: string;
  sourceUrl?: string;
  buyUrl?: string;
  whatsappUrl?: string;
  phone?: string;
  sellerName?: string;
  sellerSlug?: string;
}

const STOPWORDS = new Set([
  "in", "a", "an", "the", "for", "is", "of", "and", "to", "with", "per", "on", "at", 
  "by", "or", "show", "me", "find", "get", "search", "give", "list", "listing", 
  "listings", "all", "type", "near", "under", "need", "want", "please", "chatgpt",
  "can", "you", "tell", "about", "what", "are", "do", "does", "have", "some", "any", "from",
  "who", "where", "when", "why", "how", "much", "many", "price", "prices", "cost", "costs",
  "rate", "rates", "buy", "sell", "selling", "available", "availability", "detail", "details",
  "info", "information", "product", "products", "item", "items", "i", "my", "we", "our",
  // Common action / display words that shouldn't pollute search token matching
  "view", "views", "showing", "see", "look", "looking", "check", "display", "explore", "options",
  // Common greetings as stopwords so they don't corrupt product searches
  "hi", "hii", "hiii", "hello", "helloo", "hey", "heyy", "hlo", "hye", "namaste", "namaskar",
  "pranam", "vanakkam", "morning", "afternoon", "evening", "greetings", "sup", "yo", "good"
]);

const GENERIC_SEARCH_WORDS = new Set([
  "product", "products", "item", "items", "catalog", "store", "shop", "everything",
  "all", "inventory", "things", "buy", "sell", "available", "offerings", "services"
]);

// Matches any casual greeting or chit-chat (how are you, hello, who are you, thank you, etc.)
const CONVERSATIONAL_REGEX = /^(h+[ie]+y*|h+e+l+l*o+|h+l+o+|greetings|good\s+(morning|afternoon|evening|night)|howdy|hola|namaste|namaskar|pranam|vanakkam|salaam|sup|yo|how\s+are\s+you(\s+doing)?|how\s+do\s+you\s+do|how'?s\s+(it\s+going|everything|your\s+day)|who\s+are\s+you|what\s+is\s+your\s+name|who\s+made\s+you|what\s+is\s+truedeal|how\s+does\s+(truedeal|this)\s+work|what\s+can\s+you\s+do|help|tell\s+me\s+about\s+yourself|tell\s+me\s+a\s+joke|thank\s*(you|s)?|thanks|ok|okay|cool|great|nice|awesome|bye|goodbye|see\s+you)[\s!?.]*$/i;

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function parseProductPrice(rawPrice: any): number {
  if (typeof rawPrice === "number") return rawPrice;
  if (!rawPrice) return 0;
  const str = String(rawPrice).toLowerCase().trim();
  const num = parseFloat(str.replace(/[^0-9.]/g, "")) || 0;
  if (num === 0) return 0;
  if (str.includes("cr") || str.includes("crore")) return num * 10000000;
  if (str.includes("lakh") || str.includes("lac")) return num * 100000;
  if (str.includes("k") && !str.includes("lakh")) return num * 1000;
  return num;
}

function extractPriceBounds(query: string, parsedRange?: { min?: number; max?: number }) {
  let minPrice: number | undefined = undefined;
  let maxPrice: number | undefined = undefined;

  // 1. Normalize from AI parsedIntent if present
  if (parsedRange) {
    if (typeof parsedRange.max === "number" && parsedRange.max > 0) {
      if (parsedRange.max < 100 && /(?:cr|crore)/i.test(query)) {
        maxPrice = parsedRange.max * 10000000;
      } else if (parsedRange.max < 1000 && /(?:lakh|lac)/i.test(query)) {
        maxPrice = parsedRange.max * 100000;
      } else {
        maxPrice = parsedRange.max;
      }
    }
    if (typeof parsedRange.min === "number" && parsedRange.min > 0) {
      if (parsedRange.min < 100 && /(?:cr|crore)/i.test(query)) {
        minPrice = parsedRange.min * 10000000;
      } else if (parsedRange.min < 1000 && /(?:lakh|lac)/i.test(query)) {
        minPrice = parsedRange.min * 100000;
      } else {
        minPrice = parsedRange.min;
      }
    }
  }

  // 2. Deterministic regex from raw query (highest reliability for Indian numbering)
  const lower = query.toLowerCase();

  const parseVal = (numStr: string, unitStr?: string): number | undefined => {
    const val = parseFloat(numStr);
    if (isNaN(val)) return undefined;
    const unit = (unitStr || "").toLowerCase();
    if (unit.startsWith("cr") || unit.startsWith("crore")) return val * 10000000;
    if (unit.startsWith("l") || unit.startsWith("lac")) return val * 100000;
    if (unit.startsWith("k")) return val * 1000;
    if (/(?:cr|crore)/i.test(lower) && val < 500) return val * 10000000;
    if (/(?:lakh|lac)/i.test(lower) && val < 5000) return val * 100000;
    return val;
  };

  const maxMatch = lower.match(/(?:under|below|less\s+than|up\s*to|upto|max|budget|within|<|<=)\s*(?:rs\.?|₹|inr)?\s*(\d+(?:\.\d+)?)\s*(cr(?:ore)?s?|l(?:akh)?s?|lac?s?|k)?\b/i);
  if (maxMatch) {
    const parsed = parseVal(maxMatch[1], maxMatch[2]);
    if (parsed !== undefined) {
      maxPrice = maxPrice !== undefined ? Math.min(maxPrice, parsed) : parsed;
    }
  }

  const minMatch = lower.match(/(?:above|over|more\s+than|min|minimum|starting\s+at|from|>|>=)\s*(?:rs\.?|₹|inr)?\s*(\d+(?:\.\d+)?)\s*(cr(?:ore)?s?|l(?:akh)?s?|lac?s?|k)?\b/i);
  if (minMatch) {
    const parsed = parseVal(minMatch[1], minMatch[2]);
    if (parsed !== undefined) {
      minPrice = minPrice !== undefined ? Math.max(minPrice, parsed) : parsed;
    }
  }

  const rangeMatch = lower.match(/(?:between\s+)?(?:rs\.?|₹)?\s*(\d+(?:\.\d+)?)\s*(cr|crore|lakh|lac|k)?\s*(?:to|-|and)\s*(?:rs\.?|₹)?\s*(\d+(?:\.\d+)?)\s*(cr|crore|lakh|lac|k)\b/i);
  if (rangeMatch) {
    const unit1 = rangeMatch[2] || rangeMatch[4];
    const unit2 = rangeMatch[4];
    const rMin = parseVal(rangeMatch[1], unit1);
    const rMax = parseVal(rangeMatch[3], unit2);
    if (rMin !== undefined) minPrice = rMin;
    if (rMax !== undefined) maxPrice = rMax;
  }

  return { minPrice, maxPrice };
}

function cleanAiSummaryText(text: string, listings: any[]): string {
  if (!text) return "";

  let cleaned = text;

  // 1. Remove greeting / boilerplate intro
  cleaned = cleaned.replace(/^(?:hello!?|hi!?|hey!?|greetings!?)[^\n]*?(?:truedeal\s*ai|marketplace)?[^\n]*?:?\s*\n*/i, "");
  cleaned = cleaned.replace(/^As\s+TrueDeal\s+AI,?\s+[^\n]*?:?\s*\n*/i, "");
  cleaned = cleaned.replace(/^Here\s+are\s+(?:some\s+)?verified\s+[^\n]*?:?\s*\n*/i, "");

  // 2. If listings are present, remove redundant bullet points repeating listing names/specs/prices
  if (listings && listings.length > 0) {
    const listingTitles = listings.map(l => (l.title || l.name || "").toLowerCase().trim()).filter(Boolean);
    const lines = cleaned.split("\n");
    const filteredLines = lines.filter(line => {
      const trimmed = line.trim();
      const isBullet = /^[•\-\*]\s+/i.test(trimmed) || /^\d+\.\s+/i.test(trimmed);
      if (isBullet) {
        const lowerLine = trimmed.toLowerCase();
        const matchesListing = listingTitles.some(title => {
          const words = title.split(/\s+/).filter((w: string) => w.length > 3);
          return words.length > 0 && words.filter((w: string) => lowerLine.includes(w)).length >= 2;
        });
        const hasPriceTag = /₹\s*\d+(?:\.\d+)?\s*(?:cr|lakh|k)?/i.test(trimmed);
        if (matchesListing || hasPriceTag) {
          return false;
        }
      }
      return true;
    });
    cleaned = filteredLines.join("\n");
  }

  // 3. Remove fluff marketing outro & unsolicited clarifying questions
  cleaned = cleaned.replace(/check\s+out\s+the\s+(?:product\s+|listing\s+)?details\s+below[^\n]*\.?/gi, "");
  cleaned = cleaned.replace(/reach\s+out\s+to\s+sellers\s+directly[^\n]*\.?/gi, "");
  cleaned = cleaned.replace(/tap\s+any\s+quick\s+question\s+below[^\n]*\.?/gi, "");
  cleaned = cleaned.replace(/feel\s+free\s+to\s+ask[^\n]*\.?/gi, "");
  cleaned = cleaned.replace(/let\s+me\s+know\s+if\s+you\s+need\s+anything\s+else[^\n]*\.?/gi, "");
  cleaned = cleaned.replace(/💬\s*[^\n]*/gi, "");
  cleaned = cleaned.replace(/(?:would\s+you\s+(?:like|prefer)|do\s+you\s+(?:want|prefer)|feel\s+free\s+to)[^\n]*\?/gi, "");

  // 4. Clean up excess newlines
  cleaned = cleaned.replace(/\n{3,}/g, "\n\n").trim();

  return cleaned;
}

let hasSeededCatalog = false;
async function ensureMarketplaceCatalogSeeded(db: any) {
  if (hasSeededCatalog) return;
  try {
    const ayurmorCount = await db.collection("products_ayurmor").countDocuments();
    if (ayurmorCount === 0) {
      const { ensureSeedProductsInDatabase } = await import("@/lib/seed-catalog");
      await ensureSeedProductsInDatabase();
    }
    hasSeededCatalog = true;
  } catch {}
}

export async function POST(req: Request) {
  let query = "";
  try {
    const body = await req.json().catch(() => ({}));
    query = (body.query || "").toString().trim();
    const conversationHistory = Array.isArray(body.conversationHistory) ? body.conversationHistory : undefined;

    if (!query) {
      return NextResponse.json({
        success: true,
        text: "Please type a keyword or describe what you are looking for in products, services, or verified businesses.",
        appliedFilters: ["⚡ Database Ready"],
        suggestedFollowUps: ["🍲 Ayurmor Moringa Premix Soup", "🥤 ABC Malt Health Drink", "🏢 Commercial Properties Pune"],
        listings: []
      });
    }

    const lowerQuery = query.toLowerCase().trim();
    const isConversational = CONVERSATIONAL_REGEX.test(lowerQuery);

    // Instant conversational response for greetings, chit-chat, identity, or general questions (Never return listings!)
    if (isConversational) {
      const conversationalAnswer = await generateGeminiConversationalAnswer(query, conversationHistory);
      return NextResponse.json({
        success: true,
        query,
        text: conversationalAnswer,
        appliedFilters: ["💬 TrueDeal Assistant"],
        suggestedFollowUps: [
          "🏢 Commercial Properties in Pune",
          "🍲 Ayurmor Moringa & Herbal Mixes",
          "💻 Tech & Laptops"
        ],
        listings: [],
        companyProfile: null
      });
    }

    const rawTokens = lowerQuery.split(/[^\w\d]+/).filter(Boolean);
    const searchTokens = rawTokens.filter(t => t.length >= 2 && !STOPWORDS.has(t));
    const fallbackTokens = searchTokens.length > 0 ? searchTokens : rawTokens.filter(t => t.length >= 2);

    // 1. Natural language intent parsing with AI
    let parsedIntent: any = { intent: "search_products", keywords: fallbackTokens };
    try {
      parsedIntent = await parseSearchIntentWithGemini(query, conversationHistory);
    } catch {}

    // Clean extracted keywords against stopwords
    const cleanAiKeywords = (parsedIntent.keywords || [])
      .map((k: string) => k.toLowerCase().trim())
      .filter((k: string) => k.length >= 2 && !STOPWORDS.has(k));

    // Check if query is conversational question (Q&A without product search intent)
    const isGeneralQA = 
      (parsedIntent.intent === "general_qa" || parsedIntent.intent === "chit_chat" || parsedIntent.intent === "greeting") &&
      searchTokens.length === 0 &&
      cleanAiKeywords.length === 0;

    if (isGeneralQA) {
      const conversationalAnswer = await generateGeminiConversationalAnswer(query, conversationHistory);
      return NextResponse.json({
        success: true,
        query,
        text: conversationalAnswer,
        appliedFilters: ["💬 TrueDeal Assistant"],
        suggestedFollowUps: [
          "🏢 Commercial Properties in Pune",
          "🍲 Ayurmor Moringa & Herbal Mixes",
          "💻 Tech & Laptops"
        ],
        listings: [],
        companyProfile: null
      });
    }

    const isExplicitCatalogBrowse = 
      /^(all|all\s+products|all\s+listings|browse|browse\s+all|browse\s+catalog|show\s+all|show\s+all\s+products|explore|explore\s+all|catalog|view\s+all|view\s+all\s+products)$/i.test(lowerQuery);

    const combinedTokens = Array.from(new Set([...fallbackTokens, ...cleanAiKeywords])).filter(t => t.length >= 2);
    const finalTokens = combinedTokens.length > 0 ? combinedTokens : [lowerQuery];

    // 2. Query MongoDB strictly from the database
    let dbProducts: any[] = [];
    let matchedCompanyProfile: any = null;
    let mongoConnected = false;

    try {
      const client = await clientPromise;
      if (client) {
        const db = client.db();
        mongoConnected = true;

        // Auto-seed marketplace catalog (e.g. Ayurmor products) if collection is empty
        await ensureMarketplaceCatalogSeeded(db);

        // 2a. Query products across all seller collections in Truedeal DB
        const escapedTokens = finalTokens.map(escapeRegex);
        const sellerProductCollections = await getAllSellerProductCollectionNames();
        let candidateDocs: any[] = [];

        if (isExplicitCatalogBrowse) {
          for (const colName of sellerProductCollections) {
            try {
              const docs = await db.collection(colName)
                .find({ isActive: true })
                .sort({ updatedAt: -1 })
                .limit(10)
                .toArray();
              candidateDocs.push(...docs);
            } catch {}
          }
          dbProducts = candidateDocs.slice(0, 20);
        } else {
          // If no search tokens exist and query is not explicit browse, don't dump random catalog
          if (searchTokens.length === 0 && cleanAiKeywords.length === 0) {
            const conversationalAnswer = await generateGeminiConversationalAnswer(query, conversationHistory);
            return NextResponse.json({
              success: true,
              query,
              text: conversationalAnswer,
              appliedFilters: ["💬 TrueDeal Assistant"],
              suggestedFollowUps: [
                "🏢 Commercial Properties in Pune",
                "🍲 Ayurmor Moringa & Herbal Mixes",
                "💻 Tech & Laptops"
              ],
              listings: [],
              companyProfile: null
            });
          }

          // Strictly match keyword tokens against actual product content fields
          const orConditions: any[] = escapedTokens.map(token => ({
            $or: [
              { title: { $regex: token, $options: "i" } },
              { name: { $regex: token, $options: "i" } },
              { modelName: { $regex: token, $options: "i" } },
              { description: { $regex: token, $options: "i" } },
              { shortDesc: { $regex: token, $options: "i" } },
              { brand: { $regex: token, $options: "i" } },
              { sellerSlug: { $regex: token, $options: "i" } },
              { portfolioSlug: { $regex: token, $options: "i" } },
              { aiKeywords: { $regex: token, $options: "i" } },
              { category: { $regex: token, $options: "i" } },
              { type: { $regex: token, $options: "i" } },
              { "specs.value": { $regex: token, $options: "i" } },
              { "specs.key": { $regex: token, $options: "i" } }
            ]
          }));

          const regexFilter = orConditions.length > 0 ? { isActive: true, $or: orConditions } : { isActive: true };

          for (const colName of sellerProductCollections) {
            try {
              const docs = await db.collection(colName)
                .find(regexFilter)
                .limit(30)
                .toArray();
              candidateDocs.push(...docs);
            } catch {}
          }

          // Category Intent Detection & Hard Isolation
          const isRealEstateQuery = /(commercial|office|retail|property|properties|real estate|showroom|eon|wtc|kharadi|baner|workstation|bare-shell|plug-and-play)/i.test(lowerQuery);
          const isFoodWellnessQuery = /(ayurmor|moringa|soup|malt|wellness|sprouted|beverage|ragi|nutrition|herbal|health mix|powder|superfood)/i.test(lowerQuery);
          const isSkincareQuery = /(pureplush|pureplus|soap|soaps|shampoo|facewash|facepack|waxing|kesh oil|hair wash|sheabutter|clay|organic skincare|haircare|botanical)/i.test(lowerQuery);

          // Hard cross-category isolation (Never mix real estate with food/wellness/skincare)
          if (isFoodWellnessQuery) {
            candidateDocs = candidateDocs.filter(p => {
              const pCat = (p.category || "").toLowerCase();
              const pType = (p.type || "").toLowerCase();
              const pTitle = (p.title || p.name || "").toLowerCase();
              return !pCat.includes("commercial") && !pCat.includes("real estate") && !pType.includes("property") && !pTitle.includes("office") && !pTitle.includes("showroom");
            });
          } else if (isRealEstateQuery) {
            candidateDocs = candidateDocs.filter(p => {
              const pCat = (p.category || "").toLowerCase();
              const pBrand = (p.brand || "").toLowerCase();
              return !pCat.includes("soup") && !pCat.includes("wellness") && !pCat.includes("powder") && !pBrand.includes("ayurmor") && !pBrand.includes("pureplush");
            });
          } else if (isSkincareQuery) {
            candidateDocs = candidateDocs.filter(p => {
              const pCat = (p.category || "").toLowerCase();
              const pType = (p.type || "").toLowerCase();
              return !pCat.includes("commercial") && !pCat.includes("real estate") && !pType.includes("property");
            });
          }

          const scoredDocs = candidateDocs.map(p => {
            let score = 0;
            const pTitle = (p.title || p.name || "").toLowerCase();
            const pBrand = (p.brand || "").toLowerCase();
            const pCategory = (p.category || "").toLowerCase();
            const pText = `${pTitle} ${pCategory} ${pBrand} ${p.shortDesc} ${(p.aiKeywords || []).join(" ")}`.toLowerCase();
            
            for (const token of finalTokens) {
              if (pTitle.includes(token)) score += 30;
              if (pBrand.includes(token)) score += 20;
              if (pCategory.includes(token)) score += 15;
              if (pText.includes(token)) score += 10;
            }

            if (isRealEstateQuery && (pCategory.includes("commercial") || pCategory.includes("real estate") || p.type?.toLowerCase().includes("property"))) {
              score += 50;
            } else if (isRealEstateQuery && !pCategory.includes("commercial") && !pCategory.includes("real estate")) {
              score -= 100;
            }

            if (isFoodWellnessQuery && (pCategory.includes("soup") || pCategory.includes("wellness") || pCategory.includes("malt") || pBrand.includes("ayurmor") || pCategory.includes("ayurvedic"))) {
              score += 50;
            } else if (isFoodWellnessQuery && (pCategory.includes("commercial") || pCategory.includes("real estate"))) {
              score -= 100;
            }

            if (isSkincareQuery && (pCategory.includes("soap") || pCategory.includes("shampoo") || pCategory.includes("powder") || pCategory.includes("oil") || pCategory.includes("care") || pBrand.includes("pureplush") || pBrand.includes("pureplus"))) {
              score += 50;
            } else if (isSkincareQuery && (pCategory.includes("commercial") || pCategory.includes("real estate"))) {
              score -= 100;
            }

            return { doc: p, score };
          });

          // Filter out heavily negative-scored docs and sort by relevance
          // STRICT RULE: If score is 0 or less, NEVER return random or fallback docs!
          dbProducts = scoredDocs
            .filter(item => item.score > 0)
            .sort((a, b) => b.score - a.score)
            .map(item => item.doc);
        }

        // 2b. Strictly apply budget / price boundary filtering (e.g. "under 8 Cr")
        const priceBounds = extractPriceBounds(query, parsedIntent?.priceRange);
        if (priceBounds.maxPrice !== undefined || priceBounds.minPrice !== undefined) {
          const priceFiltered = dbProducts.filter(p => {
            const pVal = parseProductPrice(p.price);
            if (pVal > 0) {
              if (priceBounds.maxPrice !== undefined && pVal > priceBounds.maxPrice) return false;
              if (priceBounds.minPrice !== undefined && pVal < priceBounds.minPrice) return false;
              return true;
            }
            return false;
          });
          // Strictly enforce budget ceiling so out-of-budget items are never returned
          dbProducts = priceFiltered;
        }

        // 2b. Accurately resolve Company Profile Showcase (ONLY if query specifically inquires about a company/brand)
        const isFoodOrSkincare = /(ayurmor|moringa|soup|malt|wellness|sprouted|beverage|ragi|nutrition|herbal|health mix|powder|superfood|pureplush|soap|shampoo)/i.test(lowerQuery);
        const isExplicitAnv = !isFoodOrSkincare && /(anv\s*reealty|anv\s*realty|anv real estate|\banv\b)/i.test(lowerQuery);
        const isExplicitAyurmor = /(ayurmor|saish\s*technofarms|saish\s*techno)/i.test(lowerQuery);
        const isExplicitPureplush = /(pureplush|pureplus|pure\s*plush)/i.test(lowerQuery);

        let targetCompanySlug: string | null = null;
        if (isExplicitAnv) {
          targetCompanySlug = "anvreeality";
        } else if (isExplicitAyurmor) {
          targetCompanySlug = "ayurmor-more";
        } else if (isExplicitPureplush) {
          targetCompanySlug = "pureplush";
        }

        if (targetCompanySlug) {
          const foundPortfolio = await db.collection("portfolios").findOne({
            $or: [{ slug: targetCompanySlug }, { slug: { $regex: escapeRegex(targetCompanySlug), $options: "i" } }]
          });

          if (foundPortfolio) {
            const pDoc = JSON.parse(JSON.stringify(foundPortfolio));
            matchedCompanyProfile = {
              name: pDoc.companyName || pDoc.storeName || "Verified Business",
              ownerName: pDoc.ownerName || pDoc.contactPerson || undefined,
              businessType: pDoc.businessType || "Verified Merchant",
              yearEstablished: pDoc.yearEstablished || undefined,
              tagline: pDoc.tagline || "",
              about: pDoc.about || "",
              website: pDoc.website || "",
              portfolioUrl: `/portfolio/${pDoc.slug}`,
              phone: pDoc.phone || "",
              whatsapp: pDoc.whatsapp || "",
              email: pDoc.email || "",
              address: pDoc.address || "",
              city: pDoc.city || "",
              state: pDoc.state || "",
              gstin: pDoc.gstin || "",
              rating: pDoc.rating || 5.0,
              totalReviews: pDoc.totalReviews || 0,
              logo: pDoc.logo || "",
              services: Array.isArray(pDoc.specialities) 
                ? pDoc.specialities.map((s: any) => typeof s === "object" ? s.title || s.name : String(s))
                : (Array.isArray(pDoc.categories) ? pDoc.categories : [])
            };
          }
        }
      }
    } catch (mongoErr: any) {
      console.error("MongoDB Query Error in search-listings:", mongoErr.message);
    }

    if (!mongoConnected) {
      return NextResponse.json({
        success: true,
        query,
        text: `Unable to connect to MongoDB database (check Atlas Network Access IP whitelist). Please verify your MongoDB connection to fetch live database listings.`,
        appliedFilters: ["⚠️ Database Offline"],
        suggestedFollowUps: [],
        listings: []
      });
    }

    // 3. Deduplicate and Map ONLY real database products to UI SearchListingItem format
    const seenTitles = new Set<string>();
    const uniqueDbProducts = dbProducts.filter(p => {
      const normalizedTitle = (p.title || p.name || "").toLowerCase().trim();
      if (!normalizedTitle || seenTitles.has(normalizedTitle)) return false;
      seenTitles.add(normalizedTitle);
      return true;
    });

    const rawListings: SearchListingItem[] = uniqueDbProducts.map((p, pIdx) => {
      const primaryImg = p.images?.find((img: any) => img.isPrimary)?.url || p.images?.[0]?.url || p.image || "https://images.unsplash.com/photo-1557821552-17105176677c?w=600&q=80";
      const sellerSlug = p.sellerSlug || p.portfolioSlug || "seller";
      const companyName = p.brand || matchedCompanyProfile?.name || "Verified Seller";
      const city = p.city || "";
      const state = p.state || "";
      const gstin = p.gstin || undefined;
      
      const priceVal = typeof p.price === "number" ? p.price : (parseFloat(String(p.price).replace(/[^0-9.]/g, "")) || 0);
      const formattedPrice = priceVal >= 10000000 
        ? `₹${(priceVal / 10000000).toFixed(2)} Cr` 
        : priceVal >= 100000 
          ? `₹${(priceVal / 100000).toFixed(2)} Lakh` 
          : priceVal > 0 
            ? `₹${priceVal.toLocaleString("en-IN")}`
            : "Contact for Pricing";

      const uniqueId = p._id ? p._id.toString() : `db-item-${pIdx}`;

      return {
        id: uniqueId,
        title: p.title || p.name || "Untitled Product",
        price: formattedPrice,
        rawPrice: priceVal,
        originalPrice: p.originalPrice ? (p.originalPrice >= 10000000 ? `₹${(p.originalPrice / 10000000).toFixed(2)} Cr` : `₹${Number(p.originalPrice).toLocaleString("en-IN")}`) : undefined,
        category: p.category || "Database Listing",
        location: city && state ? `${city}, ${state}` : (city || state || "India"),
        city,
        state,
        badge: gstin ? `GSTIN: ${gstin}` : (p.badgeType === "rera" ? "MahaRERA Approved" : `${companyName.split(" ")[0]} Verified`),
        badgeColor: p.badgeType === "rera" ? "bg-indigo-50 text-indigo-700 border-indigo-200" : "bg-emerald-50 text-emerald-700 border-emerald-200",
        image: primaryImg,
        description: p.description || p.shortDesc || "Verified catalog listing in database.",
        specs: Array.isArray(p.specs) 
          ? p.specs.map((s: any) => typeof s === "object" ? `${s.key}: ${s.value}` : String(s)) 
          : ["Database Verified"],
        link: `/portfolio/${sellerSlug}`,
        websiteUrl: p.sourceUrl || p.buyUrl || p.productUrl || p.website || matchedCompanyProfile?.website || "",
        productUrl: p.sourceUrl || p.buyUrl || p.productUrl || "",
        sourceUrl: p.sourceUrl || p.buyUrl || p.productUrl || "",
        buyUrl: p.buyUrl || p.sourceUrl || p.productUrl || "",
        whatsappUrl: p.whatsapp ? `https://wa.me/${p.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi ${companyName}, I am inquiring about "${p.title || p.name}" on TrueDeal.`)}` : (matchedCompanyProfile?.whatsapp ? `https://wa.me/${matchedCompanyProfile.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi ${companyName}, I am inquiring about "${p.title || p.name}" on TrueDeal.`)}` : undefined),
        phone: p.phone || matchedCompanyProfile?.phone || "",
        sellerName: companyName,
        sellerSlug
      };
    });

    // 4. Generate Conversational Intelligence based strictly on real database listings
    let summaryText = "";
    let effectiveFilters: string[] = [];
    let effectiveFollowUps: string[] = [];

    if (rawListings.length === 0 && !matchedCompanyProfile) {
      summaryText = "No result found";
      effectiveFilters = [];
      effectiveFollowUps = [];
    } else {
      const aiOutput = await generateGeminiSearchResponse(query, rawListings, parsedIntent, matchedCompanyProfile, conversationHistory);

      summaryText = cleanAiSummaryText(aiOutput.summaryText, rawListings);
      if (!summaryText || summaryText.includes("No result found")) {
        if (rawListings.length > 0) {
          summaryText = `Found **${rawListings.length} verified listing${rawListings.length === 1 ? "" : "s"}** matching your search.`;
        } else if (matchedCompanyProfile) {
          summaryText = `Showing verified company profile for **"${matchedCompanyProfile.name}"**.`;
        }
      }

      effectiveFilters = [...(aiOutput.appliedFilters || ["⚡ Database Verified"])];
      const userPriceBounds = extractPriceBounds(query, parsedIntent?.priceRange);
      if (userPriceBounds.maxPrice !== undefined) {
        const budgetBadge = `💰 Under ₹${userPriceBounds.maxPrice >= 10000000 ? (userPriceBounds.maxPrice / 10000000).toFixed(userPriceBounds.maxPrice % 10000000 === 0 ? 0 : 2) + " Cr" : (userPriceBounds.maxPrice / 100000).toFixed(userPriceBounds.maxPrice % 100000 === 0 ? 0 : 2) + " Lakh"}`;
        if (!effectiveFilters.some(f => f.toLowerCase().includes("under") || f.includes("₹"))) {
          effectiveFilters.push(budgetBadge);
        }
      }
      effectiveFollowUps = aiOutput.suggestedFollowUps || [];
    }

    // Record real search query into telemetry logs
    recordSearchQuery({
      query,
      visitorId: body.visitorId || undefined,
      resultsCount: rawListings.length
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      query,
      text: summaryText,
      appliedFilters: effectiveFilters,
      suggestedFollowUps: effectiveFollowUps,
      listings: rawListings,
      companyProfile: matchedCompanyProfile || undefined
    });
  } catch (error: any) {
    console.error("Error in search-listings API:", error);
    return NextResponse.json({
      success: true,
      query,
      text: `An error occurred while querying the database: ${error.message}`,
      appliedFilters: ["⚠️ Database Error"],
      suggestedFollowUps: [],
      listings: []
    });
  }
}
