import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Home, Clock, CheckCircle, XCircle,
    Trash2, MapPin, Loader2, FileText, ArrowRight
} from 'lucide-react';
import AxiosInstance from '../../api/axiosInstance';
import { toast } from 'react-hot-toast';
import { DashboardHeader } from '../../components/DashboardSharedUI';

const TenantApplications = () => {
    const navigate = useNavigate();
    const [applications, setApplications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isWithdrawing, setIsWithdrawing] = useState(null); // Stores ID of app being withdrawn

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        try {
            setIsLoading(true);
            const response = await AxiosInstance.get('/tenants/my/applications');
            // console.log(response.data);
            setApplications(response.data.applications || []);
        } catch (error) {
            console.error("Error fetching applications:", error);
            toast.error("Failed to load your applications.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleWithdraw = async (applicationId) => {
        if (!window.confirm("Are you sure you want to withdraw this application?")) return;

        try {
            setIsWithdrawing(applicationId);
            // Calls the DELETE route from your Project Report
            await AxiosInstance.delete(`/tenants/applications/${applicationId}`);

            toast.success("Application withdrawn successfully.");
            // Remove the withdrawn application from the UI instantly
            setApplications(prev => prev.filter(app => app._id !== applicationId));
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to withdraw application.");
        } finally {
            setIsWithdrawing(null);
        }
    };

    // Helper function for status badge styling
    const getStatusUI = (status) => {
        switch (status) {
            case 'approved':
                return { color: 'bg-green-100 text-green-700 border-green-200', icon: <CheckCircle size={16} />, text: 'Approved' };
            case 'rejected':
                return { color: 'bg-red-100 text-red-700 border-red-200', icon: <XCircle size={16} />, text: 'Rejected' };
            case 'withdrawn':
                return { color: 'bg-slate-100 text-slate-700 border-slate-200', icon: <FileText size={16} />, text: 'Withdrawn' };
            default:
                return { color: 'bg-amber-100 text-amber-700 border-amber-200', icon: <Clock size={16} />, text: 'Pending Review' };
        }
    };

    return (
        <div className="max-w-6xl mx-auto pb-12 animate-in fade-in duration-300">

            <DashboardHeader
                title="My Rental Applications"
                subtitle="Track the status of the properties you have applied to rent."
            />

            {isLoading ? (
                <div className="flex flex-col items-center justify-center h-64 bg-white rounded-2xl border border-slate-200 shadow-sm">
                    <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
                    <p className="text-slate-500 font-bold">Loading your applications...</p>
                </div>
            ) : applications.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center flex flex-col items-center">
                    <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-6">
                        <Home size={40} />
                    </div>
                    <h3 className="text-2xl font-extrabold text-slate-900 mb-2">No Applications Yet</h3>
                    <p className="text-slate-500 max-w-md mb-8">
                        You haven't applied for any properties yet. Start browsing to find your next perfect home!
                    </p>
                    <button
                        onClick={() => navigate('/explore')}
                        className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-md flex items-center gap-2"
                    >
                        Browse Properties <ArrowRight size={18} />
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {applications.map((app) => {
                        const statusUI = getStatusUI(app.status);

                        return (
                            <div key={app._id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition group">

                                {/* Header Section */}
                                <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
                                    <div>
                                        {/* Fallback title if backend doesn't populate property details */}
                                        <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition cursor-pointer" onClick={() => navigate(`/property/${app.propertyId._id}`)}>
                                            Property ID: {app.propertyId.title}
                                        </h3>
                                        <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
                                            <Clock size={14} /> Applied on {new Date(app.createdAt).toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' })}
                                        </p>
                                    </div>
                                    <span className={`px-3 py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-1.5 border uppercase tracking-wider ${statusUI.color}`}>
                                        {statusUI.icon} {statusUI.text}
                                    </span>
                                </div>

                                {/* Body Section */}
                                <div className="p-6">
                                    {app.message && (
                                        <div className="mb-4">
                                            <p className="text-xs font-bold text-slate-400 uppercase mb-1">Your Message</p>
                                            <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100 italic">
                                                "{app.message}"
                                            </p>
                                        </div>
                                    )}

                                    {app.status === 'rejected' && app.rejectionReason && (
                                        <div className="mb-4">
                                            <p className="text-xs font-bold text-red-400 uppercase mb-1">Reason for Rejection</p>
                                            <p className="text-sm text-red-700 bg-red-50 p-3 rounded-lg border border-red-100 font-medium">
                                                {app.rejectionReason}
                                            </p>
                                        </div>
                                    )}

                                    {app.status === 'approved' && (
                                        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl">
                                            <p className="text-sm text-green-800 font-bold mb-1">🎉 Congratulations!</p>
                                            <p className="text-xs text-green-700">The landlord has approved your application. Keep an eye out for the lease agreement.</p>
                                        </div>
                                    )}
                                </div>

                                {/* Footer / Actions */}
                                <div className="p-4 bg-white border-t border-slate-100 flex justify-between items-center">
                                    <button
                                        onClick={() => navigate(`/property/${app.propertyId._id}`)}
                                        className="text-blue-600 text-sm font-bold hover:underline"
                                    >
                                        View Listing
                                    </button>

                                    {app.status === 'pending' && (
                                        <button
                                            onClick={() => handleWithdraw(app._id)}
                                            disabled={isWithdrawing === app._id}
                                            className="text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg text-sm font-bold transition flex items-center gap-1.5 disabled:opacity-50"
                                        >
                                            {isWithdrawing === app._id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                                            Withdraw
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default TenantApplications;