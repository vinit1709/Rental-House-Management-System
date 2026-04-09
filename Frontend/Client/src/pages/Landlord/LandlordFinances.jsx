import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    IndianRupee, TrendingUp, Clock, AlertCircle,
    Download, FileText, CheckCircle, Search, Loader2
} from 'lucide-react';
import { DashboardHeader, StatCard, TableCard } from '../../components/DashboardSharedUI';
import AxiosInstance from '../../api/axiosInstance';

const LandlordFinances = () => {
    const navigate = useNavigate();
    const [transactions, setTransactions] = useState([]);
    const [stats, setStats] = useState({
        totalRevenue: 0,
        pendingAmount: 0
    });

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    // --- 1. FETCH EXACT FINANCIAL DATA FROM OUR BACKEND ---
    useEffect(() => {
        const fetchFinances = async () => {
            try {
                setIsLoading(true);
                // Hit the shared history route (it automatically filters for Landlord based on JWT token)
                const response = await AxiosInstance.get('/payments/my/history');
                console.log(response.data);
                const fetchedTxns = response.data.payments || [];

                // Calculate real stats from the database payload
                const revenue = fetchedTxns
                    .filter(t => t.status === 'success')
                    .reduce((sum, t) => sum + (t.amountINR || 0), 0);

                const pending = fetchedTxns
                    .filter(t => t.status === 'pending')
                    .reduce((sum, t) => sum + (t.amountINR || 0), 0);

                setTransactions(fetchedTxns);
                setStats({ totalRevenue: revenue, pendingAmount: pending });

            } catch (err) {
                console.error("Error fetching finances:", err);
                setError("Failed to load financial data. Please try again later.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchFinances();
    }, []);

    // --- 2. SMART FILTERING LOGIC ---
    const filteredTransactions = transactions.filter(txn => {
        const tenantName = txn.tenantId?.name || '';
        const propertyTitle = txn.propertyId?.title || '';
        const txnId = txn.razorpayPaymentId || txn.razorpayOrderId || '';

        const matchesSearch =
            tenantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            propertyTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
            txnId.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = filterStatus === 'all' ? true : txn.status === filterStatus;

        return matchesSearch && matchesStatus;
    });

    // --- 3. HELPER FUNCTIONS ---
    const getStatusBadge = (status) => {
        switch (status) {
            case 'success': return <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2.5 py-1 rounded-full text-xs font-bold border border-green-200"><CheckCircle size={12} /> Paid</span>;
            case 'pending': return <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full text-xs font-bold border border-amber-200"><Clock size={12} /> Pending</span>;
            case 'failed': return <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 px-2.5 py-1 rounded-full text-xs font-bold border border-red-200"><AlertCircle size={12} /> Failed</span>;
            default: return <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full text-xs font-bold border border-slate-200">{status}</span>;
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <DashboardHeader
                title="Financial Ledger"
                subtitle="Track your rental income, monitor pending payments, and export transaction history."
            />

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-2 border border-red-100">
                    <AlertCircle size={20} /> {error}
                </div>
            )}

            {/* STAT CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <StatCard
                    icon={TrendingUp}
                    label="Total Revenue Collected"
                    value={`₹${stats.totalRevenue.toLocaleString('en-IN')}`}
                    color="green"
                />
                <StatCard
                    icon={Clock}
                    label="Outstanding Pending Dues"
                    value={`₹${stats.pendingAmount.toLocaleString('en-IN')}`}
                    color="orange"
                />
            </div>

            {/* MAIN CONTENT AREA */}
            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="animate-spin text-blue-600" size={40} />
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    {/* SEARCH & FILTER BAR */}
                    <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="relative w-full md:w-96">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search size={18} className="text-slate-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search tenant, property, or Txn ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none transition bg-white"
                            />
                        </div>
                        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                            {['all', 'success', 'pending', 'failed'].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setFilterStatus(status)}
                                    className={`px-4 py-1.5 rounded-full text-sm font-bold capitalize transition whitespace-nowrap ${filterStatus === status
                                        ? 'bg-slate-900 text-white shadow-md'
                                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                                        }`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* TRANSACTION TABLE */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                                    <th className="p-4 font-bold">Date & ID</th>
                                    <th className="p-4 font-bold">Details</th>
                                    <th className="p-4 font-bold">Amount</th>
                                    <th className="p-4 font-bold text-center">Status</th>
                                    <th className="p-4 font-bold text-right">Receipt</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {filteredTransactions.length > 0 ? (
                                    filteredTransactions.map((txn, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50 transition">
                                            <td className="p-4">
                                                <p className="font-bold text-slate-900">
                                                    {new Date(txn.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </p>
                                                <p className="text-[10px] text-slate-400 font-mono mt-0.5 tracking-tight">#{txn.razorpayPaymentId || txn.razorpayOrderId || 'N/A'}</p>
                                            </td>
                                            <td className="p-4">
                                                <p className="font-bold text-slate-800">{txn.tenantId?.name || 'Unknown Tenant'}</p>
                                                <p className="text-xs text-slate-500 line-clamp-1">{txn.propertyId?.title || 'Unknown Property'}</p>
                                            </td>
                                            <td className="p-4">
                                                <p className="font-extrabold text-slate-900">₹{txn.amountINR?.toLocaleString('en-IN') || 0}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">{txn.type || 'Rent'} - {txn.paymentMonth}</p>
                                            </td>
                                            <td className="p-4 text-center">
                                                {getStatusBadge(txn.status)}
                                            </td>
                                            <td className="p-4 text-right">
                                                <button
                                                    onClick={() => navigate(`/landlord/${txn.receiptUrl}`)}
                                                    disabled={txn.status !== 'success' || !txn.receiptUrl}
                                                    className={`p-2 rounded-lg transition inline-flex items-center justify-center ${txn.status === 'success' && txn.receiptUrl
                                                        ? 'text-blue-600 hover:bg-blue-50'
                                                        : 'text-slate-300 cursor-not-allowed'
                                                        }`}
                                                    title={txn.status === 'success' ? "View Official Receipt" : "Receipt unavailable"}
                                                >
                                                    <Download size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="p-8 text-center text-slate-500">
                                            <div className="flex flex-col items-center justify-center">
                                                <IndianRupee size={40} className="text-slate-300 mb-3" />
                                                <p className="font-medium text-slate-600">No transactions found.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LandlordFinances;