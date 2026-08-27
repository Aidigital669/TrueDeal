"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Lock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const [accountType, setAccountType] = useState<"customer" | "seller">("customer");

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-50 via-white to-white p-4">
      <div className="w-full max-w-[440px] flex flex-col items-center">
        
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-4xl font-extrabold text-[#3B28CC] tracking-tight mb-2">
              TrueDeal
            </h1>
          </Link>
          <p className="text-gray-500 font-medium">Sign in to your account</p>
        </div>

        {/* Login Card */}
        <div className="w-full bg-white rounded-3xl shadow-xl shadow-indigo-900/5 border border-indigo-50 p-6 sm:p-8">
          
          {/* Account Type Toggle */}
          <div className="flex items-center p-1 bg-indigo-50/50 rounded-xl mb-8">
            <button
              onClick={() => setAccountType("customer")}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
                accountType === "customer" 
                  ? "bg-white text-[#3B28CC] shadow-sm" 
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Customer
            </button>
            <button
              onClick={() => setAccountType("seller")}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
                accountType === "seller" 
                  ? "bg-white text-[#3B28CC] shadow-sm" 
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Seller
            </button>
          </div>

          {/* Form */}
          <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
            
            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  type="email" 
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#3B28CC] focus:ring-1 focus:ring-[#3B28CC] outline-none transition-all placeholder:text-gray-400"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-gray-700">Password</label>
                <Link href="#" className="text-sm font-bold text-[#3B28CC] hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  type="password" 
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#3B28CC] focus:ring-1 focus:ring-[#3B28CC] outline-none transition-all placeholder:text-gray-400 font-serif"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button className="w-full bg-[#3B28CC] hover:bg-[#2c1d99] text-white py-6 rounded-xl font-bold text-base mt-2 shadow-lg shadow-indigo-600/20 transition-all hover:scale-[1.02]">
              Sign In <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            
          </form>

          {/* Divider */}
          <div className="relative flex items-center justify-center my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100"></div>
            </div>
            <div className="relative bg-white px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Or continue with
            </div>
          </div>

          {/* OAuth Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" className="h-12 rounded-xl border-gray-200 text-gray-700 font-semibold hover:bg-gray-50">
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google
            </Button>
            <Button variant="outline" className="h-12 rounded-xl border-gray-200 text-gray-700 font-semibold hover:bg-gray-50">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.05 20.28c-.98.95-2.05 1.8-3.08 1.8-1.09 0-1.46-.66-2.72-.66-1.25 0-1.67.63-2.7.66-1.07.03-2.25-.94-3.21-2.31-1.3-1.92-2.26-5.11-1.57-7.6.35-1.22 1.12-2.29 2.17-2.93 1-.61 2.15-.93 3.25-.95 1.15-.02 2.16.59 2.84.59.68 0 1.95-.76 3.34-.63 1.45.14 2.65.65 3.44 1.54-2.82 1.47-2.36 5.38.37 6.43-.65 1.65-1.55 3.22-2.13 4.06zM12.03 7.25c-.09-1.56.7-2.92 1.65-3.79.99-1.01 2.4-1.6 3.75-1.55.13 1.67-.7 3.2-1.77 4.14-.99 1-2.54 1.55-3.63 1.2z"/>
              </svg>
              Apple
            </Button>
          </div>

        </div>

        {/* Footer */}
        <p className="mt-8 text-sm text-gray-500">
          Don't have an account?{" "}
          <Link href="/signup" className="font-bold text-[#3B28CC] hover:underline">
            Sign up
          </Link>
        </p>

      </div>
    </div>
  );
}
