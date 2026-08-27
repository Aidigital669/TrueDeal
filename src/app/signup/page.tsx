"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff, ShoppingBag, Store } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SignupPage() {
  const [accountType, setAccountType] = useState<"customer" | "seller">("customer");
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen w-full flex bg-gray-50/50 p-4 sm:p-6 lg:p-8">
      
      {/* Main Container */}
      <div className="w-full max-w-6xl mx-auto bg-white rounded-[2rem] shadow-2xl flex overflow-hidden border border-gray-100">
        
        {/* Left Side: Graphic (Hidden on mobile) */}
        <div className="hidden lg:flex w-1/2 relative bg-[#3B28CC] flex-col items-center justify-center p-12 overflow-hidden">
          {/* Abstract 3D Background */}
          <div className="absolute inset-0 z-0">
            <Image 
              src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop" 
              alt="Abstract 3D Background" 
              fill 
              className="object-cover opacity-60 mix-blend-overlay"
              priority
            />
          </div>
          
          {/* Text Overlay */}
          <div className="relative z-10 w-full max-w-md text-white mt-auto pt-64">
            <h2 className="text-4xl font-extrabold mb-4 tracking-tight">TrueDeal</h2>
            <p className="text-lg text-indigo-100 font-medium leading-relaxed">
              Join the premium destination for curated physical goods and high-skilled professionals.
            </p>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center p-8 sm:p-12 lg:p-16">
          
          <div className="w-full max-w-md mx-auto">
            {/* Header */}
            <div className="mb-10">
              <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Create your account</h1>
              <p className="text-gray-500 font-medium">Choose your journey on TrueDeal.</p>
            </div>

            {/* Account Type Selection Cards */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              
              {/* Customer Card */}
              <button 
                onClick={() => setAccountType("customer")}
                className={`text-left p-4 rounded-xl border-2 transition-all duration-200 relative ${
                  accountType === "customer" 
                    ? "border-[#3B28CC] bg-indigo-50/50" 
                    : "border-gray-100 hover:border-gray-200 bg-white"
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <ShoppingBag className={`w-5 h-5 ${accountType === "customer" ? "text-[#3B28CC]" : "text-gray-400"}`} />
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${accountType === "customer" ? "border-[#3B28CC]" : "border-gray-300"}`}>
                    {accountType === "customer" && <div className="w-2 h-2 rounded-full bg-[#3B28CC]" />}
                  </div>
                </div>
                <h3 className={`font-bold mb-1 ${accountType === "customer" ? "text-[#3B28CC]" : "text-gray-900"}`}>Customer</h3>
                <p className="text-xs text-gray-500 font-medium leading-relaxed">Shop premium, curated goods.</p>
              </button>

              {/* Seller Card */}
              <button 
                onClick={() => setAccountType("seller")}
                className={`text-left p-4 rounded-xl border-2 transition-all duration-200 relative ${
                  accountType === "seller" 
                    ? "border-[#3B28CC] bg-indigo-50/50" 
                    : "border-gray-100 hover:border-gray-200 bg-white"
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <Store className={`w-5 h-5 ${accountType === "seller" ? "text-[#3B28CC]" : "text-gray-400"}`} />
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${accountType === "seller" ? "border-[#3B28CC]" : "border-gray-300"}`}>
                    {accountType === "seller" && <div className="w-2 h-2 rounded-full bg-[#3B28CC]" />}
                  </div>
                </div>
                <h3 className={`font-bold mb-1 ${accountType === "seller" ? "text-[#3B28CC]" : "text-gray-900"}`}>Seller</h3>
                <p className="text-xs text-gray-500 font-medium leading-relaxed">Grow with TrueDeal for Business.</p>
              </button>
            </div>

            {/* Form */}
            <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
              
              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-600">First Name</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 bg-gray-50 rounded-xl border-transparent focus:bg-white focus:border-[#3B28CC] focus:ring-1 focus:ring-[#3B28CC] outline-none transition-all"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-600">Last Name</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 bg-gray-50 rounded-xl border-transparent focus:bg-white focus:border-[#3B28CC] focus:ring-1 focus:ring-[#3B28CC] outline-none transition-all"
                    required
                  />
                </div>
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-600">Email Address</label>
                <input 
                  type="email" 
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl border-transparent focus:bg-white focus:border-[#3B28CC] focus:ring-1 focus:ring-[#3B28CC] outline-none transition-all"
                  required
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-600">Password</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"}
                    className="w-full pl-4 pr-12 py-3 bg-gray-50 rounded-xl border-transparent focus:bg-white focus:border-[#3B28CC] focus:ring-1 focus:ring-[#3B28CC] outline-none transition-all font-serif"
                    required
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-[11px] text-gray-500 font-medium pt-1">Must be at least 8 characters.</p>
              </div>

              {/* Submit Button */}
              <Button className="w-full bg-[#3B28CC] hover:bg-[#2c1d99] text-white py-6 rounded-xl font-bold text-base mt-4 shadow-lg shadow-indigo-600/20 transition-transform hover:scale-[1.02]">
                Sign Up
              </Button>
              
            </form>

            {/* Footer */}
            <p className="mt-8 text-center text-sm text-gray-500">
              Already have an account?{" "}
              <Link href="/login" className="font-bold text-[#3B28CC] hover:underline">
                Log in
              </Link>
            </p>
            
          </div>
        </div>

      </div>
    </div>
  );
}
