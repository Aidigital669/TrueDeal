/**
 * TrueDeal AI Search & Scraping Intelligence Engine
 * Powered by Google Gemini 2.5/3.6 Flash & OpenAI GPT-4o-mini
 */

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const GEMINI_MODELS = [
  "gemini-flash-lite-latest",
  "gemini-3.5-flash-lite",
  "gemini-3.1-flash-lite",
  "gemini-3.8-flash",
  "gemini-flash-latest",
  "gemini-2.5-flash"
];

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || process.env.AI_API_SECRET || "";

export interface ParsedSearchIntent {
  intent: "search_products" | "search_services" | "search_properties" | "general_qa" | "recommendation";
  category?: string;
  keywords: string[];
  location?: {
    city?: string;
    state?: string;
  };
  priceRange?: {
    min?: number;
    max?: number;
  };
  specs?: Record<string, string>;
  userSummary?: string;
}

export interface CompanyProfileOutput {
  name: string;
  ownerName?: string;
  businessType?: string;
  yearEstablished?: string;
  tagline?: string;
  about?: string;
  website?: string;
  portfolioUrl?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  gstin?: string;
  rating?: number;
  totalReviews?: number;
  logo?: string;
  services?: string[];
}

export interface GeminiSearchOutput {
  summaryText: string;
  appliedFilters: string[];
  suggestedFollowUps: string[];
  rankedListingIds?: string[];
  companyProfile?: CompanyProfileOutput;
}

export interface GeminiRefinedProduct {
  title: string;
  brand: string;
  model?: string;
  sku?: string;
  price: number;
  originalPrice?: number;
  discount?: string;
  category: string;
  description: string;
  shortDesc: string;
  specs: { key: string; value: string }[];
  aiKeywords: string[];
  inStock: boolean;
}

export interface GeminiRefinedCompany {
  name: string;
  tagline: string;
  about: string;
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  categories: string[];
}

/**
 * Universal AI Caller (Gemini with OpenAI Fallback)
 */
async function callAI(systemPrompt: string, userPrompt: string): Promise<string | null> {
  // 1. Try Gemini models in order
  if (GEMINI_API_KEY) {
    for (const model of GEMINI_MODELS) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: systemPrompt },
                  { text: userPrompt }
                ]
              }
            ],
            generationConfig: {
              temperature: 0.1,
              responseMimeType: "application/json"
            }
          })
        });

        clearTimeout(timeout);

        if (response.ok) {
          const data = await response.json();
          const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) return text.trim();
        }
      } catch (err: any) {
        console.warn(`Gemini (${model}) notice:`, err.message);
      }
    }
  }

  // 2. Try OpenAI fallback if available
  if (OPENAI_API_KEY && !OPENAI_API_KEY.includes("...")) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 7000);

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${OPENAI_API_KEY}`
        },
        signal: controller.signal,
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          response_format: { type: "json_object" },
          temperature: 0.1
        })
      });

      clearTimeout(timeout);

      if (response.ok) {
        const data = await response.json();
        const text = data?.choices?.[0]?.message?.content;
        if (text) return text.trim();
      }
    } catch (err: any) {
      console.warn("OpenAI fallback notice:", err.message);
    }
  }

  return null;
}

/**
 * 1. Parse natural language search queries using AI with conversational context
 */
export async function parseSearchIntentWithGemini(
  userQuery: string,
  conversationHistory?: { role: string; content: string }[]
): Promise<ParsedSearchIntent> {
  const fallbackResult: ParsedSearchIntent = {
    intent: "search_products",
    keywords: userQuery.toLowerCase().split(/\s+/).filter(w => w.length > 2),
  };

  const historyContext = conversationHistory && conversationHistory.length > 0
    ? `Recent Conversation Context:\n${conversationHistory.slice(-4).map(m => `${m.role === "user" ? "User" : "Assistant"}: ${m.content.slice(0, 150)}`).join("\n")}\n\n`
    : "";

  const systemPrompt = `You are the TrueDeal AI Search Parser for a comprehensive marketplace featuring:
