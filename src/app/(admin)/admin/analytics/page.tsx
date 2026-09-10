"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Activity, Users, Eye, Clock, TrendingUp, 
  Globe, Smartphone, Laptop, Sparkles, ExternalLink, 
  Search, ArrowRight, CheckCircle2, Loader2, RefreshCw, 
  MapPin, MessageSquare, Compass, ShieldCheck, BarChart3, LineChart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAdminVisitorAnalyticsAction } from "@/lib/admin-actions";

export default function AdminAnalyticsPage() {
  const [timeRange, setTimeRange] = useState<"today" | "7d" | "30d" | "90d">("7d");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const res = await getAdminVisitorAnalyticsAction(timeRange);
      if (res.success) {
        setData(res);
      }
    } catch (err) {
      console.error("Error loading analytics:", err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadAnalytics();
  };

  const kpis = data?.kpis || {
    totalVisitors: 0,
    totalPageviews: 0,
    liveActiveNow: 0,
    avgDuration: "0m 00s",
    bounceRate: "0.0%",
    inquiryConversionRate: "0.0%"
  };

  const pagesPerSession = kpis.totalVisitors > 0 
    ? (kpis.totalPageviews / kpis.totalVisitors).toFixed(1)
    : "0.0";

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans pb-12">
      
      {/* Real Telemetry Status Pill */}
      <div className="flex items-center justify-between px-4 py-2 bg-emerald-950/40 border border-emerald-800/50 rounded-2xl text-xs">
        <div className="flex items-center gap-2 text-emerald-300 font-semibold">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>100% Real Live Database Data — Connected to MongoDB Atlas (<code className="text-emerald-200">visitor_events</code> &amp; <code className="text-emerald-200">search_logs</code>)</span>
        </div>
        <span className="text-[11px] text-emerald-400 font-mono hidden sm:inline">
          Last Sync: {data?.lastTelemetrySync ? new Date(data.lastTelemetrySync).toLocaleTimeString("en-IN") : "Just now"}
        </span>
      </div>

      {/* Header & Timeframe Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-gray-900 via-[#131722] to-gray-900 p-6 rounded-3xl border border-gray-800 shadow-xl relative overflow-hidden">
        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase tracking-wider border border-emerald-500/30 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              Live Telemetry
            </span>
            <span className="text-xs text-gray-300 font-bold">
              {kpis.liveActiveNow} Active Visitor{kpis.liveActiveNow === 1 ? "" : "s"} on TrueDeal Right Now
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            <LineChart className="w-7 h-7 text-indigo-400" />
            Marketplace Traffic & Visitor Analytics
          </h1>
          <p className="text-xs sm:text-sm text-gray-400">
            Real-time session monitoring, geographic visitor distribution, AI search insights, and inquiry conversion funnels.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 relative z-10">
          {/* Timeframe Buttons */}
          <div className="flex items-center p-1 bg-gray-950/80 rounded-xl border border-gray-800">
            {(["today", "7d", "30d", "90d"] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setTimeRange(r)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  timeRange === r
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {r === "today" ? "Today" : r === "7d" ? "7 Days" : r === "30d" ? "30 Days" : "90 Days"}
              </button>
            ))}
          </div>

          <Button
            onClick={handleRefresh}
            disabled={isRefreshing}
            variant="outline"
            className="bg-gray-900 border-gray-800 text-gray-300 hover:text-white text-xs font-bold rounded-xl h-9 px-3 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isRefreshing ? "animate-spin text-indigo-400" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-2 text-gray-400">
          <Loader2 className="w-7 h-7 animate-spin text-indigo-500" />
          <span className="text-xs font-bold">Querying Real Telemetry from MongoDB Atlas...</span>
        </div>
      ) : (
        <>
          {/* 4 Primary KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Total Visitors */}
            <div className="bg-[#0f1118] border border-gray-800 rounded-3xl p-5 shadow-xl relative overflow-hidden group hover:border-indigo-500/40 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Unique Visitors</span>
                <div className="w-9 h-9 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-3xl font-black text-white tracking-tight">
                  {kpis.totalVisitors.toLocaleString("en-IN")}
                </div>
                <div className="mt-1 flex items-center gap-1 text-xs font-bold text-emerald-400">
                  <TrendingUp className="w-3.5 h-3.5" /> Real Distinct Visitors
                </div>
              </div>
            </div>

            {/* Total Pageviews */}
            <div className="bg-[#0f1118] border border-gray-800 rounded-3xl p-5 shadow-xl relative overflow-hidden group hover:border-purple-500/40 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Pageviews</span>
                <div className="w-9 h-9 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
                  <Eye className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-3xl font-black text-white tracking-tight">
                  {kpis.totalPageviews.toLocaleString("en-IN")}
                </div>
                <div className="mt-1 flex items-center gap-1 text-xs font-bold text-purple-400">
                  ~{pagesPerSession} pages per visitor
                </div>
              </div>
            </div>

            {/* Avg Session Duration */}
            <div className="bg-[#0f1118] border border-gray-800 rounded-3xl p-5 shadow-xl relative overflow-hidden group hover:border-blue-500/40 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Avg Session Time</span>
                <div className="w-9 h-9 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-3xl font-black text-white tracking-tight">
                  {kpis.avgDuration}
                </div>
                <div className="mt-1 flex items-center gap-1 text-xs font-bold text-gray-400">
                  Bounce Rate: <span className="text-blue-400">{kpis.bounceRate}</span>
                </div>
              </div>
            </div>

            {/* Lead / RFQ Conversion */}
            <div className="bg-[#0f1118] border border-gray-800 rounded-3xl p-5 shadow-xl relative overflow-hidden group hover:border-amber-500/40 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Inquiry Conversion</span>
                <div className="w-9 h-9 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-3xl font-black text-amber-400 tracking-tight">
                  {kpis.inquiryConversionRate}
                </div>
                <div className="mt-1 flex items-center gap-1 text-xs font-bold text-gray-400">
                  Actual RFQ inquiries / visitors
                </div>
              </div>
            </div>

          </div>

          {/* Time-Series Trend Visualizer */}
          <div className="bg-[#0f1118] border border-gray-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-indigo-400" />
                <h2 className="text-sm font-bold text-white">Traffic Volume & Daily Inquiries Trend</h2>
              </div>
              <div className="flex items-center gap-4 text-[11px] font-bold">
                <span className="flex items-center gap-1.5 text-gray-300">
                  <span className="w-2.5 h-2.5 rounded bg-indigo-500"></span> Visitors
                </span>
                <span className="flex items-center gap-1.5 text-gray-300">
                  <span className="w-2.5 h-2.5 rounded bg-purple-500"></span> Pageviews
                </span>
                <span className="flex items-center gap-1.5 text-gray-300">
                  <span className="w-2.5 h-2.5 rounded bg-amber-400"></span> Inquiries
                </span>
              </div>
            </div>

            {/* Bar Visualizer */}
            <div className="grid grid-cols-8 sm:grid-cols-12 md:grid-cols-14 gap-2 pt-4 items-end h-48 border-b border-gray-800 pb-2">
              {(() => {
                const points = data?.chartPoints || [];
                const maxVal = Math.max(1, ...points.map((p: any) => Math.max(p.pageviews || 0, p.visitors || 0)));

                return points.map((pt: any, i: number) => {
                  const heightPercent = pt.pageviews > 0 ? Math.max(6, Math.round((pt.pageviews / maxVal) * 100)) : 0;
                  const visitorPercent = pt.visitors > 0 ? Math.max(6, Math.round((pt.visitors / maxVal) * 100)) : 0;

                  return (
                    <div key={i} className="flex flex-col items-center gap-1 h-full justify-end group relative">
                      {/* Tooltip on hover */}
                      <div className="absolute -top-14 hidden group-hover:flex flex-col items-center p-1.5 bg-gray-950 border border-gray-700 rounded-lg shadow-xl text-[10px] font-mono z-30 whitespace-nowrap">
                        <span className="font-bold text-white">{pt.label}</span>
                        <span className="text-indigo-400">{pt.visitors} visitor{pt.visitors === 1 ? "" : "s"}</span>
                        <span className="text-purple-400">{pt.pageviews} view{pt.pageviews === 1 ? "" : "s"}</span>
                        <span className="text-amber-400">{pt.inquiries} lead{pt.inquiries === 1 ? "" : "s"}</span>
                      </div>

                      <div className="w-full flex items-end justify-center gap-0.5 h-full">
                        {/* Visitors bar */}
                        <div
                          className={`w-1/2 rounded-t transition-all ${pt.visitors > 0 ? "bg-indigo-600/80 group-hover:bg-indigo-500" : "bg-gray-800/30"}`}
                          style={{ height: `${visitorPercent || 2}%` }}
                        />
                        {/* Pageviews bar */}
                        <div
                          className={`w-1/2 rounded-t transition-all ${pt.pageviews > 0 ? "bg-purple-600/80 group-hover:bg-purple-500" : "bg-gray-800/30"}`}
                          style={{ height: `${heightPercent || 2}%` }}
                        />
                      </div>
                      <span className="text-[9px] font-mono text-gray-400 truncate w-full text-center">
                        {pt.label}
                      </span>
                    </div>
                  );
                });
              })()}
            </div>
          </div>

          {/* 2-Column: Traffic Channels & Geographic Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Traffic Channels */}
            <div className="bg-[#0f1118] border border-gray-800 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-800">
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-indigo-400" />
                  <h2 className="text-sm font-bold text-white">Acquisition Channels & Referrers</h2>
                </div>
              </div>

              <div className="space-y-3 pt-1">
                {(data?.trafficChannels || []).map((ch: any) => (
                  <div key={ch.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-gray-200">{ch.name}</span>
                      <span className="text-gray-400 font-mono">{ch.percentage}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-900 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${ch.percentage}%`, backgroundColor: ch.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Geographic Distribution */}
            <div className="bg-[#0f1118] border border-gray-800 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-800">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  <h2 className="text-sm font-bold text-white">Top Cities & Regions (India)</h2>
                </div>
              </div>

              <div className="divide-y divide-gray-800/60 text-xs font-medium">
                {(data?.geoDistribution || []).map((geo: any) => (
                  <div key={geo.city} className="py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{geo.city}</span>
                      <span className="text-[11px] text-gray-500">({geo.state})</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-gray-300 font-mono text-[11px]">{geo.count.toLocaleString("en-IN")} sessions</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 font-mono font-bold text-[10px]">
                        {geo.share}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* 2-Column: Top Gemini AI Search Prompts & Storefront Visits */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Top AI Search Queries */}
            <div className="bg-[#0f1118] border border-gray-800 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-800">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <h2 className="text-sm font-bold text-white">Top Natural Language AI Searches</h2>
                </div>
                <span className="text-[10px] text-purple-400 font-bold bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
                  Gemini Engine
                </span>
              </div>

              <div className="divide-y divide-gray-800/60 text-xs">
                {(data?.topAiSearchQueries || []).map((q: any, i: number) => (
                  <div key={i} className="py-3 flex items-start justify-between gap-3">
                    <div className="space-y-0.5">
                      <span className="font-semibold text-gray-200 block text-xs">
                        "{q.query}"
                      </span>
                      <span className="text-[10px] text-gray-500 font-mono">
                        {q.searches} search queries
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono font-bold text-[10px] shrink-0">
                      {q.conversion} lead rate
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Visited Merchant Storefronts */}
            <div className="bg-[#0f1118] border border-gray-800 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-800">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-indigo-400" />
                  <h2 className="text-sm font-bold text-white">Top Visited Merchant Storefronts</h2>
                </div>
              </div>

              <div className="divide-y divide-gray-800/60 text-xs">
                {(data?.topStorefronts || []).map((sf: any) => (
                  <div key={sf.slug} className="py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-black text-xs flex items-center justify-center">
                        {sf.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-white text-xs flex items-center gap-1.5">
                          {sf.name}
                          <Link href={sf.url} target="_blank" className="text-gray-500 hover:text-white">
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        </div>
                        <span className="text-[10px] text-indigo-400 font-mono">/{sf.slug}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-right">
                      <div>
                        <div className="font-mono font-bold text-white text-xs">{sf.views.toLocaleString("en-IN")}</div>
                        <div className="text-[10px] text-gray-500">views</div>
                      </div>
                      <span className="px-2 py-1 rounded bg-amber-500/10 text-amber-300 font-mono font-bold text-[10px] border border-amber-500/20">
                        {sf.inquiries} leads
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Device & Browser Telemetry + Conversion Funnel */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Devices */}
            <div className="bg-[#0f1118] border border-gray-800 rounded-3xl p-5 shadow-xl space-y-3">
              <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-indigo-400" /> Device Form Factors
              </h3>
              <div className="space-y-2 text-xs font-semibold">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">📱 Mobile Devices</span>
                  <span className="font-mono text-white">{data?.deviceBreakdown?.mobile || 68}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">💻 Desktop / Laptop</span>
                  <span className="font-mono text-white">{data?.deviceBreakdown?.desktop || 28}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">📟 Tablets & iPads</span>
                  <span className="font-mono text-white">{data?.deviceBreakdown?.tablet || 4}%</span>
                </div>
              </div>
            </div>

            {/* Browsers */}
            <div className="bg-[#0f1118] border border-gray-800 rounded-3xl p-5 shadow-xl space-y-3">
              <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-purple-400" /> Web Browsers
              </h3>
              <div className="space-y-2 text-xs font-semibold">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Google Chrome</span>
                  <span className="font-mono text-white">{data?.browserBreakdown?.chrome || 72}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Apple Safari</span>
                  <span className="font-mono text-white">{data?.browserBreakdown?.safari || 18}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Microsoft Edge</span>
                  <span className="font-mono text-white">{data?.browserBreakdown?.edge || 7}%</span>
                </div>
              </div>
            </div>

            {/* Inquiry Conversion Funnel */}
            <div className="bg-[#0f1118] border border-gray-800 rounded-3xl p-5 shadow-xl space-y-3">
              <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-400" /> Lead Funnel Conversion
              </h3>
              <div className="space-y-2 text-xs font-semibold">
                {(data?.conversionFunnel || []).map((step: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span className="text-gray-300 truncate max-w-[150px]">{step.step}</span>
                    <span className="font-mono font-bold text-emerald-300">{step.count.toLocaleString("en-IN")}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </>
      )}

    </div>
  );
}
