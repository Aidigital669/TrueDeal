"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  User, Phone, Mail, MapPin, Heart, ShoppingBag, 
  ArrowLeft, CheckCircle2, Loader2, LogOut, Store, 
  ShieldCheck, Sparkles, Building2, Save
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  getCurrentUserAction, 
  updateCustomerProfileAction, 
  logoutUserAction, 
  UserSession 
} from "@/lib/auth-actions";

export default function CustomerAccountPage() {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  
  // Profile Form state
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Local Wishlist & Cart count
  const [wishlistCount, setWishlistCount] = useState(0);
  const [cartCount, setCartCount] = useState(0);

  const router = useRouter();

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await getCurrentUserAction();
        if (res.success && res.user) {
          setUser(res.user);
          setName(res.user.name || "");
          setPhone(res.user.phone || "");
          setEmail(res.user.email || "");
          setCity(res.user.city || "");
        } else {
          // If not logged in, redirect to login page
          router.push("/login");
        }

        // Load local counts
        try {
          const w = JSON.parse(localStorage.getItem("truedeal_wishlist") || "[]");
          setWishlistCount(w.length);
          const c = JSON.parse(localStorage.getItem("truedeal_cart") || "[]");
          setCartCount(c.reduce((s: number, item: any) => s + (item.quantity || 1), 0));
        } catch {}

      } catch (err) {
        console.error("Failed to load user profile:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [router]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await updateCustomerProfileAction({
        name,
        phone,
        email,
        city,
        address
      });

      if (res.success && res.user) {
        setUser(res.user);
        setMessage({ type: "success", text: "Profile details updated successfully!" });
      } else {
        setMessage({ type: "error", text: res.error || "Failed to update profile." });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "An error occurred." });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logoutUserAction();
      router.push("/");
      router.refresh();
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      setLoggingOut(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 font-sans">
        <div className="flex items-center gap-2.5 text-xs font-bold text-indigo-600 bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Loading your account details...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-gray-900 font-sans py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Top Header Navigation */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-200">
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-indigo-600 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to TrueDeal Marketplace</span>
          </Link>

          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            disabled={loggingOut}
            className="rounded-xl border-gray-200 text-xs font-bold text-red-600 hover:bg-red-50 hover:border-red-200 h-8.5 cursor-pointer"
          >
            {loggingOut ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LogOut className="w-3.5 h-3.5 mr-1.5" />}
            <span>Sign Out</span>
          </Button>
        </div>

        {/* Profile Card Banner */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-black text-2xl flex items-center justify-center shadow-md shadow-indigo-600/20 shrink-0">
              {user?.name ? user.name.charAt(0).toUpperCase() : "C"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                  {user?.name || "TrueDeal Customer"}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" /> Verified Customer
                </span>
              </div>
              <p className="text-xs text-gray-500 font-medium mt-0.5">
                {user?.phone || user?.email || "Mobile Verified Account"}
              </p>
            </div>
          </div>

          {/* Quick Stats Badges */}
          <div className="flex items-center gap-3 self-stretch sm:self-auto">
            <Link href="/" className="flex-1 sm:flex-initial">
              <div className="p-3 rounded-2xl bg-pink-50/70 border border-pink-100 hover:border-pink-300 transition-all text-center cursor-pointer">
                <div className="flex items-center justify-center gap-1 text-pink-600 text-xs font-bold">
                  <Heart className="w-3.5 h-3.5 fill-pink-500" />
                  <span>Wishlist</span>
                </div>
                <span className="text-base font-black text-pink-950 mt-0.5 block">{wishlistCount} Items</span>
              </div>
            </Link>

            <Link href="/" className="flex-1 sm:flex-initial">
              <div className="p-3 rounded-2xl bg-indigo-50/70 border border-indigo-100 hover:border-indigo-300 transition-all text-center cursor-pointer">
                <div className="flex items-center justify-center gap-1 text-indigo-600 text-xs font-bold">
                  <ShoppingBag className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Inquiry Bag</span>
                </div>
                <span className="text-base font-black text-indigo-950 mt-0.5 block">{cartCount} Items</span>
              </div>
            </Link>
          </div>
        </div>

        {/* Message Banner */}
        {message && (
          <div className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in ${
            message.type === "success" 
              ? "bg-emerald-50 border border-emerald-200 text-emerald-800" 
              : "bg-red-50 border border-red-200 text-red-700"
          }`}>
            {message.type === "success" ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <span className="w-2 h-2 rounded-full bg-red-500"></span>}
            <span>{message.text}</span>
          </div>
        )}

        {/* Personal Details Form */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-6">
          <div>
            <h2 className="text-base font-black text-gray-900 tracking-tight">Account & Contact Details</h2>
            <p className="text-xs text-gray-500 font-medium">Keep your contact details up to date for fast seller inquiries and order updates.</p>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your Name"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none text-xs font-bold text-gray-900 bg-white"
                  />
                </div>
              </div>

              {/* Mobile Number */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Mobile Number (WhatsApp Enabled)</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98200 12345"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none text-xs font-bold text-gray-900 bg-white"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="customer@email.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none text-xs font-bold text-gray-900 bg-white"
                  />
                </div>
              </div>

              {/* Default City */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Default City / Region</label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Pune, Mumbai, Bangalore"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none text-xs font-bold text-gray-900 bg-white"
                  />
                </div>
              </div>

            </div>

            {/* Delivery / Shipping Address */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700">Delivery / Billing Address (Optional)</label>
              <textarea 
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Street address, building name, pincode..."
                className="w-full p-3 rounded-xl border border-gray-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none text-xs font-medium text-gray-900 bg-white resize-none"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2 flex justify-end">
              <Button
                type="submit"
                disabled={saving}
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold px-6 h-10 shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-98"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Saving Changes...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" /> Save Profile Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>

        {/* Are you a seller card */}
        <div className="p-6 rounded-3xl bg-gradient-to-r from-gray-900 to-indigo-950 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg shadow-indigo-950/20">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-black text-indigo-400">
              <Store className="w-4 h-4" />
              <span>Grow with TrueDeal</span>
            </div>
            <h3 className="text-base font-black">Want to list and sell your products or services?</h3>
            <p className="text-xs text-gray-400 font-medium">Join verified direct producers and service providers with AI catalog visibility and custom portfolios.</p>
          </div>
          
          <Link href="/signup?type=seller" className="shrink-0">
            <Button className="bg-white text-gray-900 hover:bg-gray-100 font-black text-xs rounded-xl h-10 px-5 shadow-sm cursor-pointer">
              Register as Seller
            </Button>
          </Link>
        </div>

      </div>
    </div>
  );
}
