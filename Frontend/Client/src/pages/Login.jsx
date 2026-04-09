import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/authContext';
import { toast } from 'react-hot-toast';
import Loading from '../components/loading/loading';

const Login = () => {
  const navigate = useNavigate();
  const { login, setIsLoading } = useAuth(); // Logic Preserved
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isLoadings, setIsLoadings] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // --- LOGIC (UNCHANGED) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setIsLoading(true); // Set global loading for auth context
      setIsLoadings(true);
      setError('');
      const response = await login(formData);
      console.log(response);

      setIsLoadings(false);
      setIsLoading(false);
      toast.success(response.data.message || 'Login successful...');
      navigate('/');
    } catch (error) {
      console.log(error);

      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Login failed";

      toast.error(message || "Login failed"); setError(message || 'Login failed. Please try again.');

      setIsLoadings(false);
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    window.location.href = `${import.meta.env.VITE_BACKEND_API}/auth/google`;
  };

  return (
    <div className="min-h-screen bg-white flex font-sans">

      {/* 1. LEFT SIDE - LOGIN FORM */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 md:px-16 py-12">
        <div className="max-w-md mx-auto w-full">

          {/* Logo / Brand */}
          <div className="mb-10">
            <Link to="/" className="inline-flex items-center gap-2 mb-6 group">
              <div className="bg-blue-600 p-2 rounded-lg group-hover:bg-blue-700 transition">
                {/* Simple Home Icon SVG or Lucide */}
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
              </div>
              <span className="text-xl font-bold text-slate-900 tracking-tight">RentalPro</span>
            </Link>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome back</h1>
            <p className="text-slate-500">Please enter your details to sign in.</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-slate-700 font-semibold mb-2 text-sm">Email Address</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter your email"
                  className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-200 placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-slate-700 font-semibold mb-2 text-sm">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-200 placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center text-slate-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="mr-2 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                Remember me
              </label>
              <Link to="/forgot-password" className="text-blue-600 hover:text-blue-700 font-semibold transition">
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoadings}
              className="w-full bg-slate-900 text-white font-bold py-3 px-4 rounded-lg hover:bg-slate-800 transition transform active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {isLoadings ? <Loading className='h-5' /> : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div className="my-8 flex items-center gap-4">
            <div className="h-px bg-slate-200 flex-1"></div>
            <span className="text-slate-400 text-xs font-bold uppercase">Or continue with</span>
            <div className="h-px bg-slate-200 flex-1"></div>
          </div>

          {/* Google Sign In */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center bg-white border border-slate-200 text-slate-700 font-semibold py-3 px-4 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition duration-200 gap-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Sign in with Google
          </button>

          {/* Sign Up Link */}
          <div className="text-center mt-8">
            <p className="text-slate-600">
              Don't have an account?{' '}
              <Link to="/register" className="text-blue-600 font-bold hover:text-blue-700 transition">
                Create free account
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* 2. RIGHT SIDE - FEATURE SHOWCASE (Dark Mode) */}
      <div className="hidden lg:flex w-1/2 bg-slate-950 relative overflow-hidden items-center justify-center p-12">

        {/* Abstract Background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#1e40af_0%,transparent_40%)] opacity-20"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,#0f172a_0%,transparent_40%)] opacity-80"></div>

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20 pointer-events-none"></div>

        <div className="relative z-10 max-w-lg">
          <div className="mb-8 inline-block px-3 py-1 rounded-full bg-blue-900/30 border border-blue-800 text-blue-400 text-xs font-bold tracking-widest uppercase">
            New Feature
          </div>
          <h2 className="text-4xl font-bold text-white mb-6 leading-tight">
            Automate your property management.
          </h2>
          <p className="text-slate-400 text-lg mb-10 leading-relaxed">
            Join thousands of landlords who use RentalPro to track rent, manage maintenance, and find great tenants.
          </p>

          {/* Feature List */}
          <ul className="space-y-4">
            <FeatureItem text="Automated Rent Collection & Reminders" />
            <FeatureItem text="Tenant Screening & Background Checks" />
            <FeatureItem text="Maintenance Request Tracking" />
          </ul>

          {/* Testimonial Card */}
          <div className="mt-12 p-6 bg-slate-900/50 border border-slate-800 rounded-xl backdrop-blur-sm">
            <div className="flex gap-1 mb-3">
              {[1, 2, 3, 4, 5].map(i => <span key={i} className="text-yellow-500">★</span>)}
            </div>
            <p className="text-slate-300 italic mb-4">"This platform saved me 10 hours a week on paperwork alone. Highly recommended!"</p>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center font-bold text-white text-xs">JD</div>
              <div>
                <p className="text-white text-sm font-bold">John Doe</p>
                <p className="text-slate-500 text-xs">Property Manager</p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

// --- HELPER COMPONENT ---
const FeatureItem = ({ text }) => (
  <li className="flex items-center gap-3 text-slate-300">
    <div className="w-6 h-6 rounded-full bg-blue-900/50 flex items-center justify-center text-blue-400 flex-shrink-0">
      <CheckCircle2 size={14} />
    </div>
    {text}
  </li>
);

export default Login;