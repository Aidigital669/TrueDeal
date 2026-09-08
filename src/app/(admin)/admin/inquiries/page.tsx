"use client";

import { useState, useEffect } from "react";
import { 
  MessageSquare, Search, Filter, Download, Phone, 
  Mail, Store, CheckCircle2, Clock, Trash2, 
  Loader2, RefreshCw, ExternalLink, User, MessageCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  getAdminInquiriesList, 
  updateInquiryStatusAction, 
  deleteInquiryAction 
} from "@/lib/admin-actions";

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sellerFilter, setSellerFilter] = useState("all");
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const loadInquiries = async () => {
    setLoading(true);
    try {
      const res = await getAdminInquiriesList({
        search,
        status: statusFilter,
        sellerSlug: sellerFilter
      });
      if (res.success) {
        setInquiries(res.inquiries);
      }
    } catch (err) {
      console.error("Error loading inquiries:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInquiries();
  }, [search, statusFilter, sellerFilter]);

  const handleStatusChange = async (inquiryId: string, nextStatus: any) => {
    const res = await updateInquiryStatusAction(inquiryId, nextStatus);
    if (res.success) {
      setActionNotice(`Lead status updated to ${nextStatus}`);
      setTimeout(() => setActionNotice(null), 3000);
      loadInquiries();
    }
  };

  const handleDelete = async (inquiryId: string) => {
    if (!confirm("Are you sure you want to delete this lead inquiry?")) return;
    const res = await deleteInquiryAction(inquiryId);
    if (res.success) {
      setActionNotice("Inquiry lead removed.");
      setTimeout(() => setActionNotice(null), 3000);
      loadInquiries();
    }
  };

  const handleExportCSV = () => {
    if (inquiries.length === 0) return;
    const headers = ["Name", "Email", "Phone", "Seller Store", "Product / Subject", "Message", "Status", "Date"];
    const rows = inquiries.map(inq => [
      `"${inq.name.replace(/"/g, '""')}"`,
      `"${inq.email}"`,
      `"${inq.phone}"`,
      `"${inq.sellerSlug}"`,
      `"${inq.productTitle.replace(/"/g, '""')}"`,
      `"${inq.message.replace(/"/g, '""')}"`,
      `"${inq.status}"`,
      `"${new Date(inq.createdAt).toLocaleString("en-IN")}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `truedeal_leads_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalLeads = inquiries.length;
  const newLeads = inquiries.filter(i => i.status === "NEW").length;
  const inProgress = inquiries.filter(i => i.status === "IN_PROGRESS").length;
  const resolvedLeads = inquiries.filter(i => i.status === "RESOLVED").length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-amber-400" />
            Buyer Inquiries & Leads Dispatch Center
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Real-time pipeline of quotes, RFQ submissions, and buyer inquiries submitted to merchants.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={loadInquiries}
            variant="outline"
            className="bg-gray-900 border-gray-800 text-gray-300 hover:text-white text-xs font-bold rounded-xl h-10 px-3 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Refresh
          </Button>

          <Button
            onClick={handleExportCSV}
            className="bg-amber-500 hover:bg-amber-600 text-black text-xs font-black rounded-xl h-10 px-3.5 cursor-pointer shadow-md shadow-amber-500/20"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" /> Export Leads CSV
          </Button>
        </div>
      </div>

      {actionNotice && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold rounded-2xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-[#0f1118] border border-gray-800 rounded-2xl p-4">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Leads</span>
          <div className="text-2xl font-black text-white mt-1">{totalLeads}</div>
        </div>
        <div className="bg-[#0f1118] border border-gray-800 rounded-2xl p-4">
          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">New (Action Required)</span>
          <div className="text-2xl font-black text-amber-300 mt-1">{newLeads}</div>
        </div>
        <div className="bg-[#0f1118] border border-gray-800 rounded-2xl p-4">
          <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">In Progress</span>
          <div className="text-2xl font-black text-blue-300 mt-1">{inProgress}</div>
        </div>
        <div className="bg-[#0f1118] border border-gray-800 rounded-2xl p-4">
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Resolved / Closed</span>
          <div className="text-2xl font-black text-emerald-300 mt-1">{resolvedLeads}</div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-[#0f1118] border border-gray-800 rounded-3xl p-4 shadow-xl flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search inquiries by buyer name, phone, email, seller, inquiry notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-900 border border-gray-800 text-xs font-semibold text-white placeholder:text-gray-500 focus:border-amber-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-gray-900 border border-gray-800 text-gray-300 rounded-xl px-3 py-2 text-xs font-semibold focus:border-amber-500 outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="NEW">New Leads</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>
      </div>

      {/* Inquiries Table */}
      <div className="bg-[#0f1118] border border-gray-800 rounded-3xl shadow-xl overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-2 text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
            <span className="text-xs font-bold">Querying Lead Inquiries...</span>
          </div>
        ) : inquiries.length === 0 ? (
          <div className="py-16 text-center text-gray-500 text-xs font-semibold">
            No inquiry leads found matching the current filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-gray-900/80 text-gray-400 font-bold uppercase text-[10px] tracking-wider border-b border-gray-800">
                <tr>
                  <th className="py-3.5 px-4">Buyer Lead</th>
                  <th className="py-3.5 px-4">Target Store</th>
                  <th className="py-3.5 px-4">Subject / Item</th>
                  <th className="py-3.5 px-4">Inquiry Message</th>
                  <th className="py-3.5 px-4">Status & Dispatch</th>
                  <th className="py-3.5 px-4">Received</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60 font-medium">
                {inquiries.map((inq) => (
                  <tr key={inq._id} className="hover:bg-gray-900/40 transition-colors">
                    
                    {/* Buyer Details */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5 max-w-[180px]">
                        <div className="font-bold text-white text-xs truncate flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span>{inq.name}</span>
                        </div>
                        {inq.phone && (
                          <div className="text-[11px] text-gray-400 font-mono flex items-center gap-1">
                            <Phone className="w-3 h-3 text-emerald-400 shrink-0" />
                            <span>{inq.phone}</span>
                          </div>
                        )}
                        {inq.email && (
                          <div className="text-[10px] text-gray-500 truncate flex items-center gap-1">
                            <Mail className="w-3 h-3 text-gray-500 shrink-0" />
                            <span>{inq.email}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Target Store */}
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-xs font-bold font-mono">
                        /{inq.sellerSlug}
                      </span>
                    </td>

                    {/* Subject / Item */}
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-gray-200 block truncate max-w-[150px]">
                        {inq.productTitle}
                      </span>
                    </td>

                    {/* Inquiry Message */}
                    <td className="py-3.5 px-4">
                      <p className="text-xs text-gray-400 max-w-xs line-clamp-2" title={inq.message}>
                        {inq.message || "No message body."}
                      </p>
                    </td>

                    {/* Status Dropdown */}
                    <td className="py-3.5 px-4">
                      <select
                        value={inq.status || "NEW"}
                        onChange={(e) => handleStatusChange(inq._id, e.target.value)}
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border outline-none cursor-pointer ${
                          inq.status === "RESOLVED"
                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                            : inq.status === "IN_PROGRESS"
                            ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
                            : inq.status === "CLOSED"
                            ? "bg-gray-800 text-gray-400 border-gray-700"
                            : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                        }`}
                      >
                        <option value="NEW" className="bg-gray-900 text-amber-300">NEW</option>
                        <option value="IN_PROGRESS" className="bg-gray-900 text-blue-300">IN_PROGRESS</option>
                        <option value="RESOLVED" className="bg-gray-900 text-emerald-300">RESOLVED</option>
                        <option value="CLOSED" className="bg-gray-900 text-gray-400">CLOSED</option>
                      </select>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4">
                      <span className="text-[11px] text-gray-400 font-mono whitespace-nowrap">
                        {new Date(inq.createdAt).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {inq.phone && (
                          <a
                            href={`https://wa.me/${inq.phone.replace(/[^0-9]/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-colors"
                            title="Open WhatsApp chat"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </a>
                        )}

                        <button
                          type="button"
                          onClick={() => handleDelete(inq._id)}
                          className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 transition-colors cursor-pointer"
                          title="Delete Lead"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
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
