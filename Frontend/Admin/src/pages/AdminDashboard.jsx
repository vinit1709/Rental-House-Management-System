import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, Building, IndianRupee, Activity,
  ShieldAlert, Clock, ChevronRight, Loader2,
  TrendingUp, Home, CheckCircle, Wrench
} from 'lucide-react';
import AxiosInstance from '../api/axiosInstance'; // Make sure this path is correct for your folder structure
import { toast } from 'react-hot-toast';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  // Dashboard Data State
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalLandlords: 0,
    totalTenants: 0,
    totalProperties: 0,
    activeLeases: 0,
    platformRevenue: 0,
    pendingVerifications: 0,
    pendingProperties: 0,
    pendingMaintenance: 0
  });

  const [recentActivity, setRecentActivity] = useState([]);

  // --- 1. FETCH DASHBOARD DATA USING NEW OPTIMIZED STATS ROUTES ---
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setIsLoading(true);

        // Fetching strictly from the /stats endpoints for lightning-fast load times!
        const [
          usersRes,
          propertiesRes,
          leasesRes,
          paymentsRes,
          maintenanceRes
        ] = await Promise.all([
          AxiosInstance.get('/auth/admin/stats').catch(() => ({ data: {} })),
          AxiosInstance.get('/properties/admin/stats').catch(() => ({ data: {} })),
          AxiosInstance.get('/leases/admin/stats').catch(() => ({ data: {} })),
          AxiosInstance.get('/payments/admin/stats').catch(() => ({ data: {} })),
          AxiosInstance.get('/maintenance/admin/stats').catch(() => ({ data: {} }))
        ]);

        setStats({
          // Auth Service Stats
          totalUsers: usersRes.data.totalUsers || 0,
          totalLandlords: usersRes.data.totalLandlords || 0,
          totalTenants: usersRes.data.totalTenants || 0,
          pendingVerifications: usersRes.data.pendingVerifications || 0,

          // Property Service Stats
          totalProperties: propertiesRes.data.totalProperties || 0,
          pendingProperties: propertiesRes.data.pendingProperties || 0,

          // Lease Service Stats
          activeLeases: leasesRes.data.activeLeases || 0,

          // Payment & Maintenance Service Stats
          platformRevenue: paymentsRes.data.totalVolumeINR || 0,
          pendingMaintenance: maintenanceRes.data.pending || 0
        });

        setRecentActivity([
          { id: 1, type: 'system', message: 'Optimized Dashboard loaded instantly.', time: 'Just now' }
        ]);

      } catch (err) {
        console.error("Error fetching admin stats:", err);
        toast.error("Failed to load dashboard widgets.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  // --- 2. CALCULATE DEMOGRAPHICS (Tailwind Visual Bars) ---
  const userTotal = stats.totalLandlords + stats.totalTenants;
  const landlordPercent = userTotal > 0 ? (stats.totalLandlords / userTotal) * 100 : 0;
  const tenantPercent = userTotal > 0 ? (stats.totalTenants / userTotal) * 100 : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">

      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">System Overview</h1>
          <p className="text-slate-500 mt-1">Monitor platform health, user growth, and pending administrative tasks.</p>
        </div>
        <div className="text-sm font-bold text-slate-400 flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
          <Activity size={16} className="text-green-500 animate-pulse" /> System Status: <span className="text-green-600">Online</span>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64 bg-white rounded-2xl shadow-sm border border-slate-200">
          <Loader2 className="animate-spin text-blue-600" size={40} />
        </div>
      ) : (
        <>
          {/* --- TOP ROW: KPI CARDS --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

            {/* Total Users */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4 hover:shadow-md transition">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Users size={24} /></div>
              <div>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Total Users</p>
                <h3 className="text-2xl font-extrabold text-slate-900">{stats.totalUsers.toLocaleString()}</h3>
              </div>
            </div>

            {/* Total Properties */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4 hover:shadow-md transition">
              <div className="p-3 bg-purple-50 text-purple-600 rounded-xl"><Building size={24} /></div>
              <div>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Listed Properties</p>
                <h3 className="text-2xl font-extrabold text-slate-900">{stats.totalProperties.toLocaleString()}</h3>
              </div>
            </div>

            {/* Active Leases */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4 hover:shadow-md transition">
              <div className="p-3 bg-green-50 text-green-600 rounded-xl"><CheckCircle size={24} /></div>
              <div>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Active Leases</p>
                <h3 className="text-2xl font-extrabold text-slate-900">{stats.activeLeases.toLocaleString()}</h3>
              </div>
            </div>

            {/* Platform Revenue */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4 hover:shadow-md transition">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><IndianRupee size={24} /></div>
              <div>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Transaction Volume</p>
                <h3 className="text-2xl font-extrabold text-slate-900">₹{stats.platformRevenue.toLocaleString('en-IN')}</h3>
              </div>
            </div>

          </div>

          {/* --- MIDDLE ROW: ALERTS & DEMOGRAPHICS --- */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* ACTION CENTER: Pending Tasks */}
            <div className="bg-slate-900 rounded-2xl shadow-lg border border-slate-800 p-6 md:p-8 flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -mr-16 -mt-16"></div>

              <h3 className="text-xl font-bold text-white mb-6 relative z-10 flex items-center gap-2">
                <ShieldAlert className="text-amber-400" size={24} /> Action Center
              </h3>

              <div className="space-y-4 relative z-10 flex-1">
                {/* Verifications Alert */}
                <button
                  onClick={() => navigate('/verifications')}
                  className="w-full bg-slate-800/80 hover:bg-slate-700 border border-slate-700 p-4 rounded-xl flex items-center justify-between transition group"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg ${stats.pendingVerifications > 0 ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-700 text-slate-400'}`}>
                      {stats.pendingVerifications}
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-white">ID Verifications Pending</p>
                      <p className="text-xs text-slate-400 mt-0.5">Users awaiting approval to use the platform.</p>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-slate-500 group-hover:text-amber-400 transition" />
                </button>

                {/* Properties Alert */}
                <button
                  onClick={() => navigate('/properties')}
                  className="w-full bg-slate-800/80 hover:bg-slate-700 border border-slate-700 p-4 rounded-xl flex items-center justify-between transition group"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg ${stats.pendingProperties > 0 ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-700 text-slate-400'}`}>
                      {stats.pendingProperties}
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-white">Property Drafts Pending</p>
                      <p className="text-xs text-slate-400 mt-0.5">Listings awaiting admin review to go live.</p>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-slate-500 group-hover:text-blue-400 transition" />
                </button>

                {/* Maintenance Alert */}
                <button
                  onClick={() => navigate('/reports')} // Route to wherever admin handles maintenance
                  className="w-full bg-slate-800/80 hover:bg-slate-700 border border-slate-700 p-4 rounded-xl flex items-center justify-between transition group"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg ${stats.pendingMaintenance > 0 ? 'bg-orange-500/20 text-orange-400' : 'bg-slate-700 text-slate-400'}`}>
                      {stats.pendingMaintenance}
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-white">Maintenance Tickets Pending</p>
                      <p className="text-xs text-slate-400 mt-0.5">Active issues requiring landlord attention.</p>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-slate-500 group-hover:text-orange-400 transition" />
                </button>
              </div>
            </div>

            {/* DEMOGRAPHICS: Tailwind Native Bar Chart */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 flex flex-col">
              <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <TrendingUp className="text-blue-600" size={24} /> Platform Demographics
              </h3>

              <div className="flex-1 flex flex-col justify-center space-y-8">
                {/* Landlords Bar */}
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <span className="font-bold text-slate-700 flex items-center gap-2"><Building size={16} className="text-purple-600" /> Landlords</span>
                    <span className="font-extrabold text-slate-900">{stats.totalLandlords.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden">
                    <div className="bg-purple-500 h-4 rounded-full transition-all duration-1000" style={{ width: `${landlordPercent}%` }}></div>
                  </div>
                </div>

                {/* Tenants Bar */}
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <span className="font-bold text-slate-700 flex items-center gap-2"><Users size={16} className="text-blue-600" /> Tenants</span>
                    <span className="font-extrabold text-slate-900">{stats.totalTenants.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden">
                    <div className="bg-blue-500 h-4 rounded-full transition-all duration-1000" style={{ width: `${tenantPercent}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* --- BOTTOM ROW: RECENT ACTIVITY --- */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                <Clock className="text-blue-600" size={20} /> Recent Platform Activity
              </h3>
            </div>

            <div className="divide-y divide-slate-100">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity, idx) => (
                  <div key={idx} className="p-5 flex items-start sm:items-center justify-between gap-4 hover:bg-slate-50 transition">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg flex-shrink-0 ${activity.type.includes('user') ? 'bg-blue-100 text-blue-600' :
                        activity.type.includes('property') ? 'bg-purple-100 text-purple-600' :
                          activity.type.includes('payment') ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-600'
                        }`}>
                        {activity.type.includes('property') ? <Home size={18} /> :
                          activity.type.includes('payment') ? <IndianRupee size={18} /> : <Activity size={18} />}
                      </div>
                      <p className="text-sm font-semibold text-slate-800 leading-snug">{activity.message}</p>
                    </div>
                    <span className="text-xs font-bold text-slate-400 whitespace-nowrap flex-shrink-0">{activity.time}</span>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-slate-500 text-sm">No recent activity found.</div>
              )}
            </div>
          </div>

        </>
      )}
    </div>
  );
};

export default AdminDashboard;