import React, { useState, useEffect } from 'react';
import {
    Calendar, MapPin, Clock, CheckCircle,
    XCircle, User, MessageSquare, Loader2, Home
} from 'lucide-react';
import { DashboardHeader } from '../../components/DashboardSharedUI';
import AxiosInstance from '../../api/axiosInstance';
import { toast } from 'react-hot-toast';

const LandlordVisits = () => {
    const [visits, setVisits] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Modal State for Reject/Reschedule
    const [activeModal, setActiveModal] = useState(null); // 'reject' or 'reschedule'
    const [selectedVisit, setSelectedVisit] = useState(null);
    const [landlordNotes, setLandlordNotes] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    // --- 1. FETCH ALL VISITS ---
    useEffect(() => {
        fetchAllVisitRequests();
    }, []);

    const fetchAllVisitRequests = async () => {
        try {
            setIsLoading(true);

            // 1. Get all properties owned by this landlord
            const propertiesRes = await AxiosInstance.get('/properties/my/listings');
            const properties = propertiesRes.data.properties || [];

            // 2. Fetch visit requests for EACH property using Promise.all
            const visitPromises = properties.map(prop =>
                AxiosInstance.get(`/properties/${prop._id}/visit-requests`)
                    .then(res => res.data.visits || [])
                    .catch(() => []) // If one fails, just return empty array for that property
            );

            const allVisitsArrays = await Promise.all(visitPromises);

            // 3. Flatten the arrays into one single inbox list and sort by newest
            const unifiedVisits = allVisitsArrays.flat().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            // ==========================================
            // 🛑 HERE IS YOUR CONSOLE LOG 🛑
            // ==========================================
            // console.log("🔥 FULL VISIT REQUESTS DATA FROM BACKEND 🔥:", unifiedVisits);
            //

            setVisits(unifiedVisits);
        } catch (err) {
            console.error("Error fetching visit requests:", err);
            toast.error("Failed to load your visit requests.");
        } finally {
            setIsLoading(false);
        }
    };

    // --- 2. HANDLE STATUS UPDATES ---
    const handleUpdateStatus = async (status) => {
        if ((status === 'rejected' || status === 'rescheduled') && !landlordNotes.trim()) {
            return toast.error("Please provide a note for the tenant.");
        }

        try {
            setIsProcessing(true);

            // Matches your router: PUT /visits/:visitId
            await AxiosInstance.put(`/properties/visits/${selectedVisit._id}`, {
                status: status,
                landlordNotes: landlordNotes || null
            });

            toast.success(`Visit request ${status}!`);

            // Update local state to reflect the change instantly
            setVisits(prev => prev.map(v =>
                v._id === selectedVisit._id
                    ? { ...v, status, landlordNotes }
                    : v
            ));

            closeModal();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to update status.");
        } finally {
            setIsProcessing(false);
        }
    };

    // Quick Approve (Bypasses Modal)
    const handleQuickApprove = async (visit) => {
        try {
            toast.loading("Approving...", { id: 'approve' });
            await AxiosInstance.put(`/properties/visits/${visit._id}`, { status: 'approved' });

            setVisits(prev => prev.map(v => v._id === visit._id ? { ...v, status: 'approved' } : v));
            toast.success("Visit approved!", { id: 'approve' });
        } catch (err) {
            toast.error("Failed to approve visit.", { id: 'approve' });
        }
    };

    // --- 3. MODAL HELPERS ---
    const openModal = (type, visit) => {
        setActiveModal(type);
        setSelectedVisit(visit);
        setLandlordNotes('');
    };

    const closeModal = () => {
        setActiveModal(null);
        setSelectedVisit(null);
        setLandlordNotes('');
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-300 relative">
            <DashboardHeader
                title="Visit Requests Inbox"
                subtitle="Manage scheduling requests from prospective tenants."
            />

            {/* --- INBOX LIST --- */}
            {isLoading ? (
                <div className="flex justify-center items-center h-64 bg-white rounded-xl border border-slate-200 shadow-sm">
                    <Loader2 className="animate-spin text-blue-600" size={40} />
                </div>
            ) : visits.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center">
                    <Calendar size={48} className="mx-auto text-slate-300 mb-4" />
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Inbox is Empty</h3>
                    <p className="text-slate-500">You don't have any pending visit requests right now.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {visits.map((visit) => {
                        // Assuming your backend manual merge attaches propertyData and tenantData
                        const propertyTitle = visit.propertyId?.title || 'Unknown Property';
                        const tenantName = visit.tenantId?.name || 'Prospective Tenant';
                        const tenantEmail = visit.tenantId?.email || 'No email provided';

                        return (
                            <div key={visit._id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col overflow-hidden">

                                {/* Header (Property Info & Status) */}
                                <div className="p-5 border-b border-slate-100 flex justify-between items-start bg-slate-50">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                            <Home size={20} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900 line-clamp-1">{propertyTitle}</p>
                                            <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full border ${visit.status === 'pending' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                                                visit.status === 'approved' ? 'bg-green-100 text-green-700 border-green-200' :
                                                    'bg-slate-200 text-slate-700 border-slate-300'
                                                }`}>
                                                {visit.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Body (Tenant & Date) */}
                                <div className="p-5 space-y-4 flex-1">

                                    {/* Tenant Details */}
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center text-slate-600 font-bold">
                                            {tenantName.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900">{tenantName}</p>
                                            <p className="text-xs text-slate-500">{tenantEmail}</p>
                                        </div>
                                    </div>

                                    {/* Requested Date */}
                                    <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3 flex items-center gap-3">
                                        <Calendar className="text-blue-500" size={20} />
                                        <div>
                                            <p className="text-xs font-bold text-slate-500 uppercase">Requested Date</p>
                                            <p className="text-sm font-bold text-slate-900">
                                                {new Date(visit.visitDate).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Tenant Message */}
                                    {visit.tenantMessage && (
                                        <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 flex items-start gap-2 italic">
                                            <MessageSquare size={16} className="text-slate-400 mt-0.5 flex-shrink-0" />
                                            <p>"{visit.tenantMessage}"</p>
                                        </div>
                                    )}
                                </div>

                                {/* Footer (Actions) */}
                                {visit.status === 'pending' && (
                                    <div className="p-4 border-t border-slate-100 bg-white grid grid-cols-3 gap-2">
                                        <button
                                            onClick={() => openModal('reject', visit)}
                                            className="flex flex-col items-center justify-center py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg transition"
                                        >
                                            <XCircle size={18} className="mb-1" /> Reject
                                        </button>
                                        <button
                                            onClick={() => openModal('reschedule', visit)}
                                            className="flex flex-col items-center justify-center py-2 text-xs font-bold text-purple-600 hover:bg-purple-50 rounded-lg transition border-x border-slate-100"
                                        >
                                            <Clock size={18} className="mb-1" /> Reschedule
                                        </button>
                                        <button
                                            onClick={() => handleQuickApprove(visit)}
                                            className="flex flex-col items-center justify-center py-2 text-xs font-bold text-green-600 hover:bg-green-50 rounded-lg transition"
                                        >
                                            <CheckCircle size={18} className="mb-1" /> Approve
                                        </button>
                                    </div>
                                )}

                            </div>
                        );
                    })}
                </div>
            )}

            {/* --- ACTION MODAL (Reject / Reschedule) --- */}
            {activeModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">

                        <div className={`p-5 border-b flex justify-between items-center ${activeModal === 'reject' ? 'bg-red-50 border-red-100' : 'bg-purple-50 border-purple-100'}`}>
                            <h3 className={`text-xl font-bold ${activeModal === 'reject' ? 'text-red-900' : 'text-purple-900'}`}>
                                {activeModal === 'reject' ? 'Reject Visit Request' : 'Suggest Reschedule'}
                            </h3>
                        </div>

                        <div className="p-6">
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                Message to Tenant <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={landlordNotes}
                                onChange={(e) => setLandlordNotes(e.target.value)}
                                placeholder={activeModal === 'reject' ? "E.g., Property is no longer available." : "E.g., I'm busy on that day, how about Friday at 4 PM?"}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px] resize-none"
                                disabled={isProcessing}
                            ></textarea>

                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={closeModal}
                                    disabled={isProcessing}
                                    className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleUpdateStatus(activeModal === 'reject' ? 'rejected' : 'rescheduled')}
                                    disabled={isProcessing || !landlordNotes.trim()}
                                    className={`flex-1 py-3 text-white font-bold rounded-xl transition shadow-md flex justify-center items-center disabled:opacity-50 ${activeModal === 'reject' ? 'bg-red-600 hover:bg-red-700' : 'bg-purple-600 hover:bg-purple-700'
                                        }`}
                                >
                                    {isProcessing ? <Loader2 size={20} className="animate-spin" /> : 'Confirm Action'}
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
};

export default LandlordVisits;