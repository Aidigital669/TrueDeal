"use client";

import { useState, useEffect } from "react";
import { Search, Sparkles, Globe, Store, Pencil, Trash2, Plus, ArrowDownToLine, Loader2, Inbox, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getProducts, deleteProduct, clearAllProductsAction } from "./actions";

export default function CatalogPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isClearingAll, setIsClearingAll] = useState(false);

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const res = await getProducts({
        search,
        filter,
        page,
        limit: 50,
      });
      if (res.success && res.products) {
        setProducts(res.products);
        setTotalPages(res.totalPages || 1);
        setTotalCount(res.total || 0);
      } else {
        setProducts([]);
        setTotalPages(1);
        setTotalCount(0);
      }
    } catch (err) {
      console.error("Failed to load products", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearAll = async () => {
    if (!confirm("Are you sure you want to remove ALL products from your database? This cannot be undone.")) return;
    setIsClearingAll(true);
    try {
      const res = await clearAllProductsAction();
      if (res.success) {
        setProducts([]);
        setTotalCount(0);
        setTotalPages(1);
        alert("All products have been removed successfully.");
      } else {
        alert("Failed to clear products: " + res.error);
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setIsClearingAll(false);
    }
  };

  // Debounced load on search, filter, or page change
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      loadProducts();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [search, filter, page]);

  // Reset page when filter or search changes
  useEffect(() => {
    setPage(1);
  }, [filter, search]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    setIsDeleting(id);
    try {
      const res = await deleteProduct(id);
      if (res.success) {
        // Refresh products list
        loadProducts();
      } else {
        alert("Failed to delete product: " + res.error);
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while deleting the product.");
    } finally {
      setIsDeleting(null);
    }
  };

  const getStartItem = () => (page - 1) * 50 + 1;
  const getEndItem = () => Math.min(page * 50, totalCount);

  return (
    <div className="flex flex-col gap-6 w-full font-sans pb-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mt-2">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Products
          </h1>
          <p className="text-gray-500 font-medium mt-1.5 text-[15px]">
            Manage products that customers can discover through AI search.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {totalCount > 0 && (
            <button 
              onClick={handleClearAll}
              disabled={isClearingAll}
              className="bg-white hover:bg-rose-50/80 text-rose-600 hover:text-rose-700 font-bold border border-rose-200 hover:border-rose-300 rounded-xl px-3.5 h-10 text-xs shadow-xs transition-all active:scale-95 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isClearingAll ? <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-600" /> : <Trash2 className="w-3.5 h-3.5 text-rose-500" />}
              <span>Clear All</span>
            </button>
          )}
          <Link href="/connect">
            <button className="bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-900 font-bold border border-gray-200 hover:border-gray-300 rounded-xl px-4 h-10 text-xs shadow-xs transition-all active:scale-95 flex items-center gap-2 cursor-pointer">
              <ArrowDownToLine className="w-3.5 h-3.5 text-indigo-600" />
              <span>Import via AI Scraper</span>
            </button>
          </Link>
          <Link href="/dashboard/catalog/add">
            <button className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-xl px-4 h-10 text-xs font-bold shadow-md shadow-indigo-600/20 transition-all active:scale-95 flex items-center gap-2 cursor-pointer">
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
            </button>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-gray-200 p-2 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4 mt-2">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto px-1 scrollbar-hide">
          <FilterTab label="All" active={filter === "All"} onClick={() => setFilter("All")} />
          <FilterTab label="Active" active={filter === "Active"} onClick={() => setFilter("Active")} />
          <FilterTab label="Draft" active={filter === "Draft"} onClick={() => setFilter("Draft")} />
          <FilterTab label="Out of Stock" active={filter === "Out of Stock"} onClick={() => setFilter("Out of Stock")} />
          <FilterTab label="Needs Attention" active={filter === "Needs Attention"} onClick={() => setFilter("Needs Attention")} hasIndicator />
        </div>
        <div className="relative w-full md:w-72 flex-shrink-0 pr-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search products..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50/80 hover:bg-gray-100/80 focus:bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-xs"
          />
        </div>
      </div>

      {/* Table Headers (Desktop only) */}
      <div className="hidden lg:grid grid-cols-12 gap-4 px-6 mt-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
        <div className="col-span-3">PRODUCT</div>
        <div className="col-span-2">CATEGORY</div>
        <div className="col-span-2">PRICE</div>
        <div className="col-span-1">STATUS</div>
        <div className="col-span-2">AI VISIBILITY</div>
        <div className="col-span-1">UPDATED</div>
        <div className="col-span-1 text-right">ACTIONS</div>
      </div>

      {/* Product List */}
      <div className="flex flex-col gap-3 min-h-[250px]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-gray-200 shadow-sm gap-3">
            <Loader2 className="w-8 h-8 text-[#4133D1] animate-spin" />
            <span className="text-sm font-semibold text-gray-500">Loading products...</span>
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-gray-200 shadow-sm gap-4 text-center px-4">
            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-gray-400">
              <Inbox className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">No products found</h3>
              <p className="text-sm text-gray-500 max-w-sm mt-1">
                {search ? "No products match your search query. Try typing something else." : "Add products to make them discoverable by AI search."}
              </p>
            </div>
            {!search && (
              <Link href="/dashboard/catalog/add">
                <Button className="bg-[#4133D1] hover:bg-[#3427ad] text-white rounded-lg px-4 font-bold shadow-sm">
                  Add Your First Product
                </Button>
              </Link>
            )}
          </div>
        ) : (
          products.map((product) => (
            <ProductRow 
              key={product.id}
              id={product.id}
              name={product.name}
              image={product.image}
              badgeType={product.badgeType}
              category={product.category}
              price={product.price}
              stock={product.stock}
              status={product.status}
              aiVisibility={product.aiVisibility}
              aiSubtext={product.aiSubtext}
              updated={product.updated}
              attention={product.attention}
              sparkles={product.sparkles}
              isDeleting={isDeleting === product.id}
              onDelete={() => handleDelete(product.id)}
            />
          ))
        )}
      </div>

      {/* Pagination */}
      {products.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-xl border border-gray-200 p-4 shadow-sm mt-4">
          <span className="text-sm font-medium text-gray-500">
            Showing {getStartItem()} to {getEndItem()} of {totalCount} products
          </span>
          <div className="flex items-center gap-1">
            <Button 
              variant="outline" 
              disabled={page === 1}
              onClick={() => setPage(p => Math.max(p - 1, 1))}
              className="text-gray-500 border-gray-200 bg-white hover:bg-gray-50 h-9 px-3 text-sm font-medium rounded-md disabled:opacity-50"
            >
              Previous
            </Button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pNum) => (
              <Button 
                key={pNum}
                onClick={() => setPage(pNum)}
                className={`h-9 w-9 p-0 text-sm font-bold rounded-md shadow-sm ${
                  page === pNum 
                    ? "bg-[#4133D1] hover:bg-[#3427ad] text-white" 
                    : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                {pNum}
              </Button>
            ))}

            <Button 
              variant="outline" 
              disabled={page === totalPages}
              onClick={() => setPage(p => Math.min(p + 1, totalPages))}
              className="text-gray-700 border-gray-200 bg-white hover:bg-gray-50 h-9 px-3 text-sm font-medium rounded-md disabled:opacity-50"
            >
              Next
            </Button>
          </div>
        </div>
      )}

    </div>
  );
}

// Sub-components

function FilterTab({ label, active, hasIndicator, onClick }: { label: string, active?: boolean, hasIndicator?: boolean, onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
        active 
          ? 'bg-indigo-600 text-white shadow-xs' 
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/70'
      }`}
    >
      {label}
      {hasIndicator && <div className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-amber-300' : 'bg-red-500'} animate-pulse`}></div>}
    </button>
  );
}

interface ProductRowProps {
  id: string;
  name: string;
  image: string;
  badgeType: 'website' | 'marketplace';
  category: string;
  price: string;
  stock: string;
  status: 'Active' | 'Out of Stock' | 'Draft';
  aiVisibility: number;
  aiSubtext?: string;
  updated: string;
  attention?: boolean;
  sparkles?: boolean;
  isDeleting?: boolean;
  onDelete: () => void;
}

function ProductRow({ id, name, image, badgeType, category, price, stock, status, aiVisibility, aiSubtext, updated, attention, sparkles, isDeleting, onDelete }: ProductRowProps) {
  
  // Status Styling
  const isOutOfStock = status === 'Out of Stock';
  const statusClasses = {
    'Active': 'bg-green-50 text-green-700 border-green-200',
    'Out of Stock': 'bg-red-50 text-red-700 border-red-200',
    'Draft': 'bg-gray-100 text-gray-700 border-gray-200',
  }[status];

  const stockColor = isOutOfStock ? 'text-red-600' : 'text-gray-900';

  // AI Visibility Styling
  const isHighVisibility = aiVisibility >= 80;
  const barColor = isHighVisibility ? 'bg-[#5235E8]' : 'bg-gray-300';
  const subtextColor = isHighVisibility ? 'text-[#5235E8]' : 'text-red-500';

  return (
    <div className={`relative bg-white rounded-xl border p-4 shadow-sm transition-all hover:shadow-md flex flex-col lg:grid lg:grid-cols-12 gap-4 items-center ${
      attention ? 'border-l-[4px] border-l-red-500 border-gray-200' : 'border-gray-200 border-l-[4px] border-l-transparent'
    } ${isDeleting ? "opacity-50 pointer-events-none" : ""}`}>
      
      {/* 1. PRODUCT (col-span-3) */}
      <div className="col-span-3 flex items-center gap-4 w-full">
        <div className="w-14 h-14 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden flex-shrink-0 flex items-center justify-center p-1.5">
          {image ? (
            <img src={image} alt={name} className="w-full h-full object-contain mix-blend-multiply" />
          ) : (
            <Package className="w-6 h-6 text-gray-400" />
          )}
        </div>
        <div className="flex flex-col gap-1.5 overflow-hidden">
          <div className="flex items-center gap-1.5">
            <h3 className="font-extrabold text-[15px] text-gray-900 truncate">{name}</h3>
            {sparkles && <Sparkles className="w-3.5 h-3.5 text-purple-500 flex-shrink-0" />}
          </div>
          {badgeType === 'website' ? (
            <div className="inline-flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-md px-1.5 py-0.5 max-w-fit">
              <Globe className="w-3 h-3 text-blue-500" />
              <span className="text-[10px] font-semibold text-gray-600 whitespace-nowrap">Website Connected</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-md px-1.5 py-0.5 max-w-fit">
              <Store className="w-3 h-3 text-gray-500" />
              <span className="text-[10px] font-semibold text-gray-600 whitespace-nowrap">Marketplace Listing</span>
            </div>
          )}
        </div>
      </div>

      {/* 2. CATEGORY (col-span-2) */}
      <div className="col-span-2 w-full lg:w-auto overflow-hidden">
        <span className="lg:hidden text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Category</span>
        <span className="text-xs font-semibold text-gray-700 truncate block">{category}</span>
      </div>

      {/* 3. PRICE (col-span-2) */}
      <div className="col-span-2 w-full lg:w-auto overflow-hidden">
        <span className="lg:hidden text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Price</span>
        <span className="text-[14px] font-black text-gray-900 truncate block tracking-tight">{price}</span>
      </div>

      {/* 4. INVENTORY & STATUS (col-span-1) */}
      <div className="col-span-1 flex flex-col gap-1 w-full lg:w-auto">
        <span className="lg:hidden text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Status</span>
        <span className={`text-[11px] font-bold ${stockColor}`}>{stock}</span>
        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-black border max-w-fit ${statusClasses}`}>
          {status}
        </span>
      </div>

      {/* 5. AI VISIBILITY (col-span-2) */}
      <div className="col-span-2 flex flex-col gap-1 w-full lg:w-auto">
        <span className="lg:hidden text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">AI Visibility</span>
        <div className="flex items-center gap-1.5">
          <span className={`text-sm font-black ${isHighVisibility ? 'text-[#5235E8]' : 'text-gray-600'} leading-none`}>{aiVisibility}%</span>
          {isHighVisibility && <Sparkles className="w-3 h-3 text-[#5235E8]" />}
        </div>
        <div className="w-full max-w-[80px] h-1 bg-gray-100 rounded-full overflow-hidden mt-0.5">
          <div className={`h-full ${barColor} rounded-full`} style={{ width: `${aiVisibility}%` }}></div>
        </div>
        {aiSubtext && (
          <span className={`text-[10px] font-bold mt-0.5 truncate max-w-[110px] block ${subtextColor}`}>{aiSubtext}</span>
        )}
      </div>

      {/* 6. UPDATED (col-span-1) */}
      <div className="col-span-1 w-full lg:w-auto">
        <span className="lg:hidden text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Updated</span>
        <span className="text-xs font-semibold text-gray-500 whitespace-nowrap">{updated}</span>
      </div>

      {/* 7. ACTIONS (col-span-1) */}
      <div className="col-span-1 flex items-center justify-start lg:justify-end gap-1.5 w-full lg:w-auto mt-2 lg:mt-0">
        <Link href={`/dashboard/catalog/add?id=${id}`}>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
            <Pencil className="w-3.5 h-3.5" />
          </Button>
        </Link>
        <Button 
          variant="ghost" 
          size="icon" 
          disabled={isDeleting}
          onClick={onDelete}
          className="h-8 w-8 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
        >
          {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin text-red-600" /> : <Trash2 className="w-3.5 h-3.5" />}
        </Button>
      </div>

    </div>
  );
}
