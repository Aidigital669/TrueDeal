"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { 
  Eye, EyeOff, ShoppingBag, Store, Building2, MapPin, Phone, Globe, 
  Sparkles, CheckCircle2, ShieldCheck, ArrowRight, Loader2, Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { registerUserAction } from "@/lib/auth-actions";

function SignupFormContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const initialType = searchParams.get("type") === "customer" ? "customer" : "seller";
  const [accountType, setAccountType] = useState<"customer" | "seller">(initialType);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Form Fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  
  // Seller Specific Fields
  const [companyName, setCompanyName] = useState("");
  const [businessType, setBusinessType] = useState("Commercial & Residential Real Estate");
  const [city, setCity] = useState("Pune");
  const [website, setWebsite] = useState("");
  const [gstin, setGstin] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!firstName.trim() || !email.trim() || !password) {
      setErrorMessage("Please fill in all required fields.");
      return;
    }

    if (accountType === "seller" && !companyName.trim()) {
      setErrorMessage("Please enter your Company / Business Name.");
      return;
    }

    setLoading(true);
    try {
      const res = await registerUserAction({
        accountType,
        firstName,
        lastName,
        email,
        password,
        phone,
        companyName: accountType === "seller" ? companyName : undefined,
        businessType: accountType === "seller" ? businessType : undefined,
        city: accountType === "seller" ? city : undefined,
        website: accountType === "seller" ? website : undefined,
        gstin: accountType === "seller" ? gstin : undefined
      });

      if (res.success) {
        router.push(res.redirect || (accountType === "seller" ? "/dashboard" : "/"));
        router.refresh();
      } else {
        setErrorMessage(res.error || "Failed to create account.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F1F5F9] py-10 sm:py-16 px-4 sm:px-6 lg:px-8 font-sans flex items-center justify-center">
      
      {/* Main Card Container */}
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        
        {/* Left Side: Brand Graphic Panel */}
        <div className="hidden lg:flex lg:col-span-5 relative bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-950 flex-col justify-between p-10 text-white overflow-hidden">
          
          {/* Subtle Background Pattern */}
          <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
            <Image 
              src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop" 
              alt="Background" 
              fill 
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-cover"
              priority
            />
          </div>

          {/* Top Logo */}
          <div className="relative z-10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center font-black text-white text-base border border-white/30 shadow-inner">
              TD
            </div>
            <div>
              <span className="font-black text-xl tracking-tight block leading-none">TrueDeal</span>
              <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider">Enterprise AI Marketplace</span>
            </div>
          </div>
          
          {/* Value Props */}
          <div className="relative z-10 space-y-4 my-8">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl space-y-1.5 shadow-sm">
              <div className="flex items-center gap-2 text-amber-300">
                <Sparkles className="w-4 h-4 shrink-0" />
                <h4 className="font-extrabold text-sm text-white">Instant AI Catalog Sync</h4>
              </div>
              <p className="text-xs text-indigo-100 leading-relaxed font-medium">
                Connect your website URL to auto-extract and structure all your listings and property portfolio in seconds.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl space-y-1.5 shadow-sm">
              <div className="flex items-center gap-2 text-emerald-300">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <h4 className="font-extrabold text-sm text-white">LinkedIn-Style Portfolio</h4>
              </div>
              <p className="text-xs text-indigo-100 leading-relaxed font-medium">
                Receive your own public verified storefront with direct WhatsApp inquiries, image galleries, and reviews.
              </p>
            </div>
          </div>

          {/* Footer Badge */}
          <div className="relative z-10 pt-4 border-t border-white/10">
            <p className="text-xs text-indigo-200 font-medium flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Trusted by 1,000+ verified enterprise sellers.
            </p>
          </div>
        </div>

        {/* Right Side: Form Panel */}
        <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-center">
          
          <div className="w-full max-w-lg mx-auto">
            
            {/* Form Header */}
            <div className="mb-6">
              <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-200 inline-block mb-2">
                Fast Seller Onboarding
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Create your account</h1>
              <p className="text-gray-500 font-medium text-xs sm:text-sm mt-1">Start selling and expanding your business on TrueDeal.</p>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="mb-6 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <span className="w-2 h-2 rounded-full bg-red-500 shrink-0"></span>
                {errorMessage}
              </div>
            )}

            {/* Account Type Selection Tabs */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              
              {/* Seller Card */}
              <button 
                type="button"
                onClick={() => setAccountType("seller")}
                className={`text-left p-3.5 sm:p-4 rounded-2xl border-2 transition-all duration-200 relative ${
                  accountType === "seller" 
                    ? "border-[#4F46E5] bg-indigo-50/70 shadow-sm ring-1 ring-indigo-500/20" 
                    : "border-gray-200 hover:border-gray-300 bg-white"
                }`}
              >
                <div className="flex justify-between items-center mb-1.5">
                  <div className={`p-1.5 rounded-xl ${accountType === "seller" ? "bg-[#4F46E5] text-white" : "bg-gray-100 text-gray-600"}`}>
                    <Store className="w-4 h-4" />
                  </div>
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${accountType === "seller" ? "border-[#4F46E5] bg-[#4F46E5]" : "border-gray-300 bg-white"}`}>
                    {accountType === "seller" && <Check className="w-2.5 h-2.5 text-white" />}
                  </div>
                </div>
                <h3 className={`font-black text-xs sm:text-sm ${accountType === "seller" ? "text-indigo-900" : "text-gray-900"}`}>Seller & Merchant</h3>
                <p className="text-[11px] text-gray-500 font-medium leading-tight mt-0.5">Create portfolio & manage catalog</p>
              </button>

              {/* Customer Card */}
              <button 
                type="button"
                onClick={() => setAccountType("customer")}
                className={`text-left p-3.5 sm:p-4 rounded-2xl border-2 transition-all duration-200 relative ${
                  accountType === "customer" 
                    ? "border-[#4F46E5] bg-indigo-50/70 shadow-sm ring-1 ring-indigo-500/20" 
                    : "border-gray-200 hover:border-gray-300 bg-white"
                }`}
              >
                <div className="flex justify-between items-center mb-1.5">
                  <div className={`p-1.5 rounded-xl ${accountType === "customer" ? "bg-[#4F46E5] text-white" : "bg-gray-100 text-gray-600"}`}>
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${accountType === "customer" ? "border-[#4F46E5] bg-[#4F46E5]" : "border-gray-300 bg-white"}`}>
                    {accountType === "customer" && <Check className="w-2.5 h-2.5 text-white" />}
                  </div>
                </div>
                <h3 className={`font-black text-xs sm:text-sm ${accountType === "customer" ? "text-indigo-900" : "text-gray-900"}`}>Customer / Buyer</h3>
                <p className="text-[11px] text-gray-500 font-medium leading-tight mt-0.5">Browse & submit inquiries</p>
              </button>
            </div>

            {/* Form */}
            <form className="space-y-4" onSubmit={handleSignup}>
              
              {/* Seller Specific: Company Name */}
              {accountType === "seller" && (
                <>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-indigo-600" /> Company / Business Name *
                    </label>
                    <input 
                      type="text" 
                      placeholder="e.g. ANV REEALTY, Apex Studios, Prime Retail"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:border-[#4F46E5] focus:ring-2 focus:ring-indigo-100 outline-none text-xs font-semibold text-gray-900 placeholder:text-gray-400 transition-all shadow-sm"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-700">Industry / Sector</label>
                      <select
                        value={businessType}
                        onChange={(e) => setBusinessType(e.target.value)}
                        className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-xl focus:border-[#4F46E5] focus:ring-2 focus:ring-indigo-100 outline-none text-xs font-semibold text-gray-800 transition-all shadow-sm"
                      >
                        <option value="Commercial & Residential Real Estate">Real Estate & Commercial</option>
                        <option value="IT, Computers & Electronics">Electronics & Hardware</option>
                        <option value="Hospital & Medical Facilities">Hospital / Healthcare</option>
                        <option value="Retail & Showrooms">Retail & Showrooms</option>
                        <option value="Professional Consulting & Agency">Consulting & Agency</option>
                        <option value="Manufacturing & Industrial">Industrial & Manufacturing</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-700 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-red-500" /> City / Region
                      </label>
                      <input 
                        type="text" 
                        placeholder="e.g. Pune, Mumbai, Bengaluru"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:border-[#4F46E5] focus:ring-2 focus:ring-indigo-100 outline-none text-xs font-semibold text-gray-900 shadow-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-700 flex items-center gap-1">
                        <Globe className="w-3.5 h-3.5 text-blue-500" /> Website URL (Optional)
                      </label>
                      <input 
                        type="text" 
                        placeholder="https://yourcompany.com"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:border-[#4F46E5] focus:ring-2 focus:ring-indigo-100 outline-none text-xs font-semibold text-gray-900 placeholder:text-gray-400 shadow-sm"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-700">GSTIN / Registration (Optional)</label>
                      <input 
                        type="text" 
                        placeholder="e.g. 27AADCB2230M1Z2"
                        value={gstin}
                        onChange={(e) => setGstin(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:border-[#4F46E5] focus:ring-2 focus:ring-indigo-100 outline-none text-xs font-semibold text-gray-900 placeholder:text-gray-400 shadow-sm"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Owner / Contact Name */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">First Name *</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Rahul"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:border-[#4F46E5] focus:ring-2 focus:ring-indigo-100 outline-none text-xs font-semibold text-gray-900 shadow-sm"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">Last Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Sharma"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:border-[#4F46E5] focus:ring-2 focus:ring-indigo-100 outline-none text-xs font-semibold text-gray-900 shadow-sm"
                  />
                </div>
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">Work Email Address *</label>
                  <input 
                    type="email" 
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:border-[#4F46E5] focus:ring-2 focus:ring-indigo-100 outline-none text-xs font-semibold text-gray-900 shadow-sm"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-emerald-600" /> Phone / WhatsApp
                  </label>
                  <input 
                    type="text" 
                    placeholder="+91 98200 12345"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:border-[#4F46E5] focus:ring-2 focus:ring-indigo-100 outline-none text-xs font-semibold text-gray-900 shadow-sm"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Password *</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"}
                    placeholder="Minimum 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-4 pr-12 py-2.5 bg-white border border-gray-300 rounded-xl focus:border-[#4F46E5] focus:ring-2 focus:ring-indigo-100 outline-none text-xs font-semibold text-gray-900 shadow-sm"
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
                className="w-full bg-[#4F46E5] hover:bg-[#4338CA] text-white py-3.5 rounded-xl font-black text-sm mt-4 shadow-lg shadow-indigo-600/25 transition-all hover:scale-[1.01] flex items-center justify-center gap-2 h-12 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Creating Account & Portfolio...
                  </>
                ) : (
                  <>
                    Create {accountType === "seller" ? "Seller Store & Portfolio" : "Account"} <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
              
            </form>

            {/* Footer */}
            <p className="mt-6 text-center text-xs text-gray-500 font-semibold">
              Already have an account?{" "}
              <Link href="/login" className="font-bold text-[#4F46E5] hover:underline">
                Sign in here
              </Link>
            </p>
            
          </div>
        </div>

      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen w-full flex items-center justify-center bg-gray-50/50">Loading...</div>}>
      <SignupFormContent />
    </Suspense>
  );
}
