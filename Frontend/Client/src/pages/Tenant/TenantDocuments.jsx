import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    FileText, Download, Eye, AlertCircle,
    Calendar, Shield, Loader2, PenTool, CheckCircle, Clock
} from 'lucide-react';
import { DashboardHeader, TableCard } from '../../components/DashboardSharedUI';
import AxiosInstance from '../../api/axiosInstance';
import { format } from 'date-fns';

const TenantDocuments = () => {
    const [leases, setLeases] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- 1. FETCH LEASES ---
    useEffect(() => {
        const fetchDocuments = async () => {
            try {
                setIsLoading(true);
                // Call the global leases endpoint. It automatically fetches THIS tenant's leases!
                const response = await AxiosInstance.get('/leases');
                setLeases(response.data.leases || []);
            } catch (err) {
                console.error("Error fetching documents:", err);
                setError("Failed to load your documents. Please try again later.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchDocuments();
    }, []);

    // --- 2. UI HELPERS ---
    const getStatusBadge = (status) => {
        switch (status) {
            case 'pending_tenant_signature':
                return (
                    <span className="px-3 py-1 bg-amber-100 text-amber-700 border border-amber-200 rounded-lg text-xs font-bold flex items-center gap-1.5 w-max">
                        <PenTool size={14} /> Action Required
                    </span>
                );
            case 'active':
                return (
                    <span className="px-3 py-1 bg-green-100 text-green-700 border border-green-200 rounded-lg text-xs font-bold flex items-center gap-1.5 w-max">
                        <CheckCircle size={14} /> Active
                    </span>
                );
            case 'draft':
                return (
                    <span className="px-3 py-1 bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-bold flex items-center gap-1.5 w-max">
                        <Clock size={14} /> Waiting on Landlord
                    </span>
                );
            default:
                return (
                    <span className="px-3 py-1 bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-bold uppercase w-max">
                        {status}
                    </span>
                );
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-300">

            <DashboardHeader
                title="My Documents"
                subtitle="Access your lease agreements, rent receipts, and official notices."
            />

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-2 border border-red-100">
                    <AlertCircle size={20} /> {error}
                </div>
            )}

            {/* Security Banner */}
            <div className="bg-slate-900 text-white p-6 rounded-xl shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Shield className="text-blue-400 flex-shrink-0" size={32} />
                    <div>
                        <h3 className="font-bold text-lg">Secure Document Vault</h3>
                        <p className="text-slate-400 text-sm">All files are encrypted and legally binding. Only you and your landlord have access.</p>
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center h-48">
                    <Loader2 className="animate-spin text-blue-600" size={40} />
                </div>
            ) : (
                <TableCard title="Available Documents">
                    {leases.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[600px]">
                                <tbody className="divide-y divide-slate-100">
                                    {leases.map((lease) => (
                                        <tr key={lease._id} className="hover:bg-slate-50 transition group">

                                            <td className="p-4 w-12 hidden sm:table-cell">
                                                <div className={`p-3 rounded-xl border shadow-sm flex items-center justify-center
                                                    ${lease.status === 'active' ? 'bg-green-50 border-green-100 text-green-600' : 'bg-blue-50 border-blue-100 text-blue-600'}
                                                `}>
                                                    <FileText size={24} />
                                                </div>
                                            </td>

                                            <td className="p-4">
                                                <p className="font-bold text-slate-900 text-base">Lease Agreement</p>
                                                <p className="text-sm font-medium text-blue-600 mt-0.5">{lease.propertyId?.title || "Property"}</p>
                                                <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500">
                                                    <span className="flex items-center gap-1"><Calendar size={12} /> Generated: {format(new Date(lease.createdAt), 'dd MMM yyyy')}</span>
                                                </div>
                                            </td>

                                            <td className="p-4 text-center">
                                                {getStatusBadge(lease.status)}
                                            </td>

                                            <td className="p-4 text-right">
                                                <div className="flex justify-end gap-2">

                                                    {/* The Magic Link to our shared LeaseDetails.jsx */}
                                                    <Link
                                                        to={`/tenant/leases/${lease._id}`}
                                                        className={`px-4 py-2 rounded-lg font-bold transition flex items-center gap-2 text-sm shadow-sm
                                                            ${lease.status === 'pending_tenant_signature'
                                                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                                                : 'bg-white border border-slate-200 text-slate-700 hover:text-blue-600 hover:border-blue-300'
                                                            }
                                                        `}
                                                    >
                                                        {lease.status === 'pending_tenant_signature' ? <PenTool size={16} /> : <Eye size={16} />}
                                                        {lease.status === 'pending_tenant_signature' ? 'Review & Sign' : 'View Details'}
                                                    </Link>

                                                    {/* Direct PDF Download if active */}
                                                    {lease.status === 'active' && lease.documentUrl && (
                                                        <a
                                                            href={lease.documentUrl}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="p-2 text-slate-500 bg-white border border-slate-200 hover:text-emerald-600 hover:border-emerald-300 rounded-lg transition shadow-sm"
                                                            title="Download PDF"
                                                        >
                                                            <Download size={18} />
                                                        </a>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="p-12 text-center text-slate-500">
                            <FileText size={40} className="mx-auto text-slate-300 mb-3" />
                            <h3 className="text-lg font-bold text-slate-800 mb-1">No Documents Found</h3>
                            <p className="text-sm">Your lease agreements will appear here once your landlord drafts them.</p>
                        </div>
                    )}
                </TableCard>
            )}
        </div>
    );
};

export default TenantDocuments;