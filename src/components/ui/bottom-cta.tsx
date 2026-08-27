"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Rocket, Sparkles } from "lucide-react";

export function BottomCta() {
  return (
    <section className="w-full px-4 md:px-8 lg:px-12 mb-16 relative z-10">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-indigo-900 via-primary to-purple-900 p-12 md:p-20 text-center shadow-2xl shadow-primary/20"
      >
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-[100px] mix-blend-overlay" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-fuchsia-500/20 rounded-full blur-[100px]" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] mix-blend-overlay" />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mb-8 w-20 h-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 shadow-[0_0_30px_rgba(255,255,255,0.1)]"
          >
            <Rocket className="w-10 h-10 text-white" />
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-4xl md:text-5xl font-extrabold text-white mb-6 tracking-tight"
          >
            Turn your skills or products <br className="hidden md:block"/> into an empire.
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-lg md:text-xl text-indigo-100 mb-10 font-light"
          >
            Join thousands of independent sellers and professionals growing their businesses on TrueDeal. Easy setup, industry-low fees, and a dedicated global audience.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full"
          >
            <Button className="w-full sm:w-auto bg-white hover:bg-gray-100 text-indigo-950 font-bold px-8 h-14 rounded-xl text-lg shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:scale-105 transition-all duration-300">
              Start Selling Products
            </Button>
            <Button className="w-full sm:w-auto bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white font-bold px-8 h-14 rounded-xl text-lg hover:scale-105 transition-all duration-300 flex items-center gap-2">
              <Sparkles className="w-5 h-5" /> Offer a Service
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
