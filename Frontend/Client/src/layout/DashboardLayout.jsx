import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import { NavItem } from '../components/DashboardSharedUI'; // Import your shared button
import {
  Home, DollarSign, MessageSquare, FileText, Settings,
  Wrench, Building, Users, BarChart3, LogOut,
  Calendar,
  IndianRupee,
  ClipboardList
} from 'lucide-react';

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // 1. Define menus based on what you had in your separate files
  const tenantMenu = [
    // 1. The Daily Glance
    { id: "/tenant/dashboard", label: "Overview", icon: Home },

    // 2. Finding a Home (Pre-Lease)
    { id: "/tenant/visits", label: "Visits", icon: Calendar },
    { id: "/tenant/applications", label: "Applications", icon: ClipboardList },

    // 3. Living There (Active Lease)
    { id: "/tenant/documents", label: "Documents", icon: FileText },
    { id: "/tenant/payments", label: "Payments", icon: IndianRupee },
    { id: "/tenant/maintenance", label: "Maintenance", icon: Wrench },
    { id: "/tenant/messages", label: "Messages", icon: MessageSquare },

    // 4. System
    { id: "/tenant/settings", label: "Settings", icon: Settings },
  ];

  const landlordMenu = [
    // 1. Core
    { id: "/landlord/dashboard", label: "Overview", icon: Home },

    // 2. Acquisition 
    { id: "/landlord/properties", label: "Properties", icon: Building },
    { id: "/landlord/visits", label: "Visits", icon: Calendar },
    { id: "/landlord/applications", label: "Applications", icon: ClipboardList },

    // 3. Management
    { id: "/landlord/tenants", label: "Tenants", icon: Users },
    { id: "/landlord/leases", label: "Leases", icon: FileText },
    { id: "/landlord/maintenance", label: "Maintenance", icon: Wrench },

    // 4. Financials
    { id: "/landlord/finances", label: "Finances", icon: IndianRupee },
    { id: "/landlord/reports", label: "Reports", icon: BarChart3 },

    // 5. System
    { id: "/landlord/settings", label: "Settings", icon: Settings },
  ];

  // 2. Dynamically pick the menu
  const menuItems = user?.role === "landlord" ? landlordMenu : tenantMenu;

  // Create a fallback avatar
  const avatarLetter = user?.name ? user.name.charAt(0).toUpperCase() : "U";

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-slate-50">

      {/* --- UNIFIED SIDEBAR --- */}
      <aside className="lg:w-64 bg-white border-r border-slate-200 hidden lg:flex flex-col sticky top-20 h-[calc(100vh-80px)] overflow-y-auto">

        {/* User Profile Area */}
        <div className="p-4 border-t border-slate-200 mt-auto">
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="w-9 h-9 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">
              {avatarLetter}
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-sm font-bold text-slate-900 truncate">{user?.name || "User"}</p>
              <p className="text-xs font-bold text-slate-500 truncate capitalize">{user?.role}</p>
            </div>
          </div>
        </div>

        {/* Dynamic Navigation */}
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {menuItems.map((item) => (
            <NavItem
              key={item.id}
              item={item}
              isActive={location.pathname === item.id}
              onClick={() => navigate(item.id)} // This now changes the URL!
            />
          ))}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-slate-200 mt-auto">
          <button
            onClick={logout}
            className="w-full text-sm font-bold text-slate-500 hover:text-red-700 flex items-center gap-2 p-2 hover:bg-red-50 rounded-lg transition"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto h-full">
        {/* React Router will inject TenantOverview, LandlordProperties, etc., right here */}
        <Outlet />
      </main>

    </div>
  );
};

export default DashboardLayout;