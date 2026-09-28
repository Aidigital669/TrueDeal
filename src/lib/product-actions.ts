"use server";

import clientPromise, { 
  getDb, 
  getSellerProductsCollection, 
  getAllSellerProductCollectionNames, 
  cleanSellerSlug 
} from "./mongodb";
import { ObjectId } from "mongodb";
import { SEED_PRODUCTS } from "./seed-catalog";
import { createRazorpayOrder } from "./razorpay";
import { revalidatePath } from "next/cache";

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function safeObjectId(id: string): ObjectId | null {
  try {
    if (typeof id === "string" && ObjectId.isValid(id) && id.length === 24) {
      return new ObjectId(id);
    }
    return null;
  } catch {
    return null;
  }
}

export interface FormattedSpec {
  key: string;
  value: string;
}

export interface PublicProductDetail {
  id: string;
  _id?: string;
  title: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  formattedPrice: string;
  originalPrice?: number;
  formattedOriginalPrice?: string;
  discount?: string;
  inventory: number;
  inStock: boolean;
  sku?: string;
  modelName?: string;
  shortDesc: string;
  description: string;
  images: string[];
  primaryImage: string;
  specs: FormattedSpec[];
  features: string[];
  aiKeywords: string[];
  aiVisibility: number;
  aiSubtext?: string;
  badgeType?: string;
  city?: string;
  state?: string;
  location?: string;
  sourceUrl?: string;
  buyUrl?: string;
  productUrl?: string;
  sellerSlug: string;
  seller: {
    slug: string;
    companyName: string;
    tagline: string;
    about: string;
    logo: string;
    bannerImage: string;
    businessType: string;
    city: string;
    state: string;
    address: string;
    phone: string;
    whatsapp: string;
    email: string;
    website: string;
    rating: number;
    reviewsCount: number;
    verified: boolean;
    specialities?: string[];
  };
  relatedProducts: Array<{
    id: string;
    title: string;
    price: string;
    rawPrice: number;
    originalPrice?: string;
    image: string;
    category: string;
    location?: string;
    sellerSlug: string;
    sellerName: string;
  }>;
}

