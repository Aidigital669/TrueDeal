"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Plus,
  Search,
  MessageSquare,
  Trash2,
  Edit2,
  Check,
  X,
  Pin,
  PinOff,
  Send,
  Mic,
  MicOff,
  ChevronRight,
  PanelLeftClose,
  PanelLeft,
  Bot,
  User,
  Copy,
  Volume2,
  RotateCcw,
  ExternalLink,
  Phone,
  MessageCircle,
  ShieldCheck,
  Loader2,
  Sun,
  Moon,
  Eye,
  ChevronDown,
  LogIn,
  LogOut,
  CheckCircle2,
  Building2,
  Leaf,
  Laptop,
  Store
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { logoutUserAction } from "@/lib/auth-actions";
import { Intro3DAnimation } from "@/components/intro/Intro3DAnimation";

export type ThemeMode = "dark" | "light" | "eye-comfort";

export interface ChatSession {
  sessionId: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  isPinned?: boolean;
  messageCount: number;
  lastMessageSnippet?: string;
}

export interface ChatMessage {
  _id?: string;
  sessionId: string;
  role: "user" | "assistant" | "system";
  content: string;
  metadata?: {
    appliedFilters?: string[];
    suggestedFollowUps?: string[];
    listings?: any[];
    companyProfile?: any;
  };
  createdAt?: string;
}

interface ChatGPTInterfaceProps {
  initialSessionId?: string;
  currentUser?: {
    name: string;
    email: string;
    role?: string;
  } | null;
}

const themeStyles = {
  dark: {
    appBg: "bg-[#202123] text-gray-100",
    sidebarBg: "bg-[#171717] border-[#2d2d2d]",
    sidebarBorder: "border-[#262626]",
    sidebarHeaderBtn: "hover:bg-[#212121] text-white",
    sidebarNewChat: "bg-[#212121] hover:bg-[#2a2a2a] text-white border-[#333333]",
    sidebarSearch: "bg-[#212121] text-gray-200 border-transparent focus:border-[#444] placeholder-gray-400",
    sidebarItem: "text-gray-400 hover:text-gray-200 hover:bg-[#1f1f1f]",
    sidebarItemActive: "bg-[#262626] text-white font-semibold border-l-2 border-indigo-500",
    sidebarFooter: "border-[#262626]",
    sidebarUserTile: "bg-[#212121] border-[#2c2c2c] text-gray-200",
    headerBg: "bg-[#212121]/95 border-[#2d2d2d]",
    headerPill: "bg-[#2a2a2a] hover:bg-[#333333] border-[#383838] text-gray-200",
    mainBg: "bg-[#212121]",
    headingText: "text-white",
    subText: "text-gray-400",
    inputBox: "bg-[#2f2f2f] border-[#3f3f3f] focus-within:border-[#666] text-white shadow-xl shadow-black/20",
    inputPlaceholder: "placeholder-gray-400",
    chipBtn: "bg-[#2a2a2a] hover:bg-[#333333] text-gray-300 hover:text-white border-[#383838]",
    userBubble: "bg-[#2f2f2f] hover:bg-[#343434] text-white border-[#3e3e3e]",
    assistantText: "text-gray-200",
    assistantListingCard: "bg-[#262626] border-[#333333] text-white hover:border-indigo-500/50",
    assistantListingTitle: "text-white group-hover:text-indigo-300",
    assistantListingPrice: "text-white",
    assistantListingAction: "border-[#333]",
    assistantViewBtn: "bg-[#333] hover:bg-[#3d3d3d] text-gray-200",
    thinkingBox: "bg-[#262626] border-[#333] text-gray-300",
    disclaimerText: "text-gray-400",
    sendBtnActive: "bg-white text-black hover:bg-gray-200",
    sendBtnDisabled: "bg-[#404040] text-gray-500 cursor-not-allowed"
  },
  light: {
    appBg: "bg-[#F9FAFB] text-gray-900",
    sidebarBg: "bg-[#F3F4F6] border-gray-200",
    sidebarBorder: "border-gray-200",
    sidebarHeaderBtn: "hover:bg-white text-gray-900",
    sidebarNewChat: "bg-white hover:bg-gray-50 text-gray-900 border-gray-200 shadow-xs",
    sidebarSearch: "bg-white text-gray-900 border-gray-200 focus:border-indigo-400 placeholder-gray-400 shadow-xs",
    sidebarItem: "text-gray-600 hover:text-gray-900 hover:bg-gray-200/70",
    sidebarItemActive: "bg-white text-indigo-700 font-bold border border-gray-200 shadow-xs border-l-2 border-l-indigo-600",
    sidebarFooter: "border-gray-200",
    sidebarUserTile: "bg-white border-gray-200 text-gray-900 shadow-xs",
    headerBg: "bg-white/95 border-gray-200",
    headerPill: "bg-gray-100 hover:bg-gray-200 border-gray-200 text-gray-800",
    mainBg: "bg-[#FFFFFF]",
    headingText: "text-gray-900",
    subText: "text-gray-500",
    inputBox: "bg-white border-gray-300 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100/50 text-gray-900 shadow-xl shadow-gray-200/60",
    inputPlaceholder: "placeholder-gray-400",
    chipBtn: "bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-900 border-gray-200 shadow-xs",
    userBubble: "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xs border-transparent",
    assistantText: "text-gray-800",
    assistantListingCard: "bg-white border-gray-200 text-gray-900 shadow-xs hover:border-indigo-300",
    assistantListingTitle: "text-gray-900 group-hover:text-indigo-600",
    assistantListingPrice: "text-gray-900",
    assistantListingAction: "border-gray-100",
    assistantViewBtn: "bg-gray-100 hover:bg-gray-200 text-gray-800",
    thinkingBox: "bg-gray-50 border-gray-200 text-gray-700",
    disclaimerText: "text-gray-500",
    sendBtnActive: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm",
    sendBtnDisabled: "bg-gray-200 text-gray-400 cursor-not-allowed"
  },
  "eye-comfort": {
    appBg: "bg-[#F7F2E7] text-[#2C241B]",
    sidebarBg: "bg-[#EFE7D8] border-[#DECFA9]/70",
    sidebarBorder: "border-[#DECFA9]",
    sidebarHeaderBtn: "hover:bg-[#FAF6EE] text-[#2C241B]",
    sidebarNewChat: "bg-[#FAF6EE] hover:bg-[#FDFBF7] text-[#2C241B] border-[#DECFA9] shadow-xs",
    sidebarSearch: "bg-[#FAF6EE] text-[#2C241B] border-[#DECFA9] focus:border-[#B59C75] placeholder-[#8C7D6B] shadow-xs",
    sidebarItem: "text-[#5C5042] hover:text-[#2C241B] hover:bg-[#E5DCB8]/60",
    sidebarItemActive: "bg-[#FAF6EE] text-[#634825] font-bold border border-[#DECFA9] shadow-xs border-l-2 border-l-[#8B6B3E]",
    sidebarFooter: "border-[#DECFA9]",
    sidebarUserTile: "bg-[#FAF6EE] border-[#DECFA9] text-[#2C241B] shadow-xs",
    headerBg: "bg-[#FAF6EE]/95 border-[#DECFA9]",
    headerPill: "bg-[#EFE7D8] hover:bg-[#E8DFCE] border-[#DECFA9] text-[#3D3224]",
    mainBg: "bg-[#FAF6EE]",
    headingText: "text-[#2C241B]",
    subText: "text-[#6E6050]",
    inputBox: "bg-[#FAF6EE] border-[#D6C49C] focus-within:border-[#9E835E] focus-within:ring-2 focus-within:ring-[#EDE1C8] text-[#2C241B] shadow-lg shadow-[#DECFA9]/40",
    inputPlaceholder: "placeholder-[#8C7D6B]",
    chipBtn: "bg-[#FAF6EE] hover:bg-[#F3ECE0] text-[#42372B] hover:text-[#1F1912] border-[#DECFA9] shadow-xs",
    userBubble: "bg-[#5A4533] text-[#FAF6EE] shadow-xs border-transparent",
    assistantText: "text-[#332A20]",
    assistantListingCard: "bg-[#FAF6EE] border-[#DECFA9] text-[#2C241B] shadow-xs hover:border-[#9E835E]",
    assistantListingTitle: "text-[#2C241B] group-hover:text-[#7A582E]",
    assistantListingPrice: "text-[#2C241B]",
    assistantListingAction: "border-[#DECFA9]",
    assistantViewBtn: "bg-[#EFE7D8] hover:bg-[#E5DCB8] text-[#3D3224]",
    thinkingBox: "bg-[#EFE7D8] border-[#DECFA9] text-[#42372B]",
    disclaimerText: "text-[#7A6C5B]",
    sendBtnActive: "bg-[#7A582E] text-white hover:bg-[#684924] shadow-sm",
    sendBtnDisabled: "bg-[#E2D6C0] text-[#A69784] cursor-not-allowed"
  }
};

