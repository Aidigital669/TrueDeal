"use client";

import { useState, useEffect } from "react";
import { 
  Bot, Sparkles, Globe, Play, CheckCircle2, 
  AlertCircle, Loader2, ArrowRight, Layers, 
  Search, ExternalLink, RefreshCw, Terminal, Sliders
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAdminSellersList, getAdminPlatformSettings, updateAdminPlatformSettings } from "@/lib/admin-actions";

export default function AdminCrawlersPage() {
  const [sellers, setSellers] = useState<any[]>([]);
  const [crawlUrl, setCrawlUrl] = useState("https://anvreealty.com");
  const [selectedSellerSlug, setSelectedSellerSlug] = useState("anvreeality");
  const [crawlDepth, setCrawlDepth] = useState<"fast" | "deep">("fast");
  const [isCrawling, setIsCrawling] = useState(false);
  const [crawlLogs, setCrawlLogs] = useState<string[]>([]);
  const [crawlResult, setCrawlResult] = useState<any | null>(null);

  // Gemini AI Test state
  const [testQuery, setTestQuery] = useState("Find verified luxury 3BHK flats with swimming pool");
  const [isTestingAi, setIsTestingAi] = useState(false);
  const [aiResponse, setAiResponse] = useState<any | null>(null);
  const [selectedModel, setSelectedModel] = useState("gemini-2.0-flash");
  const [saveNotice, setSaveNotice] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      const [sellersRes, settingsRes] = await Promise.all([
        getAdminSellersList(),
        getAdminPlatformSettings()
      ]);
      if (sellersRes.success) setSellers(sellersRes.sellers);
      if (settingsRes.success && settingsRes.settings.geminiModel) {
        setSelectedModel(settingsRes.settings.geminiModel);
      }
    }
    init();
  }, []);

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
    <div className="space-y-6 max-w-7xl mx-auto font-sans pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Bot className="w-6 h-6 text-purple-400" />
            AI Search Engine & Web Crawler Control
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Trigger headless crawlers to ingest products into tenant databases and test Gemini AI search discovery.
          </p>
        </div>
      </div>

      {saveNotice && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold rounded-2xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{saveNotice}</span>
        </div>
      )}

      {/* 2 Column Control Modules */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Module 1: Web Scraper & Catalog Crawler */}
        <div className="bg-[#0f1118] border border-gray-800 rounded-3xl p-6 shadow-xl space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-800">
            <Globe className="w-5 h-5 text-indigo-400" />
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
            <div className="space-y-1 text-gray-300 max-h-40 overflow-y-auto">
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

        {/* Module 2: Gemini AI Natural Language Discovery Console */}
        <div className="bg-[#0f1118] border border-gray-800 rounded-3xl p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-gray-800">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <div>
                <h2 className="text-sm font-bold text-white">Gemini AI Search Engine</h2>
                <p className="text-[11px] text-gray-400">Natural language search reasoning and JSON query generator</p>
              </div>
            </div>

            {/* Model Selector */}
            <select
              value={selectedModel}
              onChange={(e) => handleSaveModelPreference(e.target.value)}
              className="bg-gray-900 border border-gray-800 text-purple-300 font-bold text-[11px] rounded-lg px-2.5 py-1 outline-none"
            >
              <option value="gemini-2.0-flash">gemini-2.0-flash</option>
              <option value="gemini-1.5-flash">gemini-1.5-flash</option>
              <option value="gemini-1.5-pro">gemini-1.5-pro</option>
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
            <div className="text-gray-300 max-h-40 overflow-y-auto whitespace-pre-wrap">
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

      </div>

    </div>
  );
}