export async function getPublicProductDetails(
  id: string, 
  preferredSellerSlug?: string
): Promise<{ success: boolean; product?: PublicProductDetail; error?: string }> {
  try {
    const rawId = (id || "").trim();
    if (!rawId) {
      return { success: false, error: "Product identifier is required." };
    }

    const db = await getDb();
    const objId = safeObjectId(rawId);
    let matchedDoc: any = null;
    let matchedSellerSlug: string = preferredSellerSlug ? cleanSellerSlug(preferredSellerSlug) : "";

    // 1. If sellerSlug is provided, check their dedicated collection first
    if (matchedSellerSlug) {
      try {
        const col = await getSellerProductsCollection(matchedSellerSlug);
        if (objId) {
          matchedDoc = await col.findOne({ _id: objId });
        }
        if (!matchedDoc) {
          matchedDoc = await col.findOne({
            $or: [
              { id: rawId },
              { sku: rawId },
              { modelName: rawId },
              { title: { $regex: `^${escapeRegex(rawId)}$`, $options: "i" } }
            ]
          });
        }
      } catch (err: any) {
        console.warn("Seller collection product search notice:", err.message);
      }
    }

    // 2. Check general "products" collection
    if (!matchedDoc) {
      try {
        const productsCol = db.collection("products");
        if (objId) {
          matchedDoc = await productsCol.findOne({ _id: objId });
        }
        if (!matchedDoc) {
          matchedDoc = await productsCol.findOne({
            $or: [
              { id: rawId },
              { sku: rawId },
              { modelName: rawId },
              { title: { $regex: `^${escapeRegex(rawId)}$`, $options: "i" } }
            ]
          });
        }
      } catch {}
    }

    // 3. Search across all seller collections
    if (!matchedDoc) {
      try {
        const allCols = await getAllSellerProductCollectionNames();
        for (const colName of allCols) {
          const col = db.collection(colName);
          if (objId) {
            matchedDoc = await col.findOne({ _id: objId });
          }
          if (!matchedDoc) {
            matchedDoc = await col.findOne({
              $or: [
                { id: rawId },
                { sku: rawId },
                { modelName: rawId },
                { title: { $regex: `^${escapeRegex(rawId)}$`, $options: "i" } }
              ]
            });
          }
          if (matchedDoc) {
            if (!matchedSellerSlug) {
              matchedSellerSlug = colName.replace("products_", "");
            }
            break;
          }
        }
      } catch {}
    }

    // 4. Fallback search against SEED_PRODUCTS
    if (!matchedDoc) {
      const normalizedQuery = rawId.toLowerCase();
      const seedMatch = SEED_PRODUCTS.find((p: any, idx: number) => {
        const idMatches = p.sku === rawId || `seed-${idx}` === rawId || (p as any).id === rawId;
        const titleMatches = p.title.toLowerCase() === normalizedQuery || p.title.toLowerCase().includes(normalizedQuery);
        return idMatches || titleMatches;
      });

      if (seedMatch) {
        matchedDoc = { ...seedMatch, _id: rawId };
      }
    }

    if (!matchedDoc) {
      return { success: false, error: "Product not found in marketplace catalog." };
    }

    // Determine final seller slug
    const sellerSlug = matchedDoc.sellerSlug || matchedDoc.portfolioSlug || matchedSellerSlug || "seller";

    // 5. Fetch seller profile details
    let portfolioDoc: any = null;
    try {
      portfolioDoc = await db.collection("portfolios").findOne({
        $or: [
          { slug: sellerSlug },
          { slug: { $regex: `^${escapeRegex(sellerSlug)}$`, $options: "i" } }
        ]
      });

      if (!portfolioDoc) {
        const sellerDoc = await db.collection("sellers").findOne({
          $or: [
            { slug: sellerSlug },
            { slug: { $regex: `^${escapeRegex(sellerSlug)}$`, $options: "i" } }
          ]
        });
        if (sellerDoc) {
          portfolioDoc = {
            slug: sellerDoc.slug,
            companyName: sellerDoc.storeName || matchedDoc.brand || "Verified Seller",
            about: sellerDoc.description || "",
            phone: sellerDoc.phone || "",
            email: sellerDoc.email || "",
            website: sellerDoc.website || "",
            city: sellerDoc.city || matchedDoc.city || "",
            state: sellerDoc.state || matchedDoc.state || "",
            businessType: sellerDoc.businessType || "Verified Business"
          };
        }
      }
    } catch (err: any) {
      console.warn("Portfolio lookup notice:", err.message);
    }

    // Format images array
    const imageList: string[] = [];
    if (Array.isArray(matchedDoc.images)) {
      for (const img of matchedDoc.images) {
        if (typeof img === "string" && img.trim()) {
          imageList.push(img.trim());
        } else if (img?.url && typeof img.url === "string") {
          imageList.push(img.url.trim());
        }
      }
    }
    if (matchedDoc.image && typeof matchedDoc.image === "string") {
      if (!imageList.includes(matchedDoc.image)) {
        imageList.unshift(matchedDoc.image);
      }
    }
    if (matchedDoc.primaryImage && typeof matchedDoc.primaryImage === "string") {
      if (!imageList.includes(matchedDoc.primaryImage)) {
        imageList.unshift(matchedDoc.primaryImage);
      }
    }
    if (imageList.length === 0) {
      imageList.push("https://images.unsplash.com/photo-1557821552-17105176677c?w=800&q=80");
    }

    // Format price numbers
    const rawPrice = typeof matchedDoc.price === "number" 
      ? matchedDoc.price 
      : (parseFloat(String(matchedDoc.price).replace(/[^0-9.]/g, "")) || 0);

    const rawOriginalPrice = matchedDoc.originalPrice
      ? (typeof matchedDoc.originalPrice === "number" ? matchedDoc.originalPrice : parseFloat(String(matchedDoc.originalPrice).replace(/[^0-9.]/g, "")))
      : undefined;

    const formattedPrice = rawPrice >= 10000000
      ? `₹${(rawPrice / 10000000).toFixed(2)} Cr`
      : rawPrice >= 100000
        ? `₹${(rawPrice / 100000).toFixed(2)} Lakh`
        : rawPrice > 0
          ? `₹${rawPrice.toLocaleString("en-IN")}`
          : "Direct Seller Pricing";

    const formattedOriginalPrice = rawOriginalPrice
      ? (rawOriginalPrice >= 10000000
          ? `₹${(rawOriginalPrice / 10000000).toFixed(2)} Cr`
          : rawOriginalPrice >= 100000
            ? `₹${(rawOriginalPrice / 100000).toFixed(2)} Lakh`
            : `₹${rawOriginalPrice.toLocaleString("en-IN")}`)
      : undefined;

    // Calculate discount if missing
    let discount = matchedDoc.discount;
    if (!discount && rawOriginalPrice && rawOriginalPrice > rawPrice && rawPrice > 0) {
      const pct = Math.round(((rawOriginalPrice - rawPrice) / rawOriginalPrice) * 100);
      if (pct > 0) {
        discount = `${pct}% OFF`;
      }
    }

    // Format specs
    const formattedSpecs: FormattedSpec[] = [];
    if (Array.isArray(matchedDoc.specs)) {
      for (const sp of matchedDoc.specs) {
        if (typeof sp === "object" && sp !== null) {
          const k = sp.key || sp.name || sp.label || "Specification";
          const v = sp.value || sp.val || "";
          if (v) formattedSpecs.push({ key: String(k), value: String(v) });
        } else if (typeof sp === "string" && sp.includes(":")) {
          const parts = sp.split(":");
          formattedSpecs.push({ key: parts[0].trim(), value: parts.slice(1).join(":").trim() });
        } else if (typeof sp === "string" && sp.trim()) {
          formattedSpecs.push({ key: "Feature", value: sp.trim() });
        }
      }
    }

    // Add standard specs if empty
    if (formattedSpecs.length === 0) {
      if (matchedDoc.brand) formattedSpecs.push({ key: "Brand", value: matchedDoc.brand });
      if (matchedDoc.modelName) formattedSpecs.push({ key: "Model", value: matchedDoc.modelName });
      if (matchedDoc.sku) formattedSpecs.push({ key: "SKU / Code", value: matchedDoc.sku });
      if (matchedDoc.category) formattedSpecs.push({ key: "Category", value: matchedDoc.category });
      formattedSpecs.push({ key: "Quality Guarantee", value: "TrueDeal Verified" });
      formattedSpecs.push({ key: "Dispatch Time", value: "24-48 Hours Express" });
    }

    // 6. Fetch related products from same seller or category
    let relatedDocs: any[] = [];
    try {
      const sellerCol = await getSellerProductsCollection(sellerSlug);
      relatedDocs = await sellerCol
        .find({ 
          isActive: true,
          _id: { $ne: matchedDoc._id }
        })
        .limit(6)
        .toArray();

      if (relatedDocs.length < 4) {
        const catDocs = await db.collection("products")
          .find({
            isActive: true,
            _id: { $ne: matchedDoc._id },
            category: matchedDoc.category
          })
          .limit(6 - relatedDocs.length)
          .toArray();
        relatedDocs.push(...catDocs);
      }
    } catch {}

    // Fallback related from seed
    if (relatedDocs.length === 0) {
      relatedDocs = SEED_PRODUCTS
        .filter((p: any) => p.title !== matchedDoc.title)
        .slice(0, 4);
    }

    const relatedProducts = relatedDocs.map((r: any, rIdx: number) => {
      const rPrice = typeof r.price === "number" ? r.price : (parseFloat(String(r.price).replace(/[^0-9.]/g, "")) || 0);
      const rOrigPrice = r.originalPrice ? (typeof r.originalPrice === "number" ? r.originalPrice : parseFloat(String(r.originalPrice).replace(/[^0-9.]/g, ""))) : undefined;
      const rImg = r.images?.find((i: any) => i.isPrimary)?.url || r.images?.[0]?.url || r.image || "https://images.unsplash.com/photo-1557821552-17105176677c?w=500&q=80";
      
      return {
        id: r._id ? r._id.toString() : (r.id || `rel-${rIdx}`),
        title: r.title || r.name || "Marketplace Product",
        price: rPrice >= 10000000 ? `₹${(rPrice / 10000000).toFixed(2)} Cr` : (rPrice > 0 ? `₹${rPrice.toLocaleString("en-IN")}` : "Contact for Price"),
        rawPrice: rPrice,
        originalPrice: rOrigPrice ? `₹${rOrigPrice.toLocaleString("en-IN")}` : undefined,
        image: rImg,
        category: r.category || "General",
        location: r.city && r.state ? `${r.city}, ${r.state}` : (r.city || "Verified Location"),
        sellerSlug: r.sellerSlug || sellerSlug,
        sellerName: r.brand || portfolioDoc?.companyName || "Verified Seller"
      };
    });

    const companyName = portfolioDoc?.companyName || matchedDoc.brand || "TrueDeal Verified Merchant";
    const phone = portfolioDoc?.phone || matchedDoc.phone || "918903216178";
    const whatsapp = portfolioDoc?.whatsapp || matchedDoc.whatsapp || phone;

    const productPayload: PublicProductDetail = {
      id: matchedDoc._id ? matchedDoc._id.toString() : (matchedDoc.id || rawId),
      _id: matchedDoc._id ? matchedDoc._id.toString() : rawId,
      title: matchedDoc.title || matchedDoc.name || "Untitled Product",
      name: matchedDoc.name || matchedDoc.title || "Untitled Product",
      brand: matchedDoc.brand || companyName,
      category: matchedDoc.category || "Marketplace Listing",
      price: rawPrice,
      formattedPrice,
      originalPrice: rawOriginalPrice,
      formattedOriginalPrice,
      discount,
      inventory: typeof matchedDoc.inventory === "number" ? matchedDoc.inventory : 25,
      inStock: matchedDoc.inventory !== 0 && matchedDoc.isActive !== false,
      sku: matchedDoc.sku || matchedDoc.modelName,
      modelName: matchedDoc.modelName,
      shortDesc: matchedDoc.shortDesc || matchedDoc.description?.substring(0, 180) || "Authentic verified product catalog item with direct seller fulfillment.",
      description: matchedDoc.description || matchedDoc.shortDesc || "No full description provided for this listing. Contact the verified seller directly for technical details and custom specifications.",
      images: imageList,
      primaryImage: imageList[0],
      specs: formattedSpecs,
      features: Array.isArray(matchedDoc.features) && matchedDoc.features.length > 0 
        ? matchedDoc.features 
        : [
            "100% Genuine & Quality Inspected",
            "Direct Verified Seller Procurement",
            "Express Dispatch within 24-48 Business Hours",
            "Dedicated TrueDeal Support & Order Tracking"
          ],
      aiKeywords: Array.isArray(matchedDoc.aiKeywords) ? matchedDoc.aiKeywords : [],
      aiVisibility: matchedDoc.aiVisibility || 97,
      aiSubtext: matchedDoc.aiSubtext || "High Demand Product",
      badgeType: matchedDoc.badgeType || "verified",
      city: matchedDoc.city || portfolioDoc?.city || "Pune",
      state: matchedDoc.state || portfolioDoc?.state || "Maharashtra",
      location: [matchedDoc.city || portfolioDoc?.city, matchedDoc.state || portfolioDoc?.state].filter(Boolean).join(", ") || "India",
      sourceUrl: matchedDoc.sourceUrl || matchedDoc.buyUrl || matchedDoc.productUrl || "",
      buyUrl: matchedDoc.buyUrl || matchedDoc.sourceUrl || matchedDoc.productUrl || "",
      productUrl: matchedDoc.productUrl || matchedDoc.sourceUrl || matchedDoc.buyUrl || "",
      sellerSlug,
      seller: {
        slug: sellerSlug,
        companyName,
        tagline: portfolioDoc?.tagline || `Verified ${portfolioDoc?.businessType || "Seller"} on TrueDeal`,
        about: portfolioDoc?.about || "Verified business on TrueDeal providing authentic products and reliable customer support.",
        logo: portfolioDoc?.logo || "/truedeal.png",
        bannerImage: portfolioDoc?.bannerImage || "",
        businessType: portfolioDoc?.businessType || "Verified Business",
        city: portfolioDoc?.city || matchedDoc.city || "Pune",
        state: portfolioDoc?.state || matchedDoc.state || "Maharashtra",
        address: portfolioDoc?.address || "",
        phone,
        whatsapp,
        email: portfolioDoc?.email || "",
        website: portfolioDoc?.website || matchedDoc.sourceUrl || "",
        rating: 4.9,
        reviewsCount: 38,
        verified: true,
        specialities: portfolioDoc?.specialities?.map((s: any) => s.title || s) || ["Verified Merchant", "Fast Shipping"]
      },
      relatedProducts
    };

    return {
      success: true,
      product: productPayload
    };
  } catch (error: any) {
    console.error("Error fetching public product details:", error);
    return {
      success: false,
      error: error.message || "Failed to load product details"
    };
  }
}

