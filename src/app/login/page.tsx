"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Mail, Lock, ArrowRight, Loader2, Store, 
  ShoppingBag, Eye, EyeOff, Sparkles, CheckCircle2 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { loginUserAction } from "@/lib/auth-actions";

function LoginFormContent() {
  const searchParams = useSearchParams();
  const initialType = searchParams.get("type") === "seller" ? "seller" : "customer";
  
  const [accountType, setAccountType] = useState<"customer" | "seller">(initialType);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!email.trim() || !password) {
      setErrorMessage("Please enter both email address and password.");
      return;
    }

    setLoading(true);
    try {
      const res = await loginUserAction({
        email: email.trim(),
        password,
        accountType
      });

      if (res.success) {
        router.push(res.redirect || (accountType === "seller" ? "/dashboard" : "/"));
        router.refresh();
      } else {
        setErrorMessage(res.error || "Invalid email or password. Please try again.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 via-indigo-50/30 to-gray-100 py-12 px-4 sm:px-6 font-sans">
      <div className="w-full max-w-[440px] flex flex-col items-center">
        
        {/* Header Branding */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-2 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-black text-lg flex items-center justify-center shadow-lg shadow-indigo-600/20 group-hover:scale-105 transition-transform">
              TD
            </div>
            <div className="flex flex-col text-left">
              <span className="text-2xl font-black text-gray-900 tracking-tight leading-none">
                TrueDeal
              </span>
              <span className="text-[10px] font-bold text-gray-400 tracking-wider">
                Direct Marketplace
              </span>
            </div>
          </Link>
          <p className="text-gray-500 font-medium text-xs sm:text-sm">
            {accountType === "customer" 
              ? "Sign in with your email and password" 
              : "Sign in to manage your store, catalog & AI visibility"}
          </p>
        </div>

        {/* Main Authentication Card */}
        <div className="w-full bg-white rounded-3xl shadow-xl shadow-indigo-500/5 border border-gray-200/90 p-5 sm:p-8 backdrop-blur-md">
          
          {/* Account Type Switcher */}
          <div className="flex items-center p-1 bg-gray-100 border border-gray-200 rounded-2xl mb-6">
            <button
              type="button"
              onClick={() => {
                setAccountType("customer");
                setErrorMessage("");
              }}
              className={`flex-1 py-2 sm:py-2.5 px-2 text-[11px] sm:text-xs font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer ${
                accountType === "customer" 
                  ? "bg-white text-indigo-900 shadow-sm border border-gray-200/80 font-black" 
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span className="truncate">Customer Sign In</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setAccountType("seller");
                setErrorMessage("");
              }}
              className={`flex-1 py-2 sm:py-2.5 px-2 text-[11px] sm:text-xs font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer ${
                accountType === "seller" 
                  ? "bg-white text-indigo-900 shadow-sm border border-gray-200/80 font-black" 
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              <Store className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span className="truncate">Seller Portal</span>
            </button>
          </div>

          {/* Error Notice */}
          {errorMessage && (
            <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <span className="w-2 h-2 rounded-full bg-red-500 shrink-0"></span>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Login Form */}
          <form className="space-y-4" onSubmit={handleLogin}>
            
            {/* Email / ID Field */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700">
                {accountType === "seller" ? "Seller Work Email" : "Email Address or User ID"}
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  autoCapitalize="none"
                  autoCorrect="off"
                  placeholder={accountType === "seller" ? "seller@company.com" : "customer@truedeal.in"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none transition-all placeholder:text-gray-400 text-xs font-semibold text-gray-900 bg-white shadow-2xs"
                  required
                  autoFocus
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-700">Password</label>
                <Link href="#" className="text-[11px] font-bold text-indigo-600 hover:underline">
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none transition-all placeholder:text-gray-400 text-xs font-semibold text-gray-900 bg-white shadow-2xs"
                  required
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              disabled={loading}
              className={`w-full text-white py-3.5 rounded-xl font-black text-xs shadow-md transition-all flex items-center justify-center gap-2 h-12 cursor-pointer active:scale-98 ${
                accountType === "seller" ? "bg-black hover:bg-gray-800" : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20"
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Signing in...
                </>
              ) : (
                <>
                  Sign In to Account <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </Button>
            
          </form>

        </div>

        {/* Footer Link */}
        <p className="mt-6 text-xs text-gray-500 font-semibold text-center">
          Don't have an account yet?{" "}
          <Link 
            href={accountType === "seller" ? "/signup?type=seller" : "/signup?type=customer"} 
            className="font-bold text-indigo-600 hover:underline"
          >
            Create {accountType === "seller" ? "Seller Store" : "Customer Account"}
          </Link>
        </p>

      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50 font-sans">
        <div className="flex items-center gap-2 text-xs font-bold text-indigo-600">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Loading sign in...</span>
        </div>
      </div>
    }>
      <LoginFormContent />
    </Suspense>
  );
}
