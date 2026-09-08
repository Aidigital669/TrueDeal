"use client";

import { useState, useEffect } from "react";
import { 
  Users, Search, ShieldCheck, ShieldAlert, 
  Trash2, Loader2, RefreshCw, CheckCircle2, 
  UserPlus, Phone, Mail, UserCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  getAdminUsersList, 
  updateUserRoleAction, 
  deleteUserAction 
} from "@/lib/admin-actions";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await getAdminUsersList({
        search,
        role: roleFilter
      });
      if (res.success) {
        setUsers(res.users);
      }
    } catch (err) {
      console.error("Error loading users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [search, roleFilter]);

  const handleRoleChange = async (userId: string, newRole: any) => {
    const res = await updateUserRoleAction(userId, newRole);
    if (res.success) {
      setActionNotice(`User role updated to ${newRole}`);
      setTimeout(() => setActionNotice(null), 3000);
      loadUsers();
    }
  };

  const handleDeleteUser = async (userId: string, name: string) => {
    if (!confirm(`Are you sure you want to delete user account "${name}"?`)) return;
    const res = await deleteUserAction(userId);
    if (res.success) {
      setActionNotice(`User "${name}" deleted.`);
      setTimeout(() => setActionNotice(null), 3000);
      loadUsers();
    }
  };

  const adminCount = users.filter(u => u.role === "admin" || u.isAdmin).length;
  const sellerCount = users.filter(u => u.role === "seller").length;
  const customerCount = users.filter(u => u.role === "customer").length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-400" />
            User & Role Elevation Center
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Manage customer, merchant, and super administrator access levels across the platform.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={loadUsers}
            variant="outline"
            className="bg-gray-900 border-gray-800 text-gray-300 hover:text-white text-xs font-bold rounded-xl h-10 px-3 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Refresh
          </Button>
        </div>
      </div>

      {actionNotice && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold rounded-2xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Role Counts */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="bg-[#0f1118] border border-gray-800 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Super Admins</span>
            <div className="text-2xl font-black text-indigo-400 mt-1">{adminCount}</div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#0f1118] border border-gray-800 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Merchants / Sellers</span>
            <div className="text-2xl font-black text-amber-400 mt-1">{sellerCount}</div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#0f1118] border border-gray-800 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Registered Buyers</span>
            <div className="text-2xl font-black text-emerald-400 mt-1">{customerCount}</div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-[#0f1118] border border-gray-800 rounded-3xl p-4 shadow-xl flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search users by name, email, phone, role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-900 border border-gray-800 text-xs font-semibold text-white placeholder:text-gray-500 focus:border-emerald-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-gray-900 border border-gray-800 text-gray-300 rounded-xl px-3 py-2 text-xs font-semibold focus:border-emerald-500 outline-none"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admins Only</option>
            <option value="seller">Sellers Only</option>
            <option value="customer">Customers Only</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-[#0f1118] border border-gray-800 rounded-3xl shadow-xl overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-2 text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
            <span className="text-xs font-bold">Querying User Accounts...</span>
          </div>
        ) : users.length === 0 ? (
          <div className="py-16 text-center text-gray-500 text-xs font-semibold">
            No users found matching the current criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-gray-900/80 text-gray-400 font-bold uppercase text-[10px] tracking-wider border-b border-gray-800">
                <tr>
                  <th className="py-3.5 px-4">User</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Phone / OTP</th>
                  <th className="py-3.5 px-4">Role Access</th>
                  <th className="py-3.5 px-4">Registered Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60 font-medium">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-gray-900/40 transition-colors">
                    
                    {/* Name */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-white font-black text-xs shrink-0">
                          {u.name?.slice(0, 2).toUpperCase() || "U"}
                        </div>
                        <div className="font-bold text-white text-xs truncate max-w-[160px]">
                          {u.name}
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="py-3.5 px-4">
                      <span className="text-gray-300 font-mono text-[11px] truncate block max-w-[200px]">
                        {u.email || "No email"}
                      </span>
                    </td>

                    {/* Phone / OTP */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[11px] text-gray-300">
                          {u.phone || "—"}
                        </span>
                        {u.isVerified && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="Verified Phone" />
                        )}
                      </div>
                    </td>

                    {/* Role Access Dropdown */}
                    <td className="py-3.5 px-4">
                      <select
                        value={u.role || "customer"}
                        onChange={(e) => handleRoleChange(u._id, e.target.value)}
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border outline-none cursor-pointer ${
                          u.role === "admin"
                            ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/40"
                            : u.role === "seller"
                            ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                            : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                        }`}
                      >
                        <option value="customer" className="bg-gray-900 text-emerald-300">Customer (Buyer)</option>
                        <option value="seller" className="bg-gray-900 text-amber-300">Seller (Merchant)</option>
                        <option value="admin" className="bg-gray-900 text-indigo-300">Admin (Full Access)</option>
                      </select>
                    </td>

                    {/* Registered Date */}
                    <td className="py-3.5 px-4">
                      <span className="text-[11px] text-gray-400 font-mono">
                        {new Date(u.createdAt).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric"
                        })}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleDeleteUser(u._id, u.name)}
                        className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 transition-colors cursor-pointer"
                        title="Delete User Account"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
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
