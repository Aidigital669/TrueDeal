"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  ArrowLeft, Star, ShieldCheck, Sparkles, MapPin, Phone, MessageSquare, 
  Share2, Heart, Check, Truck, RotateCcw, CheckCircle2, Clock, 
  Building2, ChevronRight, X, CreditCard, AlertCircle, Info, Eye, 
  Package, Zap, Calendar, FileText, Award
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getPublicProductDetails, placeDirectOrder, PublicProductDetail } from "@/lib/product-actions";

export default function ProductDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const resolvedParams = use(params);
  const id = resolvedParams?.id || "";
  const router = useRouter();
  const searchParams = useSearchParams();
  const sellerSlugParam = searchParams.get("seller") || undefined;

  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<PublicProductDetail | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"description" | "specs" | "seller" | "reviews">("description");
  const [copiedLink, setCopiedLink] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Buy / Booking Modal state
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [buyerName, setBuyerName] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");
  const [preferredVisitDate, setPreferredVisitDate] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "online">("cod");
  const [orderNotes, setOrderNotes] = useState("");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderPlacedData, setOrderPlacedData] = useState<{ orderId: string; whatsappUrl?: string } | null>(null);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (lightboxOpen) setLightboxOpen(false);
        if (isCheckoutOpen) {
          setIsCheckoutOpen(false);
          setOrderPlacedData(null);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCheckoutOpen, lightboxOpen]);

  // Load product details
  useEffect(() => {
    async function loadData() {
      if (!id) return;
      setLoading(true);
      try {
        const res = await getPublicProductDetails(id, sellerSlugParam);
        if (res.success && res.product) {
          setProduct(res.product);
          if (res.product.city) setCity(res.product.city);
        } else {
          setProduct(null);
        }
      } catch (err) {
        console.error("Failed to load product details:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id, sellerSlugParam]);

  // Robust Real Estate Property Detection
  const isProperty = Boolean(
    product && (
      product.category?.toLowerCase().includes("property") ||
      product.category?.toLowerCase().includes("real estate") ||
      product.category?.toLowerCase().includes("commercial") ||
      product.category?.toLowerCase().includes("residential") ||
      product.category?.toLowerCase().includes("land") ||
      product.category?.toLowerCase().includes("plot") ||
      product.category?.toLowerCase().includes("office") ||
      product.title?.toLowerCase().includes("floor") ||
      product.title?.toLowerCase().includes("office") ||
      product.title?.toLowerCase().includes("commercial") ||
      product.title?.toLowerCase().includes("bare-shell") ||
      product.title?.toLowerCase().includes("sq.ft") ||
      product.title?.toLowerCase().includes("sqft") ||
      product.title?.toLowerCase().includes("rera") ||
      (typeof product.price === "number" && product.price >= 10000000)
    )
  );

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleQuantityChange = (delta: number) => {
    if (isProperty) return; // Disallow quantity modification for real estate properties
    setQuantity(prev => Math.max(1, Math.min(prev + delta, product?.inventory || 99)));
  };

  // Direct WhatsApp Order URL
  const cleanSellerWhatsApp = (product?.seller?.whatsapp || product?.seller?.phone || "918903216178").replace(/[^0-9]/g, "");
  const totalOrderPrice = isProperty ? (product?.price || 0) : ((product?.price || 0) * quantity);
  const formattedTotalPrice = totalOrderPrice >= 10000000
    ? `₹${(totalOrderPrice / 10000000).toFixed(2)} Cr`
    : totalOrderPrice > 0 
      ? `₹${totalOrderPrice.toLocaleString("en-IN")}`
      : "Direct Seller Pricing";

  const directWhatsAppOrderUrl = isProperty
    ? `https://wa.me/${cleanSellerWhatsApp}?text=${encodeURIComponent(
        `Hi ${product?.seller?.companyName || "Seller"}, I am inquiring about this verified property listing on TrueDeal:\n\n` +
        `🏢 Property: ${product?.title}\n` +
        `💰 Valuation: ${product?.formattedPrice}\n` +
        `📍 Location: ${product?.location || "Pune"}\n` +
        `🏷️ Listing ID: ${product?.id}\n\n` +
        `Please share the detailed floor plans, legal brochure, and schedule a private site inspection!`
      )}`
    : `https://wa.me/${cleanSellerWhatsApp}?text=${encodeURIComponent(
        `Hi ${product?.seller?.companyName || "Seller"}, I want to BUY directly on TrueDeal:\n\n` +
        `📦 Product: ${product?.title}\n` +
        `🔢 Quantity: ${quantity}\n` +
        `💰 Price: ${product?.formattedPrice} (Total: ${formattedTotalPrice})\n` +
        `🏷️ Item ID: ${product?.id}\n\n` +
        `Please confirm stock availability and dispatch time!`
      )}`;

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    if (!buyerName || !buyerPhone || !shippingAddress) {
      alert("Please fill in your name, phone number, and address.");
      return;
    }

    setIsPlacingOrder(true);
    try {
      const fullNotes = [
        isProperty && preferredVisitDate ? `Preferred Site Visit: ${preferredVisitDate}` : null,
        orderNotes
      ].filter(Boolean).join(" | ");

      const res = await placeDirectOrder({
        productId: product.id,
        productTitle: product.title,
        sellerSlug: product.sellerSlug,
        sellerName: product.seller.companyName,
        sellerPhone: product.seller.phone,
        sellerWhatsApp: product.seller.whatsapp,
        buyerName,
        buyerEmail,
        buyerPhone,
        shippingAddress,
        city: city || product.city || "Pune",
        pincode: pincode || "411014",
        quantity: isProperty ? 1 : quantity,
        unitPrice: product.price,
        totalAmount: totalOrderPrice,
        paymentMethod,
        notes: fullNotes
      });

      if (res.success && res.orderId) {
        setOrderPlacedData({
          orderId: res.orderId,
          whatsappUrl: res.whatsappUrl
        });
      } else {
        alert("Failed to submit request: " + (res.error || "Unknown error"));
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F1015] text-white flex flex-col items-center justify-center gap-4">
        <div className="relative w-16 h-16">
          <div className="w-16 h-16 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
          <Sparkles className="w-6 h-6 text-indigo-400 absolute inset-0 m-auto animate-pulse" />
        </div>
        <p className="text-gray-400 text-sm font-semibold tracking-wide animate-pulse">
          Loading Verified Details...
        </p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#0F1015] text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-[#181920] border border-gray-800 rounded-3xl p-8 shadow-2xl space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/20">
            <AlertCircle className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white mb-1.5">Listing Not Found</h2>
            <p className="text-xs text-gray-400 leading-relaxed">
              We couldn't locate this listing in our database catalog. It may have been updated or archived by the verified seller.
            </p>
          </div>
          <div className="pt-2 flex flex-col gap-2">
            <Link href="/" className="w-full">
              <Button className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-xs h-11 rounded-xl shadow-lg shadow-indigo-600/20 cursor-pointer">
                ← Return to TrueDeal Search
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const activeImage = product.images[selectedImageIndex] || product.primaryImage;

  return (
    <div className="min-h-screen bg-[#F6F7FA] text-slate-900 font-sans selection:bg-indigo-600 selection:text-white pb-28 md:pb-16">
      
      {/* Top Sticky Navigation Bar */}
      <nav className="sticky top-0 z-40 bg-white/85 backdrop-blur-xl border-b border-gray-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          
          {/* Back Button & Breadcrumbs */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => {
                if (typeof window !== "undefined" && window.history.length > 1) {
                  window.history.back();
                } else {
                  router.push("/");
                }
              }}
              className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-full text-xs font-bold transition-all border border-gray-200 shrink-0 cursor-pointer active:scale-95"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Back</span>
            </button>

            <Link href="/" className="flex items-center gap-2 shrink-0">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-600 to-blue-600 text-white flex items-center justify-center font-black text-xs shadow-md">
                TD
              </div>
              <span className="font-extrabold text-base text-gray-900 tracking-tight hidden md:inline">TrueDeal</span>
            </Link>

            <span className="text-gray-300 hidden sm:inline">/</span>

            {/* Breadcrumb Category */}
            <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium truncate">
              <span className="hover:text-indigo-600 transition-colors hidden sm:inline">{product.category}</span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0 hidden sm:inline" />
              <span className="text-gray-900 font-bold truncate max-w-[200px] sm:max-w-xs">{product.title}</span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsWishlisted(!isWishlisted)}
              className={`p-2 rounded-full border transition-all cursor-pointer ${
                isWishlisted 
                  ? "bg-pink-50 border-pink-200 text-pink-600" 
                  : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
              title="Add to Wishlist"
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? "fill-pink-600" : ""}`} />
            </button>

            <button
              onClick={handleShare}
              className="p-2 rounded-full bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all cursor-pointer relative"
              title="Share Listing"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
              {copiedLink && (
                <span className="absolute -bottom-8 right-0 bg-black text-white text-[10px] font-bold py-1 px-2 rounded-md shadow-lg whitespace-nowrap animate-fadeIn">
                  Link Copied!
                </span>
              )}
            </button>

            {/* Direct Seller Storefront Link */}
            <Link
              href={`/portfolio/${product.sellerSlug}`}
              className="hidden sm:flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3.5 py-1.5 rounded-full text-xs font-bold border border-indigo-200 transition-all"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>{isProperty ? "Developer Profile" : "Seller Store"}</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content Showcase */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        
        {/* Top Product Hero Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Image Gallery (6 cols) */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            
            {/* Main Stage Image */}
            <div className="relative aspect-square sm:aspect-[4/3] rounded-3xl bg-white border border-gray-200/80 shadow-sm overflow-hidden group">
              <img
                src={activeImage}
                alt={product.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-zoom-in"
                onClick={() => setLightboxOpen(true)}
              />

              {/* Floating Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2 z-10 pointer-events-none">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-indigo-600/90 backdrop-blur-md text-white shadow-md">
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  <span>{product.aiVisibility}% Match</span>
                </span>

                {product.discount && !isProperty && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-extrabold bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-md">
                    {product.discount}
                  </span>
                )}

                {isProperty && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-extrabold bg-slate-900/90 backdrop-blur-md text-white shadow-md border border-slate-700">
                    🏛️ MahaRERA Approved
                  </span>
                )}
              </div>

              {/* Verified Tag */}
              <div className="absolute top-4 right-4 z-10 pointer-events-none">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/90 backdrop-blur-md text-emerald-700 border border-emerald-200 shadow-sm">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>TrueDeal Verified</span>
                </span>
              </div>

              {/* Magnify Hint */}
              <button
                onClick={() => setLightboxOpen(true)}
                className="absolute bottom-4 right-4 bg-white/80 hover:bg-white text-gray-700 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold border border-gray-200/70 shadow-sm flex items-center gap-1.5 transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5 text-indigo-600" />
                <span>Zoom Photo</span>
              </button>
            </div>

            {/* Thumbnail Strip */}
            {product.images.length > 1 && (
              <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-thin">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative w-20 h-20 rounded-2xl bg-white border-2 overflow-hidden shrink-0 transition-all cursor-pointer p-0.5 ${
                      selectedImageIndex === idx
                        ? "border-indigo-600 ring-2 ring-indigo-500/20 shadow-md scale-95"
                        : "border-gray-200 hover:border-gray-300 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.title} preview ${idx + 1}`}
                      className="w-full h-full object-cover rounded-xl"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Professional Trust Assurance Card (Real Estate vs Physical Goods) */}
            {isProperty ? (
              <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-xs grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-gray-50/70">
                  <Building2 className="w-5 h-5 text-indigo-600" />
                  <span className="text-[11px] font-bold text-gray-900 leading-tight">MahaRERA Verified</span>
                  <span className="text-[10px] text-gray-500">Legal Title Cleared</span>
                </div>
                <div className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-gray-50/70">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <span className="text-[11px] font-bold text-gray-900 leading-tight">Direct Developer</span>
                  <span className="text-[10px] text-gray-500">Zero Brokerage Fee</span>
                </div>
                <div className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-gray-50/70">
                  <MapPin className="w-5 h-5 text-rose-600" />
                  <span className="text-[11px] font-bold text-gray-900 leading-tight">Private Site Visit</span>
                  <span className="text-[10px] text-gray-500">Guided Inspection</span>
                </div>
                <div className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-gray-50/70">
                  <Award className="w-5 h-5 text-blue-600" />
                  <span className="text-[11px] font-bold text-gray-900 leading-tight">Safe Deal Escrow</span>
                  <span className="text-[10px] text-gray-500">Handshake Protected</span>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-xs grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-gray-50/70">
                  <Truck className="w-5 h-5 text-indigo-600" />
                  <span className="text-[11px] font-bold text-gray-900 leading-tight">Express Delivery</span>
                  <span className="text-[10px] text-gray-500">2-4 Business Days</span>
                </div>
                <div className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-gray-50/70">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <span className="text-[11px] font-bold text-gray-900 leading-tight">100% Genuine</span>
                  <span className="text-[10px] text-gray-500">Direct from Brand</span>
                </div>
                <div className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-gray-50/70">
                  <RotateCcw className="w-5 h-5 text-amber-600" />
                  <span className="text-[11px] font-bold text-gray-900 leading-tight">Easy Returns</span>
                  <span className="text-[10px] text-gray-500">7-Day Replacement</span>
                </div>
                <div className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-gray-50/70">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                  <span className="text-[11px] font-bold text-gray-900 leading-tight">Secure Deal</span>
                  <span className="text-[10px] text-gray-500">Cash on Delivery</span>
                </div>
              </div>
            )}

          </div>

          {/* Right Column: Product Detail & Purchase Actions (6 cols) */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            
            {/* Header info card */}
            <div className="bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-7 shadow-xs space-y-4">
              
              {/* Seller & Category Meta */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Link
                  href={`/portfolio/${product.sellerSlug}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full transition-colors"
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>{product.seller.companyName}</span>
                  <CheckCircle2 className="w-3 h-3 text-indigo-600" />
                </Link>

                <div className="flex items-center gap-2 text-xs text-gray-500">
                  {product.location && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-rose-500" />
                      <span>{product.location}</span>
                    </span>
                  )}
                  <span>•</span>
                  <span className="text-gray-600 font-semibold">{product.category}</span>
                </div>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight leading-snug">
                {product.title}
              </h1>

              {/* Reviews & Social Proof */}
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5 bg-amber-50 text-amber-800 px-2.5 py-1 rounded-lg font-bold border border-amber-200">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <span>4.9</span>
                  <span className="text-amber-600 font-normal">({product.seller.reviewsCount || 38} verified reviews)</span>
                </div>

                <span className="text-emerald-600 font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  {isProperty 
                    ? "MahaRERA Approved • Ready for Possession" 
                    : (product.inStock ? "In Stock & Ready to Dispatch" : "Made to Order")}
                </span>
              </div>

              {/* Pricing Display */}
              <div className="pt-2 border-t border-gray-100 flex flex-wrap items-baseline gap-3">
                <div className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
                  {product.formattedPrice}
                </div>

                {product.formattedOriginalPrice && !isProperty && (
                  <div className="text-base sm:text-lg text-gray-400 line-through font-medium">
                    {product.formattedOriginalPrice}
                  </div>
                )}

                {product.discount && !isProperty && (
                  <span className="px-2.5 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-extrabold">
                    {product.discount}
                  </span>
                )}
              </div>

              <div className="text-[11px] text-gray-500 flex items-center gap-1.5 font-medium">
                <Info className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                {isProperty ? (
                  <span>Verified commercial property listing with direct developer allocation. Legal title deeds, occupancy certificates, and floor plans verified.</span>
                ) : (
                  <span>Inclusive of all taxes. Free shipping on verified orders above ₹499.</span>
                )}
              </div>

              {/* Short Summary Description */}
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed pt-1">
                {product.shortDesc}
              </p>

              {/* Quantity Selector: Displayed ONLY for standard products, COMPLETELY REMOVED for Real Estate */}
              {!isProperty ? (
                <div className="pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-gray-700">Quantity:</span>
                    <div className="inline-flex items-center bg-gray-100 rounded-xl border border-gray-200 p-1">
                      <button
                        onClick={() => handleQuantityChange(-1)}
                        disabled={quantity <= 1}
                        className="w-8 h-8 rounded-lg bg-white text-gray-800 font-black flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 transition-colors shadow-xs cursor-pointer"
                      >
                        -
                      </button>
                      <span className="w-10 text-center font-black text-sm text-gray-900">
                        {quantity}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(1)}
                        className="w-8 h-8 rounded-lg bg-white text-gray-800 font-black flex items-center justify-center hover:bg-gray-50 transition-colors shadow-xs cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] text-gray-400 block font-semibold">Subtotal</span>
                    <span className="text-lg font-black text-indigo-600">{formattedTotalPrice}</span>
                  </div>
                </div>
              ) : (
                /* Professional Property Asset Badge in Place of Quantity */
                <div className="pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/80 rounded-2xl p-3.5 border border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-gray-900 block">Single Unit Listing</span>
                      <span className="text-[10px] text-gray-500">Entire Floor / Commercial Unit</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-gray-500 font-semibold block uppercase tracking-wider">Total Valuation</span>
                    <span className="text-base font-black text-indigo-700">{product.formattedPrice}</span>
                  </div>
                </div>
              )}

              {/* PRIMARY ACTION BUTTONS (Buy Now & WhatsApp Direct ONLY - Official Store & Call Seller removed) */}
              <div className="pt-3 space-y-3">
                
                {/* 1. Instant BUY NOW / BOOK SITE VISIT Button */}
                <Button
                  onClick={() => setIsCheckoutOpen(true)}
                  className="w-full h-14 bg-gradient-to-r from-indigo-600 via-indigo-700 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-extrabold text-base rounded-2xl shadow-xl shadow-indigo-600/25 flex items-center justify-center gap-2.5 transition-all transform active:scale-[0.99] cursor-pointer group"
                >
                  <Zap className="w-5 h-5 fill-amber-300 text-amber-300 group-hover:scale-110 transition-transform" />
                  <span>
                    {isProperty 
                      ? `BOOK SITE VISIT & BUY NOW • ${product.formattedPrice}` 
                      : `BUY NOW • ${formattedTotalPrice}`}
                  </span>
                </Button>

                {/* 2. Direct WhatsApp Order / Inquiry Button */}
                <a
                  href={directWhatsAppOrderUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full block"
                >
                  <Button
                    variant="outline"
                    className="w-full h-12 bg-emerald-600 hover:bg-emerald-500 text-white hover:text-white font-bold text-xs rounded-2xl border-0 shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4 fill-white" />
                    <span>
                      {isProperty 
                        ? "Inquire / Schedule Site Visit on WhatsApp" 
                        : "Order via WhatsApp Direct"}
                    </span>
                  </Button>
                </a>

              </div>

            </div>

            {/* Seller / Developer Snapshot Card */}
            <div className="bg-white rounded-3xl border border-gray-200/80 p-5 shadow-xs flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-black text-lg shrink-0">
                  {product.seller.companyName.charAt(0)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-extrabold text-sm text-gray-900 truncate">
                      {product.seller.companyName}
                    </h3>
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  </div>
                  <p className="text-[11px] text-gray-500 truncate">
                    {product.seller.city}, {product.seller.state} • Verified TrueDeal Partner
                  </p>
                </div>
              </div>

              <Link
                href={`/portfolio/${product.sellerSlug}`}
                className="shrink-0"
              >
                <Button 
                  size="sm" 
                  className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl border border-indigo-200 h-9 px-3.5 cursor-pointer"
                >
                  {isProperty ? "Developer Profile" : "Visit Store"}
                </Button>
              </Link>
            </div>

          </div>

        </div>

        {/* Detailed Tabs Section */}
        <section className="mt-12 bg-white rounded-3xl border border-gray-200/80 shadow-xs overflow-hidden">
          
          {/* Tab Navigation Headers */}
          <div className="flex items-center border-b border-gray-200 overflow-x-auto scrollbar-none bg-gray-50/50">
            <button
              onClick={() => setActiveTab("description")}
              className={`px-6 py-4 text-xs font-extrabold tracking-wide uppercase transition-all whitespace-nowrap border-b-2 cursor-pointer ${
                activeTab === "description"
                  ? "border-indigo-600 text-indigo-600 bg-white"
                  : "border-transparent text-gray-500 hover:text-gray-900"
              }`}
            >
              Full Description
            </button>
            <button
              onClick={() => setActiveTab("specs")}
              className={`px-6 py-4 text-xs font-extrabold tracking-wide uppercase transition-all whitespace-nowrap border-b-2 cursor-pointer ${
                activeTab === "specs"
                  ? "border-indigo-600 text-indigo-600 bg-white"
                  : "border-transparent text-gray-500 hover:text-gray-900"
              }`}
            >
              Specifications & Details ({product.specs.length})
            </button>
            <button
              onClick={() => setActiveTab("seller")}
              className={`px-6 py-4 text-xs font-extrabold tracking-wide uppercase transition-all whitespace-nowrap border-b-2 cursor-pointer ${
                activeTab === "seller"
                  ? "border-indigo-600 text-indigo-600 bg-white"
                  : "border-transparent text-gray-500 hover:text-gray-900"
              }`}
            >
              {isProperty ? "About The Developer" : "About The Seller"}
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={`px-6 py-4 text-xs font-extrabold tracking-wide uppercase transition-all whitespace-nowrap border-b-2 cursor-pointer ${
                activeTab === "reviews"
                  ? "border-indigo-600 text-indigo-600 bg-white"
                  : "border-transparent text-gray-500 hover:text-gray-900"
              }`}
            >
              Verified Reviews
            </button>
          </div>

          {/* Tab Content Panes */}
          <div className="p-6 sm:p-8">
            
            {/* Description Tab */}
            {activeTab === "description" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-gray-900 mb-2.5">
                    {isProperty ? "Property Overview & Architectural Highlights" : "Product Overview"}
                  </h3>
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                    {product.description}
                  </p>
                </div>

                {product.features && product.features.length > 0 && (
                  <div>
                    <h3 className="text-base font-bold text-gray-900 mb-3">Key Highlights & Features</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {product.features.map((feat, fIdx) => (
                        <div key={fIdx} className="flex items-start gap-2.5 p-3 rounded-xl bg-gray-50 border border-gray-100">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span className="text-xs font-semibold text-gray-800">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Specifications Tab */}
            {activeTab === "specs" && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-gray-900 mb-2">
                  {isProperty ? "Property Specifications & Approvals" : "Technical Specifications"}
                </h3>
                <div className="border border-gray-200 rounded-2xl overflow-hidden divide-y divide-gray-100">
                  {product.specs.map((s, sIdx) => (
                    <div 
                      key={sIdx} 
                      className={`grid grid-cols-1 sm:grid-cols-3 p-3.5 text-xs ${
                        sIdx % 2 === 0 ? "bg-white" : "bg-gray-50/70"
                      }`}
                    >
                      <span className="font-bold text-gray-700">{s.key}</span>
                      <span className="sm:col-span-2 text-gray-900 font-medium mt-0.5 sm:mt-0">{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Seller Tab */}
            {activeTab === "seller" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-indigo-50/60 border border-indigo-100">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white font-black text-xl flex items-center justify-center shadow-md">
                      {product.seller.companyName.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-base text-gray-900">{product.seller.companyName}</h4>
                      <p className="text-xs text-indigo-700 font-medium">{product.seller.tagline}</p>
                      <p className="text-xs text-gray-500 mt-0.5">📍 {product.seller.city}, {product.seller.state}</p>
                    </div>
                  </div>

                  <Link href={`/portfolio/${product.sellerSlug}`}>
                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm cursor-pointer">
                      {isProperty ? "View Developer Portfolio" : "Visit Storefront"}
                    </Button>
                  </Link>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-gray-900 mb-2">About The Merchant</h3>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                    {product.seller.about}
                  </p>
                </div>
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === "reviews" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-center gap-6 p-6 rounded-2xl bg-gray-50 border border-gray-100">
                  <div className="text-center sm:text-left">
                    <div className="text-4xl font-black text-gray-900">4.9</div>
                    <div className="flex items-center justify-center sm:justify-start gap-1 my-1">
                      {[1, 2, 3, 4, 5].map(st => (
                        <Star key={st} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="text-xs text-gray-500">Based on 38 verified client reviews</p>
                  </div>

                  <div className="flex-1 w-full space-y-1.5">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="w-10 text-gray-600 font-bold">5 Star</span>
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="w-[92%] h-full bg-amber-400 rounded-full" />
                      </div>
                      <span className="w-8 text-right font-medium text-gray-500">92%</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="w-10 text-gray-600 font-bold">4 Star</span>
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="w-[8%] h-full bg-amber-400 rounded-full" />
                      </div>
                      <span className="w-8 text-right font-medium text-gray-500">8%</span>
                    </div>
                  </div>
                </div>

                {/* Sample Verified Testimonial */}
                <div className="p-4 rounded-xl border border-gray-100 bg-white space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gray-200 text-gray-700 font-bold text-xs flex items-center justify-center">
                        R
                      </div>
                      <div>
                        <span className="font-bold text-xs text-gray-900 block">Rajesh K.</span>
                        <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
                          <CheckCircle2 className="w-3 h-3" /> Verified Client
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] text-gray-400">3 days ago</span>
                  </div>
                  <p className="text-xs text-gray-600">
                    {isProperty
                      ? '"Very smooth coordination. Site inspection was arranged promptly by the developer, and all legal documents were verified transparently through TrueDeal."'
                      : '"Received in excellent condition within 2 days. The authenticity and quality are top notch. TrueDeal verified tag gave me full peace of mind."'}
                  </p>
                </div>
              </div>
            )}

          </div>

        </section>

        {/* Related & Recommended Products Grid */}
        {product.relatedProducts && product.relatedProducts.length > 0 && (
          <section className="mt-12 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">
                  More from {product.seller.companyName}
                </h2>
                <p className="text-xs text-gray-500 font-medium">
                  Verified listings you may also explore
                </p>
              </div>

              <Link
                href={`/portfolio/${product.sellerSlug}`}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                <span>View All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {product.relatedProducts.map((rel) => (
                <div
                  key={rel.id}
                  onClick={() => router.push(`/product/${rel.id}?seller=${rel.sellerSlug}`)}
                  className="group bg-white rounded-2xl border border-gray-200 hover:border-indigo-500 hover:shadow-xl hover:shadow-indigo-500/10 transition-all p-3 flex flex-col justify-between cursor-pointer"
                >
                  <div>
                    <div className="relative aspect-square rounded-xl bg-gray-50 overflow-hidden mb-3">
                      <img
                        src={rel.image}
                        alt={rel.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute top-2 left-2 bg-black/70 backdrop-blur-md text-white text-[9px] font-bold px-2 py-0.5 rounded-md">
                        {rel.category}
                      </span>
                    </div>

                    <h4 className="font-bold text-xs text-gray-900 line-clamp-2 group-hover:text-indigo-600 transition-colors mb-1.5" title={rel.title}>
                      {rel.title}
                    </h4>
                  </div>

                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between mt-auto">
                    <span className="font-extrabold text-sm text-gray-900">
                      {rel.price}
                    </span>
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/product/${rel.id}?seller=${rel.sellerSlug}`);
                      }}
                      className="bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white font-bold text-[11px] rounded-lg h-7 px-2.5 transition-colors cursor-pointer"
                    >
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

      </main>

      {/* Floating Bottom Bar for Mobile Devices */}
      <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-lg border-t border-gray-200 p-3 sm:hidden z-30 flex items-center justify-between gap-3 shadow-2xl">
        <div>
          <span className="text-[10px] text-gray-500 font-semibold block">
            {isProperty ? "Total Valuation:" : "Total Price:"}
          </span>
          <span className="text-base font-black text-gray-900">{product.formattedPrice}</span>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={directWhatsAppOrderUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md"
            title="Inquire via WhatsApp"
          >
            <MessageSquare className="w-4 h-4 fill-white" />
          </a>

          <Button
            onClick={() => setIsCheckoutOpen(true)}
            className="h-11 px-5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-indigo-600/20 flex items-center gap-1.5 cursor-pointer"
          >
            <Zap className="w-4 h-4 fill-amber-300 text-amber-300" />
            <span>{isProperty ? "BOOK SITE VISIT" : "BUY NOW"}</span>
          </Button>
        </div>
      </div>

      {/* Lightbox Photo Preview Modal */}
      {lightboxOpen && (
        <div 
          onClick={() => setLightboxOpen(false)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out animate-fadeIn"
        >
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 p-2 text-white/70 hover:text-white bg-white/10 rounded-full cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={activeImage}
            alt={product.title}
            className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
          />
        </div>
      )}

      {/* Express Checkout / Booking Modal */}
      {isCheckoutOpen && (
        <div 
          onClick={() => {
            setIsCheckoutOpen(false);
            setOrderPlacedData(null);
          }}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-hidden animate-fadeIn"
        >
          {/* Top-Right Screen Floating Cross Button */}
          <button
            type="button"
            onClick={() => {
              setIsCheckoutOpen(false);
              setOrderPlacedData(null);
            }}
            className="fixed top-3 right-3 sm:top-5 sm:right-5 w-9 h-9 rounded-full bg-black/60 hover:bg-rose-600 text-white border border-white/20 backdrop-blur-md flex items-center justify-center transition-all cursor-pointer z-50 shadow-xl active:scale-90"
            title="Close (Esc)"
            aria-label="Close modal"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>

          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col max-h-[90vh] sm:max-h-[86vh] overflow-hidden animate-scaleUp"
          >
            {/* Modal Sticky Header with Prominent Cross Option */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white px-4 py-3 sm:px-5 sm:py-3.5 flex items-center justify-between border-b border-white/10 shrink-0">
              <div className="min-w-0 pr-3">
                <span className="text-[9px] font-extrabold uppercase tracking-wider text-indigo-300 block">
                  {isProperty ? "🏛️ Verified Property Booking" : "⚡ Express Checkout"}
                </span>
                <h3 className="text-sm sm:text-base font-black tracking-tight truncate">
                  {isProperty ? "Schedule Site Inspection & Booking" : "Complete Your Order"}
                </h3>
              </div>

              {/* In-Header Cross Option Button */}
              <button
                type="button"
                onClick={() => {
                  setIsCheckoutOpen(false);
                  setOrderPlacedData(null);
                }}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/15 hover:bg-rose-600 text-white flex items-center justify-center transition-all cursor-pointer shrink-0 border border-white/20 active:scale-90"
                title="Close (Esc)"
                aria-label="Close modal"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="overflow-y-auto flex-1 p-3.5 sm:p-4 space-y-2.5">
              {orderPlacedData ? (
                /* Success Screen */
                <div className="py-6 px-2 text-center space-y-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-gray-900">
                      {isProperty ? "Booking Inquiry Registered!" : "Order Confirmed!"}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
                      Your reference number is <span className="font-bold text-indigo-600">{orderPlacedData.orderId}</span>. The developer / seller team will contact you directly.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200/80 text-left text-xs space-y-1.5">
                    <div className="flex justify-between font-semibold text-gray-700">
                      <span>Listing:</span>
                      <span className="text-gray-900 font-bold truncate max-w-[200px]">{product.title}</span>
                    </div>
                    {!isProperty && (
                      <div className="flex justify-between font-semibold text-gray-700">
                        <span>Quantity:</span>
                        <span className="text-gray-900 font-bold">{quantity}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-semibold text-gray-700">
                      <span>{isProperty ? "Total Valuation:" : "Total Amount:"}</span>
                      <span className="text-indigo-600 font-black">{formattedTotalPrice}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-gray-700">
                      <span>Deal Mode:</span>
                      <span className="text-gray-900 font-bold">
                        {isProperty 
                          ? (paymentMethod === "online" ? "FORMAL LOI ALLOCATION" : "SITE VISIT & HANDSHAKE")
                          : paymentMethod.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {orderPlacedData.whatsappUrl && (
                    <a
                      href={orderPlacedData.whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full block"
                    >
                      <Button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-10 rounded-xl shadow-md flex items-center justify-center gap-1.5 cursor-pointer">
                        <MessageSquare className="w-4 h-4" />
                        <span>{isProperty ? "Connect with Developer on WhatsApp" : "Send Receipt to Seller on WhatsApp"}</span>
                      </Button>
                    </a>
                  )}

                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsCheckoutOpen(false);
                      setOrderPlacedData(null);
                    }}
                    className="w-full text-xs font-bold rounded-xl h-9 border-gray-200 cursor-pointer"
                  >
                    Done
                  </Button>
                </div>
              ) : (
                /* Compact, Professional Order / Booking Form */
                <form onSubmit={handleOrderSubmit} className="space-y-2.5">
                  
                  {/* Product Mini-Summary */}
                  <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-200/80">
                    <img
                      src={product.primaryImage}
                      alt={product.title}
                      className="w-11 h-11 rounded-lg object-cover bg-white border border-gray-200 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <h5 className="font-bold text-xs text-gray-900 truncate" title={product.title}>
                        {product.title}
                      </h5>
                      <div className="flex items-center justify-between text-[11px] mt-0.5">
                        <span className="text-gray-500 font-medium">
                          {isProperty ? "🏢 Commercial Asset" : `Qty: ${quantity}`}
                        </span>
                        <span className="font-black text-indigo-600 text-xs">
                          {formattedTotalPrice}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Buyer Fields */}
                  <div>
                    <label className="text-[10px] font-bold text-gray-600 block mb-0.5">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={buyerName}
                      onChange={(e) => setBuyerName(e.target.value)}
                      className="w-full h-8 px-2.5 rounded-lg border border-gray-200 text-xs text-gray-900 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-gray-600 block mb-0.5">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="e.g. 9876543210"
                        value={buyerPhone}
                        onChange={(e) => setBuyerPhone(e.target.value)}
                        className="w-full h-8 px-2.5 rounded-lg border border-gray-200 text-xs text-gray-900 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-600 block mb-0.5">
                        Email Address
                      </label>
                      <input
                        type="email"
                        placeholder="e.g. rahul@company.com"
                        value={buyerEmail}
                        onChange={(e) => setBuyerEmail(e.target.value)}
                        className="w-full h-8 px-2.5 rounded-lg border border-gray-200 text-xs text-gray-900 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-600 block mb-0.5">
                      {isProperty ? "Registered Address / Office Location *" : "Delivery Address *"}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={isProperty ? "e.g. Corporate Office, SB Road, Pune" : "Flat / House, Building, Street, Landmark"}
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      className="w-full h-8 px-2.5 rounded-lg border border-gray-200 text-xs text-gray-900 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-gray-600 block mb-0.5">
                        City
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Pune"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full h-8 px-2.5 rounded-lg border border-gray-200 text-xs text-gray-900 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-600 block mb-0.5">
                        Pincode
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 411014"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        className="w-full h-8 px-2.5 rounded-lg border border-gray-200 text-xs text-gray-900 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all"
                      />
                    </div>
                  </div>

                  {isProperty && (
                    <div>
                      <label className="text-[10px] font-bold text-gray-600 block mb-0.5">
                        Preferred Site Visit Date & Time (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Tomorrow 2:00 PM or Weekend"
                        value={preferredVisitDate}
                        onChange={(e) => setPreferredVisitDate(e.target.value)}
                        className="w-full h-8 px-2.5 rounded-lg border border-gray-200 text-xs text-gray-900 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all"
                      />
                    </div>
                  )}

                  {/* Payment / Engagement Preference */}
                  <div>
                    <label className="text-[10px] font-bold text-gray-600 block mb-1">
                      {isProperty ? "Engagement Preference" : "Payment Method"}
                    </label>

                    {isProperty ? (
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setPaymentMethod("cod")}
                          className={`p-2 rounded-lg border text-left cursor-pointer transition-all ${
                            paymentMethod === "cod"
                              ? "border-indigo-600 bg-indigo-50/70 ring-1 ring-indigo-600"
                              : "border-gray-200 hover:bg-gray-50"
                          }`}
                        >
                          <span className="font-extrabold text-[11px] text-gray-900 block">Site Inspection</span>
                          <span className="text-[9px] text-gray-500 block leading-tight">Guided physical visit</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setPaymentMethod("online")}
                          className={`p-2 rounded-lg border text-left cursor-pointer transition-all ${
                            paymentMethod === "online"
                              ? "border-indigo-600 bg-indigo-50/70 ring-1 ring-indigo-600"
                              : "border-gray-200 hover:bg-gray-50"
                          }`}
                        >
                          <span className="font-extrabold text-[11px] text-gray-900 block">Formal LOI Booking</span>
                          <span className="text-[9px] text-gray-500 block leading-tight">Developer handshake</span>
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setPaymentMethod("cod")}
                          className={`p-2 rounded-lg border text-left cursor-pointer transition-all ${
                            paymentMethod === "cod"
                              ? "border-indigo-600 bg-indigo-50/70 ring-1 ring-indigo-600"
                              : "border-gray-200 hover:bg-gray-50"
                          }`}
                        >
                          <span className="font-extrabold text-[11px] text-gray-900 block">Cash on Delivery</span>
                          <span className="text-[9px] text-gray-500 block leading-tight">Pay upon delivery</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setPaymentMethod("online")}
                          className={`p-2 rounded-lg border text-left cursor-pointer transition-all ${
                            paymentMethod === "online"
                              ? "border-indigo-600 bg-indigo-50/70 ring-1 ring-indigo-600"
                              : "border-gray-200 hover:bg-gray-50"
                          }`}
                        >
                          <span className="font-extrabold text-[11px] text-gray-900 block">Online Payment</span>
                          <span className="text-[9px] text-gray-500 block leading-tight">UPI / Cards / NetBanking</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Submit Action */}
                  <div className="pt-1.5">
                    <Button
                      type="submit"
                      disabled={isPlacingOrder}
                      className="w-full h-9 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {isPlacingOrder ? (
                        <span>{isProperty ? "Registering Inquiry..." : "Processing Order..."}</span>
                      ) : (
                        <>
                          <Zap className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                          <span>
                            {isProperty 
                              ? `Confirm Site Visit • ${product.formattedPrice}` 
                              : `Confirm Order • ${formattedTotalPrice}`}
                          </span>
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
