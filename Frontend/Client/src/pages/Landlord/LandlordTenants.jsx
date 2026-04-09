import React, { useState, useEffect } from 'react';
import {
  Search, MessageSquare, FileText, CheckCircle,
  UserX, Loader2, Phone, Mail, Eye, X, Home, Calendar, IndianRupee
} from 'lucide-react';
import { DashboardHeader } from '../../components/DashboardSharedUI';
import AxiosInstance from '../../api/axiosInstance';
import { useNavigate } from 'react-router-dom';

const LandlordTenants = () => {
  const navigate = useNavigate();
  const [tenants, setTenants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [selectedTenantLease, setSelectedTenantLease] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // --- 1. FETCH TENANT DATA ---
  useEffect(() => {
    const fetchTenants = async () => {
      try {
        setIsLoading(true);
        // Fetch all leases, then we will filter for the active ones
        const response = await AxiosInstance.get('/leases');

        // Only show tenants who have an ACTIVE lease
        const activeLeases = (response.data.leases || []).filter(lease => lease.status === 'active');
        setTenants(activeLeases);
      } catch (err) {
        console.error("Error fetching tenants:", err);
        setError("Failed to load tenant data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTenants();
  }, []);

  // --- 2. FILTERING LOGIC ---
  const filteredTenants = tenants.filter(lease => {
    const searchString = searchTerm.toLowerCase();
    const tenantName = (lease.tenantId?.name || '').toLowerCase();
    const propertyName = (lease.propertyId?.title || '').toLowerCase();

    return tenantName.includes(searchString) || propertyName.includes(searchString);
  });

  // --- 3. MODAL HANDLER ---
  const openTenantDetails = (lease) => {
    setSelectedTenantLease(lease);
    setShowModal(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 relative">

      {/* HEADER */}
      <DashboardHeader
        title="My Tenants"
        subtitle="Manage your active leases, view tenant profiles, and communicate."
      />

      {/* ERROR STATE */}
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-2 border border-red-100 mb-6">
          <UserX size={20} /> {error}
        </div>
      )}

      {/* SEARCH AND FILTER BAR */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full sm:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search by tenant name or property..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none transition bg-slate-50 focus:bg-white"
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <span className="bg-blue-50 text-blue-700 px-4 py-2.5 rounded-lg font-bold text-sm border border-blue-100 whitespace-nowrap flex items-center gap-2">
            <CheckCircle size={16} />
            {tenants.length} Active {tenants.length === 1 ? 'Tenant' : 'Tenants'}
          </span>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin text-blue-600" size={40} />
        </div>
      ) : tenants.length === 0 && !error ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
            <UserX size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">No Active Tenants</h3>
          <p className="text-slate-500 max-w-md mx-auto">
            You currently do not have any active tenants. Once an applicant signs a lease, they will appear here.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                  <th className="p-4 font-bold">Tenant Info</th>
                  <th className="p-4 font-bold hidden md:table-cell">Property</th>
                  <th className="p-4 font-bold">Lease Details</th>
                  <th className="p-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTenants.length > 0 ? (
                  filteredTenants.map((lease) => (
                    <tr key={lease._id} className="hover:bg-slate-50 transition group">

                      {/* Tenant Info */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 text-blue-600 font-bold rounded-full flex items-center justify-center flex-shrink-0">
                            {lease.tenantId?.name?.charAt(0).toUpperCase() || 'T'}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{lease.tenantId?.name || 'Unknown Tenant'}</p>
                            <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                              <span>{lease.tenantId?.email || 'No email provided'}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Property Info */}
                      <td className="p-4 hidden md:table-cell">
                        <p className="font-semibold text-slate-800 line-clamp-1">{lease.propertyId?.title || 'Unknown Property'}</p>
                        <p className="text-xs text-slate-500 line-clamp-1">{lease.propertyId?.address?.city || ''}</p>
                      </td>

                      {/* Lease Details */}
                      <td className="p-4">
                        <p className="font-bold text-slate-900">₹{lease.monthlyRent?.toLocaleString('en-IN') || 0} <span className="text-xs text-slate-500 font-normal">/mo</span></p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Ends: {lease.endDate ? new Date(lease.endDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : 'N/A'}
                        </p>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            title="View Full Profile"
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            onClick={() => openTenantDetails(lease)}
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            title="View Lease Document"
                            className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                            onClick={() => navigate(`/landlord/leases/${lease._id}`)}
                          >
                            <FileText size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="p-8 text-center text-slate-500">
                      No tenants match your search "{searchTerm}".
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- TENANT DETAILS MODAL --- */}
      {showModal && selectedTenantLease && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">

            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <UserX size={20} className="text-blue-600 hidden" /> {/* Just for spacing alignment */}
                Tenant Profile
              </h3>
              <button onClick={() => setShowModal(false)} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-full transition">
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">

              {/* Personal Info */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 text-2xl font-black rounded-full flex items-center justify-center">
                  {selectedTenantLease.tenantId?.name?.charAt(0).toUpperCase() || 'T'}
                </div>
                <div>
                  <h4 className="text-2xl font-extrabold text-slate-900">{selectedTenantLease.tenantId?.name || 'Unknown Tenant'}</h4>
                  <div className="flex flex-col gap-1 mt-2">
                    <p className="text-sm font-medium text-slate-600 flex items-center gap-2">
                      <Mail size={14} className="text-slate-400" /> {selectedTenantLease.tenantId?.email || 'N/A'}
                    </p>
                    <p className="text-sm font-medium text-slate-600 flex items-center gap-2">
                      <Phone size={14} className="text-slate-400" /> {selectedTenantLease.tenantId?.phone || 'No phone provided'}
                    </p>
                  </div>
                </div>
              </div>

              <hr className="border-slate-100" />

              {/* Property & Lease Details */}
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Renting Property</p>
                  <p className="font-bold text-slate-800 flex items-center gap-2">
                    <Home size={16} className="text-slate-400" /> {selectedTenantLease.propertyId?.title || 'Unknown Property'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase mb-1 flex items-center gap-1"><Calendar size={12} /> Lease Start</p>
                    <p className="font-bold text-slate-900">{selectedTenantLease.startDate ? new Date(selectedTenantLease.startDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase mb-1 flex items-center gap-1"><Calendar size={12} /> Lease End</p>
                    <p className="font-bold text-slate-900">{selectedTenantLease.endDate ? new Date(selectedTenantLease.endDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase mb-1 flex items-center gap-1"><IndianRupee size={12} /> Monthly Rent</p>
                    <p className="font-bold text-green-600">₹{selectedTenantLease.monthlyRent?.toLocaleString('en-IN')}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase mb-1 flex items-center gap-1"><IndianRupee size={12} /> Security Deposit</p>
                    <p className="font-bold text-slate-900">₹{selectedTenantLease.securityDeposit?.toLocaleString('en-IN')}</p>
                  </div>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-slate-200 bg-slate-50 flex gap-3">
              <button
                onClick={() => navigate(`/landlord/leases/${selectedTenantLease._id}`)}
                className="flex-1 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-100 transition flex items-center justify-center gap-2"
              >
                <FileText size={18} /> View Contract
              </button>
              <button
                onClick={() => alert('Messaging feature coming soon!')}
                className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-md flex items-center justify-center gap-2"
              >
                <MessageSquare size={18} /> Send Message
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default LandlordTenants;