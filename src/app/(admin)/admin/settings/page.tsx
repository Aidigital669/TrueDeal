"use client";

import { useState, useEffect } from "react";
import { 
  Settings, Save, ShieldAlert, CheckCircle2, 
  Loader2, RefreshCw, Bell, CreditCard, Sparkles, 
  Globe, Mail, Phone, Lock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  getAdminPlatformSettings, 
  updateAdminPlatformSettings, 
  PlatformSettings 
} from "@/lib/admin-actions";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<PlatformSettings>({
    marketplaceName: "TrueDeal Marketplace",
    tagline: "Direct Verified Merchant Network & AI Discovery",
    supportEmail: "support@truedeal.in",
    supportPhone: "+91-9820012345",
    maintenanceMode: false,
    announcementBanner: {
      enabled: false,
      text: "Welcome to TrueDeal 2.0! Instant Verified Catalog Discovery.",
      type: "info"
    },
    geminiModel: "gemini-2.0-flash",
    razorpayMode: "test",
    autoVerifySellers: false
  });

  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const res = await getAdminPlatformSettings();
      if (res.success && res.settings) {
        setSettings(res.settings);
      }
    } catch (err) {
      console.error("Error loading platform settings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await updateAdminPlatformSettings(settings);
      if (res.success) {
        setActionNotice("Platform settings updated and persisted successfully.");
        setTimeout(() => setActionNotice(null), 4000);
      }
    } catch (err: any) {
      setActionNotice(`Failed to save: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto font-sans pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Settings className="w-6 h-6 text-indigo-400" />
            Global Platform Governance & Settings
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Configure platform branding, maintenance mode, announcement banners, payment keys, and AI defaults.
          </p>
        </div>

        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl h-10 px-4 shadow-lg shadow-indigo-600/20 cursor-pointer"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> Saving...
            </>
          ) : (
            <>
              <Save className="w-3.5 h-3.5 mr-1.5" /> Save Configuration
            </>
          )}
        </Button>
      </div>

      {actionNotice && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold rounded-2xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{actionNotice}</span>
        </div>
      )}

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-2 text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
          <span className="text-xs font-bold">Loading Platform Config...</span>
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          
          {/* Section 1: Marketplace Branding & Support */}
          <div className="bg-[#0f1118] border border-gray-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-800">
              <Globe className="w-4 h-4 text-indigo-400" />
              <h2 className="text-sm font-bold text-white">Marketplace Identity & Support</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-gray-400 font-semibold mb-1 block">Marketplace Name</label>
                <input
                  type="text"
                  value={settings.marketplaceName}
                  onChange={(e) => setSettings({ ...settings, marketplaceName: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-gray-900 border border-gray-800 text-white font-semibold focus:border-indigo-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-gray-400 font-semibold mb-1 block">Tagline</label>
                <input
                  type="text"
                  value={settings.tagline}
                  onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-gray-900 border border-gray-800 text-white font-semibold focus:border-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="text-gray-400 font-semibold mb-1 block">Support Email</label>
                <input
                  type="email"
                  value={settings.supportEmail}
                  onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-gray-900 border border-gray-800 text-white font-semibold focus:border-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="text-gray-400 font-semibold mb-1 block">Support Phone</label>
                <input
                  type="text"
                  value={settings.supportPhone}
                  onChange={(e) => setSettings({ ...settings, supportPhone: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-gray-900 border border-gray-800 text-white font-semibold focus:border-indigo-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Global Announcement Banner */}
          <div className="bg-[#0f1118] border border-gray-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-800">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-purple-400" />
                <h2 className="text-sm font-bold text-white">Broadcast Announcement Banner</h2>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.announcementBanner?.enabled}
                  onChange={(e) => setSettings({
                    ...settings,
                    announcementBanner: {
                      ...settings.announcementBanner,
                      enabled: e.target.checked
                    }
                  })}
                  className="rounded accent-purple-500"
                />
                <span className="text-xs font-bold text-purple-400">Enable Banner</span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="sm:col-span-2">
                <label className="text-gray-400 font-semibold mb-1 block">Banner Message</label>
                <input
                  type="text"
                  value={settings.announcementBanner?.text || ""}
                  onChange={(e) => setSettings({
                    ...settings,
                    announcementBanner: {
                      ...settings.announcementBanner,
                      text: e.target.value
                    }
                  })}
                  placeholder="e.g. TrueDeal Fest: Verified Discounts across 5,000+ products!"
                  className="w-full px-3 py-2.5 rounded-xl bg-gray-900 border border-gray-800 text-white font-semibold focus:border-purple-500 outline-none"
                />
              </div>

              <div>
                <label className="text-gray-400 font-semibold mb-1 block">Banner Style</label>
                <select
                  value={settings.announcementBanner?.type || "info"}
                  onChange={(e) => setSettings({
                    ...settings,
                    announcementBanner: {
                      ...settings.announcementBanner,
                      type: e.target.value as any
                    }
                  })}
                  className="w-full px-3 py-2.5 rounded-xl bg-gray-900 border border-gray-800 text-white font-semibold focus:border-purple-500 outline-none"
                >
                  <option value="info">Informative (Indigo)</option>
                  <option value="warning">Alert (Amber)</option>
                  <option value="success">Promotion (Emerald)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: AI Model & Payment Gateway Modes */}
          <div className="bg-[#0f1118] border border-gray-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-800">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-bold text-white">AI Engine & Payment Gateway Modes</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-gray-400 font-semibold mb-1 block">Default Gemini AI Discovery Model</label>
                <select
                  value={settings.geminiModel || "gemini-2.0-flash"}
                  onChange={(e) => setSettings({ ...settings, geminiModel: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-gray-900 border border-gray-800 text-white font-semibold focus:border-indigo-500 outline-none"
                >
                  <option value="gemini-2.0-flash">Google Gemini 2.0 Flash (Fastest & Recommended)</option>
                  <option value="gemini-1.5-flash">Google Gemini 1.5 Flash</option>
                  <option value="gemini-1.5-pro">Google Gemini 1.5 Pro (Deep Reasoning)</option>
                </select>
              </div>

              <div>
                <label className="text-gray-400 font-semibold mb-1 block">Razorpay Payment Mode</label>
                <select
                  value={settings.razorpayMode || "test"}
                  onChange={(e) => setSettings({ ...settings, razorpayMode: e.target.value as any })}
                  className="w-full px-3 py-2.5 rounded-xl bg-gray-900 border border-gray-800 text-white font-semibold focus:border-indigo-500 outline-none"
                >
                  <option value="test">Test Mode (Mock Transactions)</option>
                  <option value="live">Live Production Gateway</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 4: Security & Maintenance Toggles */}
          <div className="bg-[#0f1118] border border-gray-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-800">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-bold text-white">Security & Maintenance Safeguards</h2>
            </div>

            <div className="space-y-3 text-xs">
              <label className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-900/60 border border-gray-800 cursor-pointer">
                <div>
                  <span className="font-bold text-white block">Auto-Verify Newly Registered Merchants</span>
                  <span className="text-[11px] text-gray-400">Automatically assign Verified KYC badges upon registration.</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.autoVerifySellers}
                  onChange={(e) => setSettings({ ...settings, autoVerifySellers: e.target.checked })}
                  className="rounded accent-indigo-500 w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 cursor-pointer">
                <div>
                  <span className="font-bold text-amber-300 block">Emergency Maintenance Mode</span>
                  <span className="text-[11px] text-amber-400/80">Restricts public access with a maintenance screen while admin panel remains online.</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.maintenanceMode}
                  onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                  className="rounded accent-amber-500 w-4 h-4"
                />
              </label>
            </div>
          </div>

        </form>
      )}

    </div>
  );
}
