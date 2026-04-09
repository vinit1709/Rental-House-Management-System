import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IndianRupee, Calendar, ClipboardClock, Home, CheckCircle, Bell, AlertTriangle, FileText, ShieldAlert, Loader2, XCircle, Clock } from 'lucide-react';
import { StatCard, TableCard } from '../../components/DashboardSharedUI';
import Loading from '../../components/loading/loading';
import { useAuth } from '../../context/authContext';
import AxiosInstance from '../../api/axiosInstance';

const TenantOverview = () => {
  // 1. Get current user from context
  const { user } = useAuth();
  const navigate = useNavigate();

  // Read verification status directly from the user object!
  const verificationStatus = user?.verificationStatus || 'unverified';

  // 2. Set up State for the data
  const [isLoading, setIsLoading] = useState(true);
  const [tenantData, setTenantData] = useState({
    name: '',
    property: 'No active property',
    rentAmount: 0,
    dueDate: null,
    daysLeftText: 'No pending dues',
    leaseEnd: null,
    hasPendingDues: false
  });
  const [recentPayments, setRecentPayments] = useState([]);

  // 3. Fetch Data on Component Mount
  useEffect(() => {
    const fetchTenantData = async () => {
      try {
        setIsLoading(true);

        // Parallel API calls using the exact routes we built!
        const [leaseRes, pendingRes, historyRes] = await Promise.all([
          AxiosInstance.get('/leases').catch(() => ({ data: { leases: [] } })),
          AxiosInstance.get('/payments/pending/rents').catch(() => ({ data: { payments: [] } })),
          AxiosInstance.get('/payments/my/history').catch(() => ({ data: { payments: [] } }))
        ]);

        // 1. Process Leases (Find the active one)
        const allLeases = leaseRes.data?.leases || [];
        const activeLease = allLeases.find(l => l.status === 'active');

        // 2. Process Pending Payments (Find the next due bill)
        const pendingPayments = pendingRes.data?.payments || [];
        const firstDue = pendingPayments.length > 0 ? pendingPayments[0] : null;

        // Calculate exact days left
        let daysLeft = "All caught up";
        if (firstDue?.dueDate) {
          const diffTime = new Date(firstDue.dueDate) - new Date();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          if (diffDays < 0) daysLeft = `${Math.abs(diffDays)} Days Overdue!`;
          else if (diffDays === 0) daysLeft = "Due Today!";
          else daysLeft = `${diffDays} Days Left`;
        }

        // Map the backend data to our state
        setTenantData({
          name: user?.name || 'User',
          property: activeLease?.propertyId?.title || firstDue?.propertyId?.title || 'Looking for a home?',
          rentAmount: firstDue?.amountINR || activeLease?.monthlyRent || 0,
          dueDate: firstDue?.dueDate || null,
          daysLeftText: daysLeft,
          leaseEnd: activeLease?.endDate || null,
          hasPendingDues: pendingPayments.length > 0
        });

        // 3. Process History
        setRecentPayments(historyRes.data?.payments || []);

      } catch (error) {
        console.error("Error fetching tenant dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchTenantData();
    }
  }, [user]);

  // 4. Loading State
  if (isLoading) {
    return (
      <div className='p-8 text-center text-slate-500 font-medium'>
        <Loading />
        <p>Dashboard is Loading...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">

      {/* --- CONDITIONAL VERIFICATION BANNERS --- */}

      {/* 1. Unverified Banner */}
      {verificationStatus === 'unverified' && (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg flex flex-col sm:flex-row items-start sm:items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-2 gap-4">
          <div className="flex gap-3">
            <ShieldAlert className="text-blue-600 mt-0.5 flex-shrink-0" size={20} />
            <div>
              <h4 className="font-bold text-blue-800">Verification Required</h4>
              <p className="text-blue-700 text-sm mt-1">
                You are viewing as a guest. Verify your Government ID to apply for rentals and access lease agreements.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/tenant/settings')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition shadow-sm whitespace-nowrap"
          >
            Verify Now
          </button>
        </div>
      )}

      {/* 2. Pending Banner */}
      {verificationStatus === 'pending' && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg flex flex-col sm:flex-row items-start sm:items-center justify-between shadow-sm gap-4">
          <div className="flex gap-3">
            <ClipboardClock className="text-amber-600 mt-0.5 flex-shrink-0" size={20} />
            <div>
              <h4 className="font-bold text-amber-800">Verification Pending</h4>
              <p className="text-amber-700 text-sm mt-1">
                Your identity document is currently under review. We will notify you once approved so you can sign leases.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/tenant/settings')}
            className="bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-amber-700 transition shadow-sm whitespace-nowrap"
          >
            View Status
          </button>
        </div>
      )}

      {/* 3. Rejected Banner */}
      {verificationStatus === 'rejected' && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex flex-col sm:flex-row items-start sm:items-center justify-between shadow-sm gap-4">
          <div className="flex gap-3">
            <XCircle className="text-red-600 mt-0.5 flex-shrink-0" size={20} />
            <div>
              <h4 className="font-bold text-red-800">Verification Rejected</h4>
              <p className="text-red-700 text-sm mt-1">
                There was an issue with your document. Please check your settings and try uploading again.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/tenant/settings')}
            className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-700 transition shadow-sm whitespace-nowrap"
          >
            Fix Issue
          </button>
        </div>
      )}

      {/* --- WELCOME BANNER --- */}
      <div className={`rounded-2xl p-8 text-white shadow-lg relative overflow-hidden bg-slate-900`}>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h2 className="text-3xl font-bold mb-2">
              Welcome Home, {user?.name ? user.name : 'User'}.
            </h2>
            <p className="text-white/80 font-medium flex items-center gap-2">
              <Home size={18} /> {tenantData.property}
            </p>
          </div>

          {tenantData.hasPendingDues && (
            <button
              onClick={() => navigate('/tenant/payments')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg transition flex items-center gap-2">
              <IndianRupee size={20} /> Pay Rent Now
            </button>
          )}
        </div>
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
      </div>

      {/* --- STAT CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          icon={IndianRupee}
          label={tenantData.hasPendingDues ? "Current Amount Due" : "Monthly Rent"}
          value={`₹${(tenantData.rentAmount || 0).toLocaleString('en-IN')}`}
          color={tenantData.hasPendingDues ? "red" : "green"}
        />
        <StatCard
          icon={Calendar}
          label="Next Due Date"
          value={tenantData.dueDate ? new Date(tenantData.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
          subtext={tenantData.daysLeftText}
          color={tenantData.hasPendingDues ? (tenantData.daysLeftText.includes('Overdue') ? 'red' : 'orange') : 'blue'}
        />
        <StatCard
          icon={Home}
          label="Lease Ends"
          value={tenantData.leaseEnd ? new Date(tenantData.leaseEnd).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A'}
          color="blue"
        />
      </div>

      {/* --- DATA TABLES --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* RECENT ACTIVITY */}
        <TableCard title="Recent Activity" action={<button onClick={() => navigate('/tenant/payments')} className="text-sm text-blue-600 font-semibold hover:underline">View All</button>}>
          {recentPayments && recentPayments.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {recentPayments.slice(0, 3).map((payment, i) => (
                <div key={i} className="p-4 flex justify-between items-center hover:bg-slate-50 transition">
                  <div className="flex items-center gap-3">
                    {payment.status === 'success' ? (
                      <div className="p-2 bg-green-100 rounded-full text-green-600"><CheckCircle size={16} /></div>
                    ) : (
                      <div className="p-2 bg-amber-100 rounded-full text-amber-600"><Clock size={16} /></div>
                    )}
                    <div>
                      <p className="font-bold text-slate-800 capitalize">{payment.type} Payment</p>
                      <p className="text-xs text-slate-500">{new Date(payment.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-700 block">₹{payment.amountINR?.toLocaleString('en-IN')}</span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${payment.status === 'success' ? 'text-green-600' : 'text-amber-600'}`}>
                      {payment.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500 flex flex-col items-center">
              <FileText size={32} className="text-slate-300 mb-3" />
              <p className="text-sm font-medium">No recent transactions</p>
            </div>
          )}
        </TableCard>

        {/* NOTIFICATIONS CARD */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Bell size={18} /> Alerts & Notifications</h3>
          <div className="space-y-4">

            {/* Dynamic Rent Notification */}
            {tenantData.hasPendingDues ? (
              <div className={`flex gap-3 items-start p-4 rounded-xl border ${tenantData.daysLeftText.includes('Overdue') ? 'bg-red-50 border-red-100' : 'bg-orange-50 border-orange-100'}`}>
                <AlertTriangle size={20} className={`${tenantData.daysLeftText.includes('Overdue') ? 'text-red-500' : 'text-orange-500'} mt-0.5 flex-shrink-0`} />
                <div>
                  <p className="text-sm font-bold text-slate-800">
                    {tenantData.daysLeftText.includes('Overdue') ? 'Payment Overdue!' : 'Rent Due Soon'}
                  </p>
                  <p className="text-xs text-slate-600 mt-1">
                    You have a pending invoice of ₹{(tenantData.rentAmount || 0).toLocaleString('en-IN')}. {tenantData.daysLeftText.includes('Overdue') ? 'Please pay immediately to avoid late fees.' : `It is due in ${tenantData.daysLeftText}.`}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex gap-3 items-start p-4 bg-green-50 rounded-xl border border-green-100">
                <CheckCircle size={20} className="text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-bold text-slate-800">All Clear!</p>
                  <p className="text-xs text-slate-600 mt-1">You have no pending rent or invoices to pay at this time.</p>
                </div>
              </div>
            )}

            {/* Document Notification */}
            {!tenantData.property.includes('Looking') && (
              <div className="flex gap-3 items-start p-4 bg-blue-50 rounded-xl border border-blue-100">
                <FileText size={20} className="text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-bold text-slate-800">Active Lease</p>
                  <p className="text-xs text-slate-600 mt-1">Your digital lease agreement for {tenantData.property} is securely stored in your Documents tab.</p>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default TenantOverview;