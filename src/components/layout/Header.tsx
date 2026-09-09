"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Heart, User, Menu, X, Plus, LogOut, ChevronDown, ShieldCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getCurrentUserAction, logoutUserAction, UserSession } from '@/lib/auth-actions';

export interface HeaderProps {
  wishlistCount?: number;
  cartCount?: number;
  onOpenWishlist?: () => void;
  onOpenCart?: () => void;
  onOpenCategories?: () => void;
  onOpenHowItWorks?: () => void;
  activeView?: "chat" | "explore";
  onViewChange?: (view: "chat" | "explore") => void;
}

export function Header({
  wishlistCount = 0,
  cartCount = 0,
  onOpenWishlist,
  onOpenCart,
  onOpenCategories,
  onOpenHowItWorks,
  activeView = "chat",
  onViewChange
}: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Load active session user on mount
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await getCurrentUserAction();
        if (res.success && res.user) {
          setCurrentUser(res.user);
        } else {
          setCurrentUser(null);
        }
      } catch {
        setCurrentUser(null);
      }
    }
    checkAuth();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logoutUserAction();
      setCurrentUser(null);
      setIsUserMenuOpen(false);
      router.push("/");
      router.refresh();
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const firstName = currentUser?.name?.trim().split(" ")[0] || "Customer";

  return (
    <header className="w-full bg-white/90 backdrop-blur-md sticky top-0 z-40 border-b border-gray-100 font-sans shadow-xs">
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Left Section: Logo */}
        <div className="flex items-center gap-6 lg:gap-10">
          {/* TrueDeal Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-black text-base shadow-sm shadow-indigo-600/20">
              TD
            </div>
            <div className="flex flex-col">
              <span className="font-black text-xl text-gray-900 tracking-tight leading-none">
                TrueDeal
              </span>
              <span className="text-[10px] font-bold text-gray-600 tracking-wider">
                Direct Marketplace
              </span>
            </div>
          </Link>
        </div>

        {/* Right Section: Customer Actions & Profile */}
        <div className="flex items-center gap-2 md:gap-2.5">
          {/* Wishlist Icon with count badge */}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => onOpenWishlist ? onOpenWishlist() : null}
            className="relative text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full h-9 w-9 transition-colors cursor-pointer"
            title="View Saved Wishlist"
          >
            <Heart className={`h-4 w-4 ${wishlistCount > 0 ? "fill-pink-500 text-pink-500" : ""}`} />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-pink-500 text-white text-[10px] font-black flex items-center justify-center animate-in zoom-in">
                {wishlistCount}
              </span>
            )}
          </Button>
          
          <div className="hidden md:block w-px h-4 bg-gray-200 mx-1"></div>
          
          {/* User Account / Profile Button (Amazon Style Greeting & Dropdown) */}
          {currentUser ? (
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-full hover:bg-gray-100 transition-colors cursor-pointer text-left"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                  {firstName.charAt(0).toUpperCase()}
                </div>
                <div className="hidden lg:flex flex-col">
                  <span className="text-[10px] text-gray-500 font-bold leading-none">Hello, {firstName}</span>
                  <span className="text-xs font-black text-gray-900 leading-none mt-0.5 flex items-center gap-0.5">
                    Account & Lists <ChevronDown className="w-3 h-3 text-gray-400" />
                  </span>
                </div>
              </button>

              {/* Floating Profile Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-50 animate-in fade-in zoom-in-95 duration-100 font-sans">
                  <div className="p-3 bg-gray-50 rounded-xl mb-1 border border-gray-100/80">
                    <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block">Signed in as</span>
                    <span className="font-bold text-xs text-gray-900 truncate block mt-0.5">{currentUser.name}</span>
                    <span className="text-[11px] text-gray-500 font-medium truncate block">{currentUser.phone || currentUser.email}</span>
                  </div>

                  <div className="space-y-0.5 text-xs font-bold text-gray-700">
                    {currentUser.role === "admin" && (
                      <Link
                        href="/admin"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Master Admin Suite</span>
                      </Link>
                    )}

                    {(currentUser.role === "seller" || currentUser.role === "admin") && (
                      <Link
                        href="/dashboard"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                        <span>Seller Portal</span>
                      </Link>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        if (onOpenWishlist) onOpenWishlist();
                      }}
                      className="w-full text-left flex items-center justify-between px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-2.5">
                        <Heart className="w-3.5 h-3.5 text-pink-500" />
                        <span>Saved Wishlist</span>
                      </span>
                      {wishlistCount > 0 && (
                        <span className="text-[10px] font-black bg-pink-100 text-pink-700 px-1.5 py-0.2 rounded-full">
                          {wishlistCount}
                        </span>
                      )}
                    </button>
                  </div>

                  <div className="border-t border-gray-100 mt-1 pt-1">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-xl text-red-600 hover:bg-red-50 text-xs font-bold transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login">
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full h-9 w-9 transition-colors cursor-pointer"
                title="Sign In with Mobile / Email"
              >
                <User className="h-4 w-4" />
              </Button>
            </Link>
          )}
          
          {/* Sleek '+ Sell Item' CTA Button */}
          <Link href="/signup?type=seller">
            <Button className="hidden sm:flex items-center gap-1.5 bg-black hover:bg-gray-800 text-white rounded-full px-4 sm:px-5 h-9 shadow-sm transition-all font-sans font-extrabold text-xs cursor-pointer active:scale-95">
              <Plus className="w-3.5 h-3.5" />
              <span>Sell Item</span>
            </Button>
          </Link>

          {/* Mobile Menu Toggle */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden text-gray-900 hover:bg-gray-100 rounded-full"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 overflow-hidden bg-white/95 backdrop-blur-md shadow-lg animate-in fade-in duration-150 font-sans">
          <div className="p-4 flex flex-col gap-2">
            
            {/* Mobile User Profile Section */}
            {currentUser ? (
              <div className="p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-2xl flex items-center justify-between mb-1">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-black text-xs flex items-center justify-center">
                    {firstName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span className="font-bold text-xs text-gray-900 block">{currentUser.name}</span>
                    <span className="text-[10px] text-gray-500 font-medium block">{currentUser.phone || currentUser.email}</span>
                  </div>
                </div>
                <Link href="/account" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button size="sm" variant="outline" className="h-7 text-[10px] font-bold rounded-lg border-indigo-200 text-indigo-700">
                    Profile
                  </Button>
                </Link>
              </div>
            ) : (
              <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                <Button className="w-full h-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl flex items-center justify-center gap-2 font-bold text-xs mb-1">
                  <User className="w-4 h-4" />
                  <span>Sign In / Register</span>
                </Button>
              </Link>
            )}

            <div className="py-1 space-y-1">
              {currentUser?.role === "admin" && (
                <Link 
                  href="/admin" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full flex items-center gap-2.5 bg-indigo-50 text-indigo-700 px-4 py-3 rounded-xl text-xs font-bold transition-colors"
                >
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  <span>Master Admin Suite</span>
                </Link>
              )}

              {(currentUser?.role === "seller" || currentUser?.role === "admin") && (
                <Link 
                  href="/dashboard" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full flex items-center gap-2.5 bg-amber-50/70 text-amber-900 px-4 py-3 rounded-xl text-xs font-bold transition-colors"
                >
                  <ShieldCheck className="w-4 h-4 text-amber-500" />
                  <span>Seller Portal Dashboard</span>
                </Link>
              )}

              <button 
                onClick={() => {
                  if (onOpenWishlist) onOpenWishlist();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-between bg-gray-50 hover:bg-gray-100 px-4 py-3 rounded-xl text-xs font-bold text-gray-700 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Heart className={`h-4 w-4 ${wishlistCount > 0 ? "fill-pink-500 text-pink-500" : "text-gray-500"}`} />
                  <span>Saved Wishlist</span>
                </span>
                {wishlistCount > 0 && (
                  <span className="text-[10px] font-black bg-pink-100 text-pink-700 px-2 py-0.5 rounded-full">
                    {wishlistCount}
                  </span>
                )}
              </button>
            </div>

            {currentUser && (
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-center py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
              >
                Sign Out of Account
              </button>
            )}

            <Link href="/signup?type=seller" onClick={() => setIsMobileMenuOpen(false)}>
              <Button className="w-full h-11 bg-black hover:bg-gray-800 text-white rounded-xl flex items-center justify-center gap-2 font-bold text-xs">
                <Plus className="w-4 h-4" />
                <span>Sell Item on TrueDeal</span>
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
