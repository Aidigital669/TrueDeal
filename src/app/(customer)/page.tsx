"use client";

import { useState, useRef, useEffect } from "react";
import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
import { 
  Sparkles, Mic, MicOff, Paperclip, ArrowUp, Laptop, Home, 
  Building2, Store, ArrowRight, ShieldCheck, Loader2, Star,
  MapPin, ExternalLink, MessageSquare, Tag, ChevronRight,
  RefreshCw, Bot, CheckCircle2, Search, SlidersHorizontal
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SearchListingItem } from "@/app/api/search-listings/route";

export interface CompanyProfileData {
  name: string;
  ownerName?: string;
  businessType?: string;
  yearEstablished?: string;
  tagline?: string;
  about?: string;
  website?: string;
  portfolioUrl?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  gstin?: string;
  rating?: number;
  totalReviews?: number;
  logo?: string;
  services?: string[];
}

interface ChatMessage {
  role: "user" | "assistant";
  text: string;
  appliedFilters?: string[];
  suggestedFollowUps?: string[];
  listings?: SearchListingItem[];
  companyProfile?: CompanyProfileData;
}

export default function CustomerHome() {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [searching, setSearching] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Smooth Interactive Mouse Spotlight
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, searching]);

  // Voice Search (Web Speech API)
  const toggleVoiceSearch = () => {
    if (typeof window === "undefined") return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice recognition is not supported in this browser. Please use Chrome or Edge.");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = "en-IN";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const speechResult = event.results[0][0].transcript;
        if (speechResult) {
          setQuery(speechResult);
          handleSend(speechResult);
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.warn("Speech recognition error:", e);
      setIsListening(false);
    }
  };

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || query;
    if (!text.trim()) return;

    const userText = text.trim();
    setMessages(prev => [...prev, { role: "user", text: userText }]);
    setQuery("");
    setSearching(true);

    try {
      const res = await fetch("/api/search-listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: userText })
      });

      const rawText = await res.text();
      let data: any = null;
      try {
        data = rawText ? JSON.parse(rawText) : null;
      } catch (parseErr) {
        console.warn("JSON parse notice:", parseErr);
      }

      if (data && data.success) {
        setMessages(prev => [
          ...prev, 
          { 
            role: "assistant", 
            text: data.text || `Found listings matching "${userText}":`,
            appliedFilters: data.appliedFilters || ["✨ AI Verified"],
            suggestedFollowUps: data.suggestedFollowUps || [],
            listings: data.listings || [],
            companyProfile: data.companyProfile || undefined
          }
        ]);
      } else {
        setMessages(prev => [
          ...prev, 
          { 
            role: "assistant", 
            text: data?.text || "No exact matches found. Please try refining your keywords.",
            appliedFilters: ["⚡ Search Recovery"],
            suggestedFollowUps: [
              "Commercial office in Pune, Maharashtra",
              "Gaming laptops under ₹60,000",
              "Organic Ayurvedic wellness products"
            ],
            listings: data?.listings || [],
            companyProfile: data?.companyProfile || undefined
          }
        ]);
      }
    } catch (error) {
      console.error("Error sending query to search-listings API:", error);
      setMessages(prev => [
        ...prev, 
        { 
          role: "assistant", 
          text: "An error occurred while connecting to the AI search engine. Please try again.",
          appliedFilters: ["⚠️ Connection Offline"],
          suggestedFollowUps: ["Try again"],
          listings: [] 
        }
      ]);
    } finally {
      setSearching(false);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    setQuery("");
  };

  // Sweet Floating Star Sparkles
  const floatingStars = [
    { top: "12%", left: "15%", size: 18, delay: 0, color: "text-amber-400" },
    { top: "25%", right: "18%", size: 22, delay: 1.2, color: "text-pink-400" },
    { top: "65%", left: "10%", size: 20, delay: 0.8, color: "text-purple-400" },
    { top: "75%", right: "12%", size: 24, delay: 1.8, color: "text-cyan-400" },
    { top: "45%", left: "85%", size: 16, delay: 2.2, color: "text-indigo-400" },
    { top: "85%", left: "45%", size: 18, delay: 0.5, color: "text-emerald-400" },
  ];

  return (
    <div 
      onMouseMove={handleMouseMove}
      className="relative flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] w-full px-4 md:px-8 bg-gradient-to-b from-[#FDFBFB] via-[#F7F8FC] to-[#F1F4F9] py-12 lg:py-16 font-sans overflow-hidden"
    >
      
      {/* ========================================================= */}
      {/* SWEET & EYE-CATCHING FRAMER MOTION ANIMATED BACKGROUND */}
      {/* ========================================================= */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        
        {/* Orb 1: Sweet Cotton-Candy Lavender & Pink (Top-Left) */}
        <motion.div
          animate={{
            x: [0, 80, -40, 0],
            y: [0, -60, 40, 0],
            scale: [1, 1.25, 0.95, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -top-24 -left-20 w-[550px] h-[550px] bg-gradient-to-tr from-pink-300/40 via-purple-300/35 to-indigo-200/30 rounded-full blur-[90px] mix-blend-multiply"
        />

        {/* Orb 2: Sweet Sunset Peach & Honey Gold (Top-Right) */}
        <motion.div
          animate={{
            x: [0, -70, 50, 0],
            y: [0, 60, -40, 0],
            scale: [1.1, 0.9, 1.2, 1.1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1.5,
          }}
          className="absolute -top-20 -right-20 w-[500px] h-[500px] bg-gradient-to-bl from-amber-300/40 via-rose-300/35 to-orange-200/30 rounded-full blur-[85px] mix-blend-multiply"
        />

        {/* Orb 3: Sweet Mint & Sky Cyan Wave (Bottom-Left) */}
        <motion.div
          animate={{
            x: [0, 60, -60, 0],
            y: [0, -50, 50, 0],
            scale: [0.95, 1.2, 0.9, 0.95],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 3,
          }}
          className="absolute -bottom-24 -left-20 w-[600px] h-[600px] bg-gradient-to-br from-teal-300/40 via-cyan-300/35 to-emerald-200/30 rounded-full blur-[100px] mix-blend-multiply"
        />

        {/* Orb 4: Sweet Radiant Violet Beam (Center/Bottom-Right) */}
        <motion.div
          animate={{
            x: [0, -80, 40, 0],
            y: [0, 40, -60, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 19,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
          className="absolute bottom-[-10%] right-[-5%] w-[550px] h-[550px] bg-gradient-to-tl from-indigo-400/35 via-violet-300/30 to-fuchsia-200/25 rounded-full blur-[95px] mix-blend-multiply"
        />

        {/* Interactive Mouse Follower Glow Spotlight */}
        <motion.div
          style={{
            x: springX,
            y: springY,
          }}
          className="absolute -top-36 -left-36 w-72 h-72 bg-gradient-to-r from-pink-400/20 via-indigo-400/20 to-cyan-400/20 rounded-full blur-[60px] pointer-events-none -translate-x-1/2 -translate-y-1/2"
        />

        {/* Floating Twinkling Star Sparkles */}
        {floatingStars.map((star, idx) => (
          <motion.div
            key={idx}
            style={{ top: star.top, left: star.left, right: star.right }}
            animate={{
              y: [0, -18, 0],
              opacity: [0.3, 0.9, 0.3],
              scale: [0.8, 1.2, 0.8],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 5 + idx,
              repeat: Infinity,
              ease: "easeInOut",
              delay: star.delay,
            }}
            className={`absolute ${star.color} drop-shadow-sm pointer-events-none`}
          >
            <Sparkles size={star.size} />
          </motion.div>
        ))}

        {/* Sweet Subtle Polka Dot & Grid Texture */}
        <div className="absolute inset-0 bg-[radial-gradient(#6366f115_1px,transparent_1px)] [background-size:28px_28px] opacity-70" />
      </div>

      {/* ========================================================= */}
      {/* MAIN AI SEARCH & DISCOVERY INTERFACE */}
      {/* ========================================================= */}
      <div className="relative z-10 max-w-4xl w-full flex flex-col items-center text-center">
        
        {/* Animated Badge & Title with Sweet Gradient Text */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-6"
        >
          {/* Sweet Pill Badge */}
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 hover:bg-white border border-indigo-100 shadow-sm text-indigo-700 text-xs font-black mb-4 backdrop-blur-md cursor-pointer transition-all"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            <span className="tracking-wide">AI Smart Search & Discovery</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          </motion.div>

          {/* Sweet Heading with Multi-Color Gradient */}
          <h1 className="text-3xl sm:text-5xl lg:text-[52px] font-black tracking-tight text-gray-900 font-sans leading-[1.12]">
            AI Based Search{" "}
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent drop-shadow-xs">
              Your Products and Services
            </span>
          </h1>

          <p className="mt-3 text-sm sm:text-base text-gray-600 max-w-2xl mx-auto font-medium">
            Search physical products, professional services, commercial & residential properties across India with intelligent natural language AI.
          </p>
        </motion.div>

        {/* Conversation Stream (when messages exist) */}
        {messages.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full space-y-4 mb-6 text-left max-h-[520px] overflow-y-auto p-4 md:p-6 rounded-3xl bg-white/90 border border-indigo-100/90 shadow-xl shadow-indigo-500/5 backdrop-blur-2xl custom-scrollbar"
          >
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                <Bot className="w-4 h-4 text-indigo-600" />
                <span>TrueDeal AI Assistant</span>
              </div>
              <button 
                type="button" 
                onClick={handleClearChat}
                className="flex items-center gap-1 text-[11px] font-bold text-gray-400 hover:text-red-600 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Clear Chat</span>
              </button>
            </div>

            {messages.map((m, idx) => (
              <div 
                key={idx}
                className={`p-4 rounded-2xl text-xs font-semibold leading-relaxed transition-all ${
                  m.role === "user" 
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white ml-auto max-w-[80%] shadow-md shadow-indigo-600/20" 
                    : "bg-indigo-50/70 border border-indigo-100 text-gray-900 mr-auto w-full"
                }`}
              >
                {/* Assistant Applied Filter Badges */}
                {m.role === "assistant" && m.appliedFilters && m.appliedFilters.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap mb-2.5">
                    {m.appliedFilters.map((filter, fIdx) => (
                      <span 
                        key={fIdx}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white text-indigo-700 font-extrabold text-[10px] border border-indigo-200/80 shadow-xs"
                      >
                        {filter}
                      </span>
                    ))}
                  </div>
                )}

                {/* Message Body */}
                <p className="font-bold text-sm leading-relaxed mb-1">{m.text}</p>
                
                {/* Verified Company Profile & Owner Showcase Card */}
                {m.companyProfile && (
                  <div className="mt-3.5 mb-3.5 p-4 md:p-5 rounded-2xl bg-white border border-indigo-200 shadow-md shadow-indigo-500/5 space-y-3.5 animate-in fade-in slide-in-from-bottom-2 duration-200">
                    
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        {m.companyProfile.logo ? (
                          <img 
                            src={m.companyProfile.logo} 
                            alt={m.companyProfile.name} 
                            className="w-12 h-12 rounded-xl object-contain border border-gray-100 p-1 bg-gray-50 shrink-0" 
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white flex items-center justify-center font-black text-lg shrink-0 shadow-sm">
                            {m.companyProfile.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-black text-base text-gray-900">{m.companyProfile.name}</h3>
                            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-extrabold text-[10px] rounded-full border border-emerald-200">
                              ✨ Verified Enterprise
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-indigo-600 mt-0.5">
                            {m.companyProfile.tagline || m.companyProfile.businessType}
                          </p>
                        </div>
                      </div>

                      {m.companyProfile.rating && (
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-900 rounded-full text-xs font-black self-start sm:self-auto shrink-0">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                          <span>{m.companyProfile.rating} / 5.0 ({m.companyProfile.totalReviews || 24} Reviews)</span>
                        </div>
                      )}
                    </div>

                    {/* Key Owner & Company Highlights Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 text-xs">
                      {m.companyProfile.ownerName && (
                        <div className="p-2.5 rounded-xl bg-indigo-50/70 border border-indigo-100">
                          <span className="text-[10px] font-extrabold text-indigo-900 uppercase tracking-wider block">Owner & Leadership</span>
                          <span className="font-black text-gray-900 mt-0.5 block">{m.companyProfile.ownerName}</span>
                        </div>
                      )}

                      {m.companyProfile.address && (
                        <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                          <span className="text-[10px] font-extrabold text-gray-500 uppercase tracking-wider block">Headquarters / Location</span>
                          <span className="font-bold text-gray-800 mt-0.5 block truncate">{m.companyProfile.address}</span>
                        </div>
                      )}

                      {m.companyProfile.gstin && (
                        <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100">
                          <span className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider block">MahaRERA / Registration</span>
                          <span className="font-black text-emerald-950 mt-0.5 block">{m.companyProfile.gstin}</span>
                        </div>
                      )}
                    </div>

                    {/* About Description */}
                    {m.companyProfile.about && (
                      <p className="text-xs text-gray-700 leading-relaxed font-normal bg-gray-50/80 p-3 rounded-xl border border-gray-100">
                        {m.companyProfile.about}
                      </p>
                    )}

                    {/* Services / Specialities Offered */}
                    {m.companyProfile.services && m.companyProfile.services.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-extrabold text-gray-500 uppercase tracking-wider block">
                          Core Services & Specializations:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {m.companyProfile.services.map((srv, sIdx) => (
                            <span key={sIdx} className="px-2.5 py-1 bg-indigo-50 text-indigo-900 rounded-lg text-[10px] font-bold border border-indigo-100">
                              ⚡ {srv}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Quick Action Links & Portfolio Button */}
                    <div className="flex items-center gap-2 pt-2 border-t border-gray-100 flex-wrap">
                      {m.companyProfile.portfolioUrl && (
                        <Link href={m.companyProfile.portfolioUrl}>
                          <button
                            type="button"
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-3.5 py-2 rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                          >
                            <Store className="w-3.5 h-3.5" />
                            <span>View TrueDeal Portfolio</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </Link>
                      )}

                      {m.companyProfile.website && (
                        <a
                          href={m.companyProfile.website}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <button
                            type="button"
                            className="bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 font-bold text-xs px-3 py-2 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                          >
                            <ExternalLink className="w-3.5 h-3.5 text-purple-600" />
                            <span>Official Website</span>
                          </button>
                        </a>
                      )}

                      {m.companyProfile.phone && (
                        <a href={`tel:${m.companyProfile.phone.replace(/[^0-9+]/g, '')}`}>
                          <button
                            type="button"
                            className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs px-3 py-2 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                          >
                            <span>📞 {m.companyProfile.phone}</span>
                          </button>
                        </a>
                      )}

                      {m.companyProfile.whatsapp && (
                        <a
                          href={`https://wa.me/${m.companyProfile.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi ${m.companyProfile.name}, I am contacting you through TrueDeal AI Assistant.`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <button
                            type="button"
                            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-xs px-3 py-2 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                            <span>WhatsApp Chat</span>
                          </button>
                        </a>
                      )}
                    </div>

                  </div>
                )}

                {/* Dynamic Compact Listing Cards inside ChatGPT stream */}
                {m.listings && m.listings.length > 0 && (
                  <div className="mt-3.5 space-y-2.5">
                    {m.companyProfile && (
                      <div className="text-[11px] font-extrabold text-indigo-950 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Active Offerings & Services ({m.listings.length})</span>
                      </div>
                    )}
                    {m.listings.map((item) => (
                      <div 
                        key={item.id}
                        className="bg-white rounded-xl border border-gray-200 hover:border-indigo-400 p-2.5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 group"
                      >
                        {/* Compact Thumbnail Image & Category Tag */}
                        <div className="relative w-full sm:w-28 sm:h-24 h-32 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                          <img 
                            src={item.image} 
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <span className="absolute bottom-1.5 left-1.5 bg-black/75 backdrop-blur-md text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded">
                            {item.category}
                          </span>
                        </div>

                        {/* Details Body */}
                        <div className="flex-1 min-w-0 flex flex-col justify-between gap-1">
                          
                          {/* Title & Badge */}
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-extrabold text-xs text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                              {item.title}
                            </h4>
                            <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border shrink-0 ${item.badgeColor || "bg-emerald-50 text-emerald-700 border-emerald-200"}`}>
                              {item.badge}
                            </span>
                          </div>

                          {/* Location & Price Row */}
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <div className="flex items-center gap-1 text-[11px] font-semibold text-gray-600 truncate">
                              <MapPin className="w-3 h-3 text-red-500 shrink-0" />
                              <span className="truncate">{item.location}</span>
                            </div>

                            <div className="flex items-baseline gap-1.5">
                              <span className="text-xs sm:text-sm font-black text-indigo-700">
                                {item.price}
                              </span>
                              {item.originalPrice && (
                                <span className="text-[10px] font-semibold text-gray-400 line-through">
                                  {item.originalPrice}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Specs Badges & Description */}
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {item.specs && item.specs.slice(0, 3).map((spec, sIdx) => (
                              <span key={sIdx} className="bg-indigo-50/80 text-indigo-800 text-[9px] font-bold px-1.5 py-0.5 rounded border border-indigo-100">
                                {spec}
                              </span>
                            ))}
                          </div>

                          {/* Compact Action Buttons */}
                          <div className="flex items-center gap-2 pt-1 flex-wrap">
                            <Link href={item.link}>
                              <button 
                                type="button"
                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-[10px] px-2.5 py-1 rounded-lg shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                              >
                                <span>View Details</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            </Link>

                            {item.websiteUrl && (
                              <a 
                                href={item.websiteUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <button 
                                  type="button"
                                  className="bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 font-bold text-[10px] px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                                >
                                  <ExternalLink className="w-3 h-3 text-purple-600" />
                                  <span>Website</span>
                                </button>
                              </a>
                            )}

                            {item.whatsappUrl && (
                              <a 
                                href={item.whatsappUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <button 
                                  type="button"
                                  className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-[10px] px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                                >
                                  <MessageSquare className="w-3 h-3 text-emerald-600" />
                                  <span>WhatsApp</span>
                                </button>
                              </a>
                            )}
                          </div>

                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Interactive Suggested Follow-Up Chips */}
                {m.role === "assistant" && m.suggestedFollowUps && m.suggestedFollowUps.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-indigo-100/60 flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-extrabold text-gray-500 mr-1 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      Suggested:
                    </span>
                    {m.suggestedFollowUps.map((prompt, pIdx) => (
                      <button
                        key={pIdx}
                        type="button"
                        onClick={() => handleSend(prompt)}
                        className="bg-white hover:bg-indigo-600 hover:text-white text-indigo-900 border border-indigo-200 font-bold text-[10px] px-2.5 py-1 rounded-full transition-all duration-150 shadow-xs cursor-pointer hover:scale-105"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {searching && (
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 p-3 bg-indigo-50/80 rounded-2xl border border-indigo-100 animate-pulse">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                <span>AI is analyzing your query & evaluating marketplace matches...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </motion.div>
        )}

        {/* ChatGPT Style Floating Input Box with Sweet Rainbow Sheen */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: "easeOut" }}
          className="w-full relative mb-8 group"
        >
          {/* Animated Rainbow Border Glow */}
          <div className="absolute -inset-1 bg-gradient-to-r from-pink-500/30 via-purple-500/30 to-cyan-500/30 rounded-[32px] blur-lg opacity-60 group-hover:opacity-100 group-focus-within:opacity-100 transition duration-500" />

          {/* Frosted Glass Input Container */}
          <div className="relative bg-white/90 hover:bg-white/95 transition-all duration-300 rounded-3xl flex flex-col p-4 shadow-xl shadow-indigo-500/10 border border-white/90 focus-within:border-indigo-400 focus-within:ring-4 focus-within:ring-indigo-500/10 backdrop-blur-2xl">
            
            {/* Input Field */}
            <textarea 
              rows={2}
              placeholder="Ask AI Assistant: e.g. Show commercial offices in Pune under ₹5 Cr, Gaming laptops with RTX GPU, Ayurvedic hair oils, IT consulting services..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-sm font-medium text-gray-900 px-2 py-1 placeholder:text-gray-400 resize-none font-sans"
            />

            {/* Bottom Actions Row */}
            <div className="flex items-center justify-between mt-2 px-1">
              <div className="flex items-center gap-1.5">
                <Button 
                  type="button"
                  variant="ghost" 
                  size="icon" 
                  onClick={toggleVoiceSearch}
                  title={isListening ? "Listening... click to stop" : "Voice Search"}
                  className={`rounded-full h-8 w-8 transition-colors ${
                    isListening 
                      ? "bg-red-500 text-white animate-bounce" 
                      : "text-gray-400 hover:text-indigo-600 hover:bg-indigo-50"
                  }`}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </Button>
                {isListening && (
                  <span className="text-[11px] font-bold text-red-500 animate-pulse">
                    Listening...
                  </span>
                )}
              </div>
              
              {/* Send Button with Tactile Gradient */}
              <button 
                type="button"
                onClick={() => handleSend()}
                disabled={searching || !query.trim()}
                className="bg-gradient-to-tr from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-30 text-white rounded-full h-9 w-9 transition-all flex items-center justify-center shadow-md shadow-indigo-600/30 hover:scale-105 active:scale-95 cursor-pointer font-bold"
              >
                <ArrowUp className="w-4 h-4 stroke-[3]" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Suggestion Grid with Sweet Interactive Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.25, ease: "easeOut" }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-4xl text-left font-sans"
        >
          <SuggestionCard 
            icon={<Building2 className="w-4 h-4 text-indigo-600" />} 
            badge="Properties"
            badgeColor="bg-indigo-50 text-indigo-700 border-indigo-200"
            title="Commercial Offices in Pune, Maharashtra" 
            subtitle="Magarpatta IT Park & Undri Commercial (MahaRERA)" 
            onClick={() => handleSend("Commercial office space in Pune, Maharashtra")}
          />
          <SuggestionCard 
            icon={<Laptop className="w-4 h-4 text-pink-600" />} 
            badge="Electronics"
            badgeColor="bg-pink-50 text-pink-700 border-pink-200"
            title="Gaming Laptops & IT Hardware" 
            subtitle="Quantum Pro X1 & ASUS ROG Workstations under ₹60K" 
            onClick={() => handleSend("Gaming laptop under ₹60K with RTX GPU")}
          />
          <SuggestionCard 
            icon={<Sparkles className="w-4 h-4 text-emerald-600" />} 
            badge="Wellness"
            badgeColor="bg-emerald-50 text-emerald-700 border-emerald-200"
            title="Organic Ayurvedic & Healthcare Products" 
            subtitle="100% Certified natural wellness, skincare & herbal health" 
            onClick={() => handleSend("Ayurvedic herbal wellness and healthcare products")}
          />
          <SuggestionCard 
            icon={<Store className="w-4 h-4 text-purple-600" />} 
            badge="Services"
            badgeColor="bg-purple-50 text-purple-700 border-purple-200"
            title="Corporate Consulting & IT Services" 
            subtitle="Full-stack software, digital marketing & business suites" 
            onClick={() => handleSend("Corporate IT and digital consulting services")}
          />
        </motion.div>

      </div>
    </div>
  );
}

function SuggestionCard({ 
  icon, 
  title, 
  subtitle, 
  badge,
  badgeColor,
  onClick 
}: { 
  icon: React.ReactNode; 
  title: string; 
  subtitle: string; 
  badge?: string;
  badgeColor?: string;
  onClick?: () => void;
}) {
  return (
    <motion.div 
      whileHover={{ y: -3, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="flex flex-col items-start gap-1 bg-white/85 hover:bg-white border border-white/80 hover:border-indigo-300 p-4 rounded-2xl cursor-pointer transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 group backdrop-blur-md relative overflow-hidden"
    >
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-gray-50/80 border border-gray-100 group-hover:bg-indigo-50 group-hover:border-indigo-200 transition-colors">
            {icon}
          </div>
          <span className="font-bold text-gray-900 group-hover:text-indigo-600 text-xs tracking-tight transition-colors">
            {title}
          </span>
        </div>
        {badge && (
          <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${badgeColor}`}>
            {badge}
          </span>
        )}
      </div>
      <span className="text-gray-500 text-[11px] font-medium pl-10">{subtitle}</span>
    </motion.div>
  );
}
