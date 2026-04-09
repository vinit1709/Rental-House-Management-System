import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    IndianRupee, CreditCard, Clock, CheckCircle, Home,
    AlertCircle, Download, FileText, Loader2, Calendar
} from 'lucide-react';
import { DashboardHeader, StatCard, TableCard } from '../../components/DashboardSharedUI';
import AxiosInstance from '../../api/axiosInstance';
import toast from 'react-hot-toast';

// Utility function to load the Razorpay script dynamically
const loadRazorpayScript = () => {
    return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

const TenantPayments = () => {
    const navigate = useNavigate();
    const [payments, setPayments] = useState([]);
    const [dueDetails, setDueDetails] = useState({
        amountDue: 0,
        dueDate: null,
        isOverdue: false,
        propertyTitle: 'Loading...'
    });

    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState(null);

    // --- 1. FETCH PAYMENT DATA ---
    const fetchPaymentData = async () => {
        try {
            setIsLoading(true);

            // Using the exact routes we created in payment.routes.js
            const [pendingRes, historyRes] = await Promise.all([
                AxiosInstance.get('/payments/pending/rents'),
                AxiosInstance.get('/payments/my/history')
            ]);

            console.log(pendingRes);

            const pendingPayments = pendingRes.data.payments || [];

            // Calculate total due and find the earliest due date
            if (pendingPayments.length > 0) {
                const totalDue = pendingPayments.reduce((sum, p) => sum + p.amountINR, 0);
                // Get the earliest due date (assuming the first pending payment for simplicity)
                const firstDue = pendingPayments[0];
                const dueDateObj = new Date(firstDue.dueDate || Date.now());

                setDueDetails({
                    amountDue: totalDue,
                    dueDate: dueDateObj,
                    isOverdue: dueDateObj < new Date(),
                    propertyTitle: firstDue.propertyId?.title || 'Your Rented Property',
                    invoiceId: firstDue._id
                });
            } else {
                setDueDetails({ amountDue: 0, dueDate: null, isOverdue: false, propertyTitle: '' });
            }
            console.log(historyRes);

            setPayments(historyRes.data.payments || []);

        } catch (err) {
            console.error("Error fetching payment data:", err);
            setError("Failed to load payment information. Please refresh the page.");
        } finally {
            setIsLoading(false);
        }
    };
    useEffect(() => {
        fetchPaymentData();
    }, []);

    // --- 2. PAYMENT HANDLER ---
    const handlePayment = async () => {
        if (dueDetails.amountDue <= 0) return;

        try {
            setIsProcessing(true);

            // 1. Load the Razorpay SDK script
            const res = await loadRazorpayScript();
            if (!res) {
                toast.error("Razorpay SDK failed to load. Are you online?");
                setIsProcessing(false);
                return;
            }

            const orderResponse = await AxiosInstance.post('/payments/create-order', {
                paymentId: dueDetails.invoiceId
            });

            const order = orderResponse.data.order;

            // 4. Set up the Razorpay Checkout Modal options
            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID, // Your frontend public key
                amount: order.amount, // Amount is in paise
                currency: order.currency,
                name: "RHMS Portal",
                description: `Payment for ${dueDetails.propertyTitle}`,
                order_id: order.id, // The secure ID from your backend

                // 5. What happens when payment is successful!
                handler: async function (response) {
                    try {
                        // Send the success signatures back to your backend to mathematically verify them
                        const res = await AxiosInstance.post('/payments/verify', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                        });

                        if (res.status === 200) {
                            toast.success("Payment Successful! Receipt generated.");
                            await fetchPaymentData();
                        }
                    } catch (verifyErr) {
                        console.error("Verification failed:", verifyErr);
                        toast.error("Payment verification failed. Please contact support.");
                    }
                },
                theme: {
                    color: "#2563EB" // Matches your blue-600 Tailwind theme perfectly!
                }
            };

            // 6. Open the Razorpay UI!
            const paymentObject = new window.Razorpay(options);
            // console.log(paymentObject);


            paymentObject.on('payment.failed', function (response) {
                toast.error(`Payment Failed: ${response.error.description}`);
            });

            paymentObject.open();

        } catch (err) {
            console.error("Payment initialization error:", err);
            toast.error("Failed to initialize payment. Please try again.");
        } finally {
            setIsProcessing(false);
        }
    };

    // --- 3. UI HELPERS ---
    const getStatusBadge = (status) => {
        switch (status) {
            case 'success':
                return <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2.5 py-1 rounded-full text-xs font-bold border border-green-200"><CheckCircle size={12} /> Paid</span>;
            case 'pending':
                return <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full text-xs font-bold border border-amber-200"><Clock size={12} /> Pending</span>;
            case 'failed':
                return <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 px-2.5 py-1 rounded-full text-xs font-bold border border-red-200"><AlertCircle size={12} /> Failed</span>;
            default:
                return <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full text-xs font-bold border border-slate-200">{status}</span>;
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-300">

            <DashboardHeader
                title="Payments & Billing"
                subtitle="Manage your rent payments, view upcoming due dates, and download receipts."
            />

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-2 border border-red-100">
                    <AlertCircle size={20} /> {error}
                </div>
            )}

            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="animate-spin text-blue-600" size={40} />
                </div>
            ) : (
                <>
                    {/* --- TOP ROW: CURRENT DUE & STATS --- */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* Payment Action Card */}
                        <div className={`lg:col-span-2 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden ${dueDetails.amountDue > 0 ? (dueDetails.isOverdue ? 'bg-red-600' : 'bg-slate-900') : 'bg-green-600'}`}>

                            {/* Background Decoration */}
                            <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>

                            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                <div>
                                    {dueDetails.propertyTitle && (
                                        <p className="text-white/80 font-bold uppercase tracking-wider text-sm mb-1 flex items-center gap-2">
                                            <Home size={16} /> {dueDetails.propertyTitle}
                                        </p>
                                    )}

                                    {dueDetails.amountDue > 0 ? (
                                        <>
                                            <h2 className="text-4xl font-extrabold mb-2">₹{dueDetails.amountDue.toLocaleString('en-IN')}</h2>
                                            <p className={`font-medium ${dueDetails.isOverdue ? 'text-white' : 'text-slate-400'}`}>
                                                {dueDetails.isOverdue ? '⚠️ Payment is overdue!' : 'Next payment due by'}
                                                <span className="font-bold ml-1 text-white">
                                                    {dueDetails.dueDate ? new Date(dueDetails.dueDate).toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' }) : 'N/A'}
                                                </span>
                                            </p>
                                        </>
                                    ) : (
                                        <>
                                            <h2 className="text-3xl font-extrabold mb-2 flex items-center gap-2"><CheckCircle size={32} /> All Caught Up!</h2>
                                            <p className="font-medium text-green-100">You have no pending rent payments at this time.</p>
                                        </>
                                    )}
                                </div>

                                {dueDetails.amountDue > 0 && (
                                    <button
                                        onClick={handlePayment}
                                        disabled={isProcessing}
                                        className="bg-white text-slate-900 px-8 py-4 rounded-xl font-extrabold shadow-lg hover:bg-slate-100 transition flex items-center gap-2 disabled:opacity-80 w-full md:w-auto justify-center"
                                    >
                                        {isProcessing ? <Loader2 size={20} className="animate-spin" /> : <CreditCard size={20} />}
                                        Pay Now
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Total Paid Stat */}
                        <div className="lg:col-span-1">
                            <StatCard
                                icon={IndianRupee}
                                label="Total Rent Paid (YTD)"
                                value={`₹${payments.filter(p => p.status === 'success').reduce((sum, p) => sum + p.amountINR, 0).toLocaleString('en-IN')}`}
                                color="blue"
                            />
                        </div>
                    </div>

                    {/* --- BOTTOM ROW: TRANSACTION HISTORY --- */}
                    <TableCard title="Payment History">
                        {payments.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                                            <th className="p-4 font-bold">Date</th>
                                            <th className="p-4 font-bold">Description</th>
                                            <th className="p-4 font-bold">Amount</th>
                                            <th className="p-4 font-bold text-center">Status</th>
                                            <th className="p-4 font-bold text-right">Receipt</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {payments.map((payment, idx) => (
                                            <tr key={idx} className="hover:bg-slate-50 transition">

                                                {/* Date & ID */}
                                                <td className="p-4">
                                                    <p className="font-bold text-slate-900 flex items-center gap-2">
                                                        <Calendar size={14} className="text-slate-400" />
                                                        {new Date(payment.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </p>
                                                    <p className="text-[10px] text-slate-400 font-mono mt-1 tracking-tight">#{payment.razorpayPaymentId || payment.razorpayOrderId || 'N/A'}</p>
                                                </td>

                                                {/* Description */}
                                                <td className="p-4">
                                                    <p className="font-bold text-slate-800 capitalize">{payment.type} Payment</p>
                                                    <p className="text-xs text-slate-500">{payment.paymentMonth || 'Online Payment'}</p>
                                                </td>

                                                {/* Amount */}
                                                <td className="p-4">
                                                    <p className="font-extrabold text-slate-900">₹{payment.amountINR?.toLocaleString('en-IN')}</p>
                                                </td>

                                                {/* Status */}
                                                <td className="p-4 text-center">
                                                    {getStatusBadge(payment.status)}
                                                </td>

                                                {/* Actions */}
                                                <td className="p-4 text-right">
                                                    <button
                                                        disabled={payment.status !== 'success'}
                                                        // FIX: Change navigation to hit your App.jsx route with the payment ID
                                                        onClick={() => navigate(`/tenant/receipts/${payment._id}`)}
                                                        className={`p-2 rounded-lg transition inline-flex items-center justify-center ${payment.status === 'success'
                                                            ? 'text-blue-600 hover:bg-blue-50'
                                                            : 'text-slate-300 cursor-not-allowed'
                                                            }`}
                                                        title={payment.status === 'success' ? "Download Receipt" : "Receipt not available"}
                                                    >
                                                        <Download size={18} />
                                                    </button>
                                                </td>

                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="p-12 text-center text-slate-500">
                                <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                                    <FileText size={32} />
                                </div>
                                <h3 className="text-lg font-bold text-slate-800 mb-1">No Payment History</h3>
                                <p className="text-sm">Your past transactions will appear here once you make a payment.</p>
                            </div>
                        )}
                    </TableCard>
                </>
            )}
        </div>
    );
};

export default TenantPayments;