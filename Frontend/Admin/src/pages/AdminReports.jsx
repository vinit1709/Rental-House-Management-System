import React, { useState, useEffect, useMemo } from 'react';
import {
    Activity, IndianRupee, Wrench, Search, Loader2,
    CheckCircle, AlertCircle, Clock, Undo2, MapPin, User,
    TrendingDown, BarChart2
} from 'lucide-react';
import AxiosInstance from '../api/axiosInstance';
import { toast } from 'react-hot-toast';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const AdminReports = () => {
    const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'payments', 'expenses', 'maintenance'

    // Data States
    const [payments, setPayments] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [maintenance, setMaintenance] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Refund State
    const [isRefundingId, setIsRefundingId] = useState(null);

    // --- 1. FETCH ALL PLATFORM DATA ---
    useEffect(() => {
        const fetchAllData = async () => {
            try {
                setIsLoading(true);

                const [paymentsRes, expensesRes, maintenanceRes] = await Promise.all([
                    AxiosInstance.get('/payments/admin/all').catch(() => ({ data: { payments: [] } })),
                    AxiosInstance.get('/payments/admin/expenses').catch(() => ({ data: { expenses: [] } })),
                    AxiosInstance.get('/maintenance/admin/all').catch(() => ({ data: { requests: [] } }))
                ]);

                setPayments(paymentsRes.data.payments || []);
                setExpenses(expensesRes.data.expenses || []);
                setMaintenance(maintenanceRes.data.requests || []);
            } catch (err) {
                console.error("Error fetching admin reports:", err);
                toast.error("Failed to load platform data.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchAllData();
    }, []);

    // --- 2. PROCESS DATA FOR CHART ---
    const chartData = useMemo(() => {
        const monthlyData = {};

        // Process Revenue (Successful Payments)
        payments.forEach(p => {
            if (p.status !== 'success') return;
            const date = new Date(p.createdAt);
            const monthYear = date.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });

            if (!monthlyData[monthYear]) monthlyData[monthYear] = { name: monthYear, Revenue: 0, Expenses: 0, sortKey: date.getTime() };
            monthlyData[monthYear].Revenue += (p.amountINR || 0);
        });

        // Process Expenses
        expenses.forEach(e => {
            const date = new Date(e.date || e.createdAt);
            const monthYear = date.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });

            if (!monthlyData[monthYear]) monthlyData[monthYear] = { name: monthYear, Revenue: 0, Expenses: 0, sortKey: date.getTime() };
            monthlyData[monthYear].Expenses += (e.amount || 0);
        });

        // Convert to array and sort chronologically
        return Object.values(monthlyData).sort((a, b) => a.sortKey - b.sortKey);
    }, [payments, expenses]);

    // --- 3. REFUND HANDLER ---
    const handleRefund = async (paymentId, amount) => {
        if (!window.confirm(`Are you absolutely sure you want to refund ₹${amount}? This action cannot be reversed.`)) return;

        try {
            setIsRefundingId(paymentId);
            await AxiosInstance.post(`/payments/refund/${paymentId}`);
            toast.success("Refund initiated successfully!");
            setPayments(prev => prev.map(p => p._id === paymentId ? { ...p, status: 'refunded' } : p));
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to process refund.");
        } finally {
            setIsRefundingId(null);
        }
    };

    // --- 4. FILTERING LOGIC ---
    const searchLower = searchTerm.toLowerCase();

    const filteredPayments = payments.filter(p =>
        (p.razorpayPaymentId || '').toLowerCase().includes(searchLower) ||
        (p.tenantId?.name || '').toLowerCase().includes(searchLower)
    );

    const filteredExpenses = expenses.filter(e =>
        (e.title || '').toLowerCase().includes(searchLower) ||
        (e.landlordId?.name || '').toLowerCase().includes(searchLower)
    );

    const filteredMaintenance = maintenance.filter(m =>
        (m.title || '').toLowerCase().includes(searchLower) ||
        (m.tenantId?.name || '').toLowerCase().includes(searchLower)
    );

    // --- 5. UI HELPERS ---
    const getStatusBadge = (status) => {
        switch (status) {
            case 'success': case 'resolved': return <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"><CheckCircle size={12} /> {status}</span>;
            case 'pending': return <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"><Clock size={12} /> {status}</span>;
            case 'in-progress': return <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"><Wrench size={12} /> {status}</span>;
            case 'failed': case 'cancelled': return <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"><AlertCircle size={12} /> {status}</span>;
            case 'refunded': return <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"><Undo2 size={12} /> {status}</span>;
            default: return <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">{status}</span>;
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-300">

            {/* --- HEADER --- */}
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
                        <Activity className="text-blue-600" size={28} />
                        Platform Ledgers & Analytics
                    </h1>
                    <p className="text-slate-500 mt-1">Audit financial transactions, track property expenses, and monitor platform health.</p>
                </div>
            </div>

            {/* --- CONTROLS: TABS & SEARCH --- */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col xl:flex-row gap-4 justify-between items-center">
                <div className="flex p-1 bg-slate-100 rounded-lg w-full xl:w-auto overflow-x-auto">
                    <button onClick={() => setActiveTab('overview')} className={`flex-1 xl:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-md text-sm font-bold transition whitespace-nowrap ${activeTab === 'overview' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}><BarChart2 size={16} /> Analytics</button>
                    <button onClick={() => setActiveTab('payments')} className={`flex-1 xl:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-md text-sm font-bold transition whitespace-nowrap ${activeTab === 'payments' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}><IndianRupee size={16} /> Rent Payments</button>
                    <button onClick={() => setActiveTab('expenses')} className={`flex-1 xl:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-md text-sm font-bold transition whitespace-nowrap ${activeTab === 'expenses' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}><TrendingDown size={16} /> Expenses</button>
                    <button onClick={() => setActiveTab('maintenance')} className={`flex-1 xl:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-md text-sm font-bold transition whitespace-nowrap ${activeTab === 'maintenance' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}><Wrench size={16} /> Maintenance</button>
                </div>

                {activeTab !== 'overview' && (
                    <div className="relative w-full xl:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input type="text" placeholder={`Search ${activeTab}...`} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 focus:bg-white transition" />
                    </div>
                )}
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center h-64 bg-white rounded-xl border border-slate-200 shadow-sm"><Loader2 className="animate-spin text-blue-600" size={40} /></div>
            ) : (
                <>
                    {/* --- TAB 0: VISUAL ANALYTICS --- */}
                    {activeTab === 'overview' && (
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-in slide-in-from-bottom-4">
                            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <IndianRupee className="text-emerald-500" size={20} />
                                Cash Flow: Platform Revenue vs Landlord Expenses
                            </h3>

                            {chartData.length === 0 ? (
                                <div className="h-80 flex items-center justify-center text-slate-400 font-medium">Not enough data to generate chart.</div>
                            ) : (
                                <div className="h-96 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} dy={10} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(value) => `₹${(value / 1000)}k`} />
                                            <Tooltip
                                                cursor={{ fill: '#f8fafc' }}
                                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                                formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, undefined]}
                                            />
                                            <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
                                            <Bar dataKey="Revenue" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={50} />
                                            <Bar dataKey="Expenses" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={50} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                        </div>
                    )}

                    {/* --- TABLES --- */}
                    {activeTab !== 'overview' && (
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">

                                    {/* PAYMENTS */}
                                    {activeTab === 'payments' && (
                                        <>
                                            <thead>
                                                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                                                    <th className="p-4 font-bold">Transaction ID & Date</th>
                                                    <th className="p-4 font-bold">Parties Involved</th>
                                                    <th className="p-4 font-bold">Amount</th>
                                                    <th className="p-4 font-bold text-center">Status</th>
                                                    <th className="p-4 font-bold text-right">Admin Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {filteredPayments.map(payment => (
                                                    <tr key={payment._id} className="hover:bg-slate-50 transition">
                                                        <td className="p-4">
                                                            <p className="font-bold text-slate-900">{new Date(payment.createdAt).toLocaleDateString('en-IN')}</p>
                                                            <p className="text-[10px] font-mono text-slate-400 mt-0.5">#{payment.razorpayPaymentId || payment._id.slice(-8)}</p>
                                                        </td>
                                                        <td className="p-4">
                                                            <p className="font-semibold text-slate-800 text-sm flex items-center gap-1"><User size={12} className="text-blue-500" /> {payment.tenantId?.name}</p>
                                                            <p className="text-xs text-slate-500 flex items-center gap-1 mt-1"><MapPin size={12} className="text-purple-500" /> {payment.propertyId?.title}</p>
                                                        </td>
                                                        <td className="p-4">
                                                            <p className="font-extrabold text-slate-900 text-lg">₹{payment.amountINR?.toLocaleString('en-IN')}</p>
                                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">{payment.type} - {payment.paymentMonth}</p>
                                                        </td>
                                                        <td className="p-4 text-center">{getStatusBadge(payment.status)}</td>
                                                        <td className="p-4 text-right">
                                                            <button onClick={() => handleRefund(payment._id, payment.amountINR)} disabled={payment.status !== 'success' || isRefundingId === payment._id} className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 ml-auto ${payment.status === 'success' ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-slate-50 text-slate-400 cursor-not-allowed'}`}>
                                                                {isRefundingId === payment._id ? <Loader2 size={14} className="animate-spin" /> : <Undo2 size={14} />} Refund
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </>
                                    )}

                                    {/* EXPENSES */}
                                    {activeTab === 'expenses' && (
                                        <>
                                            <thead>
                                                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                                                    <th className="p-4 font-bold">Expense Title & Date</th>
                                                    <th className="p-4 font-bold">Property & Landlord</th>
                                                    <th className="p-4 font-bold">Category</th>
                                                    <th className="p-4 font-bold text-right">Amount</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {filteredExpenses.map(expense => (
                                                    <tr key={expense._id} className="hover:bg-slate-50 transition">
                                                        <td className="p-4">
                                                            <p className="font-bold text-slate-900">{expense.title}</p>
                                                            <p className="text-xs text-slate-500 mt-1">{new Date(expense.date).toLocaleDateString('en-IN')}</p>
                                                        </td>
                                                        <td className="p-4">
                                                            <p className="font-semibold text-slate-800 text-sm flex items-center gap-1"><MapPin size={12} className="text-purple-500" /> {expense.propertyId?.title}</p>
                                                            <p className="text-xs text-slate-500 flex items-center gap-1 mt-1"><User size={12} className="text-blue-500" /> {expense.landlordId?.name}</p>
                                                        </td>
                                                        <td className="p-4"><span className="px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider rounded-md border bg-slate-100 text-slate-700">{expense.category}</span></td>
                                                        <td className="p-4 text-right"><p className="font-extrabold text-red-600 text-lg">- ₹{expense.amount?.toLocaleString('en-IN')}</p></td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </>
                                    )}

                                    {/* MAINTENANCE */}
                                    {activeTab === 'maintenance' && (
                                        <>
                                            <thead>
                                                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                                                    <th className="p-4 font-bold">Issue Details</th>
                                                    <th className="p-4 font-bold">Property & Tenant</th>
                                                    <th className="p-4 font-bold">Priority</th>
                                                    <th className="p-4 font-bold">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {filteredMaintenance.map(req => (
                                                    <tr key={req._id} className="hover:bg-slate-50 transition">
                                                        <td className="p-4">
                                                            <p className="font-bold text-slate-900">{req.title}</p>
                                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">{req.category} | {new Date(req.createdAt).toLocaleDateString('en-IN')}</p>
                                                        </td>
                                                        <td className="p-4">
                                                            <p className="font-semibold text-slate-800 text-sm flex items-center gap-1"><MapPin size={12} className="text-purple-500" /> {req.propertyId?.title}</p>
                                                            <p className="text-xs text-slate-500 flex items-center gap-1 mt-1"><User size={12} className="text-blue-500" /> {req.tenantId?.name}</p>
                                                        </td>
                                                        <td className="p-4"><span className="px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider rounded-md border bg-slate-100">{req.priority}</span></td>
                                                        <td className="p-4">{getStatusBadge(req.status)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </>
                                    )}

                                </table>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default AdminReports;