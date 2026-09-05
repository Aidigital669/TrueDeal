import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="w-full bg-white border-t border-gray-100 mt-auto font-sans">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 lg:py-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          
          {/* Left Column: Logo & Copyright */}
          <div className="flex flex-col gap-2 max-w-md">
            <Link href="/" className="relative block w-32 h-8 mb-1">
              <Image 
                src="/truedeal.png" 
                alt="TrueDeal Logo" 
                fill
                sizes="128px"
                className="object-contain object-left"
              />
            </Link>
            
            <div className="text-xs text-gray-400 font-medium space-y-1">
              <p>© {new Date().getFullYear()} Marketplace AI. All rights reserved.</p>
              <p>Searching 1M+ items from integrated seller websites & marketplace listings.</p>
            </div>
          </div>

          {/* Right Column: Links */}
          <nav className="flex flex-wrap items-center gap-4 md:gap-6 text-xs font-semibold text-gray-500">
            <Link href="/privacy" className="hover:text-gray-900 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-gray-900 transition-colors">Terms of Service</Link>
            <Link href="/support" className="hover:text-gray-900 transition-colors">Contact Support</Link>
            <Link href="/seller-hub" className="hover:text-gray-900 transition-colors">Seller Hub</Link>
            <Link href="/docs/api" className="hover:text-gray-900 transition-colors">API Documentation</Link>
          </nav>
          
        </div>
      </div>
    </footer>
  );
}

