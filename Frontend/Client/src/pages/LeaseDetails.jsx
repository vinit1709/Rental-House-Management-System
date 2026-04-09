import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
    FileText, CheckCircle, Clock, Download, PenTool,
    User, Home, Calendar, IndianRupee, AlertCircle, X, Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import SignatureCanvas from 'react-signature-canvas';
import AxiosInstance from '../api/axiosInstance';
import { toast } from 'react-hot-toast';

const LeaseDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    // Determine role based on the URL route!
    const isLandlordView = location.pathname.includes('/landlord');

    const [lease, setLease] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Signature Modal State
    const [showSignModal, setShowSignModal] = useState(false);
    const [isSigning, setIsSigning] = useState(false);
    const sigCanvas = useRef({});

    useEffect(() => {
        fetchLeaseDetails();
    }, [id]);

    const fetchLeaseDetails = async () => {
        try {
            setIsLoading(true);
            const response = await AxiosInstance.get(`/leases/${id}`);
            setLease(response.data.lease);
        } catch (error) {
            console.error("Error fetching lease:", error);
            toast.error("Failed to load lease details.");
            navigate(-1); // Go back if not found or unauthorized
        } finally {
            setIsLoading(false);
        }
    };

    const handleClearSignature = () => {
        sigCanvas.current.clear();
    };

    const handleSignLease = async () => {
        if (sigCanvas.current.isEmpty()) {
            return toast.error("Please provide your signature before saving.");
        }

        try {
            setIsSigning(true);

            // The signature pad is for UX/legal acknowledgment. 
            // The backend securely timestamps the signature based on the logged-in user's JWT.
            await AxiosInstance.put(`/leases/${id}/sign`);

            toast.success("Lease signed successfully!");
            setShowSignModal(false);
            fetchLeaseDetails(); // Refresh to see updated status & PDF link!

            if (isLandlordView) {
                navigate('/landlord/leases');
            } else {
                navigate('/tenant/documents'); // Adjust this if your route name is different
            }

        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to sign lease.");
        } finally {
            setIsSigning(false);
        }
    };

    const handleDownloadPDF = async () => {
        if (!lease.documentUrl) return toast.error("PDF not available yet.");
        // Open Cloudinary PDF securely in a new tab
        window.open(lease.documentUrl, '_blank', 'noopener,noreferrer');
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-96 animate-in fade-in">
                <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
                <p className="text-slate-500 font-bold">Loading Digital Contract...</p>
            </div>
        );
    }

    if (!lease) return null;

    // --- SMART PERMISSION LOGIC ---
    const iAmLandlord = isLandlordView;
    const iAmTenant = !isLandlordView;

    const landlordHasSigned = lease.landlordSignature?.isSigned;
    const tenantHasSigned = lease.tenantSignature?.isSigned;

    let canISign = false;
    let signBlockReason = "";

    if (iAmLandlord) {
        if (landlordHasSigned) signBlockReason = "You have already signed this document.";
        else canISign = true;
    } else if (iAmTenant) {
        if (tenantHasSigned) signBlockReason = "You have already signed this document.";
        else if (!landlordHasSigned) signBlockReason = "Waiting for the Landlord to sign first.";
        else canISign = true;
    }

    return (
        <div className="max-w-4xl mx-auto pb-12 animate-in fade-in duration-300">

            {/* --- HEADER --- */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <button onClick={() => navigate(-1)} className="text-sm font-bold text-slate-500 hover:text-blue-600 mb-2 transition">
                        ← Back to Dashboard
                    </button>
                    <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
                        <FileText className="text-blue-600" size={32} />
                        Lease Agreement
                    </h1>
                </div>

                {/* Status Badge */}
                <div className={`px-4 py-2 rounded-xl border font-bold flex items-center gap-2 shadow-sm
                    ${lease.status === 'active' ? 'bg-green-50 border-green-200 text-green-700' :
                        lease.status === 'draft' ? 'bg-slate-50 border-slate-200 text-slate-700' :
                            'bg-amber-50 border-amber-200 text-amber-700'}`}
                >
                    {lease.status === 'active' ? <CheckCircle size={18} /> : <Clock size={18} />}
                    Status: {lease.status.replace(/_/g, ' ').toUpperCase()}
                </div>
            </div>

            {/* --- DOCUMENT BODY --- */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8">

                <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex justify-center">
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">LEAVE AND LICENSE AGREEMENT</h2>
                </div>

                <div className="p-8 space-y-8">
                    {/* 1. The Parties */}
                    <section>
                        <h3 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-2 mb-4 flex items-center gap-2">
                            <User className="text-blue-600" size={20} /> 1. The Parties
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-5 rounded-xl border border-slate-100">
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Licensor (Landlord)</p>
                                <p className="font-bold text-slate-900">{lease.landlordId.name}</p>
                                <p className="text-sm text-slate-600">{lease.landlordId.email}</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Licensee (Tenant)</p>
                                <p className="font-bold text-slate-900">{lease.tenantId.name}</p>
                                <p className="text-sm text-slate-600">{lease.tenantId.email}</p>
                            </div>
                        </div>
                    </section>

                    {/* 2. The Property */}
                    <section>
                        <h3 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-2 mb-4 flex items-center gap-2">
                            <Home className="text-blue-600" size={20} /> 2. The Property
                        </h3>
                        <div className="text-slate-700 leading-relaxed">
                            <p><strong>Property Title:</strong> {lease.propertyId.title}</p>
                            <p><strong>Address:</strong> {lease.propertyId.address.street}, {lease.propertyId.address.city}, {lease.propertyId.address.state}, {lease.propertyId.address.pincode}</p>
                        </div>
                    </section>

                    {/* 3. Financials & Dates */}
                    <section>
                        <h3 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-2 mb-4 flex items-center gap-2">
                            <IndianRupee className="text-blue-600" size={20} /> 3. Financial Terms & Duration
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                                <p className="text-xs font-bold text-slate-500 uppercase mb-1">Monthly Rent</p>
                                <p className="font-bold text-blue-700 text-lg">₹{lease.monthlyRent.toLocaleString('en-IN')}</p>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <p className="text-xs font-bold text-slate-500 uppercase mb-1">Deposit</p>
                                <p className="font-bold text-slate-900 text-lg">₹{lease.securityDeposit.toLocaleString('en-IN')}</p>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <p className="text-xs font-bold text-slate-500 uppercase mb-1">Start Date</p>
                                <p className="font-bold text-slate-900">{format(new Date(lease.startDate), 'dd MMM yyyy')}</p>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <p className="text-xs font-bold text-slate-500 uppercase mb-1">End Date</p>
                                <p className="font-bold text-slate-900">{format(new Date(lease.endDate), 'dd MMM yyyy')}</p>
                            </div>
                        </div>
                        <p className="text-sm text-slate-500 mt-3 italic">* Rent is due on the {lease.rentDueDay}th of every month.</p>
                    </section>

                    {/* 4. Special Clauses */}
                    {lease.specialClauses && lease.specialClauses.length > 0 && (
                        <section>
                            <h3 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-2 mb-4">
                                4. Special Clauses
                            </h3>
                            <ul className="list-disc pl-5 space-y-2 text-slate-700">
                                {lease.specialClauses.map((clause, index) => (
                                    <li key={index}>{clause}</li>
                                ))}
                            </ul>
                        </section>
                    )}

                    {/* 5. Signatures Status */}
                    <section>
                        <h3 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-2 mb-4 flex items-center gap-2">
                            <PenTool className="text-blue-600" size={20} /> 5. E-Signatures
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            {/* Landlord Signature Box */}
                            <div className={`p-5 rounded-xl border ${landlordHasSigned ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-200'}`}>
                                <p className="text-sm font-bold text-slate-900 mb-2">Licensor (Landlord)</p>
                                {landlordHasSigned ? (
                                    <div className="text-green-700">
                                        <p className="font-bold flex items-center gap-1"><CheckCircle size={16} /> Signed Legally</p>
                                        <p className="text-xs mt-1 text-green-600/80">Timestamp: {format(new Date(lease.landlordSignature.signedAt), 'dd MMM yyyy, hh:mm a')}</p>
                                    </div>
                                ) : (
                                    <p className="text-sm text-slate-500 italic">Waiting for signature...</p>
                                )}
                            </div>

                            {/* Tenant Signature Box */}
                            <div className={`p-5 rounded-xl border ${tenantHasSigned ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-200'}`}>
                                <p className="text-sm font-bold text-slate-900 mb-2">Licensee (Tenant)</p>
                                {tenantHasSigned ? (
                                    <div className="text-green-700">
                                        <p className="font-bold flex items-center gap-1"><CheckCircle size={16} /> Signed Legally</p>
                                        <p className="text-xs mt-1 text-green-600/80">Timestamp: {format(new Date(lease.tenantSignature.signedAt), 'dd MMM yyyy, hh:mm a')}</p>
                                    </div>
                                ) : (
                                    <p className="text-sm text-slate-500 italic">Waiting for signature...</p>
                                )}
                            </div>

                        </div>
                    </section>
                </div>

                {/* --- ACTION BAR (Bottom of Doc) --- */}
                <div className="p-6 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row justify-between items-center gap-4">

                    <div>
                        {!canISign && signBlockReason && lease.status !== 'active' && (
                            <p className="text-sm font-bold text-amber-600 flex items-center gap-2">
                                <AlertCircle size={16} /> {signBlockReason}
                            </p>
                        )}
                        {lease.status === 'active' && (
                            <p className="text-sm font-bold text-green-600 flex items-center gap-2">
                                <CheckCircle size={16} /> Contract is legally active.
                            </p>
                        )}
                    </div>

                    <div className="flex gap-3 w-full sm:w-auto">
                        {/* Download PDF Button - Only shows if active and URL exists */}
                        {lease.status === 'active' && lease.documentUrl && (
                            <button
                                onClick={handleDownloadPDF}
                                className="flex-1 sm:flex-none px-6 py-3 bg-white border-2 border-slate-200 text-slate-800 font-bold rounded-xl hover:border-slate-300 hover:bg-slate-100 transition shadow-sm flex items-center justify-center gap-2"
                            >
                                <Download size={18} /> Download PDF
                            </button>
                        )}

                        {/* NEW: Make Payment Button - ONLY for Tenant when Active! */}
                        {iAmTenant && lease.status === 'active' && (
                            <button
                                onClick={() => navigate('/tenant/payments')}
                                className="flex-1 sm:flex-none px-6 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition shadow-sm flex items-center justify-center gap-2"
                            >
                                <IndianRupee size={18} /> Pay Deposit & Rent
                            </button>
                        )}

                        {/* Sign Button - Only shows if user is allowed to sign */}
                        {canISign && (
                            <button
                                onClick={() => setShowSignModal(true)}
                                className="flex-1 sm:flex-none px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-md flex items-center justify-center gap-2"
                            >
                                <PenTool size={18} /> Apply E-Signature
                            </button>
                        )}
                    </div>

                </div>
            </div>

            {/* --- SIGNATURE MODAL --- */}
            {showSignModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                            <h3 className="text-xl font-bold text-slate-900">Legal E-Signature</h3>
                            <button onClick={() => setShowSignModal(false)} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-full transition">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6">
                            <p className="text-sm text-slate-600 mb-4">
                                By signing below, you agree to all the terms, conditions, and financial obligations stated in this Leave and License Agreement. This signature acts as your legal digital acknowledgment.
                            </p>

                            <div className="border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 overflow-hidden relative">
                                <SignatureCanvas
                                    ref={sigCanvas}
                                    penColor="blue"
                                    canvasProps={{ className: 'w-full h-48 cursor-crosshair' }}
                                />
                                <button
                                    onClick={handleClearSignature}
                                    className="absolute bottom-2 right-2 px-3 py-1 bg-white border border-slate-200 text-xs font-bold text-slate-500 rounded-lg hover:bg-slate-100 shadow-sm transition"
                                >
                                    Clear
                                </button>
                            </div>
                        </div>

                        <div className="p-5 border-t border-slate-200 bg-slate-50 flex gap-3">
                            <button
                                onClick={() => setShowSignModal(false)}
                                className="flex-1 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-100 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSignLease}
                                disabled={isSigning}
                                className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-md flex items-center justify-center gap-2 disabled:opacity-70"
                            >
                                {isSigning ? <Loader2 size={20} className="animate-spin" /> : <PenTool size={20} />}
                                {isSigning ? 'Authenticating...' : 'Sign Document'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default LeaseDetails;