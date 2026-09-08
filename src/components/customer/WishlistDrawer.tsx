"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Heart, Trash2, ExternalLink, MessageSquare, ShoppingBag, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchListingItem } from "@/app/api/search-listings/route";

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: SearchListingItem[];
  onRemoveItem: (id: string) => void;
  onAddToCart?: (item: SearchListingItem) => void;
}

export function WishlistDrawer({
  isOpen,
  onClose,
  items,
  onRemoveItem,
  onAddToCart
}: WishlistDrawerProps) {
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
                  <div className="w-8 h-8 rounded-full bg-pink-50 text-pink-600 flex items-center justify-center">
                    <Heart className="w-4 h-4 fill-pink-600" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-gray-900">Saved Wishlist</h3>
                    <p className="text-xs text-gray-500 font-medium">{items.length} item{items.length === 1 ? "" : "s"} saved for later</p>
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
                      <Heart className="w-8 h-8" />
                    </div>
                    <h4 className="font-bold text-gray-700 text-sm">Your wishlist is empty</h4>
                    <p className="text-xs text-gray-500 max-w-xs">
                      Click the heart icon on any product or listing to save it to your wishlist.
                    </p>
                    <Button
                      onClick={onClose}
                      className="bg-black hover:bg-gray-800 text-white rounded-full text-xs font-bold px-5 py-2 mt-2"
                    >
                      Explore Marketplace
                    </Button>
                  </div>
                ) : (
                  items.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-2xl border border-gray-100 bg-gray-50/50 hover:border-gray-200 transition-all flex gap-3 group"
                    >
                      {/* Image */}
                      <div className="w-20 h-20 rounded-xl bg-white border border-gray-100 overflow-hidden shrink-0 flex items-center justify-center">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-contain p-1"
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-bold text-xs text-gray-900 line-clamp-1 leading-snug" title={item.title}>
                              {item.title}
                            </h4>
                            <button
                              onClick={() => onRemoveItem(item.id)}
                              className="text-gray-400 hover:text-red-500 transition-colors shrink-0 cursor-pointer"
                              title="Remove from wishlist"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <span className="text-[11px] text-gray-500 font-medium block truncate">
                            {item.sellerName || "Verified Seller"}
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                          <span className="font-black text-sm text-gray-900">{item.price}</span>
                          <div className="flex items-center gap-1.5">
                            {item.websiteUrl && (
                              <a
                                href={item.websiteUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2.5 py-1 bg-white hover:bg-gray-100 border border-gray-200 rounded-lg text-[11px] font-bold text-gray-700 flex items-center gap-1 transition-all"
                              >
                                <ExternalLink className="w-3 h-3" /> Buy
                              </a>
                            )}
                            {item.whatsappUrl && (
                              <a
                                href={item.whatsappUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all"
                              >
                                <MessageSquare className="w-3 h-3 text-emerald-600" /> WhatsApp
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              {items.length > 0 && (
                <div className="p-5 border-t border-gray-100 bg-gray-50/50 space-y-2">
                  <p className="text-[11px] text-gray-500 font-medium text-center">
                    All items link directly to authentic seller websites & WhatsApp channels with transparent direct pricing.
                  </p>
                  <Button
                    onClick={onClose}
                    className="w-full bg-black hover:bg-gray-800 text-white rounded-xl text-xs font-bold py-3 cursor-pointer"
                  >
                    Continue Browsing
                  </Button>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
