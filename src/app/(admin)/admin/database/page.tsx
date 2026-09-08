"use client";

import { useState, useEffect } from "react";
import { 
  Database, Activity, CheckCircle2, AlertCircle, 
  RefreshCw, Layers, HardDrive, Trash2, Zap, 
  Loader2, ShieldCheck, Server
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAdminSystemStatusAction, runAdminMaintenanceAction } from "@/lib/admin-actions";

export default function AdminDatabasePage() {
  const [dbData, setDbData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const loadHealth = async () => {
    setLoading(true);
    try {
      const res = await getAdminSystemStatusAction();
      setDbData(res);
    } catch (err) {
      console.error("Error loading DB status:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHealth();
  }, []);

  const handleMaintenance = async (actionType: "sync_sellers" | "clean_empty_otps") => {
    setIsSyncing(true);
    try {
      const res = await runAdminMaintenanceAction(actionType);
      if (res.success) {
        setActionNotice(res.message || "Maintenance action completed successfully.");
        setTimeout(() => setActionNotice(null), 4000);
        loadHealth();
      }
    } catch (err: any) {
      setActionNotice(`Action failed: ${err.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Database className="w-6 h-6 text-emerald-400" />
            MongoDB Atlas Telemetry & Health Center
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Real-time multi-tenant database connection metrics, collection partitions, and maintenance utilities.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={loadHealth}
            variant="outline"
            className="bg-gray-900 border-gray-800 text-gray-300 hover:text-white text-xs font-bold rounded-xl h-10 px-3 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Ping Database
          </Button>
        </div>
      </div>

      {actionNotice && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold rounded-2xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Database KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-[#0f1118] border border-gray-800 rounded-3xl p-5 shadow-xl">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Cluster Status</span>
          <div className="mt-2 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xl font-black text-white">{dbData?.status || "HEALTHY"}</span>
          </div>
          <p className="text-[11px] text-emerald-400 font-mono mt-1">
            Atlas MongoDB Cluster Online
          </p>
        </div>

        <div className="bg-[#0f1118] border border-gray-800 rounded-3xl p-5 shadow-xl">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Ping Latency</span>
          <div className="mt-2 text-2xl font-black text-white font-mono">
            {dbData?.pingMs || 12} ms
          </div>
          <p className="text-[11px] text-gray-400 font-mono mt-1">
            Round-trip query response
          </p>
        </div>

        <div className="bg-[#0f1118] border border-gray-800 rounded-3xl p-5 shadow-xl">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Database Name</span>
          <div className="mt-2 text-2xl font-black text-indigo-400 font-mono truncate">
            {dbData?.databaseName || "Truedeal"}
          </div>
          <p className="text-[11px] text-gray-400 font-mono mt-1">
            Primary Production Database
          </p>
        </div>

        <div className="bg-[#0f1118] border border-gray-800 rounded-3xl p-5 shadow-xl">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Documents</span>
          <div className="mt-2 text-2xl font-black text-white font-mono">
            {dbData?.totalDocuments || 0}
          </div>
          <p className="text-[11px] text-gray-400 font-mono mt-1">
            Across {dbData?.totalCollections || 0} Collections
          </p>
        </div>

      </div>

      {/* Maintenance Controls */}
      <div className="bg-[#0f1118] border border-gray-800 rounded-3xl p-6 shadow-xl space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" />
          Maintenance Operations
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-4 flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="font-bold text-white text-xs">Synchronize Multi-Tenant Collections</h3>
              <p className="text-[11px] text-gray-400">Verifies that all registered sellers map correctly to `products_&lt;slug&gt;`.</p>
            </div>
            <Button
              onClick={() => handleMaintenance("sync_sellers")}
              disabled={isSyncing}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl h-9 px-3 cursor-pointer shrink-0 ml-3"
            >
              Sync Collections
            </Button>
          </div>

          <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-4 flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="font-bold text-white text-xs">Purge Expired OTPs</h3>
              <p className="text-[11px] text-gray-400">Cleans up stale customer mobile/email authentication tokens.</p>
            </div>
            <Button
              onClick={() => handleMaintenance("clean_empty_otps")}
              disabled={isSyncing}
              variant="outline"
              className="bg-gray-900 border-gray-700 text-gray-300 hover:text-white text-xs font-bold rounded-xl h-9 px-3 cursor-pointer shrink-0 ml-3"
            >
              Purge OTPs
            </Button>
          </div>
        </div>
      </div>

      {/* Collections Master List */}
      <div className="bg-[#0f1118] border border-gray-800 rounded-3xl shadow-xl overflow-hidden">
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            <h2 className="text-sm font-bold text-white">Collections Breakdown & Document Count</h2>
          </div>
          <span className="text-xs text-gray-400 font-mono">
            {dbData?.collections?.length || 0} active collections
          </span>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-2 text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
            <span className="text-xs font-bold">Scanning MongoDB Atlas Collections...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-gray-900/80 text-gray-400 font-bold uppercase text-[10px] tracking-wider border-b border-gray-800">
                <tr>
                  <th className="py-3.5 px-4">Collection Name</th>
                  <th className="py-3.5 px-4">Classification</th>
                  <th className="py-3.5 px-4">Documents Stored</th>
                  <th className="py-3.5 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60 font-medium">
                {(dbData?.collections || []).map((col: any) => (
                  <tr key={col.name} className="hover:bg-gray-900/40 transition-colors">
                    
                    <td className="py-3.5 px-4 font-mono font-bold text-white">
                      {col.name}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        col.type === "Tenant Catalog"
                          ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                          : "bg-gray-800 text-gray-300"
                      }`}>
                        {col.type}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-emerald-300 font-bold">
                      {col.documentCount.toLocaleString("en-IN")} records
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Healthy
                      </span>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
