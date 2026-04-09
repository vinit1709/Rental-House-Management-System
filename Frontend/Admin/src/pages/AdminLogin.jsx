import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, ArrowRight, Loader2, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/authContext'; // Import your auth context

const AdminLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth(); // Grab the login function from context

  // Track input states
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      // Call your actual backend via the auth context
      const response = await login(formData);
      // console.log(response);
      setLoading(false);
      toast.success("Welcome back, Administrator.");
      navigate('/dashboard');
    } catch (err) {
      // Catch backend errors (e.g., "Invalid credentials" or "Not an admin")
      toast.error(err.response?.data?.message || "Invalid credentials or unauthorized.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-900 font-sans text-white">

      {/* Left Side - Brand */}
      <div className="hidden lg:flex w-1/2 flex-col justify-center items-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-600/10 opacity-50"></div>
        <div className="z-10 text-center">
          <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-[0_0_40px_rgba(37,99,235,0.5)]">
            <ShieldCheck size={40} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">RentalPro Admin</h1>
          <p className="text-slate-400">Platform Control Center</p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white text-slate-900 rounded-l-[3rem] shadow-2xl relative z-20">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-slate-900">Admin Sign In</h2>
            <p className="text-slate-500 mt-2">Secure access for platform managers only.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">

              {/* Email Input */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={loading}
                    placeholder="admin@rentalpro.com"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition disabled:opacity-60"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    disabled={loading}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition disabled:opacity-60"
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold hover:bg-blue-600 transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <><Loader2 size={20} className="animate-spin" /> Authenticating...</>
              ) : (
                <>Access Dashboard <ArrowRight size={20} /></>
              )}
            </button>
          </form>

          <div className="text-center text-xs text-slate-400 mt-8">
            <p>Unauthorized access is prohibited and monitored.</p>
            <p>IP Address logged for security purposes.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;