import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">

      {/* Subtle background blur for depth */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-400/5 rounded-full blur-3xl"></div>

      <div className="bg-white max-w-md w-full p-8 md:p-10 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 text-center relative z-10 animate-in zoom-in-95 duration-500">

        {/* Floating Security Icon */}
        <div className="relative mx-auto w-24 h-24 mb-6">
          {/* Pulsing ring behind the icon */}
          <div className="absolute inset-0 bg-red-100 rounded-full animate-ping opacity-60"></div>
          <div className="relative w-full h-full bg-red-50 border border-red-100 rounded-full flex items-center justify-center shadow-inner">
            <ShieldAlert size={40} className="text-red-500" />
          </div>
        </div>

        {/* Text Content */}
        <h1 className="text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">
          Access Denied
        </h1>
        <p className="text-slate-500 mb-8 leading-relaxed">
          You don't have the necessary permissions to view this page. Please log in with the correct account or contact the platform administrator.
        </p>

        {/* Escape Hatch Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate(-1)} // Navigates to the exact previous page they were on
            className="flex flex-1 items-center justify-center gap-2 px-6 py-3 bg-white text-slate-700 border border-slate-200 font-bold rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm"
          >
            <ArrowLeft size={18} /> Go Back
          </button>
          <button
            onClick={() => navigate('/')} // Redirects to the root/dashboard
            className="flex flex-1 items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors shadow-md shadow-blue-600/20"
          >
            <Home size={18} /> Home
          </button>
        </div>

        {/* Subtle Technical Error Code */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          <p className="text-[10px] font-mono text-slate-400 font-bold tracking-widest uppercase">
            Error 403: Unauthorized Request
          </p>
        </div>

      </div>
    </div>
  );
};

export default Unauthorized;