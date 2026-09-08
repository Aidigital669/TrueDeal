"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Store, Box, MessageSquare, Users, Database, 
  TrendingUp, Activity, ShieldCheck, ArrowRight, 
  RefreshCw, CheckCircle2, Clock, Globe, Bot, 
  Sparkles, ExternalLink, Zap, Layers, AlertCircle,
  Plus, Check, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  getAdminOverviewStats, 
  impersonateSellerAction, 
  updateInquiryStatusAction,
  runAdminMaintenanceAction 
} from "@/lib/admin-actions";

export default function AdminExecutiveDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const router = useRouter();

  const loadStats = async () => {
    try {
      const res = await getAdminOverviewStats();
      if (res.success) {
        setData(res);
      }
    } catch (err) {
      console.error("Error loading stats:", err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadStats();
  };

  const handleImpersonate = async (slug: string) => {
    const res = await impersonateSellerAction(slug);
    if (res.success && res.redirect) {
      router.push(res.redirect);
    }
  };

  const handleQuickStatus = async (id: string, status: any) => {
    await updateInquiryStatusAction(id, status);
    setActionNotice(`Inquiry marked as ${status}`);
    setTimeout(() => setActionNotice(null), 3000);
    loadStats();
  };

  const stats = data?.stats || {
    totalUsers: 0,
    totalSellers: 0,
    totalProducts: 0,
    totalInquiries: 0,
    pendingInquiries: 0,
    totalPortfolios: 0,
    totalCollections: 1,
    pingMs: 12,
    databaseName: "Truedeal"
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans pb-12">
      
      {/* Top Welcome & Quick Actions Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-gray-900 via-[#131722] to-gray-900 p-6 rounded-3xl border border-gray-800 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-full bg-gradient-to-l from-indigo-500/10 to-transparent pointer-events-none" />
        
        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-black uppercase tracking-wider border border-indigo-500/30">
              Live Operations Control
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs text-gray-400 font-mono">Atlas MongoDB Latency: {stats.pingMs}ms</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Master Executive Overview
          </h1>
          <p className="text-xs sm:text-sm text-gray-400">
            Real-time multi-tenant supervision, catalog telemetry, and buyer inquiry dispatch.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 relative z-10">
          <Button
            onClick={handleRefresh}
            disabled={isRefreshing}
            variant="outline"
            className="bg-gray-900/80 border-gray-700 text-gray-200 hover:text-white hover:bg-gray-800 text-xs font-bold rounded-xl h-10 px-3 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isRefreshing ? "animate-spin text-indigo-400" : ""}`} />
            Refresh Telemetry
          </Button>

          <Link href="/admin/crawlers">
            <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-black rounded-xl h-10 px-4 shadow-lg shadow-indigo-600/20 cursor-pointer">
              <Bot className="w-3.5 h-3.5 mr-1.5" />
              Launch Scraper
            </Button>
          </Link>
        </div>
      </div>

      {actionNotice && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold rounded-2xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* 4 Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Sellers KPI */}
        <div className="bg-[#0f1118] border border-gray-800 rounded-3xl p-5 relative overflow-hidden group hover:border-indigo-500/40 transition-all shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Multi-Tenant Stores</span>
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Store className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-white tracking-tight">{stats.totalSellers}</div>
            <div className="mt-1 flex items-center gap-2 text-xs font-semibold text-gray-400">
              <span className="text-emerald-400 font-bold">{stats.totalPortfolios} Published</span>
              <span>•</span>
              <Link href="/admin/sellers" className="text-indigo-400 hover:underline flex items-center gap-0.5">
                Manage <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* Global Catalog Listings KPI */}
        <div className="bg-[#0f1118] border border-gray-800 rounded-3xl p-5 relative overflow-hidden group hover:border-purple-500/40 transition-all shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Listings</span>
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Box className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-white tracking-tight">{stats.totalProducts}</div>
            <div className="mt-1 flex items-center gap-2 text-xs font-semibold text-gray-400">
              <span className="text-purple-400 font-bold">Across {stats.totalCollections} Collections</span>
              <span>•</span>
              <Link href="/admin/products" className="text-indigo-400 hover:underline flex items-center gap-0.5">
                Explore <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* Inquiries & RFQ Leads KPI */}
        <div className="bg-[#0f1118] border border-gray-800 rounded-3xl p-5 relative overflow-hidden group hover:border-amber-500/40 transition-all shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Buyer Inquiries</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <MessageSquare className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-white tracking-tight">{stats.totalInquiries}</div>
            <div className="mt-1 flex items-center gap-2 text-xs font-semibold text-gray-400">
              <span className="text-amber-400 font-bold">{stats.pendingInquiries} New Leads</span>
              <span>•</span>
              <Link href="/admin/inquiries" className="text-indigo-400 hover:underline flex items-center gap-0.5">
                Dispatch <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* Registered Platform Users KPI */}
        <div className="bg-[#0f1118] border border-gray-800 rounded-3xl p-5 relative overflow-hidden group hover:border-emerald-500/40 transition-all shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Registered Accounts</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-white tracking-tight">{stats.totalUsers}</div>
            <div className="mt-1 flex items-center gap-2 text-xs font-semibold text-gray-400">
              <span className="text-emerald-400 font-bold">{stats.totalCustomers} Buyers</span>
              <span>•</span>
              <Link href="/admin/users" className="text-indigo-400 hover:underline flex items-center gap-0.5">
                Users <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>

      </div>

      {/* Multi-Tenant Collections Telemetry Bar */}
      <div className="bg-[#0f1118] border border-gray-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Multi-Tenant Database Collections</h2>
              <p className="text-xs text-gray-400">Isolated product catalogs partitioned by seller slug inside Truedeal DB</p>
            </div>
          </div>
          <Link href="/admin/database" className="text-xs font-bold text-indigo-400 hover:underline flex items-center gap-1">
            Database Center <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {data?.collectionStats && data.collectionStats.length > 0 ? (
            data.collectionStats.map((col: any) => (
              <div 
                key={col.name} 
                className="bg-gray-900/60 border border-gray-800 rounded-2xl p-3 flex items-center justify-between hover:border-gray-700 transition-colors"
              >
                <div className="flex flex-col truncate pr-2">
                  <span className="text-xs font-mono font-bold text-gray-200 truncate">{col.name}</span>
                  <span className="text-[10px] text-gray-400">
                    {col.name === "products" ? "Master Global Collection" : "Tenant Partition"}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-300 font-mono font-bold text-xs shrink-0">
                  {col.count} items
                </span>
              </div>
            ))
          ) : (
            <div className="col-span-full py-4 text-center text-xs text-gray-500">
              No isolated collections found.
            </div>
          )}
        </div>
      </div>

      {/* 2-Column Operational Grid: Inquiries & Registered Merchants */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Buyer Inquiries Stream */}
        <div className="bg-[#0f1118] border border-gray-800 rounded-3xl p-6 shadow-xl space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-gray-800/80">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-amber-400" />
                <h2 className="text-sm font-bold text-white">Live RFQ & Inquiry Pipeline</h2>
              </div>
              <Link href="/admin/inquiries" className="text-xs font-bold text-amber-400 hover:underline">
                View All Leads
              </Link>
            </div>

            <div className="divide-y divide-gray-800/60 mt-2">
              {data?.recentInquiries && data.recentInquiries.length > 0 ? (
                data.recentInquiries.map((inq: any) => (
                  <div key={inq._id} className="py-3 flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-200">{inq.name || "Anonymous Buyer"}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-800 text-gray-400 font-mono">
                          {inq.phone || inq.email || "Direct Inquiry"}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 line-clamp-1">
                        <span className="text-indigo-400 font-semibold">[{inq.sellerSlug || "store"}]: </span>
                        {inq.message || inq.productTitle || "General Inquiry"}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        inq.status === "RESOLVED" 
                          ? "bg-emerald-500/20 text-emerald-300" 
                          : inq.status === "IN_PROGRESS"
                          ? "bg-blue-500/20 text-blue-300"
                          : "bg-amber-500/20 text-amber-300"
                      }`}>
                        {inq.status || "NEW"}
                      </span>
                      {inq.status !== "RESOLVED" && (
                        <button
                          type="button"
                          onClick={() => handleQuickStatus(inq._id, "RESOLVED")}
                          className="p-1 rounded-md bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-[10px] font-bold transition-colors"
                          title="Mark Resolved"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-gray-500">
                  No buyer inquiries received yet.
                </div>
              )}
            </div>
          </div>

          <Link href="/admin/inquiries">
            <Button variant="outline" className="w-full bg-gray-900 border-gray-800 text-gray-300 hover:text-white text-xs font-bold rounded-xl h-10">
              Open Full Inquiries Dispatch Hub <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </Link>
        </div>

        {/* Registered Sellers & Quick Impersonate Hub */}
        <div className="bg-[#0f1118] border border-gray-800 rounded-3xl p-6 shadow-xl space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-gray-800/80">
              <div className="flex items-center gap-2">
                <Store className="w-4 h-4 text-indigo-400" />
                <h2 className="text-sm font-bold text-white">Merchant Stores & Quick Impersonation</h2>
              </div>
              <Link href="/admin/sellers" className="text-xs font-bold text-indigo-400 hover:underline">
                All Sellers
              </Link>
            </div>

            <div className="divide-y divide-gray-800/60 mt-2">
              {data?.recentSellers && data.recentSellers.length > 0 ? (
                data.recentSellers.map((seller: any) => (
                  <div key={seller._id} className="py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-black text-xs shrink-0">
                        {seller.storeName?.slice(0, 2).toUpperCase() || "ST"}
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-gray-200">{seller.storeName}</span>
                          {seller.isVerified && (
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          )}
                        </div>
                        <p className="text-[11px] text-gray-400 font-mono truncate">
                          slug: /{seller.slug}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/p/${seller.slug}`}
                        target="_blank"
                        className="px-2.5 py-1 rounded-lg bg-gray-900 hover:bg-gray-800 text-[11px] font-bold text-gray-300 hover:text-white border border-gray-800 transition-colors inline-flex items-center gap-1"
                        title="View Public Storefront"
                      >
                        <ExternalLink className="w-3 h-3" /> Store
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleImpersonate(seller.slug)}
                        className="px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40 text-[11px] font-bold text-indigo-300 hover:text-white border border-indigo-500/30 transition-colors cursor-pointer"
                        title="Login as Seller"
                      >
                        Impersonate
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-gray-500">
                  No registered sellers yet.
                </div>
              )}
            </div>
          </div>

          <Link href="/admin/sellers">
            <Button variant="outline" className="w-full bg-gray-900 border-gray-800 text-gray-300 hover:text-white text-xs font-bold rounded-xl h-10">
              Manage All Multi-Tenant Sellers <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </Link>
        </div>

      </div>

    </div>
  );
}