- Products (Electronics, Laptops, Hardware, Ayurvedic Health & Wellness, Apparel, etc.)
- Services (IT Consulting, Software, Legal, Digital Marketing, Corporate Services)
- Real Estate & Properties (Commercial Offices, 2BHK/3BHK Apartments, Sea-view homes, IT Parks in Pune, Mumbai, Delhi NCR, Bangalore, etc.)

Analyze the user's query and return ONLY a valid JSON object with:
{
  "intent": "search_products" | "search_services" | "search_properties" | "general_qa" | "recommendation",
  "category": "string (e.g. Electronics, Real Estate, Commercial Properties, Ayurvedic Care, Software Services)",
  "keywords": ["array", "of", "search", "terms", "synonyms", "and", "tags"],
  "location": { "city": "optional string", "state": "optional string" },
  "priceRange": { "min": optional number, "max": optional number },
  "specs": { "key": "value" },
  "userSummary": "brief phrase summarizing what user wants"
}

CRITICAL RULES:
- If the current query asks for a different category (e.g. food/wellness like "Moringa", "soup" while previous context was real estate), DO NOT carry over the previous category, seller, or location. The Current User Query ALWAYS dictates the intent.
- Do not assume a location (e.g. Pune) unless the user's current query or active query specifically mentions it.`;

  try {
    const rawText = await callAI(systemPrompt, `${historyContext}Current User Query: "${userQuery}"`);
    if (!rawText) return fallbackResult;

    const parsed = JSON.parse(rawText.trim().replace(/^```json\s*|```$/g, ""));
    return {
      intent: parsed.intent || fallbackResult.intent,
      category: parsed.category,
      keywords: Array.isArray(parsed.keywords) && parsed.keywords.length > 0 ? parsed.keywords : fallbackResult.keywords,
      location: parsed.location,
      priceRange: parsed.priceRange,
      specs: parsed.specs,
      userSummary: parsed.userSummary
    };
  } catch (err: any) {
    console.warn("AI query parsing fallback notice:", err.message);
    return fallbackResult;
  }
}

/**
 * 2. Generate Intelligent, Deeply Interactive & Consultative Marketplace Response with AI
 */
