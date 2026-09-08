"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Store, Search, Filter, ShieldCheck, ShieldAlert, 
  ExternalLink, Eye, CheckCircle2, XCircle, MoreVertical, 
  Loader2, RefreshCw, Trash2, Edit3, UserCheck, 
  Layers, Phone, Mail, MapPin, Building2, Plus, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  getAdminSellersList, 
  updateSellerStatusAction, 
  deleteSellerAction, 
  impersonateSellerAction 
} from "@/lib/admin-actions";

export default function AdminSellersPage() {
  const [sellers, setSellers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [verifiedFilter, setVerifiedFilter] = useState("all");
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [selectedSeller, setSelectedSeller] = useState<any | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    storeName: "",
    businessType: "",
    city: "",
    phone: "",
    email: ""
  });
  const router = useRouter();

  const loadSellers = async () => {
    setLoading(true);
    try {
      const res = await getAdminSellersList({
        search,
        status: statusFilter,
        verified: verifiedFilter
      });
      if (res.success) {
        setSellers(res.sellers);
      }
    } catch (err) {
      console.error("Error loading sellers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSellers();
  }, [search, statusFilter, verifiedFilter]);

  const handleToggleVerify = async (slug: string, current: boolean) => {
    const res = await updateSellerStatusAction(slug, { isVerified: !current });
    if (res.success) {
      setActionNotice(`Verification updated for ${slug}`);
      setTimeout(() => setActionNotice(null), 3000);
      loadSellers();
    }
  };

  const handleToggleActive = async (slug: string, current: boolean) => {
    const res = await updateSellerStatusAction(slug, { isActive: !current });
    if (res.success) {
      setActionNotice(`Store status set to ${!current ? "Active" : "Suspended"}`);
      setTimeout(() => setActionNotice(null), 3000);
      loadSellers();
    }
  };

  const handleDeleteSeller = async (slug: string, storeName: string) => {
    if (!confirm(`Are you sure you want to delete "${storeName}" (${slug}) and its portfolio?`)) {
      return;
    }
    const res = await deleteSellerAction(slug, false);
    if (res.success) {
      setActionNotice(`Seller "${storeName}" deleted.`);
      setTimeout(() => setActionNotice(null), 3000);
      loadSellers();
    }
  };

  const handleImpersonate = async (slug: string) => {
    const res = await impersonateSellerAction(slug);
    if (res.success && res.redirect) {
      router.push(res.redirect);
    }
  };

  const handleOpenEdit = (seller: any) => {
    setSelectedSeller(seller);
    setEditFormData({
      storeName: seller.storeName || "",
      businessType: seller.businessType || "",
      city: seller.city || "",
      phone: seller.phone || "",
      email: seller.email || ""
    });
    setIsEditing(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSeller) return;
    const res = await updateSellerStatusAction(selectedSeller.slug, editFormData);
    if (res.success) {
      setActionNotice(`Updated seller details for ${selectedSeller.storeName}`);
      setTimeout(() => setActionNotice(null), 3000);
      setIsEditing(false);
      loadSellers();
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans pb-12">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Store className="w-6 h-6 text-indigo-400" />
            Multi-Tenant Sellers & Portfolios
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Supervise isolated merchant databases, KYC verification badges, and 1-click impersonation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={loadSellers}
            variant="outline"
            className="bg-gray-900 border-gray-800 text-gray-300 hover:text-white text-xs font-bold rounded-xl h-10 px-3 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Refresh
          </Button>
          <Link href="/signup?type=seller" target="_blank">
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl h-10 px-3.5 cursor-pointer shadow-md shadow-indigo-600/20">
              <Plus className="w-3.5 h-3.5 mr-1.5" /> Onboard Merchant
            </Button>
          </Link>
        </div>
      </div>

      {actionNotice && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold rounded-2xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Search & Filters */}
      <div className="bg-[#0f1118] border border-gray-800 rounded-3xl p-4 shadow-xl flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search sellers by store name, slug, phone, email, city, GSTIN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-900 border border-gray-800 text-xs font-semibold text-white placeholder:text-gray-500 focus:border-indigo-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-gray-900 border border-gray-800 text-gray-300 rounded-xl px-3 py-2 text-xs font-semibold focus:border-indigo-500 outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="inactive">Suspended Only</option>
          </select>

          {/* Verification Filter */}
          <select
            value={verifiedFilter}
            onChange={(e) => setVerifiedFilter(e.target.value)}
            className="bg-gray-900 border border-gray-800 text-gray-300 rounded-xl px-3 py-2 text-xs font-semibold focus:border-indigo-500 outline-none"
          >
            <option value="all">All KYC Badges</option>
            <option value="true">Verified Only</option>
            <option value="false">Unverified Only</option>
          </select>
        </div>
      </div>

      {/* Sellers Master Table */}
      <div className="bg-[#0f1118] border border-gray-800 rounded-3xl shadow-xl overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-2 text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
            <span className="text-xs font-bold">Querying Seller Multi-Tenant Registry...</span>
          </div>
        ) : sellers.length === 0 ? (
          <div className="py-16 text-center text-gray-500 text-xs font-semibold">
            No sellers found matching the current filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-gray-900/80 text-gray-400 font-bold uppercase text-[10px] tracking-wider border-b border-gray-800">
                <tr>
                  <th className="py-3.5 px-4">Merchant & Storefront</th>
                  <th className="py-3.5 px-4">Isolated Collection</th>
                  <th className="py-3.5 px-4">Catalog Count</th>
                  <th className="py-3.5 px-4">Location & Contact</th>
                  <th className="py-3.5 px-4">KYC Badge</th>
                  <th className="py-3.5 px-4">Store Status</th>
                  <th className="py-3.5 px-4 text-right">Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60 font-medium">
                {sellers.map((seller) => (
                  <tr key={seller._id} className="hover:bg-gray-900/40 transition-colors">
                    
                    {/* Merchant & Store */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-black text-xs shrink-0 shadow-sm">
                          {seller.storeName?.slice(0, 2).toUpperCase() || "ST"}
                        </div>
                        <div className="space-y-0.5 max-w-[200px]">
                          <div className="font-bold text-white text-xs truncate flex items-center gap-1.5">
                            {seller.storeName}
                          </div>
                          <div className="text-[11px] text-indigo-400 font-mono flex items-center gap-1">
                            <span>/{seller.slug}</span>
                            {seller.hasPortfolio && (
                              <Link 
                                href={`/p/${seller.slug}`} 
                                target="_blank"
                                className="text-gray-400 hover:text-white" 
                                title="Open Live Storefront"
                              >
                                <ExternalLink className="w-3 h-3 inline" />
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Isolated Collection */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5 text-[11px] font-mono text-gray-300">
                        <Layers className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span className="bg-gray-900 px-2 py-0.5 rounded border border-gray-800 truncate">
                          {seller.collectionName}
                        </span>
                      </div>
                    </td>

                    {/* Catalog Count */}
                    <td className="py-4 px-4">
                      <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 font-mono font-bold text-xs border border-indigo-500/20">
                        {seller.productCount} products
                      </span>
                    </td>

                    {/* Contact & Location */}
                    <td className="py-4 px-4">
                      <div className="space-y-0.5 text-[11px] text-gray-400">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-gray-500 shrink-0" />
                          <span>{seller.city}</span>
                        </div>
                        {seller.phone && (
                          <div className="flex items-center gap-1 font-mono text-gray-300">
                            <Phone className="w-3 h-3 text-gray-500 shrink-0" />
                            <span>{seller.phone}</span>
                          </div>
                        )}
                        {seller.gstin && (
                          <div className="text-[10px] text-gray-500 font-mono">
                            GST: {seller.gstin}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* KYC Badge Toggle */}
                    <td className="py-4 px-4">
                      <button
                        type="button"
                        onClick={() => handleToggleVerify(seller.slug, seller.isVerified)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                          seller.isVerified 
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30" 
                            : "bg-gray-800 text-gray-400 border border-gray-700 hover:bg-gray-700"
                        }`}
                        title="Click to toggle verified status"
                      >
                        {seller.isVerified ? (
                          <>
                            <ShieldCheck className="w-3 h-3" /> Verified
                          </>
                        ) : (
                          <>
                            <ShieldAlert className="w-3 h-3" /> Unverified
                          </>
                        )}
                      </button>
                    </td>

                    {/* Store Active Status */}
                    <td className="py-4 px-4">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(seller.slug, seller.isActive)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                          seller.isActive 
                            ? "bg-blue-500/20 text-blue-300 border border-blue-500/30 hover:bg-blue-500/30" 
                            : "bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30"
                        }`}
                        title="Click to suspend or activate"
                      >
                        {seller.isActive ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" /> Active
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3" /> Suspended
                          </>
                        )}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        
                        {/* Impersonate Button */}
                        <button
                          type="button"
                          onClick={() => handleImpersonate(seller.slug)}
                          className="px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 hover:text-white border border-indigo-500/30 text-[11px] font-bold transition-colors cursor-pointer"
                          title="Impersonate & login into seller dashboard"
                        >
                          Login as Store
                        </button>

                        {/* Edit Details */}
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(seller)}
                          className="p-1.5 rounded-lg bg-gray-900 hover:bg-gray-800 text-gray-300 hover:text-white border border-gray-800 transition-colors"
                          title="Edit seller properties"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete Seller */}
                        <button
                          type="button"
                          onClick={() => handleDeleteSeller(seller.slug, seller.storeName)}
                          className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 transition-colors"
                          title="Delete seller store"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Seller Modal */}
      {isEditing && selectedSeller && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#12151f] border border-gray-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-gray-800">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-indigo-400" />
                Edit Merchant Profile: {selectedSeller.storeName}
              </h2>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="text-gray-400 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
              <div>
                <label className="text-gray-400 font-semibold mb-1 block">Store / Business Name</label>
                <input
                  type="text"
                  value={editFormData.storeName}
                  onChange={(e) => setEditFormData({ ...editFormData, storeName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-gray-900 border border-gray-800 text-white font-semibold focus:border-indigo-500 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-400 font-semibold mb-1 block">Business Category / Type</label>
                  <input
                    type="text"
                    value={editFormData.businessType}
                    onChange={(e) => setEditFormData({ ...editFormData, businessType: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-gray-900 border border-gray-800 text-white font-semibold focus:border-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-gray-400 font-semibold mb-1 block">City</label>
                  <input
                    type="text"
                    value={editFormData.city}
                    onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-gray-900 border border-gray-800 text-white font-semibold focus:border-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-400 font-semibold mb-1 block">Phone Number</label>
                  <input
                    type="text"
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-gray-900 border border-gray-800 text-white font-semibold focus:border-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-gray-400 font-semibold mb-1 block">Work Email</label>
                  <input
                    type="email"
                    value={editFormData.email}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-gray-900 border border-gray-800 text-white font-semibold focus:border-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-800">
                <Button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  variant="outline"
                  className="bg-gray-900 border-gray-800 text-gray-300 hover:text-white text-xs rounded-xl h-9"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl h-9 px-4 shadow-md shadow-indigo-600/20"
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
