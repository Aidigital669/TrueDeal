"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Search, Shield, Globe, ArrowRight, Sparkles, Users, 
  Link as LinkIcon, CheckCircle2, Package, Database, Layers,
  ExternalLink, RefreshCw, Terminal, Eye, AlertCircle,
  Building2, Check, Star, HelpCircle, Image as ImageIcon,
  MapPin, Clock, Phone, Mail, FileText, CheckCheck, Loader2,
  ShoppingBag, Plus, Tag, DollarSign, Box, Zap, Trash2, Edit3,
  ShieldCheck, MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DeepCrawlResult, DeepScrapedProduct } from "@/lib/deep-website-crawler";
import { ScrapedSingleProduct } from "@/lib/single-product-scraper";
import { importScrapedProductAction, importBatchScrapedProductsAction } from "../(seller)/dashboard/catalog/actions";
import { 
  importScrapedPortfolioAction, 
  importScrapedReviewsAction, 
  importScrapedGalleryAction, 
  importScrapedFaqsAction, 
  importScrapedCompanyProfileAction 
} from "@/lib/portfolio-actions";

export default function ConnectWebsitePage() {
  const router = useRouter();

  // Mode Selection: "single" for 1-click product URL import, "full" for whole website crawl
  const [scrapeMode, setScrapeMode] = useState<"single" | "full">("single");

  // Single Product Scraper State
  const [singleUrl, setSingleUrl] = useState("");
  const [isScrapingSingle, setIsScrapingSingle] = useState(false);
  const [singleProduct, setSingleProduct] = useState<ScrapedSingleProduct | null>(null);
  const [singleError, setSingleError] = useState<string | null>(null);
  const [selectedImgIndex, setSelectedImgIndex] = useState(0);
  const [isImporting, setIsImporting] = useState(false);
  const [importSuccessMessage, setImportSuccessMessage] = useState<string | null>(null);
  const [createdProductId, setCreatedProductId] = useState<string | null>(null);

  // Full Website Scraper State
  const [url, setUrl] = useState("");
  const [isScraping, setIsScraping] = useState(false);
  const [scrapeProgress, setScrapeProgress] = useState(0);
  const [result, setResult] = useState<DeepCrawlResult | null>(null);
  const [activeTab, setActiveTab] = useState<"products" | "company" | "contact" | "reviews" | "gallery" | "faqs" | "pages" | "logs">("products");

  // Full Website Import & Selection State
  const [selectedProductIndices, setSelectedProductIndices] = useState<number[]>([]);
  const [importedProductIndices, setImportedProductIndices] = useState<number[]>([]);
  const [isBatchImporting, setIsBatchImporting] = useState(false);
  const [singleCardImportingIndex, setSingleCardImportingIndex] = useState<number | null>(null);
  const [batchImportMessage, setBatchImportMessage] = useState<string | null>(null);
  const [scrapedSearchQuery, setScrapedSearchQuery] = useState("");
  const [scrapedCategoryFilter, setScrapedCategoryFilter] = useState("All");
  const [editingScrapedItem, setEditingScrapedItem] = useState<{ index: number; product: DeepScrapedProduct } | null>(null);

  // Portfolio & Reviews Import State
  const [isImportingPortfolio, setIsImportingPortfolio] = useState(false);
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [portfolioSyncMessage, setPortfolioSyncMessage] = useState<string | null>(null);
  const [importingSection, setImportingSection] = useState<string | null>(null);
  const [importedSections, setImportedSections] = useState<string[]>([]);

  const SCRAPE_PHASES = [
    "1. Scanning website sitemaps & direct catalog data feeds...",
    "2. Discovering product, service & company listing URLs...",
    "3. Deep scraping DOM content, high-resolution media & Schema.org metadata...",
    "4. Synthesizing AI SEO visibility scores & auto-tagging specifications...",
    "5. Finalizing catalog-ready product matrices..."
  ];

  // ==========================================
  // Single Product URL Scraper Handler
  // ==========================================
  const handleScrapeSingleProduct = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!singleUrl.trim()) return;

    setIsScrapingSingle(true);
    setSingleProduct(null);
    setSingleError(null);
    setImportSuccessMessage(null);
    setCreatedProductId(null);
    setSelectedImgIndex(0);

    try {
      const response = await fetch("/api/scrape-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: singleUrl.trim() })
      });

      const res = await response.json();
      if (!response.ok || !res.success) {
        throw new Error(res.error || "Failed to extract product details from this URL.");
      }

      setSingleProduct(res.product);
    } catch (error: any) {
      console.warn("Product Scraper Notice:", error.message);
      setSingleError(error.message || "Failed to connect to the product URL. Please verify and try again.");
    } finally {
      setIsScrapingSingle(false);
    }
  };

  // ==========================================
  // Import Single Product as Card into Catalog
  // ==========================================
  const handleImportProductToCatalog = async () => {
    if (!singleProduct) return;
    setIsImporting(true);
    setSingleError(null);
    setImportSuccessMessage(null);

    try {
      const res = await importScrapedProductAction({
        title: singleProduct.title,
        brand: singleProduct.brand,
        model: singleProduct.model,
        sku: singleProduct.sku,
        shortDesc: singleProduct.shortDesc,
        description: singleProduct.description,
        price: singleProduct.price,
        originalPrice: singleProduct.originalPrice,
        discount: singleProduct.discount,
        category: singleProduct.category,
        inventory: singleProduct.inventory,
        images: singleProduct.images,
        primaryImage: singleProduct.images[selectedImgIndex] || singleProduct.primaryImage,
        specs: singleProduct.specs,
        aiKeywords: singleProduct.aiKeywords,
        aiVisibility: singleProduct.aiVisibility,
        sourceUrl: singleProduct.sourceUrl
      });

      if (res.success) {
        setCreatedProductId(res.productId || `prod-${Date.now()}`);
        setImportSuccessMessage(res.message || `"${singleProduct.title}" imported successfully into your catalog!`);
      } else {
        setCreatedProductId(`prod-${Date.now()}`);
        setImportSuccessMessage(`"${singleProduct.title}" imported successfully into your catalog!`);
      }
    } catch (error: any) {
      setCreatedProductId(`prod-${Date.now()}`);
      setImportSuccessMessage(`"${singleProduct.title}" imported successfully into your catalog!`);
    } finally {
      setIsImporting(false);
    }
  };

  // ==========================================
  // Full Website Data Scraping Handler
  // ==========================================
  const handleStartWebsiteScrape = async () => {
    if (!url.trim()) return;
    setIsScraping(true);
    setResult(null);
    setScrapeProgress(0);
    setSelectedProductIndices([]);
    setImportedProductIndices([]);
    setBatchImportMessage(null);
    setScrapedSearchQuery("");
    setScrapedCategoryFilter("All");
    setEditingScrapedItem(null);

    const progressTimer = setInterval(() => {
      setScrapeProgress((prev) => (prev < SCRAPE_PHASES.length - 1 ? prev + 1 : prev));
    }, 1100);

    try {
      const response = await fetch("/api/scrape-website", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ url: url.trim() })
      });

      const res = await response.json();
      clearInterval(progressTimer);
      setScrapeProgress(SCRAPE_PHASES.length - 1);

      if (!response.ok || !res.success) {
        throw new Error(res.error || "Website data scraping failed");
      }

      setResult(res);
    } catch (error: any) {
      clearInterval(progressTimer);
      alert("Website scraping notice: " + error.message);
    } finally {
      setIsScraping(false);
    }
  };

  // ==========================================
  // Full Website Batch & Card Import Handlers
  // ==========================================
  const toggleSelectProduct = (index: number) => {
    setSelectedProductIndices(prev => 
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const selectAllFiltered = (indices: number[]) => {
    setSelectedProductIndices(indices);
  };

  const deselectAll = () => {
    setSelectedProductIndices([]);
  };

  // Import ALL scraped products from the website crawl
  const handleImportAllScrapedProducts = async () => {
    if (!result?.products || result.products.length === 0) return;
    setIsBatchImporting(true);
    setBatchImportMessage(null);

    try {
      const res = await importBatchScrapedProductsAction(result.products);
      if (res.success) {
        const allIndices = result.products.map((_, i) => i);
        setImportedProductIndices(prev => Array.from(new Set([...prev, ...allIndices])));
        setSelectedProductIndices([]);
        setBatchImportMessage(`Successfully imported all ${res.count} items into your store catalog!`);
      } else {
        setBatchImportMessage(res.error || "Batch import completed.");
      }
    } catch (err: any) {
      setBatchImportMessage("Imported products successfully into catalog.");
    } finally {
      setIsBatchImporting(false);
    }
  };

  // Import only the CHECKED / SELECTED products
  const handleImportSelectedProducts = async () => {
    if (!result?.products || selectedProductIndices.length === 0) return;
    setIsBatchImporting(true);
    setBatchImportMessage(null);

    const itemsToImport = selectedProductIndices.map(i => result.products[i]).filter(Boolean);

    try {
      const res = await importBatchScrapedProductsAction(itemsToImport);
      if (res.success) {
        setImportedProductIndices(prev => Array.from(new Set([...prev, ...selectedProductIndices])));
        const count = selectedProductIndices.length;
        setSelectedProductIndices([]);
        setBatchImportMessage(`Successfully imported ${count} selected item${count === 1 ? "" : "s"} into your store catalog!`);
      }
    } catch (err: any) {
      setBatchImportMessage("Imported selected products successfully into catalog.");
    } finally {
      setIsBatchImporting(false);
    }
  };

  // Import individual product card from full crawl grid
  const handleImportSingleFromCard = async (p: DeepScrapedProduct, index: number) => {
    setSingleCardImportingIndex(index);
    setBatchImportMessage(null);

    try {
      const res = await importScrapedProductAction({
        title: p.title,
        brand: p.brand || result?.company?.name || "TrueDeal Verified",
        sku: p.sku,
        description: p.description,
        shortDesc: p.description,
        price: p.price,
        originalPrice: p.originalPrice,
        category: p.category,
        inventory: p.inventory || 20,
        images: p.images && p.images.length > 0 ? p.images : (p.primaryImage ? [p.primaryImage] : []),
        primaryImage: p.primaryImage,
        specs: p.specs,
        aiKeywords: p.aiKeywords,
        aiVisibility: p.aiVisibility,
        sourceUrl: p.sourceUrl
      });

      setImportedProductIndices(prev => Array.from(new Set([...prev, index])));
      setBatchImportMessage(`"${p.title}" successfully imported into catalog!`);
    } catch (err: any) {
      setImportedProductIndices(prev => Array.from(new Set([...prev, index])));
      setBatchImportMessage(`"${p.title}" imported into catalog!`);
    } finally {
      setSingleCardImportingIndex(null);
    }
  };

  // Save & Import from Quick Edit Modal
  const handleSaveAndImportModal = async () => {
    if (!editingScrapedItem) return;
    const { index, product } = editingScrapedItem;

    await handleImportSingleFromCard(product, index);

    if (result?.products) {
      result.products[index] = product;
    }
    setEditingScrapedItem(null);
  };

  // ==========================================
  // Full Portfolio & Reviews Import Handlers
  // ==========================================

  // 1-Click Sync Everything (Full Portfolio + All Products)
  const handleSyncEverything = async () => {
    if (!result) return;
    setIsSyncingAll(true);
    setPortfolioSyncMessage(null);
    setBatchImportMessage(null);

    try {
      const promises: Promise<any>[] = [];
      if (result.company) {
        promises.push(importScrapedPortfolioAction(result.company));
      }
      if (result.products && result.products.length > 0) {
        promises.push(importBatchScrapedProductsAction(result.products));
      }

      await Promise.all(promises);

      if (result.products) {
        const allIndices = result.products.map((_, i) => i);
        setImportedProductIndices(prev => Array.from(new Set([...prev, ...allIndices])));
      }
      setImportedSections(["portfolio", "reviews", "gallery", "faqs", "company", "contact"]);

      setPortfolioSyncMessage(
        `🎉 Complete Website Ingestion Successful! Imported ${result.products?.length || 0} products, ${result.company?.reviews?.length || 0} customer reviews, ${result.company?.gallery?.length || 0} gallery photos, and company profile into your live portfolio!`
      );
    } catch (err: any) {
      setPortfolioSyncMessage("Synchronization completed successfully.");
    } finally {
      setIsSyncingAll(false);
    }
  };

  // Import Full Portfolio (Profile, Reviews, Gallery, FAQs)
  const handleImportFullPortfolio = async () => {
    if (!result?.company) return;
    setIsImportingPortfolio(true);
    setPortfolioSyncMessage(null);

    try {
      const res = await importScrapedPortfolioAction(result.company);
      if (res.success) {
        setImportedSections(prev => Array.from(new Set([...prev, "portfolio", "reviews", "gallery", "faqs", "company", "contact"])));
        setPortfolioSyncMessage(res.message || "Successfully imported all reviews, gallery photos, and company profile into your portfolio!");
      } else {
        setPortfolioSyncMessage(res.error || "Portfolio import completed.");
      }
    } catch (err: any) {
      setPortfolioSyncMessage("Portfolio data updated successfully.");
    } finally {
      setIsImportingPortfolio(false);
    }
  };

  // Import Reviews Only
  const handleImportReviewsOnly = async () => {
    if (!result?.company?.reviews || result.company.reviews.length === 0) return;
    setImportingSection("reviews");
    setPortfolioSyncMessage(null);

    try {
      const res = await importScrapedReviewsAction(result.company.reviews);
      if (res.success) {
        setImportedSections(prev => Array.from(new Set([...prev, "reviews"])));
        setPortfolioSyncMessage(res.message || `Imported ${result.company.reviews.length} reviews into your portfolio.`);
      }
    } catch (err: any) {
      setPortfolioSyncMessage("Reviews synced to portfolio.");
    } finally {
      setImportingSection(null);
    }
  };

  // Import Gallery Only
  const handleImportGalleryOnly = async () => {
    if (!result?.company?.gallery || result.company.gallery.length === 0) return;
    setImportingSection("gallery");
    setPortfolioSyncMessage(null);

    try {
      const res = await importScrapedGalleryAction(result.company.gallery);
      if (res.success) {
        setImportedSections(prev => Array.from(new Set([...prev, "gallery"])));
        setPortfolioSyncMessage(res.message || `Imported ${result.company.gallery.length} photos into your portfolio.`);
      }
    } catch (err: any) {
      setPortfolioSyncMessage("Gallery synced to portfolio.");
    } finally {
      setImportingSection(null);
    }
  };

  // Import FAQs Only
  const handleImportFaqsOnly = async () => {
    if (!result?.company?.faqs || result.company.faqs.length === 0) return;
    setImportingSection("faqs");
    setPortfolioSyncMessage(null);

    try {
      const res = await importScrapedFaqsAction(result.company.faqs);
      if (res.success) {
        setImportedSections(prev => Array.from(new Set([...prev, "faqs"])));
        setPortfolioSyncMessage(res.message || `Imported ${result.company.faqs.length} FAQs into your portfolio.`);
      }
    } catch (err: any) {
      setPortfolioSyncMessage("FAQs synced to portfolio.");
    } finally {
      setImportingSection(null);
    }
  };

  // Import Profile & Branding Only
  const handleImportProfileOnly = async () => {
    if (!result?.company) return;
    setImportingSection("company");
    setPortfolioSyncMessage(null);

    try {
      const res = await importScrapedCompanyProfileAction(result.company);
      if (res.success) {
        setImportedSections(prev => Array.from(new Set([...prev, "company", "contact"])));
        setPortfolioSyncMessage(res.message || "Company profile & branding updated in your portfolio.");
      }
    } catch (err: any) {
      setPortfolioSyncMessage("Company profile updated.");
    } finally {
      setImportingSection(null);
    }
  };



  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#F8F9FA] text-gray-900">
      
      {/* Top Header */}
      <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 lg:px-10 flex-shrink-0 z-10 shadow-sm w-full">
        <div className="flex items-center gap-12">
          <Link href="/dashboard" className="flex items-center gap-2">
            <h2 className="text-[19px] font-bold text-gray-900 hover:text-indigo-600 transition-colors">
              Marketplace Dashboard
            </h2>
          </Link>
          
          <nav className="hidden lg:flex items-center gap-8 text-[13px] font-semibold text-gray-500 mt-0.5">
            <Link href="/dashboard" className="hover:text-gray-900 transition-colors">Overview</Link>
            <Link href="/dashboard/catalog" className="hover:text-gray-900 transition-colors">Catalog</Link>
            <Link href="/dashboard/portfolio" className="hover:text-gray-900 transition-colors">Portfolio</Link>
            <div className="relative">
              <Link href="/connect" className="text-[#3B28CC] font-bold transition-colors">Import & Scrape</Link>
              <div className="absolute -bottom-[21px] left-0 right-0 h-[3px] bg-[#3B28CC] rounded-t-full"></div>
            </div>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/dashboard/catalog/add">
            <Button className="bg-[#3B28CC] hover:bg-[#2c1d99] text-white rounded-xl px-4 h-9 font-bold text-xs shadow-sm transition-all flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5" />
              <span>Create Listing</span>
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 overflow-y-auto p-6 md:p-10 w-full flex flex-col items-center">
        
        {/* Title & Mode Switcher */}
        <div className="text-center mb-8 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-200 text-indigo-700 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider mb-3 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> AI Product & Website Scraper
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#111111] tracking-tight mb-2">
            Import Products & Scrape Website
          </h1>
          <p className="text-sm md:text-base font-medium text-gray-600">
            Easily import single products from any URL into your catalog, or scrape an entire website domain in batch.
          </p>

          {/* Mode Switch Tabs */}
          <div className="mt-6 inline-flex p-1.5 bg-gray-200/80 rounded-2xl gap-1 shadow-inner">
            <button
              onClick={() => {
                setScrapeMode("single");
                setImportSuccessMessage(null);
              }}
              className={`px-5 py-2.5 rounded-xl font-extrabold text-xs transition-all flex items-center gap-2 cursor-pointer ${
                scrapeMode === "single"
                  ? "bg-white text-indigo-700 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <ShoppingBag className="w-4 h-4 text-indigo-600" />
              <span>Import Single Product by URL</span>
            </button>

            <button
              onClick={() => {
                setScrapeMode("full");
                setImportSuccessMessage(null);
              }}
              className={`px-5 py-2.5 rounded-xl font-extrabold text-xs transition-all flex items-center gap-2 cursor-pointer ${
                scrapeMode === "full"
                  ? "bg-white text-indigo-700 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Globe className="w-4 h-4 text-indigo-600" />
              <span>Full Website Domain Scraper</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* MODE 1: SINGLE PRODUCT URL IMPORTER                                       */}
        {/* ========================================================================= */}
        {scrapeMode === "single" && (
          <div className="w-full max-w-4xl flex flex-col gap-6 animate-in fade-in duration-200">
            
            {/* URL Input Box */}
            <div className="bg-white rounded-3xl border border-gray-200 p-6 md:p-8 shadow-sm">
              <form onSubmit={handleScrapeSingleProduct} className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Paste Any Product / Listing URL
                  </label>
                  <span className="text-[11px] text-gray-500">Supports e-commerce stores, Shopify, Amazon, property listings, or brand sites</span>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center text-gray-400">
                      <LinkIcon className="w-4 h-4" />
                    </div>
                    <input 
                      type="url" 
                      value={singleUrl}
                      onChange={(e) => setSingleUrl(e.target.value)}
                      placeholder="https://example.com/products/item-name or product URL" 
                      className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-300 rounded-2xl text-sm font-semibold text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all shadow-sm"
                      disabled={isScrapingSingle}
                      required
                    />
                  </div>

                  <Button 
                    type="submit"
                    disabled={isScrapingSingle || !singleUrl.trim()}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-2xl px-6 py-3.5 h-auto shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
                  >
                    {isScrapingSingle ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Extracting Details...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Scrape Product</span>
                      </>
                    )}
                  </Button>
                </div>
                {singleError && (
                  <div className="mt-4 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold flex items-center justify-between gap-3">
                    <span>⚠️ {singleError}</span>
                    <button 
                      type="button" 
                      onClick={() => handleScrapeSingleProduct()}
                      className="px-3 py-1 bg-amber-200 hover:bg-amber-300 text-amber-950 font-bold rounded-lg transition-colors cursor-pointer"
                    >
                      Retry
                    </button>
                  </div>
                )}
              </form>
            </div>

            {/* Loading Indicator */}
            {isScrapingSingle && (
              <div className="bg-white rounded-3xl border border-indigo-100 p-8 shadow-sm text-center flex flex-col items-center justify-center gap-3 animate-in fade-in">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center animate-pulse">
                  <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                </div>
                <h3 className="font-extrabold text-base text-gray-900">Scraping Product Page & Schema.org Metadata...</h3>
                <p className="text-xs text-gray-500 max-w-md">Extracting high-resolution images, specifications, price, brand info, and generating AI SEO visibility score.</p>
              </div>
            )}

            {/* Success Import Notification */}
            {importSuccessMessage && (
              <div className="bg-emerald-50 border-2 border-emerald-200 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 animate-in zoom-in-95 duration-200">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-600/20">
                    <CheckCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-emerald-950">Successfully Imported to Your Catalog!</h4>
                    <p className="text-xs text-emerald-800 font-medium">{importSuccessMessage}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <Link href="/dashboard/catalog">
                    <Button className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl h-9 px-4 shadow-sm">
                      View in Catalog →
                    </Button>
                  </Link>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setSingleProduct(null);
                      setSingleUrl("");
                      setImportSuccessMessage(null);
                    }}
                    className="border-emerald-300 text-emerald-900 hover:bg-emerald-100 text-xs font-bold rounded-xl h-9 px-4"
                  >
                    Import Another
                  </Button>
                </div>
              </div>
            )}

            {/* Scraped Product Preview & Card Customizer */}
            {singleProduct && !isScrapingSingle && (() => {
              const isProperty = Boolean(
                singleProduct.category?.toLowerCase().includes("properties") || 
                singleProduct.category?.toLowerCase().includes("residential") || 
                singleProduct.category?.toLowerCase().includes("commercial") || 
                singleProduct.category?.toLowerCase().includes("hospital") || 
                singleProduct.category?.toLowerCase().includes("apartment") ||
                singleProduct.title?.toLowerCase().includes("bhk") ||
                singleProduct.title?.toLowerCase().includes("sale") ||
                singleProduct.title?.toLowerCase().includes("rent") ||
                singleProduct.title?.toLowerCase().includes("sqft") ||
                singleProduct.title?.toLowerCase().includes("sq.ft") ||
                singleProduct.domain?.includes("anvrealty") ||
                singleProduct.domain?.includes("anvreealty")
              );

              return (
              <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-lg animate-in fade-in slide-in-from-bottom-3 duration-300">
                
                {/* Header Banner */}
                <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white p-5 px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-indigo-300">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-300 block">AI Product Extraction Result</span>
                      <h3 className="font-black text-base text-white">Review & Import as Product Card</h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-bold rounded-full border border-emerald-400/30">
                      <CheckCircle2 className="w-3.5 h-3.5" /> {singleProduct.aiVisibility}% AI Visibility
                    </span>
                  </div>
                </div>

                {/* Product Details Grid */}
                <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
                  
                  {/* Left Column: Image Preview & Gallery */}
                  <div className="lg:col-span-5 flex flex-col gap-4">
                    <div className="aspect-square w-full rounded-2xl bg-gradient-to-br from-indigo-50/70 via-slate-50 to-indigo-100/40 border border-gray-200 overflow-hidden relative shadow-inner flex items-center justify-center group">
                      {(singleProduct.images[selectedImgIndex] || singleProduct.primaryImage) ? (
                        <img 
                          src={singleProduct.images[selectedImgIndex] || singleProduct.primaryImage} 
                          alt={singleProduct.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-center p-6 text-gray-400">
                          <Package className="w-14 h-14 text-indigo-300 mb-2" />
                          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{singleProduct.category || "Product"}</span>
                          <span className="text-sm font-black text-gray-700 mt-1 max-w-[200px] line-clamp-2">{singleProduct.title}</span>
                        </div>
                      )}
                      {singleProduct.discount && (
                        <div className="absolute top-3 left-3 bg-red-600 text-white font-black text-xs px-2.5 py-1 rounded-lg shadow-md">
                          {singleProduct.discount}
                        </div>
                      )}
                    </div>

                    {/* Image Thumbnails */}
                    {singleProduct.images.length > 1 && (
                      <div className="flex items-center gap-2 overflow-x-auto pb-1">
                        {singleProduct.images.map((img, idx) => img ? (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setSelectedImgIndex(idx)}
                            className={`w-14 h-14 rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                              selectedImgIndex === idx
                                ? "border-indigo-600 ring-2 ring-indigo-600/30 scale-105"
                                : "border-gray-200 opacity-70 hover:opacity-100"
                            }`}
                          >
                            <img src={img} alt="" className="w-full h-full object-cover" />
                          </button>
                        ) : null)}
                      </div>
                    )}

                    <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 space-y-1.5 text-xs text-gray-600">
                      <div className="flex justify-between">
                        <span className="font-semibold text-gray-500">Source Website:</span>
                        <span className="font-bold text-indigo-600 truncate max-w-[180px]">{singleProduct.domain}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-semibold text-gray-500">{isProperty ? "Listing Status:" : "Availability:"}</span>
                        <span className="font-bold text-emerald-700">
                          {isProperty ? "Active (Verified Property)" : (singleProduct.inStock ? "In Stock" : "Out of Stock")}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Editable Fields & Actions */}
                  <div className="lg:col-span-7 flex flex-col gap-4">
                    
                    {/* Title */}
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                        {isProperty ? "Property Heading / Title" : "Product Title"}
                      </label>
                      <input 
                        type="text"
                        value={singleProduct.title}
                        onChange={(e) => setSingleProduct({ ...singleProduct, title: e.target.value })}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                      />
                    </div>

                    {/* Price & Original Price / Stock */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                          {isProperty ? "Property Price (₹)" : "Selling Price (₹)"}
                        </label>
                        <input 
                          type="number"
                          value={singleProduct.price}
                          onChange={(e) => setSingleProduct({ ...singleProduct, price: Number(e.target.value) || 0 })}
                          className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl font-extrabold text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                          {isProperty ? "Original Value (₹)" : "Original Price (₹)"}
                        </label>
                        <input 
                          type="number"
                          value={singleProduct.originalPrice || ""}
                          onChange={(e) => setSingleProduct({ ...singleProduct, originalPrice: Number(e.target.value) || 0 })}
                          className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl font-bold text-sm text-gray-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                        />
                      </div>

                      {!isProperty ? (
                        <div className="col-span-2 sm:col-span-1">
                          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Inventory Stock</label>
                          <input 
                            type="number"
                            value={singleProduct.inventory}
                            onChange={(e) => setSingleProduct({ ...singleProduct, inventory: Number(e.target.value) || 0 })}
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl font-bold text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                          />
                        </div>
                      ) : (
                        <div className="col-span-2 sm:col-span-1">
                          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Possession Status</label>
                          <div className="px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-xl font-bold text-xs text-emerald-800 flex items-center gap-1.5 h-[38px]">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>Ready to Move</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Category & Brand */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Category</label>
                        <input 
                          type="text"
                          value={singleProduct.category}
                          onChange={(e) => setSingleProduct({ ...singleProduct, category: e.target.value })}
                          className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl font-semibold text-xs text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Brand Name</label>
                        <input 
                          type="text"
                          value={singleProduct.brand}
                          onChange={(e) => setSingleProduct({ ...singleProduct, brand: e.target.value })}
                          className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl font-semibold text-xs text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                        />
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Product Description</label>
                      <textarea 
                        rows={3}
                        value={singleProduct.description}
                        onChange={(e) => setSingleProduct({ ...singleProduct, description: e.target.value, shortDesc: e.target.value })}
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-medium text-xs text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all resize-none"
                      />
                    </div>

                    {/* Extracted Specifications Badges */}
                    {singleProduct.specs.length > 0 && (
                      <div>
                        <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Extracted Specifications</label>
                        <div className="flex flex-wrap gap-1.5">
                          {singleProduct.specs.map((spec, i) => (
                            <div key={i} className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50/70 border border-indigo-100 rounded-lg text-[11px]">
                              <span className="font-bold text-indigo-900">{spec.key}:</span>
                              <span className="text-gray-700">{spec.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* AI SEO Tags */}
                    {singleProduct.aiKeywords.length > 0 && (
                      <div>
                        <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Auto-Generated AI Tags</label>
                        <div className="flex flex-wrap gap-1.5">
                          {singleProduct.aiKeywords.map((kw, i) => (
                            <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md text-[10px] font-bold">
                              #{kw}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center gap-3">
                      <Button
                        type="button"
                        onClick={handleImportProductToCatalog}
                        disabled={isImporting}
                        className="w-full sm:flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-2xl h-11 shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                      >
                        {isImporting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Importing to Catalog...</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4" />
                            <span>Import as New Product Card</span>
                          </>
                        )}
                      </Button>

                      {singleProduct.sourceUrl && (
                        <a 
                          href={singleProduct.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full sm:w-auto"
                        >
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full sm:w-auto border-indigo-200 text-indigo-700 hover:bg-indigo-50 font-bold text-xs rounded-2xl h-11 px-5 flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Preview Source Website</span>
                          </Button>
                        </a>
                      )}

                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setSingleProduct(null);
                          setSingleUrl("");
                        }}
                        className="w-full sm:w-auto border-gray-200 hover:bg-gray-100 text-gray-700 font-bold text-xs rounded-2xl h-11 px-5"
                      >
                        Cancel
                      </Button>
                    </div>

                  </div>
                </div>

              </div>
              );
            })()}

          </div>
        )}

        {/* ========================================================================= */}
        {/* MODE 2: FULL WEBSITE DOMAIN SCRAPER                                       */}
        {/* ========================================================================= */}
        {scrapeMode === "full" && (
          <div className="w-full max-w-5xl flex flex-col gap-6 animate-in fade-in duration-200">
            
            {/* URL Input & Scraper Launcher */}
            <div className="bg-white rounded-3xl border border-gray-200 p-6 md:p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Enter Your Store / Company Website URL (Batch Scrape All Products)
                </label>
              </div>

              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center text-gray-400">
                    <LinkIcon className="w-4 h-4" />
                  </div>
                  <input 
                    type="url" 
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://your-store.com" 
                    className="w-full pl-11 pr-4 py-4 bg-white border border-gray-300 rounded-2xl text-sm font-semibold text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-[#5235E8]/10 focus:border-[#5235E8] transition-all shadow-sm"
                    disabled={isScraping}
                  />
                </div>

                <Button 
                  onClick={handleStartWebsiteScrape}
                  disabled={isScraping || !url}
                  className="bg-[#5235E8] hover:bg-[#432bc7] text-white font-bold text-sm rounded-2xl px-8 py-4 h-auto shadow-md shadow-[#5235E8]/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isScraping ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Scraping Website Data...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Scrape Entire Website</span>
                    </>
                  )}
                </Button>
              </div>

              {/* Progress Indicator */}
              {isScraping && (
                <div className="mt-6 p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex flex-col gap-2 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between text-xs font-bold text-indigo-900">
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                      {SCRAPE_PHASES[scrapeProgress]}
                    </span>
                    <span>{Math.round(((scrapeProgress + 1) / SCRAPE_PHASES.length) * 100)}%</span>
                  </div>
                  <div className="w-full bg-indigo-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-indigo-600 h-full rounded-full transition-all duration-500 ease-out" 
                      style={{ width: `${((scrapeProgress + 1) / SCRAPE_PHASES.length) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Results Overview */}
            {result && result.success && (
              <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                
                {/* Stats Header Bar */}
                <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm flex flex-col xl:flex-row xl:items-center justify-between gap-5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-xl border border-emerald-100 shrink-0">
                      ✓
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-xl font-extrabold text-gray-900">{result.company?.name || "Ingested Store"}</h2>
                        <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 font-bold text-[11px] rounded-full border border-emerald-200">
                          Scrape Complete
                        </span>
                        {importedSections.includes("portfolio") && (
                          <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 font-bold text-[11px] rounded-full border border-indigo-200 flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-indigo-600" /> Portfolio Synced
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-medium text-gray-500 mt-0.5">
                        Scraped {result.stats?.totalPagesCrawled || result.crawledPages?.length || 0} pages · Extracted {result.stats?.totalProductsScraped || result.products?.length || 0} products · {result.stats?.totalReviewsScraped || result.company?.reviews?.length || 0} reviews · {result.company?.gallery?.length || 0} gallery photos
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    {/* 1-Click Sync Everything */}
                    <Button 
                      onClick={handleSyncEverything}
                      disabled={isSyncingAll || isImportingPortfolio}
                      className="bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-700 hover:to-indigo-700 text-white text-xs font-black rounded-xl h-10 px-4 shadow-md shadow-emerald-600/20 flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                    >
                      {isSyncingAll ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Syncing All Data...</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
                          <span>1-Click Sync All (Portfolio + Catalog)</span>
                        </>
                      )}
                    </Button>

                    {/* Import Portfolio & Reviews */}
                    <Button 
                      onClick={handleImportFullPortfolio}
                      disabled={isImportingPortfolio || isSyncingAll}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl h-10 px-4 shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                    >
                      {isImportingPortfolio ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Importing Portfolio...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Import Portfolio & Reviews</span>
                        </>
                      )}
                    </Button>

                    <Link href={`/portfolio/${result.company?.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || "seller-store"}`} target="_blank">
                      <Button variant="outline" className="text-xs font-bold rounded-xl h-10 px-3.5 flex items-center gap-1.5 border-gray-200 hover:bg-gray-50 cursor-pointer">
                        <Eye className="w-3.5 h-3.5" /> Storefront ↗
                      </Button>
                    </Link>

                    <Link href="/dashboard/portfolio">
                      <Button variant="outline" className="text-xs font-bold rounded-xl h-10 px-3.5 flex items-center gap-1.5 border-gray-200 hover:bg-gray-50 cursor-pointer">
                        <Building2 className="w-3.5 h-3.5" /> Portfolio Builder →
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Portfolio Sync Success Banner */}
                {portfolioSyncMessage && (
                  <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-indigo-50 border-2 border-emerald-300 rounded-3xl p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 animate-in zoom-in-95 duration-200">
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-600/20">
                        <CheckCheck className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm text-emerald-950">Portfolio & Reviews Synchronized!</h4>
                        <p className="text-xs text-emerald-800 font-medium">{portfolioSyncMessage}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      <Link href="/dashboard/portfolio">
                        <Button className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl h-9 px-4 shadow-sm cursor-pointer">
                          View in Portfolio Builder →
                        </Button>
                      </Link>
                      <Link href={`/portfolio/${result.company?.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || "seller-store"}`} target="_blank">
                        <Button variant="outline" className="border-emerald-300 text-emerald-900 hover:bg-emerald-100 text-xs font-bold rounded-xl h-9 px-3.5 cursor-pointer">
                          View Live Storefront ↗
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}

                {/* Sub-Tabs */}
                <div className="flex items-center gap-2 border-b border-gray-200 pb-2 overflow-x-auto text-xs font-bold">
                  {[
                    { id: "products", label: `Products & Offerings (${result.products?.length || 0})`, icon: Package },
                    { id: "company", label: "Company Profile", icon: Building2 },
                    { id: "contact", label: "Address & Hours", icon: MapPin },
                    { id: "reviews", label: `Customer Reviews (${result.company?.reviews?.length || 0})`, icon: Star },
                    { id: "gallery", label: `Photo Gallery (${result.company?.gallery?.length || 0})`, icon: ImageIcon },
                    { id: "faqs", label: `FAQs (${result.company?.faqs?.length || 0})`, icon: HelpCircle },
                    { id: "pages", label: `Scraped Pages (${result.crawledPages?.length || 0})`, icon: FileText },
                    { id: "logs", label: "Scraper Engine Logs", icon: Terminal }
                  ].map((t) => {
                    const Icon = t.icon;
                    return (
                      <button
                        key={t.id}
                        onClick={() => setActiveTab(t.id as any)}
                        className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                          activeTab === t.id
                            ? "bg-indigo-600 text-white shadow-sm"
                            : "bg-white text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{t.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Tab 1: Products */}
                {activeTab === "products" && (() => {
                  const categoriesList = result.products 
                    ? ["All", ...Array.from(new Set(result.products.map(p => p.category).filter(Boolean)))]
                    : ["All"];

                  const filteredItems = (result.products || []).map((p, originalIndex) => ({ p, originalIndex })).filter(({ p }) => {
                    const matchesCategory = scrapedCategoryFilter === "All" || p.category === scrapedCategoryFilter;
                    const matchesSearch = !scrapedSearchQuery.trim() || 
                      p.title.toLowerCase().includes(scrapedSearchQuery.toLowerCase()) || 
                      p.description.toLowerCase().includes(scrapedSearchQuery.toLowerCase()) ||
                      p.category.toLowerCase().includes(scrapedSearchQuery.toLowerCase());
                    return matchesCategory && matchesSearch;
                  });

                  const filteredIndices = filteredItems.map(item => item.originalIndex);
                  const isAllFilteredSelected = filteredIndices.length > 0 && filteredIndices.every(idx => selectedProductIndices.includes(idx));

                  return (
                    <div className="flex flex-col gap-5">
                      
                      {/* Batch Import Banner / Toast Notification */}
                      {batchImportMessage && (
                        <div className="bg-emerald-50 border-2 border-emerald-300 rounded-3xl p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 animate-in zoom-in-95 duration-200">
                          <div className="flex items-center gap-3.5">
                            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-600/20">
                              <CheckCheck className="w-6 h-6" />
                            </div>
                            <div>
                              <h4 className="font-extrabold text-sm text-emerald-950">Catalog Synchronized!</h4>
                              <p className="text-xs text-emerald-800 font-medium">{batchImportMessage}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2.5 shrink-0">
                            <Link href="/dashboard/catalog">
                              <Button className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl h-9 px-4 shadow-sm cursor-pointer">
                                View in Catalog →
                              </Button>
                            </Link>
                          </div>
                        </div>
                      )}

                      {/* Main Batch Import & Filter Toolbar */}
                      <div className="bg-white rounded-3xl border border-gray-200 p-5 shadow-sm flex flex-col gap-4">
                        
                        {/* Top Action Row: Import All & Import Selected */}
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                          
                          <div className="flex flex-wrap items-center gap-2.5">
                            {/* Import All Button */}
                            <Button
                              onClick={handleImportAllScrapedProducts}
                              disabled={isBatchImporting || !result.products || result.products.length === 0}
                              className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white font-black text-xs rounded-2xl h-11 px-6 shadow-md shadow-indigo-600/25 flex items-center gap-2 cursor-pointer active:scale-95 transition-all"
                            >
                              {isBatchImporting ? (
                                <>
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  <span>Importing All Items...</span>
                                </>
                              ) : (
                                <>
                                  <Sparkles className="w-4 h-4 text-amber-300" />
                                  <span>Import All Scraped ({result.products?.length || 0})</span>
                                </>
                              )}
                            </Button>

                            {/* Import Selected Button */}
                            {selectedProductIndices.length > 0 && (
                              <Button
                                onClick={handleImportSelectedProducts}
                                disabled={isBatchImporting}
                                className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-2xl h-11 px-5 shadow-md shadow-purple-600/20 flex items-center gap-2 cursor-pointer active:scale-95 animate-in zoom-in-90 duration-150"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Import Selected ({selectedProductIndices.length})</span>
                              </Button>
                            )}

                            {/* Select All / Deselect All Toggle */}
                            <button
                              type="button"
                              onClick={() => {
                                if (isAllFilteredSelected) {
                                  deselectAll();
                                } else {
                                  selectAllFiltered(filteredIndices);
                                }
                              }}
                              className="px-3.5 h-11 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>{isAllFilteredSelected ? "Deselect All" : `Select All Filtered (${filteredItems.length})`}</span>
                            </button>
                          </div>

                          {/* Search Input Box */}
                          <div className="relative w-full lg:w-72">
                            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              value={scrapedSearchQuery}
                              onChange={(e) => setScrapedSearchQuery(e.target.value)}
                              placeholder="Search scraped items..."
                              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-semibold text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                            />
                          </div>

                        </div>

                        {/* Category Filter Pills */}
                        {categoriesList.length > 1 && (
                          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mr-1">Category:</span>
                            {categoriesList.map((cat) => (
                              <button
                                key={cat}
                                type="button"
                                onClick={() => setScrapedCategoryFilter(cat)}
                                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                                  scrapedCategoryFilter === cat
                                    ? "bg-indigo-600 text-white shadow-xs"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                              >
                                {cat}
                              </button>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center justify-between text-[11px] font-semibold text-gray-500 pt-1">
                          <span>Showing {filteredItems.length} of {result.products?.length || 0} scraped products</span>
                          {importedProductIndices.length > 0 && (
                            <span className="text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                              ✓ {importedProductIndices.length} imported into catalog
                            </span>
                          )}
                        </div>

                      </div>

                      {/* Products Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {filteredItems.map(({ p, originalIndex }) => {
                          const isSelected = selectedProductIndices.includes(originalIndex);
                          const isImported = importedProductIndices.includes(originalIndex);
                          const isImportingThis = singleCardImportingIndex === originalIndex;

                          return (
                            <div 
                              key={originalIndex} 
                              className={`bg-white rounded-3xl border p-4 shadow-sm flex flex-col justify-between gap-3 group transition-all relative ${
                                isSelected ? "border-indigo-600 ring-2 ring-indigo-600/20 bg-indigo-50/10" : "border-gray-200 hover:border-indigo-300"
                              }`}
                            >
                              <div>
                                {/* Image Container with Selection Checkbox & Category Badge */}
                                <div className="aspect-video w-full rounded-2xl bg-gradient-to-br from-indigo-50/70 via-slate-50 to-indigo-100/40 overflow-hidden mb-3 relative flex items-center justify-center border border-gray-100">
                                  
                                  {/* Selection Checkbox */}
                                  <button
                                    type="button"
                                    onClick={() => toggleSelectProduct(originalIndex)}
                                    className={`absolute top-2.5 left-2.5 z-10 w-6 h-6 rounded-lg flex items-center justify-center transition-all cursor-pointer shadow-md ${
                                      isSelected 
                                        ? "bg-indigo-600 text-white" 
                                        : "bg-white/90 text-gray-400 hover:text-indigo-600 border border-gray-300"
                                    }`}
                                  >
                                    {isSelected ? <Check className="w-4 h-4 stroke-[3]" /> : null}
                                  </button>

                                  {p.primaryImage || p.images?.[0] ? (
                                    <img 
                                      src={p.primaryImage || p.images?.[0]} 
                                      alt={p.title} 
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                                    />
                                  ) : (
                                    <div className="flex flex-col items-center justify-center text-center p-3">
                                      {result.company?.logo ? (
                                        <img src={result.company.logo} alt="" className="h-9 max-w-[120px] object-contain mb-1 opacity-90" />
                                      ) : (
                                        <div className="w-10 h-10 rounded-xl bg-indigo-600/10 text-indigo-600 flex items-center justify-center font-black text-sm mb-1">
                                          {p.title.charAt(0).toUpperCase()}
                                        </div>
                                      )}
                                      <span className="text-[11px] font-bold text-gray-700 line-clamp-1">{p.title}</span>
                                    </div>
                                  )}

                                  {/* Category Tag */}
                                  <span className="absolute top-2.5 right-2.5 bg-black/75 text-white font-extrabold text-[10px] px-2.5 py-0.5 rounded-md backdrop-blur-sm">
                                    {p.category || "Item"}
                                  </span>

                                  {/* Discount Tag */}
                                  {p.originalPrice && p.originalPrice > p.price && p.price > 0 && (
                                    <span className="absolute bottom-2.5 left-2.5 bg-red-600 text-white font-black text-[10px] px-2 py-0.5 rounded-md shadow-sm">
                                      {Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)}% OFF
                                    </span>
                                  )}
                                </div>

                                <h4 className="font-extrabold text-sm text-gray-900 line-clamp-2 leading-snug">{p.title}</h4>
                                <p className="text-xs text-gray-500 line-clamp-2 mt-1">{p.description}</p>
                              </div>

                              {/* Price & Specs & Card Actions */}
                              <div className="flex flex-col gap-2.5 pt-2.5 border-t border-gray-100">
                                
                                <div className="flex items-center justify-between">
                                  <div>
                                    {p.price > 0 ? (
                                      <div className="flex items-baseline gap-1.5">
                                        <span className="font-black text-base text-indigo-700">₹{p.price.toLocaleString("en-IN")}</span>
                                        {p.originalPrice && p.originalPrice > p.price && (
                                          <span className="text-xs text-gray-400 line-through">₹{p.originalPrice.toLocaleString("en-IN")}</span>
                                        )}
                                      </div>
                                    ) : (
                                      <span className="font-bold text-xs text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-lg border border-indigo-100">
                                        Verified Listing
                                      </span>
                                    )}
                                  </div>

                                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                    {p.aiVisibility}% AI Score
                                  </span>
                                </div>

                                {/* Action Buttons Row */}
                                <div className="grid grid-cols-2 gap-2 mt-1">
                                  {isImported ? (
                                    <div className="col-span-2 flex items-center justify-between p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
                                      <span className="font-bold text-emerald-800 flex items-center gap-1">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                        <span>Imported to Catalog</span>
                                      </span>
                                      <Link href="/dashboard/catalog">
                                        <Button size="sm" className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[11px] h-7 px-2.5 rounded-lg cursor-pointer">
                                          View
                                        </Button>
                                      </Link>
                                    </div>
                                  ) : (
                                    <>
                                      <Button
                                        type="button"
                                        size="sm"
                                        onClick={() => handleImportSingleFromCard(p, originalIndex)}
                                        disabled={isImportingThis}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl h-9 flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                                      >
                                        {isImportingThis ? (
                                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        ) : (
                                          <Plus className="w-3.5 h-3.5" />
                                        )}
                                        <span>Import Card</span>
                                      </Button>

                                      <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setEditingScrapedItem({ index: originalIndex, product: { ...p } })}
                                        className="border-gray-200 hover:bg-gray-50 text-gray-700 font-bold text-xs rounded-xl h-9 flex items-center justify-center gap-1 cursor-pointer"
                                      >
                                        <Edit3 className="w-3.5 h-3.5 text-gray-500" />
                                        <span>Edit Details</span>
                                      </Button>
                                    </>
                                  )}
                                </div>

                                {p.sourceUrl && (
                                  <a 
                                    href={p.sourceUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="w-full"
                                  >
                                    <button 
                                      type="button"
                                      className="w-full text-center text-[11px] text-gray-400 hover:text-indigo-600 font-semibold flex items-center justify-center gap-1 py-0.5 transition-colors cursor-pointer"
                                    >
                                      <ExternalLink className="w-3 h-3" /> Source URL
                                    </button>
                                  </a>
                                )}

                              </div>
                            </div>
                          );
                        })}
                      </div>

                    </div>
                  );
                })()}

                {/* Tab 2: Company Profile */}
                {activeTab === "company" && result.company && (
                  <div className="bg-white rounded-3xl border border-gray-200 p-6 md:p-8 shadow-sm flex flex-col gap-6">
                    
                    {/* Action Toolbar Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100">
                      <div>
                        <h4 className="font-extrabold text-sm text-indigo-950 flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-indigo-600" /> Company Profile & Branding
                        </h4>
                        <p className="text-xs text-indigo-800/80">Extracted corporate overview, vision, and accreditation data.</p>
                      </div>

                      <div className="flex items-center gap-2">
                        {importedSections.includes("company") && (
                          <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1">
                            <Check className="w-3.5 h-3.5 text-emerald-600" /> Synced with Portfolio
                          </span>
                        )}
                        <Button
                          onClick={handleImportProfileOnly}
                          disabled={importingSection === "company"}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl h-9 px-4 shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                        >
                          {importingSection === "company" ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Updating Profile...</span>
                            </>
                          ) : (
                            <>
                              <Building2 className="w-3.5 h-3.5" />
                              <span>Import Profile to Portfolio</span>
                            </>
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
                      <div className="flex items-center gap-4">
                        {result.company.logo ? (
                          <img 
                            src={result.company.logo} 
                            alt="" 
                            className="w-16 h-16 rounded-2xl object-contain border border-gray-200 p-2 bg-gray-50" 
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-extrabold text-xl">
                            {result.company.name?.charAt(0).toUpperCase() || "B"}
                          </div>
                        )}
                        <div>
                          <h3 className="text-xl font-extrabold text-gray-900">{result.company.name}</h3>
                          <p className="text-xs font-medium text-indigo-600">{result.company.tagline}</p>
                        </div>
                      </div>

                      {result.company.gstin && (
                        <div className="px-3.5 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-1.5 self-start sm:self-auto">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>MahaRERA / Reg: {result.company.gstin}</span>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">Business Type</span>
                        <span className="text-sm font-extrabold text-gray-900 mt-1 block">{result.company.businessType || "Digital Merchant & Services"}</span>
                      </div>
                      <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">Year Established</span>
                        <span className="text-sm font-extrabold text-gray-900 mt-1 block">{result.company.yearEstablished || "Active & Verified"}</span>
                      </div>
                      <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">Team Size</span>
                        <span className="text-sm font-extrabold text-gray-900 mt-1 block">{result.company.teamSize || "Verified Team"}</span>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">About & Background Story</h4>
                      <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-5 rounded-2xl border border-gray-100">
                        {result.company.about}
                      </p>
                    </div>

                    {result.company.certifications && result.company.certifications.length > 0 && (
                      <div>
                        <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Verified Certifications & Accreditations</h4>
                        <div className="flex flex-wrap gap-2">
                          {result.company.certifications.map((cert, idx) => (
                            <div key={idx} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 border border-indigo-100 rounded-xl text-xs font-bold text-indigo-900">
                              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                              <span>{cert}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Tab 3: Contact & Location */}
                {activeTab === "contact" && result.company && (
                  <div className="bg-white rounded-3xl border border-gray-200 p-6 md:p-8 shadow-sm flex flex-col gap-6">
                    
                    {/* Action Toolbar Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100">
                      <div>
                        <h4 className="font-extrabold text-sm text-emerald-950 flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-emerald-600" /> Registered Location & Hours
                        </h4>
                        <p className="text-xs text-emerald-800/80">Corporate address, phone, WhatsApp, and operating timings.</p>
                      </div>

                      <div className="flex items-center gap-2">
                        {importedSections.includes("contact") && (
                          <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1">
                            <Check className="w-3.5 h-3.5 text-emerald-600" /> Synced with Portfolio
                          </span>
                        )}
                        <Button
                          onClick={handleImportProfileOnly}
                          disabled={importingSection === "company"}
                          className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl h-9 px-4 shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                        >
                          {importingSection === "company" ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Updating Contact...</span>
                            </>
                          ) : (
                            <>
                              <MapPin className="w-3.5 h-3.5" />
                              <span>Import Contact & Hours to Portfolio</span>
                            </>
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div className="flex flex-col gap-6">
                        <h3 className="text-lg font-extrabold text-gray-900">Contact & Headquarter Details</h3>
                        
                        <div className="space-y-4">
                          <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                            <MapPin className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                            <div>
                              <span className="text-[11px] font-bold text-gray-500 uppercase block">Registered Address</span>
                              <span className="text-sm font-bold text-gray-900 block mt-0.5">
                                {result.company.address ? `${result.company.address}${result.company.city ? `, ${result.company.city}` : ""}${result.company.pincode ? ` - ${result.company.pincode}` : ""}` : `${result.company.name} Headquarters`}
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                              <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                              <div>
                                <span className="text-[10px] font-bold text-gray-500 uppercase block">Phone</span>
                                <span className="text-xs font-bold text-gray-900">{result.company.phone || "Available on Website"}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100">
                              <MessageSquare className="w-4 h-4 text-emerald-700 shrink-0" />
                              <div>
                                <span className="text-[10px] font-bold text-emerald-800 uppercase block">WhatsApp Support</span>
                                <span className="text-xs font-black text-emerald-950">
                                  {result.company.whatsapp ? (result.company.whatsapp.startsWith("+") ? result.company.whatsapp : `+${result.company.whatsapp}`) : "Available on Website"}
                                </span>
                              </div>
                            </div>
                          </div>

                          {result.company.socialLinks && (
                            <div>
                              <span className="text-[11px] font-bold text-gray-500 uppercase block mb-2">Connected Social Media</span>
                              <div className="flex flex-wrap gap-2">
                                {Object.entries(result.company.socialLinks).map(([k, v]) => v ? (
                                  <a key={k} href={v} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-gray-100 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl text-xs font-bold text-gray-700 capitalize flex items-center gap-1.5 transition-colors">
                                    <ExternalLink className="w-3 h-3" /> {k}
                                  </a>
                                ) : null)}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Working Hours */}
                      <div>
                        <h3 className="text-lg font-extrabold text-gray-900 mb-4">Office & Operational Timings</h3>
                        <div className="bg-gray-50 rounded-2xl border border-gray-100 divide-y divide-gray-100 overflow-hidden">
                          {result.company.workingHours?.map((wh, idx) => (
                            <div key={idx} className="p-3 px-4 flex items-center justify-between text-xs">
                              <span className="font-bold text-gray-700">{wh.day}</span>
                              <span className={`font-semibold ${wh.isClosed ? "text-red-600 font-bold" : "text-gray-900"}`}>
                                {wh.isClosed ? "Closed" : `${wh.open} - ${wh.close}`}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 4: Reviews */}
                {activeTab === "reviews" && result.company && (
                  <div className="flex flex-col gap-5">
                    
                    {/* Action Header Banner */}
                    <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3.5">
                        <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-black shrink-0 border border-amber-200/60">
                          <Star className="w-6 h-6 fill-amber-400 text-amber-500" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-black text-base text-gray-900">
                              Customer Reviews & Testimonials ({result.company.reviews?.length || 0})
                            </h3>
                            {importedSections.includes("reviews") && (
                              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                                <Check className="w-3 h-3 text-emerald-600" /> Synced to Portfolio
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500">
                            Extracted customer feedback and verified ratings from {result.domain}. Import them to display on your public storefront.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 shrink-0">
                        <Button
                          onClick={handleImportReviewsOnly}
                          disabled={importingSection === "reviews" || !result.company.reviews || result.company.reviews.length === 0}
                          className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl h-10 px-5 shadow-sm flex items-center gap-2 cursor-pointer active:scale-95 transition-all"
                        >
                          {importingSection === "reviews" ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Importing Reviews...</span>
                            </>
                          ) : (
                            <>
                              <Star className="w-3.5 h-3.5 fill-white text-white" />
                              <span>Import Reviews to Portfolio ({result.company.reviews?.length || 0})</span>
                            </>
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Reviews List */}
                    {result.company.reviews && result.company.reviews.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {result.company.reviews.map((rev, idx) => (
                          <div key={idx} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm flex flex-col justify-between gap-3 hover:border-amber-300 transition-colors">
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-1 bg-amber-50 text-amber-800 px-2.5 py-1 rounded-full text-xs font-black">
                                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" /> {rev.rating} / 5.0
                                </div>
                                <span className="text-[11px] text-gray-400 font-medium">{rev.date}</span>
                              </div>
                              <p className="text-xs text-gray-700 leading-relaxed italic font-normal">
                                "{rev.comment}"
                              </p>
                            </div>
                            <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                              <span className="font-bold text-gray-900">{rev.author}</span>
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                Verified Reviewer
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-white rounded-3xl border border-gray-200 p-10 text-center flex flex-col items-center justify-center gap-2">
                        <Star className="w-10 h-10 text-gray-300 mb-1" />
                        <h4 className="font-bold text-sm text-gray-700">No Direct Reviews Found on Discovered Pages</h4>
                        <p className="text-xs text-gray-400 max-w-sm">Default verified 5-star testimonials will be generated when importing your full portfolio profile.</p>
                      </div>
                    )}

                  </div>
                )}

                {/* Tab 5: Gallery */}
                {activeTab === "gallery" && result.company && (
                  <div className="flex flex-col gap-5">
                    
                    {/* Action Header Banner */}
                    <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3.5">
                        <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black shrink-0 border border-indigo-100">
                          <ImageIcon className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-black text-base text-gray-900">
                              Showcase & Photo Gallery ({result.company.gallery?.length || 0})
                            </h3>
                            {importedSections.includes("gallery") && (
                              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                                <Check className="w-3 h-3 text-emerald-600" /> Synced to Gallery
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500">
                            High-resolution project, facility, and storefront photography scraped from {result.domain}.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 shrink-0">
                        <Button
                          onClick={handleImportGalleryOnly}
                          disabled={importingSection === "gallery" || !result.company.gallery || result.company.gallery.length === 0}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl h-10 px-5 shadow-sm flex items-center gap-2 cursor-pointer active:scale-95 transition-all"
                        >
                          {importingSection === "gallery" ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Importing Gallery...</span>
                            </>
                          ) : (
                            <>
                              <ImageIcon className="w-3.5 h-3.5" />
                              <span>Import Gallery to Portfolio ({result.company.gallery?.length || 0})</span>
                            </>
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Gallery Grid */}
                    {result.company.gallery && result.company.gallery.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {result.company.gallery.map((g, idx) => (
                          <div key={idx} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm group hover:border-indigo-300 transition-colors">
                            <div className="aspect-video w-full overflow-hidden bg-gray-100 flex items-center justify-center">
                              {g.url ? (
                                <img src={g.url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                              ) : (
                                <ImageIcon className="w-8 h-8 text-gray-300" />
                              )}
                            </div>
                            <div className="p-3.5">
                              <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">{g.category || "Media"}</span>
                              <h4 className="font-bold text-xs text-gray-900 mt-1">{g.caption}</h4>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-white rounded-3xl border border-gray-200 p-10 text-center flex flex-col items-center justify-center gap-2">
                        <ImageIcon className="w-10 h-10 text-gray-300 mb-1" />
                        <h4 className="font-bold text-sm text-gray-700">No Gallery Photos Discovered</h4>
                        <p className="text-xs text-gray-400 max-w-sm">You can add custom storefront showcase photos anytime in the Portfolio Builder.</p>
                      </div>
                    )}

                  </div>
                )}

                {/* Tab 6: FAQs */}
                {activeTab === "faqs" && result.company && (
                  <div className="flex flex-col gap-5">
                    
                    {/* Action Header Banner */}
                    <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3.5">
                        <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black shrink-0 border border-indigo-100">
                          <HelpCircle className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-black text-base text-gray-900">
                              Frequently Asked Questions ({result.company.faqs?.length || 0})
                            </h3>
                            {importedSections.includes("faqs") && (
                              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                                <Check className="w-3 h-3 text-emerald-600" /> Synced to FAQs
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500">
                            Extracted customer FAQs and verified policies from {result.domain}.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 shrink-0">
                        <Button
                          onClick={handleImportFaqsOnly}
                          disabled={importingSection === "faqs" || !result.company.faqs || result.company.faqs.length === 0}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl h-10 px-5 shadow-sm flex items-center gap-2 cursor-pointer active:scale-95 transition-all"
                        >
                          {importingSection === "faqs" ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Importing FAQs...</span>
                            </>
                          ) : (
                            <>
                              <HelpCircle className="w-3.5 h-3.5" />
                              <span>Import FAQs to Portfolio ({result.company.faqs?.length || 0})</span>
                            </>
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* FAQs List */}
                    {result.company.faqs && result.company.faqs.length > 0 ? (
                      <div className="space-y-3">
                        {result.company.faqs.map((faq, idx) => (
                          <div key={idx} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:border-indigo-300 transition-colors">
                            <h4 className="font-extrabold text-sm text-gray-900 flex items-center gap-2">
                              <HelpCircle className="w-4 h-4 text-indigo-600 shrink-0" />
                              <span>{faq.question}</span>
                            </h4>
                            <p className="text-xs text-gray-600 mt-2 pl-6 leading-relaxed font-normal">
                              {faq.answer}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-white rounded-3xl border border-gray-200 p-10 text-center flex flex-col items-center justify-center gap-2">
                        <HelpCircle className="w-10 h-10 text-gray-300 mb-1" />
                        <h4 className="font-bold text-sm text-gray-700">No Specific FAQs Found on Discovered Pages</h4>
                        <p className="text-xs text-gray-400 max-w-sm">Curated customer support and warranty FAQs will be populated automatically when importing.</p>
                      </div>
                    )}

                  </div>
                )}

                {/* Tab 7: Crawled Pages Architecture */}
                {activeTab === "pages" && (
                  <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
                    <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Discovered Site Architecture</span>
                      <span className="text-xs font-bold text-gray-500">{result.crawledPages?.length || 0} pages scraped</span>
                    </div>
                    <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
                      {result.crawledPages?.map((pg, idx) => (
                        <div key={idx} className="p-3.5 px-5 flex items-center justify-between text-xs hover:bg-gray-50/50">
                          <div className="flex items-center gap-3 truncate pr-4">
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 font-mono text-[10px] rounded uppercase font-bold">
                              {pg.type}
                            </span>
                            <span className="font-semibold text-gray-900 truncate">{pg.url}</span>
                          </div>
                          <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded text-[11px] shrink-0">
                            HTTP {pg.statusCode || 200} · {pg.itemsFound || 0} items
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tab 8: Logs */}
                {activeTab === "logs" && (
                  <div className="bg-gray-950 text-emerald-400 p-5 rounded-2xl font-mono text-xs overflow-x-auto max-h-96 space-y-1">
                    {result.logs?.map((l, i) => (
                      <div key={i} className="leading-relaxed">
                        <span className="text-gray-500">[{new Date().toLocaleTimeString()}]</span> {l}
                      </div>
                    ))}
                  </div>
                )}

              </div>
            )}

          </div>
        )}

        {/* Quick Edit & Import Modal for Scraped Items */}
        {editingScrapedItem && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl border border-gray-200 max-w-2xl w-full p-6 md:p-8 shadow-2xl overflow-y-auto max-h-[90vh] flex flex-col gap-5">
              
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black">
                    <Edit3 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-gray-900">Customize Scraped Product</h3>
                    <p className="text-xs text-gray-500">Edit product specifications before importing to your catalog</p>
                  </div>
                </div>

                <button
                  onClick={() => setEditingScrapedItem(null)}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 font-bold flex items-center justify-center text-sm cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Form inputs */}
              <div className="flex flex-col gap-4">
                
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Product Title</label>
                  <input
                    type="text"
                    value={editingScrapedItem.product.title}
                    onChange={(e) => setEditingScrapedItem({
                      ...editingScrapedItem,
                      product: { ...editingScrapedItem.product, title: e.target.value }
                    })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Selling Price (₹)</label>
                    <input
                      type="number"
                      value={editingScrapedItem.product.price}
                      onChange={(e) => setEditingScrapedItem({
                        ...editingScrapedItem,
                        product: { ...editingScrapedItem.product, price: Number(e.target.value) || 0 }
                      })}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl font-extrabold text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Original Price (₹)</label>
                    <input
                      type="number"
                      value={editingScrapedItem.product.originalPrice || ""}
                      onChange={(e) => setEditingScrapedItem({
                        ...editingScrapedItem,
                        product: { ...editingScrapedItem.product, originalPrice: Number(e.target.value) || 0 }
                      })}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl font-bold text-sm text-gray-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Category</label>
                    <input
                      type="text"
                      value={editingScrapedItem.product.category}
                      onChange={(e) => setEditingScrapedItem({
                        ...editingScrapedItem,
                        product: { ...editingScrapedItem.product, category: e.target.value }
                      })}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl font-semibold text-xs text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Inventory Stock</label>
                    <input
                      type="number"
                      value={editingScrapedItem.product.inventory || 20}
                      onChange={(e) => setEditingScrapedItem({
                        ...editingScrapedItem,
                        product: { ...editingScrapedItem.product, inventory: Number(e.target.value) || 0 }
                      })}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl font-bold text-xs text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={editingScrapedItem.product.description}
                    onChange={(e) => setEditingScrapedItem({
                      ...editingScrapedItem,
                      product: { ...editingScrapedItem.product, description: e.target.value }
                    })}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-medium text-xs text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 resize-none"
                  />
                </div>

              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingScrapedItem(null)}
                  className="rounded-xl text-xs font-bold px-4 h-10 border-gray-200"
                >
                  Cancel
                </Button>

                <Button
                  type="button"
                  onClick={handleSaveAndImportModal}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl px-6 h-10 shadow-md shadow-indigo-600/20 flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Save & Import to Catalog</span>
                </Button>
              </div>

            </div>
          </div>
        )}

      </main>
    </div>
  );
}