export async function generateGeminiSearchResponse(
  userQuery: string,
  candidateListings: any[],
  parsedIntent?: ParsedSearchIntent,
  companyProfile?: CompanyProfileOutput,
  conversationHistory?: { role: string; content: string }[]
): Promise<GeminiSearchOutput> {
  if (candidateListings.length === 0 && !companyProfile) {
    return {
      summaryText: "No result found",
      appliedFilters: [],
      suggestedFollowUps: [],
      rankedListingIds: []
    };
  }

  const isRealEstate = candidateListings.some(l => 
    l.category?.toLowerCase().includes("commercial") || 
    l.category?.toLowerCase().includes("real estate") || 
    l.title?.toLowerCase().includes("office") ||
    l.title?.toLowerCase().includes("commercial")
  ) || (/(?:commercial|office|shop|showroom|warehouse|real estate|rera|pre-leased|baner|viman nagar|hinjewadi|kharadi|balewadi)/i.test(userQuery));

  const isTech = candidateListings.some(l =>
    l.category?.toLowerCase().includes("electronic") ||
    l.category?.toLowerCase().includes("hardware") ||
    l.title?.toLowerCase().includes("laptop") ||
    l.title?.toLowerCase().includes("pc")
  ) || (/(?:laptop|notebook|thinkpad|macbook|gpu|cpu|ram|computer|pc|tech)/i.test(userQuery));

  let defaultSummary = "";
  if (companyProfile && isRealEstate) {
    defaultSummary = `Showing verified commercial properties from **${companyProfile.name}**${companyProfile.city ? ` in ${companyProfile.city}` : ""}.`;
  } else if (companyProfile) {
    defaultSummary = `Showing verified offerings from **${companyProfile.name}**.`;
  } else if (candidateListings.length > 0 && isRealEstate) {
    defaultSummary = `Found **${candidateListings.length} verified commercial propert${candidateListings.length === 1 ? "y" : "ies"}** matching your search.`;
  } else if (candidateListings.length > 0 && isTech) {
    defaultSummary = `Found **${candidateListings.length} verified tech listing${candidateListings.length === 1 ? "" : "s"}** matching your search.`;
  } else if (candidateListings.length > 0) {
    defaultSummary = `Found **${candidateListings.length} verified listing${candidateListings.length === 1 ? "" : "s"}** matching **"${userQuery}"**.`;
  } else {
    defaultSummary = "No result found";
  }

  const fallbackOutput: GeminiSearchOutput = {
    summaryText: defaultSummary,
    appliedFilters: companyProfile
      ? [`🏢 ${companyProfile.name}`, ...(companyProfile.city ? [`📍 ${companyProfile.city}`] : []), "✨ Verified"]
      : (isRealEstate 
          ? ["🏢 Commercial Real Estate", "📍 Pune", "✨ TrueDeal Verified"] 
          : isTech 
          ? ["💻 High Performance Tech", "⚡ Verified Hardware", "✨ TrueDeal Verified"]
          : ["✨ TrueDeal Verified Catalog"]),
    suggestedFollowUps: isRealEstate
      ? [
          "Furnished office suites",
          "Bare-shell office floorplates",
          "Connect on WhatsApp with seller"
        ]
      : isTech
      ? [
          "Laptops under ₹60,000",
          "High Performance Workstations",
          "Ask seller about warranty"
        ]
      : (companyProfile
          ? [`Message ${companyProfile.name} on WhatsApp`, `View ${companyProfile.name} Catalog`]
          : ["Filter by price", "Connect with verified seller"]
        ),
    rankedListingIds: candidateListings.map(l => l.id),
    companyProfile
  };

  const simplifiedListings = candidateListings.slice(0, 8).map(l => ({
    id: l.id,
    title: l.title || l.name,
    category: l.category,
    price: l.price,
    rawPrice: l.rawPrice,
    originalPrice: l.originalPrice,
    location: l.location,
    city: l.city,
    state: l.state,
    brand: l.brand,
    description: l.description || l.shortDesc || "",
    specs: l.specs,
    websiteUrl: l.websiteUrl || l.productUrl || ""
  }));

  const historyPromptSnippet = conversationHistory && conversationHistory.length > 0
    ? `Recent Conversation Context:\n${conversationHistory.slice(-5).map(m => `${m.role === "user" ? "User" : "Assistant"}: ${m.content.slice(0, 200)}`).join("\n")}\n\n`
    : "";

  const systemPrompt = `You are TrueDeal AI — a direct, precise, and professional search assistant for the TrueDeal Marketplace (truedeal.in).
Your identity is ALWAYS TrueDeal AI representing India's direct marketplace platform.

CRITICAL RULES (MANDATORY — STRICTLY ENFORCE):
1. ZERO FLUFF & ZERO BOILERPLATE:
   - DO NOT include greeting preambles like "Hello!", "As TrueDeal AI...", "Welcome to TrueDeal...", or "I found some verified listings...".
   - DO NOT include marketing sign-offs like "Check out the product details below...", "Reach out to sellers directly...", or "Feel free to ask...".
   - Be completely direct, concise, and to the point.

2. DO NOT DUPLICATE PRODUCT LISTINGS AS BULLET POINTS:
   - The user interface already renders rich visual cards with photos, prices, specs, locations, and direct WhatsApp buttons directly beneath your message.
   - DO NOT write out bullet points listing the individual product names, specs, and prices. That creates redundant clutter.

3. STRICT ADHERENCE TO USER FILTERS & SEARCH PARAMETERS:
   - Only address listings that strictly match what the user searched for.
   - If the user specified a budget (e.g. "under ₹8 Cr"), NEVER mention or recommend listings above that budget.
   - If the user specified a city (e.g. "Pune"), focus strictly on that city.

4. RESPONSE STRUCTURE (Keep it concise, exactly 1-2 sentences):
   - Factual 1-sentence confirmation of what was found (e.g. "Found **2 verified commercial properties** in Pune under **₹8 Cr**.").
   - DO NOT append unsolicited questions like "Would you like to...", "Would you prefer...", or conversational queries. Keep it factual and concise.

5. Contextual Follow-Up Suggestions ("suggestedFollowUps"):
   - Return 2-3 short, actionable refinement chips (e.g. ["Under ₹10 Lakh", "Connect on WhatsApp"]).

Return ONLY a valid JSON object matching:
{
  "summaryText": "Direct, concise markdown response following the rules above.",
  "appliedFilters": ["2-4 short filter badge strings with emojis matching the search parameters"],
  "suggestedFollowUps": ["2-3 relevant quick action / question chips"],
  "rankedListingIds": ["ordered list of listing ids from highest relevance to lowest"]
}`;

  const userPrompt = `${historyPromptSnippet}Current User Query: "${userQuery}"
${companyProfile ? `Matched Company Profile: ${JSON.stringify(companyProfile)}` : "No specific single company profile matched."}
Matched Database Listings: ${JSON.stringify(simplifiedListings)}
Extracted Intent: ${JSON.stringify(parsedIntent || {})}`;

  try {
    const rawText = await callAI(systemPrompt, userPrompt);
    if (!rawText) return fallbackOutput;

    const parsed = JSON.parse(rawText.trim().replace(/^```json\s*|```$/g, ""));
    return {
      summaryText: parsed.summaryText || fallbackOutput.summaryText,
      appliedFilters: Array.isArray(parsed.appliedFilters) && parsed.appliedFilters.length > 0 ? parsed.appliedFilters : fallbackOutput.appliedFilters,
      suggestedFollowUps: Array.isArray(parsed.suggestedFollowUps) && parsed.suggestedFollowUps.length > 0 ? parsed.suggestedFollowUps : fallbackOutput.suggestedFollowUps,
      rankedListingIds: Array.isArray(parsed.rankedListingIds) ? parsed.rankedListingIds : fallbackOutput.rankedListingIds,
      companyProfile
    };
  } catch (err: any) {
    console.warn("AI generation notice:", err.message);
    return fallbackOutput;
  }
}

