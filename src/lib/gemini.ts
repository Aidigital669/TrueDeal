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
 * 1. Parse natural language search queries using AI
 */
export async function parseSearchIntentWithGemini(userQuery: string): Promise<ParsedSearchIntent> {
  const fallbackResult: ParsedSearchIntent = {
    intent: "search_products",
    keywords: userQuery.toLowerCase().split(/\s+/).filter(w => w.length > 2),
  };

  const systemPrompt = `You are the TrueDeal AI Search Parser for a comprehensive marketplace featuring:
- Products (Electronics, Laptops, Hardware, Ayurvedic Health & Wellness, Apparel, etc.)
- Services (IT Consulting, Software, Legal, Digital Marketing, Corporate Services)
- Real Estate & Properties (Commercial Offices, 2BHK/3BHK Apartments, Sea-view homes, IT Parks in Pune, Mumbai, Delhi NCR, Bangalore, etc.)

Analyze the user's natural language query and return ONLY a valid JSON object with:
{
  "intent": "search_products" | "search_services" | "search_properties" | "general_qa" | "recommendation",
  "category": "string (e.g. Electronics, Real Estate, Commercial Properties, Ayurvedic Care, Software Services)",
  "keywords": ["array", "of", "search", "terms", "synonyms", "and", "tags"],
  "location": { "city": "optional string", "state": "optional string" },
  "priceRange": { "min": optional number, "max": optional number },
  "specs": { "key": "value" },
  "userSummary": "brief phrase summarizing what user wants"
}`;

  try {
    const rawText = await callAI(systemPrompt, `User Query: "${userQuery}"`);
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
 * 2. Generate Intelligent Conversational Response and Smart Filters with AI
 */
export async function generateGeminiSearchResponse(
  userQuery: string,
  candidateListings: any[],
  parsedIntent?: ParsedSearchIntent,
  companyProfile?: CompanyProfileOutput
): Promise<GeminiSearchOutput> {
  const isRealEstate = candidateListings.some(l => 
    l.category?.toLowerCase().includes("commercial") || 
    l.category?.toLowerCase().includes("real estate") || 
    l.title?.toLowerCase().includes("office") ||
    l.title?.toLowerCase().includes("commercial")
  ) || parsedIntent?.category?.toLowerCase().includes("real estate") || parsedIntent?.category?.toLowerCase().includes("commercial");

  let defaultSummary = "";
  if (companyProfile && isRealEstate) {
    defaultSummary = `Here are the verified commercial properties available from **${companyProfile.name}**${companyProfile.city ? ` in ${companyProfile.city}` : ""}:`;
  } else if (companyProfile) {
    defaultSummary = `Here are the verified offerings for **${companyProfile.name}**:`;
  } else if (candidateListings.length > 0 && isRealEstate) {
    defaultSummary = `Here are the top commercial properties in Pune matching **"${userQuery}"**:`;
  } else if (candidateListings.length > 0) {
    defaultSummary = `Here are the verified listings matching **"${userQuery}"**:`;
  } else {
    defaultSummary = `I couldn't find any listings matching "${userQuery}". You can try searching for *"commercial office in Pune"* or *"Ayurmor soup"*.`;
  }

  const fallbackOutput: GeminiSearchOutput = {
    summaryText: defaultSummary,
    appliedFilters: companyProfile
      ? [`🏢 ${companyProfile.name}`, ...(companyProfile.city ? [`📍 ${companyProfile.city}`] : []), "✨ Verified"]
      : (isRealEstate ? ["🏢 Commercial Real Estate", "📍 Pune", "✨ Verified"] : ["✨ Verified Catalog"]),
    suggestedFollowUps: isRealEstate
      ? [
          "🏢 EON IT Park 140 Desks Office",
          "📈 Baner Pre-Leased 7.8% ROI Showroom",
          "💼 WTC Kharadi Executive Suite"
        ]
      : (companyProfile
          ? [`Message ${companyProfile.name} on WhatsApp`, `View ${companyProfile.name} Storefront`]
          : ["🍲 Ayurmor Moringa Soup", "🥤 Sprouted Chocolate Malt", "🏢 Commercial Offices Pune"]
        ),
    rankedListingIds: candidateListings.map(l => l.id),
    companyProfile
  };

  if (candidateListings.length === 0 && !companyProfile) {
    return fallbackOutput;
  }

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

  const systemPrompt = `You are TrueDeal AI Assistant — a friendly, helpful, and concise shopping & property advisor for India.
Your goal is to answer the user's query in a warm, natural, human-friendly tone, keeping your reply compact and easy to read ("short & sweet").

Guidelines:
1. Tone: Natural, friendly, human, clear, and direct. Avoid stiff corporate jargon, robotic announcements, or long walls of text.
2. Structure (Keep it small & scannable):
   - 1 short, friendly intro sentence acknowledging their search.
   - 2 to 4 crisp bullet points highlighting the top options found (mention Name, Key Spec e.g. desks/sq.ft/ingredients, Price in ₹ Cr/Lakh/₹, and Location).
   - 1 quick closing sentence inviting them to check the product cards below or reach out directly.
3. For Commercial Real Estate:
   - Keep details clear and brief (e.g. "• **EON IT Park, Kharadi**: 9,800 sq.ft furnished office with 140 workstations, ₹11.50 Cr").
   - Mention key metrics like ROI (e.g. "• **Baner Showroom**: Pre-leased to bank with 7.8% Net ROI, ₹8.50 Cr").
4. For Wellness / Products:
   - Highlight natural benefits and prices simply.
5. Badges: 3 to 4 short, clean visual tags with emojis (e.g. ["🏢 ANV REEALTY", "📍 Pune", "💼 Office & Retail", "📈 7.8% ROI"]).
6. Follow-ups: 3 short, natural, clickable suggestions.

Return ONLY a valid JSON object matching:
{
  "summaryText": "Concise, friendly, humanized markdown text.",
  "appliedFilters": ["3-4 short badge tags with emojis"],
  "suggestedFollowUps": ["3 short follow-up prompts"],
  "rankedListingIds": ["ordered list of listing ids from highest relevance to lowest"]
}`;

  const userPrompt = `User Query: "${userQuery}"
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
