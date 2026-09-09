"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ShieldCheck, Activity, Bell, ExternalLink, 
  Store, LogOut, RefreshCw, Sparkles, CheckCircle2,
  ChevronDown, Database, Search, Menu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { logoutUserAction, UserSession } from "@/lib/auth-actions";
import { getAdminSystemStatusAction, runAdminMaintenanceAction } from "@/lib/admin-actions";

export default function AdminHeader({ 
  user,
  onToggleMobileSidebar 
}: { 
  user?: UserSession | null;
  onToggleMobileSidebar?: () => void;
}) {
  const [dbStatus, setDbStatus] = useState<{ status: string; pingMs: number; databaseName: string }>({
    status: "HEALTHY",
    pingMs: 14,
    databaseName: "Truedeal"
  });
  const [timeString, setTimeString] = useState<string>("");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    async function checkDb() {
      try {
        const res = await getAdminSystemStatusAction();
        if (res.success) {
          setDbStatus({
            status: res.status,
            pingMs: res.pingMs,
            databaseName: res.databaseName || "Truedeal"
          });
        }
      } catch {}
    }
    checkDb();
    const interval = setInterval(checkDb, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSyncSellers = async () => {
    setIsSyncing(true);
    setSyncMessage(null);
    try {
      const res = await runAdminMaintenanceAction("sync_sellers");
      setSyncMessage(res.message || "Collections synced!");
      setTimeout(() => setSyncMessage(null), 4000);
      router.refresh();
    } catch {
      setSyncMessage("Sync failed");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleLogout = async () => {
    await logoutUserAction();
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="h-16 bg-[#0f1117] border-b border-gray-800/80 px-4 md:px-8 flex items-center justify-between sticky top-0 z-30 font-sans shadow-md backdrop-blur-md">
      
      {/* Left: Brand Identity & Database Telemetry */}
      <div className="flex items-center gap-3 sm:gap-4">
        {onToggleMobileSidebar && (
          <button 
            type="button"
            onClick={onToggleMobileSidebar}
            className="lg:hidden p-2 rounded-xl text-gray-300 hover:text-white bg-gray-900 hover:bg-gray-800 border border-gray-800 transition-colors flex items-center justify-center cursor-pointer shrink-0"
            title="Open Admin Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-mono">{dbStatus.databaseName}</span>
          <span className="text-gray-500">•</span>
          <span className="font-mono text-[11px] text-emerald-300">{dbStatus.pingMs}ms</span>
        </div>

        {timeString && (
          <div className="hidden lg:flex items-center gap-1.5 text-xs text-gray-400 font-mono bg-gray-900/60 px-2.5 py-1 rounded-lg border border-gray-800">
            <Activity className="w-3.5 h-3.5 text-indigo-400" />
            <span>IST {timeString}</span>
          </div>
        )}

        {syncMessage && (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 border border-indigo-500/30 rounded-lg text-xs text-indigo-300 animate-in fade-in">
            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>{syncMessage}</span>
          </div>
        )}
      </div>

      {/* Right: Actions, External Portal Links & Admin Profile */}
      <div className="flex items-center gap-3">
        
        {/* Quick Sync Collections Button */}
        <button
          type="button"
          onClick={handleSyncSellers}
          disabled={isSyncing}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-gray-900 text-gray-300 hover:text-white hover:bg-gray-800 border border-gray-800 transition-all cursor-pointer"
          title="Synchronize all seller collections"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin text-indigo-400" : "text-gray-400"}`} />
          <span>{isSyncing ? "Syncing..." : "Sync DB"}</span>
        </button>

        {/* View Live Marketplace */}
        <Link
          href="/"
          target="_blank"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-indigo-950/40 text-indigo-300 hover:text-white hover:bg-indigo-900/50 border border-indigo-800/40 transition-all"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Live Marketplace</span>
        </Link>

        {/* View Seller Portal */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-gray-900 text-gray-300 hover:text-white hover:bg-gray-800 border border-gray-800 transition-all"
        >
          <Store className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden md:inline">Seller Portal</span>
        </Link>

        {/* Profile Dropdown */}
        <div className="relative ml-1" ref={profileRef}>
          <button
            type="button"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-800/80 transition-all border border-transparent hover:border-gray-700 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-xs shadow-sm">
              SA
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-bold text-gray-200 leading-tight">
                {user?.name || "Super Admin"}
              </span>
              <span className="text-[10px] font-semibold text-indigo-400 leading-none flex items-center gap-1">
                <ShieldCheck className="w-2.5 h-2.5" /> Full Access
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#141721] border border-gray-800 shadow-2xl p-2 z-50 text-xs font-medium animate-in fade-in zoom-in-95">
              <div className="px-3 py-2 border-b border-gray-800/80 mb-1">
                <p className="font-bold text-gray-200 truncate">{user?.name || "Super Admin"}</p>
                <p className="text-[11px] text-gray-400 truncate">{user?.email || "admin@truedeal.in"}</p>
                <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 text-[10px] font-bold">
                  <ShieldCheck className="w-3 h-3" /> Master Control
                </div>
              </div>

              <Link
                href="/admin/settings"
                onClick={() => setIsProfileOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-gray-300 hover:text-white hover:bg-gray-800/60 transition-colors"
              >
                Platform Settings
              </Link>

              <Link
                href="/admin/database"
                onClick={() => setIsProfileOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-gray-300 hover:text-white hover:bg-gray-800/60 transition-colors"
              >
                <Database className="w-3.5 h-3.5 text-emerald-400" /> Database Health
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors text-left font-semibold mt-1 border-t border-gray-800/60 pt-2"
              >
                <LogOut className="w-3.5 h-3.5" /> Sign Out
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
