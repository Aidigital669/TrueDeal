"use client";

import { motion } from "framer-motion";
import { ShoppingCart, User, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Tilt from "react-parallax-tilt";

export function ActionBanners() {
  return (
    <section className="w-full px-4 md:px-8 lg:px-12 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Buy Products Banner */}
        <Tilt tiltMaxAngleX={5} tiltMaxAngleY={5} perspective={1000} scale={1.02} transitionSpeed={2000}>
          <motion.div 
            className="group relative overflow-hidden rounded-[2rem] h-[360px] flex flex-col justify-end p-10 shadow-2xl shadow-indigo-900/10 transition-all duration-500"
          >
            {/* Background Image & Overlays */}
            <div className="absolute inset-0 z-0">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80')] bg-cover bg-center transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent" />
              <div className="absolute inset-0 bg-indigo-900/40 mix-blend-multiply" />
            </div>

            <div className="relative z-10">
              <div className="mb-6 w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-lg group-hover:bg-primary/20 transition-colors duration-300 transform group-hover:-translate-y-2">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-4xl font-extrabold text-white mb-3 tracking-tight transform group-hover:translate-x-2 transition-transform duration-300">Buy Products</h2>
              <p className="text-gray-300 mb-8 max-w-sm text-lg leading-relaxed font-light transform group-hover:translate-x-2 transition-transform duration-300 delay-75">
                Shop from verified sellers offering high-quality, premium goods.
              </p>
              <Button className="w-fit bg-white text-indigo-950 hover:bg-gray-100 font-bold px-8 py-6 rounded-full shadow-[0_8px_30px_rgb(255,255,255,0.2)] group-hover:shadow-[0_8px_30px_rgb(255,255,255,0.4)] transition-all duration-300 flex items-center gap-2 transform group-hover:translate-x-2 delay-100">
                Shop Now <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        </Tilt>

        {/* Hire Experts Banner */}
        <Tilt tiltMaxAngleX={5} tiltMaxAngleY={5} perspective={1000} scale={1.02} transitionSpeed={2000}>
          <motion.div 
            className="group relative overflow-hidden rounded-[2rem] h-[360px] flex flex-col justify-end p-10 shadow-2xl shadow-purple-900/10 transition-all duration-500"
          >
            {/* Background Image & Overlays */}
            <div className="absolute inset-0 z-0">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1556761175-4b46a572b786?w=1200&q=80')] bg-cover bg-center transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-purple-950 via-purple-900/90 to-transparent" />
              <div className="absolute inset-0 bg-primary/40 mix-blend-multiply" />
            </div>

            <div className="relative z-10">
              <div className="mb-6 w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-lg group-hover:bg-white/20 transition-colors duration-300 transform group-hover:-translate-y-2">
                <User className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-4xl font-extrabold text-white mb-3 tracking-tight transform group-hover:translate-x-2 transition-transform duration-300">Hire Experts</h2>
              <p className="text-purple-100 mb-8 max-w-sm text-lg leading-relaxed font-light transform group-hover:translate-x-2 transition-transform duration-300 delay-75">
                Connect with top-rated professionals for your next big project.
              </p>
              <Button className="w-fit bg-primary text-white hover:bg-primary/90 font-bold px-8 py-6 rounded-full shadow-[0_8px_30px_rgba(168,85,247,0.4)] group-hover:shadow-[0_8px_30px_rgba(168,85,247,0.6)] transition-all duration-300 flex items-center gap-2 transform group-hover:translate-x-2 delay-100">
                Hire a Pro <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        </Tilt>

      </div>
    </section>
  );
}
