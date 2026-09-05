"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingCart, User, Menu, X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="w-full bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100 font-sans">
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Left Section: Logo & Nav */}
        <div className="flex items-center gap-8 lg:gap-12">
          {/* TrueDeal Logo */}
          <Link href="/" className="flex items-center">
            <div className="relative w-40 h-10">
              <Image 
                src="/truedeal.png" 
                alt="TrueDeal Logo" 
                fill
                sizes="160px"
                className="object-contain object-left"
                priority
                loading="eager"
              />
            </div>
          </Link>

          {/* Minimalist Navigation Links */}
          <nav className="hidden md:flex items-center gap-2 text-sm font-medium text-gray-500 font-sans">
            <Link href="/explore" className="text-gray-900 bg-gray-100/50 px-3 py-1.5 rounded-full transition-colors">
              Explore
            </Link>
            <Link href="/categories" className="hover:text-gray-900 hover:bg-gray-50 px-3 py-1.5 rounded-full transition-colors">
              Categories
            </Link>
            <Link href="/for-sellers" className="hover:text-gray-900 hover:bg-gray-50 px-3 py-1.5 rounded-full transition-colors">
              For Sellers
            </Link>
            <Link href="/how-it-works" className="hover:text-gray-900 hover:bg-gray-50 px-3 py-1.5 rounded-full transition-colors">
              How It Works
            </Link>
          </nav>
        </div>

        {/* Right Section: Actions */}
        <div className="flex items-center gap-2 md:gap-3">
          <Button variant="ghost" size="icon" className="hidden sm:flex text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full h-9 w-9 transition-colors">
            <Heart className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="hidden sm:flex text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full h-9 w-9 transition-colors">
            <ShoppingCart className="h-4 w-4" />
          </Button>
          
          <div className="hidden md:block w-px h-4 bg-gray-200 mx-2"></div>
          
          <Link href="/login">
            <Button variant="ghost" size="icon" className="hidden sm:flex text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full h-9 w-9 transition-colors">
              <User className="h-4 w-4" />
            </Button>
          </Link>
          
          {/* Sleek CTA Button */}
          <Link href="/signup?type=seller">
            <Button className="hidden md:flex items-center gap-1.5 bg-black hover:bg-gray-800 text-white rounded-full px-5 h-9 shadow-sm transition-all ml-2 font-sans font-medium text-sm">
              <Plus className="w-3.5 h-3.5" />
              <span>Sell Item</span>
            </Button>
          </Link>

          {/* Mobile Menu Icon */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden text-gray-900 hover:bg-gray-100 rounded-full"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 overflow-hidden bg-white/95 backdrop-blur-md shadow-lg animate-in fade-in duration-150">
          <div className="p-4 flex flex-col gap-2">
            <nav className="flex flex-col gap-1 font-medium text-gray-600">
              <Link href="/explore" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-900 bg-gray-50 px-4 py-3 rounded-xl">Explore</Link>
              <Link href="/categories" onClick={() => setIsMobileMenuOpen(false)} className="hover:bg-gray-50 px-4 py-3 rounded-xl">Categories</Link>
              <Link href="/for-sellers" onClick={() => setIsMobileMenuOpen(false)} className="hover:bg-gray-50 px-4 py-3 rounded-xl">For Sellers</Link>
              <Link href="/how-it-works" onClick={() => setIsMobileMenuOpen(false)} className="hover:bg-gray-50 px-4 py-3 rounded-xl">How It Works</Link>
            </nav>

            <div className="flex items-center justify-around py-4 mt-2 border-t border-gray-100">
              <Button variant="ghost" size="icon" className="text-gray-600 rounded-full">
                <Heart className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-gray-600 rounded-full">
                <ShoppingCart className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-gray-600 rounded-full">
                <User className="h-5 w-5" />
              </Button>
            </div>

            <Button className="w-full h-11 bg-black hover:bg-gray-800 text-white rounded-xl flex items-center justify-center gap-2 font-medium">
              <Plus className="w-4 h-4" />
              <span>Sell Item</span>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
