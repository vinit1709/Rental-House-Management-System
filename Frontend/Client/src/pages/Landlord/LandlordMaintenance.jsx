import React, { useState, useEffect } from 'react';
import {
    Wrench, AlertCircle, CheckCircle, Clock,
    MapPin, User, Calendar, Loader2, IndianRupee, X
} from 'lucide-react';
import { DashboardHeader } from '../../components/DashboardSharedUI';
import AxiosInstance from '../../api/axiosInstance';
import { toast } from 'react-hot-toast';

const LandlordMaintenance = () => {
    const [requests, setRequests] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterStatus, setFilterStatus] = useState('all'); // all, pending, in-progress, resolved
    const [updatingId, setUpdatingId] = useState(null);

    // Modal States
    const [activeModal, setActiveModal] = useState(null); // 'assign', 'resolve', null
    const [selectedRequest, setSelectedRequest] = useState(null);

    // Form States
    const [vendorForm, setVendorForm] = useState({ vendorName: '', vendorContact: '', scheduledDate: '' });
    const [expenseForm, setExpenseForm] = useState({ amount: '', title: '', description: '' });

    // --- 1. FETCH MAINTENANCE DATA ---
    useEffect(() => {
        const fetchRequests = async () => {
            try {
                setIsLoading(true);
                const response = await AxiosInstance.get('/maintenance/landlord/requests');
                setRequests(response.data.requests || []);
            } catch (err) {
                console.error("Error fetching maintenance requests:", err);
                setError("Failed to load maintenance data. Please try again later.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchRequests();
    }, []);

    // --- 2. UPDATE STATUS HANDLER (Used for generic status changes) ---
    const handleUpdateStatus = async (requestId, newStatus) => {
        try {
            setUpdatingId(requestId);
            await AxiosInstance.put(`/maintenance/${requestId}/status`, { status: newStatus });

            setRequests(prev => prev.map(req =>
                req._id === requestId ? { ...req, status: newStatus } : req
            ));

            if (newStatus !== 'resolved') {
                toast.success(`Request marked as ${newStatus.replace('-', ' ')}`);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to update status.");
        } finally {
            setUpdatingId(null);
        }
    };

    // --- 3. ASSIGN VENDOR HANDLER ---
    const handleAssignVendor = async (e) => {
        e.preventDefault();
        try {
            setUpdatingId(selectedRequest._id);
            const response = await AxiosInstance.put(`/maintenance/${selectedRequest._id}/assign`, vendorForm);

            // Update local state (Assigning automatically moves it to 'in-progress' in backend)
            setRequests(prev => prev.map(req =>
                req._id === selectedRequest._id ? response.data.request : req
            ));

            toast.success("Vendor assigned and tenant notified!");
            closeModals();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to assign vendor.");
        } finally {
            setUpdatingId(null);
        }
    };

    // --- 4. RESOLVE & LOG EXPENSE HANDLER (FIXED) ---
    const handleResolve = async (e) => {
        e.preventDefault();
        try {
            setUpdatingId(selectedRequest._id);

            // FIX 1: Safely extract property ID. 
            // Handles cases where backend returns propertyId as a populated object OR just a string ID.
            const safePropertyId = selectedRequest.propertyId?._id || selectedRequest.propertyId;

            // FIX 2: Do the status update directly here instead of calling handleUpdateStatus
            // This prevents the loading spinner from turning off too early!
            await AxiosInstance.put(`/maintenance/${selectedRequest._id}/status`, { status: 'resolved' });

            // Instantly update UI ticket status
            setRequests(prev => prev.map(req =>
                req._id === selectedRequest._id ? { ...req, status: 'resolved' } : req
            ));

            // If they entered an amount, log it in the Payment Service Expenses!
            if (expenseForm.amount && Number(expenseForm.amount) > 0) {
                await AxiosInstance.post('/payments/expenses', {
                    propertyId: safePropertyId, // Use the safe ID we extracted above
                    title: expenseForm.title || `Maintenance: ${selectedRequest.title}`,
                    amount: Number(expenseForm.amount),
                    category: 'repair',
                    date: new Date(),
                    description: expenseForm.description
                });

                toast.success("Ticket resolved & Expense logged successfully!");
            } else {
                toast.success("Ticket marked as resolved!");
            }

            closeModals();
        } catch (err) {
            console.error("Resolve Error:", err);
            // Give a more descriptive error so we know exactly what failed
            toast.error(err.response?.data?.message || "Ticket was resolved, but failed to log the expense.");
        } finally {
            setUpdatingId(null);
        }
    };

    // --- HELPERS ---
    const openAssignModal = (req) => {
        setSelectedRequest(req);
        setVendorForm({ vendorName: '', vendorContact: '', scheduledDate: '' });
        setActiveModal('assign');
    };

    const openResolveModal = (req) => {
        setSelectedRequest(req);
        setExpenseForm({ amount: '', title: `Repair: ${req.title}`, description: '' });
        setActiveModal('resolve');
    };

    const closeModals = () => {
        setActiveModal(null);
        setSelectedRequest(null);
    };

    const filteredRequests = requests.filter(req => filterStatus === 'all' || req.status === filterStatus);

    const getPriorityBadge = (priority) => {
        const styles = { urgent: "bg-red-100 text-red-800 border-red-300", high: "bg-orange-100 text-orange-800 border-orange-300", medium: "bg-blue-100 text-blue-800 border-blue-300", low: "bg-slate-100 text-slate-800 border-slate-300" };
        return <span className={`px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider rounded-md border ${styles[priority] || styles.low}`}>{priority} Priority</span>;
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'resolved': return <span className="flex items-center gap-1.5 text-green-700 bg-green-50 px-3 py-1.5 rounded-lg font-bold text-sm border border-green-200"><CheckCircle size={16} /> Resolved</span>;
            case 'in-progress': return <span className="flex items-center gap-1.5 text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg font-bold text-sm border border-blue-200"><Wrench size={16} /> In Progress</span>;
            case 'cancelled': return <span className="flex items-center gap-1.5 text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg font-bold text-sm border border-slate-200"><X size={16} /> Cancelled</span>;
            default: return <span className="flex items-center gap-1.5 text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg font-bold text-sm border border-amber-200"><Clock size={16} /> Pending</span>;
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <DashboardHeader title="Maintenance Requests" subtitle="Track, prioritize, and resolve property issues reported by your tenants." />

            {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-2 border border-red-100"><AlertCircle size={20} /> {error}</div>}

            {/* FILTER BAR */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex overflow-x-auto gap-2">
                {['all', 'pending', 'in-progress', 'resolved'].map((status) => (
                    <button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        className={`px-5 py-2 rounded-lg text-sm font-bold capitalize transition whitespace-nowrap ${filterStatus === status ? 'bg-slate-900 text-white shadow-md' : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'}`}
                    >
                        {status.replace('-', ' ')}
                    </button>
                ))}
            </div>

            {/* MAIN CONTENT AREA */}
            {isLoading ? (
                <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin text-blue-600" size={40} /></div>
            ) : filteredRequests.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
                    <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-100"><CheckCircle size={32} /></div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">All Clear!</h3>
                    <p className="text-slate-500 max-w-md mx-auto">You have no {filterStatus !== 'all' ? filterStatus : ''} maintenance requests at this time.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {filteredRequests.map((request) => (
                        <div key={request._id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition">

                            {/* Card Header */}
                            <div className="p-5 border-b border-slate-100 flex justify-between items-start gap-4 bg-slate-50/50">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        {getPriorityBadge(request.priority)}
                                        <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded font-bold uppercase tracking-wider">{request.category}</span>
                                        <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                                            <Calendar size={12} /> {new Date(request.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900">{request.title}</h3>
                                </div>
                                <div>{getStatusBadge(request.status)}</div>
                            </div>

                            {/* Card Body */}
                            <div className="p-5 flex-1 flex flex-col md:flex-row gap-6">

                                {/* Left Side: Details & Photos */}
                                <div className="flex-1">
                                    <p className="text-slate-700 text-sm leading-relaxed mb-6 bg-slate-50 p-4 rounded-lg border border-slate-100">
                                        "{request.description}"
                                    </p>

                                    {request.images && request.images.length > 0 && (
                                        <div className="mb-6">
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Attached Photos</p>
                                            <div className="flex gap-3">
                                                {request.images.map((imgUrl, i) => (
                                                    <a key={i} href={imgUrl} target="_blank" rel="noreferrer" className="block w-20 h-20 rounded-lg overflow-hidden border border-slate-200 hover:ring-2 hover:ring-blue-500 transition">
                                                        <img src={imgUrl} alt="Damage" className="w-full h-full object-cover" />
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="flex items-start gap-2">
                                            <MapPin size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Property</p>
                                                <p className="text-sm font-semibold text-slate-800">{request.propertyId?.title || 'Unknown Property'}</p>
                                                <p className="text-xs text-slate-500">{request.propertyId?.address?.city || ''}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <User size={16} className="text-purple-500 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Reported By</p>
                                                <p className="text-sm font-semibold text-slate-800">{request.tenantId?.name || 'Tenant'}</p>
                                                <p className="text-xs text-slate-500">{request.tenantId?.phone || ''}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Side: Vendor Info (If assigned) */}
                                {request.assignedVendor?.name && (
                                    <div className="md:w-64 bg-blue-50 p-4 rounded-xl border border-blue-100 flex flex-col justify-center">
                                        <p className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-2 flex items-center gap-1"><Wrench size={12} /> Assigned Technician</p>
                                        <p className="font-bold text-blue-900">{request.assignedVendor.name}</p>
                                        <p className="text-xs text-blue-700 mt-1">{request.assignedVendor.contact}</p>
                                        {request.scheduledDate && (
                                            <div className="mt-4 pt-4 border-t border-blue-200/50">
                                                <p className="text-[10px] font-bold text-blue-500 uppercase mb-1">Scheduled For</p>
                                                <p className="text-sm font-bold text-blue-800 flex items-center gap-1">
                                                    <Calendar size={14} /> {new Date(request.scheduledDate).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Card Footer / Actions */}
                            <div className="p-4 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row justify-between items-center gap-4">
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Manage Ticket</span>

                                <div className="flex gap-3 w-full sm:w-auto">
                                    {request.status === 'pending' && (
                                        <button onClick={() => openAssignModal(request)} className="flex-1 sm:flex-none px-6 py-2.5 rounded-lg text-sm font-bold bg-white text-blue-600 border border-blue-200 hover:bg-blue-50 transition shadow-sm">
                                            Assign Vendor
                                        </button>
                                    )}

                                    {request.status !== 'resolved' && request.status !== 'cancelled' && (
                                        <button onClick={() => openResolveModal(request)} className="flex-1 sm:flex-none px-6 py-2.5 rounded-lg text-sm font-bold bg-green-600 text-white hover:bg-green-700 transition shadow-sm flex items-center justify-center gap-2">
                                            <CheckCircle size={16} /> Mark Resolved
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* --- MODAL 1: ASSIGN VENDOR --- */}
            {activeModal === 'assign' && selectedRequest && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                            <h3 className="font-bold text-slate-900">Assign Technician</h3>
                            <button onClick={closeModals} className="text-slate-400 hover:text-slate-700"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleAssignVendor} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Technician / Company Name</label>
                                <input type="text" required value={vendorForm.vendorName} onChange={e => setVendorForm({ ...vendorForm, vendorName: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. Bob's Plumbing" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Contact Number</label>
                                <input type="text" value={vendorForm.contactContact} onChange={e => setVendorForm({ ...vendorForm, vendorContact: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Phone number" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Scheduled Date</label>
                                <input type="date" value={vendorForm.scheduledDate} onChange={e => setVendorForm({ ...vendorForm, scheduledDate: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                            </div>
                            <button type="submit" disabled={updatingId === selectedRequest._id} className="w-full py-3 mt-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition flex justify-center items-center">
                                {updatingId === selectedRequest._id ? <Loader2 className="animate-spin" size={20} /> : 'Assign & Notify Tenant'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* --- MODAL 2: RESOLVE & LOG EXPENSE --- */}
            {activeModal === 'resolve' && selectedRequest && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-green-50">
                            <h3 className="font-bold text-green-800 flex items-center gap-2"><CheckCircle size={20} /> Resolve Ticket</h3>
                            <button onClick={closeModals} className="text-green-600 hover:text-green-800"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleResolve} className="p-6 space-y-4">
                            <p className="text-sm text-slate-600 mb-4">You are about to mark this ticket as resolved. If this repair cost you money, log the expense below to track it in your Financial Reports.</p>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Repair Cost (Optional)</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><IndianRupee size={16} className="text-slate-400" /></div>
                                    <input type="number" min="0" value={expenseForm.amount} onChange={e => setExpenseForm({ ...expenseForm, amount: e.target.value })} className="w-full pl-9 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none" placeholder="0.00" />
                                </div>
                            </div>
                            {expenseForm.amount && (
                                <>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">Expense Title</label>
                                        <input type="text" value={expenseForm.title} onChange={e => setExpenseForm({ ...expenseForm, title: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">Notes</label>
                                        <input type="text" value={expenseForm.description} onChange={e => setExpenseForm({ ...expenseForm, description: e.target.value })} placeholder="Invoice # or details..." className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none" />
                                    </div>
                                </>
                            )}
                            <button type="submit" disabled={updatingId === selectedRequest._id} className="w-full py-3 mt-4 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition flex justify-center items-center">
                                {updatingId === selectedRequest._id ? <Loader2 className="animate-spin" size={20} /> : (expenseForm.amount ? 'Resolve & Log Expense' : 'Just Resolve Ticket')}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LandlordMaintenance;