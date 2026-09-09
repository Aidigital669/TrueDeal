"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { 
  Building2, MapPin, Clock, Phone, MessageSquare, Globe, Sparkles, 
  CheckCircle2, ShieldCheck, Award, Star, Package, ArrowRight, ArrowLeft,
  ExternalLink, Mail, Share2, Send, Check, ChevronRight, Search,
  ShoppingBag, HelpCircle, CheckCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getPublicPortfolio, submitPortfolioInquiry, PortfolioData } from "@/lib/portfolio-actions";
import { getCurrentUserSession, UserSession } from "@/lib/auth-actions";

export default function PublicPortfolioPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug || "";
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<UserSession | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("home");
  
  // Inquiry form state
  const [inquiryName, setInquiryName] = useState("");
  const [inquiryEmail, setInquiryEmail] = useState("");
  const [inquiryPhone, setInquiryPhone] = useState("");
  const [inquiryProduct, setInquiryProduct] = useState("");
  const [inquiryMessage, setInquiryMessage] = useState("");
  const [inquirySending, setInquirySending] = useState(false);
  const [inquirySent, setInquirySent] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [aboutExpanded, setAboutExpanded] = useState(false);

  useEffect(() => {
    // Check active user session
    getCurrentUserSession().then(s => {
      if (s) setSession(s);
    }).catch(err => console.warn("Session check notice:", err));

    async function loadPortfolio() {
      if (!slug) return;
      try {
        setLoading(true);
        const res = await getPublicPortfolio(slug);
        if (res.success && res.portfolio) {
          setPortfolio(res.portfolio);
          setProducts(res.products || []);
        }
      } catch (err) {
        console.error("Failed to load public portfolio from database:", err);
      } finally {
        setLoading(false);
      }
    }
    loadPortfolio();
  }, [slug]);

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryName || !inquiryPhone || !inquiryMessage) {
      alert("Please fill in your name, phone number, and message.");
      return;
    }

    setInquirySending(true);
    try {
      const res = await submitPortfolioInquiry({
        sellerSlug: slug,
        name: inquiryName,
        email: inquiryEmail,
        phone: inquiryPhone,
        productTitle: inquiryProduct,
        message: inquiryMessage
      });

      if (res.success) {
        setInquirySent(true);
      } else {
        alert("Failed to submit inquiry: " + res.error);
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setInquirySending(false);
    }
  };

  const copyPageUrl = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 3000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F3F2EE] flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-[#0A66C2] border-t-transparent animate-spin"></div>
        <p className="text-gray-600 font-semibold text-sm">Loading Verified Storefront from Database...</p>
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="min-h-screen bg-[#F3F2EE] flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-white rounded-2xl p-8 border border-gray-200 shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
            <Building2 className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Storefront Not Found</h2>
          <p className="text-xs text-gray-600">
            No portfolio or seller found matching <code className="bg-gray-100 px-2 py-0.5 rounded text-indigo-600 font-bold">{slug}</code> in the database.
          </p>
          <Link href="/">
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold w-full mt-2 cursor-pointer">
              ← Return to TrueDeal Marketplace
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Categories extracted strictly from database products
  const dbCategories = Array.from(new Set(products.map((p) => p.category).filter(Boolean)));
  const categories = ["All", ...dbCategories];

  // Filtered products
  const filteredProducts = products.filter((p) => {
    const matchesCat = selectedCategory === "All" || p.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (p.brand && p.brand.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  // Clean WhatsApp number
  const rawWhatsApp = portfolio.whatsapp || portfolio.phone || "";
  const cleanWhatsAppNumber = rawWhatsApp.replace(/[^0-9]/g, "");
  const whatsappUrl = cleanWhatsAppNumber ? `https://wa.me/${cleanWhatsAppNumber}?text=${encodeURIComponent(
    `Hi ${portfolio.companyName}, I saw your verified profile on TrueDeal and would like to inquire about your products and services.`
  )}` : "";

  const isSellerOwner = Boolean(
    (session?.role === "seller" && (
      session?.slug === slug || 
      session?.storeName === portfolio.companyName || 
      (portfolio as any)?.userId === session?.userId
    )) ||
    searchParams?.get("from") === "dashboard" ||
    searchParams?.get("preview") === "true"
  );

  const handleCustomerBack = (e: React.MouseEvent) => {
    if (typeof window !== "undefined" && window.history.length > 1 && document.referrer && document.referrer.includes(window.location.host)) {
      e.preventDefault();
      window.history.back();
    }
  };

  // Dynamic Navigation Tabs based on database content
  const hasSpecialities = Array.isArray(portfolio.specialities) && portfolio.specialities.length > 0;
  const hasReviews = Array.isArray(portfolio.reviews) && portfolio.reviews.length > 0;
  const hasGallery = Array.isArray(portfolio.gallery) && portfolio.gallery.length > 0;
  const hasFaqs = Array.isArray(portfolio.faqs) && portfolio.faqs.length > 0;
  const hasWorkingHours = Array.isArray(portfolio.workingHours) && portfolio.workingHours.length > 0;
  const hasLocation = Boolean(portfolio.address || portfolio.city || portfolio.state);

  const locationDisplay = [portfolio.city, portfolio.state, portfolio.country].filter(Boolean).join(", ") || portfolio.address || "";

  return (
    <div className="min-h-screen bg-[#F3F2EE] text-gray-900 font-sans antialiased selection:bg-[#0A66C2] selection:text-white pb-20">
           {/* LinkedIn-Style Top Global Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 h-14 flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Left: Brand Identity & Conditional Back Button */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {isSellerOwner ? (
              <Link 
                href="/dashboard"
                className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-2.5 sm:px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border border-slate-700 shadow-sm shrink-0 active:scale-95"
                title="Return to Seller Dashboard"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Back to Dashboard</span>
                <span className="sm:hidden">Dashboard</span>
              </Link>
            ) : (
              <Link 
                href="/"
                onClick={handleCustomerBack}
                className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 text-indigo-900 px-2.5 sm:px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border border-indigo-200 shadow-sm shrink-0 active:scale-95 group cursor-pointer"
                title="Return to TrueDeal AI Search & Discovery"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-indigo-600 group-hover:-translate-x-0.5 transition-transform" />
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span className="hidden sm:inline">Back to AI Chat</span>
                <span className="sm:hidden">Chat</span>
              </Link>
            )}

            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#0A66C2] text-white flex items-center justify-center font-black text-sm shrink-0">
                TD
              </div>
              <span className="font-extrabold text-base text-gray-900 tracking-tight hidden sm:inline">TrueDeal</span>
            </Link>
            <span className="text-gray-300 hidden md:inline">|</span>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider hidden md:inline">Verified Storefront</span>
          </div>

          {/* Center Search within Company */}
          <div className="relative hidden md:flex items-center flex-1 max-w-md mx-4">
            <Search className="absolute left-3 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder={`Search in ${portfolio.companyName} catalog...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#EDF3F8] hover:bg-[#E2E8F0] focus:bg-white pl-9 pr-4 py-1.5 rounded-md text-xs font-medium border border-transparent focus:border-[#0A66C2] outline-none transition-all"
            />
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button 
              onClick={copyPageUrl}
              className="px-2.5 sm:px-3 py-1.5 rounded-full border border-gray-300 hover:bg-gray-100 text-xs font-bold text-gray-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copiedUrl ? "Copied!" : "Share"}</span>
            </button>
            {whatsappUrl && (
              <a 
                href={whatsappUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-[#0A66C2] hover:bg-[#004182] text-white px-3 sm:px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Message</span>
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Main Page Layout Container */}
      <main className="max-w-6xl mx-auto px-3 sm:px-6 pt-4 flex flex-col gap-4">
        
        {/* ========================================================= */}
        {/* 1. LINKEDIN-STYLE COMPANY HERO PROFILE CARD */}
        {/* ========================================================= */}
        <section className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          
          {/* Wide Cover Banner */}
          <div className="relative w-full h-36 sm:h-56 lg:h-64 bg-gradient-to-r from-slate-800 via-indigo-950 to-slate-900 overflow-hidden">
            {portfolio.bannerImage ? (
              <img 
                src={portfolio.bannerImage} 
                alt={portfolio.companyName} 
                className="w-full h-full object-cover opacity-90"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-indigo-900 via-blue-900 to-slate-900 flex items-center justify-center">
                <span className="text-white/20 text-2xl sm:text-3xl font-black tracking-widest uppercase select-none px-4 text-center">{portfolio.companyName}</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
            
            {/* Top Right Registration Badge (Strictly conditional from database) */}
            {portfolio.gstin && (
              <div className="absolute top-3 right-3 sm:top-4 sm:right-4 flex items-center gap-2">
                <span className="bg-black/60 backdrop-blur-md text-white text-[10px] sm:text-[11px] font-bold px-2.5 sm:px-3 py-1 rounded-full border border-white/20 flex items-center gap-1 shadow-sm">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> 
                  <span className="hidden sm:inline">GSTIN / Reg:</span> {portfolio.gstin}
                </span>
              </div>
            )}
          </div>

          {/* Profile Header Body */}
          <div className="px-4 sm:px-8 pb-6 pt-0 relative">
            
            {/* Floating Company Avatar & Actions */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end items-start gap-3 -mt-10 sm:-mt-16 mb-4">
              <div className="relative w-20 h-20 sm:w-32 sm:h-32 rounded-2xl bg-white border-4 border-white shadow-xl overflow-hidden flex items-center justify-center shrink-0">
                {portfolio.logo ? (
                  <img 
                    src={portfolio.logo} 
                    alt={portfolio.companyName} 
                    className="w-full h-full object-contain p-1"
                  />
                ) : (
                  <div className="w-full h-full bg-indigo-600 text-white font-black text-xl sm:text-3xl flex items-center justify-center">
                    {(portfolio.companyName || "TD").slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Action Buttons on Right */}
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                {whatsappUrl && (
                  <a 
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 sm:flex-initial"
                  >
                    <Button
                      className="w-full sm:w-auto rounded-full px-4 sm:px-5 h-9 text-xs font-bold bg-[#0A66C2] text-white hover:bg-[#004182] flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
                    </Button>
                  </a>
                )}

                {portfolio.phone && (
                  <a href={`tel:${portfolio.phone}`} className="flex-1 sm:flex-initial">
                    <Button
                      variant="outline"
                      className="w-full sm:w-auto rounded-full px-3.5 h-9 text-xs font-bold text-gray-700 border-gray-300 hover:bg-gray-50 flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Phone className="w-3.5 h-3.5 text-emerald-600" /> Call
                    </Button>
                  </a>
                )}

                {portfolio.website && (
                  <a href={portfolio.website} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                    <Button
                      variant="outline"
                      className="w-full sm:w-auto rounded-full px-3.5 h-9 text-xs font-bold text-gray-700 border-gray-300 hover:bg-gray-50 flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> <span className="truncate">Official Website</span>
                    </Button>
                  </a>
                )}
              </div>
            </div>

            {/* Title & Tagline */}
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                  {portfolio.companyName}
                </h1>
                <span className="inline-flex items-center gap-1 bg-blue-50 text-[#0A66C2] px-2.5 py-0.5 rounded-full text-xs font-extrabold border border-blue-200">
                  <CheckCircle className="w-3.5 h-3.5 fill-[#0A66C2] text-white" /> Verified Storefront
                </span>
              </div>

              {portfolio.tagline && (
                <p className="text-sm sm:text-base font-semibold text-gray-700 max-w-3xl leading-snug">
                  {portfolio.tagline}
                </p>
              )}

              {/* LinkedIn Meta Details Line */}
              <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-gray-500 font-medium pt-1">
                {portfolio.businessType && (
                  <span className="font-bold text-gray-800">{portfolio.businessType}</span>
                )}
                {locationDisplay && (
                  <>
                    <span>·</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-gray-400" /> {locationDisplay}</span>
                  </>
                )}
                <span>·</span>
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Verified Seller
                </span>
                {hasReviews && (
                  <>
                    <span>·</span>
                    <span className="text-amber-700 font-bold flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-500" /> {portfolio.rating || "5.0"} ({portfolio.reviews?.length} {portfolio.reviews?.length === 1 ? "review" : "reviews"})
                    </span>
                  </>
                )}
              </div>
            </div>

          </div>

          {/* LinkedIn-Style Horizontal Navigation Tabs */}
          <div className="border-t border-gray-200 px-4 sm:px-8 bg-white flex items-center gap-2 overflow-x-auto custom-scrollbar">
            <LinkedInTab label="Home" active={activeTab === "home"} onClick={() => setActiveTab("home")} />
            {portfolio.about && (
              <LinkedInTab label="About" active={activeTab === "about"} onClick={() => setActiveTab("about")} />
            )}
            <LinkedInTab label={`Catalog (${products.length})`} active={activeTab === "products"} onClick={() => setActiveTab("products")} badge={String(products.length)} />
            {hasSpecialities && (
              <LinkedInTab label="Specialities" active={activeTab === "specialities"} onClick={() => setActiveTab("specialities")} />
            )}
            {hasReviews && (
              <LinkedInTab label={`Reviews (${portfolio.reviews?.length || 0})`} active={activeTab === "reviews"} onClick={() => setActiveTab("reviews")} />
            )}
            {hasGallery && (
              <LinkedInTab label="Gallery" active={activeTab === "gallery"} onClick={() => setActiveTab("gallery")} />
            )}
            {(hasWorkingHours || hasLocation) && (
              <LinkedInTab label="Locations & Hours" active={activeTab === "locations"} onClick={() => setActiveTab("locations")} />
            )}
          </div>

        </section>

        {/* ========================================================= */}
        {/* 2. TWO-COLUMN LINKEDIN BODY (Main Feed + Sidebar) */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          
          {/* LEFT COLUMN: Main Cards & Content (2 Cols) */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            
            {/* About Card */}
            {(activeTab === "home" || activeTab === "about") && portfolio.about && (
              <section id="about" className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h2 className="text-lg font-black text-gray-900 mb-3">About</h2>
                <div className="text-sm text-gray-700 leading-relaxed space-y-3 font-normal">
                  <p className={aboutExpanded ? "" : "line-clamp-4"}>
                    {portfolio.about}
                  </p>
                  {portfolio.about && portfolio.about.length > 200 && (
                    <button 
                      onClick={() => setAboutExpanded(!aboutExpanded)} 
                      className="text-xs font-bold text-[#0A66C2] hover:underline flex items-center gap-0.5 cursor-pointer"
                    >
                      {aboutExpanded ? "see less" : "...see more"}
                    </button>
                  )}
                </div>

                {/* Company Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 mt-6 border-t border-gray-100 text-xs">
                  {portfolio.website && (
                    <div>
                      <span className="font-bold text-gray-400 uppercase tracking-wider block mb-0.5">Official Website</span>
                      <a href={portfolio.website} target="_blank" rel="noopener noreferrer" className="font-bold text-[#0A66C2] hover:underline truncate block">
                        {portfolio.website}
                      </a>
                    </div>
                  )}

                  {portfolio.businessType && (
                    <div>
                      <span className="font-bold text-gray-400 uppercase tracking-wider block mb-0.5">Industry / Category</span>
                      <span className="font-bold text-gray-800">{portfolio.businessType}</span>
                    </div>
                  )}

                  {portfolio.teamSize && (
                    <div>
                      <span className="font-bold text-gray-400 uppercase tracking-wider block mb-0.5">Company Size</span>
                      <span className="font-bold text-gray-800">{portfolio.teamSize}</span>
                    </div>
                  )}

                  {locationDisplay && (
                    <div>
                      <span className="font-bold text-gray-400 uppercase tracking-wider block mb-0.5">Headquarters</span>
                      <span className="font-bold text-gray-800">{locationDisplay}</span>
                    </div>
                  )}

                  {portfolio.yearEstablished && (
                    <div>
                      <span className="font-bold text-gray-400 uppercase tracking-wider block mb-0.5">Founded</span>
                      <span className="font-bold text-gray-800">{portfolio.yearEstablished}</span>
                    </div>
                  )}

                  {portfolio.gstin && (
                    <div>
                      <span className="font-bold text-gray-400 uppercase tracking-wider block mb-0.5">GSTIN / Registration</span>
                      <span className="font-bold text-emerald-700 font-mono">{portfolio.gstin}</span>
                    </div>
                  )}
                </div>

                {/* Certifications (Strictly from database) */}
                {portfolio.certifications && portfolio.certifications.length > 0 && (
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Certifications & Compliance</span>
                    <div className="flex flex-wrap gap-2">
                      {portfolio.certifications.map((cert, idx) => (
                        <span key={idx} className="bg-emerald-50 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> {cert}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* Featured Products / Offerings Section */}
            {(activeTab === "home" || activeTab === "products") && (
              <section id="products" className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h2 className="text-lg font-black text-gray-900">Products & Catalog</h2>
                    <p className="text-xs text-gray-500 font-medium">Verified offerings with direct pricing and direct order channels.</p>
                  </div>
                  <span className="text-xs font-extrabold text-[#0A66C2] bg-blue-50 px-3 py-1 rounded-full border border-blue-100 self-start sm:self-auto">
                    {filteredProducts.length} Available
                  </span>
                </div>

                {/* Category Filter Pills (if multiple categories exist) */}
                {categories.length > 2 && (
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                          selectedCategory === cat
                            ? "bg-[#0A66C2] text-white shadow-sm"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                )}

                {/* Product Grid or Empty State */}
                {filteredProducts.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    {filteredProducts.map((p) => (
                      <div 
                        key={p.id}
                        className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-[#0A66C2] hover:shadow-md transition-all flex flex-col justify-between"
                      >
                        <div>
                          {/* Image */}
                          <div className="relative aspect-[16/10] bg-gray-50 overflow-hidden">
                            {p.image ? (
                              <img 
                                src={p.image} 
                                alt={p.title} 
                                className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-500"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                                <Package className="w-8 h-8" />
                              </div>
                            )}
                            {p.category && (
                              <span className="absolute top-2 left-2 bg-black/70 backdrop-blur-md text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md">
                                {p.category}
                              </span>
                            )}
                            <span className="absolute top-2 right-2 bg-emerald-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md flex items-center gap-1">
                              <Sparkles className="w-2.5 h-2.5" /> {p.aiVisibility || 97}% Match
                            </span>
                          </div>

                          {/* Details */}
                          <div className="p-4">
                            <h3 className="font-bold text-sm text-gray-900 group-hover:text-[#0A66C2] transition-colors line-clamp-2 mb-1.5" title={p.title}>
                              {p.title}
                            </h3>
                            {p.description ? (
                              <p className="text-xs text-gray-500 line-clamp-2 mb-3">
                                {p.description}
                              </p>
                            ) : null}
                            <div className="flex items-baseline gap-2">
                              <span className="text-lg font-black text-gray-900">
                                ₹{Number(p.price || 0).toLocaleString("en-IN")}
                              </span>
                              {p.originalPrice && p.originalPrice > p.price && (
                                <span className="text-xs text-gray-400 line-through">
                                  ₹{Number(p.originalPrice).toLocaleString("en-IN")}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Card Action: Buy on Website & WhatsApp Inquiry */}
                        <div className="p-4 pt-0 flex flex-col gap-2">
                          {(p.sourceUrl || portfolio.website) && (
                            <a 
                              href={p.sourceUrl || portfolio.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full block"
                            >
                              <Button 
                                size="sm"
                                className="w-full bg-[#0A66C2] hover:bg-[#004182] text-white font-extrabold text-xs rounded-xl h-10 shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                              >
                                <ExternalLink className="w-3.5 h-3.5" /> Buy on Website
                              </Button>
                            </a>
                          )}

                          {cleanWhatsAppNumber && (
                            <a 
                              href={`https://wa.me/${cleanWhatsAppNumber}?text=${encodeURIComponent(`Hi ${portfolio.companyName}, I am interested in ordering: "${p.title}" on TrueDeal.`)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full block"
                            >
                              <Button 
                                size="sm"
                                variant="outline"
                                className="w-full bg-gray-50 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700 text-gray-700 font-bold text-xs rounded-xl h-9 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                              >
                                <MessageSquare className="w-3.5 h-3.5 text-emerald-600" /> Inquire via WhatsApp
                              </Button>
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 border border-dashed border-gray-200 rounded-xl">
                    <Package className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-xs font-bold text-gray-500">No products available in this category.</p>
                  </div>
                )}
              </section>
            )}

            {/* Specialities & Core Strengths (Strictly from database) */}
            {(activeTab === "home" || activeTab === "specialities") && hasSpecialities && (
              <section id="specialities" className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h2 className="text-lg font-black text-gray-900 mb-1">Specialities & Capabilities</h2>
                <p className="text-xs text-gray-500 mb-4">Core competencies and verified capabilities.</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {portfolio.specialities!.map((spec, idx) => (
                    <div key={spec.id || idx} className="p-4 rounded-xl border border-gray-100 bg-[#F9FAFB] hover:border-gray-300 transition-all flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-[#0A66C2]">{spec.title}</span>
                        {spec.tag && (
                          <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">
                            {spec.tag}
                          </span>
                        )}
                      </div>
                      {spec.description && (
                        <p className="text-xs text-gray-600 leading-relaxed font-normal">
                          {spec.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Reviews & Client Endorsements (Strictly from database) */}
            {(activeTab === "home" || activeTab === "reviews") && hasReviews && (
              <section id="reviews" className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-black text-gray-900">Customer Feedback & Reviews</h2>
                    <p className="text-xs text-gray-500">Verified buyer testimonials and customer feedback.</p>
                  </div>
                  <div className="flex items-center gap-1 bg-amber-50 text-amber-800 px-3 py-1 rounded-full border border-amber-200 text-xs font-black">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" /> {portfolio.rating || 5.0} / 5.0
                  </div>
                </div>

                <div className="space-y-3">
                  {portfolio.reviews!.map((rev) => (
                    <div key={rev.id} className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 flex flex-col gap-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                            {rev.author.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-xs text-gray-900 block leading-tight">{rev.author}</span>
                            <span className="text-[11px] text-gray-500 block">{rev.role || "Verified Customer"} · {rev.date}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} className={`w-3 h-3 ${s <= rev.rating ? "fill-amber-400 text-amber-400" : "text-gray-300"}`} />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-gray-700 leading-relaxed italic">
                        "{rev.comment}"
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Gallery & Showcase (Strictly from database) */}
            {(activeTab === "home" || activeTab === "gallery") && hasGallery && (
              <section id="gallery" className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h2 className="text-lg font-black text-gray-900 mb-1">Showcase & Photos</h2>
                <p className="text-xs text-gray-500 mb-4">Official product showcases, facilities, and photo gallery.</p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {portfolio.gallery!.filter((img) => Boolean(img && img.url)).map((img) => (
                    <div key={img.id} className="group relative aspect-square rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                      <img src={img.url} alt={img.caption || "Gallery"} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      {img.caption && (
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-end">
                          <span className="text-[11px] font-bold text-white leading-tight">{img.caption}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* FAQs (Strictly from database) */}
            {hasFaqs && (
              <section className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h2 className="text-lg font-black text-gray-900 mb-3">Frequently Asked Questions</h2>
                <div className="space-y-3">
                  {portfolio.faqs!.map((faq) => (
                    <div key={faq.id} className="p-3.5 rounded-lg border border-gray-100 bg-[#F9FAFB]">
                      <h4 className="font-bold text-xs text-gray-900 mb-1 flex items-center gap-2">
                        <HelpCircle className="w-3.5 h-3.5 text-[#0A66C2]" /> {faq.question}
                      </h4>
                      <p className="text-xs text-gray-600 pl-5 leading-relaxed">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

          </div>

          {/* RIGHT COLUMN: LinkedIn Sidebar (Inquiry Form + Contact Info) */}
          <div className="flex flex-col gap-4">
            
            {/* Quick Inquiry / Direct Contact Box */}
            <div id="inquiry-section" className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0A66C2] flex items-center justify-center">
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-gray-900 leading-none">Inquire Directly</h3>
                  <span className="text-[11px] text-gray-500 font-medium">Direct to {portfolio.companyName}</span>
                </div>
              </div>

              {inquirySent ? (
                <div className="my-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                  <h4 className="font-bold text-sm">Inquiry Sent Successfully!</h4>
                  <p className="text-xs">The store team will contact you shortly.</p>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => setInquirySent(false)} 
                    className="text-xs font-bold mt-2 cursor-pointer"
                  >
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleInquirySubmit} className="space-y-3 mt-4">
                  <div>
                    <label className="text-[11px] font-bold text-gray-600 uppercase">Your Name *</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Rahul Sharma"
                      value={inquiryName}
                      onChange={(e) => setInquiryName(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs font-medium focus:border-[#0A66C2] outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-gray-600 uppercase">Phone / WhatsApp *</label>
                    <input 
                      type="text" 
                      placeholder="e.g. +91 98765 43210"
                      value={inquiryPhone}
                      onChange={(e) => setInquiryPhone(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs font-medium focus:border-[#0A66C2] outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-gray-600 uppercase">Email (Optional)</label>
                    <input 
                      type="email" 
                      placeholder="you@company.com"
                      value={inquiryEmail}
                      onChange={(e) => setInquiryEmail(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs font-medium focus:border-[#0A66C2] outline-none"
                    />
                  </div>

                  {products.length > 0 && (
                    <div>
                      <label className="text-[11px] font-bold text-gray-600 uppercase">Product of Interest</label>
                      <select
                        value={inquiryProduct}
                        onChange={(e) => setInquiryProduct(e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs font-medium focus:border-[#0A66C2] outline-none"
                      >
                        <option value="">General Product Inquiry</option>
                        {products.slice(0, 15).map((p) => (
                          <option key={p.id} value={p.title}>{p.title}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="text-[11px] font-bold text-gray-600 uppercase">Message *</label>
                    <textarea 
                      rows={3}
                      placeholder="I would like to know pricing, availability, and ordering details..."
                      value={inquiryMessage}
                      onChange={(e) => setInquiryMessage(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs font-medium focus:border-[#0A66C2] outline-none resize-none"
                      required
                    />
                  </div>

                  <Button 
                    type="submit" 
                    disabled={inquirySending}
                    className="w-full bg-[#0A66C2] hover:bg-[#004182] text-white text-xs font-bold py-2.5 rounded-lg shadow-sm cursor-pointer"
                  >
                    {inquirySending ? "Sending..." : "Submit Inquiry"}
                  </Button>
                </form>
              )}
            </div>

            {/* Operating Hours & Location Card */}
            {(hasWorkingHours || hasLocation || portfolio.phone) && (
              <div id="location" className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
                {hasWorkingHours && (
                  <>
                    <div className="flex items-center justify-between">
                      <h3 className="font-extrabold text-sm text-gray-900 flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-emerald-600" /> Working Hours
                      </h3>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                        Open
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      {portfolio.workingHours!.map((wh) => (
                        <div key={wh.day} className="flex items-center justify-between py-1 border-b border-gray-50 last:border-0">
                          <span className="font-bold text-gray-700">{wh.day}</span>
                          <span className={`font-medium ${wh.isClosed ? "text-red-500 font-bold" : "text-gray-600"}`}>
                            {wh.isClosed ? "Closed" : `${wh.open} - ${wh.close}`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* Address */}
                {hasLocation && (
                  <div className={hasWorkingHours ? "pt-3 border-t border-gray-100" : ""}>
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Business Address</span>
                    <p className="text-xs text-gray-800 font-medium leading-relaxed flex items-start gap-1.5">
                      <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                      {portfolio.address ? `${portfolio.address}${portfolio.city ? `, ${portfolio.city}` : ""}${portfolio.state ? `, ${portfolio.state}` : ""}` : locationDisplay}
                    </p>
                  </div>
                )}

                {/* Direct Phone */}
                {portfolio.phone && (
                  <div className="pt-2 flex flex-col gap-2">
                    <a 
                      href={`tel:${portfolio.phone}`}
                      className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-gray-200 hover:bg-gray-50 text-xs font-bold text-gray-800 transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5 text-blue-600" /> Call {portfolio.phone}
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* TrueDeal Verification Badge */}
            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-xl p-5 shadow-sm space-y-2">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                <h4 className="font-extrabold text-sm">TrueDeal Verified Business</h4>
              </div>
              <p className="text-xs text-indigo-200 leading-relaxed font-normal">
                This storefront is verified on TrueDeal with direct seller communication channels and authenticated catalog listings.
              </p>
            </div>

          </div>

        </div>

      </main>

    </div>
  );
}

function LinkedInTab({ label, active, onClick, badge }: { label: string; active: boolean; onClick: () => void; badge?: string }) {
  return (
    <button
      onClick={onClick}
      className={`py-3 px-3 text-xs font-bold border-b-2 whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
        active 
          ? "border-[#0A66C2] text-[#0A66C2]" 
          : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
      }`}
    >
      {label}
    </button>
  );
}
