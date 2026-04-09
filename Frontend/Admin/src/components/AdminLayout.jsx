import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import {
  ShieldCheck, Users, Building, Activity,
  Settings, LogOut, Home,
  FileText, Menu, X,
  ChevronRight,
  PieChart
} from 'lucide-react';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Mobile menu state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // --- ADMIN SPECIFIC SIDEBAR MENU ---
  const adminMenu = [
    { id: "/dashboard", label: "System Overview", icon: Activity },
    { id: "/verifications", label: "User Verifications", icon: ShieldCheck },
    { id: "/properties", label: "Property Approvals", icon: Building },
    { id: "/users", label: "Manage Users", icon: Users },
    { id: "/reports", label: "Platform Reports", icon: PieChart },
    { id: "/leases", label: "Manage Leases", icon: FileText }, // Fixed icon!
    { id: "/settings", label: "Admin Settings", icon: Settings },
  ];

  // Navigation handler that also closes mobile menu
  const handleNavigation = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">

      {/* --- MOBILE HEADER & OVERLAY --- */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-slate-900 text-white flex items-center justify-between px-4 z-50 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Home size={18} className="text-white" />
          </div>
          <h2 className="text-lg font-extrabold tracking-tight">RentalPro</h2>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 bg-slate-800 rounded-lg text-slate-300">
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Menu Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      {/* --- ADMIN SIDEBAR --- */}
      <aside className={`
                fixed lg:sticky top-0 left-0 h-screen w-72 bg-[#0f172a] border-r border-slate-800 
                flex flex-col z-50 transition-transform duration-300 ease-in-out shadow-2xl
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>

        {/* Admin Branding */}
        <div className="p-6 border-b border-slate-800/60 hidden lg:block">
          <div className="flex items-center gap-3 text-white">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
              <Home size={22} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold tracking-tight">RentalPro</h2>
              <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mt-0.5">Admin Portal</p>
            </div>
          </div>
        </div>

        {/* User Profile Area */}
        <div className="p-5 border-b border-slate-800/60 mt-16 lg:mt-0">
          <div className="flex items-center gap-3 p-3 bg-slate-800/40 rounded-xl border border-slate-700/50 hover:bg-slate-800/60 transition cursor-default">
            <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold shadow-inner">
              {user?.name ? user.name.charAt(0).toUpperCase() : "A"}
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-sm font-bold text-white truncate">{user?.name || "Super Admin"}</p>
              <p className="text-xs font-semibold text-slate-400 truncate capitalize">{user?.role || 'System Admin'}</p>
            </div>
          </div>
        </div>

        {/* Dynamic Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto custom-scrollbar">
          {adminMenu.map((item) => {
            const isActive = location.pathname.includes(item.id);
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 group relative overflow-hidden ${isActive
                  ? "bg-blue-600 text-white shadow-md shadow-blue-900/20"
                  : "text-slate-400 hover:bg-slate-800/80 hover:text-slate-200"
                  }`}
              >
                {/* 1. Subtle active left-border accent */}
                {isActive && <div className="absolute left-0 top-0 bottom-0 w-2 bg-white"></div>}

                {/* 2. Menu Icon */}
                <Icon size={20} className={isActive ? "text-white" : "text-slate-500 group-hover:text-slate-300 transition-colors"} />

                {/* 3. Menu Label (flex-1 pushes the chevron to the far right) */}
                <span className="flex-1 text-left">{item.label}</span>

                {/* 4. The right-aligned Chevron for the active item */}
                {isActive && <ChevronRight size={18} className="opacity-70" />}
              </button>
            )
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-slate-800/60 mt-auto">
          <button
            onClick={logout}
            className="w-full text-sm font-bold text-slate-400 hover:text-red-400 flex items-center gap-3 p-3 hover:bg-slate-800/80 rounded-xl transition-all duration-200 group"
          >
            <div className="p-1.5 rounded-lg bg-slate-800 group-hover:bg-red-500/10 transition-colors">
              <LogOut size={16} className="group-hover:text-red-400" />
            </div>
            Secure Logout
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden pt-16 lg:pt-0 relative">
        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50">
          <Outlet />
        </div>
      </main>

    </div>
  );
};

export default AdminLayout;