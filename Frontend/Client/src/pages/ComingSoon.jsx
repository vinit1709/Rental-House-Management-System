import React, { useState } from 'react';
import { Rocket, Mail, ArrowLeft, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const ComingSoon = ({ pageName = "This Feature", description = "We are working hard to bring this to you soon." }) => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [isSubscribed, setIsSubscribed] = useState(false);

    const handleSubscribe = (e) => {
        e.preventDefault();
        if (!email) return;

        // Simulate API call
        setTimeout(() => {
            setIsSubscribed(true);
            toast.success("You're on the list! We'll notify you when it's live.");
            setEmail('');
        }, 500);
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center bg-slate-50 p-4 relative overflow-hidden">

            {/* Background Decorative Blobs */}
            <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl"></div>

            <div className="bg-white max-w-lg w-full p-8 md:p-12 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 text-center relative z-10 animate-in zoom-in-95 duration-500">

                {/* Floating Icon */}
                <div className="relative mx-auto w-20 h-20 mb-8">
                    <div className="absolute inset-0 bg-blue-100 rounded-2xl rotate-6 animate-pulse"></div>
                    <div className="absolute inset-0 bg-blue-600 text-white rounded-2xl flex items-center justify-center -rotate-3 transition-transform hover:rotate-0 shadow-lg">
                        <Rocket size={36} className="animate-bounce" style={{ animationDuration: '3s' }} />
                    </div>
                    <Sparkles className="absolute -top-4 -right-4 text-amber-400 animate-pulse" size={24} />
                </div>

                {/* Text Content */}
                <h1 className="text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">
                    {pageName} is <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Coming Soon</span>
                </h1>
                <p className="text-slate-500 mb-8 leading-relaxed">
                    {description} Drop your email below to get early access and updates.
                </p>

                {/* Email Capture Form */}
                {!isSubscribed ? (
                    <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 mb-10">
                        <div className="relative flex-1">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="email"
                                placeholder="Enter your email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white transition"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-600 transition-colors shadow-md whitespace-nowrap"
                        >
                            Notify Me
                        </button>
                    </form>
                ) : (
                    <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl mb-10 font-medium flex items-center justify-center gap-2 animate-in fade-in slide-in-from-bottom-2">
                        <Sparkles size={18} /> You are on the waitlist!
                    </div>
                )}

                {/* Back to Home Action */}
                <button
                    onClick={() => navigate('/')}
                    className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 font-semibold transition group"
                >
                    <div className="p-1.5 rounded-lg bg-slate-100 group-hover:bg-slate-200 transition">
                        <ArrowLeft size={16} />
                    </div>
                    Return to Homepage
                </button>
            </div>
        </div>
    );
};

export default ComingSoon;