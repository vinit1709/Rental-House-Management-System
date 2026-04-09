import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    FileText, Clock, CheckCircle, AlertTriangle,
    Eye, Calendar, User, Home, Loader2, FileWarning,
    CheckSquare, IndianRupee, X, Send, MoreVertical, Ban, RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';
import AxiosInstance from '../../api/axiosInstance';
import { toast } from 'react-hot-toast';

const LandlordLeases = () => {
    const [leases, setLeases] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeDropdown, setActiveDropdown] = useState(null);

    // --- Modal States ---
    const [selectedLease, setSelectedLease] = useState(null);
    const [showBillModal, setShowBillModal] = useState(false);
    const [showRenewModal, setShowRenewModal] = useState(false); // NEW: Renewal Modal State

    // --- Processing States ---
    const [isBilling, setIsBilling] = useState(false);
    const [isProcessingId, setIsProcessingId] = useState(null);
    const [isRenewing, setIsRenewing] = useState(false); // NEW: Renewing loading state

    // --- Form States ---
    const [billForm, setBillForm] = useState({
        paymentMonth: '',
        dueDate: '',
        type: 'rent',
        amountINR: ''
    });

    const [renewForm, setRenewForm] = useState({
        newStartDate: '',
        newEndDate: '',
        newMonthlyRent: '',
        newSecurityDeposit: ''
    });

    useEffect(() => {
        fetchLeases();

        // Close dropdown when clicking outside
        const closeDropdowns = () => setActiveDropdown(null);
        document.addEventListener('click', closeDropdowns);
        return () => document.removeEventListener('click', closeDropdowns);
    }, []);

    const fetchLeases = async () => {
        try {
            setIsLoading(true);
            const response = await AxiosInstance.get('/leases');
            setLeases(response.data.leases || []);
        } catch (error) {
            console.error("Error fetching leases:", error);
            toast.error("Failed to load your lease agreements.");
        } finally {
            setIsLoading(false);
        }
    };

    // --- LEASE TERMINATION HANDLER ---
    const handleTerminate = async (leaseId) => {
        if (!window.confirm("⚠️ Are you sure you want to terminate this lease? This action cannot be undone and will end the tenant's contract immediately.")) return;

        try {
            setIsProcessingId(leaseId);
            const response = await AxiosInstance.put(`/leases/${leaseId}/terminate`);

            if (response.status === 200) {
                toast.success(response.data.message || "Lease terminated successfully.");
                setLeases(prev => prev.map(l => l._id === leaseId ? { ...l, status: 'terminated' } : l));
            } else {
                toast.error(response.data.message || "Failed to terminate leases.")
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to terminate lease.");
        } finally {
            setIsProcessingId(null);
            setActiveDropdown(null);
        }
    };

    // --- NEW: RENEWAL HANDLERS ---
    const openRenewModal = (lease, e) => {
        e.stopPropagation();
        setSelectedLease(lease);

        // Smart defaults: Start date is the day AFTER the old lease ends
        const oldEndDate = new Date(lease.endDate);
        const defaultStartDate = new Date(oldEndDate);
        defaultStartDate.setDate(defaultStartDate.getDate() + 1);

        // Default end date: 11 months after the new start date
        const defaultEndDate = new Date(defaultStartDate);
        defaultEndDate.setMonth(defaultEndDate.getMonth() + 11);

        setRenewForm({
            newStartDate: defaultStartDate.toISOString().split('T')[0],
            newEndDate: defaultEndDate.toISOString().split('T')[0],
            newMonthlyRent: lease.monthlyRent,
            newSecurityDeposit: lease.securityDeposit
        });

        setShowRenewModal(true);
        setActiveDropdown(null);
    };

    const handleRenewSubmit = async (e) => {
        e.preventDefault();
        try {
            setIsRenewing(true);
            const response = await AxiosInstance.put(`/leases/${selectedLease._id}/renew`, {
                newStartDate: renewForm.newStartDate,
                newEndDate: renewForm.newEndDate,
                newMonthlyRent: Number(renewForm.newMonthlyRent),
                newSecurityDeposit: Number(renewForm.newSecurityDeposit)
            });

            // console.log(response.data);

            if (response.status === 201) {
                toast.success("Renewal draft created successfully!");
                setShowRenewModal(false);
                fetchLeases(); // Refresh to show the newly drafted lease!
            } else {
                toast.error(response?.data?.message || "Failed to initiate renewal. " + (response?.data?.message === "Too early to renew. You can only renew a lease if it is already expired or within 30 days of its end date." ? "Check lease dates." : ""));
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to initiate renewal. " + (error.response?.data?.message === "Too early to renew. You can only renew a lease if it is already expired or within 30 days of its end date." ? "Check lease dates." : ""));
        } finally {
            setIsRenewing(false);
        }
    };

    // --- BILLING HANDLERS ---
    const openBillModal = (lease, e) => {
        e.stopPropagation();
        setSelectedLease(lease);

        const nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + 1);

        setBillForm({
            paymentMonth: format(nextMonth, 'MMMM yyyy'),
            dueDate: '',
            type: 'rent',
            amountINR: lease.monthlyRent
        });
        setShowBillModal(true);
        setActiveDropdown(null);
    };

    const handleGenerateBill = async (e) => {
        e.preventDefault();
        try {
            setIsBilling(true);
            await AxiosInstance.post('/payments/generate-invoice', {
                tenantId: selectedLease.tenantId._id,
                propertyId: selectedLease.propertyId._id,
                leaseId: selectedLease._id,
                amountINR: Number(billForm.amountINR),
                paymentMonth: billForm.paymentMonth,
                dueDate: billForm.dueDate,
                type: billForm.type
            });

            toast.success(`Invoice for ${billForm.paymentMonth} sent to tenant!`);
            setShowBillModal(false);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to generate invoice.");
        } finally {
            setIsBilling(false);
        }
    };

    // Helper function to render the correct badge style
    const getStatusBadge = (status) => {
        switch (status) {
            case 'draft':
                return { color: 'bg-slate-100 text-slate-700 border-slate-200', icon: <FileText size={14} />, text: 'Draft' };
            case 'pending_tenant_signature':
            case 'pending':
                return { color: 'bg-amber-100 text-amber-700 border-amber-200', icon: <Clock size={14} />, text: 'Waiting for Tenant' };
            case 'active':
                return { color: 'bg-green-100 text-green-700 border-green-200', icon: <CheckCircle size={14} />, text: 'Active' };
            case 'expired':
                return { color: 'bg-red-100 text-red-700 border-red-200', icon: <AlertTriangle size={14} />, text: 'Expired' };
            case 'terminated':
                return { color: 'bg-slate-800 text-slate-200 border-slate-700', icon: <FileWarning size={14} />, text: 'Terminated' };
            default:
                return { color: 'bg-gray-100 text-gray-700 border-gray-200', icon: <FileText size={14} />, text: status };
        }
    };

    return (
        <div className="max-w-6xl mx-auto pb-12 animate-in fade-in duration-300">

            {/* --- HEADER --- */}
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
                    <CheckSquare className="text-blue-600" size={32} />
                    Lease Agreements
                </h1>
                <p className="text-slate-500 mt-2">Manage your digital rental contracts, generate invoices, and handle renewals.</p>
            </div>

            {/* --- MAIN CONTENT --- */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center h-64 bg-white rounded-2xl border border-slate-200 shadow-sm">
                    <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
                    <p className="text-slate-500 font-bold">Loading documents...</p>
                </div>
            ) : leases.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center flex flex-col items-center">
                    <div className="w-20 h-20 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mb-6">
                        <FileText size={40} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">No Leases Found</h3>
                    <p className="text-slate-500 max-w-md">
                        You haven't drafted any leases yet. Go to your tenant applications to approve a tenant and generate your first contract!
                    </p>
                    <Link to="/landlord/applications" className="mt-6 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-sm">
                        View Applications
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {leases.map((lease) => {
                        const badge = getStatusBadge(lease.status);

                        return (
                            <div key={lease._id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition group relative">

                                {/* Card Header */}
                                <div className="p-5 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
                                    <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                                        <FileText size={20} />
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <span className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 border ${badge.color}`}>
                                            {badge.icon}
                                            {badge.text}
                                        </span>

                                        {/* OPTIONS MENU FOR ACTIVE/EXPIRING LEASES */}
                                        {(lease.status === 'active' || lease.status === 'expired') && (
                                            <div className="relative">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setActiveDropdown(activeDropdown === lease._id ? null : lease._id);
                                                    }}
                                                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition"
                                                >
                                                    <MoreVertical size={18} />
                                                </button>

                                                {activeDropdown === lease._id && (
                                                    <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-10 animate-in zoom-in-95 duration-100">
                                                        <button
                                                            onClick={(e) => openRenewModal(lease, e)}
                                                            className="w-full text-left px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                                        >
                                                            <RefreshCw size={16} className="text-blue-500" /> Renew Lease
                                                        </button>
                                                        <div className="h-px bg-slate-100"></div>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleTerminate(lease._id); }}
                                                            disabled={isProcessingId === lease._id}
                                                            className="w-full text-left px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2 disabled:opacity-50"
                                                        >
                                                            <Ban size={16} /> Terminate Lease
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Card Body */}
                                <div className="p-6 flex-1 flex flex-col gap-4">
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Property</p>
                                        <p className="font-bold text-slate-900 flex items-center gap-2">
                                            <Home size={16} className="text-slate-400" />
                                            {lease.propertyId?.title || "Unknown Property"}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Tenant</p>
                                        <p className="font-medium text-slate-700 flex items-center gap-2">
                                            <User size={16} className="text-slate-400" />
                                            {lease.tenantId?.name || "Unknown Tenant"}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 mt-2">
                                        <div>
                                            <p className="text-xs font-bold text-slate-400 uppercase mb-1">Duration</p>
                                            <p className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                                                <Calendar size={14} className="text-slate-400" />
                                                {format(new Date(lease.startDate), 'MMM yyyy')} - {format(new Date(lease.endDate), 'MMM yyyy')}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-400 uppercase mb-1">Monthly Rent</p>
                                            <p className="text-sm font-bold text-green-600">
                                                ₹{lease.monthlyRent?.toLocaleString('en-IN') || 0}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Card Footer / Action Buttons */}
                                <div className="p-4 border-t border-slate-100 bg-slate-50 flex gap-3">
                                    {/* Bill Tenant Button */}
                                    {lease.status === 'active' && (
                                        <button
                                            onClick={(e) => openBillModal(lease, e)}
                                            className="flex-1 py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition flex items-center justify-center gap-2 shadow-sm"
                                        >
                                            <IndianRupee size={16} />
                                            Bill Tenant
                                        </button>
                                    )}

                                    <Link
                                        to={`/landlord/leases/${lease._id}`}
                                        className="flex-1 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:border-slate-400 transition flex items-center justify-center gap-2 shadow-sm"
                                    >
                                        <Eye size={16} />
                                        {lease.status === 'draft' ? 'Review Draft' : 'View Docs'}
                                    </Link>
                                </div>

                            </div>
                        );
                    })}
                </div>
            )}

            {/* --- GENERATE INVOICE MODAL --- */}
            {showBillModal && selectedLease && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">Generate Invoice</h3>
                                <p className="text-xs text-slate-500 mt-1">For {selectedLease.tenantId?.name}</p>
                            </div>
                            <button onClick={() => setShowBillModal(false)} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-full transition">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6">
                            <form id="billingForm" onSubmit={handleGenerateBill} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">Invoice Type</label>
                                        <select
                                            value={billForm.type}
                                            onChange={(e) => setBillForm({ ...billForm, type: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                        >
                                            <option value="rent">Monthly Rent</option>
                                            <option value="deposit">Security Deposit</option>
                                            <option value="maintenance">Maintenance</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">Amount (₹)</label>
                                        <input
                                            type="number" required min="1"
                                            value={billForm.amountINR}
                                            onChange={(e) => setBillForm({ ...billForm, amountINR: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Billing Month</label>
                                    <input
                                        type="text" required placeholder="e.g., April 2026"
                                        value={billForm.paymentMonth}
                                        onChange={(e) => setBillForm({ ...billForm, paymentMonth: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Due Date</label>
                                    <input
                                        type="date" required
                                        value={billForm.dueDate}
                                        onChange={(e) => setBillForm({ ...billForm, dueDate: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                            </form>
                        </div>
                        <div className="p-5 border-t border-slate-200 bg-slate-50 flex gap-3">
                            <button type="button" onClick={() => setShowBillModal(false)} className="flex-1 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-100 transition">
                                Cancel
                            </button>
                            <button type="submit" form="billingForm" disabled={isBilling} className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-md flex items-center justify-center gap-2 disabled:opacity-70">
                                {isBilling ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />} Send Invoice
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- NEW: RENEW LEASE MODAL --- */}
            {showRenewModal && selectedLease && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">

                        <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2"><RefreshCw size={20} className="text-blue-600" /> Renew Lease</h3>
                                <p className="text-xs text-slate-500 mt-1">Draft a new contract for {selectedLease.tenantId?.name}</p>
                            </div>
                            <button onClick={() => setShowRenewModal(false)} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-full transition">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6">
                            <form id="renewForm" onSubmit={handleRenewSubmit} className="space-y-4">

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">New Start Date</label>
                                        <input
                                            type="date" required
                                            value={renewForm.newStartDate}
                                            onChange={(e) => setRenewForm({ ...renewForm, newStartDate: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">New End Date</label>
                                        <input
                                            type="date" required
                                            value={renewForm.newEndDate}
                                            onChange={(e) => setRenewForm({ ...renewForm, newEndDate: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                        />
                                    </div>
                                </div>

                                <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 space-y-4 mt-2">
                                    <p className="text-xs font-bold text-blue-800 uppercase tracking-wider">Financial Updates</p>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">New Monthly Rent (₹)</label>
                                        <input
                                            type="number" required min="1"
                                            value={renewForm.newMonthlyRent}
                                            onChange={(e) => setRenewForm({ ...renewForm, newMonthlyRent: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">New Security Deposit (₹)</label>
                                        <input
                                            type="number" required min="0"
                                            value={renewForm.newSecurityDeposit}
                                            onChange={(e) => setRenewForm({ ...renewForm, newSecurityDeposit: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>
                                </div>

                            </form>
                        </div>

                        <div className="p-5 border-t border-slate-200 bg-slate-50 flex gap-3">
                            <button type="button" onClick={() => setShowRenewModal(false)} className="flex-1 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-100 transition">
                                Cancel
                            </button>
                            <button type="submit" form="renewForm" disabled={isRenewing} className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-md flex items-center justify-center gap-2 disabled:opacity-70">
                                {isRenewing ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />} Generate Draft
                            </button>
                        </div>

                    </div>
                </div>
            )}

        </div>
    );
};

export default LandlordLeases;