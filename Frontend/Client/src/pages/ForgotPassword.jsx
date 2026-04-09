import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, ArrowLeft, AlertCircle, KeyRound, Lock, Eye, EyeOff } from 'lucide-react';
import AxiosInstance from '../api/axiosInstance';
import { toast } from 'react-hot-toast';
import Loading from '../components/loading/loading';
import { useEffect } from 'react';

const ForgotPassword = () => {
    const navigate = useNavigate();

    // Step 1: Request OTP | Step 2: Enter OTP & New Password
    const [step, setStep] = useState(1);

    // Form Data
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');

    // UI State
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [resendTimer, setResendTimer] = useState(0);

    // --- TIMER LOGIC ---
    useEffect(() => {
        let interval;
        if (resendTimer > 0) {
            interval = setInterval(() => {
                setResendTimer((prevTimer) => prevTimer - 1);
            }, 1000);
        }
        // Cleanup the interval when the component unmounts or timer reaches 0
        return () => clearInterval(interval);
    }, [resendTimer]);

    // --- PASSWORD VALIDATION HELPER ---
    const validatePassword = (password) => {
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        const isLengthValid = password.length >= 6;

        if (!isLengthValid) return "Password must be at least 6 characters long.";
        if (!hasUpperCase) return "Password must contain at least one uppercase letter.";
        if (!hasLowerCase) return "Password must contain at least one lowercase letter.";
        if (!hasNumbers) return "Password must contain at least one number.";
        if (!hasSpecialChar) return "Password must contain at least one special character.";

        return null; // Null means no errors
    };

    // --- STEP 1: REQUEST OTP ---
    const handleRequestOTP = async (e) => {
        e?.preventDefault();
        if (!email) return setError('Please enter your email address.');

        try {
            setIsLoading(true);
            setError('');
            // Calls your auth.controller.js -> forgotPassword function
            await AxiosInstance.post('/auth/forgot-password', { email });

            toast.success('OTP sent to your email!');
            setStep(2);
            setResendTimer(60); // Start 60-second timer
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to send OTP.");
            setError(err.response?.data?.message || 'Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // --- STEP 2: RESET PASSWORD ---
    const handleResetPassword = async (e) => {
        e.preventDefault();

        if (otp.length !== 6) {
            return setError('Please enter a valid 6-digit OTP.');
        }

        const passwordError = validatePassword(newPassword);
        if (passwordError) {
            return setError(passwordError);
        }

        try {
            setIsLoading(true);
            setError('');

            // Calls your auth.controller.js -> resetPasswordWithOTP function
            const response = await AxiosInstance.post('/auth/reset-password', {
                email,
                otp,
                newPassword
            });

            if (response.status === 200) {
                toast.success("Password reset successfully! You can now log in.");
                navigate('/login');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to reset password.");
            setError(err.response?.data?.message || 'Invalid OTP or expired request.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex font-sans">

            {/* LEFT SIDE - WIZARD FORM */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 md:px-16 py-12 relative">

                {/* Dynamic Back Button */}
                {step === 1 ? (
                    <Link to="/login" className="absolute top-8 left-8 flex items-center gap-2 text-slate-500 hover:text-blue-600 transition font-medium text-sm">
                        <ArrowLeft size={16} /> Back to Login
                    </Link>
                ) : (
                    <button
                        onClick={() => { setError(''); setStep(1); }}
                        className="absolute top-8 left-8 flex items-center gap-2 text-slate-500 hover:text-blue-600 transition font-medium text-sm"
                    >
                        <ArrowLeft size={16} /> Back
                    </button>
                )}

                <div className="max-w-md mx-auto w-full mt-8">

                    {/* Header */}
                    <div className="mb-10 text-center lg:text-left">
                        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6 mx-auto lg:mx-0 shadow-sm border border-blue-200">
                            {step === 1 ? <Mail size={24} /> : <KeyRound size={24} />}
                        </div>
                        <h1 className="text-3xl font-bold text-slate-900 mb-2">
                            {step === 1 ? "Forgot Password?" : "Reset Password"}
                        </h1>
                        <p className="text-slate-500 leading-relaxed text-sm">
                            {step === 1
                                ? "Enter your registered email address, and we'll send you a secure 6-digit OTP to reset your password."
                                : `We sent a verification code to ${email}. Please enter it below along with your new password.`}
                        </p>
                    </div>

                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">

                        {/* Error Banner */}
                        {error && (
                            <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
                                <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                                <p>{error}</p>
                            </div>
                        )}

                        {/* --- STEP 1 FORM (Request OTP) --- */}
                        {step === 1 && (
                            <form onSubmit={handleRequestOTP} className="space-y-5">
                                <div>
                                    <label className="block text-slate-700 font-semibold mb-2 text-sm">Email Address</label>
                                    <div className="relative">
                                        <Mail size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="Enter your registered email"
                                            disabled={isLoading}
                                            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition"
                                            required
                                        />
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={isLoading || !email}
                                    className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? <Loading className='h-5 text-white' /> : 'Send OTP'}
                                </button>
                            </form>
                        )}

                        {/* --- STEP 2 FORM (Verify OTP & Reset) --- */}
                        {step === 2 && (
                            <form onSubmit={handleResetPassword} className="space-y-5">

                                {/* OTP Field */}
                                <div>
                                    <label className="block text-slate-700 font-semibold mb-2 text-sm">6-Digit OTP</label>
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

                                {/* New Password Field */}
                                <div>
                                    <label className="block text-slate-700 font-semibold mb-2 text-sm">New Password</label>
                                    <div className="relative">
                                        <Lock size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="••••••••"
                                            disabled={isLoading}
                                            className="w-full pl-10 pr-12 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-2">
                                        Must contain 1 uppercase, 1 lowercase, 1 number, and 1 special character (min. 6 chars).
                                    </p>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading || otp.length !== 6 || !newPassword}
                                    className="w-full bg-slate-900 text-white font-bold py-3 px-4 rounded-lg hover:bg-slate-800 transition flex items-center justify-center gap-2 shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? <Loading className='h-5 text-white' /> : 'Update Password'}
                                </button>

                                <div className="text-center mt-4">
                                    <button
                                        type="button"
                                        onClick={handleRequestOTP}
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
                        )}

                    </div>
                </div>
            </div>

            {/* RIGHT SIDE - HERO SHOWCASE (Matches Login design) */}
            <div className="hidden lg:flex w-1/2 bg-slate-950 relative overflow-hidden items-center justify-center p-12">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#1e40af_0%,transparent_40%)] opacity-20"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,#0f172a_0%,transparent_40%)] opacity-80"></div>
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20 pointer-events-none"></div>

                <div className="relative z-10 max-w-lg text-center">
                    <div className="w-20 h-20 bg-blue-900/40 rounded-full flex items-center justify-center mx-auto mb-8 border border-blue-800 shadow-[0_0_40px_rgba(37,99,235,0.2)]">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                    </div>
                    <h2 className="text-4xl font-bold text-white mb-6 leading-tight">
                        Secure your account.
                    </h2>
                    <p className="text-slate-400 text-lg leading-relaxed">
                        Your security is our priority. Get back to managing your properties and finding your perfect home in just a few clicks.
                    </p>
                </div>
            </div>

        </div>
    );
};

export default ForgotPassword;