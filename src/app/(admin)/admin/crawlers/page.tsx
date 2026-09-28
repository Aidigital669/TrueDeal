"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Bot, Sparkles, Globe, Play, CheckCircle2, 
  AlertCircle, Loader2, ArrowRight, Layers, 
  Search, ExternalLink, RefreshCw, Terminal, Sliders,
  FileText, Upload, Link as LinkIcon, FileCheck, Check,
  X, Download, Eye, Tag, Package, Building2, Briefcase,
  Store, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAdminSellersList, getAdminPlatformSettings, updateAdminPlatformSettings } from "@/lib/admin-actions";

type TabType = "pdf" | "web" | "ai";

export default function AdminCrawlersPage() {
  const [activeTab, setActiveTab] = useState<TabType>("pdf");
  const [sellers, setSellers] = useState<any[]>([]);

  // -------------------------------------------------------------
  // Web Crawler State
  // -------------------------------------------------------------
  const [crawlUrl, setCrawlUrl] = useState("https://anvreealty.com");
  const [selectedSellerSlug, setSelectedSellerSlug] = useState("anvreeality");
  const [crawlDepth, setCrawlDepth] = useState<"fast" | "deep">("fast");
  const [isCrawling, setIsCrawling] = useState(false);
  const [crawlLogs, setCrawlLogs] = useState<string[]>([]);
  const [crawlResult, setCrawlResult] = useState<any | null>(null);

  // -------------------------------------------------------------
  // PDF Scraper State (NEW)
  // -------------------------------------------------------------
  const [pdfInputMode, setPdfInputMode] = useState<"file" | "url">("file");
  const [selectedPdfFile, setSelectedPdfFile] = useState<File | null>(null);
  const [pdfUrl, setPdfUrl] = useState("");
  const [pdfSellerSlug, setPdfSellerSlug] = useState("anvreeality");
  const [pdfMode, setPdfMode] = useState<"auto" | "catalog" | "real_estate" | "services">("auto");
  const [pdfAutoImport, setPdfAutoImport] = useState(true);
  const [isPdfScraping, setIsPdfScraping] = useState(false);
  const [pdfLogs, setPdfLogs] = useState<string[]>([]);
  const [pdfResult, setPdfResult] = useState<any | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isCommitting, setIsCommitting] = useState(false);
  const [commitNotice, setCommitNotice] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // -------------------------------------------------------------
  // Gemini AI Test State
  // -------------------------------------------------------------
  const [testQuery, setTestQuery] = useState("Find verified luxury 3BHK flats with swimming pool");
  const [isTestingAi, setIsTestingAi] = useState(false);
  const [aiResponse, setAiResponse] = useState<any | null>(null);
  const [selectedModel, setSelectedModel] = useState("gemini-2.5-flash");
  const [saveNotice, setSaveNotice] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      const [sellersRes, settingsRes] = await Promise.all([
        getAdminSellersList(),
        getAdminPlatformSettings()
      ]);
      if (sellersRes.success && sellersRes.sellers.length > 0) {
        setSellers(sellersRes.sellers);
        setSelectedSellerSlug(sellersRes.sellers[0].slug);
        setPdfSellerSlug(sellersRes.sellers[0].slug);
      }
      if (settingsRes.success && settingsRes.settings.geminiModel) {
        // Guard against old deprecated models
        const m = settingsRes.settings.geminiModel;
        setSelectedModel(m.includes("2.0") ? "gemini-2.5-flash" : m);
      }
    }
    init();
  }, []);

  // -------------------------------------------------------------
  // Handle Web Crawler Execution
  // -------------------------------------------------------------
  const handleRunCrawler = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!crawlUrl.trim()) return;

    setIsCrawling(true);
    setCrawlResult(null);
    setCrawlLogs([
      `[${new Date().toLocaleTimeString()}] Initializing headless crawler for ${crawlUrl}...`,
      `[${new Date().toLocaleTimeString()}] Target isolated partition: products_${selectedSellerSlug}`,
      `[${new Date().toLocaleTimeString()}] Launching deep HTML extractor and Gemini AI parsing pipeline...`
    ]);

    try {
      const res = await fetch("/api/scrape-website", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: crawlUrl.trim(),
          sellerSlug: selectedSellerSlug,
          depth: crawlDepth
        })
      });

      const data = await res.json();
      if (data.success) {
        setCrawlLogs(prev => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] Discovered ${data.products?.length || data.count || 0} items.`,
          `[${new Date().toLocaleTimeString()}] Successfully imported catalog into database.`
        ]);
        setCrawlResult(data);
      } else {
        setCrawlLogs(prev => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] Scraper Error: ${data.error || "Failed to parse website"}`
        ]);
      }
    } catch (err: any) {
      setCrawlLogs(prev => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] Crawler Network Exception: ${err.message}`
      ]);
    } finally {
      setIsCrawling(false);
    }
  };

  // -------------------------------------------------------------
  // Handle PDF Scraper Execution
  // -------------------------------------------------------------
  const handleRunPdfScraper = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pdfInputMode === "file" && !selectedPdfFile) {
      alert("Please select or drop a PDF file first.");
      return;
    }
    if (pdfInputMode === "url" && !pdfUrl.trim()) {
      alert("Please enter a valid remote PDF URL.");
      return;
    }

    setIsPdfScraping(true);
    setPdfResult(null);
    setPdfLogs([
      `[${new Date().toLocaleTimeString()}] Starting TrueDeal AI PDF Scraper...`,
      `[${new Date().toLocaleTimeString()}] Mode: ${pdfMode} | Tenant: products_${pdfSellerSlug}`,
      `[${new Date().toLocaleTimeString()}] Uploading document stream to Gemini Multimodal Document Engine...`
    ]);

    try {
      let res: Response;

      if (pdfInputMode === "file" && selectedPdfFile) {
        const formData = new FormData();
        formData.append("file", selectedPdfFile);
        formData.append("sellerSlug", pdfSellerSlug);
        formData.append("mode", pdfMode);
        formData.append("autoImport", String(pdfAutoImport));

        res = await fetch("/api/scrape-pdf", {
          method: "POST",
          body: formData
        });
      } else {
        res = await fetch("/api/scrape-pdf", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileUrl: pdfUrl.trim(),
            sellerSlug: pdfSellerSlug,
            mode: pdfMode,
            autoImport: pdfAutoImport
          })
        });
      }

      const data = await res.json();
      if (data.logs && Array.isArray(data.logs)) {
        setPdfLogs(data.logs);
      }

      if (data.success) {
        setPdfResult(data);
      } else {
        setPdfLogs(prev => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] Error: ${data.error || "Failed to extract PDF data"}`
        ]);
      }
    } catch (err: any) {
      setPdfLogs(prev => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] Network Exception: ${err.message}`
      ]);
    } finally {
      setIsPdfScraping(false);
    }
  };

  // -------------------------------------------------------------
  // Commit Extracted Items to Database (Manual action if not auto-imported)
  // -------------------------------------------------------------
  const handleCommitPdfItems = async () => {
    if (!pdfResult || !pdfResult.products || pdfResult.products.length === 0) return;

    setIsCommitting(true);
    try {
      const res = await fetch("/api/scrape-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "commit_items",
          items: pdfResult.products,
          sellerSlug: pdfSellerSlug,
          filename: pdfResult.filename || "extracted_document.pdf"
        })
      });

      const data = await res.json();
      if (data.success) {
        // Mark all items as imported
        setPdfResult((prev: any) => ({
          ...prev,
          products: prev.products.map((p: any) => ({ ...p, importedToDb: true })),
          stats: {
            ...prev.stats,
            totalImported: prev.products.length
          }
        }));
        setCommitNotice(`Successfully imported ${data.savedCount} items into products_${pdfSellerSlug}!`);
        setTimeout(() => setCommitNotice(null), 4000);
      } else {
        alert("Failed to commit items: " + data.error);
      }
    } catch (err: any) {
      alert("Error committing items: " + err.message);
    } finally {
      setIsCommitting(false);
    }
  };

  // -------------------------------------------------------------
  // Drag & Drop handlers
  // -------------------------------------------------------------
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
        setSelectedPdfFile(file);
      } else {
        alert("Please drop a valid .pdf document.");
      }
    }
  };

  // -------------------------------------------------------------
  // Gemini AI Query Tester
  // -------------------------------------------------------------
  const handleTestAiSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testQuery.trim()) return;

    setIsTestingAi(true);
    setAiResponse(null);

    try {
      const res = await fetch("/api/search-listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: testQuery })
      });

      const data = await res.json();
      setAiResponse(data);
    } catch (err: any) {
      setAiResponse({ error: err.message });
    } finally {
      setIsTestingAi(false);
    }
  };

  const handleSaveModelPreference = async (model: string) => {
    setSelectedModel(model);
    await updateAdminPlatformSettings({ geminiModel: model });
    setSaveNotice(`Default AI model set to ${model}`);
    setTimeout(() => setSaveNotice(null), 3000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans pb-16">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-600/30">
              <Bot className="w-5 h-5" />
            </div>
            AI Scraper Suite & Document Intelligence
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Ingest merchant catalogs via AI PDF extraction or headless web crawlers directly into isolated tenant databases.
          </p>
        </div>

        {/* Action Status Notice */}
        {(saveNotice || commitNotice) && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold rounded-2xl flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{saveNotice || commitNotice}</span>
          </div>
        )}
      </div>

      {/* Modern High-Impact Tabs Bar */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-[#090b10] border border-gray-800/90 rounded-2xl">
        <button
          type="button"
          onClick={() => setActiveTab("pdf")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "pdf"
              ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/25"
              : "text-gray-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>PDF Catalog & Document Scraper</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-white/20 text-white font-mono uppercase tracking-wider font-extrabold">
            Gemini Multimodal
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("web")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "web"
              ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/25"
              : "text-gray-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>Merchant Website Scraper</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("ai")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "ai"
              ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/25"
              : "text-gray-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <Sparkles className="w-4 h-4 text-purple-300" />
          <span>Gemini AI Search Discovery Engine</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: PDF CATALOG & BROCHURE SCRAPER (NEW FIRST-CLASS MODULE)           */}
      {/* ========================================================================= */}
      {activeTab === "pdf" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Control Panel (5 Cols) */}
            <div className="lg:col-span-5 bg-[#0f1118] border border-gray-800 rounded-3xl p-6 shadow-xl space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-gray-800">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white">AI PDF Document Extractor</h2>
                    <p className="text-[11px] text-gray-400">Extract brochures, property sheets & price catalogs</p>
                  </div>
                </div>
              </div>

              {/* Toggle Input Mode (Upload File vs Remote URL) */}
              <div className="flex items-center gap-1.5 p-1 bg-gray-900/90 rounded-xl border border-gray-800 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setPdfInputMode("file")}
                  className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    pdfInputMode === "file" ? "bg-indigo-600 text-white shadow-sm" : "text-gray-400 hover:text-white"
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload PDF File</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPdfInputMode("url")}
                  className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    pdfInputMode === "url" ? "bg-indigo-600 text-white shadow-sm" : "text-gray-400 hover:text-white"
                  }`}
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                  <span>Remote PDF Link</span>
                </button>
              </div>

              <form onSubmit={handleRunPdfScraper} className="space-y-4 text-xs">
                
                {/* File Upload Dropzone */}
                {pdfInputMode === "file" ? (
                  <div>
                    <label className="text-gray-300 font-semibold mb-1.5 block">Document PDF File</label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setSelectedPdfFile(e.target.files[0]);
                        }
                      }}
                      className="hidden"
                    />

                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
                        isDragging
                          ? "border-indigo-500 bg-indigo-500/10"
                          : selectedPdfFile
                          ? "border-emerald-500/50 bg-emerald-500/5"
                          : "border-gray-800 hover:border-gray-700 bg-gray-900/50 hover:bg-gray-900/80"
                      }`}
                    >
                      {selectedPdfFile ? (
                        <div className="flex flex-col items-center gap-2 py-1">
                          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                            <FileCheck className="w-5 h-5" />
                          </div>
                          <div className="text-center">
                            <p className="text-xs font-bold text-white max-w-[240px] truncate">{selectedPdfFile.name}</p>
                            <p className="text-[10px] text-gray-400 font-mono mt-0.5">
                              {(selectedPdfFile.size / (1024 * 1024)).toFixed(2)} MB • Ready for AI extraction
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedPdfFile(null);
                            }}
                            className="text-[10px] text-rose-400 hover:text-rose-300 font-bold px-2 py-1 rounded-md bg-rose-500/10 hover:bg-rose-500/20 transition-colors"
                          >
                            Remove / Select Another
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
                            <Upload className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-gray-200">
                              Drop PDF brochure or catalog here
                            </p>
                            <p className="text-[10px] text-gray-500 mt-0.5">
                              Supports multi-page PDF up to 25MB
                            </p>
                          </div>
                          <span className="text-[10px] text-indigo-400 font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20">
                            Browse Files
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="text-gray-300 font-semibold mb-1 block">Remote PDF Document URL</label>
                    <div className="relative">
                      <LinkIcon className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="url"
                        placeholder="https://example.com/brochures/product-catalog.pdf"
                        value={pdfUrl}
                        onChange={(e) => setPdfUrl(e.target.value)}
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-gray-900 border border-gray-800 text-white font-mono text-xs focus:border-indigo-500 outline-none"
                        required
                      />
                    </div>
                  </div>
                )}

                {/* Target Merchant Selection & Extraction Blueprint */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-gray-300 font-semibold mb-1 block flex items-center gap-1.5">
                      <Store className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Target Merchant</span>
                    </label>
                    <select
                      value={pdfSellerSlug}
                      onChange={(e) => setPdfSellerSlug(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-gray-900 border border-gray-800 text-white font-semibold text-xs focus:border-indigo-500 outline-none"
                    >
                      {sellers.map((s) => (
                        <option key={s.slug} value={s.slug}>
                          {s.storeName} ({s.slug})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-gray-300 font-semibold mb-1 block flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-purple-400" />
                      <span>Extraction Blueprint</span>
                    </label>
                    <select
                      value={pdfMode}
                      onChange={(e) => setPdfMode(e.target.value as any)}
                      className="w-full px-3 py-2.5 rounded-xl bg-gray-900 border border-gray-800 text-white font-semibold text-xs focus:border-indigo-500 outline-none"
                    >
                      <option value="auto">Auto Smart Detection</option>
                      <option value="real_estate">Real Estate & Properties</option>
                      <option value="catalog">E-Commerce & Products</option>
                      <option value="services">Services & Rate Sheets</option>
                    </select>
                  </div>
                </div>

                {/* Auto Import Toggle */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-gray-900/60 border border-gray-800">
                  <div className="flex flex-col">
                    <span className="font-semibold text-gray-200">Auto-Commit to Catalog</span>
                    <span className="text-[10px] text-gray-500">Automatically sync extracted items to MongoDB partition</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={pdfAutoImport}
                    onChange={(e) => setPdfAutoImport(e.target.checked)}
                    className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                  />
                </div>

                {/* Submit Action Button */}
                <Button
                  type="submit"
                  disabled={isPdfScraping}
                  className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:opacity-90 text-white text-xs font-black rounded-xl h-11 shadow-lg shadow-indigo-600/20 cursor-pointer transition-all"
                >
                  {isPdfScraping ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Extracting PDF with Gemini Multimodal AI...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2 fill-white" />
                      Start AI PDF Scraper Pipeline
                    </>
                  )}
                </Button>
              </form>

              {/* Real-Time Live Logs Terminal */}
              <div className="bg-[#090b10] border border-gray-800 rounded-2xl p-3.5 space-y-2 font-mono text-[11px]">
                <div className="flex items-center justify-between text-gray-500 pb-1 border-b border-gray-900">
                  <span className="flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                    Live PDF Scraper STDOUT
                  </span>
                  <span className="text-[10px] text-emerald-400 font-bold">READY</span>
                </div>
                <div className="space-y-1 text-gray-300 max-h-48 overflow-y-auto custom-scrollbar">
                  {pdfLogs.length === 0 ? (
                    <span className="text-gray-600">Select a PDF file or enter URL and run the extraction...</span>
                  ) : (
                    pdfLogs.map((log, i) => (
                      <div key={i} className="text-indigo-300/90 leading-relaxed text-[11px]">
                        {log}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Right Results & Interactive Preview Area (7 Cols) */}
            <div className="lg:col-span-7 space-y-5">
              
              {/* Summary Stats Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-[#0f1118] border border-gray-800 rounded-2xl p-3.5 flex flex-col">
                  <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Items Discovered</span>
                  <span className="text-xl font-black text-white mt-1">
                    {pdfResult?.stats?.totalExtracted || 0}
                  </span>
                  <span className="text-[10px] text-indigo-400 mt-0.5">from document</span>
                </div>

                <div className="bg-[#0f1118] border border-gray-800 rounded-2xl p-3.5 flex flex-col">
                  <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Synced to Database</span>
                  <span className="text-xl font-black text-emerald-400 mt-1">
                    {pdfResult?.stats?.totalImported || 0}
                  </span>
                  <span className="text-[10px] text-emerald-500/80 mt-0.5">in products_{pdfSellerSlug}</span>
                </div>

                <div className="bg-[#0f1118] border border-gray-800 rounded-2xl p-3.5 flex flex-col">
                  <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Processing Time</span>
                  <span className="text-xl font-black text-purple-300 mt-1">
                    {pdfResult?.stats?.processingTimeMs ? `${(pdfResult.stats.processingTimeMs / 1000).toFixed(1)}s` : "0.0s"}
                  </span>
                  <span className="text-[10px] text-gray-500 mt-0.5">Gemini Vision AI</span>
                </div>

                <div className="bg-[#0f1118] border border-gray-800 rounded-2xl p-3.5 flex flex-col">
                  <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Doc Size</span>
                  <span className="text-xl font-black text-blue-400 mt-1">
                    {pdfResult?.stats?.fileSizeKb ? `${pdfResult.stats.fileSizeKb} KB` : "0 KB"}
                  </span>
                  <span className="text-[10px] text-gray-500 mt-0.5">binary payload</span>
                </div>
              </div>

              {/* Extracted Company Details Banner if present */}
              {pdfResult?.company?.name && (
                <div className="bg-[#0f1118] border border-gray-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        Brand Identified
                      </span>
                      <h3 className="text-sm font-black text-white">{pdfResult.company.name}</h3>
                    </div>
                    {pdfResult.company.tagline && (
                      <p className="text-[11px] text-gray-400 italic">"{pdfResult.company.tagline}"</p>
                    )}
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-gray-400 pt-1">
                      {pdfResult.company.phone && <span>📞 {pdfResult.company.phone}</span>}
                      {pdfResult.company.email && <span>✉️ {pdfResult.company.email}</span>}
                      {pdfResult.company.website && <span>🌐 {pdfResult.company.website}</span>}
                    </div>
                  </div>

                  {/* Manual Commit All Action if some items are not yet saved */}
                  {pdfResult.products && pdfResult.products.length > 0 && pdfResult.stats?.totalImported < pdfResult.products.length && (
                    <Button
                      type="button"
                      disabled={isCommitting}
                      onClick={handleCommitPdfItems}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl px-4 py-2 cursor-pointer shrink-0 shadow-lg shadow-emerald-600/20"
                    >
                      {isCommitting ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <Check className="w-3.5 h-3.5 mr-1.5" />}
                      Commit All to Database
                    </Button>
                  )}
                </div>
              )}

              {/* Extracted Products List / Catalog Grid */}
              <div className="bg-[#0f1118] border border-gray-800 rounded-3xl p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-800">
                  <div>
                    <h3 className="text-sm font-bold text-white">Extracted Catalog Listings</h3>
                    <p className="text-[11px] text-gray-400">
                      {pdfResult?.products ? `${pdfResult.products.length} items parsed from PDF` : "No document scraped yet"}
                    </p>
                  </div>

                  {pdfResult?.products && pdfResult.products.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        const blob = new Blob([JSON.stringify(pdfResult.products, null, 2)], { type: "application/json" });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = `extracted_catalog_${pdfSellerSlug}.json`;
                        a.click();
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-900 hover:bg-gray-800 border border-gray-700 text-[11px] font-semibold text-gray-300 hover:text-white transition-colors"
                    >
                      <Download className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Export JSON</span>
                    </button>
                  )}
                </div>

                {/* Empty State */}
                {(!pdfResult || !pdfResult.products || pdfResult.products.length === 0) ? (
                  <div className="py-16 text-center flex flex-col items-center justify-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gray-900 border border-gray-800 flex items-center justify-center text-gray-600">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-300">No Catalog Extracted Yet</p>
                      <p className="text-[11px] text-gray-500 max-w-sm mt-1">
                        Upload a PDF brochure, price list, or real estate sheet on the left and run the scraper.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1 custom-scrollbar">
                    {pdfResult.products.map((item: any, idx: number) => (
                      <div
                        key={idx}
                        className="bg-[#090b10] border border-gray-800/90 hover:border-gray-700 rounded-2xl p-4 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
                      >
                        <div className="flex items-start gap-3.5 min-w-0 flex-1">
                          <img
                            src={item.dataUrl || item.primaryImage || "/placeholder.jpg"}
                            alt={item.title}
                            className="w-12 h-12 rounded-xl object-cover border border-gray-800 shrink-0 bg-gray-900"
                            onError={(e: any) => {
                              e.target.src = "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&q=80";
                            }}
                          />
                          <div className="min-w-0 flex-1 space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-bold text-white text-xs tracking-tight group-hover:text-indigo-300 transition-colors">
                                {item.title}
                              </span>
                              <span className="text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                                {item.category || "General"}
                              </span>
                              {item.discount && (
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                  {item.discount}
                                </span>
                              )}
                            </div>

                            <p className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed">
                              {item.description}
                            </p>

                            {/* Specs Pills */}
                            {item.specs && item.specs.length > 0 && (
                              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                {item.specs.slice(0, 4).map((spec: any, sIdx: number) => (
                                  <span
                                    key={sIdx}
                                    className="text-[10px] px-2 py-0.5 rounded-md bg-gray-900 border border-gray-800 text-gray-300"
                                  >
                                    <strong className="text-gray-400 font-semibold">{spec.key}:</strong> {spec.value}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Price & Sync Badge */}
                        <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-900 gap-1.5">
                          <div className="text-right">
                            <div className="text-sm font-black text-white">
                              {item.price > 0 ? `₹${item.price.toLocaleString("en-IN")}` : "Custom Quote"}
                            </div>
                            {item.originalPrice && item.originalPrice > item.price && (
                              <div className="text-[10px] text-gray-500 line-through">
                                ₹{item.originalPrice.toLocaleString("en-IN")}
                              </div>
                            )}
                          </div>

                          {item.importedToDb ? (
                            <span className="text-[10px] font-bold text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Synced to DB
                            </span>
                          ) : (
                            <span className="text-[10px] font-semibold text-amber-400 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                              Preview Only
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: MERCHANT WEBSITE SCRAPER & HEADLESS CRAWLER                        */}
      {/* ========================================================================= */}
      {activeTab === "web" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Module: Web Scraper & Catalog Crawler */}
          <div className="bg-[#0f1118] border border-gray-800 rounded-3xl p-6 shadow-xl space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-gray-800">
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">Merchant Website Scraper</h2>
                <p className="text-[11px] text-gray-400">Extract products and import into isolated tenant catalog</p>
              </div>
            </div>

            <form onSubmit={handleRunCrawler} className="space-y-4 text-xs">
              <div>
                <label className="text-gray-300 font-semibold mb-1 block">Target Website URL</label>
                <input
                  type="url"
                  placeholder="https://example.com"
                  value={crawlUrl}
                  onChange={(e) => setCrawlUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gray-900 border border-gray-800 text-white font-mono text-xs focus:border-indigo-500 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-300 font-semibold mb-1 block">Target Merchant</label>
                  <select
                    value={selectedSellerSlug}
                    onChange={(e) => setSelectedSellerSlug(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-gray-900 border border-gray-800 text-white font-semibold text-xs focus:border-indigo-500 outline-none"
                  >
                    {sellers.map((s) => (
                      <option key={s.slug} value={s.slug}>
                        {s.storeName} ({s.slug})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-gray-300 font-semibold mb-1 block">Crawl Mode</label>
                  <select
                    value={crawlDepth}
                    onChange={(e) => setCrawlDepth(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl bg-gray-900 border border-gray-800 text-white font-semibold text-xs focus:border-indigo-500 outline-none"
                  >
                    <option value="fast">Fast Headless Extract</option>
                    <option value="deep">Deep Multi-Page Crawl</option>
                  </select>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isCrawling}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-black rounded-xl h-11 shadow-lg shadow-indigo-600/20 cursor-pointer"
              >
                {isCrawling ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" /> Crawling & Ingesting Listings...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2 fill-white" /> Start Web Crawler Job
                  </>
                )}
              </Button>
            </form>

            {/* Terminal Console Logs */}
            <div className="bg-[#090b10] border border-gray-800 rounded-2xl p-3.5 space-y-2 font-mono text-[11px]">
              <div className="flex items-center justify-between text-gray-500 pb-1 border-b border-gray-900">
                <span className="flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-indigo-400" /> Live Scraper Logs
                </span>
                <span>STDOUT</span>
              </div>
              <div className="space-y-1 text-gray-300 max-h-48 overflow-y-auto custom-scrollbar">
                {crawlLogs.length === 0 ? (
                  <span className="text-gray-600">Waiting for crawler execution...</span>
                ) : (
                  crawlLogs.map((log, i) => (
                    <div key={i} className="text-indigo-300/90 leading-relaxed">
                      {log}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Web Crawler Results View */}
          <div className="bg-[#0f1118] border border-gray-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-800">
              <h2 className="text-sm font-bold text-white">Crawled Listings Output</h2>
              <span className="text-[11px] text-gray-400">
                {crawlResult ? `${crawlResult.products?.length || crawlResult.count || 0} items extracted` : "No job completed yet"}
              </span>
            </div>

            {crawlResult?.products && crawlResult.products.length > 0 ? (
              <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1 custom-scrollbar">
                {crawlResult.products.map((item: any, i: number) => (
                  <div key={i} className="p-3 bg-gray-900/60 border border-gray-800 rounded-2xl flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={item.image || "/placeholder.jpg"}
                        alt={item.title}
                        className="w-10 h-10 rounded-lg object-cover border border-gray-800 bg-gray-900 shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate">{item.title}</p>
                        <p className="text-[10px] text-gray-400">{item.category}</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-white shrink-0">
                      ₹{Number(item.price || 0).toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-20 text-center flex flex-col items-center justify-center gap-2">
                <Globe className="w-8 h-8 text-gray-700" />
                <p className="text-xs text-gray-500">Run a website crawl job to view extracted products here.</p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: GEMINI AI NATURAL LANGUAGE DISCOVERY CONSOLE                       */}
      {/* ========================================================================= */}
      {activeTab === "ai" && (
        <div className="bg-[#0f1118] border border-gray-800 rounded-3xl p-6 shadow-xl space-y-5 max-w-4xl mx-auto">
          <div className="flex items-center justify-between pb-3 border-b border-gray-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">Gemini AI Search Engine Console</h2>
                <p className="text-[11px] text-gray-400">Natural language search reasoning and JSON query generator</p>
              </div>
            </div>

            {/* Model Selector */}
            <select
              value={selectedModel}
              onChange={(e) => handleSaveModelPreference(e.target.value)}
              className="bg-gray-900 border border-gray-800 text-purple-300 font-bold text-[11px] rounded-lg px-2.5 py-1 outline-none"
            >
              <option value="gemini-2.5-flash">gemini-2.5-flash (Recommended)</option>
              <option value="gemini-3.6-flash">gemini-3.6-flash</option>
              <option value="gemini-3.8-flash">gemini-3.8-flash</option>
              <option value="gemini-flash-latest">gemini-flash-latest</option>
            </select>
          </div>

          <form onSubmit={handleTestAiSearch} className="space-y-4 text-xs">
            <div>
              <label className="text-gray-300 font-semibold mb-1 block">Test Customer Search Prompt</label>
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="e.g. Find villas in Pune under 2 Cr"
                  value={testQuery}
                  onChange={(e) => setTestQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-900 border border-gray-800 text-white font-semibold text-xs focus:border-purple-500 outline-none"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isTestingAi}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white text-xs font-black rounded-xl h-11 shadow-lg shadow-purple-600/20 cursor-pointer"
            >
              {isTestingAi ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" /> Testing Gemini Reasoning...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" /> Test AI Search Pipeline
                </>
              )}
            </Button>
          </form>

          {/* AI Response Output */}
          <div className="bg-[#090b10] border border-gray-800 rounded-2xl p-3.5 space-y-2 font-mono text-[11px]">
            <div className="flex items-center justify-between text-gray-500 pb-1 border-b border-gray-900">
              <span>Gemini Model Output</span>
              <span className="text-purple-400 font-bold">{selectedModel}</span>
            </div>
            <div className="text-gray-300 max-h-56 overflow-y-auto whitespace-pre-wrap custom-scrollbar">
              {isTestingAi ? (
                <span className="text-purple-300 animate-pulse">Running AI pipeline query...</span>
              ) : aiResponse ? (
                <div className="space-y-1">
                  <p className="text-gray-200 font-sans font-medium text-xs">
                    {aiResponse.message || aiResponse.text || "AI Query Processed Successfully."}
                  </p>
                  <p className="text-gray-500 text-[10px]">
                    Matched Listings: {aiResponse.listings?.length || 0}
                  </p>
                </div>
              ) : (
                <span className="text-gray-600">Enter a prompt above and click "Test AI Search Pipeline" to inspect response.</span>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
