"use client";

import { useState, useEffect, useRef } from "react";
import { 
  User, Lock, Key, CreditCard, Shield, Save, Check, 
  Loader2, Eye, EyeOff, Copy, Plus, Trash2, Smartphone, 
  ShieldCheck, CheckCircle2, AlertCircle, RefreshCw, Download, 
  ExternalLink, Sparkles, Building2, Upload, Globe, Image as ImageIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  getAccountSettings, 
  updateProfileSettings, 
  changePasswordAction, 
  generateApiKey,
  revokeApiKey,
  UserSettingsData 
} from "@/lib/settings-actions";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"profile" | "security" | "billing" | "api">("profile");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");

  const [settings, setSettings] = useState<UserSettingsData | null>(null);

  // Profile fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [storeName, setStoreName] = useState("");
  const [avatar, setAvatar] = useState("");
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [newPhotoUrl, setNewPhotoUrl] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Please select an image smaller than 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setAvatar(event.target.result as string);
        setUploadSuccess(true);
        setTimeout(() => setUploadSuccess(false), 4000);
      }
    };
    reader.readAsDataURL(file);
  };

  // Password fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [passSaving, setPassSaving] = useState(false);
  const [passSuccess, setPassSuccess] = useState(false);
  const [passError, setPassError] = useState("");

  // API Key state
  const [newKeyName, setNewKeyName] = useState("");
  const [keyGenerating, setKeyGenerating] = useState(false);
  const [copiedKeyId, setCopiedKeyId] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await getAccountSettings();
        if (res.success && res.data) {
          setSettings(res.data);
          setFirstName(res.data.firstName);
          setLastName(res.data.lastName);
          setEmail(res.data.email);
          setPhone(res.data.phone);
          setStoreName(res.data.storeName);
          setAvatar(res.data.avatar);
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Save Profile
  const handleSaveProfile = async () => {
    setSaving(true);
    setSavedSuccess(false);
    setSaveError("");
    try {
      const res = await updateProfileSettings({
        firstName,
        lastName,
        email,
        phone,
        storeName,
        avatar
      });
      if (res.success) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 4000);
      } else {
        setSaveError(res.error || "Failed to update profile.");
      }
    } catch (err: any) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Change Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError("");
    setPassSuccess(false);

    if (newPassword !== confirmPassword) {
      setPassError("New passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setPassError("Password must be at least 6 characters.");
      return;
    }

    setPassSaving(true);
    try {
      const res = await changePasswordAction(currentPassword, newPassword);
      if (res.success) {
        setPassSuccess(true);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => setPassSuccess(false), 4000);
      } else {
        setPassError(res.error || "Failed to change password.");
      }
    } catch (err: any) {
      setPassError(err.message);
    } finally {
      setPassSaving(false);
    }
  };

  // Generate API Key
  const handleGenerateKey = async () => {
    if (!newKeyName.trim()) {
      alert("Please enter a name for the API key.");
      return;
    }
    setKeyGenerating(true);
    try {
      const res = await generateApiKey(newKeyName.trim());
      if (res.success && res.apiKey && settings) {
        setSettings({
          ...settings,
          apiKeys: [...settings.apiKeys, res.apiKey]
        });
        setNewKeyName("");
      } else {
        alert("Failed to generate key: " + res.error);
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setKeyGenerating(false);
    }
  };

  // Revoke Key
  const handleRevokeKey = async (id: string) => {
    if (!confirm("Are you sure you want to revoke this API key?")) return;
    try {
      const res = await revokeApiKey(id);
      if (res.success && settings) {
        setSettings({
          ...settings,
          apiKeys: settings.apiKeys.filter(k => k.id !== id)
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const copyKeyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKeyId(id);
    setTimeout(() => setCopiedKeyId(""), 3000);
  };

  if (loading || !settings) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 font-sans">
        <div className="w-10 h-10 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"></div>
        <p className="text-gray-500 font-semibold text-sm">Loading Account Settings...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-300 font-sans pb-16">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight mb-1">
          Account Settings
        </h1>
        <p className="text-gray-500 font-medium text-sm">
          Manage your enterprise profile, credentials, billing, and API integrations.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Settings Navigation Sidebar */}
        <div className="w-full lg:w-64 flex-shrink-0">
          <div className="bg-white rounded-2xl border border-gray-200 p-2 shadow-sm flex flex-col gap-1 sticky top-24">
            
            <SidebarTab 
              active={activeTab === "profile"} 
              onClick={() => setActiveTab("profile")} 
              icon={<User className="w-4 h-4" />} 
              label="Profile Settings" 
            />
            
            <SidebarTab 
              active={activeTab === "security"} 
              onClick={() => setActiveTab("security")} 
              icon={<Lock className="w-4 h-4" />} 
              label="Security & Passwords" 
            />

            <SidebarTab 
              active={activeTab === "billing"} 
              onClick={() => setActiveTab("billing")} 
              icon={<CreditCard className="w-4 h-4" />} 
              label="Billing & Subscription" 
            />

            <SidebarTab 
              active={activeTab === "api"} 
              onClick={() => setActiveTab("api")} 
              icon={<Key className="w-4 h-4" />} 
              label="API Keys & Webhooks" 
            />

          </div>
        </div>

        {/* Settings Content Panels */}
        <div className="flex-1 flex flex-col gap-6">
          
          {/* ========================================================= */}
          {/* TAB 1: PROFILE SETTINGS */}
          {/* ========================================================= */}
          {activeTab === "profile" && (
            <div className="flex flex-col gap-6 animate-in fade-in duration-200">
              
              <div className="bg-white rounded-3xl border border-gray-200 p-6 md:p-8 shadow-sm">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                  <div>
                    <h3 className="text-lg font-extrabold text-gray-900 flex items-center gap-2">
                      <User className="w-5 h-5 text-indigo-600" /> Personal Information & Store Representative
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">Your public profile name and store contacts.</p>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Verified
                  </span>
                </div>
                
                {/* Avatar Section */}
                <div className="flex flex-wrap items-center gap-6 mb-8 p-4 rounded-2xl bg-gray-50/70 border border-gray-100">
                  <div className="relative w-20 h-20 rounded-2xl bg-white border-2 border-indigo-200 shadow-sm flex items-center justify-center overflow-hidden flex-shrink-0 group">
                    <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                    <button 
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 bg-black/40 text-white opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity text-[10px] font-bold cursor-pointer"
                    >
                      <Upload className="w-4 h-4 mb-0.5" />
                      Upload
                    </button>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    {/* Hidden Native File Input */}
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      accept="image/png, image/jpeg, image/jpg, image/webp" 
                      onChange={handleFileUpload} 
                      className="hidden" 
                    />

                    <div className="flex flex-wrap items-center gap-2.5">
                      <button 
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl h-10 px-4 text-xs shadow-sm transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Photo</span>
                      </button>

                      <button 
                        type="button"
                        onClick={() => setPhotoModalOpen(true)}
                        className="bg-white hover:bg-gray-50 text-gray-800 font-bold border border-gray-300 rounded-xl h-10 px-3.5 text-xs shadow-xs transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
                      >
                        <Globe className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Image URL</span>
                      </button>

                      <button 
                        type="button"
                        onClick={() => setAvatar("https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&q=80")}
                        className="text-red-500 font-bold hover:text-red-600 hover:bg-red-50 rounded-xl h-10 px-3 text-xs transition-colors cursor-pointer"
                      >
                        Reset Default
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <p className="text-[11px] text-gray-400">Supported: JPG, PNG, WEBP (Max 5MB).</p>
                      {uploadSuccess && (
                        <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1 animate-in fade-in">
                          <Check className="w-3 h-3 text-emerald-500" /> Photo uploaded! Click "Save Profile" below to persist.
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">First Name *</label>
                    <input 
                      type="text" 
                      value={firstName} 
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none" 
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Last Name *</label>
                    <input 
                      type="text" 
                      value={lastName} 
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none" 
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Email Address *</label>
                    <input 
                      type="email" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none" 
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Phone / WhatsApp *</label>
                    <input 
                      type="text" 
                      value={phone} 
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none" 
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Store / Business Brand Name</label>
                    <input 
                      type="text" 
                      value={storeName} 
                      onChange={(e) => setStoreName(e.target.value)}
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none" 
                      placeholder="e.g. ANV REEALTY"
                    />
                  </div>
                </div>

                {/* Save Feedback & Trigger */}
                <div className="mt-8 flex items-center justify-between border-t border-gray-100 pt-6">
                  <div>
                    {savedSuccess && (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200 animate-in fade-in">
                        <Check className="w-4 h-4 text-emerald-600" /> Profile settings saved successfully!
                      </span>
                    )}
                    {saveError && (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 bg-red-50 px-3.5 py-1.5 rounded-full border border-red-200">
                        <AlertCircle className="w-4 h-4" /> {saveError}
                      </span>
                    )}
                  </div>

                  <Button 
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="bg-[#4F46E5] hover:bg-[#4338ca] text-white rounded-xl px-8 h-11 text-xs font-bold shadow-md flex items-center gap-2"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Save Profile</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="bg-white rounded-3xl border border-red-200 p-6 md:p-8 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-red-500"></div>
                <h3 className="text-base font-bold text-gray-900 mb-1 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-red-500" /> Account Security Zone
                </h3>
                <p className="text-xs text-gray-500 mb-4">Export your store data or request permanent store deactivation.</p>
                <div className="flex gap-3">
                  <Button variant="outline" className="text-xs font-bold rounded-xl h-9">
                    Export All Listings CSV
                  </Button>
                </div>
              </div>

            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: SECURITY & PASSWORDS */}
          {/* ========================================================= */}
          {activeTab === "security" && (
            <div className="bg-white rounded-3xl border border-gray-200 p-6 md:p-8 shadow-sm animate-in fade-in duration-200 space-y-8">
              
              <div>
                <h3 className="text-lg font-extrabold text-gray-900 flex items-center gap-2 mb-1">
                  <Lock className="w-5 h-5 text-indigo-600" /> Password & Authentication Security
                </h3>
                <p className="text-xs text-gray-500">Ensure your seller account uses a strong, protected password.</p>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-4 max-w-lg">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Current Password *</label>
                  <input 
                    type={showPass ? "text" : "password"} 
                    value={currentPassword} 
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none" 
                    placeholder="Enter current password"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">New Password *</label>
                  <input 
                    type={showPass ? "text" : "password"} 
                    value={newPassword} 
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none" 
                    placeholder="At least 6 characters"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Confirm New Password *</label>
                  <input 
                    type={showPass ? "text" : "password"} 
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none" 
                    placeholder="Confirm new password"
                    required
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button 
                    type="button" 
                    onClick={() => setShowPass(!showPass)}
                    className="text-xs font-semibold text-gray-600 hover:text-gray-900 flex items-center gap-1.5"
                  >
                    {showPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    {showPass ? "Hide Passwords" : "Show Passwords"}
                  </button>
                </div>

                {passSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Password changed successfully!
                  </div>
                )}

                {passError && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-bold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500" /> {passError}
                  </div>
                )}

                <Button 
                  type="submit" 
                  disabled={passSaving}
                  className="bg-[#4F46E5] hover:bg-[#4338ca] text-white rounded-xl px-6 h-10 text-xs font-bold"
                >
                  {passSaving ? "Updating Password..." : "Update Password"}
                </Button>
              </form>

              {/* Active Sessions */}
              <div className="pt-6 border-t border-gray-100">
                <h4 className="font-bold text-sm text-gray-900 mb-3">Active Login Sessions</h4>
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Smartphone className="w-6 h-6 text-indigo-600" />
                    <div>
                      <span className="font-bold text-xs text-gray-900 block">Current Web Browser Session</span>
                      <span className="text-[11px] text-gray-500">Windows 11 · Pune, Maharashtra · Active Now</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    This Device
                  </span>
                </div>
              </div>

            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 3: BILLING & PAYMENTS */}
          {/* ========================================================= */}
          {activeTab === "billing" && (
            <div className="bg-white rounded-3xl border border-gray-200 p-6 md:p-8 shadow-sm animate-in fade-in duration-200 space-y-8">
              
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div>
                  <h3 className="text-lg font-extrabold text-gray-900 flex items-center gap-2 mb-1">
                    <CreditCard className="w-5 h-5 text-indigo-600" /> Subscription & Plan Tier
                  </h3>
                  <p className="text-xs text-gray-500">Your current plan benefits, billing cycle, and payment receipts.</p>
                </div>
                <span className="bg-indigo-50 text-indigo-700 px-3.5 py-1 rounded-full text-xs font-black border border-indigo-200">
                  Enterprise Tier Active
                </span>
              </div>

              {/* Active Plan Card */}
              <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-900 to-slate-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-md">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-400" />
                    <span className="text-xs font-extrabold text-amber-300 uppercase tracking-wider">Enterprise Partner Tier</span>
                  </div>
                  <h4 className="text-2xl font-black">Unlimited Listings + Deep AI Scraper</h4>
                  <p className="text-xs text-indigo-200 max-w-md leading-relaxed">
                    Includes MahaRERA verification badge, live WhatsApp RFQs, unlimited property scraping, and custom `/portfolio/anv-reealty` domain.
                  </p>
                </div>
                <div className="flex flex-col items-start md:items-end gap-2 shrink-0">
                  <span className="text-2xl font-black">₹24,999<span className="text-xs font-normal text-indigo-200">/year</span></span>
                  <span className="text-[11px] text-emerald-400 font-bold">Renews on 01 Sep 2027</span>
                </div>
              </div>

              {/* Invoices List */}
              <div>
                <h4 className="font-bold text-sm text-gray-900 mb-3">Billing History & Invoices</h4>
                <div className="divide-y divide-gray-100 border border-gray-200 rounded-2xl overflow-hidden">
                  <InvoiceRow id="INV-2026-09" date="01 Sep 2026" amount="₹24,999" status="Paid" />
                  <InvoiceRow id="INV-2025-09" date="01 Sep 2025" amount="₹19,999" status="Paid" />
                </div>
              </div>

            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 5: API KEYS */}
          {/* ========================================================= */}
          {activeTab === "api" && (
            <div className="bg-white rounded-3xl border border-gray-200 p-6 md:p-8 shadow-sm animate-in fade-in duration-200 space-y-6">
              
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div>
                  <h3 className="text-lg font-extrabold text-gray-900 flex items-center gap-2 mb-1">
                    <Key className="w-5 h-5 text-indigo-600" /> API Keys & Developer Webhooks
                  </h3>
                  <p className="text-xs text-gray-500">Integrate TrueDeal lead streaming with your CRM or ERP system.</p>
                </div>
              </div>

              {/* Generate New Key Form */}
              <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
                <h4 className="font-bold text-xs text-gray-900 uppercase tracking-wider">Generate New API Key</h4>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input 
                    type="text" 
                    placeholder="Key description (e.g. Salesforce CRM Sync, Real Estate ERP)"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 text-xs font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none"
                  />
                  <Button 
                    onClick={handleGenerateKey}
                    disabled={keyGenerating}
                    className="bg-[#4F46E5] hover:bg-[#4338ca] text-white rounded-xl px-5 h-10 text-xs font-bold flex items-center gap-1.5 shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" /> {keyGenerating ? "Generating..." : "Generate Key"}
                  </Button>
                </div>
              </div>

              {/* Active Keys List */}
              <div className="space-y-3">
                <h4 className="font-bold text-sm text-gray-900">Active API Keys</h4>
                {settings.apiKeys.map((k) => (
                  <div key={k.id} className="p-4 rounded-2xl border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-gray-900">{k.name}</span>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">Live</span>
                      </div>
                      <code className="text-xs font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded block sm:inline-block">
                        {k.maskedKey}
                      </code>
                      <span className="text-[11px] text-gray-400 block sm:inline-block sm:ml-2">Created on {k.createdAt}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => copyKeyToClipboard(k.id, k.key)}
                        className="text-xs font-bold h-8 px-3 rounded-lg"
                      >
                        {copiedKeyId === k.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedKeyId === k.id ? "Copied!" : "Copy"}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => handleRevokeKey(k.id)}
                        className="text-xs font-bold text-red-500 hover:text-red-600 hover:bg-red-50 h-8 px-2 rounded-lg"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

        </div>

      </div>

      {/* Photo URL Change Modal */}
      {photoModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-gray-200 shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200 space-y-4">
            <h3 className="font-bold text-base text-gray-900">Change Profile Photo</h3>
            <p className="text-xs text-gray-500">Enter a direct image URL or choose one of our sample avatars.</p>
            
            <input 
              type="text" 
              placeholder="https://images.unsplash.com/..." 
              value={newPhotoUrl}
              onChange={(e) => setNewPhotoUrl(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-indigo-600"
            />

            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => setPhotoModalOpen(false)} className="text-xs font-bold rounded-xl">
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  if (newPhotoUrl.trim()) {
                    setAvatar(newPhotoUrl.trim());
                  }
                  setPhotoModalOpen(false);
                }}
                className="bg-[#4F46E5] hover:bg-[#4338ca] text-white text-xs font-bold rounded-xl"
              >
                Apply Photo
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function SidebarTab({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs transition-all text-left w-full ${
        active ? "bg-[#F5F3FF] text-[#4F46E5] shadow-sm" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
      }`}
    >
      <span className={active ? "text-[#4F46E5]" : "text-gray-400"}>{icon}</span>
      {label}
    </button>
  );
}

function InvoiceRow({ id, date, amount, status }: { id: string; date: string; amount: string; status: string }) {
  return (
    <div className="flex items-center justify-between p-4 bg-white hover:bg-gray-50/80 transition-colors">
      <div className="flex items-center gap-3">
        <span className="font-mono text-xs font-bold text-gray-900">{id}</span>
        <span className="text-xs text-gray-500">{date}</span>
      </div>
      <div className="flex items-center gap-4">
        <span className="font-bold text-xs text-gray-900">{amount}</span>
        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
          {status}
        </span>
        <button 
          onClick={() => alert(`Downloading official PDF tax receipt for invoice ${id}...`)}
          className="text-indigo-600 hover:text-indigo-800 p-1" 
          title="Download Receipt"
        >
          <Download className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
