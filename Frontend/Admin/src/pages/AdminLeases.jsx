import React, { useState, useEffect } from 'react';
import {
    FileText, Search, Loader2, Calendar, MapPin,
    User, CheckCircle, AlertTriangle, XCircle, ChevronRight, X, Clock
} from 'lucide-react';
import AxiosInstance from '../api/axiosInstance';
import { toast } from 'react-hot-toast';

const AdminLeases = () => {
    const [leases, setLeases] = useState([]);
    const [expiringLeases, setExpiringLeases] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('active'); // 'active', 'expiring', 'past'

    // Modal State
    const [selectedLease, setSelectedLease] = useState(null);

    // --- 1. FETCH LEASE DATA ---
    useEffect(() => {
        fetchLeases();
    }, []);

    const fetchLeases = async () => {
        try {
            setIsLoading(true);

            // Fetch both endpoints simultaneously based on your API document
            const [allRes, expiringRes] = await Promise.all([
                AxiosInstance.get('/leases/admin/all').catch(() => ({ data: { leases: [] } })),
                AxiosInstance.get('/leases/admin/expiring/soon').catch(() => ({ data: { leases: [] } }))
            ]);

            // console.log(allRes);

            setLeases(allRes.data.leases || []);
            setExpiringLeases(expiringRes.data.leases || []);

        } catch (err) {
            console.error("Error fetching leases:", err);
            toast.error("Failed to load lease agreements.");
        } finally {
            setIsLoading(false);
        }
    };

    // --- 2. FILTER LOGIC ---
    const getFilteredLeases = () => {
        let baseList = [];

        if (activeTab === 'expiring') {
            baseList = expiringLeases; // Use the specific endpoint data for this tab
        } else if (activeTab === 'active') {
            baseList = leases.filter(l => l.status === 'active');
        } else {
            baseList = leases.filter(l => l.status === 'terminated' || l.status === 'expired' || l.status === 'rejected');
        }

        const searchLower = searchTerm.toLowerCase();
        return baseList.filter(l =>
            (l.propertyId?.title || '').toLowerCase().includes(searchLower) ||
            (l.tenantId?.name || '').toLowerCase().includes(searchLower) ||
            (l.landlordId?.name || '').toLowerCase().includes(searchLower)
        );
    };

    const filteredLeases = getFilteredLeases();

    // --- 3. METRICS FOR HEADER ---
    const activeCount = leases.filter(l => l.status === 'active').length;
    const expiringCount = expiringLeases.length;
    const pastCount = leases.filter(l => l.status === 'terminated' || l.status === 'expired').length;

    // --- 4. UI HELPERS ---
    const getStatusBadge = (status) => {
        switch (status) {
            case 'active': return <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-green-200"><CheckCircle size={12} /> Active</span>;
            case 'pending': return <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-blue-200"><Clock size={12} /> Pending Signatures</span>;
            case 'expired': return <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-amber-200"><AlertTriangle size={12} /> Expired</span>;
            case 'terminated': return <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-red-200"><XCircle size={12} /> Terminated</span>;
            default: return <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-slate-200">{status}</span>;
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-300">

            {/* --- HEADER --- */}
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
                        <FileText className="text-blue-600" size={28} />
                        Lease Agreements
                    </h1>
                    <p className="text-slate-500 mt-1">Audit active contracts, track expiries, and review rental terms.</p>
                </div>

                {/* Metric Pills */}
                <div className="flex flex-wrap gap-3">
                    <div className="bg-green-50 text-green-700 px-4 py-2 rounded-lg font-bold border border-green-200 flex items-center gap-2 text-sm shadow-sm">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        {activeCount} Active
                    </div>
                    <div className="bg-amber-50 text-amber-700 px-4 py-2 rounded-lg font-bold border border-amber-200 flex items-center gap-2 text-sm shadow-sm">
                        <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
                        {expiringCount} Expiring Soon
                    </div>
                    <div className="bg-slate-50 text-slate-700 px-4 py-2 rounded-lg font-bold border border-slate-200 flex items-center gap-2 text-sm shadow-sm">
                        <span className="w-2 h-2 bg-slate-400 rounded-full"></span>
                        {pastCount} Past
                    </div>
                </div>
            </div>

            {/* --- SEARCH & TABS --- */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col lg:flex-row gap-4 justify-between items-center">

                {/* Tabs */}
                <div className="flex p-1 bg-slate-100 rounded-lg w-full lg:w-auto">
                    <button
                        onClick={() => setActiveTab('active')}
                        className={`flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-md text-sm font-bold transition ${activeTab === 'active' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <CheckCircle size={16} /> Active Leases
                    </button>
                    <button
                        onClick={() => setActiveTab('expiring')}
                        className={`flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-md text-sm font-bold transition ${activeTab === 'expiring' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <AlertTriangle size={16} /> Expiring <span className="hidden sm:inline">Soon</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('past')}
                        className={`flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-md text-sm font-bold transition ${activeTab === 'past' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <Clock size={16} /> Past / Terminated
                    </button>
                </div>

                {/* Search */}
                <div className="relative w-full lg:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by property, tenant, or landlord..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 focus:bg-white transition"
                    />
                </div>
            </div>

            {/* --- LEASE TABLE --- */}
            {isLoading ? (
                <div className="flex justify-center items-center h-64 bg-white rounded-xl border border-slate-200 shadow-sm">
                    <Loader2 className="animate-spin text-blue-600" size={40} />
                </div>
            ) : filteredLeases.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center">
                    <FileText size={48} className="mx-auto text-slate-300 mb-4" />
                    <h3 className="text-xl font-bold text-slate-800 mb-2">No Leases Found</h3>
                    <p className="text-slate-500">There are no lease agreements matching this category.</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                                    <th className="p-4 font-bold">Property & Term</th>
                                    <th className="p-4 font-bold">Parties Involved</th>
                                    <th className="p-4 font-bold">Rent Amount</th>
                                    <th className="p-4 font-bold">Status</th>
                                    <th className="p-4 font-bold text-right">Details</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredLeases.map((lease) => (
                                    <tr key={lease._id} className="hover:bg-slate-50 transition">
                                        <td className="p-4">
                                            <p className="font-bold text-slate-900 line-clamp-1 flex items-center gap-1"><MapPin size={14} className="text-slate-400" /> {lease.propertyId?.title || 'Unknown Property'}</p>
                                            <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                                                <Calendar size={12} /> {new Date(lease.startDate).toLocaleDateString('en-IN')} - {new Date(lease.endDate).toLocaleDateString('en-IN')}
                                            </p>
                                        </td>
                                        <td className="p-4">
                                            <div className="space-y-1">
                                                <p className="text-sm font-semibold text-slate-800 flex items-center gap-2"><User size={14} className="text-blue-500" /> {lease.tenantId?.name || 'Tenant'}</p>
                                                <p className="text-xs text-slate-500 flex items-center gap-2"><User size={14} className="text-purple-500" /> {lease.landlordId?.name || 'Landlord'}</p>
                                            </div>
                                        </td>
                                        <td className="p-4 font-bold text-slate-900">
                                            ₹{lease.monthlyRent?.toLocaleString('en-IN')}<span className="text-xs text-slate-400 font-medium">/mo</span>
                                        </td>
                                        <td className="p-4">
                                            {getStatusBadge(lease.status)}
                                        </td>
                                        <td className="p-4 text-right">
                                            <button
                                                onClick={() => setSelectedLease(lease)}
                                                className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-50 transition shadow-sm inline-flex items-center gap-1"
                                            >
                                                View <ChevronRight size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* --- LEASE DETAILS MODAL --- */}
            {selectedLease && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden animate-in zoom-in-95 duration-200">

                        {/* Modal Header */}
                        <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                    <FileText className="text-blue-600" size={24} /> Lease Agreement Details
                                </h3>
                                <p className="text-sm text-slate-500 mt-1">ID: #{selectedLease._id.slice(-8).toUpperCase()}</p>
                            </div>
                            <button
                                onClick={() => setSelectedLease(null)}
                                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-full transition"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 bg-white space-y-6">

                            {/* Top Status Banner */}
                            <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Current Status</p>
                                    {getStatusBadge(selectedLease.status)}
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Contract Duration</p>
                                    <p className="font-bold text-slate-900 flex items-center gap-1 justify-end">
                                        <Calendar size={14} className="text-blue-500" />
                                        {new Date(selectedLease.startDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })} - {new Date(selectedLease.endDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Left Column */}
                                <div className="space-y-6">
                                    <div>
                                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 border-b border-slate-100 pb-1">Property Details</h4>
                                        <p className="font-bold text-slate-900 text-lg">{selectedLease.propertyId?.title || 'Unknown Property'}</p>
                                        <p className="text-sm text-slate-600 mt-1">{selectedLease.propertyId?.address?.street}, {selectedLease.propertyId?.address?.city}</p>
                                    </div>

                                    <div>
                                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 border-b border-slate-100 pb-1">Involved Parties</h4>
                                        <div className="space-y-3">
                                            <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                                                <p className="text-[10px] font-bold text-blue-500 uppercase">Tenant</p>
                                                <p className="font-bold text-blue-900">{selectedLease.tenantId?.name || 'N/A'}</p>
                                                <p className="text-xs text-blue-700">{selectedLease.tenantId?.email || 'No email'}</p>
                                            </div>
                                            <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
                                                <p className="text-[10px] font-bold text-purple-500 uppercase">Landlord</p>
                                                <p className="font-bold text-purple-900">{selectedLease.landlordId?.name || 'N/A'}</p>
                                                <p className="text-xs text-purple-700">{selectedLease.landlordId?.email || 'No email'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column */}
                                <div className="space-y-6">
                                    <div>
                                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 border-b border-slate-100 pb-1">Financial Terms</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                                <p className="text-[10px] font-bold text-slate-500 uppercase">Monthly Rent</p>
                                                <p className="text-lg font-extrabold text-slate-900">₹{selectedLease.monthlyRent?.toLocaleString('en-IN')}</p>
                                            </div>
                                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                                <p className="text-[10px] font-bold text-slate-500 uppercase">Security Deposit</p>
                                                <p className="text-lg font-extrabold text-slate-900">₹{selectedLease.securityDeposit?.toLocaleString('en-IN')}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 border-b border-slate-100 pb-1">Agreed Terms & Conditions</h4>
                                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 max-h-40 overflow-y-auto text-sm text-slate-600 whitespace-pre-line leading-relaxed">
                                            {selectedLease.terms || "No specific terms provided in this agreement."}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminLeases;