"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, ShieldCheck, Sparkles, MessageSquare, Building2, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HowItWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExplore?: () => void;
}

export function HowItWorksModal({ isOpen, onClose, onExplore }: HowItWorksModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 font-sans">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-gray-100 relative"
          >
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 relative">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
              
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-extrabold border border-indigo-500/30 mb-2">
                <Sparkles className="w-3.5 h-3.5" /> Buyer Transparency & Protection
              </div>
              <h2 className="text-2xl font-black tracking-tight">How TrueDeal Works for Buyers</h2>
              <p className="text-xs text-indigo-200 mt-1">Direct-to-seller marketplace with zero commission markups and verified business authenticity.</p>
            </div>

            {/* Steps Body */}
            <div className="p-6 sm:p-8 space-y-6 max-h-[65vh] overflow-y-auto">
              
              {/* Step 1 */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-sm shrink-0 border border-indigo-100">
                  1
                </div>
                <div className="space-y-1">
                  <h4 className="font-extrabold text-sm text-gray-900">Ask TrueDeal AI or Browse Verified Catalogs</h4>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Search naturally via AI conversational prompt or browse curated categories (Ayurvedic wellness mixes, electronics, commercial real estate, corporate services).
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-sm shrink-0 border border-emerald-100">
                  2
                </div>
                <div className="space-y-1">
                  <h4 className="font-extrabold text-sm text-gray-900">100% Authentic Listings & Direct Pricing</h4>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Every product is directly synced from the merchant's verified catalog with authentic photos, ingredients/specifications, and original website pricing.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-black text-sm shrink-0 border border-purple-100">
                  3
                </div>
                <div className="space-y-1">
                  <h4 className="font-extrabold text-sm text-gray-900">Direct WhatsApp Order or Outbound Website Purchase</h4>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Connect directly to the manufacturer or store owner with one click on WhatsApp, or buy directly on their official brand checkout with zero intermediate fees.
                  </p>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 grid grid-cols-2 gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-bold text-gray-800">Verified Business Profiles</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-bold text-gray-800">Zero Middleman Markup</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-bold text-gray-800">Direct Merchant WhatsApp</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-bold text-gray-800">Complete Title & Spec Checks</span>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-gray-100 bg-gray-50 flex items-center justify-between gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="text-xs font-bold rounded-xl"
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  onClose();
                  if (onExplore) onExplore();
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold px-5 flex items-center gap-1.5"
              >
                <span>Start Exploring</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
