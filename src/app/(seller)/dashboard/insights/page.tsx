import { LineChart, ArrowUpRight, ArrowDownRight, Users, Eye, ShoppingCart, TrendingUp, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function InsightsPage() {
  const stats = [
    { title: "Total Views", value: "24,593", change: "+14.5%", trend: "up", icon: Eye },
    { title: "Unique Visitors", value: "8,234", change: "+5.2%", trend: "up", icon: Users },
    { title: "Orders", value: "142", change: "-2.4%", trend: "down", icon: ShoppingCart },
    { title: "Revenue", value: "₹4,25,000", change: "+24.8%", trend: "up", icon: TrendingUp },
  ];

  return (
    <div className="flex flex-col gap-8 animate-in fade-in zoom-in-95 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">Insights & Analytics</h1>
          <p className="text-gray-500 font-medium text-lg">Track your performance and AI discoverability metrics.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="bg-white border-gray-200">Last 7 Days</Button>
          <Button variant="outline" className="bg-white border-gray-200">Export Report</Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:border-[#4F46E5]/30 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-[#F5F3FF] rounded-2xl flex items-center justify-center">
                  <Icon className="w-6 h-6 text-[#4F46E5]" />
                </div>
                <div className={`flex items-center gap-1 text-sm font-bold ${stat.trend === 'up' ? 'text-green-600' : 'text-red-500'}`}>
                  {stat.trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  {stat.change}
                </div>
              </div>
              <div>
                <h3 className="text-3xl font-black text-gray-900 mb-1">{stat.value}</h3>
                <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">{stat.title}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-200 p-8 shadow-sm h-[400px] flex flex-col">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2"><LineChart className="w-5 h-5 text-indigo-600" /> Revenue vs Views Overview</h3>
          <div className="flex-1 bg-gray-50/50 rounded-xl border border-dashed border-gray-200 flex items-center justify-center flex-col text-gray-400">
             <BarChart3 className="w-12 h-12 mb-3 opacity-20" />
             <p className="font-medium text-sm">Interactive Chart Component Loading...</p>
          </div>
        </div>
        
        <div className="lg:col-span-1 bg-white rounded-3xl border border-gray-200 p-8 shadow-sm h-[400px] flex flex-col">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Top AI Search Queries</h3>
          <div className="flex-1 flex flex-col gap-4">
             {[
               { query: "best gaming laptop under 1 lakh", count: 1205 },
               { query: "asus tuf f15 rtx 4060", count: 843 },
               { query: "lightweight laptops for programming", count: 432 },
               { query: "rgb mechanical keyboard", count: 211 },
             ].map((q, i) => (
               <div key={i} className="flex flex-col gap-2 bg-gray-50 p-4 rounded-xl border border-gray-100">
                 <div className="flex justify-between items-center">
                   <span className="text-sm font-semibold text-gray-900 line-clamp-1">"{q.query}"</span>
                   <span className="text-xs font-bold text-[#4F46E5] bg-[#EEF2FF] px-2 py-1 rounded-md">{q.count}</span>
                 </div>
                 <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                   <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(q.count / 1205) * 100}%` }}></div>
                 </div>
               </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
}
