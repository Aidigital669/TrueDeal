import { Zap, Sparkles, ArrowUp, AlertCircle, Wrench, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AISearchPage() {
  return (
    <div className="flex flex-col gap-6 w-full font-sans pb-10">
      
      {/* Header */}
      <div className="flex flex-col gap-3 mt-2">
        <div className="flex items-center gap-3">
          <Zap className="w-10 h-10 text-[#7C3AED] fill-transparent stroke-[1.5]" />
          <h1 className="text-[40px] font-extrabold text-gray-900 tracking-tight leading-none">
            AI Search
          </h1>
        </div>
        <p className="text-gray-600 font-medium text-[16px]">
          See how customers discover your products and services through natural language queries.
        </p>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
        
        <StatCard 
          title="AI APPEARANCES" 
          value="14,209" 
          trend="12%" 
        />
        
        <StatCard 
          title="SEARCH MATCHES" 
          value="8,432" 
          trend="5%" 
        />
        
        <StatCard 
          title="CLICKS" 
          value="3,190" 
          trend="8%" 
        />
        
        <div className="bg-[#FCFAFF] rounded-xl border border-purple-200 p-6 flex flex-col gap-3 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-[#7C3AED] uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Conversions</span>
          </div>
          <div className="flex items-end gap-3">
            <span className="text-[34px] font-black text-gray-900 leading-none tracking-tight">184</span>
            <div className="flex items-center text-[12px] font-bold text-[#7C3AED] mb-1">
              <ArrowUp className="w-3 h-3" />
              <span>24%</span>
            </div>
          </div>
        </div>

      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-2">
        
        {/* Left Column (Chart) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm p-8 flex flex-col min-h-[460px]">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-[22px] font-extrabold text-gray-900 tracking-tight">AI Search Visibility</h2>
            <Button variant="outline" className="bg-white hover:bg-gray-50 text-gray-600 font-semibold border-gray-200 rounded-md text-xs px-3 h-8 shadow-sm">
              Last 30 Days
            </Button>
          </div>
          
          <div className="flex-1 flex mt-4 relative pl-8 pb-8">
            {/* Y Axis */}
            <div className="absolute left-0 top-0 bottom-8 w-6 flex flex-col justify-between items-end text-[10px] font-semibold text-gray-400">
              <span>1K</span>
              <span>500</span>
              <span>0</span>
            </div>

            {/* Grid Lines */}
            <div className="absolute left-8 right-0 top-1 h-px bg-gray-100"></div>
            <div className="absolute left-8 right-0 top-1/2 h-px bg-gray-100 -translate-y-1/2"></div>
            <div className="absolute left-8 right-0 bottom-8 h-px bg-gray-100"></div>

            {/* Bars Container */}
            <div className="flex-1 flex items-end justify-between gap-1 z-10 w-full px-2">
              <ChartBar height="30%" color="bg-[#E0D4FF]" />
              <ChartBar height="45%" color="bg-[#CAB4FF]" />
              <ChartBar height="55%" color="bg-[#A78BFA]" />
              <ChartBar height="42%" color="bg-[#A78BFA]" />
              <ChartBar height="65%" color="bg-[#8B5CF6]" />
              <ChartBar height="80%" color="bg-[#7C3AED]" />
              <ChartBar height="100%" color="bg-[#A78BFA]" />
              <ChartBar height="75%" color="bg-[#A78BFA]" />
            </div>

            {/* X Axis */}
            <div className="absolute left-8 right-0 bottom-0 flex items-center justify-between text-[10px] font-semibold text-gray-400 px-2 pt-3">
              <span>Mar 1</span>
              <span>Mar 15</span>
              <span>Mar 30</span>
            </div>
          </div>
        </div>

        {/* Right Column (Cards) */}
        <div className="flex flex-col gap-6">
          
          {/* Data Quality Card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#7C3AED]" />
                <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">AI Data Quality</h3>
              </div>
              <div className="relative w-12 h-12 flex items-center justify-center rounded-full border-[3px] border-purple-100 shadow-sm">
                <svg className="absolute inset-0 w-full h-full -rotate-90 drop-shadow-sm">
                  <circle cx="24" cy="24" r="22" stroke="currentColor" strokeWidth="3" fill="none" className="text-[#7C3AED]" strokeDasharray="138" strokeDashoffset="12" />
                </svg>
                <span className="text-[13px] font-black text-[#7C3AED]">91%</span>
              </div>
            </div>
            
            <p className="text-sm font-medium text-gray-600 mb-6">
              A higher score means AI engines can better understand and recommend your products.
            </p>

            <div className="flex flex-col gap-4">
              <ProgressBar label="Product Info" percentage={98} />
              <ProgressBar label="Specifications" percentage={95} />
              <ProgressBar label="Images" percentage={88} />
              <ProgressBar label="Descriptions" percentage={72} warning />
            </div>
          </div>

          {/* AI Recommendations Card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col flex-1">
            <h3 className="text-[17px] font-extrabold text-gray-900 tracking-tight mb-4">AI Recommendations</h3>
            
            <div className="flex flex-col gap-3 mb-6">
              <div className="flex items-center gap-3 bg-gray-50/80 border border-gray-100 rounded-lg p-3">
                <Sparkles className="w-4 h-4 text-[#7C3AED]" />
                <span className="text-[13px] text-gray-700 font-medium">Add locations to <strong className="font-bold text-gray-900">8 products</strong></span>
              </div>
              <div className="flex items-center gap-3 bg-gray-50/80 border border-gray-100 rounded-lg p-3">
                <Sparkles className="w-4 h-4 text-[#7C3AED]" />
                <span className="text-[13px] text-gray-700 font-medium">Improve <strong className="font-bold text-gray-900">3 product descriptions</strong></span>
              </div>
            </div>

            <Button className="w-full mt-auto bg-[#7C3AED] hover:bg-[#6D28D9] text-white py-5 rounded-lg font-bold text-[13px] shadow-sm flex items-center gap-2">
              <Wrench className="w-4 h-4" />
              Fix All Issues
            </Button>
          </div>
          
        </div>

      </div>

      {/* Bottom Section */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm mt-2 flex flex-col h-[200px] overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[20px] font-extrabold text-gray-900 tracking-tight">Actual Customer Search Queries</h2>
          <button className="text-[13px] font-bold text-[#4133D1] hover:text-[#3427ad] transition-colors flex items-center gap-1">
            View Full Report <ArrowRight className="w-3 h-3" />
          </button>
        </div>
        <div className="flex-1 bg-gradient-to-b from-gray-50 to-white border border-gray-100 rounded-lg flex items-center justify-center relative">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay"></div>
            <p className="text-gray-400 font-medium text-sm z-10">Report data populating...</p>
        </div>
      </div>

    </div>
  );
}

// Sub-components

function StatCard({ title, value, trend }: { title: string, value: string, trend: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col gap-3 shadow-sm transition-all hover:shadow-md">
      <span className="text-[11px] font-extrabold text-gray-500 uppercase tracking-wider">{title}</span>
      <div className="flex items-end gap-3">
        <span className="text-[34px] font-black text-gray-900 leading-none tracking-tight">{value}</span>
        <div className="flex items-center text-[12px] font-bold text-[#7C3AED] mb-1">
          <ArrowUp className="w-3 h-3" />
          <span>{trend}</span>
        </div>
      </div>
    </div>
  );
}

function ChartBar({ height, color }: { height: string, color: string }) {
  return (
    <div className={`w-full max-w-[60px] ${color} rounded-sm transition-all hover:opacity-90`} style={{ height }}></div>
  );
}

function ProgressBar({ label, percentage, warning }: { label: string, percentage: number, warning?: boolean }) {
  const barColor = warning ? 'bg-[#E0D4FF]' : 'bg-[#4F46E5]';
  const textColor = warning ? 'text-[#7C3AED]' : 'text-[#4F46E5]';
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between items-center text-[13px]">
        <div className="flex items-center gap-1.5">
          {warning && <AlertCircle className="w-3.5 h-3.5 text-red-500" />}
          <span className="font-semibold text-gray-800">{label}</span>
        </div>
        <span className={`font-bold ${textColor}`}>{percentage}%</span>
      </div>
      <div className="w-full h-[5px] bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full ${barColor} rounded-full`} style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  );
}