/**
 * 3. Deep Scraper Intelligence: Accurately Extract & Refine Product / Property / Service with AI
 */
export async function refineProductExtractionWithGemini(params: {
  url: string;
  rawTitle?: string;
  rawDescription?: string;
  rawPrice?: number;
  rawCategory?: string;
  rawBrand?: string;
  rawSpecs?: { key: string; value: string }[];
  pageSnippet: string;
}): Promise<GeminiRefinedProduct | null> {
  if (!params.pageSnippet) {
    return null;
  }

  const systemPrompt = `You are the TrueDeal AI Data Extraction Engine.
Analyze the target webpage content and extract accurate, complete product / property / service data.

Extraction Rules:
1. Title: Clean, exact product/property title without breadcrumb trash, cookie text, or generic suffixes (e.g. "| Buy Online").
2. Brand: Developer, Manufacturer, or Merchant brand name.
3. Model/SKU: Exact model or project name.
4. Price: Numeric price in local currency units (INR for Indian sites).
   - If price is in Crores (e.g. "₹ 2.45 Cr"), convert to numeric rupees (24500000).
   - If price is in Lakhs (e.g. "85 Lakh"), convert to numeric rupees (8500000).
   - If recurring (e.g. "$49/mo"), return 49.
   - If zero/unlisted, estimate a sensible market value or return 0.
5. OriginalPrice: Original MRP before discount if present.
6. Discount: Discount badge e.g. "15% OFF" if applicable.
7. Category: Accurate high-level category (e.g., "Commercial Real Estate", "Gaming Laptops", "Ayurvedic Healthcare", "Software Services", "Residential Apartments").
8. Description: 2-3 clean, informative sentences highlighting features, location, or specifications without navigation boilerplate.
9. Specs: Array of 4-8 key specifications with structured keys and values (e.g., {"key": "RAM", "value": "16GB DDR5"}, {"key": "Property Area", "value": "12,000 Sq.Ft"}, {"key": "RERA No", "value": "P5210002456"}).
10. AIKeywords: 6-10 high-value search tags.

Return ONLY a valid JSON object matching:
{
  "title": "string",
  "brand": "string",
  "model": "string",
  "sku": "string",
  "price": number,
  "originalPrice": number,
  "discount": "string",
  "category": "string",
  "description": "string",
  "shortDesc": "string",
  "specs": [{"key": "string", "value": "string"}],
  "aiKeywords": ["string"],
  "inStock": boolean
}`;

  const userPrompt = `Website URL: "${params.url}"
Initial DOM Title: "${params.rawTitle || ""}"
Initial DOM Price: ${params.rawPrice || 0}
Initial DOM Category: "${params.rawCategory || ""}"
Initial DOM Brand: "${params.rawBrand || ""}"

Webpage Content:
"""
${params.pageSnippet.slice(0, 4500)}
"""`;

  try {
    const rawText = await callAI(systemPrompt, userPrompt);
    if (!rawText) return null;

    const parsed = JSON.parse(rawText.trim().replace(/^```json\s*|```$/g, ""));
    return {
      title: parsed.title || params.rawTitle || "Verified Listing",
      brand: parsed.brand || params.rawBrand || "Verified Merchant",
      model: parsed.model || "Verified Model",
      sku: parsed.sku || `SKU-${Math.floor(Math.random() * 90000) + 10000}`,
      price: typeof parsed.price === "number" ? parsed.price : (params.rawPrice || 0),
      originalPrice: typeof parsed.originalPrice === "number" ? parsed.originalPrice : (params.rawPrice ? Math.round(params.rawPrice * 1.15) : undefined),
      discount: parsed.discount || "",
      category: parsed.category || params.rawCategory || "General Products",
      description: parsed.description || params.rawDescription || "",
      shortDesc: parsed.shortDesc || (parsed.description ? parsed.description.slice(0, 150) : ""),
      specs: Array.isArray(parsed.specs) && parsed.specs.length > 0 ? parsed.specs : (params.rawSpecs || []),
      aiKeywords: Array.isArray(parsed.aiKeywords) && parsed.aiKeywords.length > 0 ? parsed.aiKeywords : [parsed.title || ""],
      inStock: parsed.inStock ?? true
    };
  } catch (err: any) {
    console.warn("AI scraper refinement notice:", err.message);
    return null;
  }
}

