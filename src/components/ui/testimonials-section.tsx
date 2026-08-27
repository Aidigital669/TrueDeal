"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const testimonials = [
  {
    rating: 5,
    text: "The seamless experience of finding a top-tier web designer was incredible. The quality of work exceeded all my expectations, and the escrow system made me feel completely secure.",
    author: "James T.",
    role: "Buyer - Hired for Web Design",
    avatarInitial: "JT",
    avatarBg: "bg-blue-100 text-blue-700",
  },
  {
    rating: 5,
    text: "TrueDeal has completely transformed how I reach new clients. The built-in tools provided make managing my services effortless and highly profitable. Best platform for freelancers!",
    author: "Sarah M.",
    role: "Verified Pro - Freelance Consultant",
    avatarInitial: "SM",
    avatarBg: "bg-purple-100 text-purple-700",
  },
  {
    rating: 5,
    text: "I purchased premium headphones and the entire transaction was smooth. Communication with the vendor was instant, and shipping was incredibly fast. Highly recommend!",
    author: "Priya R.",
    role: "Buyer - Purchased Headphones",
    avatarInitial: "PR",
    avatarBg: "bg-emerald-100 text-emerald-700",
  },
];

export function TestimonialsSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  return (
    <section className="relative w-full px-4 md:px-8 lg:px-12 py-24 bg-white overflow-hidden">
      {/* Decorative Gradient Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[1000px] h-[500px] bg-gradient-to-r from-primary/5 via-purple-500/5 to-blue-500/5 blur-[80px] rounded-full pointer-events-none z-0" />
      
      <div className="relative z-10 w-full mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
            What Our Community Says
          </h2>
          <p className="text-lg text-gray-500 font-medium">
            Join thousands of satisfied buyers and sellers on TrueDeal.
          </p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {testimonials.map((t, idx) => (
            <motion.div 
              key={idx} 
              variants={cardVariants}
              whileHover={{ y: -5 }}
              className="relative bg-white rounded-3xl p-8 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 group"
            >
              <Quote className="absolute top-6 right-8 w-12 h-12 text-gray-100 group-hover:text-primary/10 transition-colors duration-300 z-0" />
              
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                  <div className="flex gap-1 mb-6">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-gray-700 text-base md:text-lg leading-relaxed mb-8 font-medium">
                    "{t.text}"
                  </p>
                </div>
                
                <div className="flex items-center gap-4 border-t pt-6">
                  <Avatar className="w-12 h-12 border-2 border-white shadow-sm">
                    <AvatarFallback className={`font-bold ${t.avatarBg}`}>
                      {t.avatarInitial}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-bold text-gray-900">{t.author}</div>
                    <div className="text-xs font-semibold text-primary uppercase tracking-wide mt-1">
                      {t.role}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
