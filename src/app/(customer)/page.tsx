import { Search, Shield, CheckCircle2, HeadphonesIcon, TrendingUp, Star, ShoppingCart, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ProductCard } from "@/components/ui/product-card";

import { HeroSection } from "@/components/ui/hero-section";
import { ActionBanners } from "@/components/ui/action-banners";
import { TrustStats } from "@/components/ui/trust-stats";
import { FaqSection } from "@/components/ui/faq-section";
import { TestimonialsSection } from "@/components/ui/testimonials-section";
import { BottomCta } from "@/components/ui/bottom-cta";
import { BrowseCategories } from "@/components/ui/browse-categories";

const TRENDING_PRODUCTS = [
  {
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
    title: "Modern Luxury Villa",
    rating: 5.0,
    price: "₹8,50,00,000",
    badge: "Verified Listing",
    location: "Mumbai, India",
    actionText: "Add"
  },
  {
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80",
    title: "MacBook Air M2",
    rating: 4.9,
    price: "₹84,999",
    originalPrice: "₹99,900",
    badge: "Free Delivery",
    location: "Available Today",
    actionText: "Add"
  },
  {
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
    title: "Premium Italian Marble",
    rating: 4.8,
    price: "₹450 / sq. ft",
    badge: "Top Rated Seller",
    location: "Kishangarh, Rajasthan",
    actionText: "Add"
  },
  {
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80",
    title: "Canon RF 50mm f/1.2",
    rating: 5.0,
    price: "₹1,85,000",
    badge: "Free Delivery",
    location: "Bangalore, India",
    actionText: "Add"
  }
];

const BEST_SERVICES = [
  {
    image: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80",
    title: "Custom Kitchen Design",
    rating: 5.0,
    price: "Starting from ₹50,000",
    badge: "Top Rated Pro",
    location: "Mumbai, India",
    actionText: "Book",
    isService: true
  },
  {
    image: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80",
    title: "Professional Interior Decor",
    rating: 4.9,
    price: "Starting from ₹15,000/rm",
    badge: "Verified Pro",
    location: "Delhi, India",
    actionText: "Book",
    isService: true
  },
  {
    image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&q=80",
    title: "SEO & Growth Strategy",
    rating: 4.8,
    price: "Starting from ₹15,000",
    badge: "Top Rated Pro",
    location: "Remote, Global",
    actionText: "Book",
    isService: true
  },
  {
    image: "https://images.unsplash.com/photo-1511556820780-d912e42b4980?w=800&q=80",
    title: "Product Photography",
    rating: 5.0,
    price: "Starting from ₹5,000/day",
    badge: "Verified Pro",
    location: "Bangalore, India",
    actionText: "Book",
    isService: true
  }
];

export default async function CustomerHome({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedSearchParams = await searchParams;
  const query = typeof resolvedSearchParams.q === 'string' ? resolvedSearchParams.q.toLowerCase() : '';

  const filteredProducts = TRENDING_PRODUCTS.filter(p => 
    p.title.toLowerCase().includes(query) || 
    p.badge.toLowerCase().includes(query) || 
    p.location.toLowerCase().includes(query)
  );

  const filteredServices = BEST_SERVICES.filter(s => 
    s.title.toLowerCase().includes(query) || 
    s.badge.toLowerCase().includes(query) || 
    s.location.toLowerCase().includes(query)
  );

  return (
    <div className="flex flex-col w-full pb-20">
      
      {/* Hero Section */}
      <HeroSection initialQuery={query} />

      {/* Action Banners */}
      <ActionBanners />

      {/* Categories */}
      <BrowseCategories />

      {/* Trending Products */}
      {filteredProducts.length > 0 ? (
        <section className="w-full px-4 md:px-8 lg:px-12 py-12">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <TrendingUp className="text-orange-500 w-5 h-5" /> Trending Products for You
            </h3>
            <Button variant="link" className="text-primary font-semibold">View All</Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((p, i) => (
              <ProductCard key={i} {...p} />
            ))}
          </div>
        </section>
      ) : (
        <section className="w-full px-4 md:px-8 lg:px-12 py-12">
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-12 text-center flex flex-col items-center justify-center">
            <Search className="w-12 h-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-500 max-w-sm">We couldn't find any products matching "{query}". Try searching for something else like "MacBook" or "Marble".</p>
          </div>
        </section>
      )}

      {/* Best Services */}
      {filteredServices.length > 0 ? (
        <section className="w-full px-4 md:px-8 lg:px-12 py-12">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Star className="text-yellow-400 w-5 h-5 fill-yellow-400" /> Best Services for You
            </h3>
            <Button variant="link" className="text-primary font-semibold">View All</Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredServices.map((s, i) => (
              <ProductCard key={i} {...s} />
            ))}
          </div>
        </section>
      ) : (
        <section className="w-full px-4 md:px-8 lg:px-12 py-12">
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-12 text-center flex flex-col items-center justify-center">
            <Search className="w-12 h-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">No services found</h3>
            <p className="text-gray-500 max-w-sm">We couldn't find any services matching "{query}". Try searching for something else like "Design".</p>
          </div>
        </section>
      )}

      {/* Trust & Stats */}
      <TrustStats />

      {/* Testimonials */}
      <TestimonialsSection />

      {/* FAQ */}
      <FaqSection />

      {/* Bottom CTA */}
      <BottomCta />
      
    </div>
  );
}
