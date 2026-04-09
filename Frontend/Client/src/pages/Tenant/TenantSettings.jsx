import React, { useState, useEffect } from 'react';
import {
  User, Lock, Shield, CheckCircle, AlertCircle, ClipboardClock,
  UploadCloud, Loader2, FileText, Check,
  BadgeCheck,
  BadgeX
} from 'lucide-react';
import { DashboardHeader } from '../../components/DashboardSharedUI';
import AxiosInstance from '../../api/axiosInstance';
import { useAuth } from '../../context/authContext';

const TenantSettings = () => {
  const { user, fetchUserProfile } = useAuth();

  const [activeTab, setActiveTab] = useState('verification');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  // --- FORM STATES ---
  const [profileData, setProfileData] = useState({
    name: '',
    phone: '',
    email: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [verificationFile, setVerificationFile] = useState(null);
  const [idType, setIdType] = useState('Aadhar');
  const [verificationStatus, setVerificationStatus] = useState(user?.verificationStatus || 'unverified');

  // --- 1. INITIALIZE DATA ---
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        phone: user.phone || '',
        email: user.email || ''
      });
      setVerificationStatus(user.verificationStatus || 'unverified');
    }
  }, [user]);

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    setMessage(null);
    setError(null);
  };

  // --- 2. PROFILE HANDLER ---
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      setError(null);
      setMessage(null);

      // Same endpoint as landlord, as both are Users
      await AxiosInstance.put('/auth/me', { name: profileData.name, phone: profileData.phone });

      if (fetchUserProfile) await fetchUserProfile();

      setMessage("Profile updated successfully!");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  // --- 3. PASSWORD HANDLER ---
  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return setError("New passwords do not match.");
    }

    try {
      setIsSaving(true);
      setError(null);
      setMessage(null);

      await AxiosInstance.put('/auth/change-password', {
        oldPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      setMessage("Password changed successfully!");
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to change password.");
    } finally {
      setIsSaving(false);
    }
  };

  // --- 4. VERIFICATION HANDLER ---
  const handleVerificationUpload = async (e) => {
    e.preventDefault();
    if (!verificationFile) return setError("Please select a document to upload.");

    const uploadData = new FormData();
    uploadData.append('document', verificationFile);
    uploadData.append('idType', idType);

    try {
      setIsSaving(true);
      setError(null);
      setMessage(null);

      const res = await AxiosInstance.post('/auth/verify-identity', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.status === 200) {
        setVerificationStatus('pending');
        if (fetchUserProfile) await fetchUserProfile();
        setMessage("Document uploaded successfully! Your profile is now under review.");
        setVerificationFile(null);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to upload document.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-12 animate-in fade-in duration-300">

      <DashboardHeader
        title="Account Settings"
        subtitle="Manage your personal information, security preferences, and identity verification."
      />

      {/* FEEDBACK BANNERS */}
      {message && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded-r-lg flex items-center gap-3">
          <CheckCircle className="text-green-500" size={20} />
          <p className="text-green-700 font-medium">{message}</p>
        </div>
      )}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg flex items-center gap-3">
          <AlertCircle className="text-red-500" size={20} />
          <p className="text-red-700 font-medium">{error}</p>
        </div>
      )}

      {/* TABS NAVIGATION */}
      <div className="flex gap-2 border-b border-slate-200 mb-8 overflow-x-auto pb-2">
        <button onClick={() => handleTabSwitch('verification')} className={`flex items-center gap-2 px-5 py-3 font-bold rounded-t-lg transition whitespace-nowrap ${activeTab === 'verification' ? 'bg-white text-blue-600 border-t border-l border-r border-slate-200 shadow-[0_4px_0_0_white]' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'}`}>
          <Shield size={18} /> Identity Verification
        </button>
        <button onClick={() => handleTabSwitch('profile')} className={`flex items-center gap-2 px-5 py-3 font-bold rounded-t-lg transition whitespace-nowrap ${activeTab === 'profile' ? 'bg-white text-blue-600 border-t border-l border-r border-slate-200 shadow-[0_4px_0_0_white]' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'}`}>
          <User size={18} /> Personal Info
        </button>
        <button onClick={() => handleTabSwitch('security')} className={`flex items-center gap-2 px-5 py-3 font-bold rounded-t-lg transition whitespace-nowrap ${activeTab === 'security' ? 'bg-white text-blue-600 border-t border-l border-r border-slate-200 shadow-[0_4px_0_0_white]' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'}`}>
          <Lock size={18} /> Security
        </button>
      </div>

      {/* ======================= TAB 1: PROFILE ======================= */}
      {activeTab === 'profile' && (
        <div className="bg-white p-6 md:p-8 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-xl font-bold text-slate-800 mb-6">Profile Details</h2>
          <form onSubmit={handleProfileUpdate} className="space-y-6 max-w-2xl">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none transition"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Phone Number</label>
              <input
                type="tel"
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none transition"
                placeholder="+91"
              />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <label className="text-sm font-bold text-slate-700">
                  Email Address (Cannot be changed)
                </label>

                {user.isEmailVerified ? (
                  <BadgeCheck size={18} className="text-green-500" />
                ) : (
                  <BadgeX size={18} className="text-red-500" />
                )}
              </div>
              <input
                type="email"
                value={profileData.email}
                disabled
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
              />
              <p className="text-xs text-slate-500 mt-1">Contact support if you need to change your registered email.</p>
            </div>
            <div className="pt-4 border-t border-slate-100">
              <button
                type="submit"
                disabled={isSaving}
                className="bg-slate-900 text-white px-8 py-3 rounded-lg font-bold hover:bg-slate-800 transition flex items-center gap-2 shadow-sm disabled:opacity-70"
              >
                {isSaving ? <Loader2 size={18} className="animate-spin" /> : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ======================= TAB 2: SECURITY ======================= */}
      {activeTab === 'security' && (
        <div className="bg-white p-6 md:p-8 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-xl font-bold text-slate-800 mb-6">Change Password</h2>

          {user?.authProvider !== 'local' ? (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 flex items-start gap-4">
              <div className="p-2 bg-white rounded-full shadow-sm">
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">
                  Managed by Google
                </h4>
                <p className="text-slate-600 text-xs mt-1">
                  You logged in via Google. To change your password, manage your
                  Google Account directly.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handlePasswordUpdate} className="space-y-6 max-w-2xl">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Current Password</label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none transition"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">New Password</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none transition"
                  required
                  minLength={6}
                />
                <p className="text-xs text-slate-500 mt-1">Must be at least 6 characters long.</p>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none transition"
                  required
                />
              </div>
              <div className="pt-4 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="bg-slate-900 text-white px-8 py-3 rounded-lg font-bold hover:bg-slate-800 transition flex items-center gap-2 shadow-sm disabled:opacity-70"
                >
                  {isSaving ? <Loader2 size={18} className="animate-spin" /> : 'Update Password'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* ======================= TAB 3: VERIFICATION ======================= */}
      {activeTab === 'verification' && (
        <div className="bg-white p-6 md:p-8 rounded-xl border border-slate-200 shadow-sm">

          <div className={`p-6 rounded-xl border mb-8 flex flex-col md:flex-row items-center gap-4 ${verificationStatus === 'verified' ? 'bg-green-50 border-green-200 text-green-800' :
            verificationStatus === 'pending' ? 'bg-amber-50 border-amber-200 text-amber-800' :
              'bg-red-50 border-red-200 text-red-800'
            }`}>
            <div className="flex-shrink-0">
              {verificationStatus === 'verified' ? <CheckCircle size={40} className="text-green-500" /> :
                verificationStatus === 'pending' ? <ClipboardClock size={40} className="text-amber-500" /> :
                  <Shield size={40} className="text-red-500" />}
            </div>
            <div className="text-center md:text-left">
              <h3 className="text-xl font-extrabold capitalize mb-1">
                Status: {verificationStatus}
              </h3>
              <p className="text-sm font-medium opacity-90">
                {/* Notice the changed text here tailored for tenants */}
                {verificationStatus === 'verified' && "Your identity is verified. You can now securely sign leases and rent properties."}
                {verificationStatus === 'pending' && "Your documents are currently under review by our admin team. This usually takes 24-48 hours."}
                {verificationStatus === 'unverified' && "You must verify your identity using a Government ID (Aadhar or PAN) before you can sign a lease agreement."}

                {/* Display Admin Rejection Note if available */}
                {verificationStatus === 'rejected' && (
                  <span>
                    Your previous document was rejected.
                    {user?.verificationMessage && <span className="block mt-1 font-bold">Reason: {user.verificationMessage}</span>}
                  </span>
                )}
              </p>
            </div>
          </div>

          {(verificationStatus === 'unverified' || verificationStatus === 'rejected') && (
            <form onSubmit={handleVerificationUpload} className="max-w-2xl">
              <h2 className="text-lg font-bold text-slate-800 mb-4">Upload Government ID</h2>

              {/* ID Type Dropdown */}
              <div className="mb-4">
                <label className="block text-sm font-bold text-slate-700 mb-1">Select ID Type</label>
                <select
                  value={idType}
                  onChange={(e) => setIdType(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none transition bg-white"
                >
                  <option value="Aadhar">Aadhar Card</option>
                  <option value="PAN">PAN Card</option>
                  <option value="Passport">Passport</option>
                  <option value="Driving License">Driving License</option>
                  <option value="Voter ID">Voter ID</option>
                </select>
              </div>

              <div className="bg-blue-50 border-2 border-dashed border-blue-200 rounded-xl p-8 text-center hover:bg-blue-100 transition relative mb-6">
                <input
                  type="file"
                  accept=".pdf, image/jpeg, image/png"
                  onChange={(e) => setVerificationFile(e.target.files[0])}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  required
                />
                <div className="pointer-events-none flex flex-col items-center">
                  {verificationFile ? (
                    <>
                      <FileText className="text-blue-600 mb-3" size={40} />
                      <p className="font-bold text-blue-900">{verificationFile.name}</p>
                      <p className="text-sm text-blue-600 mt-1">Click to replace file</p>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="text-blue-500 mb-3" size={40} />
                      <p className="font-bold text-blue-900">Click to upload your Aadhar or PAN Card</p>
                      <p className="text-sm text-blue-600 mt-1">Supports PDF, JPG, PNG (Max 5MB)</p>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200 mb-6">
                <Shield className="text-slate-400 mt-0.5 flex-shrink-0" size={18} />
                <p className="text-xs text-slate-500 leading-relaxed">
                  Your privacy is our priority. Documents uploaded here are encrypted and strictly used for identity verification by our admin team to ensure a safe community. They are never shared publicly.
                </p>
              </div>

              <button
                type="submit"
                disabled={isSaving || !verificationFile}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 transition flex items-center gap-2 shadow-sm disabled:opacity-50 w-full sm:w-auto justify-center"
              >
                {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                Submit for Verification
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default TenantSettings;