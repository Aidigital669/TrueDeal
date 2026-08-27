"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Heart, ShoppingCart, Bell, User, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  return (
    <header className="border-b bg-white">
      {/* Top Bar */}
      <div className="w-full px-4 md:px-8 lg:px-12 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="relative w-40 h-10">
            <Image 
              src="/truedeal.png" 
              alt="TrueDeal Logo" 
              fill
              className="object-contain object-left"
              priority
            />
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link href="/products" className="text-muted-foreground hover:text-foreground">
            Products & Services
          </Link>
          <Link href="/explore" className="text-primary font-semibold border-b-2 border-primary py-5">
            Explore
          </Link>
          <Link href="/deals" className="text-muted-foreground hover:text-foreground">
            Deals
          </Link>
        </nav>

        {/* Search Bar */}
        <div className="flex-1 max-w-md hidden lg:flex items-center relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search for products, services, experts, or tags"
            className="w-full h-10 pl-10 pr-4 rounded-full border bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 md:gap-4">
          <Button variant="ghost" size="icon" className="hidden sm:flex text-gray-600">
            <Heart className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-gray-600">
            <ShoppingCart className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="hidden sm:flex text-gray-600">
            <Bell className="h-5 w-5" />
          </Button>
          
          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-2 border-l pl-4 ml-2">
            <Link href="/login">
              <Button variant="ghost" className="text-gray-600 font-medium">
                Login
              </Button>
            </Link>
            <Button className="bg-primary hover:bg-primary/90 text-white font-semibold rounded-md px-6">
              Sell / Offer
            </Button>
          </div>

          {/* Mobile Menu Icon */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden text-gray-900"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Secondary Category Nav (Desktop Only) */}
      <div className="border-t hidden md:block">
        <div className="w-full px-4 md:px-8 lg:px-12 h-12 flex items-center justify-between gap-4 text-sm font-medium text-gray-600 overflow-x-auto whitespace-nowrap [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <Link href="/categories/electronics" className="hover:text-primary shrink-0">
            Electronics
          </Link>
          <Link href="/categories/fashion" className="hover:text-primary shrink-0">
            Fashion
          </Link>
          <Link href="/categories/furniture" className="hover:text-primary shrink-0">
            Furniture
          </Link>
          <Link href="/categories/home-services" className="hover:text-primary shrink-0">
            Home Services
          </Link>
          <Link href="/categories/b2b" className="hover:text-primary shrink-0">
            B2B Services
          </Link>
          <Link href="/categories/design" className="hover:text-primary shrink-0">
            Design & Tech
          </Link>
          <Link href="/categories/home-services" className="hover:text-primary shrink-0">
            Home Services
          </Link>
          <Link href="/categories/consulting" className="hover:text-primary shrink-0">
            Consulting
          </Link>
          <Link href="/categories/more" className="hover:text-primary font-medium shrink-0">
            See All
          </Link>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-t overflow-hidden bg-white"
          >
            <div className="p-4 flex flex-col gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full h-10 pl-10 pr-4 rounded-md border bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                />
              </div>
              <nav className="flex flex-col gap-3 font-medium text-gray-700">
                <Link href="/products" onClick={() => setIsMobileMenuOpen(false)}>Products & Services</Link>
                <Link href="/explore" onClick={() => setIsMobileMenuOpen(false)} className="text-blue-600">Explore</Link>
                <Link href="/deals" onClick={() => setIsMobileMenuOpen(false)}>Deals</Link>
              </nav>

              {/* Categories in Mobile Menu */}
              <div className="flex flex-col gap-3 pt-4 border-t">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Categories</h4>
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                  <Link href="/categories/electronics" onClick={() => setIsMobileMenuOpen(false)}>Electronics</Link>
                  <Link href="/categories/fashion" onClick={() => setIsMobileMenuOpen(false)}>Fashion</Link>
                  <Link href="/categories/furniture" onClick={() => setIsMobileMenuOpen(false)}>Furniture</Link>
                  <Link href="/categories/home-services" onClick={() => setIsMobileMenuOpen(false)}>Home Services</Link>
                  <Link href="/categories/b2b" onClick={() => setIsMobileMenuOpen(false)}>B2B Services</Link>
                  <Link href="/categories/design" onClick={() => setIsMobileMenuOpen(false)}>Design & Tech</Link>
                  <Link href="/categories/consulting" onClick={() => setIsMobileMenuOpen(false)}>Consulting</Link>
                  <Link href="/categories/more" onClick={() => setIsMobileMenuOpen(false)} className="font-semibold text-blue-600">See All Categories</Link>
                </div>
              </div>

              <div className="flex flex-col gap-2 mt-2 pt-4 border-t">
                <Button variant="outline" className="w-full justify-center">Login</Button>
                <Button className="w-full justify-center bg-blue-600 hover:bg-blue-700 text-white">Sell / Offer</Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
