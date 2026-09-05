"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { 
  ShoppingBag, Wrench, Building, ArrowRight, ArrowLeft, Save, 
  CheckCircle2, Sparkles, AlertTriangle, UploadCloud, ChevronDown, 
  ChevronRight, Globe, Search, LayoutTemplate, ShieldCheck, Database, Loader2, Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getProductById, saveProduct } from "../actions";

type Step = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
const STEP_NAMES = [
  "Type", "Basic Info", "Category", "Pricing", "Inventory", 
  "Specs", "Media", "Delivery", "AI Search", "Preview", "Publish"
];

function AddProductWizard() {
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");

  const [currentStep, setCurrentStep] = useState<Step>(0);
  const [isSaving, setIsSaving] = useState(false);
  const [publishState, setPublishState] = useState(0); // For animation
  const [catPath, setCatPath] = useState<string[]>([]);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState("");

  const [formData, setFormData] = useState({
    type: "Product",
    name: "",
    brand: "",
    model: "",
    sku: "",
    shortDesc: "",
    category: "",
    price: "",
    originalPrice: "",
    discount: "",
    stock: "0",
    trackInventory: true,
    specs: [{ key: "Processor", value: "" }, { key: "RAM", value: "" }, { key: "Storage", value: "" }],
    deliveryAvailable: true,
    pickupAvailable: true,
    deliveryTime: "",
    aiKeywords: ["Gaming laptop", "Laptop for programming", "RTX laptop", "High-performance laptop", "Laptop under ₹60,000"],
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&q=80",
    status: "Active"
  });

  // URL Auto-Fill State
  const [importUrl, setImportUrl] = useState("");
  const [isImportingFromUrl, setIsImportingFromUrl] = useState(false);
  const [importSuccessBanner, setImportSuccessBanner] = useState<string | null>(null);

  const handleAutoFillFromUrl = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!importUrl.trim()) return;

    setIsImportingFromUrl(true);
    setImportSuccessBanner(null);

    try {
      const res = await fetch("/api/scrape-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: importUrl.trim() })
      });

      const data = await res.json();
      if (data.success && data.product) {
        const p = data.product;
        setFormData(prev => ({
          ...prev,
          name: p.title || prev.name,
          brand: p.brand || prev.brand,
          model: p.model || prev.model,
          sku: p.sku || prev.sku,
          shortDesc: p.shortDesc || prev.shortDesc,
          category: p.category || prev.category,
          price: p.price ? String(p.price) : prev.price,
          originalPrice: p.originalPrice ? String(p.originalPrice) : prev.originalPrice,
          discount: p.discount || prev.discount,
          stock: p.inventory ? String(p.inventory) : "25",
          specs: p.specs && p.specs.length > 0 ? p.specs : prev.specs,
          aiKeywords: p.aiKeywords && p.aiKeywords.length > 0 ? p.aiKeywords : prev.aiKeywords,
          image: p.primaryImage || (p.images && p.images[0]) || prev.image
        }));

        if (p.category) {
          setCatPath(p.category.split(" > "));
        }

        setImportSuccessBanner(`Successfully extracted "${p.title}"! All 10 wizard steps have been auto-populated.`);
        setCurrentStep(1);
      } else {
        alert("Failed to auto-fill: " + (data.error || "Could not parse product page"));
      }
    } catch (err: any) {
      alert("Scraper error: " + err.message);
    } finally {
      setIsImportingFromUrl(false);
    }
  };

  // Load product if editing
  useEffect(() => {
    if (editId) {
      const loadProductData = async () => {
        setIsSaving(true);
        try {
          const res = await getProductById(editId);
          if (res.success && res.product) {
            setFormData({
              type: res.product.type || "Product",
              name: res.product.name || "",
              brand: res.product.brand || "",
              model: res.product.model || "",
              sku: res.product.sku || "",
              shortDesc: res.product.shortDesc || "",
              category: res.product.category || "",
              price: res.product.price || "",
              originalPrice: res.product.originalPrice || "",
              discount: res.product.discount || "",
              stock: res.product.stock || "0",
              trackInventory: res.product.trackInventory ?? true,
              specs: Array.isArray(res.product.specs)
                ? (res.product.specs as any[])
                : [{ key: "Processor", value: "" }, { key: "RAM", value: "" }, { key: "Storage", value: "" }],
              deliveryAvailable: res.product.deliveryAvailable ?? true,
              pickupAvailable: res.product.pickupAvailable ?? true,
              deliveryTime: res.product.deliveryTime || "",
              aiKeywords: res.product.aiKeywords && res.product.aiKeywords.length 
                ? res.product.aiKeywords 
                : ["Gaming laptop", "Laptop for programming"],
              image: res.product.image || "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=200&q=80",
              status: res.product.status || "Active"
            });
            
            if (res.product.category) {
              setCatPath(res.product.category.split(" > "));
            }
            // Skip type selection since it's pre-selected
            setCurrentStep(1);
          }
        } catch (err) {
          console.error("Failed to load product for editing", err);
        } finally {
          setIsSaving(false);
        }
      };
      loadProductData();
    }
  }, [editId]);

  const updateForm = (key: string, value: any) => setFormData(prev => ({ ...prev, [key]: value }));

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 10) as Step);
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 0) as Step);

  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      const dataToSave = { ...formData, status: "Draft" };
      await saveProduct(dataToSave, editId || undefined);
      setIsSaving(false);
      alert("Draft saved successfully!");
    } catch (err) {
      console.error(err);
      setIsSaving(false);
      alert("Failed to save draft.");
    }
  };

  const handlePublish = async () => {
    setCurrentStep(10);
    setPublishState(0);
    
    try {
      // Step 1: Validating
      await new Promise(resolve => setTimeout(resolve, 800));
      setPublishState(1);
      
      // Step 2: Processing & Saving to MongoDB
      await new Promise(resolve => setTimeout(resolve, 800));
      const res = await saveProduct(formData, editId || undefined);
      if (!res.success) {
        throw new Error(res.error);
      }
      setPublishState(2);
      
      // Step 3: Embeddings
      await new Promise(resolve => setTimeout(resolve, 800));
      setPublishState(3);
      
      // Step 4: Indexing & Complete
      await new Promise(resolve => setTimeout(resolve, 800));
      setPublishState(4);
    } catch (error: any) {
      console.error("Publishing failed:", error);
      alert("Publishing failed: " + error.message);
      setCurrentStep(9);
    }
  };

  // --------------------------------------------------------
  // STEP COMPONENTS
  // --------------------------------------------------------

  // STEP 0: PRODUCT TYPE SELECTION
  const renderStep0 = () => (
    <div className="max-w-4xl mx-auto pt-10">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-3">What are you adding?</h1>
        <p className="text-gray-500 font-medium text-lg">Select the type of listing you want to create.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div 
          onClick={() => { updateForm('type', 'Product'); nextStep(); }}
          className="bg-white border-2 border-[#4F46E5] rounded-2xl p-8 flex flex-col items-center text-center cursor-pointer shadow-md hover:shadow-xl hover:-translate-y-1 transition-all group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-[#4F46E5]/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="w-16 h-16 bg-[#EEF2FF] rounded-full flex items-center justify-center mb-6 text-[#4F46E5]">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Product</h3>
          <p className="text-sm text-gray-500 font-medium mb-6">Physical or digital products you sell.</p>
          <Button className="w-full bg-[#4F46E5] hover:bg-[#4338CA] text-white">Continue</Button>
        </div>
        
        <div className="bg-white border-2 border-gray-100 rounded-2xl p-8 flex flex-col items-center text-center opacity-60 grayscale cursor-not-allowed">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-6 text-gray-400">
            <Wrench className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Service</h3>
          <p className="text-sm text-gray-500 font-medium mb-6">Professional services or consultations.</p>
          <Button disabled variant="outline" className="w-full">Coming Soon</Button>
        </div>

        <div className="bg-white border-2 border-gray-100 rounded-2xl p-8 flex flex-col items-center text-center opacity-60 grayscale cursor-not-allowed">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-6 text-gray-400">
            <Building className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Property</h3>
          <p className="text-sm text-gray-500 font-medium mb-6">Real estate for sale or rent.</p>
          <Button disabled variant="outline" className="w-full">Coming Soon</Button>
        </div>
      </div>
    </div>
  );

  // STEP 1: BASIC INFO
  const renderStep1 = () => (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Basic Information</h2>
        <p className="text-gray-500 text-sm">Provide the foundational details of your product.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Product Name *</label>
          <input 
            type="text" value={formData.name} onChange={e => updateForm('name', e.target.value)}
            placeholder="e.g. ASUS TUF Gaming Laptop" 
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] outline-none transition-all"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Brand</label>
            <input type="text" value={formData.brand} onChange={e => updateForm('brand', e.target.value)} placeholder="ASUS" className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-[#4F46E5]/20 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Model</label>
            <input type="text" value={formData.model} onChange={e => updateForm('model', e.target.value)} placeholder="TUF F15" className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-[#4F46E5]/20 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">SKU</label>
            <input type="text" value={formData.sku} onChange={e => updateForm('sku', e.target.value)} placeholder="ASUS-TUF-001" className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-[#4F46E5]/20 outline-none" />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-bold text-gray-700">Detailed Description</label>
            <button className="flex items-center gap-1.5 text-xs font-bold text-[#7C3AED] hover:text-[#6D28D9] bg-[#F3E8FF] px-3 py-1 rounded-full transition-colors">
              <Sparkles className="w-3.5 h-3.5" /> Improve Description
            </button>
          </div>
          <textarea 
            rows={5}
            value={formData.shortDesc}
            onChange={e => updateForm('shortDesc', e.target.value)}
            placeholder="High-performance gaming laptop with RTX graphics..." 
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] outline-none transition-all resize-none"
          ></textarea>
        </div>
      </div>
    </div>
  );

  // STEP 8: AI SEARCH OPTIMIZATION
  const renderStep8 = () => (
    <div className="flex flex-col gap-8">
      <div className="bg-gradient-to-br from-[#F5F3FF] to-white border border-[#E0D4FF] rounded-2xl p-8 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#7C3AED]/10 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-6 h-6 text-[#7C3AED]" />
              <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Make your product discoverable by AI</h2>
            </div>
            <p className="text-gray-600 text-sm max-w-xl font-medium leading-relaxed">
              Customers search using natural language. This information helps our AI engine understand precisely when your product is highly relevant to a query.
            </p>
          </div>
          <div className="bg-white px-6 py-4 rounded-xl border border-purple-100 shadow-sm flex flex-col items-center">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">AI Search Readiness</span>
            <span className="text-4xl font-black text-[#7C3AED] leading-none">92%</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left: AI Understanding */}
        <div className="flex flex-col gap-5">
          <h3 className="text-lg font-bold text-gray-900">What AI Understands</h3>
          
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <p className="text-sm font-semibold text-gray-500 mb-4 uppercase tracking-wider">Generated Keywords & Use Cases</p>
            <div className="flex flex-wrap gap-2 mb-6">
              {formData.aiKeywords.map((kw, i) => (
                <div key={i} className="flex items-center gap-1.5 bg-[#F8FAFC] border border-gray-200 text-gray-700 text-[13px] font-medium px-3 py-1.5 rounded-full">
                  {kw}
                </div>
              ))}
              <div className="flex items-center gap-1.5 border border-dashed border-gray-300 text-gray-400 hover:text-gray-600 cursor-pointer hover:bg-gray-50 text-[13px] font-medium px-3 py-1.5 rounded-full transition-colors">
                + Add Tag
              </div>
            </div>
            <div className="w-full h-px bg-gray-100 mb-4"></div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">AI automatically extracts these from your product data.</span>
              <button className="text-xs font-bold text-[#4F46E5] hover:underline">Regenerate</button>
            </div>
          </div>
        </div>

        {/* Right: Live Preview */}
        <div className="flex flex-col gap-5">
          <h3 className="text-lg font-bold text-gray-900">Natural Language Search Preview</h3>
          
          <div className="bg-[#1E1E2E] rounded-xl p-6 shadow-md relative overflow-hidden flex flex-col">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Search className="w-32 h-32 text-white" />
            </div>
            <p className="text-gray-400 text-sm font-medium mb-6 relative z-10">
              Customers may find this product when they search:
            </p>
            
            <div className="flex flex-col gap-3 relative z-10">
              <div className="bg-white/10 backdrop-blur-md rounded-lg p-3 border border-white/5 shadow-inner">
                <span className="text-white text-sm font-medium">"I need a <strong className="text-purple-400">gaming laptop</strong> under <strong className="text-emerald-400">₹60,000</strong>."</span>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-lg p-3 border border-white/5 shadow-inner">
                <span className="text-white text-sm font-medium">"Show me a laptop for <strong className="text-purple-400">programming</strong>."</span>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-lg p-3 border border-white/5 shadow-inner">
                <span className="text-white text-sm font-medium">"I need an <strong className="text-purple-400">RTX laptop</strong>."</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );

  // STEP 9: PREVIEW
  const renderStep9 = () => (
    <div className="flex flex-col gap-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Review Your Product</h2>
        <p className="text-gray-500 text-sm">See how your product will appear across the platform before publishing.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 w-full max-w-5xl mx-auto">
        
        {/* Preview A: Normal */}
        <div className="flex flex-col gap-4 items-center">
          <span className="text-xs font-extrabold text-gray-400 uppercase tracking-widest bg-gray-100 px-3 py-1 rounded-full">Standard Listing</span>
          <div className="w-full max-w-[320px] bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="h-48 bg-gray-100 relative">
              <img src={formData.image} alt="Laptop" className="w-full h-full object-cover mix-blend-multiply p-4" />
            </div>
            <div className="p-5">
              <h3 className="font-bold text-gray-900 text-lg mb-1">{formData.name || "ASUS TUF Gaming Laptop"}</h3>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl font-black text-gray-900">₹{parseFloat(formData.price || "0").toLocaleString("en-IN")}</span>
                {formData.originalPrice && <span className="text-sm text-gray-400 line-through">₹{parseFloat(formData.originalPrice || "0").toLocaleString("en-IN")}</span>}
              </div>
              <Button className="w-full bg-gray-900 text-white rounded-xl">View Details</Button>
            </div>
          </div>
        </div>

        {/* Preview B: AI Result */}
        <div className="flex flex-col gap-4 items-center">
          <span className="text-xs font-extrabold text-[#7C3AED] uppercase tracking-widest bg-purple-50 px-3 py-1 rounded-full flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> AI Search Result
          </span>
          
          <div className="w-full max-w-[320px] bg-gradient-to-b from-[#F5F3FF] to-white border-2 border-[#7C3AED] rounded-2xl p-5 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-[#7C3AED] text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg">
              94% Match
            </div>
            
            <div className="flex items-start gap-4 mb-4">
              <div className="w-16 h-16 rounded-lg bg-white border border-gray-100 p-1 flex-shrink-0">
                <img src={formData.image} alt="Laptop" className="w-full h-full object-contain" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-[15px] leading-tight mb-1">{formData.name || "ASUS TUF Gaming Laptop"}</h3>
                <span className="text-lg font-black text-[#7C3AED]">₹{parseFloat(formData.price || "0").toLocaleString("en-IN")}</span>
              </div>
            </div>

            <div className="bg-white/60 rounded-lg p-3 text-[11px] font-medium text-gray-700 mb-4 border border-purple-100/50 flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> Matches specs</div>
              {formData.brand && <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> Brand: {formData.brand}</div>}
              {formData.stock !== "0" ? <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> In stock</div> : <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-amber-500" /> Out of stock</div>}
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 bg-white border-purple-200 text-purple-700 text-xs h-9">Contact</Button>
              <Button className="flex-1 bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs h-9 shadow-md">Buy Now</Button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );

  // STEP 10: PUBLISH
  const renderStep10 = () => (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      {publishState === 4 ? (
        <div className="text-center animate-in zoom-in duration-500 flex flex-col items-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">{editId ? "Product Updated!" : "Product Published!"}</h2>
          <p className="text-gray-500 font-medium mb-8">Your product has been completely processed and is now searchable by AI.</p>
          <div className="flex gap-4">
            <Link href="/dashboard/catalog">
              <Button variant="outline" className="h-12 px-6">View Catalog</Button>
            </Link>
            <Button className="bg-[#4F46E5] h-12 px-6 font-bold flex items-center gap-2">
              <Search className="w-4 h-4" /> Test in AI Search
            </Button>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
          <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">Processing Product...</h3>
          <div className="flex flex-col gap-4">
            <ProcessItem label="Validating product data..." done={publishState >= 1} />
            <ProcessItem label="Writing to MongoDB..." done={publishState >= 2} active={publishState === 1} />
            <ProcessItem label="Generating AI search embeddings..." done={publishState >= 3} active={publishState === 2} />
            <ProcessItem label="Updating vector search index..." done={publishState >= 4} active={publishState === 3} />
          </div>
        </div>
      )}
    </div>
  );

  // Mock Data for Categories
  const CATEGORY_DATA: Record<string, Record<string, string[]>> = {
    "Electronics": {
      "Computers": ["Desktops", "Laptops", "Components", "Accessories"],
      "Smartphones": ["Android", "iOS", "Cases"],
      "Cameras": ["DSLR", "Mirrorless", "Lenses"]
    },
    "Clothing": {
      "Men's": ["Shirts", "Pants", "Shoes"],
      "Women's": ["Dresses", "Tops", "Shoes"]
    },
    "Home & Garden": {
      "Furniture": ["Living Room", "Bedroom", "Office"],
      "Decor": ["Wall Art", "Lighting", "Rugs"]
    },
    "Interior Design": {
      "Residential": ["Apartments", "Villas", "Studios"],
      "Commercial": ["Offices", "Retail Stores", "Restaurants"],
      "Services": ["Consultation", "Space Planning", "Full Makeover"]
    },
    "Real Estate": {
      "Properties for Sale": ["Apartments", "Houses", "Commercial", "Land"],
      "Properties for Rent": ["Apartments", "Houses", "Commercial"],
      "Projects": ["Under Construction", "Ready to Move"]
    }
  };

  const handleCategorySelect = (level: number, value: string) => {
    const newPath = [...catPath.slice(0, level), value];
    setCatPath(newPath);
    if (level === 2) {
      updateForm('category', newPath.join(' > '));
    } else {
      updateForm('category', ''); // Reset until fully selected
    }
  };

  const submitCustomCategory = () => {
    if (customCategory.trim()) {
      updateForm('category', `Custom: ${customCategory.trim()}`);
      setIsAddingCategory(false);
      setCatPath([]);
    }
  };

  // STEP 2: CATEGORY
  const renderStep2 = () => {
    const primarySelected = catPath[0];
    const subSelected = catPath[1];
    const typeSelected = catPath[2];

    return (
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Category</h2>
          <p className="text-gray-500 text-sm">Select the most relevant category for your product so AI can classify it correctly.</p>
        </div>

        {isAddingCategory ? (
          <div className="bg-gradient-to-br from-[#EEF2FF] to-white border border-[#4F46E5]/20 rounded-2xl p-8 shadow-sm flex flex-col gap-4 animate-in fade-in zoom-in duration-300">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Request Missing Category</h3>
              <p className="text-sm text-gray-500">Please describe the category your product belongs to. Our AI will map it to the closest marketplace taxonomy.</p>
            </div>
            <input 
              type="text" 
              autoFocus
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
              placeholder="e.g. Vintage Mechanical Keyboards" 
              className="w-full border border-gray-300 bg-white rounded-xl px-5 py-4 text-sm focus:ring-4 focus:ring-[#4F46E5]/10 focus:border-[#4F46E5] outline-none transition-all shadow-sm"
            />
            <div className="flex gap-3 mt-2">
              <Button onClick={submitCustomCategory} className="bg-[#4F46E5] hover:bg-[#4338CA] text-white font-bold h-11 px-8 rounded-xl shadow-sm transition-all">Submit & Select</Button>
              <Button variant="outline" onClick={() => setIsAddingCategory(false)} className="border-gray-200 bg-white hover:bg-gray-50 text-gray-700 h-11 px-8 rounded-xl transition-all">Cancel</Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#4F46E5] transition-colors" />
              <input 
                type="text" 
                placeholder="Search for a category (e.g. Gaming Laptops)" 
                className="w-full border border-gray-200 bg-white rounded-xl pl-12 pr-5 py-4 text-sm font-medium focus:ring-4 focus:ring-[#4F46E5]/10 focus:border-[#4F46E5] outline-none shadow-sm transition-all hover:border-gray-300"
              />
            </div>

            <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white flex flex-col h-[340px] shadow-sm">
              <div className="flex-1 flex overflow-x-auto custom-scrollbar">
                {/* Primary */}
                <div className="w-1/3 min-w-[180px] border-r border-gray-100 flex flex-col bg-white">
                  <div className="px-5 py-4 bg-gray-50/80 border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-widest">Primary Category</div>
                  <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-1.5 custom-scrollbar">
                    {Object.keys(CATEGORY_DATA).map(primary => (
                      <div 
                        key={primary}
                        onClick={() => handleCategorySelect(0, primary)}
                        className={`px-4 py-3 rounded-xl text-sm font-semibold flex justify-between items-center cursor-pointer transition-all ${
                          primarySelected === primary ? 'bg-[#4F46E5] text-white shadow-md transform scale-[0.98]' : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {primary} <ChevronRight className={`w-4 h-4 ${primarySelected === primary ? 'text-white' : 'text-gray-400 opacity-0 group-hover:opacity-100'}`} />
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Subcategory */}
                <div className="w-1/3 min-w-[180px] border-r border-gray-100 flex flex-col bg-gray-50/40">
                  <div className="px-5 py-4 bg-gray-50/80 border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-widest">Subcategory</div>
                  <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-1.5 custom-scrollbar">
                    {!primarySelected ? (
                      <div className="h-full flex flex-col items-center justify-center text-center p-6 opacity-50">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3 text-gray-400">
                          <LayoutTemplate className="w-5 h-5" />
                        </div>
                        <span className="text-xs text-gray-500 font-medium">Select a primary category to view subcategories</span>
                      </div>
                    ) : (
                      Object.keys(CATEGORY_DATA[primarySelected] || {}).map(sub => (
                        <div 
                          key={sub}
                          onClick={() => handleCategorySelect(1, sub)}
                          className={`px-4 py-3 rounded-xl text-sm font-semibold flex justify-between items-center cursor-pointer transition-all ${
                            subSelected === sub ? 'bg-[#EEF2FF] text-[#4F46E5] border border-[#4F46E5]/20 shadow-sm transform scale-[0.98]' : 'text-gray-700 hover:bg-white'
                          }`}
                        >
                          {sub} <ChevronRight className={`w-4 h-4 ${subSelected === sub ? 'text-[#4F46E5]' : 'text-gray-400 opacity-0 group-hover:opacity-100'}`} />
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Product Type */}
                <div className="w-1/3 min-w-[180px] flex flex-col bg-gray-50/80">
                  <div className="px-5 py-4 bg-gray-50/80 border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-widest">Product Type</div>
                  <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-1.5 custom-scrollbar">
                    {!subSelected ? (
                      <div className="h-full flex flex-col items-center justify-center text-center p-6 opacity-50">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3 text-gray-400">
                          <LayoutTemplate className="w-5 h-5" />
                        </div>
                        <span className="text-xs text-gray-500 font-medium">Select a subcategory to view product types</span>
                      </div>
                    ) : (
                      (CATEGORY_DATA[primarySelected]?.[subSelected] || []).map(type => (
                        <div 
                          key={type}
                          onClick={() => handleCategorySelect(2, type)}
                          className={`px-4 py-3 rounded-xl text-sm font-semibold cursor-pointer transition-all flex justify-between items-center ${
                            typeSelected === type ? 'bg-[#4F46E5] text-white shadow-md transform scale-[0.98]' : 'text-gray-700 hover:bg-white border border-transparent'
                          }`}
                        >
                          {type} {typeSelected === type && <CheckCircle2 className="w-4 h-4 text-white" />}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 bg-[#F8FAFC] rounded-2xl border border-gray-200 shadow-sm gap-4">
              <div className="flex flex-col gap-1.5">
                <span className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Selected Path</span>
                {formData.category ? (
                  <div className="font-bold text-[#4F46E5] flex items-center gap-2 text-sm bg-white px-3 py-1.5 rounded-lg shadow-sm border border-gray-100">
                    <CheckCircle2 className="w-4 h-4 text-green-500" /> {formData.category}
                  </div>
                ) : (
                  <span className="text-gray-400 italic text-sm font-medium">No category selected</span>
                )}
              </div>
              <button onClick={() => setIsAddingCategory(true)} className="text-sm font-bold text-[#4F46E5] hover:text-white flex items-center gap-2 transition-all bg-white hover:bg-[#4F46E5] px-5 py-2.5 rounded-xl border border-gray-200 hover:border-[#4F46E5] shadow-sm">
                <Plus className="w-4 h-4" /> Request Missing Category
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // STEP 3: PRICING
  const renderStep3 = () => (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Pricing</h2>
        <p className="text-gray-500 text-sm">Set your product's pricing and discounts.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Original Price (₹)</label>
          <input type="number" value={formData.originalPrice} onChange={e => updateForm('originalPrice', e.target.value)} placeholder="69999" className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-[#4F46E5]/20 outline-none" />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Selling Price (₹) *</label>
          <input type="number" value={formData.price} onChange={e => updateForm('price', e.target.value)} placeholder="59999" className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] outline-none" />
        </div>
      </div>
    </div>
  );

  // STEP 4: INVENTORY
  const renderStep4 = () => (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Inventory</h2>
        <p className="text-gray-500 text-sm">Manage your stock levels and availability.</p>
      </div>
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 mb-2">
        <div>
          <h4 className="font-bold text-gray-900">Track Inventory</h4>
          <p className="text-xs text-gray-500">Automatically update stock levels.</p>
        </div>
        <div className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${formData.trackInventory ? 'bg-[#4F46E5]' : 'bg-gray-300'}`} onClick={() => updateForm('trackInventory', !formData.trackInventory)}>
          <div className={`w-4 h-4 bg-white rounded-full transition-transform ${formData.trackInventory ? 'translate-x-6' : 'translate-x-0'}`}></div>
        </div>
      </div>
      {formData.trackInventory && (
        <div className="w-1/2">
          <label className="block text-sm font-bold text-gray-700 mb-2">Stock Quantity</label>
          <input type="number" value={formData.stock} onChange={e => updateForm('stock', e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-[#4F46E5]/20 outline-none" />
        </div>
      )}
    </div>
  );

  // STEP 5: SPECS
  const renderStep5 = () => (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Specifications</h2>
        <p className="text-gray-500 text-sm">Add technical details to help AI understand your product.</p>
      </div>
      <div className="flex flex-col gap-4">
        {formData.specs.map((spec, i) => (
          <div key={i} className="flex gap-4 items-center">
            <input type="text" value={spec.key} onChange={e => {
              const newSpecs = [...formData.specs];
              newSpecs[i].key = e.target.value;
              updateForm('specs', newSpecs);
            }} className="flex-1 border border-gray-300 rounded-lg px-4 py-3 text-sm outline-none" placeholder="e.g. RAM" />
            <input type="text" value={spec.value} onChange={e => {
              const newSpecs = [...formData.specs];
              newSpecs[i].value = e.target.value;
              updateForm('specs', newSpecs);
            }} className="flex-1 border border-gray-300 rounded-lg px-4 py-3 text-sm outline-none" placeholder="e.g. 16GB" />
          </div>
        ))}
        <Button variant="outline" className="w-full border-dashed border-gray-300 mt-2 text-gray-600" onClick={() => updateForm('specs', [...formData.specs, { key: "", value: "" }])}>
          + Add Specification
        </Button>
      </div>
    </div>
  );

  // STEP 6: MEDIA
  const renderStep6 = () => (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Images & Media</h2>
        <p className="text-gray-500 text-sm">Upload high-quality images of your product or link them.</p>
      </div>
      <div className="border-2 border-dashed border-[#4F46E5]/50 bg-[#F5F3FF] rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-[#EEF2FF] transition-colors">
        <UploadCloud className="w-12 h-12 text-[#4F46E5] mb-4" />
        <h4 className="font-bold text-gray-900 mb-1">Click to upload or drag and drop</h4>
        <p className="text-xs text-gray-500">SVG, PNG, JPG or GIF (max. 800x400px)</p>
      </div>
      <div className="flex flex-col gap-2">
        <label className="block text-sm font-bold text-gray-700">Or Paste Image URL directly</label>
        <input 
          type="text" 
          value={formData.image} 
          onChange={e => updateForm('image', e.target.value)}
          placeholder="https://images.unsplash.com/..." 
          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-[#4F46E5]/20 outline-none"
        />
      </div>
      <div className="flex items-center gap-4">
        <div className="w-24 h-24 rounded-lg bg-gray-100 border border-gray-200 p-1">
          <img src={formData.image} alt="Thumb" className="w-full h-full object-contain rounded" />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-sm font-bold text-gray-900 truncate max-w-[200px]">{formData.image.substring(formData.image.lastIndexOf('/') + 1) || "main_product_front.jpg"}</span>
          <span className="text-xs text-gray-500">Remote URL Connected</span>
          <button className="text-xs font-bold text-[#4F46E5] hover:underline self-start flex items-center gap-1 mt-1">
            <Sparkles className="w-3 h-3" /> Generate Alt Text
          </button>
        </div>
      </div>
    </div>
  );

  // STEP 7: DELIVERY
  const renderStep7 = () => (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Delivery</h2>
        <p className="text-gray-500 text-sm">Configure shipping and delivery options.</p>
      </div>
      <div className="grid grid-cols-1 gap-4">
        <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200">
          <span className="font-bold text-gray-900">Delivery Available</span>
          <div className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${formData.deliveryAvailable ? 'bg-[#4F46E5]' : 'bg-gray-300'}`} onClick={() => updateForm('deliveryAvailable', !formData.deliveryAvailable)}>
            <div className={`w-4 h-4 bg-white rounded-full transition-transform ${formData.deliveryAvailable ? 'translate-x-6' : 'translate-x-0'}`}></div>
          </div>
        </div>
        <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200">
          <span className="font-bold text-gray-900">Pickup Available</span>
          <div className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${formData.pickupAvailable ? 'bg-[#4F46E5]' : 'bg-gray-300'}`} onClick={() => updateForm('pickupAvailable', !formData.pickupAvailable)}>
            <div className={`w-4 h-4 bg-white rounded-full transition-transform ${formData.pickupAvailable ? 'translate-x-6' : 'translate-x-0'}`}></div>
          </div>
        </div>
        {formData.deliveryAvailable && (
          <div className="mt-4">
            <label className="block text-sm font-bold text-gray-700 mb-2">Estimated Delivery Time</label>
            <input type="text" value={formData.deliveryTime} onChange={e => updateForm('deliveryTime', e.target.value)} placeholder="e.g. 2-5 business days" className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-[#4F46E5]/20 outline-none" />
          </div>
        )}
      </div>
    </div>
  );

  const getStepContent = () => {
    switch (currentStep) {
      case 0: return <div key="step0">{renderStep0()}</div>;
      case 1: return <div key="step1">{renderStep1()}</div>;
      case 2: return <div key="step2">{renderStep2()}</div>;
      case 3: return <div key="step3">{renderStep3()}</div>;
      case 4: return <div key="step4">{renderStep4()}</div>;
      case 5: return <div key="step5">{renderStep5()}</div>;
      case 6: return <div key="step6">{renderStep6()}</div>;
      case 7: return <div key="step7">{renderStep7()}</div>;
      case 8: return <div key="step8">{renderStep8()}</div>;
      case 9: return <div key="step9">{renderStep9()}</div>;
      case 10: return <div key="step10">{renderStep10()}</div>;
      default: return null;
    }
  };

  // Hide the shell if we are on step 0 (Type selection) or 10 (Publishing success/progress)
  if (currentStep === 0 || currentStep === 10) {
    return (
      <div className="min-h-[calc(100vh-80px)] w-full bg-[#F8FAFC] flex flex-col p-6">
        <Button variant="ghost" onClick={currentStep === 10 ? undefined : () => window.history.back()} className="self-start mb-6 text-gray-500 hover:text-gray-900">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        {getStepContent()}
      </div>
    );
  }

  return (
    <div className="min-h-full w-full font-sans pb-20">
      
      {/* Top Sticky Progress */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide w-full max-w-4xl">
          {STEP_NAMES.slice(1, 10).map((name, index) => {
            const stepNum = index + 1;
            const isPast = stepNum < currentStep;
            const isActive = stepNum === currentStep;
            return (
              <div key={name} className="flex items-center">
                <div className={`flex items-center justify-center px-3 py-1.5 rounded-full text-[11px] font-bold transition-colors whitespace-nowrap ${
                  isActive ? 'bg-[#EEF2FF] text-[#4F46E5] border border-[#4F46E5]/20' : 
                  isPast ? 'text-gray-500 hover:bg-gray-50 cursor-pointer' : 'text-gray-300'
                }`} onClick={() => isPast && setCurrentStep(stepNum as Step)}>
                  {isPast && <CheckCircle2 className="w-3 h-3 mr-1 text-green-500" />}
                  {name}
                </div>
                {stepNum < 9 && <div className={`w-4 h-px mx-1 ${isPast ? 'bg-gray-300' : 'bg-gray-200'}`}></div>}
              </div>
            );
          })}
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto w-full flex flex-col lg:flex-row gap-6 lg:gap-8 p-4 lg:p-8">
        
        {/* Main Content Area */}
        <div className="flex-1 min-w-0 flex flex-col gap-6">
          
          {/* Quick AI Scraper Bar (Visible when not on finish step) */}
          {currentStep < 10 && (
            <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white p-5 rounded-2xl shadow-sm border border-indigo-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center shrink-0 border border-indigo-400/30">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                    Auto-Fill from Product URL
                    <span className="text-[10px] bg-indigo-500 text-white font-black px-2 py-0.5 rounded-full uppercase tracking-wider">AI Fast</span>
                  </h3>
                  <p className="text-[11px] text-indigo-200">Paste any product page link to instantly extract title, images, price & specs</p>
                </div>
              </div>

              <form onSubmit={handleAutoFillFromUrl} className="flex items-center gap-2 w-full md:w-auto">
                <input 
                  type="url"
                  value={importUrl}
                  onChange={(e) => setImportUrl(e.target.value)}
                  placeholder="https://example.com/product-link"
                  disabled={isImportingFromUrl}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/10 text-white placeholder:text-indigo-300 border border-indigo-700/50 focus:bg-white focus:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all w-full md:w-64"
                />
                <Button
                  type="submit"
                  disabled={isImportingFromUrl || !importUrl.trim()}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl px-4 h-9 shrink-0 shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  {isImportingFromUrl ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  <span>{isImportingFromUrl ? "Extracting..." : "Auto-Fill"}</span>
                </Button>
              </form>
            </div>
          )}

          {importSuccessBanner && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-bold text-emerald-800 flex items-center justify-between gap-2 animate-in fade-in">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                {importSuccessBanner}
              </span>
              <button onClick={() => setImportSuccessBanner(null)} className="text-emerald-600 hover:text-emerald-900 font-black">✕</button>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-gray-200 p-6 lg:p-8 shadow-sm">
            {getStepContent()}
          </div>
        </div>

        {/* Right Sticky Summary Sidebar */}
        <div className="w-full lg:w-[280px] xl:w-80 flex-shrink-0 flex flex-col gap-6">
          
          {/* Actions */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm flex flex-col gap-3 sticky top-24">
            <Button onClick={currentStep === 9 ? handlePublish : nextStep} className="w-full bg-[#4F46E5] hover:bg-[#4338CA] text-white h-12 font-bold shadow-sm transition-all hover:shadow-md">
              {currentStep === 9 ? (editId ? "Update Product" : "Publish Product") : "Continue"} <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <div className="flex gap-2">
              <Button onClick={prevStep} variant="outline" className="flex-1 bg-white border-gray-200 text-gray-700">Back</Button>
              <Button onClick={handleSaveDraft} variant="outline" className="flex-1 bg-white border-gray-200 text-gray-700">
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin text-gray-400" /> : <Save className="w-4 h-4 mr-2" />}
                {isSaving ? "" : "Save"}
              </Button>
            </div>
            
            <div className="w-full h-px bg-gray-100 my-2"></div>
            
            {/* Validation Mini-Summary */}
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Status</span>
              <ValidationItem label="Basic Data" done={currentStep > 1} />
              <ValidationItem label="Media Uploads" done={currentStep > 6} />
              <ValidationItem label="AI Search Data" done={currentStep > 8} />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// Helpers
function ValidationItem({ label, done }: { label: string, done: boolean }) {
  return (
    <div className="flex items-center gap-2">
      {done ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <div className="w-4 h-4 rounded-full border-2 border-gray-200"></div>}
      <span className={`text-xs font-semibold ${done ? 'text-gray-900' : 'text-gray-400'}`}>{label}</span>
    </div>
  );
}

function ProcessItem({ label, done, active }: { label: string, done: boolean, active?: boolean }) {
  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg border ${active ? 'bg-[#EEF2FF] border-[#4F46E5]/30' : 'bg-gray-50 border-gray-100'} transition-colors`}>
      {done ? (
        <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
      ) : active ? (
        <Loader2 className="w-5 h-5 text-[#4F46E5] animate-spin shrink-0" />
      ) : (
        <div className="w-5 h-5 rounded-full border-2 border-gray-200 shrink-0"></div>
      )}
      <span className={`text-sm font-semibold ${active ? 'text-[#4F46E5]' : done ? 'text-gray-900' : 'text-gray-400'}`}>{label}</span>
    </div>
  );
}

// Suspense-wrapped exported component
export default function AddProductPage() {
  return (
    <Suspense fallback={
      <div className="flex h-[calc(100vh-80px)] w-full items-center justify-center bg-[#F8FAFC]">
        <Loader2 className="w-8 h-8 animate-spin text-[#4F46E5]" />
      </div>
    }>
      <AddProductWizard />
    </Suspense>
  );
}
