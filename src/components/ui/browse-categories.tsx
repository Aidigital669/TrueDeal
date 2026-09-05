"use client";

import { motion, Variants } from "framer-motion";
import Tilt from "react-parallax-tilt";
import { Laptop, Shirt, Armchair, Car, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const categories = [
  {
    icon: Laptop,
    name: "Electronics",
    description: "Gadgets & Devices",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "group-hover:border-blue-200",
    shadowColor: "group-hover:shadow-blue-500/20"
  },
  {
    icon: Shirt,
    name: "Fashion",
    description: "Clothing & Apparel",
    color: "text-orange-500",
    bgColor: "bg-orange-50",
    borderColor: "group-hover:border-orange-200",
    shadowColor: "group-hover:shadow-orange-500/20"
  },
  {
    icon: Armchair,
    name: "Furniture",
    description: "Home & Decor",
    color: "text-sky-500",
    bgColor: "bg-sky-50",
    borderColor: "group-hover:border-sky-200",
    shadowColor: "group-hover:shadow-sky-500/20"
  },
  {
    icon: Car,
    name: "Vehicles",
    description: "Cars & Bikes",
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
    borderColor: "group-hover:border-indigo-200",
    shadowColor: "group-hover:shadow-indigo-500/20"
  }
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const }
  }
};

export function BrowseCategories() {
  return (
    <section className="w-full px-4 md:px-8 lg:px-12 py-16 relative overflow-hidden">
      {/* Decorative Background Blur */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100/50 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-50/50 rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">
            Browse Categories
          </h2>
          <p className="text-gray-500 font-medium max-w-lg">
            Explore thousands of products and services across our top-rated categories.
          </p>
        </div>
        <button className="text-blue-600 font-semibold hover:text-blue-700 flex items-center gap-1 group transition-colors">
          View All Categories
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {categories.map((cat, i) => {
          const Icon = cat.icon;
          return (
            <motion.div key={i} variants={itemVariants}>
              <Tilt
                tiltMaxAngleX={8}
                tiltMaxAngleY={8}
                scale={1.02}
                transitionSpeed={2000}
                className="h-full"
              >
                <Card className={`group h-full cursor-pointer transition-all duration-300 border-transparent bg-white/60 backdrop-blur-md shadow-lg hover:shadow-xl ${cat.borderColor} ${cat.shadowColor} overflow-hidden`}>
                  <CardContent className="p-8 flex flex-col items-center text-center relative z-10">
                    <div className={`w-16 h-16 rounded-2xl ${cat.bgColor} flex items-center justify-center mb-6 transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-inner`}>
                      <Icon className={`w-8 h-8 ${cat.color}`} strokeWidth={1.5} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-sm text-gray-500 font-medium">
                      {cat.description}
                    </p>
                  </CardContent>
                  
                  {/* Hover Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0 pointer-events-none" />
                </Card>
              </Tilt>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}
