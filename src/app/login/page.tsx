"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, ArrowRight, Loader2, Store, ShoppingBag, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { loginUserAction, loginAsAnvReealtyAction } from "@/lib/auth-actions";

export default function LoginPage() {
  const [accountType, setAccountType] = useState<"customer" | "seller">("seller");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [anvLoading, setAnvLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  const handleAnvLogin = async () => {
    setAnvLoading(true);
    setErrorMessage("");
    try {
      const res = await loginAsAnvReealtyAction();
      if (res.success) {
        router.push(res.redirect || "/dashboard");
        router.refresh();
      } else {
        setErrorMessage(res.error || "Failed to login as ANV REEALTY");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Login failed");
    } finally {
      setAnvLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!email.trim() || !password) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    setLoading(true);
    try {
      const res = await loginUserAction({
        email,
        password,
        accountType
      });

      if (res.success) {
        router.push(res.redirect || (accountType === "seller" ? "/dashboard" : "/"));
        router.refresh();
      } else {
        setErrorMessage(res.error || "Invalid email or password.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#F1F5F9] py-12 px-4 sm:px-6 font-sans">
      <div className="w-full max-w-[460px] flex flex-col items-center">
        
        {/* Header */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#4F46E5] text-white font-black text-lg flex items-center justify-center shadow-md shadow-indigo-600/20">
              TD
            </div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">
              TrueDeal
            </h1>
          </Link>
          <p className="text-gray-500 font-medium text-xs sm:text-sm">Sign in to manage your store, catalog & AI visibility</p>
        </div>

        {/* Login Card */}
        <div className="w-full bg-white rounded-3xl shadow-xl border border-gray-200 p-6 sm:p-8">
          
          {/* Error Notice */}
          {errorMessage && (
            <div className="mb-6 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <span className="w-2 h-2 rounded-full bg-red-500 shrink-0"></span>
              {errorMessage}
            </div>
          )}

          {/* Account Type Toggle */}
          <div className="flex items-center p-1 bg-gray-100 border border-gray-200 rounded-2xl mb-6">
            <button
              type="button"
              onClick={() => setAccountType("seller")}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 ${
                accountType === "seller" 
                  ? "bg-white text-indigo-900 shadow-sm border border-gray-200/80 font-black" 
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Store className="w-3.5 h-3.5 text-indigo-600" /> Seller Store
            </button>
            <button
              type="button"
              onClick={() => setAccountType("customer")}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 ${
                accountType === "customer" 
                  ? "bg-white text-indigo-900 shadow-sm border border-gray-200/80 font-black" 
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5 text-indigo-600" /> Customer
            </button>
          </div>

          {/* Form */}
          <form className="space-y-4" onSubmit={handleLogin}>
            
            {/* Email Field */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700">Work Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="email" 
                  placeholder={accountType === "seller" ? "seller@company.com" : "customer@truedeal.com"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:border-[#4F46E5] focus:ring-2 focus:ring-indigo-100 outline-none transition-all placeholder:text-gray-400 text-xs font-semibold text-gray-900 bg-white shadow-sm"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-700">Password</label>
                <Link href="#" className="text-xs font-bold text-[#4F46E5] hover:underline">
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
                  className="w-full pl-10 pr-12 py-2.5 rounded-xl border border-gray-300 focus:border-[#4F46E5] focus:ring-2 focus:ring-indigo-100 outline-none transition-all placeholder:text-gray-400 text-xs font-semibold text-gray-900 bg-white shadow-sm"
                  required
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              disabled={loading}
              className="w-full bg-[#4F46E5] hover:bg-[#4338CA] text-white py-3.5 rounded-xl font-black text-sm mt-3 shadow-lg shadow-indigo-600/25 transition-all hover:scale-[1.01] flex items-center justify-center gap-2 h-12 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Signing in...
                </>
              ) : (
                <>
                  Sign In to {accountType === "seller" ? "Seller Dashboard" : "TrueDeal"} <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </Button>
            
          </form>

        </div>

        {/* Footer */}
        <p className="mt-6 text-xs text-gray-500 font-semibold">
          Don't have an account?{" "}
          <Link href="/signup?type=seller" className="font-bold text-[#4F46E5] hover:underline">
            Register your store here
          </Link>
        </p>

      </div>
    </div>
  );
}
