import React, { useState, useEffect } from 'react';
import {
    BarChart3, Download, Calendar, Filter,
    TrendingUp, TrendingDown, IndianRupee, FileText, Loader2, Home
} from 'lucide-react';
import { DashboardHeader, StatCard, TableCard } from '../../components/DashboardSharedUI';
import AxiosInstance from '../../api/axiosInstance';

const LandlordReports = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);

    // Filters
    const [dateRange, setDateRange] = useState('all');
    const [selectedProperty, setSelectedProperty] = useState('all');

    // Real Data State mapped from your backend
    const [reportData, setReportData] = useState({
        revenue: 0,
        maintenanceCosts: 0,
        netIncome: 0,
        properties: []
    });

    useEffect(() => {
        const fetchReportSummary = async () => {
            try {
                setIsLoading(true);

                // Fetch both real Income and real Expenses!
                const [incomeRes, expenseRes] = await Promise.all([
                    AxiosInstance.get('/payments/my/history'),
                    AxiosInstance.get('/payments/expenses/my').catch(() => ({ data: { expenses: [] } }))
                ]);

                const incomes = incomeRes.data.payments || [];
                const expenses = expenseRes.data.expenses || [];

                // Math! (Filter successful income)
                const totalRevenue = incomes
                    .filter(i => i.status === 'success')
                    .reduce((sum, i) => sum + (i.amountINR || 0), 0);

                const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

                // Extract unique properties for the dropdown
                const uniqueProps = [];
                const map = new Map();
                for (const item of incomes) {
                    if (item.propertyId && !map.has(item.propertyId._id)) {
                        map.set(item.propertyId._id, true);
                        uniqueProps.push({ _id: item.propertyId._id, title: item.propertyId.title });
                    }
                }

                setReportData({
                    revenue: totalRevenue,
                    maintenanceCosts: totalExpenses,
                    netIncome: totalRevenue - totalExpenses,
                    properties: uniqueProps
                });

            } catch (err) {
                console.error("Error fetching reports:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchReportSummary();
    }, [dateRange, selectedProperty]);

    const handleGenerateReport = () => {
        setIsGenerating(true);
        setTimeout(() => {
            alert(`Backend PDF Generation coming soon!`);
            setIsGenerating(false);
        }, 1000);
    };

    // Calculate percentages for visual bars
    const totalCashFlow = reportData.revenue + reportData.maintenanceCosts;
    const revenuePercent = totalCashFlow > 0 ? (reportData.revenue / totalCashFlow) * 100 : 0;
    const expensePercent = totalCashFlow > 0 ? (reportData.maintenanceCosts / totalCashFlow) * 100 : 0;

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <DashboardHeader
                title="Profit & Loss Reports"
                subtitle="Analyze your property performance, cash flow, and generate tax-ready documents."
                action={
                    <button
                        onClick={handleGenerateReport}
                        disabled={isGenerating}
                        className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-lg font-bold hover:bg-slate-800 transition shadow-sm disabled:opacity-70"
                    >
                        {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <BarChart3 size={18} />}
                        Export PDF
                    </button>
                }
            />

            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="animate-spin text-blue-600" size={40} />
                </div>
            ) : (
                <>
                    {/* SUMMARY STATS */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <StatCard icon={IndianRupee} label="Gross Revenue" value={`₹${reportData.revenue.toLocaleString('en-IN')}`} color="green" />
                        <StatCard icon={TrendingDown} label="Operating Expenses" value={`₹${reportData.maintenanceCosts.toLocaleString('en-IN')}`} color="red" />
                        <StatCard icon={TrendingUp} label="Net Income (Profit)" value={`₹${reportData.netIncome.toLocaleString('en-IN')}`} color="blue" />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* VISUAL CASH FLOW BREAKDOWN */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col">
                            <h3 className="font-bold text-slate-800 text-lg mb-6 flex items-center gap-2">
                                <BarChart3 size={20} className="text-blue-600" /> Cash Flow Breakdown
                            </h3>

                            <div className="flex-1 flex flex-col justify-center space-y-8">
                                {/* Revenue Bar */}
                                <div>
                                    <div className="flex justify-between items-end mb-2">
                                        <span className="font-bold text-slate-700">Gross Revenue</span>
                                        <span className="font-extrabold text-green-600">₹{reportData.revenue.toLocaleString('en-IN')}</span>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden">
                                        <div className="bg-green-500 h-4 rounded-full transition-all duration-1000" style={{ width: `${revenuePercent}%` }}></div>
                                    </div>
                                </div>

                                {/* Expenses Bar */}
                                <div>
                                    <div className="flex justify-between items-end mb-2">
                                        <span className="font-bold text-slate-700">Total Outflow (Expenses)</span>
                                        <span className="font-extrabold text-red-600">₹{reportData.maintenanceCosts.toLocaleString('en-IN')}</span>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden">
                                        <div className="bg-red-500 h-4 rounded-full transition-all duration-1000" style={{ width: `${expensePercent}%` }}></div>
                                    </div>
                                </div>

                                {/* Net Income Block */}
                                <div className={`mt-4 p-4 rounded-xl flex items-center justify-between border ${reportData.netIncome >= 0 ? 'bg-blue-50 border-blue-100' : 'bg-red-50 border-red-100'}`}>
                                    <div>
                                        <p className={`text-xs font-bold uppercase tracking-wider ${reportData.netIncome >= 0 ? 'text-blue-500' : 'text-red-500'}`}>Total Net Profit</p>
                                        <p className={`text-2xl font-extrabold ${reportData.netIncome >= 0 ? 'text-blue-900' : 'text-red-900'}`}>₹{reportData.netIncome.toLocaleString('en-IN')}</p>
                                    </div>
                                    <div className={`w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm ${reportData.netIncome >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                                        {reportData.netIncome >= 0 ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* REMOVED DUMMY REPORTS TABLE FOR NOW TO KEEP IT REAL DATA FOCUSED */}
                    </div>
                </>
            )}
        </div>
    );
};

export default LandlordReports;