"use client";

import { motion, Variants } from "framer-motion";
import { Shield, CheckCircle2, HeadphonesIcon } from "lucide-react";

export function TrustStats() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
  };

  return (
    <section className="w-full px-4 md:px-8 lg:px-12 py-16">
      <div className="max-w-7xl mx-auto bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/40 p-10 lg:p-16 relative overflow-hidden">
        
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3" />

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="relative z-10"
        >
          {/* Top Row: Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 justify-items-center mb-16">
            <motion.div variants={itemVariants} className="flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-50 rounded-2xl flex items-center justify-center shadow-sm border border-purple-100/50">
                <CheckCircle2 className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-gray-900 mb-1">Verified Sellers</h4>
                <p className="text-sm text-gray-500 font-medium">Strictly vetted professionals only</p>
              </div>
            </motion.div>
            
            <motion.div variants={itemVariants} className="flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-50 rounded-2xl flex items-center justify-center shadow-sm border border-blue-100/50">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-gray-900 mb-1">Secure Payment</h4>
                <p className="text-sm text-gray-500 font-medium">100% protected escrow checkout</p>
              </div>
            </motion.div>
            
            <motion.div variants={itemVariants} className="flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-2xl flex items-center justify-center shadow-sm border border-emerald-100/50">
                <HeadphonesIcon className="w-8 h-8 text-emerald-600" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-gray-900 mb-1">24/7 Support</h4>
                <p className="text-sm text-gray-500 font-medium">Always here to help you succeed</p>
              </div>
            </motion.div>
          </div>

          <hr className="border-gray-100 mb-16" />

          {/* Bottom Row: Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <motion.div variants={itemVariants}>
              <div className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-gray-900 to-gray-600 mb-3 tracking-tight">15K+</div>
              <div className="text-xs md:text-sm font-bold tracking-widest text-gray-400 uppercase">Vendors & Pros</div>
            </motion.div>
            <motion.div variants={itemVariants}>
              <div className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-primary to-purple-600 mb-3 tracking-tight">100K+</div>
              <div className="text-xs md:text-sm font-bold tracking-widest text-primary/60 uppercase">Products & Services</div>
            </motion.div>
            <motion.div variants={itemVariants}>
              <div className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-gray-900 to-gray-600 mb-3 tracking-tight">2M+</div>
              <div className="text-xs md:text-sm font-bold tracking-widest text-gray-400 uppercase">Happy Clients</div>
            </motion.div>
            <motion.div variants={itemVariants}>
              <div className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-gray-900 to-gray-600 mb-3 tracking-tight">100%</div>
              <div className="text-xs md:text-sm font-bold tracking-widest text-gray-400 uppercase">Secure Platform</div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
