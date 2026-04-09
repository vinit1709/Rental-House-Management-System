import React from 'react';
import { ChevronRight } from 'lucide-react';

// --- 1. STAT CARD (Used in Overview) ---
export const StatCard = ({ icon: Icon, label, value, subtext, color = "blue" }) => {
  const colorMap = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    orange: "bg-orange-50 text-orange-600",
    red: "bg-red-50 text-red-600",
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-lg ${colorMap[color] || colorMap.blue}`}>
          <Icon size={24} />
        </div>
        {subtext && <span className="text-xs font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded-full">{subtext}</span>}
      </div>
      <div>
        <p className="text-slate-500 text-sm font-medium">{label}</p>
        <h3 className="text-2xl font-bold text-slate-900 mt-1">{value}</h3>
      </div>
    </div>
  );
};

// --- 2. SECTION HEADER (Title + Button) ---
export const DashboardHeader = ({ title, subtitle, action }) => (
  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
    <div>
      <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
      {subtitle && <p className="text-slate-500 mt-1">{subtitle}</p>}
    </div>
    {action}
  </div>
);

// --- 3. DATA TABLE CARD (Used for Lists) ---
export const TableCard = ({ title, children, action }) => (
  <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
    <div className="p-6 border-b border-slate-100 flex justify-between items-center">
      <h3 className="font-bold text-slate-800 text-lg">{title}</h3>
      {action}
    </div>
    <div className="divide-y divide-slate-100">
      {children}
    </div>
  </div>
);

// --- 4. SIDEBAR NAVIGATION ITEM ---
export const NavItem = ({ item, isActive, onClick }) => {
  const Icon = item.icon;
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 group ${
        isActive
          ? "bg-slate-900 text-white shadow-md"
          : "text-slate-500 hover:bg-white hover:text-blue-600"
      }`}
    >
      <Icon size={20} className={isActive ? "text-blue-400" : "text-slate-400 group-hover:text-blue-600"} />
      {item.label}
      {isActive && <ChevronRight size={16} className="ml-auto opacity-50" />}
    </button>
  );
};
