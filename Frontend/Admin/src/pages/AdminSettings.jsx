import React, { useState, useEffect } from 'react';
import {
    Settings, User, Lock, Save, Loader2,
    ShieldCheck, Bell, Globe, Percent
} from 'lucide-react';
import AxiosInstance from '../api/axiosInstance';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/authContext';

const AdminSettings = () => {
    const { user } = useAuth(); // Get current logged-in admin data

    // Form States
    const [profileData, setProfileData] = useState({ name: '', email: '' });
    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

    // Loading States
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [isSavingPassword, setIsSavingPassword] = useState(false);

    // Pre-fill profile data when component loads
    useEffect(() => {
        if (user) {
            setProfileData({
                name: user.name || '',
                email: user.email || ''
            });
        }
    }, [user]);

    // --- 1. PROFILE UPDATE HANDLER ---
    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        try {
            setIsSavingProfile(true);
            // Replace with your actual profile update route (e.g., PUT /auth/profile)
            await AxiosInstance.put('/auth/profile', { name: profileData.name });
            toast.success("Profile updated successfully!");
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to update profile.");
        } finally {
            setIsSavingProfile(false);
        }
    };

    // --- 2. PASSWORD CHANGE HANDLER ---
    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            return toast.error("New passwords do not match!");
        }
        if (passwordData.newPassword.length < 6) {
            return toast.error("Password must be at least 6 characters long.");
        }

        try {
            setIsSavingPassword(true);
            // Replace with your actual password change route (e.g., PUT /auth/change-password)
            await AxiosInstance.put('/auth/change-password', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });

            toast.success("Password changed successfully!");
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to change password.");
        } finally {
            setIsSavingPassword(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-300">

            {/* --- HEADER --- */}
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
                        <Settings className="text-blue-600" size={28} />
                        Admin Settings
                    </h1>
                    <p className="text-slate-500 mt-1">Manage your account security and configure platform preferences.</p>
                </div>
                <div className="bg-slate-100 text-slate-600 px-4 py-2 rounded-lg font-bold border border-slate-200 flex items-center gap-2 text-sm shadow-sm">
                    <ShieldCheck size={16} className="text-green-500" /> Super Admin Access
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* --- LEFT COLUMN: PERSONAL SETTINGS --- */}
                <div className="space-y-6">

                    {/* Profile Settings Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
                            <User className="text-blue-600" size={20} />
                            <h3 className="font-bold text-slate-900">Personal Profile</h3>
                        </div>
                        <form onSubmit={handleProfileUpdate} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    value={profileData.name}
                                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 focus:bg-white transition"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Email Address (Read Only)</label>
                                <input
                                    type="email"
                                    value={profileData.email}
                                    disabled
                                    className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 text-slate-500 rounded-lg cursor-not-allowed"
                                />
                                <p className="text-[10px] text-slate-400 mt-1 font-semibold uppercase tracking-wider">Contact super-admin to change root email</p>
                            </div>
                            <div className="pt-2">
                                <button type="submit" disabled={isSavingProfile} className="w-full sm:w-auto px-6 py-2.5 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-70">
                                    {isSavingProfile ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                    Save Profile
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Security / Password Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
                            <Lock className="text-purple-600" size={20} />
                            <h3 className="font-bold text-slate-900">Security & Password</h3>
                        </div>
                        <form onSubmit={handlePasswordChange} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Current Password</label>
                                <input
                                    type="password"
                                    value={passwordData.currentPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-purple-600 focus:bg-white transition"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">New Password</label>
                                <input
                                    type="password"
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-purple-600 focus:bg-white transition"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Confirm New Password</label>
                                <input
                                    type="password"
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-purple-600 focus:bg-white transition"
                                    required
                                />
                            </div>
                            <div className="pt-2">
                                <button type="submit" disabled={isSavingPassword} className="w-full sm:w-auto px-6 py-2.5 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-70">
                                    {isSavingPassword ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
                                    Update Password
                                </button>
                            </div>
                        </form>
                    </div>

                </div>

                {/* --- RIGHT COLUMN: PLATFORM CONFIGURATION (FUTURE PROOFING) --- */}
                <div className="space-y-6">

                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
                            <Globe className="text-emerald-600" size={20} />
                            <h3 className="font-bold text-slate-900">Platform Preferences</h3>
                        </div>
                        <div className="p-6 space-y-6">

                            {/* Commission Settings Placeholder */}
                            <div className="pb-6 border-b border-slate-100">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h4 className="font-bold text-slate-800 flex items-center gap-1"><Percent size={14} className="text-slate-400" /> Platform Commission Rate</h4>
                                        <p className="text-xs text-slate-500 mt-0.5">The percentage fee taken from successful rent payments.</p>
                                    </div>
                                    <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded text-xs font-bold uppercase tracking-wider">Coming Soon</span>
                                </div>
                                <input type="text" disabled value="2.5%" className="w-full md:w-1/3 mt-2 px-4 py-2 bg-slate-50 border border-slate-200 text-slate-500 font-bold rounded-lg cursor-not-allowed" />
                            </div>

                            {/* Notification Settings Placeholder */}
                            <div>
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h4 className="font-bold text-slate-800 flex items-center gap-1"><Bell size={14} className="text-slate-400" /> Admin Notifications</h4>
                                        <p className="text-xs text-slate-500 mt-0.5">Manage which alerts you receive via email.</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition">
                                        <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
                                        <span className="text-sm font-semibold text-slate-700">New User Registrations</span>
                                    </label>
                                    <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition">
                                        <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
                                        <span className="text-sm font-semibold text-slate-700">Property Approval Requests</span>
                                    </label>
                                    <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition">
                                        <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
                                        <span className="text-sm font-semibold text-slate-700">High Priority Maintenance Alerts</span>
                                    </label>
                                </div>
                                <div className="pt-4">
                                    <button disabled className="px-4 py-2 bg-slate-100 text-slate-400 font-bold rounded-lg cursor-not-allowed text-sm">Save Preferences</button>
                                </div>
                            </div>

                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default AdminSettings;