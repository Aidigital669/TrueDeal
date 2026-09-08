"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Box, Search, Filter, Star, Eye, Edit3, Trash2, 
  ExternalLink, CheckCircle2, XCircle, Loader2, 
  RefreshCw, Sparkles, Layers, DollarSign, Tag, ArrowUpRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  getAdminProductsList, 
  updateAdminProductAction, 
  deleteAdminProductAction,
  getAdminSellersList
} from "@/lib/admin-actions";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [sellers, setSellers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedSeller, setSelectedSeller] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    price: 0,
    category: "",
    aiVisibility: 90,
    isActive: true,
    isFeatured: false
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [prodRes, sellersRes] = await Promise.all([
        getAdminProductsList({
          search,
          sellerSlug: selectedSeller,
          category: selectedCategory
        }),
        getAdminSellersList()
      ]);

      if (prodRes.success) {
        setProducts(prodRes.products);
      }
      if (sellersRes.success) {
        setSellers(sellersRes.sellers);
      }
    } catch (err) {
      console.error("Error loading products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, selectedSeller, selectedCategory]);

  const handleToggleFeatured = async (product: any) => {
    const nextFeatured = !product.isFeatured;
    const res = await updateAdminProductAction(product._id, product.sellerSlug, {
      isFeatured: nextFeatured
    });
    if (res.success) {
      setActionNotice(`Product ${nextFeatured ? "featured on homepage" : "unfeatured"}`);
      setTimeout(() => setActionNotice(null), 3000);
      loadData();
    }
  };

  const handleToggleActive = async (product: any) => {
    const nextActive = !product.isActive;
    const res = await updateAdminProductAction(product._id, product.sellerSlug, {
      isActive: nextActive
    });
    if (res.success) {
      setActionNotice(`Product set to ${nextActive ? "Active" : "Hidden"}`);
      setTimeout(() => setActionNotice(null), 3000);
      loadData();
    }
  };

  const handleDelete = async (product: any) => {
    if (!confirm(`Delete "${product.title}" from ${product.collectionName}?`)) return;
    const res = await deleteAdminProductAction(product._id, product.sellerSlug);
    if (res.success) {
      setActionNotice("Product listing deleted successfully.");
      setTimeout(() => setActionNotice(null), 3000);
      loadData();
    }
  };

  const handleOpenEdit = (prod: any) => {
    setEditingProduct(prod);
    setEditForm({
      title: prod.title,
      price: prod.price || 0,
      category: prod.category || "General",
      aiVisibility: prod.aiVisibility || 90,
      isActive: prod.isActive !== false,
      isFeatured: prod.isFeatured === true
    });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    const res = await updateAdminProductAction(editingProduct._id, editingProduct.sellerSlug, editForm);
    if (res.success) {
      setActionNotice("Listing updated successfully.");
      setTimeout(() => setActionNotice(null), 3000);
      setEditingProduct(null);
      loadData();
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Box className="w-6 h-6 text-purple-400" />
            Global Multi-Tenant Catalog
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Aggregated supervision of all product & service listings across dedicated tenant databases.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={loadData}
            variant="outline"
            className="bg-gray-900 border-gray-800 text-gray-300 hover:text-white text-xs font-bold rounded-xl h-10 px-3 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Refresh
          </Button>
        </div>
      </div>

      {actionNotice && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold rounded-2xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Filters Bar */}
      <div className="bg-[#0f1118] border border-gray-800 rounded-3xl p-4 shadow-xl flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search listings across all merchant catalogs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-900 border border-gray-800 text-xs font-semibold text-white placeholder:text-gray-500 focus:border-indigo-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          {/* Tenant Collection / Seller Filter */}
          <select
            value={selectedSeller}
            onChange={(e) => setSelectedSeller(e.target.value)}
            className="bg-gray-900 border border-gray-800 text-gray-300 rounded-xl px-3 py-2 text-xs font-semibold focus:border-indigo-500 outline-none max-w-[200px]"
          >
            <option value="all">All Seller Partitions</option>
            {sellers.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.storeName} ({s.slug})
              </option>
            ))}
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-gray-900 border border-gray-800 text-gray-300 rounded-xl px-3 py-2 text-xs font-semibold focus:border-indigo-500 outline-none"
          >
            <option value="all">All Categories</option>
            <option value="Real Estate">Real Estate</option>
            <option value="Electronics">Electronics</option>
            <option value="Ayurveda">Ayurveda</option>
            <option value="Industrial">Industrial</option>
            <option value="Fashion">Fashion</option>
            <option value="Home">Home & Living</option>
          </select>
        </div>
      </div>

      {/* Listings Table */}
      <div className="bg-[#0f1118] border border-gray-800 rounded-3xl shadow-xl overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-2 text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
            <span className="text-xs font-bold">Querying Multi-Tenant Catalogs...</span>
          </div>
        ) : products.length === 0 ? (
          <div className="py-16 text-center text-gray-500 text-xs font-semibold">
            No products found matching the current filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-gray-900/80 text-gray-400 font-bold uppercase text-[10px] tracking-wider border-b border-gray-800">
                <tr>
                  <th className="py-3.5 px-4">Listing & Image</th>
                  <th className="py-3.5 px-4">Merchant Partition</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4">AI Visibility</th>
                  <th className="py-3.5 px-4">Featured</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60 font-medium">
                {products.map((prod) => (
                  <tr key={`${prod.collectionName}-${prod._id}`} className="hover:bg-gray-900/40 transition-colors">
                    
                    {/* Item & Image */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={prod.image}
                          alt={prod.title}
                          className="w-11 h-11 rounded-xl object-cover border border-gray-800 shrink-0 bg-gray-900"
                          onError={(e: any) => {
                            e.target.src = "https://images.unsplash.com/photo-1557821552-17105176677c?w=200&q=80";
                          }}
                        />
                        <div className="space-y-0.5 max-w-[220px]">
                          <div className="font-bold text-white text-xs truncate" title={prod.title}>
                            {prod.title}
                          </div>
                          <div className="text-[11px] text-gray-400 truncate">
                            {prod.description || "No description provided"}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Merchant Partition */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        <span className="font-bold text-gray-200 block truncate max-w-[130px]">
                          {prod.brand || prod.sellerSlug}
                        </span>
                        <span className="text-[10px] font-mono text-indigo-400 bg-gray-900 px-1.5 py-0.5 rounded border border-gray-800 truncate block max-w-[140px]">
                          {prod.collectionName}
                        </span>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-lg bg-gray-900 text-gray-300 font-semibold text-[11px] border border-gray-800">
                        {prod.category}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white text-xs font-mono">
                        ₹{Number(prod.price || 0).toLocaleString("en-IN")}
                      </div>
                    </td>

                    {/* AI Visibility */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-1 w-24">
                        <div className="flex items-center justify-between text-[10px] font-bold">
                          <span className="text-indigo-400 flex items-center gap-0.5">
                            <Sparkles className="w-2.5 h-2.5" /> AI
                          </span>
                          <span className="text-gray-300 font-mono">{prod.aiVisibility || 90}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                            style={{ width: `${prod.aiVisibility || 90}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Homepage Featured Toggle */}
                    <td className="py-3.5 px-4">
                      <button
                        type="button"
                        onClick={() => handleToggleFeatured(prod)}
                        className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                          prod.isFeatured
                            ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                            : "bg-gray-900 text-gray-500 border-gray-800 hover:text-gray-300"
                        }`}
                        title={prod.isFeatured ? "Featured on Customer Homepage" : "Click to feature"}
                      >
                        <Star className={`w-3.5 h-3.5 ${prod.isFeatured ? "fill-amber-400 text-amber-400" : ""}`} />
                      </button>
                    </td>

                    {/* Active Status */}
                    <td className="py-3.5 px-4">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(prod)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                          prod.isActive
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : "bg-gray-800 text-gray-400 border border-gray-700"
                        }`}
                      >
                        {prod.isActive ? "Active" : "Hidden"}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {prod.sourceUrl && (
                          <Link
                            href={prod.sourceUrl}
                            target="_blank"
                            className="p-1.5 rounded-lg bg-gray-900 hover:bg-gray-800 text-gray-400 hover:text-white border border-gray-800 transition-colors"
                            title="Open Source URL"
                          >
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </Link>
                        )}

                        <button
                          type="button"
                          onClick={() => handleOpenEdit(prod)}
                          className="p-1.5 rounded-lg bg-gray-900 hover:bg-gray-800 text-gray-300 hover:text-white border border-gray-800 transition-colors cursor-pointer"
                          title="Edit listing"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(prod)}
                          className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 transition-colors cursor-pointer"
                          title="Delete listing"
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

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#12151f] border border-gray-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-gray-800">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-purple-400" />
                Edit Listing ({editingProduct.collectionName})
              </h2>
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="text-gray-400 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
              <div>
                <label className="text-gray-400 font-semibold mb-1 block">Title</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-gray-900 border border-gray-800 text-white font-semibold focus:border-purple-500 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-400 font-semibold mb-1 block">Price (₹ INR)</label>
                  <input
                    type="number"
                    value={editForm.price}
                    onChange={(e) => setEditForm({ ...editForm, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-gray-900 border border-gray-800 text-white font-semibold focus:border-purple-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-gray-400 font-semibold mb-1 block">Category</label>
                  <input
                    type="text"
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-gray-900 border border-gray-800 text-white font-semibold focus:border-purple-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-gray-400 font-semibold mb-1 block">
                  AI Visibility Discovery Weight ({editForm.aiVisibility}%)
                </label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="5"
                  value={editForm.aiVisibility}
                  onChange={(e) => setEditForm({ ...editForm, aiVisibility: Number(e.target.value) })}
                  className="w-full accent-purple-500"
                />
              </div>

              <div className="flex items-center gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editForm.isActive}
                    onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                    className="rounded accent-purple-500"
                  />
                  <span className="font-semibold text-gray-300">Listing Active</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editForm.isFeatured}
                    onChange={(e) => setEditForm({ ...editForm, isFeatured: e.target.checked })}
                    className="rounded accent-amber-500"
                  />
                  <span className="font-semibold text-amber-400">Featured on Homepage</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-800">
                <Button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  variant="outline"
                  className="bg-gray-900 border-gray-800 text-gray-300 hover:text-white text-xs rounded-xl h-9"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl h-9 px-4 shadow-md shadow-purple-600/20"
                >
                  Save Listing
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
