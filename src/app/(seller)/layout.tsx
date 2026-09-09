"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, Store, Box, LineChart, Settings, FolderPlus, 
  Zap, LifeBuoy, LogOut, PanelLeftClose, PanelLeftOpen, X 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import SellerHeader from "@/components/layout/SellerHeader";

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  useEffect(() => {
    setIsMobileDrawerOpen(false);
  }, [pathname]);

  const navItems: { name: string; href: string; icon: any; badge?: boolean }[] = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Portfolio", href: "/dashboard/portfolio", icon: FolderPlus },
    { name: "My Business", href: "/dashboard/business", icon: Store },
    { name: "Catalog", href: "/dashboard/catalog", icon: Box, badge: true },
    { name: "Insights", href: "/dashboard/insights", icon: LineChart },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  const renderNavContent = (collapsed: boolean, isMobile: boolean = false) => (
    <>
      {/* Sidebar Header */}
      <div className={`h-16 sm:h-20 flex items-center ${collapsed ? "justify-center px-2" : "justify-between px-5"} border-b border-gray-800 transition-all duration-300`}>
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center font-extrabold text-white text-xs leading-none shrink-0 shadow-sm">
            TD
          </div>
          {!collapsed && (
            <div className="flex flex-col overflow-hidden whitespace-nowrap animate-in fade-in duration-200">
              <h1 className="font-bold text-[16px] text-white font-sans truncate">TrueDeal Seller</h1>
              <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider truncate">Verified Merchant</p>
            </div>
          )}
        </div>

        {isMobile ? (
          <button 
            type="button"
            onClick={() => setIsMobileDrawerOpen(false)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Close Menu"
          >
            <X className="w-5 h-5" />
          </button>
        ) : (
          <button 
            type="button"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className={`p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors ${collapsed ? "hidden" : "block"}`}
            title="Collapse Sidebar"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Sidebar Navigation */}
      <div className="flex-1 overflow-y-auto py-5 px-3 flex flex-col gap-1.5">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              title={collapsed ? item.name : undefined}
              onClick={() => isMobile && setIsMobileDrawerOpen(false)}
              className={`flex items-center ${
                collapsed ? "justify-center px-0 h-12" : "gap-3 px-3 py-2.5"
              } rounded-xl transition-all duration-200 text-sm font-semibold relative ${
                isActive 
                  ? "bg-indigo-600/20 text-white border border-indigo-500/30 shadow-sm" 
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon className={`w-5 h-5 shrink-0 ${isActive ? "text-indigo-400" : "text-gray-400"}`} />
              {!collapsed && (
                <span className="truncate whitespace-nowrap animate-in fade-in duration-200">
                  {item.name}
                </span>
              )}
              {item.badge && (
                <span className={`absolute ${collapsed ? "top-2.5 right-2.5" : "right-3"} w-2 h-2 bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.8)]`}></span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Sidebar Footer */}
      <div className="p-3 flex flex-col gap-1 border-t border-gray-800 bg-[#18181b]">
        {!collapsed ? (
          <Button 
            variant="outline" 
            className="w-full justify-start gap-2 bg-white/5 border-white/10 hover:bg-white/10 hover:text-white text-gray-300 text-xs font-semibold h-9 rounded-xl transition-all duration-200"
          >
            <Zap className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span className="truncate">Enterprise Active</span>
          </Button>
        ) : (
          <div className="flex justify-center py-1">
            <Zap className="w-4 h-4 text-blue-400" />
          </div>
        )}

        <div className="flex flex-col gap-0.5 mt-2">
          <Link 
            href="/dashboard/settings" 
            title="Support & Concierge"
            onClick={() => isMobile && setIsMobileDrawerOpen(false)}
            className={`flex items-center ${collapsed ? "justify-center py-2" : "gap-3 px-3 py-2"} text-xs font-medium text-gray-400 hover:text-white transition-colors rounded-xl hover:bg-white/5`}
          >
            <LifeBuoy className="w-4 h-4 shrink-0" />
            {!collapsed && <span>Support</span>}
          </Link>
          <Link 
            href="/logout" 
            title="Sign Out"
            className={`flex items-center ${collapsed ? "justify-center py-2" : "gap-3 px-3 py-2"} text-xs font-medium text-gray-400 hover:text-white transition-colors rounded-xl hover:bg-white/5`}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </Link>
        </div>
      </div>
    </>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-[#F7F8FA] font-sans w-full">
      
      {/* Mobile Drawer Backdrop */}
      {isMobileDrawerOpen && (
        <div 
          onClick={() => setIsMobileDrawerOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden animate-in fade-in duration-200"
        />
      )}

      {/* Mobile Drawer Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#18181b] text-white flex flex-col h-full border-r border-gray-800 transition-transform duration-300 ease-in-out select-none shadow-2xl lg:hidden ${
          isMobileDrawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {renderNavContent(false, true)}
      </aside>

      {/* Desktop Persistent Sidebar */}
      <aside 
        className={`hidden lg:flex ${
          isSidebarCollapsed ? "w-20" : "w-64"
        } bg-[#18181b] text-white flex-col flex-shrink-0 h-full border-r border-gray-800 transition-all duration-300 ease-in-out select-none relative z-20`}
      >
        {renderNavContent(isSidebarCollapsed, false)}
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-[#F7F8FA] transition-all duration-300">
        
        {/* Top Header with Mobile & Desktop Toggles */}
        <SellerHeader 
          isSidebarCollapsed={isSidebarCollapsed} 
          onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
          onToggleMobileSidebar={() => setIsMobileDrawerOpen(true)}
        />

        {/* Scrollable Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-3.5 sm:p-6 lg:p-8 font-sans scroll-smooth custom-scrollbar w-full">
          <div className="w-full max-w-none">
            {children}
          </div>
        </main>
      </div>

    </div>
  );
}
