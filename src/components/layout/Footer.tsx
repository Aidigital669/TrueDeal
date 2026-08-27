import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t mt-20">
      {/* Top CTA Banner */}
      <div className="bg-primary py-16 px-4 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Want to sell?</h2>
        <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
          Get your products or services in front of thousands of buyers.
        </p>
        <Button variant="secondary" className="bg-white text-primary hover:bg-gray-100 font-bold px-8 py-6 rounded-full text-lg">
          Start Selling
        </Button>
      </div>

      {/* Main Footer Links */}
      <div className="w-full px-4 md:px-8 lg:px-12 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div className="col-span-1">
            <Link href="/" className="relative block w-32 h-8 mb-4">
              <Image 
                src="/truedeal.png" 
                alt="TrueDeal Logo" 
                fill
                className="object-contain object-left"
              />
            </Link>
            <p className="text-sm text-gray-500 mb-4 max-w-xs">
              The premium marketplace for independent businesses, discerning buyers, and professional services.
            </p>
            <p className="text-sm text-gray-400">
              © {new Date().getFullYear()} TrueDeal Marketplace, Inc. All rights reserved.
            </p>
          </div>

          {/* Links Columns */}
          <div>
            <h4 className="font-semibold mb-4 text-gray-900">Shop & Hire</h4>
            <ul className="space-y-3 text-sm text-gray-500">
              <li><Link href="/products" className="hover:text-primary">Buy Products</Link></li>
              <li><Link href="/services" className="hover:text-primary">Find Services</Link></li>
              <li><Link href="/deals" className="hover:text-primary">Deals & Offers</Link></li>
              <li><Link href="/categories" className="hover:text-primary">All Categories</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-gray-900">Sell & Provide</h4>
            <ul className="space-y-3 text-sm text-gray-500">
              <li><Link href="/sell" className="hover:text-primary">Sell Products on TrueDeal</Link></li>
              <li><Link href="/offer" className="hover:text-primary">Offer a Service</Link></li>
              <li><Link href="/dashboard" className="hover:text-primary">Provider Dashboard</Link></li>
              <li><Link href="/resources" className="hover:text-primary">Resources & Guides</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-gray-900">Company</h4>
            <ul className="space-y-3 text-sm text-gray-500">
              <li><Link href="/about" className="hover:text-primary">About Us</Link></li>
              <li><Link href="/support" className="hover:text-primary">Support & Trust</Link></li>
              <li><Link href="/privacy" className="hover:text-primary">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-primary">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
