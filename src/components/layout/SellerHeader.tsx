"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Search, Shield, Plus, ExternalLink, Check, CheckCircle2, 
  Store, Box, Settings, LogOut, Globe, Sparkles, AlertCircle,
  HelpCircle, MessageSquare, Phone, User, ChevronDown, Building2,
  FileText, ShieldCheck, ArrowRight, X, PanelLeftClose, PanelLeftOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCurrentUserSession, UserSession } from "@/lib/auth-actions";

interface SellerHeaderProps {
  isSidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
}

export default function SellerHeader({ isSidebarCollapsed = false, onToggleSidebar }: SellerHeaderProps) {
  const router = useRouter();
  
  // Session State
  const [session, setSession] = useState<UserSession | null>(null);

  useEffect(() => {
    getCurrentUserSession().then(s => {
      if (s) setSession(s);
    });
  }, []);

  const storeDisplayName = session?.storeName || session?.name || "Seller Store";
  const initials = storeDisplayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() || "")
    .join("") || "SP";
  const sellerEmail = session?.email || "seller@company.com";
  const portfolioSlug = session?.slug || "seller-store";

  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Dropdown States
  const [shieldOpen, setShieldOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  const shieldRef = useRef<HTMLDivElement>(null);
  const createRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchOpen(false);
      }
      if (shieldRef.current && !shieldRef.current.contains(event.target as Node)) {
        setShieldOpen(false);
      }
      if (createRef.current && !createRef.current.contains(event.target as Node)) {
        setCreateOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchOpen(false);
      router.push(`/dashboard/catalog?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-6 lg:px-8 flex-shrink-0 z-30 shadow-sm font-sans relative">
      
      {/* Left: Sidebar Toggle, Title & Quick Search */}
      <div className="flex items-center gap-4 sm:gap-6 lg:gap-8">
        {onToggleSidebar && (
          <button 
            type="button"
            onClick={onToggleSidebar}
            className="p-2.5 rounded-xl text-gray-700 hover:text-indigo-600 bg-white hover:bg-indigo-50/50 transition-all duration-200 border border-gray-200/90 hover:border-indigo-200 shadow-xs active:scale-95 flex items-center justify-center cursor-pointer group"
            title={isSidebarCollapsed ? "Expand Sidebar (Ctrl+B)" : "Collapse Sidebar (Full Window Size)"}
          >
            {isSidebarCollapsed ? (
              <PanelLeftOpen className="w-4 h-4 text-indigo-600 group-hover:scale-110 transition-transform" />
            ) : (
              <PanelLeftClose className="w-4 h-4 text-gray-600 group-hover:scale-110 transition-transform" />
            )}
          </button>
        )}
        <Link href="/dashboard" className="flex flex-col">
          <h2 className="text-[16px] lg:text-[18px] font-black text-gray-900 leading-tight tracking-tight hover:text-indigo-600 transition-colors">
            Marketplace<br />Dashboard
          </h2>
        </Link>
        
        {/* Interactive Search Bar */}
        <div ref={searchRef} className="relative hidden md:block">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search insights, properties, catalog..." 
              value={searchQuery}
              onFocus={() => setSearchOpen(true)}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSearchOpen(true);
              }}
              className="pl-10 pr-4 py-2 w-72 lg:w-84 bg-gray-50/80 hover:bg-gray-100/80 focus:bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-xs"
            />
          </form>

          {/* Quick Search Dropdown Suggestions */}
          {searchOpen && (
            <div className="absolute top-full left-0 mt-2 w-96 bg-white rounded-2xl border border-gray-200 shadow-xl p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between px-2 pb-2 border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                <span>Quick Actions & Listings</span>
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="text-gray-400 hover:text-gray-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="py-2 flex flex-col gap-1 text-xs">
                <Link 
                  href="/dashboard/catalog" 
                  onClick={() => setSearchOpen(false)}
                  className="flex items-center justify-between p-2 rounded-xl hover:bg-indigo-50/60 transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <Building2 className="w-4 h-4 text-indigo-600" />
                    <div>
                      <span className="font-bold text-gray-900 group-hover:text-indigo-600 block">Catalog Inventory</span>
                      <span className="text-[11px] text-gray-500">View and manage all active listings</span>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-indigo-600" />
                </Link>

                <Link 
                  href="/dashboard/portfolio" 
                  onClick={() => setSearchOpen(false)}
                  className="flex items-center justify-between p-2 rounded-xl hover:bg-indigo-50/60 transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <Globe className="w-4 h-4 text-purple-600" />
                    <div>
                      <span className="font-bold text-gray-900 group-hover:text-indigo-600 block">Company Portfolio Builder</span>
                      <span className="text-[11px] text-gray-500">Edit branding, slug, and storefront view</span>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-indigo-600" />
                </Link>
              </div>

              {searchQuery && (
                <button 
                  onClick={handleSearchSubmit}
                  className="w-full text-center py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl transition-colors mt-1"
                >
                  Search all for "{searchQuery}" →
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right: Quick Links, Icons, Create Listing, Avatar */}
      <div className="flex items-center gap-3 sm:gap-5">
        
        {/* Top Nav Links */}
        <nav className="hidden xl:flex items-center gap-5 text-xs font-bold text-gray-600 uppercase tracking-wider">
          <Link href="/dashboard/insights" className="hover:text-indigo-600 transition-colors">Analytics</Link>
          <Link href="/dashboard/ai" className="hover:text-indigo-600 transition-colors">AI Visibility</Link>
          <Link href="/dashboard/catalog" className="hover:text-indigo-600 transition-colors">Inventory</Link>
          <button onClick={() => setHelpOpen(true)} className="hover:text-indigo-600 transition-colors uppercase font-bold cursor-pointer">Help</button>
        </nav>

        {/* Action Controls & Dropdowns */}
        <div className="flex items-center gap-2 border-l border-gray-200 pl-3 sm:pl-5">
          
          {/* 1. Security Shield Status */}
          <div ref={shieldRef} className="relative">
            <button 
              onClick={() => {
                setShieldOpen(!shieldOpen);
                setCreateOpen(false);
                setProfileOpen(false);
              }}
              className="p-2.5 text-gray-600 hover:text-emerald-700 transition-all rounded-xl border border-gray-200/90 bg-white hover:bg-gray-50 shadow-xs active:scale-95 flex items-center justify-center cursor-pointer"
              title="Verified Merchant Security Status"
            >
              <Shield className="w-4 h-4" />
            </button>

            {shieldOpen && (
              <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl border border-gray-200 shadow-2xl p-4 z-50 animate-in fade-in duration-200">
                <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-gray-900">Seller Trust & Security</h3>
                    <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Fully Verified Merchant
                    </span>
                  </div>
                </div>

                <div className="py-3 space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                    <span className="font-medium text-gray-600">Store Verification</span>
                    <span className="font-bold text-emerald-700">Active & Verified</span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                    <span className="font-medium text-gray-600">Database Security</span>
                    <span className="font-bold text-emerald-700">Atlas TLS 256-bit</span>
                  </div>
                </div>

                <Link href="/dashboard/business" onClick={() => setShieldOpen(false)}>
                  <Button variant="outline" className="w-full text-xs font-bold rounded-xl h-9">
                    Manage Legal Profile →
                  </Button>
                </Link>
              </div>
            )}
          </div>
          
          {/* 2. Interactive "Create Listing" Button */}
          <div ref={createRef} className="relative">
            <button 
              type="button"
              onClick={() => {
                setCreateOpen(!createOpen);
                setShieldOpen(false);
                setProfileOpen(false);
              }}
              className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-xl px-4 py-2 font-bold text-xs shadow-md shadow-indigo-600/20 transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer h-9"
            >
              <Plus className="w-3.5 h-3.5 shrink-0" />
              <span>Create Listing</span>
              <ChevronDown className="w-3 h-3 opacity-80 shrink-0" />
            </button>

            {createOpen && (
              <div className="absolute right-0 mt-3 w-72 bg-white rounded-2xl border border-gray-200 shadow-2xl p-2 z-50 animate-in fade-in duration-200 flex flex-col gap-1">
                <Link
                  href="/dashboard/catalog/add"
                  onClick={() => setCreateOpen(false)}
                  className="p-3 rounded-xl hover:bg-indigo-50/70 transition-colors flex items-center gap-3 group"
                >
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                    <Plus className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-gray-900 group-hover:text-indigo-600 block">Add Single Listing</span>
                    <span className="text-[11px] text-gray-500">Create property / product listing manually</span>
                  </div>
                </Link>

                <Link
                  href="/connect"
                  onClick={() => setCreateOpen(false)}
                  className="p-3 rounded-xl hover:bg-purple-50/70 transition-colors flex items-center gap-3 group"
                >
                  <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-gray-900 group-hover:text-purple-600 block">Import via AI Scraper</span>
                    <span className="text-[11px] text-gray-500">Auto-crawl from your website URL</span>
                  </div>
                </Link>

                <Link
                  href="/dashboard/portfolio"
                  onClick={() => setCreateOpen(false)}
                  className="p-3 rounded-xl hover:bg-emerald-50/70 transition-colors flex items-center gap-3 group"
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-gray-900 group-hover:text-emerald-600 block">Update Portfolio Showcase</span>
                    <span className="text-[11px] text-gray-500">Customize your public company storefront</span>
                  </div>
                </Link>
              </div>
            )}
          </div>

          {/* 3. User Profile Avatar Dropdown */}
          <div ref={profileRef} className="relative">
            <button 
              onClick={() => {
                setProfileOpen(!profileOpen);
                setShieldOpen(false);
                setCreateOpen(false);
              }}
              className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-slate-900 text-white font-extrabold text-xs flex items-center justify-center border-2 border-white shadow-sm ring-1 ring-gray-200 hover:ring-indigo-400 transition-all cursor-pointer"
              title="Seller Account Profile"
            >
              {initials}
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl border border-gray-200 shadow-2xl p-2 z-50 animate-in fade-in duration-200 flex flex-col gap-1">
                
                {/* Profile Header */}
                <div className="p-3 border-b border-gray-100">
                  <span className="font-black text-xs text-gray-900 block leading-tight">{storeDisplayName}</span>
                  <span className="text-[11px] text-gray-500 block truncate">{sellerEmail}</span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full mt-1.5 border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified Seller
                  </span>
                </div>

                {/* Profile Menu Links */}
                <Link
                  href={`/portfolio/${portfolioSlug}`}
                  target="_blank"
                  onClick={() => setProfileOpen(false)}
                  className="p-2.5 rounded-xl hover:bg-gray-100 text-xs font-semibold text-gray-700 flex items-center justify-between"
                >
                  <span className="flex items-center gap-2.5">
                    <Globe className="w-4 h-4 text-indigo-600" /> View Public Storefront
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                </Link>

                <Link
                  href="/dashboard/portfolio"
                  onClick={() => setProfileOpen(false)}
                  className="p-2.5 rounded-xl hover:bg-gray-100 text-xs font-semibold text-gray-700 flex items-center gap-2.5"
                >
                  <FileText className="w-4 h-4 text-purple-600" /> Portfolio Builder
                </Link>

                <Link
                  href="/dashboard/business"
                  onClick={() => setProfileOpen(false)}
                  className="p-2.5 rounded-xl hover:bg-gray-100 text-xs font-semibold text-gray-700 flex items-center gap-2.5"
                >
                  <Store className="w-4 h-4 text-blue-600" /> My Business Profile
                </Link>

                <Link
                  href="/dashboard/catalog"
                  onClick={() => setProfileOpen(false)}
                  className="p-2.5 rounded-xl hover:bg-gray-100 text-xs font-semibold text-gray-700 flex items-center gap-2.5"
                >
                  <Box className="w-4 h-4 text-emerald-600" /> Catalog & Inventory
                </Link>

                <Link
                  href="/dashboard/settings"
                  onClick={() => setProfileOpen(false)}
                  className="p-2.5 rounded-xl hover:bg-gray-100 text-xs font-semibold text-gray-700 flex items-center gap-2.5"
                >
                  <Settings className="w-4 h-4 text-gray-500" /> Account Settings
                </Link>

                <div className="border-t border-gray-100 pt-1 mt-1">
                  <Link
                    href="/logout"
                    className="p-2.5 rounded-xl hover:bg-red-50 text-xs font-bold text-red-600 flex items-center gap-2.5 transition-colors"
                  >
                    <LogOut className="w-4 h-4 text-red-500" /> Sign Out
                  </Link>
                </div>

              </div>
            )}
          </div>

        </div>

      </div>

      {/* Help Modal */}
      {helpOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-gray-200 shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-base text-gray-900">Seller Help & Advisory Support</h3>
              </div>
              <button onClick={() => setHelpOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs text-gray-600">
              <p>Need assistance setting up your portfolio, scraping website listings, or managing buyer inquiries?</p>
              
              <div className="p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-2">
                <span className="font-bold text-indigo-900 block">Dedicated Seller Concierge</span>
                <p className="text-[11px] text-indigo-700">Available Monday - Saturday (9:00 AM - 8:00 PM IST)</p>
                <div className="flex flex-col gap-1.5 pt-1">
                  <a href="https://wa.me/919820012345" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 font-bold text-emerald-700 hover:underline">
                    <MessageSquare className="w-3.5 h-3.5" /> WhatsApp Support
                  </a>
                  <a href="mailto:support@truedeal.com" className="flex items-center gap-2 font-bold text-blue-700 hover:underline">
                    <Phone className="w-3.5 h-3.5" /> Email: support@truedeal.com
                  </a>
                </div>
              </div>
            </div>

            <Button 
              onClick={() => setHelpOpen(false)}
              className="w-full bg-gray-900 hover:bg-black text-white font-bold text-xs rounded-xl h-10"
            >
              Close
            </Button>
          </div>
        </div>
      )}

    </header>
  );
}
