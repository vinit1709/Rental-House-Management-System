import React, { useState, useEffect } from 'react';
import {
    Building, CheckCircle, XCircle, Search, Loader2,
    MapPin, IndianRupee, FileText, Image as ImageIcon,
    User, ExternalLink, X, AlertTriangle, ListFilter, ShieldAlert, Ban
} from 'lucide-react';
import AxiosInstance from '../api/axiosInstance';
import { toast } from 'react-hot-toast';

const AdminProperties = () => {
    const [properties, setProperties] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('pending'); // 'pending' or 'active'

    // Review Modal State
    const [selectedProperty, setSelectedProperty] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');

    // --- 1. FETCH PROPERTIES ---
    useEffect(() => {
        fetchProperties();
    }, []);

    const fetchProperties = async () => {
        try {
            setIsLoading(true);
            const response = await AxiosInstance.get('/properties/admin/all');
            setProperties(response.data.properties || []);
        } catch (err) {
            console.error("Error fetching properties:", err);
            toast.error("Failed to load properties. Check network connection.");
        } finally {
            setIsLoading(false);
        }
    };

    // --- 2. APPROVE / REJECT / REVOKE HANDLER ---
    const handleAction = async (isApproved) => {
        if (!isApproved && !rejectionReason.trim()) {
            return toast.error("Please provide a reason for rejecting or revoking this property.");
        }

        try {
            setIsProcessing(true);

            await AxiosInstance.put(`/properties/admin/${selectedProperty._id}/approve`, {
                isApproved: isApproved,
                rejectionReason: !isApproved ? rejectionReason : undefined
            });

            toast.success(`Property ${isApproved ? 'approved' : 'rejected/revoked'} successfully!`);

            // Update local state to reflect the change immediately
            setProperties(prev => prev.map(p =>
                p._id === selectedProperty._id ? {
                    ...p,
                    isApproved: isApproved,
                    status: isApproved ? (p.status === 'pending' ? 'available' : p.status) : 'rejected'
                } : p
            ));

            // Close Modal
            setSelectedProperty(null);
            setRejectionReason('');
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to update property status.");
        } finally {
            setIsProcessing(false);
        }
    };

    // --- 3. FILTER LOGIC ---
    const filteredProperties = properties.filter(p => {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = (
            (p.title || '').toLowerCase().includes(searchLower) ||
            (p.landlordId?.name || '').toLowerCase().includes(searchLower) ||
            (p.address?.city || '').toLowerCase().includes(searchLower)
        );

        let matchesTab = false;
        if (activeTab === 'pending') {
            matchesTab = (p.status === 'pending' || p.isApproved === false) && p.status !== 'rejected';
        } else if (activeTab === 'active') {
            matchesTab = p.isApproved === true && p.status !== 'rejected';
        }

        return matchesSearch && matchesTab;
    });

    // --- 4. CALCULATE METRICS FOR THE HEADER ---
    const pendingCount = properties.filter(p => (p.status === 'pending' || p.isApproved === false) && p.status !== 'rejected').length;
    const availableCount = properties.filter(p => p.isApproved === true && p.status === 'available').length;
    const rentedCount = properties.filter(p => p.isApproved === true && p.status === 'rented').length;

    return (
        <div className="space-y-6 animate-in fade-in duration-300">

            {/* --- HEADER WITH NEW METRICS --- */}
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
                        <Building className="text-blue-600" size={28} />
                        Property Management
                    </h1>
                    <p className="text-slate-500 mt-1">Review drafts, verify ownership, and monitor active listings.</p>
                </div>

                {/* Metric Pills */}
                <div className="flex flex-wrap gap-3">
                    <div className="bg-amber-50 text-amber-700 px-4 py-2 rounded-lg font-bold border border-amber-200 flex items-center gap-2 text-sm shadow-sm">
                        <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
                        {pendingCount} Pending
                    </div>
                    <div className="bg-green-50 text-green-700 px-4 py-2 rounded-lg font-bold border border-green-200 flex items-center gap-2 text-sm shadow-sm">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        {availableCount} Available
                    </div>
                    <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg font-bold border border-blue-200 flex items-center gap-2 text-sm shadow-sm">
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        {rentedCount} Rented
                    </div>
                </div>
            </div>

            {/* --- SEARCH & TABS --- */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col lg:flex-row gap-4 justify-between items-center">

                <div className="flex p-1 bg-slate-100 rounded-lg w-full lg:w-auto">
                    <button
                        onClick={() => setActiveTab('pending')}
                        className={`flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-md text-sm font-bold transition ${activeTab === 'pending' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <ShieldAlert size={16} /> Pending Approvals
                    </button>
                    <button
                        onClick={() => setActiveTab('active')}
                        className={`flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-md text-sm font-bold transition ${activeTab === 'active' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <ListFilter size={16} /> Active Listings
                    </button>
                </div>

                <div className="relative w-full lg:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by title, city, or landlord..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 focus:bg-white transition"
                    />
                </div>
            </div>

            {/* --- QUEUE TABLE --- */}
            {isLoading ? (
                <div className="flex justify-center items-center h-64 bg-white rounded-xl border border-slate-200 shadow-sm">
                    <Loader2 className="animate-spin text-blue-600" size={40} />
                </div>
            ) : filteredProperties.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center">
                    <CheckCircle size={48} className="mx-auto text-slate-300 mb-4" />
                    <h3 className="text-xl font-bold text-slate-800 mb-2">No Properties Found</h3>
                    <p className="text-slate-500">There are no properties matching this view right now.</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                                    <th className="p-4 font-bold">Property Details</th>
                                    <th className="p-4 font-bold">Landlord</th>
                                    <th className="p-4 font-bold">Location</th>
                                    <th className="p-4 font-bold">Status</th>
                                    <th className="p-4 font-bold text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredProperties.map((property) => (
                                    <tr key={property._id} className="hover:bg-slate-50 transition">
                                        <td className="p-4">
                                            <p className="font-bold text-slate-900 line-clamp-1">{property.title}</p>
                                            <p className="text-xs text-slate-500 flex items-center gap-2 mt-1">
                                                <span className="capitalize">{property.type}</span>
                                                <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                                <span>{property.bhk} BHK</span>
                                            </p>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <User size={16} className="text-slate-400" />
                                                <span className="font-semibold text-slate-700">{property.landlordId?.name || 'Unknown'}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2 text-slate-600 text-sm">
                                                <MapPin size={16} className="text-slate-400" />
                                                {property.address?.city}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider rounded-md border ${property.status === 'rented' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                    property.status === 'available' ? 'bg-green-50 text-green-700 border-green-200' :
                                                        'bg-slate-100 text-slate-700 border-slate-200'
                                                }`}>
                                                {property.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <button
                                                onClick={() => setSelectedProperty(property)}
                                                className={`px-4 py-2 rounded-lg text-sm font-bold transition shadow-sm ${activeTab === 'pending'
                                                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                                                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                                                    }`}
                                            >
                                                {activeTab === 'pending' ? 'Review Draft' : 'View / Manage'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* --- REVIEW FULL LISTING MODAL --- */}
            {selectedProperty && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">

                        {/* Modal Header */}
                        <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50 flex-shrink-0">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 line-clamp-1 flex items-center gap-2">
                                    {selectedProperty.title}
                                    {selectedProperty.isApproved && <span className="px-2 py-0.5 text-[10px] uppercase tracking-wider bg-green-100 text-green-700 rounded border border-green-200">Approved</span>}
                                </h3>
                                <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                                    <User size={14} /> Landlord: <span className="font-bold text-slate-700">{selectedProperty.landlordId?.name}</span>
                                </p>
                            </div>
                            <button
                                onClick={() => { setSelectedProperty(null); setRejectionReason(''); }}
                                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-full transition"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Modal Body (Scrollable) */}
                        <div className="p-6 flex-1 overflow-y-auto bg-slate-100 space-y-8">

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                                {/* Left Column: Photos & Details */}
                                <div className="space-y-6">

                                    {/* Photo Gallery Box */}
                                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                                        <h4 className="font-bold text-slate-800 flex items-center gap-2 mb-4 border-b border-slate-100 pb-2">
                                            <ImageIcon className="text-blue-500" size={18} /> Property Photos ({selectedProperty.photos?.length || 0})
                                        </h4>
                                        {selectedProperty.photos?.length > 0 ? (
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                                {selectedProperty.photos.map((url, idx) => (
                                                    <a key={idx} href={url} target="_blank" rel="noreferrer" className="block relative aspect-square rounded-lg overflow-hidden border border-slate-200 group">
                                                        <img src={url} alt="Property" className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                                                            <ExternalLink className="text-white" size={20} />
                                                        </div>
                                                    </a>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="bg-amber-50 text-amber-700 p-4 rounded-lg flex items-start gap-2 border border-amber-200 text-sm">
                                                <AlertTriangle size={18} className="mt-0.5 flex-shrink-0" />
                                                <p>No photos uploaded. You may want to reject this listing until photos are provided.</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Specifications Box */}
                                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                                        <h4 className="font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Specifications</h4>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div><span className="block text-slate-500 text-xs uppercase mb-1">Type</span><span className="font-semibold capitalize">{selectedProperty.type}</span></div>
                                            <div><span className="block text-slate-500 text-xs uppercase mb-1">Config</span><span className="font-semibold">{selectedProperty.bhk} BHK</span></div>
                                            <div><span className="block text-slate-500 text-xs uppercase mb-1">Rent</span><span className="font-semibold text-green-600">₹{selectedProperty.rent?.toLocaleString('en-IN')}</span></div>
                                            <div><span className="block text-slate-500 text-xs uppercase mb-1">Deposit</span><span className="font-semibold">₹{selectedProperty.deposit?.toLocaleString('en-IN')}</span></div>
                                            <div className="col-span-2"><span className="block text-slate-500 text-xs uppercase mb-1">Location</span><span className="font-semibold">{selectedProperty.address?.street}, {selectedProperty.address?.city} - {selectedProperty.address?.pincode}</span></div>
                                        </div>
                                    </div>

                                </div>

                                {/* Right Column: Documents & Admin Rules */}
                                <div className="space-y-6">

                                    {/* Verification Documents Box */}
                                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                                        <h4 className="font-bold text-slate-800 flex items-center gap-2 mb-4 border-b border-slate-100 pb-2">
                                            <FileText className="text-purple-500" size={18} /> Legal Documents ({selectedProperty.verificationDocuments?.length || 0})
                                        </h4>
                                        {selectedProperty.verificationDocuments?.length > 0 ? (
                                            <div className="space-y-3">
                                                {selectedProperty.verificationDocuments.map((doc, idx) => (
                                                    <div key={idx} className="flex justify-between items-center p-3 bg-slate-50 border border-slate-200 rounded-lg">
                                                        <div className="flex items-center gap-3">
                                                            <FileText size={20} className="text-slate-400" />
                                                            <span className="font-bold text-slate-700 capitalize text-sm">{doc.type?.replace(/([A-Z])/g, ' $1').trim() || 'Document'}</span>
                                                        </div>
                                                        <a
                                                            href={doc.url}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="text-xs bg-white border border-slate-300 px-3 py-1.5 rounded-md font-bold text-blue-600 hover:bg-blue-50 transition flex items-center gap-1"
                                                        >
                                                            View File <ExternalLink size={12} />
                                                        </a>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-start gap-2 border border-red-200 text-sm">
                                                <AlertTriangle size={18} className="mt-0.5 flex-shrink-0" />
                                                <p>No ownership documents provided! Properties must have at least one verification document before approval.</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Description Box */}
                                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                                        <h4 className="font-bold text-slate-800 mb-2 border-b border-slate-100 pb-2">Landlord Description</h4>
                                        <p className="text-sm text-slate-600 whitespace-pre-line bg-slate-50 p-3 rounded-lg border border-slate-100 max-h-40 overflow-y-auto">
                                            {selectedProperty.description}
                                        </p>
                                    </div>

                                </div>
                            </div>
                        </div>

                        {/* Modal Footer / Action Area */}
                        <div className="p-5 border-t border-slate-200 bg-white flex flex-col sm:flex-row gap-4 justify-between items-end sm:items-center flex-shrink-0">

                            <div className="w-full sm:w-1/2">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                                    {selectedProperty.isApproved ? 'Reason for Revoking Access' : 'Rejection Reason (If rejecting)'}
                                </label>
                                <input
                                    type="text"
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    placeholder={selectedProperty.isApproved ? "e.g. Fraudulent activity, false advertising..." : "e.g. Missing lightbill, photos are too blurry..."}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 text-sm"
                                    disabled={isProcessing}
                                />
                            </div>

                            {/* DYNAMIC ACTION BUTTONS */}
                            <div className="flex gap-3 w-full sm:w-auto">
                                {!selectedProperty.isApproved ? (
                                    <>
                                        <button
                                            onClick={() => handleAction(false)} // false = rejected
                                            disabled={isProcessing || !rejectionReason.trim()}
                                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white text-red-600 border border-red-200 px-5 py-2.5 rounded-lg font-bold hover:bg-red-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isProcessing ? <Loader2 size={18} className="animate-spin" /> : <XCircle size={18} />}
                                            Reject Draft
                                        </button>
                                        <button
                                            onClick={() => handleAction(true)} // true = approved
                                            disabled={isProcessing}
                                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-lg font-bold hover:bg-green-700 transition shadow-sm disabled:opacity-50"
                                        >
                                            {isProcessing ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
                                            Approve & Publish
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={() => handleAction(false)} // Revoking sets isApproved to false
                                        disabled={isProcessing || !rejectionReason.trim()}
                                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-red-600 text-white px-5 py-2.5 rounded-lg font-bold hover:bg-red-700 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                        title="You must provide a reason to revoke."
                                    >
                                        {isProcessing ? <Loader2 size={18} className="animate-spin" /> : <Ban size={18} />}
                                        Revoke & Unpublish
                                    </button>
                                )}
                            </div>

                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default AdminProperties;