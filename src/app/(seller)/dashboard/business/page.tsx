"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Store, MapPin, Globe, Building, CheckCircle2, ExternalLink, 
  Sparkles, FolderPlus, Save, Check, Loader2, Mail, Phone, ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSellerPortfolio, saveSellerPortfolio, PortfolioData } from "@/lib/portfolio-actions";

export default function BusinessPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [formData, setFormData] = useState({
    companyName: "",
    gstin: "",
    about: "",
    website: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    slug: ""
  });

  useEffect(() => {
    async function loadBusinessData() {
      try {
        setLoading(true);
        const res = await getSellerPortfolio();
        if (res.success && res.portfolio) {
          const p = res.portfolio;
          setFormData({
            companyName: p.companyName || "",
            gstin: p.gstin || "",
            about: p.about || "",
            website: p.website || "",
            email: p.email || "",
            phone: p.phone || "",
            address: p.address || "",
            city: p.city || "",
            state: p.state || "",
            slug: p.slug || ""
          });
        }
      } catch (err) {
        console.error("Failed to load business data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadBusinessData();
  }, []);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveChanges = async () => {
    setSaving(true);
    setSavedSuccess(false);

    try {
      const res = await saveSellerPortfolio({
        companyName: formData.companyName,
        gstin: formData.gstin,
        about: formData.about,
        website: formData.website,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        slug: formData.slug
      });

      if (res.success) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 4000);
      } else {
        alert("Failed to save changes: " + (res.error || "Unknown error"));
      }
    } catch (err: any) {
      alert("Error saving: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        <p className="text-gray-500 font-semibold text-sm">Loading business profile...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 animate-in fade-in zoom-in-95 duration-500 font-sans">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">My Business</h1>
          <p className="text-gray-500 font-medium text-lg">Manage your public seller profile and business details.</p>
        </div>
        <Link href="/dashboard/portfolio">
          <Button className="bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-xl font-bold h-11 px-5 flex items-center gap-2 shadow-sm">
            <FolderPlus className="w-4 h-4" /> Full Portfolio Builder
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Profile Card */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
            <div className="w-24 h-24 rounded-full bg-white border-4 border-white shadow-md relative z-10 mt-8 mb-4 flex items-center justify-center overflow-hidden">
               <Store className="w-10 h-10 text-indigo-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">{formData.companyName}</h3>
            <p className="text-sm text-gray-500 mb-4 flex items-center gap-1.5 justify-center">
              <MapPin className="w-3.5 h-3.5" /> {formData.city}, {formData.state}
            </p>
            <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-bold mb-6">
              <CheckCircle2 className="w-3.5 h-3.5" /> Verified Seller
            </div>
            <div className="flex flex-col gap-2.5 w-full">
              <Link href={`/portfolio/${formData.slug}`} target="_blank" className="w-full">
                <Button className="w-full bg-gray-900 hover:bg-gray-800 text-white rounded-xl h-11 font-bold flex items-center justify-center gap-2">
                  View Public Portfolio <ExternalLink className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/dashboard/portfolio" className="w-full">
                <Button variant="outline" className="w-full border-gray-200 text-indigo-600 hover:bg-indigo-50 font-bold rounded-xl h-11">
                  Edit Full Portfolio
                </Button>
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div className="text-xs text-gray-600 font-medium">
              <strong className="block text-gray-900 font-bold mb-0.5">Database Synced</strong>
              All changes are stored in your MongoDB database and synced across your catalog and public portfolio.
            </div>
          </div>
        </div>

        {/* Form Details */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm">
            
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Building className="w-5 h-5 text-indigo-600" /> Business Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Legal Business Name</label>
                <input 
                  type="text" 
                  value={formData.companyName} 
                  onChange={(e) => handleChange("companyName", e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none transition-all" 
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Tax ID / GSTIN</label>
                <input 
                  type="text" 
                  value={formData.gstin} 
                  onChange={(e) => handleChange("gstin", e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none transition-all" 
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">About the Business</label>
                <textarea 
                  rows={4} 
                  value={formData.about} 
                  onChange={(e) => handleChange("about", e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none resize-none transition-all"
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">City</label>
                <input 
                  type="text" 
                  value={formData.city} 
                  onChange={(e) => handleChange("city", e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none transition-all" 
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">State</label>
                <input 
                  type="text" 
                  value={formData.state} 
                  onChange={(e) => handleChange("state", e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none transition-all" 
                />
              </div>
            </div>
            
            <div className="w-full h-px bg-gray-100 my-8"></div>
            
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Globe className="w-5 h-5 text-indigo-600" /> Web Presence & Contact
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Website URL</label>
                <input 
                  type="text" 
                  value={formData.website} 
                  onChange={(e) => handleChange("website", e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none transition-all" 
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Support Email</label>
                <input 
                  type="email" 
                  value={formData.email} 
                  onChange={(e) => handleChange("email", e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none transition-all" 
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Contact Phone</label>
                <input 
                  type="text" 
                  value={formData.phone} 
                  onChange={(e) => handleChange("phone", e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none transition-all" 
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Street Address</label>
                <input 
                  type="text" 
                  value={formData.address} 
                  onChange={(e) => handleChange("address", e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none transition-all" 
                />
              </div>
            </div>

            {/* Save Button */}
            <div className="mt-8 flex items-center justify-between border-t border-gray-100 pt-6">
              <div>
                {savedSuccess && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200 animate-in fade-in">
                    <Check className="w-4 h-4" /> Changes saved to database!
                  </span>
                )}
              </div>

              <Button 
                onClick={handleSaveChanges}
                disabled={saving}
                className="bg-[#4F46E5] hover:bg-[#4338ca] text-white rounded-xl px-8 h-12 font-bold shadow-md transition-all hover:shadow-lg flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </Button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