export function ChatGPTInterface({ initialSessionId, currentUser }: ChatGPTInterfaceProps) {
  const router = useRouter();

  // Powerful 3D Eye-Catching Intro Animation on arrival
  const [showIntro, setShowIntro] = useState(true);

  // Themes: "dark" | "light" | "eye-comfort"
  const [theme, setTheme] = useState<ThemeMode>("dark");

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem("truedeal_chat_theme") as ThemeMode;
      if (savedTheme && ["dark", "light", "eye-comfort"].includes(savedTheme)) {
        setTheme(savedTheme);
      }
    } catch {}
  }, []);

  const handleThemeChange = (newTheme: ThemeMode) => {
    setTheme(newTheme);
    try {
      localStorage.setItem("truedeal_chat_theme", newTheme);
    } catch {}
  };

  const t = themeStyles[theme];

  // Sessions and active conversation state
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(initialSessionId || null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loadingSessions, setLoadingSessions] = useState(true);

  // Search in sessions
  const [historySearch, setHistorySearch] = useState("");

  // UI Controls
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editTitleText, setEditTitleText] = useState("");

  // Input state
  const [inputQuery, setInputQuery] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null);

  // Guest search limit state: 1 free search allowed for anonymous guests
  const [showLoginRequiredModal, setShowLoginRequiredModal] = useState(false);
  const [guestSearchCount, setGuestSearchCount] = useState<number>(0);

  // User logout state
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logoutUserAction();
      router.refresh();
      window.location.href = "/";
    } catch (err) {
      console.error("Logout failed:", err);
      setIsLoggingOut(false);
    }
  };

  useEffect(() => {
    try {
      const stored = localStorage.getItem("truedeal_guest_search_count");
      if (stored) {
        setGuestSearchCount(parseInt(stored, 10) || 0);
      }
    } catch {}
  }, []);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  // Load chat sessions from MongoDB on mount
  const fetchSessions = async () => {
    try {
      setLoadingSessions(true);
      const res = await fetch("/api/chat/sessions");
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.sessions)) {
          setSessions(data.sessions);
        }
      }
    } catch (err) {
      console.error("Failed to load chat history:", err);
    } finally {
      setLoadingSessions(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  // Load messages whenever activeSessionId changes
  useEffect(() => {
    if (!activeSessionId) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      try {
        setLoadingMessages(true);
        const res = await fetch(`/api/chat/sessions/${activeSessionId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.messages)) {
            setMessages(data.messages);
          }
        }
      } catch (err) {
        console.error("Failed to load session messages:", err);
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchMessages();
  }, [activeSessionId]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isGenerating]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [inputQuery]);

  // Handle Speech Recognition
  const toggleVoiceSearch = () => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

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
          setInputQuery(speechResult);
          handleSendMessage(speechResult);
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

  // Send message
  const handleSendMessage = async (customText?: string) => {
    const textToSend = (customText || inputQuery).trim();
    // If user is not logged in and has already received 1 search with answer, require login for next search!
    const assistantMessagesCount = messages.filter(m => m.role === "assistant").length;
    if (!currentUser && assistantMessagesCount >= 1) {
      setShowLoginRequiredModal(true);
      return;
    }

    setInputQuery("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    // Add optimistic user message
    const tempUserMsg: ChatMessage = {
      sessionId: activeSessionId || "",
      role: "user",
      content: textToSend,
      createdAt: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempUserMsg]);
    setIsGenerating(true);

    try {
      const res = await fetch("/api/chat/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: activeSessionId || undefined,
          message: textToSend
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          // If this was a new session, update active ID and refresh session list
          if (!activeSessionId || activeSessionId !== data.sessionId) {
            setActiveSessionId(data.sessionId);
            if (window.history && window.history.pushState) {
              window.history.pushState({}, "", `/chat/${data.sessionId}`);
            }
          }

          // Replace or add assistant message
          setMessages(prev => {
            const filtered = prev.filter(m => m !== tempUserMsg);
            return [...filtered, data.userMessage, data.assistantMessage];
          });

          // Refresh sessions list
          fetchSessions();

          // Guest 1-time search limit tracking:
          if (!currentUser) {
            const nextCount = guestSearchCount + 1;
            setGuestSearchCount(nextCount);
            try {
              localStorage.setItem("truedeal_guest_search_count", nextCount.toString());
            } catch {}
          }
        } else {
          setMessages(prev => [
            ...prev,
            {
              sessionId: activeSessionId || "",
              role: "assistant",
              content: data.error || "Sorry, I encountered an issue processing your query.",
              createdAt: new Date().toISOString()
            }
          ]);
        }
      } else {
        setMessages(prev => [
          ...prev,
          {
            sessionId: activeSessionId || "",
            role: "assistant",
            content: "Sorry, I couldn't reach the search service. Please try again in a moment.",
            createdAt: new Date().toISOString()
          }
        ]);
      }
    } catch (err: any) {
      console.error("Chat error:", err);
      setMessages(prev => [
        ...prev,
        {
          sessionId: activeSessionId || "",
          role: "assistant",
          content: "Network error occurred while connecting to TrueDeal AI.",
          createdAt: new Date().toISOString()
        }
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  // Create New Chat
  const handleStartNewChat = () => {
    setActiveSessionId(null);
    setMessages([]);
    setInputQuery("");
    if (window.history && window.history.pushState) {
      window.history.pushState({}, "", "/");
    }
    setIsMobileSidebarOpen(false);
  };

  // Rename session
  const handleSaveRename = async (sessionId: string) => {
    if (!editTitleText.trim()) {
      setEditingSessionId(null);
      return;
    }

    try {
      const res = await fetch(`/api/chat/sessions/${sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editTitleText.trim() })
      });

      if (res.ok) {
        setSessions(prev =>
          prev.map(s => (s.sessionId === sessionId ? { ...s, title: editTitleText.trim() } : s))
        );
      }
    } catch (err) {
      console.error("Failed to rename session:", err);
    } finally {
      setEditingSessionId(null);
    }
  };

  // Toggle Pin
  const handleTogglePin = async (sessionId: string, currentPin?: boolean) => {
    try {
      const res = await fetch(`/api/chat/sessions/${sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPinned: !currentPin })
      });

      if (res.ok) {
        setSessions(prev =>
          prev.map(s => (s.sessionId === sessionId ? { ...s, isPinned: !currentPin } : s))
        );
      }
    } catch (err) {
      console.error("Failed to pin session:", err);
    }
  };

  // Delete session
  const handleDeleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this chat?")) return;

    try {
      const res = await fetch(`/api/chat/sessions/${sessionId}`, {
        method: "DELETE"
      });

      if (res.ok) {
        setSessions(prev => prev.filter(s => s.sessionId !== sessionId));
        if (activeSessionId === sessionId) {
          handleStartNewChat();
        }
      }
    } catch (err) {
      console.error("Failed to delete session:", err);
    }
  };

  // Clear all chats
  const handleClearAllHistory = async () => {
    if (!confirm("Are you sure you want to clear all chat history? This action cannot be undone.")) {
      return;
    }

    try {
      const res = await fetch("/api/chat/sessions", {
        method: "DELETE"
      });

      if (res.ok) {
        setSessions([]);
        handleStartNewChat();
      }
    } catch (err) {
      console.error("Failed to clear history:", err);
    }
  };

  // Copy message text
  const handleCopyMessage = (content: string, index: number) => {
    navigator.clipboard.writeText(content);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Text to Speech
  const handleReadAloud = (content: string, index: number) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    if (speakingIndex === index) {
      window.speechSynthesis.cancel();
      setSpeakingIndex(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = content.replace(/[#*_`~[\]()]/g, "");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = "en-IN";
    utterance.onend = () => setSpeakingIndex(null);
    utterance.onerror = () => setSpeakingIndex(null);

    setSpeakingIndex(index);
    window.speechSynthesis.speak(utterance);
  };

  // Group sessions by chronological dates
  const groupSessionsByTime = (items: ChatSession[]) => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfYesterday = startOfToday - 24 * 60 * 60 * 1000;
    const startOf7Days = startOfToday - 7 * 24 * 60 * 60 * 1000;
    const startOf30Days = startOfToday - 30 * 24 * 60 * 60 * 1000;

    const pinned: ChatSession[] = [];
    const today: ChatSession[] = [];
    const yesterday: ChatSession[] = [];
    const prev7Days: ChatSession[] = [];
    const prev30Days: ChatSession[] = [];
    const older: ChatSession[] = [];

    items.forEach(s => {
      if (s.isPinned) {
        pinned.push(s);
        return;
      }
      const time = new Date(s.updatedAt || s.createdAt).getTime();
      if (time >= startOfToday) {
        today.push(s);
      } else if (time >= startOfYesterday) {
        yesterday.push(s);
      } else if (time >= startOf7Days) {
        prev7Days.push(s);
      } else if (time >= startOf30Days) {
        prev30Days.push(s);
      } else {
        older.push(s);
      }
    });

    return { pinned, today, yesterday, prev7Days, prev30Days, older };
  };

  const filteredSessions = sessions.filter(s =>
    s.title.toLowerCase().includes(historySearch.toLowerCase())
  );

  const grouped = groupSessionsByTime(filteredSessions);

  return (
    <>
      {/* ========================================================= */}
      {/* POWERFUL 3D EYE-CATCHING INTRO ANIMATION (100% FULL SCREEN) */}
      {/* ========================================================= */}
      <AnimatePresence>
        {showIntro && (
          <Intro3DAnimation onComplete={() => setShowIntro(false)} />
        )}
      </AnimatePresence>

      <div className={`flex h-[100dvh] min-h-[100dvh] max-h-[100dvh] w-full font-sans overflow-hidden select-none transition-colors duration-200 ${t.appBg}`}>
        
        {/* ========================================================= */}
        {/* 1. LEFT CHATGPT SIDEBAR (DESKTOP & MOBILE/TABLET DRAWER) */}
        {/* ========================================================= */}
      
      {/* Mobile & Tablet Drawer Backdrop */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 flex flex-col transition-all duration-300 ease-in-out border-r ${t.sidebarBg} ${
          isSidebarOpen ? "w-[260px] xl:w-[280px]" : "w-0 lg:w-0 overflow-hidden"
        } ${isMobileSidebarOpen ? "translate-x-0 w-[82vw] sm:w-[300px] max-w-[320px]" : "-translate-x-full lg:translate-x-0"}`}
      >
        {/* Sidebar Header: Logo & New Chat */}
        <div className={`p-3 border-b flex items-center justify-between gap-2 ${t.sidebarBorder}`}>
          <Link
            href="/"
            className={`flex items-center gap-2.5 px-2 py-1.5 rounded-lg transition-colors ${t.sidebarHeaderBtn}`}
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-xs text-white shadow-xs">
              TD
            </div>
            <span className="font-bold text-sm tracking-tight">
              TrueDeal
            </span>
          </Link>

          {/* Desktop Toggle Sidebar Icon */}
          <button
            type="button"
            onClick={() => setIsSidebarOpen(false)}
            className={`hidden lg:flex items-center justify-center w-8 h-8 rounded-lg opacity-70 hover:opacity-100 transition-colors ${t.sidebarHeaderBtn}`}
            title="Close sidebar"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>

          {/* Mobile/Tablet Close Button */}
          <button
            type="button"
            onClick={() => setIsMobileSidebarOpen(false)}
            className="lg:hidden flex items-center justify-center w-8 h-8 rounded-lg opacity-70 hover:opacity-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* New Chat Action Button */}
        <div className="p-3">
          <button
            type="button"
            onClick={handleStartNewChat}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer group ${t.sidebarNewChat}`}
          >
            <span className="flex items-center gap-2.5">
              <Plus className="w-4 h-4 text-indigo-500 group-hover:rotate-90 transition-transform duration-200" />
              <span>New chat</span>
            </span>
            <span className="text-[10px] opacity-60 font-mono px-1.5 py-0.5 rounded border border-current/20">
              ⌘K
            </span>
          </button>
        </div>

        {/* Search Past Chats */}
        <div className="px-3 pb-2">
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 absolute left-3 opacity-50 pointer-events-none" />
            <input
              type="text"
              placeholder="Search chat history..."
              value={historySearch}
              onChange={e => setHistorySearch(e.target.value)}
              className={`w-full text-xs pl-8 pr-7 py-1.5 rounded-lg border focus:outline-hidden ${t.sidebarSearch}`}
            />
            {historySearch && (
              <button
                type="button"
                onClick={() => setHistorySearch("")}
                className="absolute right-2 opacity-50 hover:opacity-100 text-xs"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Chat History List */}
        <div className="flex-1 overflow-y-auto px-2 space-y-4 py-2 custom-scrollbar text-xs">
          {loadingSessions ? (
            <div className="flex items-center justify-center py-8 opacity-60 gap-2 text-xs">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
              <span>Loading past searches...</span>
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-8 px-4 opacity-60 text-xs">
              <MessageSquare className="w-6 h-6 mx-auto mb-2 opacity-40" />
              <p>No chat history yet.</p>
              <p className="text-[11px] opacity-70 mt-1">
                Your searches and conversations will automatically be saved here in the database.
              </p>
            </div>
          ) : (
            <>
              {/* Pinned Section */}
              {grouped.pinned.length > 0 && (
                <div>
                  <div className="px-2 py-1 text-[11px] font-bold text-amber-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Pin className="w-3 h-3" />
                    <span>Pinned</span>
                  </div>
                  <div className="space-y-0.5 mt-1">
                    {grouped.pinned.map(session => renderSessionItem(session))}
                  </div>
                </div>
              )}

              {/* Today Section */}
              {grouped.today.length > 0 && (
                <div>
                  <div className="px-2 py-1 text-[11px] font-semibold opacity-60">
                    Today
                  </div>
                  <div className="space-y-0.5 mt-1">
                    {grouped.today.map(session => renderSessionItem(session))}
                  </div>
                </div>
              )}

              {/* Yesterday Section */}
              {grouped.yesterday.length > 0 && (
                <div>
                  <div className="px-2 py-1 text-[11px] font-semibold opacity-60">
                    Yesterday
                  </div>
                  <div className="space-y-0.5 mt-1">
                    {grouped.yesterday.map(session => renderSessionItem(session))}
                  </div>
                </div>
              )}

              {/* Previous 7 Days */}
              {grouped.prev7Days.length > 0 && (
                <div>
                  <div className="px-2 py-1 text-[11px] font-semibold opacity-60">
                    Previous 7 Days
                  </div>
                  <div className="space-y-0.5 mt-1">
                    {grouped.prev7Days.map(session => renderSessionItem(session))}
                  </div>
                </div>
              )}

              {/* Previous 30 Days */}
              {grouped.prev30Days.length > 0 && (
                <div>
                  <div className="px-2 py-1 text-[11px] font-semibold opacity-60">
                    Previous 30 Days
                  </div>
                  <div className="space-y-0.5 mt-1">
                    {grouped.prev30Days.map(session => renderSessionItem(session))}
                  </div>
                </div>
              )}

              {/* Older */}
              {grouped.older.length > 0 && (
                <div>
                  <div className="px-2 py-1 text-[11px] font-semibold opacity-60">
                    Older
                  </div>
                  <div className="space-y-0.5 mt-1">
                    {grouped.older.map(session => renderSessionItem(session))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Sidebar Footer: Profile & Clear History */}
        <div className={`p-3 border-t space-y-2 ${t.sidebarFooter}`}>
          {sessions.length > 0 && (
            <button
              type="button"
              onClick={handleClearAllHistory}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg opacity-70 hover:opacity-100 hover:text-red-500 text-[11px] font-medium transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear all conversations</span>
            </button>
          )}

          {/* User Account Tile */}
          <div className={`flex items-center justify-between p-2 rounded-xl border ${t.sidebarUserTile}`}>
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : "G"}
              </div>
              <div className="flex flex-col truncate">
                <span className="font-semibold text-xs truncate">
                  {currentUser?.name || "Guest Explorer"}
                </span>
                <span className="text-[10px] opacity-60 truncate">
                  {currentUser?.email || "Session saved in DB"}
                </span>
              </div>
            </div>

            {currentUser ? (
              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="text-[10px] text-red-500 hover:text-red-400 font-bold px-2 py-1 rounded-md bg-red-500/10 hover:bg-red-500/20 transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
                title="Log out of account"
              >
                {isLoggingOut ? <Loader2 className="w-3 h-3 animate-spin" /> : <LogOut className="w-3 h-3" />}
                <span>Logout</span>
              </button>
            ) : (
              <Link
                href="/login"
                className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold px-2 py-1 rounded-md bg-indigo-500/10 hover:bg-indigo-500/20 transition-colors shrink-0"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      </aside>

      {/* ========================================================= */}
      {/* 2. MAIN CHATGPT AREA */}
      {/* ========================================================= */}
      <main className={`flex-1 flex flex-col h-full relative overflow-hidden transition-colors duration-200 ${t.mainBg}`}>
        
        {/* Top Floating App Bar */}
        <header className={`h-13 sm:h-14 px-3 sm:px-4 md:px-6 flex items-center justify-between border-b backdrop-blur-md z-10 shrink-0 ${t.headerBg}`}>
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Desktop Sidebar Toggle Button (if closed) */}
            {!isSidebarOpen && (
              <button
                type="button"
                onClick={() => setIsSidebarOpen(true)}
                className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg opacity-70 hover:opacity-100 transition-colors cursor-pointer"
                title="Open sidebar"
              >
                <PanelLeft className="w-4 h-4" />
              </button>
            )}

            {/* Mobile & Tablet Sidebar Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden flex items-center justify-center w-8 h-8 rounded-lg opacity-70 hover:opacity-100 transition-colors cursor-pointer"
              title="Open sidebar"
            >
              <PanelLeft className="w-4 h-4" />
            </button>

            {/* Clean Professional Model Selector */}
            <div className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl border transition-colors cursor-pointer text-xs font-semibold ${t.headerPill}`}>
              <span className="font-semibold text-xs sm:text-sm">TrueDeal AI</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-50" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            
            {/* THEME SWITCHER: LIGHT / EYE COMFORT / DARK (LOGOS ONLY) */}
            <div className="flex items-center p-0.5 rounded-full border border-current/15 bg-black/5 dark:bg-white/5 backdrop-blur-xs gap-0.5">
              <button
                type="button"
                onClick={() => handleThemeChange("light")}
                className={`p-1.5 rounded-full transition-all cursor-pointer flex items-center justify-center ${
                  theme === "light"
                    ? "bg-white text-amber-600 shadow-xs"
                    : "opacity-50 hover:opacity-100"
                }`}
                title="Light Mode"
              >
                <Sun className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => handleThemeChange("eye-comfort")}
                className={`p-1.5 rounded-full transition-all cursor-pointer flex items-center justify-center ${
                  theme === "eye-comfort"
                    ? "bg-[#FAF6EE] text-[#7A582E] shadow-xs"
                    : "opacity-50 hover:opacity-100"
                }`}
                title="Eye Comfort Mode (Warm Amber Paper)"
              >
                <Eye className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => handleThemeChange("dark")}
                className={`p-1.5 rounded-full transition-all cursor-pointer flex items-center justify-center ${
                  theme === "dark"
                    ? "bg-[#2d2d2d] text-indigo-300 shadow-xs"
                    : "opacity-50 hover:opacity-100"
                }`}
                title="Dark Mode (Default)"
              >
                <Moon className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Login / Profile Icon */}
            {currentUser ? (
              <Link
                href="/account"
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${t.headerPill}`}
                title={`Account: ${currentUser.name}`}
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold text-[11px] flex items-center justify-center">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:inline font-medium max-w-[90px] truncate">{currentUser.name}</span>
              </Link>
            ) : (
              <Link
                href="/login"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all hover:text-indigo-400 cursor-pointer ${t.headerPill}`}
                title="Log in"
              >
                <LogIn className="w-4 h-4 text-indigo-400" />
                <span className="hidden sm:inline font-semibold">Log in</span>
              </Link>
            )}
          </div>
        </header>

        {/* Scrollable Conversation Viewport */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-3 sm:px-6 md:px-8 py-4 sm:py-6 flex flex-col items-center">
          <div className="w-full max-w-3xl flex-1 flex flex-col">
            
            {/* EMPTY STATE: Greeting + MIDDLE SEARCHBAR + Subtle Pills */}
            {messages.length === 0 && !loadingMessages && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="my-auto flex flex-col items-center text-center px-2 sm:px-4 w-full max-w-2xl"
              >
                <h1 className={`text-xl sm:text-2xl md:text-3xl font-medium tracking-tight mb-4 sm:mb-6 ${t.headingText}`}>
                  What can I help with today?
                </h1>

                {/* SEARCHBAR IN THE MIDDLE */}
                <div className="w-full relative mb-3 sm:mb-4">
                  {/* Listening Wave Overlay */}
                  {isListening && (
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/40 text-red-500 text-[11px] font-bold flex items-center gap-2 animate-pulse shadow-md whitespace-nowrap">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                      <span>Listening... Speak your search now</span>
                    </div>
                  )}

                  <div className={`flex items-end gap-1.5 sm:gap-2 rounded-3xl p-1.5 sm:p-2.5 border transition-all ${t.inputBox}`}>
                    {/* Voice Mic Button */}
                    <button
                      type="button"
                      onClick={toggleVoiceSearch}
                      className={`p-2 rounded-full transition-colors shrink-0 ${
                        isListening
                          ? "bg-red-500 text-white animate-pulse"
                          : "opacity-60 hover:opacity-100"
                      }`}
                      title={isListening ? "Stop listening" : "Voice search"}
                    >
                      {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </button>

                    {/* Textarea: text-base on mobile avoids Safari zoom */}
                    <textarea
                      ref={textareaRef}
                      rows={1}
                      autoFocus
                      value={inputQuery}
                      onChange={e => setInputQuery(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      placeholder="Ask anything or search commercial properties, wellness, laptops..."
                      className={`flex-1 bg-transparent text-base sm:text-sm resize-none focus:outline-hidden max-h-[180px] py-1.5 px-1 font-sans leading-relaxed ${t.inputPlaceholder}`}
                    />

                    {/* Send Button */}
                    <button
                      type="button"
                      disabled={!inputQuery.trim() && !isGenerating}
                      onClick={() => handleSendMessage()}
                      className={`p-2 rounded-full transition-all cursor-pointer shrink-0 ${
                        inputQuery.trim() && !isGenerating
                          ? t.sendBtnActive
                          : t.sendBtnDisabled
                      }`}
                      title="Send message"
                    >
                      {isGenerating ? (
                        <Loader2 className="w-4 h-4 animate-spin text-current" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Category quick search icon buttons (pure icons with tooltips) */}
                <div className="flex items-center justify-center gap-2.5 sm:gap-3.5 mt-1">
                  {[
                    {
                      text: "Commercial offices in Pune",
                      icon: Building2,
                      color: "text-blue-500 hover:text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/25 hover:border-blue-500/50 hover:shadow-md hover:shadow-blue-500/20"
                    },
                    {
                      text: "Ayurmor Moringa soup",
                      icon: Leaf,
                      color: "text-emerald-500 hover:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/25 hover:border-emerald-500/50 hover:shadow-md hover:shadow-emerald-500/20"
                    },
                    {
                      text: "Tech & Gaming laptops",
                      icon: Laptop,
                      color: "text-purple-500 hover:text-purple-400 bg-purple-500/10 hover:bg-purple-500/20 border-purple-500/25 hover:border-purple-500/50 hover:shadow-md hover:shadow-purple-500/20"
                    },
                    {
                      text: "Connect with verified sellers",
                      icon: Store,
                      color: "text-amber-500 hover:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/25 hover:border-amber-500/50 hover:shadow-md hover:shadow-amber-500/20"
                    }
                  ].map((chip, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSendMessage(chip.text)}
                      title={chip.text}
                      aria-label={chip.text}
                      className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl border flex items-center justify-center transition-all duration-200 cursor-pointer shadow-xs hover:scale-110 active:scale-95 ${chip.color}`}
                    >
                      <chip.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Loading Indicator for switching chats */}
            {loadingMessages && (
              <div className="my-auto flex flex-col items-center justify-center py-12 opacity-60 gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                <span className="text-xs font-semibold">Loading conversation history...</span>
              </div>
            )}

            {/* MESSAGE STREAM */}
            {messages.length > 0 && !loadingMessages && (
              <div className="space-y-6 pb-6 pt-2">
                {messages.map((msg, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex gap-3 sm:gap-4 ${
                      msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {/* Assistant Bot Avatar */}
                    {msg.role === "assistant" && (
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shrink-0 mt-0.5 shadow-sm">
                        <Sparkles className="w-4 h-4 text-white" />
                      </div>
                    )}

                    {/* Message Body */}
                    <div
                      className={`flex flex-col max-w-[88%] sm:max-w-[85%] ${
                        msg.role === "user" ? "items-end" : "items-start w-full"
                      }`}
                    >
                      {/* User Bubble */}
                      {msg.role === "user" ? (
                        <div className={`px-4 py-3 rounded-3xl rounded-tr-md text-xs sm:text-sm font-medium leading-relaxed shadow-xs break-words border ${t.userBubble}`}>
                          {msg.content}
                        </div>
                      ) : (
                        /* Assistant Bubble */
                        <div className="w-full space-y-4">
                          
                          {/* Filter Badges if any */}
                          {msg.metadata?.appliedFilters && msg.metadata.appliedFilters.length > 0 && (
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {msg.metadata.appliedFilters.map((badge, bIdx) => (
                                <span
                                  key={bIdx}
                                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 font-bold text-[10px] border border-indigo-500/20"
                                >
                                  {badge}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Markdown Text Response */}
                          <div className={`text-xs sm:text-sm leading-relaxed whitespace-pre-line font-sans ${t.assistantText}`}>
                            {renderFormattedContent(msg.content)}
                          </div>

                          {/* Embedded Marketplace Product / Property Cards */}
                          {msg.metadata?.listings && msg.metadata.listings.length > 0 && (
                            <div className="pt-2">
                              <div className="flex items-center justify-between mb-2.5">
                                <span className="text-[11px] font-bold opacity-70 uppercase tracking-wider flex items-center gap-1.5">
                                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                                  <span>Verified Marketplace Listings ({msg.metadata.listings.length})</span>
                                </span>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                                {msg.metadata.listings.map((item: any, lIdx: number) => (
                                  <div
                                    key={lIdx}
                                    className={`flex flex-col rounded-2xl p-3 sm:p-3.5 border transition-all shadow-xs group ${t.assistantListingCard}`}
                                  >
                                    <div className="flex items-start gap-2.5 sm:gap-3">
                                      {item.image && (
                                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-black/5 shrink-0 relative">
                                          <img
                                            src={item.image}
                                            alt={item.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            onError={e => {
                                              (e.target as HTMLElement).style.display = "none";
                                            }}
                                          />
                                        </div>
                                      )}
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1.5 mb-1">
                                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 border border-indigo-500/20">
                                            {item.category || "Verified"}
                                          </span>
                                          {item.badge && (
                                            <span className="text-[9px] font-bold text-emerald-500 truncate">
                                              {item.badge}
                                            </span>
                                          )}
                                        </div>
                                        <h4 className={`text-xs font-bold leading-snug line-clamp-2 transition-colors ${t.assistantListingTitle}`}>
                                          {item.title}
                                        </h4>
                                        <div className={`text-sm font-black mt-1 ${t.assistantListingPrice}`}>
                                          {item.price}
                                        </div>
                                        {item.location && (
                                          <span className="text-[10px] opacity-70 flex items-center gap-1 mt-0.5 truncate">
                                            📍 {item.location}
                                          </span>
                                        )}
                                      </div>
                                    </div>

                                    {/* Action Buttons: WhatsApp & Store */}
                                    <div className={`mt-3 pt-2.5 border-t flex items-center gap-2 ${t.assistantListingAction}`}>
                                      {item.whatsappUrl ? (
                                        <a
                                          href={item.whatsappUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="flex-1 flex items-center justify-center gap-1.5 py-2 sm:py-1.5 px-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition-colors shadow-xs"
                                        >
                                          <MessageCircle className="w-3.5 h-3.5" />
                                          <span>WhatsApp Direct</span>
                                        </a>
                                      ) : item.phone ? (
                                        <a
                                          href={`tel:${item.phone}`}
                                          className="flex-1 flex items-center justify-center gap-1.5 py-2 sm:py-1.5 px-2.5 rounded-xl bg-black/10 hover:bg-black/15 font-bold text-[11px] transition-colors"
                                        >
                                          <Phone className="w-3.5 h-3.5 text-emerald-500" />
                                          <span>Call Seller</span>
                                        </a>
                                      ) : null}

                                      <Link
                                        href={item.link || `/portfolio/${item.sellerSlug || "seller"}`}
                                        className={`flex items-center justify-center gap-1 py-2 sm:py-1.5 px-3 rounded-xl font-bold text-[11px] transition-colors ${t.assistantViewBtn}`}
                                      >
                                        <span>View</span>
                                        <ChevronRight className="w-3 h-3" />
                                      </Link>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Suggested Follow-up interactive questions */}
                          {msg.metadata?.suggestedFollowUps && msg.metadata.suggestedFollowUps.length > 0 && (
                            <div className="pt-3 space-y-1.5">
                              <div className="flex items-center gap-1.5 text-[11px] font-semibold opacity-70">
                                <Sparkles className="w-3 h-3 text-amber-500" />
                                <span>Suggested next questions & filters:</span>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {msg.metadata.suggestedFollowUps.map((chip, cIdx) => (
                                  <button
                                    key={cIdx}
                                    type="button"
                                    onClick={() => handleSendMessage(chip)}
                                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer ${t.chipBtn}`}
                                  >
                                    <span>{chip}</span>
                                    <ChevronRight className="w-3 h-3 opacity-60" />
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Assistant Message Actions Toolbar */}
                          <div className="flex items-center gap-1 pt-1 opacity-60">
                            <button
                              type="button"
                              onClick={() => handleCopyMessage(msg.content, index)}
                              className="p-1.5 rounded-lg hover:opacity-100 transition-colors"
                              title="Copy response"
                            >
                              {copiedIndex === index ? (
                                <Check className="w-3.5 h-3.5 text-emerald-500" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleReadAloud(msg.content, index)}
                              className={`p-1.5 rounded-lg hover:opacity-100 transition-colors ${
                                speakingIndex === index ? "text-indigo-500 font-bold" : ""
                              }`}
                              title={speakingIndex === index ? "Stop speaking" : "Read aloud"}
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                const prevUserMsg = messages[index - 1];
                                if (prevUserMsg?.content) {
                                  handleSendMessage(prevUserMsg.content);
                                }
                              }}
                              className="p-1.5 rounded-lg hover:opacity-100 transition-colors"
                              title="Regenerate response"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* User Avatar */}
                    {msg.role === "user" && (
                      <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold shadow-xs">
                        {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                      </div>
                    )}
                  </motion.div>
                ))}

                {/* Thinking Indicator */}
                {isGenerating && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-3 sm:gap-4 items-center"
                  >
                    <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-xs">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex items-center gap-1.5 py-2 px-3 text-xs opacity-60">
                      <span className="w-2 h-2 rounded-full bg-current animate-bounce"></span>
                      <span
                        className="w-2 h-2 rounded-full bg-current animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></span>
                      <span
                        className="w-2 h-2 rounded-full bg-current animate-bounce"
                        style={{ animationDelay: "0.4s" }}
                      ></span>
                    </div>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>

        {/* ========================================================= */}
        {/* 3. DOCKED CHATGPT BOTTOM INPUT CONTAINER (SHOWN WHEN MESSAGES EXIST) */}
        {/* ========================================================= */}
        {messages.length > 0 && (
          <div className={`w-full px-2.5 sm:px-6 md:px-8 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:pb-5 pt-2 flex flex-col items-center transition-colors duration-200 ${t.mainBg}`}>
            <div className="w-full max-w-3xl relative">
              
              {/* Listening Wave Overlay */}
              {isListening && (
                <div className="absolute -top-9 sm:-top-10 left-1/2 -translate-x-1/2 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-red-500/20 border border-red-500/40 text-red-500 text-[10px] sm:text-[11px] font-bold flex items-center gap-1.5 sm:gap-2 animate-pulse shadow-md whitespace-nowrap">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                  <span>Listening... Speak your search or question</span>
                </div>
              )}

              {/* Pill Container */}
              <div className={`flex items-end gap-1.5 sm:gap-2 rounded-3xl p-1.5 sm:p-2.5 border transition-all ${t.inputBox}`}>
                
                {/* Voice Mic Button */}
                <button
                  type="button"
                  onClick={toggleVoiceSearch}
                  className={`p-2 rounded-full transition-colors shrink-0 ${
                    isListening
                      ? "bg-red-500 text-white animate-pulse"
                      : "opacity-60 hover:opacity-100"
                  }`}
                  title={isListening ? "Stop listening" : "Voice search (Web Speech)"}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>

                {/* Dynamic Auto-Expanding Textarea: text-base on mobile prevents iOS auto-zoom */}
                <textarea
                  ref={textareaRef}
                  rows={1}
                  value={inputQuery}
                  onChange={e => setInputQuery(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Ask anything or search commercial properties, wellness, laptops..."
                  className={`flex-1 bg-transparent text-base sm:text-sm resize-none focus:outline-hidden max-h-[140px] sm:max-h-[180px] py-1.5 px-1 font-sans leading-relaxed ${t.inputPlaceholder}`}
                />

                {/* Send Button */}
                <button
                  type="button"
                  disabled={!inputQuery.trim() && !isGenerating}
                  onClick={() => handleSendMessage()}
                  className={`p-2 rounded-full transition-all cursor-pointer shrink-0 ${
                    inputQuery.trim() && !isGenerating
                      ? t.sendBtnActive
                      : t.sendBtnDisabled
                  }`}
                  title="Send message"
                >
                  {isGenerating ? (
                    <Loader2 className="w-4 h-4 animate-spin text-current" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Disclaimer text */}
              <div className={`text-[10px] sm:text-[11px] text-center mt-1.5 sm:mt-2 opacity-60 ${t.disclaimerText}`}>
                TrueDeal AI can make mistakes. Verify important information.
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ========================================================= */}
      {/* 4. LOGIN REQUIRED POPUP MODAL (AFTER 1 FREE SEARCH) */}
      {/* ========================================================= */}
      <AnimatePresence>
        {showLoginRequiredModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm">
            {/* Backdrop click to dismiss */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0"
              onClick={() => setShowLoginRequiredModal(false)}
            />

            {/* Modal Dialog Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className={`relative z-10 w-full max-w-[92vw] sm:max-w-sm rounded-2xl border p-5 sm:p-7 shadow-xl overflow-hidden font-sans ${
                theme === "light"
                  ? "bg-white border-gray-200 text-gray-900"
                  : theme === "eye-comfort"
                  ? "bg-[#FAF6EE] border-[#DFD3BE] text-[#3D3024]"
                  : "bg-[#1f1f1f] border-[#333333] text-white"
              }`}
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setShowLoginRequiredModal(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg opacity-50 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex flex-col items-center text-center pt-1">
                {/* Clean Professional Icon */}
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3.5 ${
                  theme === "light"
                    ? "bg-gray-100 text-gray-800"
                    : theme === "eye-comfort"
                    ? "bg-[#EFE8D8] text-[#5A4533]"
                    : "bg-white/10 text-white"
                }`}>
                  <LogIn className="w-5 h-5" />
                </div>

                <h3 className="text-lg font-semibold tracking-tight mb-2">
                  Sign in to continue
                </h3>

                <p className={`text-xs sm:text-sm leading-relaxed mb-6 ${
                  theme === "light"
                    ? "text-gray-500"
                    : theme === "eye-comfort"
                    ? "text-[#7A6C5B]"
                    : "text-gray-400"
                }`}>
                  Please sign in or create an account to continue searching, chat with verified sellers, and save your conversation history.
                </p>

                {/* Action Buttons */}
                <div className="w-full space-y-2.5">
                  <Link
                    href="/login"
                    className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-medium text-sm transition-all cursor-pointer ${
                      theme === "light"
                        ? "bg-gray-900 hover:bg-black text-white shadow-xs"
                        : theme === "eye-comfort"
                        ? "bg-[#5A4533] hover:bg-[#4A3727] text-white shadow-xs"
                        : "bg-white text-gray-900 hover:bg-gray-100 shadow-xs"
                    }`}
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Sign In</span>
                  </Link>

                  <Link
                    href="/signup"
                    className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-medium text-sm border transition-colors cursor-pointer ${
                      theme === "light"
                        ? "border-gray-200 hover:bg-gray-50 text-gray-700"
                        : theme === "eye-comfort"
                        ? "border-[#D1C2A5] hover:bg-[#EFE8D8] text-[#3D3024]"
                        : "border-[#383838] hover:bg-white/5 text-gray-300"
                    }`}
                  >
                    <span>Create Account</span>
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
    </>
  );

  // Render helper for single session item in history
  function renderSessionItem(session: ChatSession) {
    const isActive = activeSessionId === session.sessionId;
    const isEditing = editingSessionId === session.sessionId;

    return (
      <div
        key={session.sessionId}
        onClick={() => {
          if (!isEditing) {
            setActiveSessionId(session.sessionId);
            if (window.history && window.history.pushState) {
              window.history.pushState({}, "", `/chat/${session.sessionId}`);
            }
            setIsMobileSidebarOpen(false);
          }
        }}
        className={`group relative flex items-center justify-between px-2.5 py-2 rounded-xl cursor-pointer transition-colors ${
          isActive
            ? t.sidebarItemActive
            : t.sidebarItem
        }`}
      >
        <div className="flex items-center gap-2 overflow-hidden flex-1 mr-2">
          {session.isPinned ? (
            <Pin className="w-3 h-3 text-amber-500 shrink-0" />
          ) : (
            <MessageSquare className="w-3 h-3 shrink-0 opacity-60" />
          )}

          {isEditing ? (
            <div className="flex items-center gap-1 flex-1" onClick={e => e.stopPropagation()}>
              <input
                type="text"
                autoFocus
                value={editTitleText}
                onChange={e => setEditTitleText(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter") handleSaveRename(session.sessionId);
                  if (e.key === "Escape") setEditingSessionId(null);
                }}
                className="bg-black/10 dark:bg-white/10 text-current text-xs px-1.5 py-0.5 rounded border border-current/20 focus:outline-hidden w-full"
              />
              <button
                type="button"
                onClick={() => handleSaveRename(session.sessionId)}
                className="text-emerald-500 p-0.5"
              >
                <Check className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => setEditingSessionId(null)}
                className="opacity-60 hover:opacity-100 p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <span className="truncate text-xs">{session.title}</span>
          )}
        </div>

        {/* Action icons on hover */}
        {!isEditing && (
          <div className="hidden group-hover:flex items-center gap-1 shrink-0">
            {/* Toggle Pin */}
            <button
              type="button"
              onClick={e => {
                e.stopPropagation();
                handleTogglePin(session.sessionId, session.isPinned);
              }}
              className="p-1 opacity-60 hover:opacity-100 hover:text-amber-500 transition-colors"
              title={session.isPinned ? "Unpin chat" : "Pin chat"}
            >
              {session.isPinned ? <PinOff className="w-3 h-3" /> : <Pin className="w-3 h-3" />}
            </button>

            {/* Rename */}
            <button
              type="button"
              onClick={e => {
                e.stopPropagation();
                setEditingSessionId(session.sessionId);
                setEditTitleText(session.title);
              }}
              className="p-1 opacity-60 hover:opacity-100 transition-colors"
              title="Rename chat"
            >
              <Edit2 className="w-3 h-3" />
            </button>

            {/* Delete */}
            <button
              type="button"
              onClick={e => handleDeleteSession(session.sessionId, e)}
              className="p-1 opacity-60 hover:text-red-500 transition-colors"
              title="Delete chat"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    );
  }

  // Simple Markdown-like content formatter for bolding, bullet points, headers
  function renderFormattedContent(content: string) {
    const lines = content.split("\n");
    return lines.map((line, lIdx) => {
      const isBullet = line.startsWith("• ") || line.startsWith("- ") || line.startsWith("* ");
      const cleanLine = isBullet ? line.replace(/^[•\-\*]\s+/, "") : line;

      // Bold items
      const formattedParts = cleanLine.split(/(\*\*.*?\*\*)/g).map((part, pIdx) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={pIdx} className="font-extrabold text-current">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return part;
      });

      if (isBullet) {
        return (
          <div key={lIdx} className="flex items-start gap-2 pl-2 my-1">
            <span className="text-indigo-500 font-bold">•</span>
            <span>{formattedParts}</span>
          </div>
        );
      }

      if (line.startsWith("### ")) {
        return (
          <h4 key={lIdx} className="text-sm font-black mt-3 mb-1">
            {line.replace("### ", "")}
          </h4>
        );
      }

      if (line.startsWith("## ")) {
        return (
          <h3 key={lIdx} className="text-base font-black mt-4 mb-1">
            {line.replace("## ", "")}
          </h3>
        );
      }

      return (
        <p key={lIdx} className={line.trim() === "" ? "h-2" : "my-0.5"}>
          {formattedParts}
        </p>
      );
    });
  }
}
