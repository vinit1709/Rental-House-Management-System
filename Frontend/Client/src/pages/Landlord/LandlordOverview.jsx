import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building, Users, DollarSign, TrendingUp, CheckCircle, AlertTriangle, Wrench, ShieldAlert, Loader2, XCircle, ClipboardClock } from 'lucide-react';
import { StatCard, TableCard } from '../../components/DashboardSharedUI';
import Loading from '../../components/loading/loading';
import { useAuth } from '../../context/authContext';
import AxiosInstance from '../../api/axiosInstance';

const LandlordOverview = () => {
  // 1. Get current user from context
  const { user } = useAuth();
  const navigate = useNavigate();

  // No need for a separate useState for verificationStatus, just read it from the user object!
  const verificationStatus = user?.verificationStatus || 'unverified';

  // 2. Set up State for the data
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState({
    totalProperties: 0,
    totalTenants: 0,
    monthlyRevenue: 0,
    occupancyRate: 0
  });
  const [recentPayments, setRecentPayments] = useState([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState([]);

  // 3. Fetch Data on Component Mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);

        // Parallel API calls for performance using the routes from your backend
        const [propertiesRes, paymentsRes, maintenanceRes] = await Promise.all([
          AxiosInstance.get('/properties/my/listings').catch(() => ({ data: { properties: [] } })),
          AxiosInstance.get('/payments/landlord/received').catch(() => ({ data: { payments: [] } })),
          AxiosInstance.get('/maintenance/landlord/requests').catch(() => ({ data: { requests: [] } }))
        ]);

        // Calculate stats based on actual data
        const properties = propertiesRes.data?.properties || [];
        const payments = paymentsRes.data?.payments || [];
        const maintenance = maintenanceRes.data?.requests || [];

        // Example logic to calculate revenue and occupancy
        const totalRevenue = payments
          .filter(p => p.status === 'success')
          .reduce((sum, p) => sum + p.amountINR, 0);

        const rentedProperties = properties.filter(p => p.status === 'rented').length;
        const occupancy = properties.length > 0 ? Math.round((rentedProperties / properties.length) * 100) : 0;

        setDashboardStats({
          totalProperties: properties.length,
          totalTenants: rentedProperties, // Assuming 1 tenant per rented property for simplicity
          monthlyRevenue: totalRevenue,
          occupancyRate: occupancy
        });

        // Set the table data (grabbing just the latest ones)
        setRecentPayments(payments.slice(0, 5));
        setMaintenanceRequests(maintenance.slice(0, 5));

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

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

      {/* CONDITIONAL VERIFICATION BANNERS */}

      {/* 1. Unverified Banner */}
      {verificationStatus === 'unverified' && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-8 rounded-r-lg flex flex-col sm:flex-row items-start sm:items-center justify-between shadow-sm gap-4">
          <div className="flex gap-3">
            <ShieldAlert className="text-amber-600 mt-0.5 flex-shrink-0" size={20} />
            <div>
              <h4 className="font-bold text-amber-800">Identity Verification Required</h4>
              <p className="text-amber-700 text-sm mt-1">
                To protect our community, you must verify your Government ID before listing properties.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/landlord/settings')}
            className="bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-amber-700 transition shadow-sm whitespace-nowrap"
          >
            Verify Now
          </button>
        </div>
      )}

      {/* 2. Pending Banner */}
      {verificationStatus === 'pending' && (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-8 rounded-r-lg flex flex-col sm:flex-row items-start sm:items-center justify-between shadow-sm gap-4">
          <div className="flex gap-3">
            <ClipboardClock className="text-blue-600 mt-0.5 flex-shrink-0" size={20} />
            <div>
              <h4 className="font-bold text-blue-800">Verification Pending</h4>
              <p className="text-blue-700 text-sm mt-1">
                Your identity document is currently under review. We will notify you once approved.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/landlord/settings')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition shadow-sm whitespace-nowrap"
          >
            View Status
          </button>
        </div>
      )}

      {/* 3. Rejected Banner */}
      {verificationStatus === 'rejected' && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8 rounded-r-lg flex flex-col sm:flex-row items-start sm:items-center justify-between shadow-sm gap-4">
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
            onClick={() => navigate('/landlord/settings')}
            className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-700 transition shadow-sm whitespace-nowrap"
          >
            Fix Issue
          </button>
        </div>
      )}

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={Building} label="Total Properties" value={dashboardStats.totalProperties} color="blue" />
        <StatCard icon={Users} label="Total Tenants" value={dashboardStats.totalTenants} color="purple" />
        <StatCard icon={DollarSign} label="Monthly Revenue" value={`₹${dashboardStats.monthlyRevenue.toLocaleString('en-IN')}`} color="green" />
        <StatCard icon={TrendingUp} label="Occupancy Rate" value={`${dashboardStats.occupancyRate}%`} color="orange" />
      </div>

      {/* DATA TABLES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* RECENT PAYMENTS */}
        <TableCard title="Recent Payments" action={<button onClick={() => navigate('/landlord/finances')} className="text-sm text-blue-600 font-semibold hover:underline">View All</button>}>
          {recentPayments.length > 0 ? (
            recentPayments.map((payment, idx) => (
              <div key={idx} className="p-4 flex justify-between items-center hover:bg-slate-50 transition">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${payment.status === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {payment.status === 'success' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">{payment.tenantName || 'Tenant'}</p>
                    <p className="text-xs text-slate-500">{payment.paymentMonth}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-800">₹{payment.amountINR}</p>
                  <span className={`text-xs font-bold uppercase ${payment.status === 'success' ? 'text-green-600' : 'text-red-600'}`}>{payment.status}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-slate-500 text-sm">No recent payments</div>
          )}
        </TableCard>

        {/* MAINTENANCE ALERTS */}
        <TableCard title="Maintenance Alerts" action={<button onClick={() => navigate('/landlord/maintenance')} className="text-sm text-blue-600 font-semibold hover:underline">View All</button>}>
          {maintenanceRequests.length > 0 ? (
            maintenanceRequests.map((request, idx) => (
              <div key={idx} className="p-4 flex justify-between items-center hover:bg-slate-50 transition">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-full">
                    <Wrench size={16} />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">{request.title}</p>
                    <p className="text-xs text-slate-500">{request.priority} Priority</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${request.status === 'resolved' ? 'bg-green-100 text-green-700' :
                  request.status === 'in-progress' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                  }`}>
                  {request.status}
                </span>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-slate-500 text-sm">No pending maintenance requests</div>
          )}
        </TableCard>

      </div>
    </div>
  );
};

export default LandlordOverview;