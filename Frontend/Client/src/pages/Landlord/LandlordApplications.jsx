import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users, CheckCircle, XCircle, Home,
    MessageSquare, Calendar, Loader2, X, FileText
} from 'lucide-react';
import AxiosInstance from '../../api/axiosInstance';
import { toast } from 'react-hot-toast';

const LandlordApplications = () => {
    const navigate = useNavigate();
    const [applications, setApplications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);

    // Reject Modal State
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [selectedApp, setSelectedApp] = useState(null);
    const [rejectReason, setRejectReason] = useState('');

    // --- NEW: Lease Modal State ---
    const [showLeaseModal, setShowLeaseModal] = useState(false);
    const [leaseForm, setLeaseForm] = useState({
        monthlyRent: '',
        securityDeposit: '',
        startDate: '',
        endDate: '',
        rentDueDay: 5, // Default to the 5th of the month
        specialClauses: '' // Will split by newlines into an array
    });

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        try {
            setIsLoading(true);
            const response = await AxiosInstance.get(`/tenants/landlord/applications`);
            console.log(response.data);
            setApplications(response.data.applications || []);
        } catch (error) {
            console.error("Error fetching applications:", error);
            toast.error("Failed to load your applications.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleApprove = async (applicationId) => {
        if (!window.confirm("Are you sure you want to approve this tenant?")) return;

        try {
            setProcessingId(applicationId);
            await AxiosInstance.put(`/tenants/applications/${applicationId}/status`, {
                status: 'approved'
            });

            toast.success("Tenant approved successfully! You can now draft a lease.");
            fetchApplications();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to approve tenant.");
        } finally {
            setProcessingId(null);
        }
    };

    const handleRejectSubmit = async (e) => {
        e.preventDefault();
        if (!rejectReason.trim()) return toast.error("Please provide a reason.");

        try {
            setProcessingId(selectedApp._id);
            await AxiosInstance.put(`/tenants/applications/${selectedApp._id}/status`, {
                status: 'rejected',
                rejectionReason: rejectReason
            });

            toast.success("Application rejected.");
            setShowRejectModal(false);
            setRejectReason('');
            setSelectedApp(null);
            fetchApplications();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to reject application.");
        } finally {
            setProcessingId(null);
        }
    };

    const openRejectModal = (app) => {
        setSelectedApp(app);
        setRejectReason('');
        setShowRejectModal(true);
    };

    // --- NEW: Lease Handlers ---
    const openLeaseModal = (app) => {
        setSelectedApp(app);
        setLeaseForm({
            monthlyRent: app.propertyId.rent || '', // We leave these blank so the landlord can input final negotiated prices
            securityDeposit: app.propertyId.deposit || '',
            startDate: '',
            endDate: '',
            rentDueDay: 5,
            specialClauses: ''
        });
        setShowLeaseModal(true);
    };

    const handleLeaseChange = (e) => {
        const { name, value } = e.target;
        setLeaseForm(prev => ({ ...prev, [name]: value }));
    };

    const handleLeaseSubmit = async (e) => {
        e.preventDefault();
        try {
            setProcessingId(selectedApp._id);

            // Convert textarea lines into an array of strings for the backend
            const clausesArray = leaseForm.specialClauses
                .split('\n')
                .map(clause => clause.trim())
                .filter(clause => clause.length > 0);

            const payload = {
                applicationId: selectedApp._id,
                monthlyRent: Number(leaseForm.monthlyRent),
                securityDeposit: Number(leaseForm.securityDeposit),
                rentDueDay: Number(leaseForm.rentDueDay),
                startDate: leaseForm.startDate,
                endDate: leaseForm.endDate,
                specialClauses: clausesArray
            };

            await AxiosInstance.post('/leases', payload);

            toast.success("Lease drafted successfully!");
            setShowLeaseModal(false);

            // Redirect landlord to their leases dashboard (We will build this next!)
            navigate('/landlord/leases');

        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to draft lease.");
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <div className="max-w-6xl mx-auto pb-12 animate-in fade-in duration-300">

            <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
                    <Users className="text-blue-600" size={32} />
                    All Tenant Applications
                </h1>
                <p className="text-slate-500 mt-2">Manage and review all tenants applying across all your properties.</p>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center h-64 bg-white rounded-2xl border border-slate-200 shadow-sm">
                    <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
                    <p className="text-slate-500 font-bold">Loading applicants...</p>
                </div>
            ) : applications.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center flex flex-col items-center">
                    <div className="w-20 h-20 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mb-6">
                        <Users size={40} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">No Applicants Yet</h3>
                    <p className="text-slate-500 max-w-md">
                        You haven't received any applications yet. Make sure your listings look great to attract tenants!
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {applications.map((app) => (
                        <div key={app._id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row hover:shadow-md transition">

                            {/* Applicant Info */}
                            <div className="p-6 flex-1 border-b md:border-b-0 md:border-r border-slate-100">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900">{app.tenantId.name}</h3>

                                        <p className="text-sm font-bold text-blue-600 flex items-center gap-1 mt-2">
                                            <Home size={14} /> {app.propertyId.title}
                                        </p>

                                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                                            <Calendar size={14} /> Applied on {new Date(app.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase ${app.status === 'approved' ? 'bg-green-100 text-green-700' :
                                        app.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                            'bg-amber-100 text-amber-700'
                                        }`}>
                                        {app.status}
                                    </span>
                                </div>

                                {app.message ? (
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                        <p className="text-xs font-bold text-slate-400 uppercase mb-2 flex items-center gap-1">
                                            <MessageSquare size={14} /> Message from Tenant
                                        </p>
                                        <p className="text-sm text-slate-700 italic">"{app.message}"</p>
                                    </div>
                                ) : (
                                    <p className="text-sm text-slate-400 italic">No message provided by the tenant.</p>
                                )}
                            </div>

                            {/* Actions Panel */}
                            <div className="p-6 md:w-64 bg-slate-50 flex flex-col justify-center gap-3">
                                {app.status === 'pending' ? (
                                    <>
                                        <button
                                            onClick={() => handleApprove(app._id)}
                                            disabled={processingId === app._id}
                                            className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-70"
                                        >
                                            {processingId === app._id ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => openRejectModal(app)}
                                            disabled={processingId === app._id}
                                            className="w-full bg-white text-red-600 border border-red-200 py-3 rounded-xl font-bold hover:bg-red-50 transition flex items-center justify-center gap-2 disabled:opacity-70"
                                        >
                                            <XCircle size={18} />
                                            Reject
                                        </button>
                                    </>
                                ) : (
                                    <div className="text-center flex flex-col items-center justify-center h-full">
                                        <p className="text-sm font-bold text-slate-500 uppercase mb-1">Decision Made</p>
                                        <p className={`text-lg font-extrabold mb-4 ${app.status === 'approved' ? 'text-green-600' : 'text-red-600'}`}>
                                            {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                                        </p>

                                        {/* NEW: Draft Lease Button only shows if approved! */}
                                        {app.status === 'approved' && (
                                            <button
                                                onClick={() => openLeaseModal(app)}
                                                className="w-full bg-slate-900 text-white py-2.5 rounded-lg font-bold hover:bg-slate-800 transition shadow flex items-center justify-center gap-2"
                                            >
                                                <FileText size={16} />
                                                Draft Lease
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* --- REJECT MODAL (Unchanged) --- */}
            {showRejectModal && selectedApp && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                        {/* ... your existing reject modal code ... */}
                        <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-red-50">
                            <h3 className="text-xl font-bold text-red-900">Reject Application</h3>
                            <button onClick={() => setShowRejectModal(false)} className="p-2 text-red-400 hover:text-red-700 hover:bg-red-100 rounded-full transition">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="p-6">
                            <form onSubmit={handleRejectSubmit}>
                                <div className="mb-6">
                                    <textarea rows="3" placeholder="Reason for rejection..." value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 transition resize-none" required disabled={processingId === selectedApp._id} />
                                </div>
                                <div className="flex gap-3">
                                    <button type="button" onClick={() => setShowRejectModal(false)} disabled={processingId === selectedApp._id} className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition">Cancel</button>
                                    <button type="submit" disabled={processingId === selectedApp._id || !rejectReason.trim()} className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition shadow-md flex justify-center items-center disabled:opacity-70">
                                        {processingId === selectedApp._id ? <Loader2 size={20} className="animate-spin" /> : 'Reject'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* --- NEW: DRAFT LEASE MODAL --- */}
            {showLeaseModal && selectedApp && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">

                        <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-blue-50">
                            <div>
                                <h3 className="text-xl font-bold text-blue-900">Draft Lease Agreement</h3>
                                <p className="text-sm text-blue-700 mt-1">For {selectedApp.tenantId.name}</p>
                                <p className="text-sm text-blue-700 mt-1">for property {selectedApp.propertyId.title}</p>
                            </div>
                            <button onClick={() => setShowLeaseModal(false)} className="p-2 text-blue-400 hover:text-blue-700 hover:bg-blue-100 rounded-full transition">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto">
                            <form id="leaseForm" onSubmit={handleLeaseSubmit} className="space-y-5">

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">Final Monthly Rent (₹)</label>
                                        <input type="number" name="monthlyRent" value={leaseForm.monthlyRent} onChange={handleLeaseChange} required min="1" className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">Security Deposit (₹)</label>
                                        <input type="number" name="securityDeposit" value={leaseForm.securityDeposit} onChange={handleLeaseChange} required min="1" className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">Start Date</label>
                                        <input type="date" name="startDate" value={leaseForm.startDate} onChange={handleLeaseChange} required className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">End Date</label>
                                        <input type="date" name="endDate" value={leaseForm.endDate} onChange={handleLeaseChange} required className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Rent Due Day (1-31)</label>
                                    <input type="number" name="rentDueDay" value={leaseForm.rentDueDay} onChange={handleLeaseChange} required min="1" max="31" className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none" />
                                    <p className="text-xs text-slate-500 mt-1">Example: "5" means rent is expected on the 5th of every month.</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Special Clauses (Optional)</label>
                                    <textarea name="specialClauses" value={leaseForm.specialClauses} onChange={handleLeaseChange} rows="4" placeholder="Enter each clause on a new line (e.g., No pets allowed.)" className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none resize-none"></textarea>
                                </div>
                            </form>
                        </div>

                        <div className="p-5 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
                            <button type="button" onClick={() => setShowLeaseModal(false)} className="px-6 py-2.5 text-slate-600 font-bold hover:bg-slate-200 rounded-lg transition">Cancel</button>
                            <button type="submit" form="leaseForm" disabled={processingId === selectedApp._id} className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition shadow flex items-center gap-2">
                                {processingId === selectedApp._id ? <Loader2 size={18} className="animate-spin" /> : <FileText size={18} />}
                                Generate Draft
                            </button>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
};

export default LandlordApplications;