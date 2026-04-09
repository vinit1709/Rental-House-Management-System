import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Home,
  Mail,
  Lock,
  User,
  Check,
  Eye,
  EyeOff,
  AlertCircle,
  ShieldCheck,
  Headphones,
  KeyRound
} from "lucide-react";
import { toast } from 'react-hot-toast';
import Loading from '../components/loading/loading';
import AxiosInstance from "../api/axiosInstance";
import { useAuth } from '../context/authContext';

const Register = () => {
  const navigate = useNavigate();
  const { fetchUserProfile } = useAuth();

  // --- WIZARD STATE ---
  const [step, setStep] = useState(1); // 1: Register Form, 2: OTP Verification

  // --- FORM STATE ---
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "tenant",
  });
  const [otp, setOtp] = useState("");

  // --- UI STATE ---
  const [error, setError] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const [passwordRequirements, setPasswordRequirements] = useState({
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });

  // --- TIMER LOGIC FOR RESEND OTP ---
  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  // --- VALIDATION HELPERS ---
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isStrongPassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$!%*?&])[A-Za-z\d@$!%*?&]+$/;
    return passwordRegex.test(password);
  };

  const checkPasswordRequirements = (password) => {
    setPasswordRequirements({
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[@#$!%*?&]/.test(password),
    });
  };

  // --- STEP 1: REGISTER USER & SEND OTP ---
  const handleRegister = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.password) {
      return setError("Please fill in all fields");
    }
    if (!isValidEmail(formData.email)) {
      return setError("Please enter a valid email address");
    }
    if (!isStrongPassword(formData.password) || formData.password.length < 6) {
      return setError("Please enter a strong password (min 6 characters).");
    }
    if (!agreedToTerms) {
      return setError("Please agree to the terms and conditions");
    }

    try {
      setIsLoading(true);
      setError("");

      // Calls your auth.controller.js -> register function
      const response = await AxiosInstance.post('/auth/register', formData);

      if (response.status === 201) {
        toast.success("Account created! Please verify your email.");
        setStep(2); // Move to OTP step
        setResendTimer(60); // Start 60s cooldown
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed!!");
      setError(err.response?.data?.message || "Registration failed!!");
    } finally {
      setIsLoading(false);
    }
  };

  // --- STEP 2: VERIFY EMAIL WITH OTP ---
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) return setError("Please enter a valid 6-digit OTP.");

    try {
      setIsLoading(true);
      setError("");

      // Calls your auth.controller.js -> verifyEmail function
      await AxiosInstance.post('/auth/verify-email', {
        email: formData.email,
        otp: otp
      });

      toast.success("Email verified successfully! Welcome to RentalPro.");

      // Fetch user profile to update AuthContext, then redirect
      await fetchUserProfile();
      navigate("/");

    } catch (err) {
      toast.error(err.response?.data?.message || "Verification failed!!");
      setError(err.response?.data?.message || "Invalid or expired OTP.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- OPTIONAL: RESEND VERIFICATION OTP ---
  // Note: Make sure you have a route like POST /auth/resend-verification in your backend!
  const handleResendOTP = async () => {
    try {
      setIsLoading(true);
      await AxiosInstance.post('/auth/resend-verification', { email: formData.email });
      toast.success("A new verification code has been sent!");
      setResendTimer(60);
    } catch (err) {
      toast.error("Failed to resend code.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = () => {
    window.location.href = `${import.meta.env.VITE_BACKEND_API}/auth/google`;
  };

  const benefits = [
    {
      icon: KeyRound,
      title: "One Account",
      description: "Manage rentals or find homes with a single login.",
    },
    {
      icon: ShieldCheck,
      title: "Bank-Grade Security",
      description: "Your documents and data are encrypted 24/7.",
    },
    {
      icon: Headphones,
      title: "Priority Support",
      description: "Get help within minutes, not days.",
    },
  ];

  return (
    <div className="min-h-screen bg-white flex font-sans">

      {/* 1. LEFT SIDE - DARK FEATURE PANEL */}
      <div className="hidden lg:flex w-1/2 bg-slate-950 relative overflow-hidden flex-col justify-center px-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#1e40af_0%,transparent_50%)] opacity-20"></div>
        <div className="absolute top-0 right-0 w-full h-full bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20 pointer-events-none"></div>

        <div className="relative z-10 max-w-lg">
          <Link to="/" className="inline-flex items-center gap-2 mb-12 group">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Home className="text-white" size={24} />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">RentalPro</span>
          </Link>

          <h2 className="text-4xl font-bold text-white mb-6 leading-tight">
            Join the future of <br />
            <span className="text-blue-500">property management.</span>
          </h2>
          <p className="text-slate-400 text-lg mb-12">
            Create an account today to streamline your rental journey. No credit card required for tenants.
          </p>

          <div className="space-y-6">
            {benefits.map((benefit, idx) => {
              const Icon = benefit.icon;
              return (
                <div key={idx} className="flex gap-4 items-start p-4 rounded-xl hover:bg-white/5 transition duration-300 border border-transparent hover:border-white/10">
                  <div className="p-3 bg-blue-900/40 text-blue-400 rounded-lg shrink-0">
                    <Icon size={24} />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg mb-1">{benefit.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{benefit.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. RIGHT SIDE - REGISTRATION / OTP WIZARD */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 md:px-16 py-12 bg-white relative">
        <div className="max-w-md mx-auto w-full">

          {/* Mobile Logo */}
          <div className="lg:hidden mb-8">
            <Link to="/" className="inline-flex items-center gap-2 group">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Home className="text-white" size={20} />
              </div>
              <span className="text-xl font-bold text-slate-900">RentalPro</span>
            </Link>
          </div>

          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            {step === 1 ? "Create Account" : "Verify Email"}
          </h1>
          <p className="text-slate-500 mb-8">
            {step === 1
              ? "Fill in your details to get started."
              : `We sent a 6-digit code to ${formData.email}. Please enter it below.`}
          </p>

          {/* Error Alert */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm flex items-start gap-2 mb-6 animate-in fade-in slide-in-from-top-2">
              <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          {/* ========================================= */}
          {/* STEP 1: REGISTRATION FORM                 */}
          {/* ========================================= */}
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <form onSubmit={handleRegister} className="space-y-5">

                {/* Role Switcher */}
                <div>
                  <label className="block text-slate-700 font-semibold mb-3 text-sm">I want to:</label>
                  <div className="grid grid-cols-2 gap-3 p-1 bg-slate-50 border border-slate-200 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, role: "tenant" })}
                      className={`py-3 text-sm font-bold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 ${formData.role === "tenant"
                        ? "bg-blue-600 text-white shadow-md ring-1 ring-blue-600"
                        : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                        }`}
                    >
                      <User size={16} /> Rent a Home
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, role: "landlord" })}
                      className={`py-3 text-sm font-bold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 ${formData.role === "landlord"
                        ? "bg-blue-600 text-white shadow-md ring-1 ring-blue-600"
                        : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                        }`}
                    >
                      <Home size={16} /> List Property
                    </button>
                  </div>
                </div>

                {/* Name Field */}
                <div>
                  <label className="block text-slate-700 font-semibold mb-2 text-sm">Full Name</label>
                  <div className="relative">
                    <User size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="John Doe"
                      disabled={isLoading}
                      className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-200 disabled:opacity-60"
                    />
                  </div>
                </div>

                {/* Email Field */}
                <div>
                  <label className="block text-slate-700 font-semibold mb-2 text-sm">Email Address</label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="john@company.com"
                      disabled={isLoading}
                      className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-200 disabled:opacity-60"
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
                      disabled={isLoading}
                      onChange={(e) => {
                        setFormData({ ...formData, password: e.target.value });
                        checkPasswordRequirements(e.target.value);
                      }}
                      placeholder="Create a strong password"
                      className="w-full pl-10 pr-12 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-200 disabled:opacity-60"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  {/* Password Strength Grid */}
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <PasswordCheck label="Uppercase" met={passwordRequirements.uppercase} />
                    <PasswordCheck label="Lowercase" met={passwordRequirements.lowercase} />
                    <PasswordCheck label="Number" met={passwordRequirements.number} />
                    <PasswordCheck label="Special Char" met={passwordRequirements.special} />
                  </div>
                </div>

                {/* Terms Checkbox */}
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative flex items-center mt-1">
                    <input
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      disabled={isLoading}
                      className="peer h-4 w-4 cursor-pointer appearance-none rounded border border-slate-300 shadow-sm checked:border-blue-600 checked:bg-blue-600 focus:ring-2 focus:ring-blue-500/20 transition-all disabled:opacity-60"
                    />
                    <Check size={12} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
                  </div>
                  <span className="text-sm text-slate-600 select-none leading-tight mt-0.5">
                    I agree to the <a href="/terms-of-service" className="text-blue-600 font-semibold hover:underline">Terms of Service</a> and <a href="/privacy-policy" className="text-blue-600 font-semibold hover:underline">Privacy Policy</a>.
                  </span>
                </label>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading || !agreedToTerms}
                  className="w-full bg-slate-900 text-white font-bold py-3 px-4 rounded-lg hover:bg-slate-800 transition transform active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? <Loading className="h-5 text-white" /> : 'Create Account'}
                </button>
              </form>

              <div className="my-8 flex items-center gap-4">
                <div className="h-px bg-slate-200 flex-1"></div>
                <span className="text-slate-400 text-xs font-bold uppercase">Or continue with</span>
                <div className="h-px bg-slate-200 flex-1"></div>
              </div>

              <button
                type="button"
                disabled={isLoading}
                onClick={handleGoogleSignUp}
                className="w-full flex items-center justify-center bg-white border border-slate-200 text-slate-700 font-semibold py-3 px-4 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition duration-200 gap-3 disabled:opacity-70"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Sign up with Google
              </button>

              <div className="text-center mt-8">
                <p className="text-slate-600">
                  Already have an account?{' '}
                  <Link to="/login" className="text-blue-600 font-bold hover:text-blue-700 transition">
                    Sign In
                  </Link>
                </p>
              </div>
            </div>
          )}

          {/* ========================================= */}
          {/* STEP 2: OTP VERIFICATION FORM             */}
          {/* ========================================= */}
          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <form onSubmit={handleVerifyOTP} className="space-y-5">
                <div>
                  <label className="block text-slate-700 font-semibold mb-2 text-sm">6-Digit Verification Code</label>
                  <div className="relative">
                    <KeyRound size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      maxLength="6"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="Enter code"
                      disabled={isLoading}
                      className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition tracking-widest font-bold text-lg"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || otp.length !== 6}
                  className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2 shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? <Loading className="h-5 text-white" /> : 'Verify Email & Continue'}
                </button>

                <div className="text-center mt-6">
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={isLoading || resendTimer > 0}
                    className={`text-sm font-bold transition ${resendTimer > 0
                      ? 'text-slate-400 cursor-not-allowed'
                      : 'text-blue-600 hover:underline'
                      }`}
                  >
                    {resendTimer > 0 ? `Resend Code in ${resendTimer}s` : 'Resend Code'}
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>
      </div>

    </div>
  );
};

// --- HELPER COMPONENT ---
const PasswordCheck = ({ label, met }) => (
  <div className={`flex items-center gap-2 text-xs transition-colors duration-200 ${met ? "text-green-600 font-medium" : "text-slate-400"}`}>
    <div className={`w-4 h-4 rounded-full flex items-center justify-center border ${met ? "bg-green-100 border-green-200" : "border-slate-300"}`}>
      {met && <Check size={10} />}
    </div>
    {label}
  </div>
);

export default Register;