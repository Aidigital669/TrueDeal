"use client";

import { useState, useEffect } from "react";
import { 
  Tags, Plus, Edit3, Trash2, CheckCircle2, 
  Loader2, RefreshCw, Sparkles, Building2, 
  Laptop, Store, Home, Tag, Layers
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  getAdminCategoriesList, 
  saveAdminCategoryAction, 
  deleteAdminCategoryAction 
} from "@/lib/admin-actions";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    icon: "Tag",
    tags: "",
    isFeatured: true
  });

  const loadCategories = async () => {
    setLoading(true);
    try {
      const res = await getAdminCategoriesList();
      if (res.success) {
        setCategories(res.categories);
      }
    } catch (err) {
      console.error("Error loading categories:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setFormData({
      name: "",
      slug: "",
      icon: "Tag",
      tags: "General, Listings, Premium",
      isFeatured: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: any) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      slug: cat.slug,
      icon: cat.icon || "Tag",
      tags: (cat.tags || []).join(", "),
      isFeatured: cat.isFeatured !== false
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const tagList = formData.tags
      .split(",")
      .map(t => t.trim())
      .filter(Boolean);

    const payload = {
      _id: editingCategory?._id,
      name: formData.name,
      slug: formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      icon: formData.icon,
      tags: tagList,
      isFeatured: formData.isFeatured
    };

    const res = await saveAdminCategoryAction(payload);
    if (res.success) {
      setActionNotice(`Category "${formData.name}" saved successfully.`);
      setTimeout(() => setActionNotice(null), 3000);
      setIsModalOpen(false);
      loadCategories();
    }
  };

  const handleDelete = async (cat: any) => {
    if (!confirm(`Delete category "${cat.name}"?`)) return;
    const res = await deleteAdminCategoryAction(cat._id);
    if (res.success) {
      setActionNotice(`Category "${cat.name}" deleted.`);
      setTimeout(() => setActionNotice(null), 3000);
      loadCategories();
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Tags className="w-6 h-6 text-pink-400" />
            Marketplace Categories & Taxonomy
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Organize catalog classifications, AI search keyword prompts, and homepage spotlight cards.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={loadCategories}
            variant="outline"
            className="bg-gray-900 border-gray-800 text-gray-300 hover:text-white text-xs font-bold rounded-xl h-10 px-3 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Refresh
          </Button>

          <Button
            onClick={handleOpenAdd}
            className="bg-gradient-to-r from-pink-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white text-xs font-black rounded-xl h-10 px-3.5 shadow-md shadow-pink-600/20 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Category
          </Button>
        </div>
      </div>

      {actionNotice && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold rounded-2xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Categories Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-2 text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin text-pink-500" />
          <span className="text-xs font-bold">Loading Marketplace Taxonomy...</span>
        </div>
      ) : categories.length === 0 ? (
        <div className="py-16 text-center text-gray-500 text-xs font-semibold bg-[#0f1118] border border-gray-800 rounded-3xl">
          No categories found. Click "Add Category" to create one.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div
              key={cat._id}
              className="bg-[#0f1118] border border-gray-800 hover:border-pink-500/40 rounded-3xl p-5 shadow-xl transition-all space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-pink-500/10 border border-pink-500/20 text-pink-400 flex items-center justify-center font-bold text-sm">
                      <Tags className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-sm">{cat.name}</h3>
                      <span className="text-[11px] font-mono text-gray-400">/{cat.slug}</span>
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    cat.isFeatured 
                      ? "bg-pink-500/20 text-pink-300 border border-pink-500/30" 
                      : "bg-gray-800 text-gray-400"
                  }`}>
                    {cat.isFeatured ? "Featured" : "Standard"}
                  </span>
                </div>

                {/* Tags */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">AI Search Keywords</span>
                  <div className="flex flex-wrap gap-1">
                    {(cat.tags || []).map((tag: string, i: number) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-gray-900 text-gray-300 border border-gray-800 font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-3 border-t border-gray-800/80 flex items-center justify-between">
                <span className="text-xs font-mono text-gray-500">{cat.count || "Active"}</span>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(cat)}
                    className="p-1.5 rounded-lg bg-gray-900 hover:bg-gray-800 text-gray-300 hover:text-white border border-gray-800 transition-colors"
                    title="Edit Category"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(cat)}
                    className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 transition-colors"
                    title="Delete Category"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#12151f] border border-gray-800 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-gray-800">
              <h2 className="text-base font-bold text-white">
                {editingCategory ? "Edit Category" : "Add New Category"}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              <div>
                <label className="text-gray-400 font-semibold mb-1 block">Category Name</label>
                <input
                  type="text"
                  placeholder="e.g. Healthcare & Medical"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-gray-900 border border-gray-800 text-white font-semibold focus:border-pink-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-gray-400 font-semibold mb-1 block">Slug</label>
                <input
                  type="text"
                  placeholder="e.g. healthcare-medical"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-gray-900 border border-gray-800 text-white font-mono focus:border-pink-500 outline-none"
                />
              </div>

              <div>
                <label className="text-gray-400 font-semibold mb-1 block">
                  AI Keyword Tags (Comma Separated)
                </label>
                <input
                  type="text"
                  placeholder="Doctors, Clinic, Medicines, Diagnostics"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-gray-900 border border-gray-800 text-white font-semibold focus:border-pink-500 outline-none"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="rounded accent-pink-500"
                  />
                  <span className="font-semibold text-gray-300">Feature on Customer Marketplace Homepage</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-800">
                <Button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  variant="outline"
                  className="bg-gray-900 border-gray-800 text-gray-300 hover:text-white text-xs rounded-xl h-9"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold rounded-xl h-9 px-4 shadow-md shadow-pink-600/20"
                >
                  Save Category
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
