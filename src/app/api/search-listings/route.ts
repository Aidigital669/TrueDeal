import { NextResponse } from "next/server";
import clientPromise, { getDb, getAllSellerProductCollectionNames } from "@/lib/mongodb";
import { parseSearchIntentWithGemini, generateGeminiSearchResponse } from "@/lib/gemini";

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
  "info", "information", "product", "products", "item", "items", "i", "my", "we", "our"
]);

const GENERIC_SEARCH_WORDS = new Set([
  "product", "products", "item", "items", "catalog", "store", "shop", "everything",
  "all", "inventory", "things", "buy", "sell", "available", "offerings", "services"
]);

const GREETING_REGEX = /^(hi|hello|hey|greetings|good\s+(morning|afternoon|evening)|howdy|hola|namaste|what\s+is\s+truedeal|who\s+are\s+you|help|what\s+can\s+you\s+do|start)[\s!?.]*$/i;

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function POST(req: Request) {
  let query = "";
  try {
    const body = await req.json().catch(() => ({}));
    query = (body.query || "").toString().trim();

    if (!query) {
      return NextResponse.json({
        success: true,
        text: "Please type a keyword or describe what you are looking for in products, services, or verified businesses.",
        appliedFilters: ["⚡ Database Ready"],
        suggestedFollowUps: ["🍲 Ayurmor Moringa Premix Soup", "🥤 ABC Malt Health Drink", "🏢 Commercial Properties Pune"],
        listings: []
      });
    }

    const lowerQuery = query.toLowerCase();
    const isGreeting = GREETING_REGEX.test(query.trim());

    const rawTokens = lowerQuery.split(/[^\w\d]+/).filter(Boolean);
    const searchTokens = rawTokens.filter(t => t.length >= 2 && !STOPWORDS.has(t));
    const fallbackTokens = searchTokens.length > 0 ? searchTokens : rawTokens.filter(t => t.length >= 2);

    const isGenericQuery = isGreeting || 
      searchTokens.length === 0 || 
      searchTokens.every(t => GENERIC_SEARCH_WORDS.has(t)) ||
      lowerQuery.includes("all products") ||
      lowerQuery.includes("search products") ||
      lowerQuery.includes("show products") ||
      lowerQuery.includes("find products") ||
      lowerQuery.includes("what products");

    // 1. Natural language intent parsing with AI
    let parsedIntent: any = { intent: "search_products", keywords: fallbackTokens };
    if (!isGreeting) {
      try {
        parsedIntent = await parseSearchIntentWithGemini(query);
      } catch {}
    }

    // Clean extracted keywords against stopwords
    const cleanAiKeywords = (parsedIntent.keywords || [])
      .map((k: string) => k.toLowerCase().trim())
      .filter((k: string) => k.length >= 2 && !STOPWORDS.has(k));

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

        // 2a. Query products across all seller collections in Truedeal DB
        const escapedTokens = finalTokens.map(escapeRegex);
        const sellerProductCollections = await getAllSellerProductCollectionNames();
        const candidateDocs: any[] = [];

        if (isGenericQuery) {
          for (const colName of sellerProductCollections) {
            try {
              const docs = await db.collection(colName)
                .find({ isActive: true })
                .sort({ updatedAt: -1 })
                .limit(20)
                .toArray();
              candidateDocs.push(...docs);
            } catch {}
          }
          dbProducts = candidateDocs.slice(0, 40);
        } else {
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
              { city: { $regex: token, $options: "i" } },
              { state: { $regex: token, $options: "i" } },
              { type: { $regex: token, $options: "i" } },
              { "specs.value": { $regex: token, $options: "i" } },
              { "specs.key": { $regex: token, $options: "i" } }
            ]
          }));

          if (parsedIntent?.location?.city) {
            orConditions.push({ city: { $regex: escapeRegex(parsedIntent.location.city), $options: "i" } });
          }
          if (parsedIntent?.location?.state) {
            orConditions.push({ state: { $regex: escapeRegex(parsedIntent.location.state), $options: "i" } });
          }
          if (parsedIntent?.category) {
            orConditions.push({ category: { $regex: escapeRegex(parsedIntent.category), $options: "i" } });
          }

          const regexFilter = orConditions.length > 0 ? { isActive: true, $or: orConditions } : { isActive: true };

          for (const colName of sellerProductCollections) {
            try {
              const docs = await db.collection(colName)
                .find(regexFilter)
                .limit(20)
                .toArray();
              candidateDocs.push(...docs);
            } catch {}
          }

          // Category Intent Detection & Relevance Ranking
          const isRealEstateQuery = /(commercial|office|retail|property|properties|real estate|showroom|eon|wtc|kharadi|baner|workstation|bare-shell|plug-and-play)/i.test(lowerQuery);
          const isFoodWellnessQuery = /(ayurmor|moringa|soup|malt|wellness|sprouted|beverage|ragi|nutrition)/i.test(lowerQuery);
          const isSkincareQuery = /(pureplush|pureplus|soap|soaps|shampoo|facewash|facepack|waxing|kesh oil|hair wash|sheabutter|clay|organic skincare|haircare|botanical)/i.test(lowerQuery);

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
              score -= 100; // Deprioritize non-real-estate when asking commercial
            }

            if (isFoodWellnessQuery && (pCategory.includes("soup") || pCategory.includes("wellness") || pCategory.includes("malt") || pBrand.includes("ayurmor"))) {
              score += 50;
            } else if (isFoodWellnessQuery && (pCategory.includes("commercial") || pCategory.includes("real estate"))) {
              score -= 100; // Deprioritize real estate when asking food
            }

            if (isSkincareQuery && (pCategory.includes("soap") || pCategory.includes("shampoo") || pCategory.includes("powder") || pCategory.includes("oil") || pCategory.includes("care") || pBrand.includes("pureplush") || pBrand.includes("pureplus"))) {
              score += 50;
            } else if (isSkincareQuery && (pCategory.includes("commercial") || pCategory.includes("real estate"))) {
              score -= 100; // Deprioritize real estate when asking skincare
            }

            return { doc: p, score };
          });

          // Filter out heavily negative-scored docs and sort by relevance
          dbProducts = scoredDocs
            .filter(item => item.score > 0)
            .sort((a, b) => b.score - a.score)
            .map(item => item.doc);

          // If filtering was too strict, fallback to candidateDocs
          if (dbProducts.length === 0 && candidateDocs.length > 0) {
            dbProducts = candidateDocs;
          }
        }

        // 2b. Accurately resolve Company Profile Showcase (if query specifically targets a company or all top products belong to one seller)
        const isExplicitAnv = /(anv|reealty|anvrealty|anv real)/i.test(lowerQuery);
        const isExplicitAyurmor = /(ayurmor|saish|technofarms)/i.test(lowerQuery);
        const isExplicitPureplush = /(pureplush|pureplus|pure plush)/i.test(lowerQuery);

        let targetCompanySlug: string | null = null;
        if (isExplicitAnv) {
          targetCompanySlug = "anvreeality";
        } else if (isExplicitAyurmor) {
          targetCompanySlug = "ayurmor-more";
        } else if (isExplicitPureplush) {
          targetCompanySlug = "pureplush";
        } else if (dbProducts.length > 0) {
          // If all top products belong to the same seller, associate that company
          const firstSlug = dbProducts[0].sellerSlug || dbProducts[0].portfolioSlug;
          const allSameSeller = dbProducts.slice(0, 4).every(p => (p.sellerSlug || p.portfolioSlug) === firstSlug);
          if (allSameSeller && firstSlug && firstSlug !== "seller" && firstSlug !== "default") {
            targetCompanySlug = firstSlug;
          }
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

    // 3. Map ONLY real database products to UI SearchListingItem format
    const rawListings: SearchListingItem[] = dbProducts.map((p, pIdx) => {
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
    const aiOutput = await generateGeminiSearchResponse(query, rawListings, parsedIntent, matchedCompanyProfile);

    let summaryText = aiOutput.summaryText;
    if (!summaryText || summaryText.includes("No result found")) {
      if (rawListings.length > 0) {
        summaryText = `Found ${rawListings.length} verified database listing${rawListings.length === 1 ? "" : "s"} matching "${query}".`;
      } else if (matchedCompanyProfile) {
        summaryText = `Found verified company profile for "${matchedCompanyProfile.name}" in database.`;
      } else {
        summaryText = `No listings found in the database matching "${query}".`;
      }
    }

    return NextResponse.json({
      success: true,
      query,
      text: summaryText,
      appliedFilters: aiOutput.appliedFilters || ["⚡ Database Verified"],
      suggestedFollowUps: aiOutput.suggestedFollowUps || [],
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
