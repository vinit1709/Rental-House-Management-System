import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Printer, CheckCircle, Loader2, Home, ArrowLeft } from 'lucide-react';
import AxiosInstance from '../api/axiosInstance';

const PaymentReceipt = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [payment, setPayment] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchReceipt = async () => {
            try {
                // Fetch the specific payment details from our backend
                const response = await AxiosInstance.get(`/payments/${id}`);
                setPayment(response.data.payment);
            } catch (error) {
                console.error("Error fetching receipt:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchReceipt();
    }, [id]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
                <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
                <p className="font-bold text-slate-500">Loading Official Receipt...</p>
            </div>
        );
    }

    if (!payment) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
                <h2 className="text-2xl font-bold text-slate-800">Receipt Not Found</h2>
                <button onClick={() => navigate(-1)} className="mt-4 text-blue-600 hover:underline">Go Back</button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-12 font-sans">

            {/* Top Action Bar - Hidden when printing! */}
            <div className="max-w-3xl mx-auto mb-4 flex justify-between items-center px-4 print:hidden">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold transition">
                    <ArrowLeft size={20} /> Back
                </button>
                <button
                    onClick={() => window.print()}
                    className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition shadow-sm"
                >
                    <Printer size={20} /> Print / Save as PDF
                </button>
            </div>

            {/* The Actual Printable Receipt Paper */}
            <div className="max-w-3xl mx-auto bg-white p-10 md:p-16 rounded-2xl shadow-xl border border-slate-100 print:shadow-none print:border-none print:p-0">

                {/* Header */}
                <div className="flex justify-between items-start border-b-2 border-slate-100 pb-8 mb-5">
                    <div className="flex items-center gap-2 group">
                        {/* Changed: Solid Blue Box instead of gradient */}
                        <div className="bg-blue-600 p-2 rounded-lg duration-300 shadow-sm">
                            <Home className="text-white" size={22} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-bold text-slate-900 tracking-tight">
                                RentalPro
                            </span>
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider hidden sm:block">
                                Management System
                            </span>
                        </div>
                    </div>
                    <div className="text-right">
                        <h2 className="text-4xl font-black text-slate-200 uppercase tracking-widest">Receipt</h2>
                        <p className="text-slate-500 font-bold mt-2">#{payment.razorpayPaymentId || payment.razorpayOrderId}</p>
                    </div>
                </div>

                {/* Status Banner */}
                <div className="bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-xl flex items-center gap-3 mb-5 print:hidden">
                    <CheckCircle size={24} className="text-green-600" />
                    <p className="font-bold text-lg">Payment Successful</p>
                    <div>
                        <p className="text-sm opacity-80">Paid on {new Date(payment.updatedAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                </div>

                {/* Parties Information */}
                <div className="grid grid-cols-2 gap-8 mb-8">
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Billed To (Tenant)</p>
                        <p className="font-bold text-slate-900 text-lg">{payment.tenantId?.name || 'Tenant'}</p>
                        <p className="text-slate-600">{payment.tenantId?.email}</p>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Paid To (Landlord)</p>
                        <p className="font-bold text-slate-900 text-lg">{payment.landlordId?.name || 'Landlord'}</p>
                        <p className="text-slate-600">{payment.landlordId?.email}</p>
                    </div>
                </div>

                {/* Payment Details Table */}
                <div className="border border-slate-200 rounded-xl overflow-hidden mb-8">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Description</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            <tr>
                                <td className="p-6">
                                    <p className="font-bold text-slate-900 text-lg capitalize">{payment.type} Payment</p>
                                    <p className="text-slate-500 mt-1">For Property: {payment.propertyId?.title || 'N/A'}</p>
                                    <p className="text-slate-500">Billing Cycle: {payment.paymentMonth}</p>
                                </td>
                                <td className="p-6 text-right align-top">
                                    <p className="font-bold text-slate-900 text-lg">₹{payment.amountINR?.toLocaleString('en-IN')}</p>
                                </td>
                            </tr>
                        </tbody>
                        <tfoot className="bg-slate-50 border-t-2 border-slate-200">
                            <tr>
                                <td className="p-4 text-right font-bold text-slate-700">Total Paid:</td>
                                <td className="p-4 text-right font-black text-blue-700 text-xl">₹{payment.amountINR?.toLocaleString('en-IN')}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                {/* --- IMPERFECT GREEN 'PAID' STAMP --- */}
                <div className="relative h-36 w-full flex justify-end pr-12 mt-4 pointer-events-none select-none">
                    <div className="absolute transform -rotate-12 border-[5px] border-double border-green-700/80 text-green-700/80 rounded-2xl px-8 py-3 z-10 print:border-green-700 print:text-green-700 mix-blend-multiply opacity-90">
                        <h3 className="text-5xl font-black uppercase tracking-[0.2em] text-center m-0 leading-none">PAID</h3>

                        {/* - Dashed divider inside the stamp too - */}
                        <div className="border-t-[3px] border border-green-700/60 my-2 print:border-green-700"></div>

                        <p className="text-xs font-bold text-center font-mono tracking-tight">
                            {new Date(payment.updatedAt).toLocaleDateString('en-IN')} | {new Date(payment.updatedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </div>
                </div>

                {/* Footer Notes */}
                <div className="text-center text-slate-400 text-sm pt-8 border-t border-slate-100">
                    <p>This is a computer-generated receipt and does not require a physical signature.</p>
                    <p className="mt-1">Transaction ID: {payment.razorpayPaymentId}</p>
                </div>

            </div>
        </div>
    );
};

export default PaymentReceipt;