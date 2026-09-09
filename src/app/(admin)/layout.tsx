"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, Store, Box, MessageSquare, 
  Users, Tags, Bot, Database, Settings, 
  PanelLeftClose, PanelLeftOpen, ShieldCheck, 
  ExternalLink, Sparkles, ArrowRight, Loader2,
  RefreshCw, CheckCircle2, LineChart
} from "lucide-react";
import AdminHeader from "@/components/layout/AdminHeader";
import { verifyAdminSession, impersonateSellerAction } from "@/lib/admin-actions";
import { UserSession } from "@/lib/auth-actions";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [userSession, setUserSession] = useState<UserSession | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAuthenticatingAdmin, setIsAuthenticatingAdmin] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await verifyAdminSession();
        if (res.isAdmin && res.user) {
          setUserSession(res.user);
        } else {
          router.push("/login");
        }
      } catch (err) {
        console.error("Admin auth check error:", err);
        router.push("/login");
      } finally {
        setIsCheckingAuth(false);
      }
    }
    checkAuth();
  }, [router]);

  const navItems = [
    { name: "Executive Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Traffic & Visitors", href: "/admin/analytics", icon: LineChart, badge: "Live" },
    { name: "Sellers & Portfolios", href: "/admin/sellers", icon: Store, badge: "Multi-Tenant" },
    { name: "Global Catalog", href: "/admin/products", icon: Box },
    { name: "RFQ & Buyer Leads", href: "/admin/inquiries", icon: MessageSquare },
    { name: "Users & Roles", href: "/admin/users", icon: Users },
    { name: "Marketplace Categories", href: "/admin/categories", icon: Tags },
    { name: "AI & Web Crawlers", href: "/admin/crawlers", icon: Bot, badge: "Gemini AI" },
    { name: "MongoDB & Diagnostics", href: "/admin/database", icon: Database },
    { name: "Platform Settings", href: "/admin/settings", icon: Settings },
  ];

  const handleQuickImpersonate = async (slug: string) => {
    const res = await impersonateSellerAction(slug);
    if (res.success && res.redirect) {
      router.push(res.redirect);
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-[#090b10] flex flex-col items-center justify-center font-sans text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center animate-pulse shadow-lg shadow-indigo-500/20">
            <ShieldCheck className="w-6 h-6 text-indigo-400" />
          </div>
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-300">
            <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
            <span>Verifying Master Admin Session...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#090b10] text-gray-100 font-sans w-full">
      
      {/* Sidebar */}
      <aside 
        className={`${
          isCollapsed ? "w-20" : "w-68"
        } bg-[#0c0e14] border-r border-gray-800/70 flex flex-col flex-shrink-0 h-full transition-all duration-300 ease-in-out select-none relative z-20 shadow-xl`}
      >
        {/* Sidebar Header */}
        <div className={`h-16 flex items-center ${isCollapsed ? "justify-center px-2" : "justify-between px-5"} border-b border-gray-800/80 transition-all duration-300`}>
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 rounded-xl flex items-center justify-center font-black text-white text-xs leading-none shrink-0 shadow-md shadow-indigo-500/20">
              TD
            </div>
            {!isCollapsed && (
              <div className="flex flex-col overflow-hidden whitespace-nowrap animate-in fade-in duration-200">
                <div className="flex items-center gap-1.5">
                  <h1 className="font-black text-[15px] text-white tracking-tight">TrueDeal</h1>
                  <span className="px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 text-[9px] font-black uppercase tracking-wider border border-indigo-500/30">Admin</span>
                </div>
                <p className="text-[10px] text-gray-400 font-semibold tracking-wide">Master Control Suite</p>
              </div>
            )}
          </div>

          <button 
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer ${isCollapsed ? "hidden" : "block"}`}
            title="Collapse Sidebar"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        </div>

        {/* Sidebar Navigation */}
        <div className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-1.5 scrollbar-thin scrollbar-thumb-gray-800">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/admin" && pathname?.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                title={isCollapsed ? item.name : undefined}
                className={`flex items-center ${
                  isCollapsed ? "justify-center px-0 h-11" : "justify-between px-3 py-2.5"
                } rounded-xl transition-all duration-200 text-xs font-bold relative group ${
                  isActive 
                    ? "bg-gradient-to-r from-indigo-600/30 to-purple-600/10 text-white border border-indigo-500/40 shadow-sm" 
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <div className="flex items-center gap-3 truncate">
                  <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${isActive ? "text-indigo-400" : "text-gray-400"}`} />
                  {!isCollapsed && (
                    <span className="truncate whitespace-nowrap">
                      {item.name}
                    </span>
                  )}
                </div>

                {!isCollapsed && item.badge && (
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                    item.badge === "Gemini AI" 
                      ? "bg-purple-500/20 text-purple-300 border border-purple-500/30" 
                      : "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                  }`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Quick Impersonate Section */}
        {!isCollapsed && (
          <div className="p-3 border-t border-gray-800/80 bg-gray-950/40">
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 px-1 flex items-center justify-between">
              <span>Quick Impersonate</span>
              <Store className="w-3 h-3 text-indigo-400" />
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => handleQuickImpersonate("anvreeality")}
                className="px-2 py-1.5 rounded-lg bg-gray-900 hover:bg-gray-800 border border-gray-800 text-[10px] font-bold text-gray-300 hover:text-white truncate text-left transition-colors cursor-pointer"
                title="Impersonate ANV REEALTY"
              >
                🏢 ANV REEALTY
              </button>
              <button
                type="button"
                onClick={() => handleQuickImpersonate("ayurmor-more")}
                className="px-2 py-1.5 rounded-lg bg-gray-900 hover:bg-gray-800 border border-gray-800 text-[10px] font-bold text-gray-300 hover:text-white truncate text-left transition-colors cursor-pointer"
                title="Impersonate Ayurmor"
              >
                🌿 Ayurmor
              </button>
            </div>
          </div>
        )}

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-gray-800/80 flex items-center justify-between">
          {!isCollapsed ? (
            <div className="flex items-center gap-2 text-[11px] text-gray-400">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <span className="font-semibold">TrueDeal v2.4 Admin</span>
            </div>
          ) : (
            <button 
              type="button"
              onClick={() => setIsCollapsed(false)}
              className="w-full flex items-center justify-center p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
              title="Expand Sidebar"
            >
              <PanelLeftOpen className="w-4 h-4" />
            </button>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#090b10]">
        <AdminHeader user={userSession} />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-gradient-to-b from-[#090b10] via-[#0d1017] to-[#090b10]">
          {children}
        </main>
      </div>

    </div>
  );
}