/**
 * 4. Deep Scraper Intelligence: Accurately Extract Company & Seller Information with AI
 */
export async function refineCompanyExtractionWithGemini(params: {
  url: string;
  rawName?: string;
  pageSnippet: string;
}): Promise<GeminiRefinedCompany | null> {
  if (!params.pageSnippet) {
    return null;
  }

  const systemPrompt = `You are TrueDeal AI Company Extractor.
Analyze the target business webpage content and extract accurate company details.

Return ONLY a valid JSON object matching:
{
  "name": "string",
  "tagline": "string",
  "about": "string",
  "email": "string",
  "phone": "string",
  "whatsapp": "string",
  "address": "string",
  "categories": ["string"]
}`;

  const userPrompt = `Website URL: "${params.url}"
Raw Name: "${params.rawName || ""}"

Webpage Text Snippet:
"""
${params.pageSnippet.slice(0, 3500)}
"""`;

  try {
    const rawText = await callAI(systemPrompt, userPrompt);
    if (!rawText) return null;

    const parsed = JSON.parse(rawText.trim().replace(/^```json\s*|```$/g, ""));
    return {
      name: parsed.name || params.rawName || "Verified Business",
      tagline: parsed.tagline || "Verified Seller on TrueDeal",
      about: parsed.about || "",
      email: parsed.email || "",
      phone: parsed.phone || "",
      whatsapp: parsed.whatsapp || "",
      address: parsed.address || "",
      categories: Array.isArray(parsed.categories) ? parsed.categories : ["General Merchandise"]
    };
  } catch (err: any) {
    console.warn("AI company refinement notice:", err.message);
    return null;
  }
}

