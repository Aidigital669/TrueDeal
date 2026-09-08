"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Laptop, Building2, Store, ArrowRight, Package, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CategoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCategory: (categoryName: string, queryText?: string) => void;
}

export function CategoriesModal({ isOpen, onClose, onSelectCategory }: CategoriesModalProps) {
  const categories = [
    {
      id: "wellness",
      name: "Wellness & Food",
      icon: <Sparkles className="w-5 h-5 text-emerald-600" />,
      bgColor: "bg-emerald-50 border-emerald-100",
      description: "Instant botanical health mixes, sprouted millet drinks, Moringa & mushroom premix soups.",
      query: "Ayurvedic herbal wellness mixes and natural soup premixes",
      badge: "Pure Botanicals"
    },
    {
      id: "electronics",
      name: "Electronics & Hardware",
      icon: <Laptop className="w-5 h-5 text-pink-600" />,
      bgColor: "bg-pink-50 border-pink-100",
      description: "Laptops, PC hardware, workstations, peripherals, and IT enterprise solutions.",
      query: "Laptops and computer hardware",
      badge: "High Performance"
    },
    {
      id: "properties",
      name: "Commercial Real Estate",
      icon: <Building2 className="w-5 h-5 text-indigo-600" />,
      bgColor: "bg-indigo-50 border-indigo-100",
      description: "Grade-A office spaces, retail showrooms, commercial land, and IT parks.",
      query: "Commercial office space and retail properties",
      badge: "Verified Properties"
    },
    {
      id: "services",
      name: "Corporate & IT Services",
      icon: <Store className="w-5 h-5 text-purple-600" />,
      bgColor: "bg-purple-50 border-purple-100",
      description: "Full-stack software development, corporate legal advisory, and business suites.",
      query: "Corporate and digital business services",
      badge: "Enterprise Suites"
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 font-sans">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-gray-100 relative"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-gray-900">Explore Market Categories</h3>
                <p className="text-xs text-gray-500 font-medium">Select a domain to discover authentic products and verified merchants.</p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Grid */}
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    onSelectCategory(cat.name, cat.query);
                    onClose();
                  }}
                  className={`p-4 rounded-2xl border ${cat.bgColor} hover:shadow-md hover:scale-[1.02] transition-all text-left flex flex-col justify-between gap-3 group cursor-pointer`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-9 h-9 rounded-xl bg-white shadow-sm flex items-center justify-center">
                        {cat.icon}
                      </div>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-white/80 text-gray-700 border border-gray-200/60">
                        {cat.badge}
                      </span>
                    </div>
                    <h4 className="font-extrabold text-sm text-gray-900 group-hover:text-indigo-600 transition-colors">
                      {cat.name}
                    </h4>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2 leading-relaxed">
                      {cat.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 text-xs font-bold text-indigo-600 pt-2 border-t border-gray-200/40">
                    <span>Explore Products</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>
              ))}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
              <span className="text-xs text-gray-500 font-semibold">Over 100+ verified listings</span>
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                className="text-xs font-bold rounded-lg"
              >
                Cancel
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