export interface PlaceOrderInput {
  productId: string;
  productTitle: string;
  sellerSlug: string;
  sellerName: string;
  sellerPhone?: string;
  sellerWhatsApp?: string;
  buyerName: string;
  buyerEmail?: string;
  buyerPhone: string;
  shippingAddress: string;
  city: string;
  pincode: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  paymentMethod: "cod" | "online" | "external";
  notes?: string;
}

export async function placeDirectOrder(data: PlaceOrderInput): Promise<{
  success: boolean;
  orderId?: string;
  whatsappUrl?: string;
  razorpayOrder?: any;
  error?: string;
}> {
  try {
    if (!data.buyerName || !data.buyerPhone || !data.shippingAddress) {
      return { success: false, error: "Please enter your name, phone number, and delivery address." };
    }

    const db = await getDb();
    const orderNumber = `TD-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const orderDoc = {
      orderNumber,
      productId: data.productId,
      productTitle: data.productTitle,
      sellerSlug: data.sellerSlug,
      sellerName: data.sellerName,
      buyerName: data.buyerName,
      buyerEmail: data.buyerEmail || "",
      buyerPhone: data.buyerPhone,
      shippingAddress: data.shippingAddress,
      city: data.city,
      pincode: data.pincode,
      quantity: data.quantity,
      unitPrice: data.unitPrice,
      totalAmount: data.totalAmount,
      paymentMethod: data.paymentMethod,
      paymentStatus: data.paymentMethod === "online" ? "pending" : "pending_cod",
      orderStatus: "confirmed",
      notes: data.notes || "",
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Save order into orders collection
    await db.collection("orders").insertOne(orderDoc);

    // Also register as an inquiry so it appears in the seller's dashboard
    await db.collection("inquiries").insertOne({
      sellerSlug: data.sellerSlug,
      name: data.buyerName,
      email: data.buyerEmail || "",
      phone: data.buyerPhone,
      productTitle: `${data.productTitle} (Order #${orderNumber}, Qty: ${data.quantity})`,
      message: `DIRECT ORDER #${orderNumber}\nItem: ${data.productTitle}\nQuantity: ${data.quantity}\nTotal: ₹${data.totalAmount.toLocaleString("en-IN")}\nDelivery Address: ${data.shippingAddress}, ${data.city} - ${data.pincode}\nPayment: ${data.paymentMethod.toUpperCase()}${data.notes ? `\nNotes: ${data.notes}` : ""}`,
      status: "New",
      source: "product_detail_page",
      orderNumber,
      createdAt: new Date()
    });

    // Generate WhatsApp direct notification link for instant fulfillment
    const cleanPhone = (data.sellerWhatsApp || data.sellerPhone || "918903216178").replace(/[^0-9]/g, "");
    const waText = `Hi ${data.sellerName}, I have placed a DIRECT ORDER on TrueDeal!%0A%0A📦 *Order Number:* ${orderNumber}%0A🏷️ *Product:* ${data.productTitle}%0A🔢 *Quantity:* ${data.quantity}%0A💰 *Total Amount:* ₹${data.totalAmount.toLocaleString("en-IN")}%0A💳 *Payment Mode:* ${data.paymentMethod.toUpperCase()}%0A%0A📍 *Delivery Details:*%0A${data.buyerName}%0A${data.buyerPhone}%0A${data.shippingAddress}, ${data.city} - ${data.pincode}%0A%0APlease confirm dispatch and estimated delivery time!`;
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${waText}`;

    // If online payment selected, create Razorpay order
    let razorpayOrder: any = null;
    if (data.paymentMethod === "online") {
      try {
        razorpayOrder = await createRazorpayOrder(data.totalAmount, orderNumber);
      } catch (err: any) {
        console.warn("Razorpay order creation fallback:", err.message);
      }
    }

    return {
      success: true,
      orderId: orderNumber,
      whatsappUrl,
      razorpayOrder
    };
  } catch (error: any) {
    console.error("Error placing direct order:", error);
    return {
      success: false,
      error: error.message || "Failed to process order. Please try again."
    };
  }
}
