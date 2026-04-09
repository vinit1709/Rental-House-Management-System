import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import AxiosInstance from "../api/axiosInstance";
import { toast } from "react-hot-toast";
import { useAuth } from '../context/authContext';
import { 
  Home,
  Building2, 
  KeyRound, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck 
} from 'lucide-react';
import Loading from '../components/loading/loading';

const SelectRole = () => {
  const { fetchUserProfile } = useAuth();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);

  // Extract Google Data safely
  const googleUser = {
    googleId: params.get("googleId"),
    email: params.get("email"),
    name: params.get("name"),
  };

  // Validation: Kick user out if they didn't come from Google
  useEffect(() => {
    if (!googleUser.googleId || !googleUser.email) {
      toast.error("Session expired. Please login again.");
      navigate("/login");
    }
  }, [googleUser.googleId, navigate]);

  const handleContinue = async () => {
    if (!selectedRole) {
      toast.error("Please select a profile type.");
      return;
    }

    try {
      setLoading(true);
      const response = await AxiosInstance.post('/auth/google/complete-profile',
        { ...googleUser, role: selectedRole },
        { withCredentials: true }
      );

      if (response.status === 201) {
        toast.success(`Welcome aboard, ${selectedRole}!`);
        await fetchUserProfile();
        navigate("/");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Setup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Role Configuration
  const roles = [
    {
      id: "tenant",
      icon: KeyRound,
      title: "I want to Rent",
      subtitle: "Find homes, sign leases & pay rent.",
      features: ["No hidden fees", "Digital agreements", "Credit building"]
    },
    {
      id: "landlord",
      icon: Building2,
      title: "I want to List",
      subtitle: "Manage properties & screen tenants.",
      features: ["Automated rent", "Maintenance tracking", "Tenant screening"]
    }
  ];

  return (
    <div className="min-h-screen flex bg-white font-sans">
      
      {/* 1. LEFT PANEL: Brand Experience (Dark Mode) */}
      <div className="hidden lg:flex w-5/12 bg-slate-950 relative overflow-hidden flex-col justify-between p-12 text-white">
        {/* Background Patterns */}
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,#1e40af_0%,transparent_40%)] opacity-30 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-full h-full bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-10 pointer-events-none"></div>

        {/* Brand */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-blue-600 p-2 rounded-lg group-hover:bg-blue-700 transition duration-300 shadow-sm">
                        <Home className="text-white" size={22} />
                      </div>
                      <div className="flex flex-col">
                        {/* Changed: Solid Slate Text */}
                        <span className="text-xl font-bold tracking-tight group-hover:text-blue-600 transition">
                          RentalPro
                        </span>
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider hidden sm:block">
                          Management System
                        </span>
                      </div>
          </div>
          
          <h1 className="text-4xl font-bold leading-tight mb-4">
            Welcome to Our Platform <br />
            Hello, <span className="text-blue-500">{googleUser.name?.split(' ')[0]}</span>!
          </h1>
          <p className="text-slate-400 text-lg max-w-sm leading-relaxed">
            You are one step away. Select your profile type to customize your dashboard experience.
          </p>
        </div>

        {/* Trust Badge */}
        <div className="relative z-10 flex items-center gap-3 text-sm text-slate-400 bg-slate-900/50 p-4 rounded-xl backdrop-blur-sm border border-slate-800 w-fit">
          <ShieldCheck className="text-green-500" size={20} />
          <span>Secure Google Authentication Verified</span>
        </div>
      </div>

      {/* 2. RIGHT PANEL: Interactive Selection */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 lg:p-12 relative">
        <div className="max-w-xl w-full space-y-10">
          
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-slate-900">Choose your path</h2>
            <p className="text-slate-500 mt-2">This helps us tailor your tools and permissions.</p>
          </div>

          <div className="grid gap-5">
            {roles.map((role) => {
              const Icon = role.icon;
              const isSelected = selectedRole === role.id;

              return (
                <button
                  key={role.id}
                  onClick={() => setSelectedRole(role.id)}
                  className={`group relative flex items-start gap-6 p-6 rounded-2xl border-2 text-left transition-all duration-300 ${
                    isSelected 
                      ? "border-blue-600 bg-blue-50/30 shadow-xl shadow-blue-900/5 ring-1 ring-blue-600 scale-[1.02]" 
                      : "border-slate-100 bg-white hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  {/* Selection Indicator */}
                  <div className={`absolute top-6 right-6 transition-all duration-300 ${isSelected ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
                    <CheckCircle2 className="text-white fill-blue-600" size={24} fill="currentColor" />
                  </div>

                  {/* Icon Box */}
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-300 ${
                    isSelected ? "bg-blue-600 text-white shadow-md" : "bg-slate-100 text-slate-500 group-hover:bg-white group-hover:shadow-sm"
                  }`}>
                    <Icon size={28} />
                  </div>

                  {/* Text Content */}
                  <div className="flex-1">
                    <h3 className={`text-lg font-bold transition-colors ${isSelected ? "text-blue-900" : "text-slate-900"}`}>
                      {role.title}
                    </h3>
                    <p className="text-slate-500 text-sm mt-1 mb-4">{role.subtitle}</p>
                    
                    {/* Feature Micro-list */}
                    <div className="flex flex-wrap gap-2">
                      {role.features.map((feat, i) => (
                        <span key={i} className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide transition-colors ${
                          isSelected ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-500"
                        }`}>
                          {feat}
                        </span>
                      ))}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Action Area */}
          <div className="pt-4 flex flex-col items-center gap-4">
            <button
              onClick={handleContinue}
              disabled={loading || !selectedRole}
              className={`
                w-full py-4 rounded-xl text-lg font-bold flex items-center justify-center gap-2 transition-all duration-300 shadow-lg
                ${loading || !selectedRole 
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none" 
                  : "bg-slate-900 text-white hover:bg-blue-600 hover:shadow-blue-600/30 hover:-translate-y-1"
                }
              `}
            >
              {loading ? (
                 <>
                   <Loading className="h-5" /> 
                   <span className="text-base ml-2">Creating Account...</span>
                 </>
              ) : (
                 <>Continue <ArrowRight size={20} /></>
              )}
            </button>
            <p className="text-slate-400 text-xs text-center max-w-xs">
              By continuing, you confirm that you have read and agree to our Terms of Service.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SelectRole;