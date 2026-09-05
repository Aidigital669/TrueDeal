"use client";

import { useState, useEffect } from "react";
import { 
  Database, RefreshCw, CheckCircle2, XCircle, Clock, 
  Layers, FileText, Server, ShieldCheck, ArrowRight 
} from "lucide-react";
import Link from "next/link";

export default function TestDatabasePage() {
  const [loading, setLoading] = useState(true);
  const [dbData, setDbData] = useState<any>(null);

  const runTest = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/db-status", { cache: "no-store" });
      const data = await res.json();
      setDbData(data);
    } catch (err: any) {
      setDbData({
        success: false,
        status: "DISCONNECTED",
        error: err.message || "Failed to reach test server API"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runTest();
  }, []);

  const isConnected = dbData?.success && dbData?.status === "CONNECTED";

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-widest mb-1">
              <Database className="w-4 h-4" />
              <span>TrueDeal Database Diagnostic</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">
              MongoDB Connection Test
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Test database connectivity, latency ping, and live collection document counts.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={runTest}
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              <span>Run Connection Test</span>
            </button>
            <Link href="/dashboard/catalog">
              <button className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs px-4 py-2.5 rounded-xl border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer">
                <span>Dashboard Catalog</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </Link>
          </div>
        </div>

        {/* Main Status Banner */}
        <div className={`p-6 rounded-2xl border transition-all ${
          loading 
            ? "bg-slate-800/60 border-slate-700" 
            : isConnected 
              ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-200 shadow-xl shadow-emerald-950/20" 
              : "bg-rose-950/40 border-rose-500/30 text-rose-200 shadow-xl shadow-rose-950/20"
        }`}>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                loading 
                  ? "bg-slate-700 text-slate-300" 
                  : isConnected 
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" 
                    : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
              }`}>
                {loading ? (
                  <RefreshCw className="w-7 h-7 animate-spin" />
                ) : isConnected ? (
                  <CheckCircle2 className="w-8 h-8" />
                ) : (
                  <XCircle className="w-8 h-8" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                    loading
                      ? "bg-slate-700 text-slate-300"
                      : isConnected 
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" 
                        : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                  }`}>
                    {loading ? "TESTING..." : dbData?.status || "DISCONNECTED"}
                  </span>
                  {isConnected && (
                    <span className="text-xs font-semibold text-slate-400">
                      Database: <strong className="text-white">{dbData?.databaseName}</strong>
                    </span>
                  )}
                </div>

                <h2 className="text-xl font-bold text-white mt-1">
                  {loading 
                    ? "Testing MongoDB Atlas Connection..." 
                    : isConnected 
                      ? "Database Connected Successfully!" 
                      : "Database Connection Error"}
                </h2>

                {!loading && !isConnected && (
                  <p className="text-xs text-rose-300 mt-1 font-mono">
                    {dbData?.error || "Unable to reach database"}
                  </p>
                )}
              </div>
            </div>

            {/* Metrics Grid */}
            {!loading && isConnected && (
              <div className="flex items-center gap-4 bg-slate-900/80 p-3 rounded-xl border border-slate-800 shrink-0">
                <div className="text-center px-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Latency</span>
                  <span className="text-sm font-black text-emerald-400 flex items-center justify-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {dbData?.pingMs} ms
                  </span>
                </div>
                <div className="h-8 w-px bg-slate-800" />
                <div className="text-center px-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Collections</span>
                  <span className="text-sm font-black text-indigo-400 flex items-center justify-center gap-1">
                    <Layers className="w-3.5 h-3.5" />
                    {dbData?.totalCollections}
                  </span>
                </div>
                <div className="h-8 w-px bg-slate-800" />
                <div className="text-center px-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Documents</span>
                  <span className="text-sm font-black text-purple-400 flex items-center justify-center gap-1">
                    <FileText className="w-3.5 h-3.5" />
                    {dbData?.totalDocuments}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Collection Breakdown */}
        {!loading && isConnected && dbData?.collections && (
          <div className="bg-slate-800/50 rounded-2xl border border-slate-800 p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Server className="w-4 h-4 text-indigo-400" />
              <span>MongoDB Collection Breakdown</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {dbData.collections.map((col: any) => (
                <div 
                  key={col.name} 
                  className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
                      {col.name[0].toUpperCase()}
                    </div>
                    <span className="font-bold text-sm text-slate-200">{col.name}</span>
                  </div>

                  <span className="bg-slate-800 text-slate-300 text-xs font-bold px-2.5 py-1 rounded-lg border border-slate-700">
                    {col.documentCount} doc{col.documentCount === 1 ? "" : "s"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Troubleshooting Helper for Disconnected state */}
        {!loading && !isConnected && dbData?.troubleshooting && (
          <div className="bg-slate-800/50 rounded-2xl border border-slate-800 p-6 space-y-3">
            <h3 className="text-sm font-bold text-rose-400 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              <span>Troubleshooting Guide</span>
            </h3>
            <ul className="space-y-2 text-xs text-slate-300">
              {dbData.troubleshooting.map((step: string, idx: number) => (
                <li key={idx} className="flex items-center gap-2 bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center font-bold text-[10px]">
                    {idx + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

      </div>
    </div>
  );
}