/**
 * Universal Conversational Answer Generator for Chit-Chat, Meta & General Queries
 * When user is not searching for specific products, returns a clean, direct answer with ZERO listings.
 */
export async function generateGeminiConversationalAnswer(
  userQuery: string,
  conversationHistory?: { role: string; content: string }[]
): Promise<string> {
  const historyPromptSnippet = conversationHistory && conversationHistory.length > 0
    ? `Recent Conversation Context:\n${conversationHistory.slice(-4).map(m => `${m.role === "user" ? "User" : "Assistant"}: ${m.content.slice(0, 150)}`).join("\n")}\n\n`
    : "";

  const systemPrompt = `You are TrueDeal AI — the intelligent, friendly, and helpful assistant for the TrueDeal marketplace (truedeal.in).
The user asked a conversational or general question (not a specific product search).

CRITICAL INSTRUCTIONS:
- Give a simple, natural, friendly, and direct answer to the user.
- Keep your answer short (1-2 sentences).
- DO NOT invent, push, or mention specific product listings, prices, or catalogs.
- DO NOT ask unsolicited clarifying questions.
- Be polite and helpful.

Return ONLY a valid JSON object matching:
{
  "reply": "Your concise 1-2 sentence response."
}`;

  try {
    const rawText = await callAI(systemPrompt, `${historyPromptSnippet}User Query: "${userQuery}"`);
    if (rawText) {
      let cleaned = rawText.trim();
      try {
        const parsed = JSON.parse(cleaned);
        if (parsed.reply || parsed.answer || parsed.text || parsed.message) {
          cleaned = parsed.reply || parsed.answer || parsed.text || parsed.message;
        }
      } catch {}
      return cleaned.replace(/^["']|["']$/g, "").trim();
    }
  } catch (err: any) {
    console.warn("Conversational AI notice:", err.message);
  }

  // High quality deterministic fallbacks for common queries
  const lower = userQuery.toLowerCase().trim();
  if (/how\s+are\s+you/i.test(lower)) {
    return "I'm doing well, thank you! How can I help you today?";
  }
  if (/^(hi|hello|hey|greetings|namaste|good\s+(morning|afternoon|evening))/i.test(lower)) {
    return "Hello! Welcome to TrueDeal. How can I assist you today?";
  }
  if (/who\s+are\s+you|what\s+is\s+your\s+name/i.test(lower)) {
    return "I am TrueDeal AI, your virtual assistant for finding verified products, commercial real estate, and direct sellers across India.";
  }
  if (/what\s+is\s+truedeal|how\s+does\s+truedeal\s+work/i.test(lower)) {
    return "TrueDeal is India's direct marketplace platform connecting buyers directly with verified sellers, manufacturers, and commercial properties without middlemen.";
  }
  if (/thank/i.test(lower)) {
    return "You're very welcome! Let me know if you need any assistance.";
  }
  return "I'm here to help you! Feel free to search for verified products, commercial properties, and direct sellers on TrueDeal.";
}

