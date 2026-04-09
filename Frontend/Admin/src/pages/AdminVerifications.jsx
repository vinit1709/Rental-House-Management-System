import React, { useState, useEffect } from 'react';
import {
    ShieldCheck, CheckCircle, XCircle, FileText,
    ExternalLink, Search, Loader2, AlertCircle, X, User, Sparkles, UserCheck, UserX
} from 'lucide-react';
import AxiosInstance from '../api/axiosInstance';
import { toast } from 'react-hot-toast';

const AdminVerifications = () => {
    const [verifications, setVerifications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const [selectedDoc, setSelectedDoc] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');

    // --- AI SCANNER STATES ---
    const [isScanning, setIsScanning] = useState(false);
    const [scanResult, setScanResult] = useState(null);

    useEffect(() => {
        fetchPendingVerifications();
    }, []);

    const fetchPendingVerifications = async () => {
        try {
            setIsLoading(true);
            const response = await AxiosInstance.get('/auth/admin/verifications/pending');
            setVerifications(response.data.users || []);
        } catch (err) {
            toast.error("Failed to load pending verifications.");
        } finally {
            setIsLoading(false);
        }
    };

    // --- AI SCANNER LOGIC ---
    const handleScanDocument = async () => {
        if (!selectedDoc || !selectedDoc.identityDocument) return;

        try {
            setIsScanning(true);
            setScanResult(null);

            const imageResponse = await fetch(selectedDoc.identityDocument);
            const blob = await imageResponse.blob();

            const formData = new FormData();
            formData.append('documentImage', blob, 'identity_document.jpg');
            // NEW: Send the registered name so the AI can compare it!
            formData.append('expectedName', selectedDoc.name);

            const response = await AxiosInstance.post('/ai/document-scan', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setScanResult(response.data.data);

            // Auto-populate rejection reason if it's a mismatch
            if (response.data.data.overallStatus.includes("MISMATCH")) {
                setRejectionReason(`Name mismatch. Registered name (${selectedDoc.name}) does not match document.`);
            }

            toast.success("AI extraction & validation complete!");

        } catch (err) {
            console.error("Scanning Error:", err);
            toast.error("Failed to run AI OCR.");
        } finally {
            setIsScanning(false);
        }
    };

    const handleAction = async (status) => {
        if (status === 'rejected' && !rejectionReason.trim()) {
            return toast.error("Please provide a reason for rejection.");
        }

        try {
            setIsProcessing(true);
            await AxiosInstance.put(`/auth/admin/verify-user/${selectedDoc._id}`, {
                status: status,
                message: status === 'rejected' ? rejectionReason : null
            });

            toast.success(`Document ${status} successfully!`);
            setVerifications(prev => prev.filter(v => v._id !== selectedDoc._id));
            closeModal();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to update verification status.");
        } finally {
            setIsProcessing(false);
        }
    };

    const closeModal = () => {
        setSelectedDoc(null);
        setRejectionReason('');
        setScanResult(null);
    };

    const filteredList = verifications.filter(user =>
        (user.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const isPdf = (url) => url ? url.toLowerCase().includes('.pdf') : false;

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Header & Search Bar remain the same as previous file... */}
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
                        <ShieldCheck className="text-blue-600" size={28} /> Identity Verification Queue
                    </h1>
                </div>
                <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg font-bold border border-blue-100 flex items-center gap-2">
                    {verifications.length} Pending Reviews
                </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input type="text" placeholder="Search by name or email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600" />
                </div>
            </div>

            {/* DATA TABLE */}
            {isLoading ? (
                <div className="flex justify-center items-center h-64 bg-white rounded-xl border border-slate-200 shadow-sm"><Loader2 className="animate-spin text-blue-600" size={40} /></div>
            ) : filteredList.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center">
                    <ShieldCheck size={48} className="mx-auto text-green-500 mb-4 opacity-50" />
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Queue is Empty</h3>
                    <p className="text-slate-500">All user identities have been verified. Great job!</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                                    <th className="p-4 font-bold">User Details</th>
                                    <th className="p-4 font-bold">Role</th>
                                    <th className="p-4 font-bold">Document Type</th>
                                    <th className="p-4 font-bold">Submitted On</th>
                                    <th className="p-4 font-bold text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredList.map((user) => (
                                    <tr key={user._id} className="hover:bg-slate-50 transition">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-slate-200 text-slate-600 rounded-full flex items-center justify-center font-bold">
                                                    {user.name?.charAt(0) || <User size={18} />}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900">{user.name || 'Unknown User'}</p>
                                                    <p className="text-xs text-slate-500">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider rounded-md border ${user.role === 'landlord' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-blue-50 text-blue-700 border-blue-200'
                                                }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <FileText size={16} className="text-slate-400" />
                                                <span className="font-medium text-slate-700 capitalize">{user.idType || 'Document'}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm font-medium text-slate-600">
                                            {new Date(user.updatedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </td>
                                        <td className="p-4 text-right">
                                            <button onClick={() => setSelectedDoc(user)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition">Review</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* --- REVIEW MODAL --- */}
            {selectedDoc && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">

                        <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50 flex-shrink-0">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">Review Identity Document</h3>
                                <p className="text-sm text-slate-500 mt-1">Submitted by <span className="font-bold text-slate-700">{selectedDoc.name}</span></p>
                            </div>
                            <button onClick={closeModal} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-full transition"><X size={24} /></button>
                        </div>

                        <div className="p-6 flex-1 overflow-y-auto bg-slate-100 flex flex-col items-center">

                            {/* --- AI OCR SECTION --- */}
                            {!isPdf(selectedDoc.identityDocument) && (
                                <div className="w-full max-w-2xl mb-6">
                                    {!scanResult ? (
                                        <button
                                            onClick={handleScanDocument} disabled={isScanning}
                                            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-md hover:from-blue-700 hover:to-indigo-700 transition flex justify-center items-center gap-2 disabled:opacity-70"
                                        >
                                            {isScanning ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                                            {isScanning ? 'Running OCR & KYC Check...' : 'Run Automated KYC Check'}
                                        </button>
                                    ) : (
                                        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm animate-in slide-in-from-top-2">

                                            {/* Status Banner */}
                                            <div className={`flex items-center justify-between p-3 rounded-lg mb-4 font-bold border ${scanResult.overallStatus === 'VERIFIED'
                                                ? 'bg-green-50 text-green-700 border-green-200'
                                                : 'bg-red-50 text-red-700 border-red-200'
                                                }`}>
                                                <div className="flex items-center gap-2">
                                                    {scanResult.overallStatus === 'VERIFIED' ? <UserCheck size={20} /> : <UserX size={20} />}
                                                    <span>KYC Result: {scanResult.overallStatus.replace(/_/g, ' ')}</span>
                                                </div>
                                                <span className="text-xs bg-white/50 px-2 py-1 rounded">Confidence: {scanResult.nameMatchConfidence}%</span>
                                            </div>

                                            {/* Details Grid */}
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Registered Name</p>
                                                    <p className="font-bold text-slate-800 mt-1">{selectedDoc.name}</p>
                                                </div>
                                                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Document Match Status</p>
                                                    <p className={`font-black mt-1 ${scanResult.nameMatchConfidence >= 50 ? 'text-green-600' : 'text-red-600'}`}>
                                                        {scanResult.nameMatchStatus}
                                                    </p>
                                                </div>
                                                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Detected Type</p>
                                                    <p className="font-bold mt-1 text-slate-800">{scanResult.documentType}</p>
                                                </div>
                                                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">ID Number</p>
                                                    <p className="font-black text-slate-900 mt-1 tracking-wide">{scanResult.extractedIdNumber || 'Not Found'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* --- IMAGE / PDF VIEWER --- */}
                            {isPdf(selectedDoc.identityDocument) ? (
                                <a href={selectedDoc.identityDocument} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-lg font-bold">Open PDF in New Tab <ExternalLink size={18} /></a>
                            ) : (
                                <img src={selectedDoc.identityDocument} alt="User ID Document" className="max-w-full max-h-[40vh] object-contain rounded-lg shadow-sm border border-slate-200 bg-white" />
                            )}
                        </div>

                        {/* Modal Footer: Actions */}
                        <div className="p-5 border-t border-slate-200 bg-white flex flex-col sm:flex-row gap-4 justify-between items-end sm:items-center flex-shrink-0">
                            <div className="w-full sm:w-1/2">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Rejection Reason (If rejecting)</label>
                                <input type="text" value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} placeholder="e.g. Document is blurry, Name mismatch..." className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-red-500 text-sm" disabled={isProcessing} />
                            </div>
                            <div className="flex gap-3 w-full sm:w-auto">
                                <button onClick={() => handleAction('rejected')} disabled={isProcessing || !rejectionReason.trim()} className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white text-red-600 border border-red-200 px-5 py-2.5 rounded-lg font-bold hover:bg-red-50 transition disabled:opacity-50">
                                    {isProcessing ? <Loader2 size={18} className="animate-spin" /> : <XCircle size={18} />} Reject
                                </button>
                                <button onClick={() => handleAction('verified')} disabled={isProcessing} className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-lg font-bold hover:bg-green-700 transition shadow-sm disabled:opacity-50">
                                    {isProcessing ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />} Approve ID
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminVerifications;