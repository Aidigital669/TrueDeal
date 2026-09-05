"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Search, Shield, CheckCircle2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Tilt from "react-parallax-tilt";
import { useRouter } from "next/navigation";

export function HeroSection({ initialQuery = "" }: { initialQuery?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState(initialQuery);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0.2]);

  // Debounced live search
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (searchTerm !== initialQuery) {
        if (searchTerm) {
          router.replace(`/?q=${encodeURIComponent(searchTerm)}`, { scroll: false });
        } else {
          router.replace(`/`, { scroll: false });
        }
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timeout);
  }, [searchTerm, router, initialQuery]);

  return (
    <section 
      ref={containerRef} 
      className="relative w-full overflow-hidden bg-gray-50/50 pt-0 pb-12 sm:pb-16 lg:pb-20 px-4 sm:px-6 lg:px-8"
    >
      
      {/* Background Gradients */}
      <div className="absolute inset-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-full lg:w-3/4 h-full bg-gradient-to-b lg:bg-gradient-to-l from-blue-50/80 to-transparent" />
        <motion.div
          animate={{ scale: [1, 1.1, 1], x: [0, 30, 0], y: [0, -30, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-5%] right-[-5%] w-[400px] lg:w-[600px] h-[400px] lg:h-[600px] rounded-full bg-blue-400/20 blur-[80px] lg:blur-[100px]"
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1], x: [0, -40, 0], y: [0, 40, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[-5%] left-[-5%] w-[300px] lg:w-[500px] h-[300px] lg:h-[500px] rounded-full bg-orange-400/15 blur-[80px] lg:blur-[120px]"
        />
        {/* Grid Pattern overlay */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02] mix-blend-overlay z-0" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      <motion.div 
        style={{ y, opacity }}
        className="relative z-10 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-8 items-start"
      >
        {/* Left Column: Text & Search */}
        <div className="flex flex-col items-center lg:items-start text-center lg:text-left pt-10 lg:pt-16">
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-gray-900 tracking-tight leading-[1.1] mb-6"
          >
            Your destination for <br className="hidden sm:block"/> 
            <span className="relative inline-block">
              <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-sky-500">products</span>
              <div className="absolute -bottom-1 lg:-bottom-2 left-0 w-full h-2 lg:h-3 bg-orange-200/50 -z-0 rotate-1 rounded-full"></div>
            </span> & <br className="hidden sm:block"/> 
            skilled professionals.
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-base sm:text-lg lg:text-xl text-gray-500 font-medium max-w-xl mb-8 lg:mb-10 px-4 sm:px-0"
          >
            Discover top-tier physical products and hire verified experts all in one trusted platform.
          </motion.p>
          
          {/* Big Search Bar */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="w-full max-w-xl relative flex items-center shadow-xl lg:shadow-2xl shadow-blue-900/10 rounded-full overflow-hidden border-2 sm:border-4 border-white bg-white group hover:shadow-blue-900/20 transition-all duration-300 mb-8"
          >
            <div className="flex-1 flex items-center px-4 sm:px-6">
              <Search className="w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors mr-2 sm:mr-3 shrink-0" />
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search materials, pros..." 
                className="w-full h-12 sm:h-14 lg:h-16 outline-none text-gray-900 placeholder:text-gray-400 bg-transparent text-sm sm:text-base lg:text-lg font-medium"
              />
            </div>
            <Button 
              onClick={() => {
                if (searchTerm) router.push(`/?q=${encodeURIComponent(searchTerm)}`);
              }}
              className="rounded-full px-5 sm:px-8 h-10 sm:h-12 lg:h-14 m-1 text-sm sm:text-base font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 hover:scale-105 transition-transform duration-300"
            >
              Search
            </Button>
          </motion.div>

          {/* Trust Badges */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-4 lg:gap-6 text-xs sm:text-sm font-bold text-gray-600"
          >
            <span className="flex items-center gap-1.5 sm:gap-2 bg-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full shadow-sm border border-gray-100"><Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500" /> 100K+ Users</span>
            <span className="flex items-center gap-1.5 sm:gap-2 bg-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full shadow-sm border border-gray-100"><CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500" /> Verified Pros</span>
            <span className="flex items-center gap-1.5 sm:gap-2 bg-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full shadow-sm border border-gray-100"><Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-500" /> Secure</span>
          </motion.div>
        </div>

        {/* Right Column: Floating 3D Showcase (Visible on all sizes now) */}
        <div className="relative h-[320px] sm:h-[500px] lg:h-[600px] w-full perspective-1000 mt-2 sm:mt-8 lg:mt-0">
          
          {/* Center Main Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2, type: "spring" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-64 sm:w-72"
          >
            <Tilt tiltMaxAngleX={10} tiltMaxAngleY={10} scale={1.05} transitionSpeed={2000}>
              <div className="w-full bg-white p-3 sm:p-4 rounded-3xl shadow-2xl shadow-blue-900/20 border border-gray-100">
                <div className="relative w-full h-40 sm:h-48 rounded-2xl overflow-hidden mb-3 sm:mb-4 bg-gray-100">
                  <Image src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80" alt="Product" fill sizes="288px" className="object-cover" />
                  <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg text-[10px] sm:text-xs font-bold text-blue-600 shadow-sm">Top Rated</div>
                </div>
                <h3 className="font-bold text-gray-900 text-base sm:text-lg mb-1">MacBook Air M2</h3>
                <div className="flex items-center gap-1 mb-2 sm:mb-3">
                  <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-orange-400 text-orange-400" />
                  <span className="text-xs sm:text-sm font-bold text-gray-700">4.9</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="font-extrabold text-lg sm:text-xl text-blue-600">₹84,999</span>
                  <Button size="sm" className="bg-gray-900 text-white rounded-xl h-8 sm:h-9 text-xs sm:text-sm">Buy Now</Button>
                </div>
              </div>
            </Tilt>
          </motion.div>

          {/* Floating Service Card (Top Right) - Hidden on smallest mobile, visible on sm and up */}
          <motion.div 
            initial={{ opacity: 0, x: 50, y: -50 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 1, delay: 0.5, type: "spring" }}
            className="absolute top-0 right-0 lg:top-6 lg:right-6 xl:right-12 z-10 hidden sm:block"
          >
            <Tilt tiltMaxAngleX={15} tiltMaxAngleY={15} scale={1.05}>
              <div className="w-48 sm:w-56 bg-white/90 backdrop-blur-xl p-2 sm:p-3 rounded-2xl shadow-xl shadow-orange-500/10 border border-white">
                <div className="flex items-center gap-2 sm:gap-3 mb-2">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden relative bg-gray-100">
                    <Image src="https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=200&q=80" alt="Pro" fill sizes="40px" className="object-cover" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-gray-900">Sarah Jenkins</h4>
                    <p className="text-[10px] sm:text-xs text-orange-500 font-semibold">Interior Designer</p>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-1.5 sm:p-2 flex items-center justify-between">
                  <span className="text-[10px] sm:text-xs font-bold text-gray-600">From</span>
                  <span className="text-xs sm:text-sm font-extrabold text-blue-600">₹25,000</span>
                </div>
              </div>
            </Tilt>
          </motion.div>

          {/* Floating Stat Card (Bottom Left) - Hidden on smallest mobile */}
          <motion.div 
            initial={{ opacity: 0, x: -50, y: 50 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 1, delay: 0.7, type: "spring" }}
            className="absolute bottom-0 left-0 lg:bottom-12 lg:left-6 xl:left-12 z-30 hidden sm:block"
          >
            <Tilt tiltMaxAngleX={20} tiltMaxAngleY={20} scale={1.1}>
              <div className="bg-blue-600 p-3 sm:p-4 rounded-2xl shadow-2xl shadow-blue-600/30 text-white flex items-center gap-3 sm:gap-4 whitespace-nowrap">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-extrabold text-xl sm:text-2xl">100%</h4>
                  <p className="text-xs sm:text-sm text-blue-100 font-medium">Secure Payments</p>
                </div>
              </div>
            </Tilt>
          </motion.div>
          
        </div>

      </motion.div>
    </section>
  );
}
