"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Building2, MapPin, Clock, Phone, MessageSquare, Globe, Sparkles, 
  CheckCircle2, Plus, Trash2, Edit3, ExternalLink, Save, Eye, 
  Share2, ShieldCheck, Award, Star, Image, HelpCircle, Package,
  Layers, Upload, Check, ChevronRight, Copy, ArrowUpRight, Wrench, Cpu, Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  getSellerPortfolio, 
  saveSellerPortfolio, 
  PortfolioData, 
  PortfolioReview, 
  PortfolioSpeciality, 
  PortfolioGalleryItem, 
  PortfolioFAQ,
  WorkingDay 
} from "@/lib/portfolio-actions";
import { getProducts } from "../catalog/actions";

export default function PortfolioBuilderPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "location" | "specialities" | "products" | "reviews" | "gallery" | "faqs" | "preview">("profile");
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
  const [catalogProducts, setCatalogProducts] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [portfolioRes, productsRes] = await Promise.all([
          getSellerPortfolio(),
          getProducts({ limit: 10 })
        ]);
        
        if (portfolioRes.success && portfolioRes.portfolio) {
          setPortfolio(portfolioRes.portfolio);
        }
        if (productsRes.success && productsRes.products) {
          setCatalogProducts(productsRes.products);
        }
      } catch (err) {
        console.error("Error loading portfolio data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const updateField = (field: keyof PortfolioData, value: any) => {
    setPortfolio((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const updateSocialLink = (network: string, value: string) => {
    setPortfolio((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        socialLinks: {
          ...prev.socialLinks,
          [network]: value
        }
      };
    });
  };

  const handleSave = async (publishStatus?: boolean) => {
    if (!portfolio) return;
    setSaving(true);
    setSavedSuccess(false);
    try {
      const dataToSave = {
        ...portfolio,
        isPublished: publishStatus !== undefined ? publishStatus : portfolio.isPublished
      };
      const res = await saveSellerPortfolio(dataToSave);
      if (res.success) {
        if (res.slug) {
          dataToSave.slug = res.slug;
        }
        setPortfolio({ ...dataToSave });
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 4000);
      } else {
        alert("Failed to save portfolio: " + (res.error || "Unknown error"));
      }
    } catch (err: any) {
      alert("Error saving: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const copyPublicLink = () => {
    if (!portfolio) return;
    const url = `${window.location.origin}/portfolio/${portfolio.slug}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  // Helper additions for array fields
  const addSpeciality = () => {
    if (!portfolio) return;
    const newSpec: PortfolioSpeciality = {
      id: "spec-" + Date.now(),
      title: "New Speciality Service",
      description: "Describe what sets your business apart in this domain.",
      tag: "Featured Service",
      iconName: "Sparkles"
    };
    updateField("specialities", [...portfolio.specialities, newSpec]);
  };

  const removeSpeciality = (id: string) => {
    if (!portfolio) return;
    updateField("specialities", portfolio.specialities.filter(s => s.id !== id));
  };

  const addReview = () => {
    if (!portfolio) return;
    const newRev: PortfolioReview = {
      id: "rev-" + Date.now(),
      author: "Verified Client",
      role: "Customer",
      rating: 5,
      date: "Recent",
      comment: "Exceptional experience, fast delivery and authentic products.",
      verified: true,
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&q=80"
    };
    updateField("reviews", [newRev, ...portfolio.reviews]);
    updateField("totalReviews", (portfolio.totalReviews || 0) + 1);
  };

  const removeReview = (id: string) => {
    if (!portfolio) return;
    updateField("reviews", portfolio.reviews.filter(r => r.id !== id));
    updateField("totalReviews", Math.max(0, (portfolio.totalReviews || 1) - 1));
  };

  const addGalleryImage = () => {
    if (!portfolio) return;
    const newImg: PortfolioGalleryItem = {
      id: "gal-" + Date.now(),
      url: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80",
      caption: "Showroom Experience Center",
      category: "Facility"
    };
    updateField("gallery", [...portfolio.gallery, newImg]);
  };

  const removeGalleryImage = (id: string) => {
    if (!portfolio) return;
    updateField("gallery", portfolio.gallery.filter(g => g.id !== id));
  };

  const addFAQ = () => {
    if (!portfolio) return;
    const newFAQ: PortfolioFAQ = {
      id: "faq-" + Date.now(),
      question: "What is your typical turnaround or delivery time?",
      answer: "We offer same-day dispatch for metro locations and 2-4 days pan-India shipping with real-time tracking."
    };
    updateField("faqs", [...portfolio.faqs, newFAQ]);
  };

  const removeFAQ = (id: string) => {
    if (!portfolio) return;
    updateField("faqs", portfolio.faqs.filter(f => f.id !== id));
  };

  const addCertification = () => {
    if (!portfolio) return;
    updateField("certifications", [...portfolio.certifications, "New Official Certification 2024"]);
  };

  const removeCertification = (index: number) => {
    if (!portfolio) return;
    updateField("certifications", portfolio.certifications.filter((_, i) => i !== index));
  };

  if (loading || !portfolio) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"></div>
        <p className="text-gray-500 font-semibold text-sm">Loading Company Portfolio Builder...</p>
      </div>
    );
  }

  const publicUrl = `/portfolio/${portfolio.slug}`;

  return (
    <div className="flex flex-col gap-6 pb-20 font-sans">
      
      {/* Top Header & Action Controls */}
      <div className="bg-white rounded-3xl border border-gray-200/80 p-6 md:p-8 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md flex-shrink-0">
            <Building2 className="w-7 h-7" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
                Company Portfolio Builder
              </h1>
              <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 ${
                portfolio.isPublished ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-amber-50 text-amber-700 border border-amber-200"
              }`}>
                <span className={`w-2 h-2 rounded-full ${portfolio.isPublished ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`}></span>
                {portfolio.isPublished ? "Live & Published" : "Draft Mode"}
              </span>
            </div>
            <p className="text-gray-500 font-medium text-sm mt-1">
              Create and maintain your business portfolio showcase — who you are, what you do, where you are located, specialities, live products, and customer reviews.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            onClick={copyPublicLink}
            className="rounded-xl font-bold text-gray-700 border-gray-200 hover:bg-gray-50 h-11 px-4 text-xs flex items-center gap-2 shadow-sm"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            {copiedLink ? "Link Copied!" : "Copy Portfolio Link"}
          </Button>

          <Link href={publicUrl} target="_blank">
            <Button
              variant="outline"
              className="rounded-xl font-bold text-indigo-600 border-indigo-200 hover:bg-indigo-50/60 h-11 px-4 text-xs flex items-center gap-2 shadow-sm"
            >
              <ExternalLink className="w-4 h-4" />
              View Public Page
            </Button>
          </Link>

          <Button
            onClick={() => handleSave()}
            disabled={saving}
            className="bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-xl font-bold h-11 px-6 text-sm shadow-md flex items-center gap-2 transition-all hover:shadow-lg"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Saving...
              </>
            ) : savedSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-white" />
                Saved Successfully!
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save & Update
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-2 shadow-sm flex items-center gap-1.5 overflow-x-auto custom-scrollbar">
        <TabButton 
          active={activeTab === "profile"} 
          onClick={() => setActiveTab("profile")} 
          icon={<Building2 className="w-4 h-4" />} 
          label="1. Company Profile" 
        />
        <TabButton 
          active={activeTab === "location"} 
          onClick={() => setActiveTab("location")} 
          icon={<MapPin className="w-4 h-4" />} 
          label="2. Location & Hours" 
        />
        <TabButton 
          active={activeTab === "specialities"} 
          onClick={() => setActiveTab("specialities")} 
          icon={<Sparkles className="w-4 h-4" />} 
          label="3. Specialities & Badges" 
        />
        <TabButton 
          active={activeTab === "products"} 
          onClick={() => setActiveTab("products")} 
          icon={<Package className="w-4 h-4" />} 
          label={`4. Products Catalog (${catalogProducts.length})`} 
        />
        <TabButton 
          active={activeTab === "reviews"} 
          onClick={() => setActiveTab("reviews")} 
          icon={<Star className="w-4 h-4 text-amber-500" />} 
          label={`5. Reviews & Ratings (${portfolio.reviews?.length || 0})`} 
        />
        <TabButton 
          active={activeTab === "gallery"} 
          onClick={() => setActiveTab("gallery")} 
          icon={<Image className="w-4 h-4" />} 
          label="6. Showroom & Gallery" 
        />
        <TabButton 
          active={activeTab === "faqs"} 
          onClick={() => setActiveTab("faqs")} 
          icon={<HelpCircle className="w-4 h-4" />} 
          label="7. FAQs & Policies" 
        />
        <TabButton 
          active={activeTab === "preview"} 
          onClick={() => setActiveTab("preview")} 
          icon={<Eye className="w-4 h-4 text-indigo-600" />} 
          label="Live Preview" 
          highlight
        />
      </div>

      {/* Tab 1: Company Profile & Branding */}
      {activeTab === "profile" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
          
          <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-200 p-6 md:p-8 shadow-sm flex flex-col gap-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Company Identity & Story</h2>
              <p className="text-sm text-gray-500">Provide complete legal and public branding details for buyers.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Company / Store Name *</label>
                <input 
                  type="text" 
                  value={portfolio.companyName} 
                  onChange={(e) => updateField("companyName", e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none" 
                  placeholder="e.g. ABC Electronics & IT Solutions"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Custom Portfolio URL Slug</label>
                <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-600">
                  <span className="bg-gray-100 text-gray-500 text-xs px-3 py-3 font-mono border-r border-gray-300">/portfolio/</span>
                  <input 
                    type="text" 
                    value={portfolio.slug} 
                    onChange={(e) => updateField("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
                    className="w-full px-3 py-3 text-sm outline-none font-medium" 
                    placeholder="abc-electronics"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Headline Tagline *</label>
                <input 
                  type="text" 
                  value={portfolio.tagline} 
                  onChange={(e) => updateField("tagline", e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none" 
                  placeholder="e.g. Premier Gaming Gear, Custom PC Builds & Certified Tech Services"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">About Company / Full Story *</label>
                <textarea 
                  rows={4} 
                  value={portfolio.about} 
                  onChange={(e) => updateField("about", e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none resize-none" 
                  placeholder="Describe your background, history, brand partnerships, and client commitments..."
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Company Mission Statement</label>
                <input 
                  type="text" 
                  value={portfolio.mission || ""} 
                  onChange={(e) => updateField("mission", e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none" 
                  placeholder="e.g. Empowering creators and gamers with authentic computing hardware."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Business Type</label>
                <input 
                  type="text" 
                  value={portfolio.businessType} 
                  onChange={(e) => updateField("businessType", e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none" 
                  placeholder="e.g. Authorized Retailer & Service Hub"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">GSTIN / Tax ID</label>
                <input 
                  type="text" 
                  value={portfolio.gstin || ""} 
                  onChange={(e) => updateField("gstin", e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none" 
                  placeholder="27AADCB2230M1Z2"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Year Established</label>
                <input 
                  type="text" 
                  value={portfolio.yearEstablished} 
                  onChange={(e) => updateField("yearEstablished", e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none" 
                  placeholder="2014"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Team Size</label>
                <input 
                  type="text" 
                  value={portfolio.teamSize} 
                  onChange={(e) => updateField("teamSize", e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none" 
                  placeholder="25+ Tech Specialists"
                />
              </div>
            </div>
          </div>

          {/* Right Visual Assets & Media Card */}
          <div className="flex flex-col gap-6">
            <div className="bg-white rounded-3xl border border-gray-200 p-6 md:p-8 shadow-sm flex flex-col gap-6">
              <h3 className="text-lg font-bold text-gray-900">Logo & Banner Media</h3>
              
              {/* Logo */}
              <div className="flex flex-col gap-3">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">Company Logo URL</label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl border-2 border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center flex-shrink-0 shadow-inner">
                    <img src={portfolio.logo} alt="Logo" className="w-full h-full object-cover" />
                  </div>
                  <input 
                    type="text" 
                    value={portfolio.logo} 
                    onChange={(e) => updateField("logo", e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none" 
                    placeholder="https://..."
                  />
                </div>
              </div>

              {/* Banner */}
              <div className="flex flex-col gap-3">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">Cover Banner Image URL</label>
                <div className="w-full h-28 rounded-2xl border-2 border-gray-200 overflow-hidden bg-gray-50 relative shadow-inner">
                  <img src={portfolio.bannerImage} alt="Banner" className="w-full h-full object-cover" />
                </div>
                <input 
                  type="text" 
                  value={portfolio.bannerImage} 
                  onChange={(e) => updateField("bannerImage", e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none" 
                  placeholder="https://..."
                />
              </div>

              <div className="p-4 bg-indigo-50/60 rounded-2xl border border-indigo-100 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <div className="text-xs text-indigo-950 font-medium">
                  <strong className="block text-indigo-900 font-bold mb-0.5">TrueDeal Verified Seller</strong>
                  Your verified status badge is displayed on your public portfolio to boost buyer conversion.
                </div>
              </div>
            </div>

            {/* Quick Publish Toggle */}
            <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm flex items-center justify-between">
              <div>
                <h4 className="font-bold text-gray-900 text-sm">Portfolio Status</h4>
                <p className="text-xs text-gray-500">Make visible to public search and buyers</p>
              </div>
              <button 
                onClick={() => updateField("isPublished", !portfolio.isPublished)}
                className={`w-12 h-6 rounded-full p-1 transition-colors ${portfolio.isPublished ? "bg-emerald-500" : "bg-gray-300"}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full transition-transform ${portfolio.isPublished ? "translate-x-6" : "translate-x-0"}`}></div>
              </button>
            </div>
          </div>

        </div>
      )}

      {/* Tab 2: Location & Working Hours */}
      {activeTab === "location" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
          
          <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-200 p-6 md:p-8 shadow-sm flex flex-col gap-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Physical Location & Contact</h2>
              <p className="text-sm text-gray-500">Let buyers know where your showroom/office is located and how to get in touch.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Street Address *</label>
                <input 
                  type="text" 
                  value={portfolio.address} 
                  onChange={(e) => updateField("address", e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none" 
                  placeholder="e.g. Shop 104-106, Prime Tech Park, Lamington Road"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">City *</label>
                <input 
                  type="text" 
                  value={portfolio.city} 
                  onChange={(e) => updateField("city", e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none" 
                  placeholder="Mumbai"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">State *</label>
                <input 
                  type="text" 
                  value={portfolio.state} 
                  onChange={(e) => updateField("state", e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none" 
                  placeholder="Maharashtra"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">PIN Code *</label>
                <input 
                  type="text" 
                  value={portfolio.pincode} 
                  onChange={(e) => updateField("pincode", e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none" 
                  placeholder="400007"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Landmark / Directions</label>
                <input 
                  type="text" 
                  value={portfolio.landmark || ""} 
                  onChange={(e) => updateField("landmark", e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none" 
                  placeholder="Opposite Metro Station Exit 2"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Google Maps Embed URL or Coordinates</label>
                <input 
                  type="text" 
                  value={portfolio.mapEmbedUrl || ""} 
                  onChange={(e) => updateField("mapEmbedUrl", e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none font-mono text-xs" 
                  placeholder="https://www.google.com/maps/embed?pb=..."
                />
              </div>
            </div>

            <div className="w-full h-px bg-gray-100 my-2"></div>

            <h3 className="text-lg font-bold text-gray-900">Communication & Instant Chat</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">WhatsApp Number (with country code) *</label>
                <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500">
                  <span className="bg-emerald-50 text-emerald-700 text-xs px-3.5 py-3 font-bold border-r border-gray-300 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5" /> WA
                  </span>
                  <input 
                    type="text" 
                    value={portfolio.whatsapp} 
                    onChange={(e) => updateField("whatsapp", e.target.value.replace(/[^0-9]/g, ""))}
                    className="w-full px-3.5 py-3 text-sm outline-none" 
                    placeholder="919820012345"
                  />
                </div>
                <span className="text-[11px] text-gray-400 mt-1 block">Buyers can click one button on your portfolio to start direct WhatsApp chat.</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Primary Phone Number</label>
                <input 
                  type="text" 
                  value={portfolio.phone} 
                  onChange={(e) => updateField("phone", e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none" 
                  placeholder="+91 98200 12345"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Public Contact Email</label>
                <input 
                  type="email" 
                  value={portfolio.email} 
                  onChange={(e) => updateField("email", e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none" 
                  placeholder="contact@abcelectronics.com"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Official Website</label>
                <input 
                  type="text" 
                  value={portfolio.website} 
                  onChange={(e) => updateField("website", e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none" 
                  placeholder="https://abcelectronics.com"
                />
              </div>
            </div>
          </div>

          {/* Working Hours Schedule Card */}
          <div className="bg-white rounded-3xl border border-gray-200 p-6 md:p-8 shadow-sm flex flex-col gap-5">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-600" />
              <h3 className="text-lg font-bold text-gray-900">Operating Hours</h3>
            </div>
            <p className="text-xs text-gray-500 font-medium">Configure store timings when clients can visit or call you.</p>

            <div className="flex flex-col gap-3">
              {portfolio.workingHours.map((wh, idx) => (
                <div key={wh.day || `wh-${idx}`} className="p-3 rounded-xl border border-gray-100 bg-gray-50/60 flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-gray-800 w-24">{wh.day}</span>
                  
                  <div className="flex items-center gap-2">
                    <input 
                      type="text" 
                      value={wh.open} 
                      disabled={wh.isClosed}
                      onChange={(e) => {
                        const updated = [...portfolio.workingHours];
                        updated[idx].open = e.target.value;
                        updateField("workingHours", updated);
                      }}
                      className="w-24 border border-gray-200 rounded-lg px-2 py-1 text-xs text-center font-bold bg-white disabled:bg-gray-100"
                    />
                    <span className="text-xs text-gray-400">to</span>
                    <input 
                      type="text" 
                      value={wh.close} 
                      disabled={wh.isClosed}
                      onChange={(e) => {
                        const updated = [...portfolio.workingHours];
                        updated[idx].close = e.target.value;
                        updateField("workingHours", updated);
                      }}
                      className="w-24 border border-gray-200 rounded-lg px-2 py-1 text-xs text-center font-bold bg-white disabled:bg-gray-100"
                    />
                  </div>

                  <button 
                    onClick={() => {
                      const updated = [...portfolio.workingHours];
                      updated[idx].isClosed = !updated[idx].isClosed;
                      updateField("workingHours", updated);
                    }}
                    className={`text-[10px] font-extrabold px-2 py-1 rounded-md transition-colors ${wh.isClosed ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"}`}
                  >
                    {wh.isClosed ? "CLOSED" : "OPEN"}
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* Tab 3: Specialities, USPs & Certifications */}
      {activeTab === "specialities" && (
        <div className="flex flex-col gap-6 animate-in fade-in duration-300">
          
          <div className="bg-white rounded-3xl border border-gray-200 p-6 md:p-8 shadow-sm flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">Company Specialities & Core Strengths</h2>
                <p className="text-sm text-gray-500">Showcase what your business does best (e.g. Custom Liquid Gaming Rigs, Chip-level Repairs, B2B Supply).</p>
              </div>
              <Button onClick={addSpeciality} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs h-10 px-4 flex items-center gap-2">
                <Plus className="w-4 h-4" /> Add Speciality Card
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {portfolio.specialities.map((spec, idx) => (
                <div key={spec.id || `spec-${idx}`} className="p-5 rounded-2xl border border-gray-200 bg-gradient-to-br from-gray-50/80 to-white flex flex-col gap-3 relative shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-md border border-indigo-100">
                      Speciality #{idx + 1}
                    </span>
                    <button onClick={() => removeSpeciality(spec.id)} className="text-gray-400 hover:text-red-600 p-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Speciality Title</label>
                    <input 
                      type="text" 
                      value={spec.title} 
                      onChange={(e) => {
                        const updated = [...portfolio.specialities];
                        updated[idx].title = e.target.value;
                        updateField("specialities", updated);
                      }}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-bold text-gray-900 outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Badge Tag</label>
                    <input 
                      type="text" 
                      value={spec.tag || ""} 
                      onChange={(e) => {
                        const updated = [...portfolio.specialities];
                        updated[idx].tag = e.target.value;
                        updateField("specialities", updated);
                      }}
                      className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-xs text-indigo-600 font-semibold outline-none focus:border-indigo-500"
                      placeholder="e.g. Signature Specialty / Authorized Hub"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Detailed Description</label>
                    <textarea 
                      rows={2} 
                      value={spec.description} 
                      onChange={(e) => {
                        const updated = [...portfolio.specialities];
                        updated[idx].description = e.target.value;
                        updateField("specialities", updated);
                      }}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-700 outline-none focus:border-indigo-500 resize-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Certifications & Badges */}
          <div className="bg-white rounded-3xl border border-gray-200 p-6 md:p-8 shadow-sm flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Official Certifications & Brand Authorizations</h3>
                <p className="text-xs text-gray-500">List official distributor credentials, ISO ratings, or brand partnership awards.</p>
              </div>
              <Button onClick={addCertification} variant="outline" className="text-xs font-bold h-9 rounded-xl border-gray-300">
                <Plus className="w-3.5 h-3.5 mr-1" /> Add Certification
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {portfolio.certifications.map((cert, i) => (
                <div key={`cert-${i}`} className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5">
                  <Award className="w-4 h-4 text-amber-600 shrink-0" />
                  <input 
                    type="text" 
                    value={cert} 
                    onChange={(e) => {
                      const updated = [...portfolio.certifications];
                      updated[i] = e.target.value;
                      updateField("certifications", updated);
                    }}
                    className="w-full bg-transparent text-xs font-bold text-gray-800 outline-none"
                  />
                  <button onClick={() => removeCertification(i)} className="text-gray-400 hover:text-red-500">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* Tab 4: Products Catalog Showcase */}
      {activeTab === "products" && (
        <div className="bg-white rounded-3xl border border-gray-200 p-6 md:p-8 shadow-sm flex flex-col gap-6 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Live Catalog & Products Showcase</h2>
              <p className="text-sm text-gray-500">These active offerings will be presented directly on your public company portfolio with inquiry triggers.</p>
            </div>
            <Link href="/dashboard/catalog/add">
              <Button className="bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-xl font-bold text-xs h-10 px-4 flex items-center gap-2">
                <Plus className="w-4 h-4" /> Add New Product to Catalog
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {catalogProducts.map((prod, idx) => (
              <div key={prod.id || `prod-${idx}`} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
                <div className="h-44 bg-gray-50 relative overflow-hidden flex items-center justify-center p-3">
                  <img src={prod.image} alt={prod.name} className="w-full h-full object-contain" />
                  <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-extrabold text-gray-700 shadow-sm border border-gray-100">
                    {prod.category || "Electronics"}
                  </span>
                  <span className={`absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    prod.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                  }`}>
                    {prod.status}
                  </span>
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm mb-1.5 line-clamp-1">{prod.name}</h3>
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="text-lg font-black text-gray-900">{prod.price}</span>
                      <span className="text-xs text-gray-500 font-medium">{prod.stock}</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-indigo-600 font-bold">
                    <span>AI Score: {prod.aiVisibility}%</span>
                    <span className="text-gray-400 font-normal">Showcased</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Customer Reviews & Ratings */}
      {activeTab === "reviews" && (
        <div className="bg-white rounded-3xl border border-gray-200 p-6 md:p-8 shadow-sm flex flex-col gap-6 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-xl font-bold text-gray-900">Customer Testimonials & Reviews</h2>
                <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded-full text-xs font-black flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                  {portfolio.rating} Rating ({portfolio.totalReviews} Total)
                </span>
              </div>
              <p className="text-sm text-gray-500">Manage client reviews that build high trust on your company portfolio.</p>
            </div>
            <Button onClick={addReview} className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-xs h-10 px-4 flex items-center gap-2 shadow-sm">
              <Plus className="w-4 h-4" /> Add Testimonial Review
            </Button>
          </div>

          {/* Rating Summary Config */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-amber-50/40 rounded-2xl border border-amber-100/60 max-w-xl">
            <div>
              <label className="block text-[11px] font-bold text-amber-900 uppercase mb-1">Average Star Rating (out of 5)</label>
              <input 
                type="number" 
                step="0.1" 
                min="1" 
                max="5" 
                value={portfolio.rating} 
                onChange={(e) => updateField("rating", parseFloat(e.target.value) || 5.0)}
                className="w-full bg-white border border-amber-200 rounded-xl px-3 py-2 text-sm font-black text-amber-900 outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-amber-900 uppercase mb-1">Total Reviews Count</label>
              <input 
                type="number" 
                value={portfolio.totalReviews} 
                onChange={(e) => updateField("totalReviews", parseInt(e.target.value) || 0)}
                className="w-full bg-white border border-amber-200 rounded-xl px-3 py-2 text-sm font-black text-amber-900 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {portfolio.reviews.map((rev, idx) => (
              <div key={rev.id || `rev-${idx}`} className="p-5 rounded-2xl border border-gray-200 bg-white flex flex-col justify-between shadow-sm relative group">
                <button onClick={() => removeReview(rev.id)} className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>

                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <img src={rev.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&q=80"} alt={rev.author} className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                    <div>
                      <input 
                        type="text" 
                        value={rev.author} 
                        onChange={(e) => {
                          const updated = [...portfolio.reviews];
                          updated[idx].author = e.target.value;
                          updateField("reviews", updated);
                        }}
                        className="font-bold text-gray-900 text-sm outline-none border-b border-transparent focus:border-indigo-400 w-full"
                        placeholder="Client Name"
                      />
                      <input 
                        type="text" 
                        value={rev.role || ""} 
                        onChange={(e) => {
                          const updated = [...portfolio.reviews];
                          updated[idx].role = e.target.value;
                          updateField("reviews", updated);
                        }}
                        className="text-xs text-gray-500 outline-none border-b border-transparent focus:border-indigo-400 w-full"
                        placeholder="Role / Company"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-amber-400">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className={`w-4 h-4 ${star <= rev.rating ? "fill-amber-400 text-amber-400" : "text-gray-200"}`} />
                    ))}
                  </div>

                  <textarea 
                    rows={3} 
                    value={rev.comment} 
                    onChange={(e) => {
                      const updated = [...portfolio.reviews];
                      updated[idx].comment = e.target.value;
                      updateField("reviews", updated);
                    }}
                    className="w-full text-xs text-gray-700 bg-gray-50 border border-gray-200 rounded-lg p-2.5 outline-none resize-none focus:bg-white focus:border-indigo-400"
                    placeholder="Review comment text..."
                  />
                </div>

                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
                  <span className="text-emerald-600 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Verified Buyer
                  </span>
                  <span>{rev.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 6: Showroom & Gallery */}
      {activeTab === "gallery" && (
        <div className="bg-white rounded-3xl border border-gray-200 p-6 md:p-8 shadow-sm flex flex-col gap-6 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Showroom, Workshop & Project Photos</h2>
              <p className="text-sm text-gray-500">Upload and showcase photos of your store, facility, builds, and team.</p>
            </div>
            <Button onClick={addGalleryImage} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs h-10 px-4 flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add Photo
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {portfolio.gallery.map((item, idx) => (
              <div key={item.id || `gal-${idx}`} className="bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden flex flex-col group shadow-sm">
                <div className="h-44 relative bg-gray-200 overflow-hidden">
                  <img src={item.url} alt={item.caption} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  <button onClick={() => removeGalleryImage(item.id)} className="absolute top-3 right-3 bg-red-600 text-white p-1.5 rounded-full opacity-90 hover:opacity-100 shadow-md">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="p-4 flex flex-col gap-2">
                  <input 
                    type="text" 
                    value={item.caption} 
                    onChange={(e) => {
                      const updated = [...portfolio.gallery];
                      updated[idx].caption = e.target.value;
                      updateField("gallery", updated);
                    }}
                    className="text-xs font-bold text-gray-900 bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 outline-none"
                    placeholder="Photo caption"
                  />
                  <input 
                    type="text" 
                    value={item.url} 
                    onChange={(e) => {
                      const updated = [...portfolio.gallery];
                      updated[idx].url = e.target.value;
                      updateField("gallery", updated);
                    }}
                    className="text-[11px] text-gray-500 bg-white border border-gray-200 rounded-lg px-2.5 py-1 outline-none font-mono"
                    placeholder="Image URL"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 7: FAQs & Policies */}
      {activeTab === "faqs" && (
        <div className="bg-white rounded-3xl border border-gray-200 p-6 md:p-8 shadow-sm flex flex-col gap-6 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Frequently Asked Questions</h2>
              <p className="text-sm text-gray-500">Answer buyer queries in advance regarding warranty, shipping, and custom requests.</p>
            </div>
            <Button onClick={addFAQ} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs h-10 px-4 flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add FAQ Item
            </Button>
          </div>

          <div className="flex flex-col gap-4">
            {portfolio.faqs.map((faq, idx) => (
              <div key={faq.id || `faq-${idx}`} className="p-5 rounded-2xl border border-gray-200 bg-gray-50/50 flex flex-col gap-3 relative">
                <button onClick={() => removeFAQ(faq.id)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500">
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="pr-8">
                  <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Question</label>
                  <input 
                    type="text" 
                    value={faq.question} 
                    onChange={(e) => {
                      const updated = [...portfolio.faqs];
                      updated[idx].question = e.target.value;
                      updateField("faqs", updated);
                    }}
                    className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm font-bold text-gray-900 outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Answer</label>
                  <textarea 
                    rows={2} 
                    value={faq.answer} 
                    onChange={(e) => {
                      const updated = [...portfolio.faqs];
                      updated[idx].answer = e.target.value;
                      updateField("faqs", updated);
                    }}
                    className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-gray-700 outline-none focus:border-indigo-500 resize-none"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 8: Live Preview Simulation */}
      {activeTab === "preview" && (
        <div className="flex flex-col gap-6 animate-in fade-in duration-300">
          
          <div className="flex items-center justify-between bg-white rounded-2xl p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Preview Viewport:</span>
              <div className="flex bg-gray-100 p-1 rounded-xl">
                <button 
                  onClick={() => setPreviewDevice("desktop")} 
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${previewDevice === "desktop" ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500"}`}
                >
                  Desktop View
                </button>
                <button 
                  onClick={() => setPreviewDevice("mobile")} 
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${previewDevice === "mobile" ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500"}`}
                >
                  Mobile View
                </button>
              </div>
            </div>

            <Link href={publicUrl} target="_blank">
              <Button className="bg-[#4F46E5] text-white rounded-xl text-xs font-bold h-9 px-4 flex items-center gap-2">
                Open in Full Window <ExternalLink className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>

          <div className={`mx-auto transition-all duration-300 ${previewDevice === "mobile" ? "max-w-[420px] border-8 border-gray-800 rounded-[40px] overflow-hidden shadow-2xl" : "w-full"}`}>
            <iframe 
              src={publicUrl} 
              className={`w-full bg-white border border-gray-200 rounded-2xl shadow-md ${previewDevice === "mobile" ? "h-[780px]" : "h-[850px]"}`} 
              title="Portfolio Live Preview"
            />
          </div>

        </div>
      )}

    </div>
  );
}

function TabButton({ active, onClick, icon, label, highlight = false }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string; highlight?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${
        active 
          ? "bg-gray-900 text-white shadow-sm" 
          : highlight 
            ? "bg-indigo-50 text-indigo-700 hover:bg-indigo-100" 
            : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
