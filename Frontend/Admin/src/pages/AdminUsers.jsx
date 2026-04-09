import React, { useState, useEffect } from 'react';
import {
    Users, Search, Filter, Shield, ClipboardClock,
    CheckCircle, Ban, Loader2, User, Mail, Calendar, Trash2
} from 'lucide-react';
import AxiosInstance from '../api/axiosInstance';
import { toast } from 'react-hot-toast';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all'); // all, tenant, landlord, admin

    // Action States
    const [isProcessingId, setIsProcessingId] = useState(null);
    const [isDeletingId, setIsDeletingId] = useState(null); // NEW: Track deletion state

    // --- 1. FETCH USERS ---
    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setIsLoading(true);
            const response = await AxiosInstance.get('/auth/admin/users');
            setUsers(response.data.users || []);
        } catch (err) {
            console.error("Error fetching users:", err);
            toast.error("Failed to load user data. Please check your connection.");
        } finally {
            setIsLoading(false);
        }
    };

    // --- 2. SUSPEND / ACTIVATE HANDLER ---
    const handleToggleStatus = async (userId, currentStatus) => {
        const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
        const confirmMessage = newStatus === 'suspended'
            ? "Are you sure you want to suspend this user? They will not be able to log in."
            : "Reactivate this user account?";

        if (!window.confirm(confirmMessage)) return;

        try {
            setIsProcessingId(userId);
            await AxiosInstance.put(`/auth/admin/users/${userId}/status`, { status: newStatus });

            // Update local state instantly
            setUsers(prev => prev.map(u => u._id === userId ? { ...u, accountStatus: newStatus } : u));
            toast.success(`User account ${newStatus} successfully.`);
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to update user status.");
        } finally {
            setIsProcessingId(null);
        }
    };

    // --- 3. HARD DELETE HANDLER (NEW) ---
    const handleDeleteUser = async (userId) => {
        const confirmMessage = "⚠️ DANGER: Are you absolutely sure you want to PERMANENTLY delete this user? This action cannot be undone and will erase their account data.";

        if (!window.confirm(confirmMessage)) return;

        try {
            setIsDeletingId(userId);
            await AxiosInstance.delete(`/auth/admin/users/${userId}`);

            // Remove user from the UI instantly
            setUsers(prev => prev.filter(u => u._id !== userId));
            toast.success("User permanently deleted from the platform.");
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to delete user.");
        } finally {
            setIsDeletingId(null);
        }
    };

    // --- 4. FILTERING LOGIC ---
    const filteredUsers = users.filter(u => {
        const matchesSearch =
            (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (u.email || '').toLowerCase().includes(searchTerm.toLowerCase());

        const matchesRole = roleFilter === 'all' || u.role === roleFilter;

        return matchesSearch && matchesRole;
    });

    // --- 5. UI HELPERS ---
    const getRoleBadge = (role) => {
        switch (role) {
            case 'landlord': return <span className="px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider rounded-md border bg-purple-50 text-purple-700 border-purple-200">Landlord</span>;
            case 'tenant': return <span className="px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider rounded-md border bg-blue-50 text-blue-700 border-blue-200">Tenant</span>;
            case 'admin': return <span className="px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider rounded-md border bg-slate-900 text-white border-slate-700">Admin</span>;
            default: return <span className="px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider rounded-md border bg-slate-100 text-slate-700 border-slate-200">User</span>;
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-300">

            {/* --- HEADER --- */}
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
                        <Users className="text-blue-600" size={28} />
                        Manage Users
                    </h1>
                    <p className="text-slate-500 mt-1">Search accounts, filter by role, and manage platform access.</p>
                </div>
                <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg font-bold border border-blue-100 flex items-center gap-2">
                    Total Registered: {users.length}
                </div>
            </div>

            {/* --- SEARCH & FILTER BAR --- */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">

                {/* Search */}
                <div className="relative w-full md:max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 focus:bg-white transition"
                    />
                </div>

                {/* Filters */}
                <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                    <Filter className="text-slate-400 flex-shrink-0" size={18} />
                    {['all', 'tenant', 'landlord', 'admin'].map((role) => (
                        <button
                            key={role}
                            onClick={() => setRoleFilter(role)}
                            className={`px-4 py-2 rounded-lg text-sm font-bold capitalize transition whitespace-nowrap ${roleFilter === role
                                ? 'bg-slate-900 text-white shadow-md'
                                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                                }`}
                        >
                            {role}
                        </button>
                    ))}
                </div>
            </div>

            {/* --- USER TABLE --- */}
            {isLoading ? (
                <div className="flex justify-center items-center h-64 bg-white rounded-xl border border-slate-200 shadow-sm">
                    <Loader2 className="animate-spin text-blue-600" size={40} />
                </div>
            ) : filteredUsers.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center">
                    <Users size={48} className="mx-auto text-slate-300 mb-4" />
                    <h3 className="text-xl font-bold text-slate-800 mb-2">No Users Found</h3>
                    <p className="text-slate-500">Try adjusting your search query or role filters.</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                                    <th className="p-4 font-bold">User</th>
                                    <th className="p-4 font-bold">Role</th>
                                    <th className="p-4 font-bold">Verification</th>
                                    <th className="p-4 font-bold">Joined</th>
                                    <th className="p-4 font-bold text-center">Status</th>
                                    <th className="p-4 font-bold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredUsers.map((user) => (
                                    <tr key={user._id} className={`transition ${user.accountStatus === 'suspended' ? 'bg-red-50/30' : 'hover:bg-slate-50'}`}>

                                        {/* User Info */}
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-slate-200 text-slate-600 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                                                    {user.name?.charAt(0).toUpperCase() || <User size={18} />}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900 line-clamp-1">{user.name}</p>
                                                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                                        <Mail size={12} /> {user.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Role */}
                                        <td className="p-4">
                                            {getRoleBadge(user.role)}
                                        </td>

                                        {/* Verification Status */}
                                        <td className="p-4">
                                            {user.verificationStatus === 'verified' ? (
                                                <span className="flex items-center gap-1 text-xs font-bold text-green-600"><CheckCircle size={14} /> Verified</span>
                                            ) : user.verificationStatus === 'pending' ? (
                                                <span className="flex items-center gap-1 text-xs font-bold text-amber-600"><ClipboardClock size={14} /> Pending</span>
                                            ) : (
                                                <span className="flex items-center gap-1 text-xs font-bold text-slate-400"><Shield size={14} /> Unverified</span>
                                            )}
                                        </td>

                                        {/* Joined Date */}
                                        <td className="p-4 text-sm font-medium text-slate-600">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar size={14} className="text-slate-400" />
                                                {new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </div>
                                        </td>

                                        {/* Account Status */}
                                        <td className="p-4 text-center">
                                            {user.accountStatus === 'suspended' ? (
                                                <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 px-2.5 py-1 rounded-full text-xs font-bold border border-red-200">
                                                    <Ban size={12} /> Suspended
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2.5 py-1 rounded-full text-xs font-bold border border-green-200">
                                                    <CheckCircle size={12} /> Active
                                                </span>
                                            )}
                                        </td>

                                        {/* Actions */}
                                        <td className="p-4 text-right">
                                            {user.role === 'admin' ? (
                                                <span className="text-xs text-slate-400 font-medium italic">Cannot modify admin</span>
                                            ) : (
                                                <div className="flex items-center justify-end gap-2">
                                                    {/* Suspend / Restore Button */}
                                                    <button
                                                        onClick={() => handleToggleStatus(user._id, user.accountStatus || 'active')}
                                                        disabled={isProcessingId === user._id || isDeletingId === user._id}
                                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 ${user.accountStatus === 'suspended'
                                                            ? 'bg-slate-900 text-white hover:bg-slate-800'
                                                            : 'bg-orange-50 text-orange-600 border border-orange-200 hover:bg-orange-100'
                                                            }`}
                                                    >
                                                        {isProcessingId === user._id ? (
                                                            <Loader2 size={14} className="animate-spin" />
                                                        ) : user.accountStatus === 'suspended' ? (
                                                            <>Restore</>
                                                        ) : (
                                                            <><Ban size={14} /> Suspend</>
                                                        )}
                                                    </button>

                                                    {/* NEW: Permanent Delete Button */}
                                                    <button
                                                        onClick={() => handleDeleteUser(user._id)}
                                                        disabled={isDeletingId === user._id || isProcessingId === user._id}
                                                        title="Permanently Delete User"
                                                        className="p-1.5 rounded-lg text-red-600 bg-red-50 border border-red-200 hover:bg-red-600 hover:text-white transition disabled:opacity-50"
                                                    >
                                                        {isDeletingId === user._id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUsers;