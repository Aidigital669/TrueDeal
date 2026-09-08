"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag, Trash2, MessageSquare, ArrowRight, CheckCircle2, Send, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchListingItem } from "@/app/api/search-listings/route";

export interface CartItem {
  product: SearchListingItem;
  quantity: number;
}

interface InquiryCartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
}

export function InquiryCartDrawer({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart
}: InquiryCartDrawerProps) {
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [inquiryNotes, setInquiryNotes] = useState("");

  const totalRawPrice = items.reduce((sum, item) => {
    return sum + (item.product.rawPrice || 0) * item.quantity;
  }, 0);

  const formattedTotal = totalRawPrice > 0 
    ? `₹${totalRawPrice.toLocaleString("en-IN")}`
    : "Direct Seller Pricing";

  const handleBulkWhatsApp = () => {
    if (items.length === 0) return;

    // Group items by seller
    const firstItem = items[0].product;
    const sellerWhatsApp = (firstItem.whatsappUrl?.match(/wa\.me\/([0-9]+)/)?.[1]) || firstItem.phone?.replace(/[^0-9]/g, "") || "918903216178";
    
    const productSummary = items.map((it, idx) => 
      `${idx + 1}. ${it.product.title} (Qty: ${it.quantity}) - ${it.product.price}`
    ).join("\n");

    const messageText = `Hi ${firstItem.sellerName || "Seller"},\nI am inquiring about the following products on TrueDeal:\n\n${productSummary}\n\nEstimated Total: ${formattedTotal}\n${customerName ? `Name: ${customerName}\n` : ""}${customerPhone ? `Phone: ${customerPhone}\n` : ""}${inquiryNotes ? `Notes: ${inquiryNotes}\n` : ""}Please confirm availability and dispatch details.`;

    const url = `https://wa.me/${sellerWhatsApp}?text=${encodeURIComponent(messageText)}`;
    window.open(url, "_blank");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden font-sans">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between"
            >
              {/* Header */}
              <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-gray-900">Inquiry & Order Bag</h3>
                    <p className="text-xs text-gray-500 font-medium">{items.length} product{items.length === 1 ? "" : "s"} selected for direct order</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {items.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-400 space-y-3">
                    <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center text-gray-300">
                      <ShoppingBag className="w-8 h-8" />
                    </div>
                    <h4 className="font-bold text-gray-700 text-sm">Your inquiry bag is empty</h4>
                    <p className="text-xs text-gray-500 max-w-xs">
                      Add products to your inquiry bag to ask questions or place bulk orders directly with verified sellers.
                    </p>
                    <Button
                      onClick={onClose}
                      className="bg-black hover:bg-gray-800 text-white rounded-full text-xs font-bold px-5 py-2 mt-2"
                    >
                      Browse Catalog
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3">
                      {items.map((it) => (
                        <div
                          key={it.product.id}
                          className="p-3.5 rounded-2xl border border-gray-100 bg-gray-50/50 hover:border-gray-200 transition-all flex gap-3"
                        >
                          {/* Image */}
                          <div className="w-16 h-16 rounded-xl bg-white border border-gray-100 overflow-hidden shrink-0 flex items-center justify-center">
                            <img
                              src={it.product.image}
                              alt={it.product.title}
                              className="w-full h-full object-contain p-1"
                            />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0 flex flex-col justify-between">
                            <div className="flex items-start justify-between gap-1">
                              <h4 className="font-bold text-xs text-gray-900 line-clamp-1" title={it.product.title}>
                                {it.product.title}
                              </h4>
                              <button
                                onClick={() => onRemoveItem(it.product.id)}
                                className="text-gray-400 hover:text-red-500 transition-colors shrink-0 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <span className="text-[11px] text-gray-500 font-medium block truncate">
                              {it.product.sellerName || "Verified Seller"}
                            </span>

                            <div className="flex items-center justify-between pt-1.5">
                              <span className="font-black text-xs text-gray-900">{it.product.price}</span>
                              
                              {/* Quantity Controls */}
                              <div className="flex items-center border border-gray-200 rounded-lg bg-white overflow-hidden">
                                <button
                                  onClick={() => onUpdateQuantity(it.product.id, -1)}
                                  className="w-6 h-6 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors"
                                >
                                  <Minus className="w-2.5 h-2.5" />
                                </button>
                                <span className="w-7 text-center text-xs font-bold text-gray-800">
                                  {it.quantity}
                                </span>
                                <button
                                  onClick={() => onUpdateQuantity(it.product.id, 1)}
                                  className="w-6 h-6 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors"
                                >
                                  <Plus className="w-2.5 h-2.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Quick Inquiry Form */}
                    <div className="p-4 rounded-2xl border border-gray-100 bg-gray-50 space-y-2.5 text-xs">
                      <span className="font-extrabold text-gray-800 block text-[11px] uppercase tracking-wider">
                        Direct Inquiry Details
                      </span>
                      <div>
                        <input
                          type="text"
                          placeholder="Your Name (Optional)"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-xs font-medium focus:border-indigo-600 outline-none"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          placeholder="Phone / WhatsApp Number (Optional)"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-xs font-medium focus:border-indigo-600 outline-none"
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Footer */}
              {items.length > 0 && (
                <div className="p-5 border-t border-gray-100 bg-white space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-bold text-gray-600">Estimated Total:</span>
                    <span className="font-black text-lg text-gray-900">{formattedTotal}</span>
                  </div>

                  <Button
                    onClick={handleBulkWhatsApp}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold py-3.5 shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer h-11"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Inquire All on WhatsApp ({items.length})</span>
                  </Button>

                  <button
                    onClick={onClearCart}
                    className="w-full text-center text-[11px] font-bold text-gray-400 hover:text-red-500 transition-colors"
                  >
                    Clear inquiry bag
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
