"use client";

import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

export function FaqSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  const faqs = [
    {
      question: "How do I buy products and hire experts?",
      answer: "You can simply browse our categories or use the search bar. Once you find a product or service you like, add it to your cart or click book to initiate the process with the seller. All transactions are protected by our secure escrow system."
    },
    {
      question: "Is my payment secure?",
      answer: "Yes, all payments are processed through Razorpay using industry-standard 256-bit encryption. Funds are securely held in escrow and only released to sellers once you are completely satisfied with the delivery."
    },
    {
      question: "How do I become a seller or service provider?",
      answer: "Click on the 'Sell / Offer' button on the top right, complete your vendor profile, and our moderation team will review your application within 24 hours. Once approved, you can start listing immediately."
    },
    {
      question: "What is the difference between a product and a service on TrueDeal?",
      answer: "Products are physical or digital goods that you buy outright and own. Services are professional engagements (like design, consulting, or home repair) that are booked based on time, milestones, or project scope."
    }
  ];

  return (
    <section className="relative w-full px-4 md:px-8 lg:px-12 py-24 bg-slate-50/50 overflow-hidden">
      {/* Decorative background circle */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-50 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      
      <div className="w-full mx-auto relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="w-16 h-16 bg-white shadow-sm border border-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <HelpCircle className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">Got questions? We've got answers.</h2>
          <p className="text-lg text-gray-500 max-w-4xl mx-auto">
            Everything you need to know about buying, selling, and hiring on the TrueDeal marketplace.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <Accordion type="single" collapsible={"true" as any} className="w-full space-y-4">
            {faqs.map((faq, index) => (
              <motion.div key={index} variants={itemVariants}>
                <AccordionItem 
                  value={`item-${index}`} 
                  className="bg-white border border-gray-100 rounded-2xl px-6 shadow-sm hover:shadow-md transition-shadow data-[state=open]:border-primary/20 data-[state=open]:shadow-primary/5"
                >
                  <AccordionTrigger className="text-left text-base md:text-lg font-semibold text-gray-800 hover:no-underline py-6">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600 text-base leading-relaxed pb-6">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
