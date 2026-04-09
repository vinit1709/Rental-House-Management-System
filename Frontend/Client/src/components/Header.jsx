import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Home, Menu, X, LayoutDashboard, LogOut, User } from 'lucide-react';
import { useAuth } from '../context/authContext';
import Loading from './loading/loading';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, user, logout, isLoading } = useAuth();

  // --- YOUR LOGIC (UNCHANGED) ---
  const dashboardPath =
    user?.role === "tenant"
      ? "/tenant/dashboard"
      : user?.role === "landlord"
        ? "/landlord/dashboard"
        : null;

  // --- LOADING STATE (Styled to match theme) ---
  if (isLoading) {
    return (
      <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-slate-200 h-[72px] flex items-center justify-center">
        <Loading className='h-8' />
      </header>
    );
  }

  return (
    // Changed: Removed gradients, used White + Slate border for professional look
    <header className="bg-white/90 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200 transition-all duration-300 font-sans print:hidden">
      <nav className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">

        {/* --- LOGO SECTION --- */}
        <Link to="/" className="flex items-center gap-2 group">
          {/* Changed: Solid Blue Box instead of gradient */}
          <div className="bg-blue-600 p-2 rounded-lg group-hover:bg-blue-700 transition duration-300 shadow-sm">
            <Home className="text-white" size={22} />
          </div>
          <div className="flex flex-col">
            {/* Changed: Solid Slate Text */}
            <span className="text-xl font-bold text-slate-900 tracking-tight group-hover:text-blue-600 transition">
              RentalPro
            </span>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider hidden sm:block">
              Management System
            </span>
          </div>
        </Link>

        {/* --- DESKTOP NAVIGATION --- */}
        <div className="hidden md:flex items-center gap-8">
          <NavLink to="/" text="Home" />
          <NavLink to="/explore" text="Properties" />
          <NavLink to="/about" text="About" />
          <NavLink to="/contact" text="Contact" />
        </div>

        {/* --- AUTH SECTION (LOGIC PRESERVED) --- */}
        <div className="flex items-center gap-4">
          {isAuthenticated && dashboardPath ? (
            <>
              {/* Dashboard Button (Desktop) */}
              <Link
                to={dashboardPath}
                className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 transition shadow-sm hover:shadow-md"
              >
                <LayoutDashboard size={18} />
                <span>Dashboard</span>
              </Link>

              {/* Logout Button (Desktop) */}
              <button
                onClick={logout}
                disabled={isLoading}
                className="hidden sm:flex items-center gap-2 px-3 py-2 text-slate-500 font-medium hover:text-red-600 transition"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <>
              {/* Login Link */}
              <Link
                to="/login"
                className="hidden sm:block px-4 py-2 text-slate-600 font-semibold hover:text-blue-600 transition"
              >
                Log In
              </Link>

              {/* Get Started Button */}
              <Link
                to="/register"
                className="hidden sm:block px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition shadow-md shadow-blue-200 hover:-translate-y-0.5"
              >
                Get Started
              </Link>
            </>
          )}

          {/* --- MOBILE MENU BUTTON --- */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* --- MOBILE MENU DROPDOWN --- */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 shadow-xl absolute w-full left-0 animate-in slide-in-from-top-2 fade-in duration-200">
          <div className="flex flex-col p-4 space-y-3">
            <MobileNavLink to="/" text="Home" onClick={() => setMobileMenuOpen(false)} />
            <MobileNavLink to="/about" text="About" onClick={() => setMobileMenuOpen(false)} />
            <MobileNavLink to="/contact" text="Contact" onClick={() => setMobileMenuOpen(false)} />

            <hr className="border-slate-100 my-2" />

            {isAuthenticated && dashboardPath ? (
              <>
                <div className="px-2 py-2">
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-2">Signed in as {user?.role}</p>
                  <Link
                    to={dashboardPath}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 transition shadow-lg"
                  >
                    <LayoutDashboard size={18} /> Go to Dashboard
                  </Link>
                </div>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center justify-center gap-2 px-4 py-3 text-red-600 font-semibold hover:bg-red-50 rounded-lg transition w-full"
                >
                  <LogOut size={18} /> Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3 text-center text-slate-700 font-semibold border border-slate-200 rounded-lg hover:bg-slate-50"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3 text-center bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 shadow-md"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

// --- Helper Components to keep the main component clean ---

const NavLink = ({ to, text }) => (
  <Link
    to={to}
    className="text-slate-600 font-medium hover:text-blue-600 transition duration-200 text-sm hover:underline hover:underline-offset-4 decoration-2 decoration-blue-200"
  >
    {text}
  </Link>
);

const MobileNavLink = ({ to, text, onClick }) => (
  <Link
    to={to}
    onClick={onClick}
    className="block px-4 py-2 text-slate-700 font-medium hover:bg-slate-50 hover:text-blue-600 rounded-lg transition"
  >
    {text}
  </Link>
);

export default Header;