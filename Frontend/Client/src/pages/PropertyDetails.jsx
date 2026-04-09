import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    MapPin, IndianRupee, Home, CheckCircle, Calendar,
    Info, ShieldCheck, ArrowLeft, Loader2, Image as ImageIcon,
    X, Send, // Added Send icon for the apply button
    Square
} from 'lucide-react';
import AxiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/authContext';
import { toast } from 'react-hot-toast';

const PropertyDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [property, setProperty] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Interactive Gallery State
    const [activeImage, setActiveImage] = useState(0);

    // Visit Scheduling State
    const [showVisitModal, setShowVisitModal] = useState(false);
    const [visitDate, setVisitDate] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- NEW: Application State ---
    const [showApplyModal, setShowApplyModal] = useState(false);
    const [applyMessage, setApplyMessage] = useState('');
    const [isApplying, setIsApplying] = useState(false);
    const [hasApplied, setHasApplied] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);

                // 1. Fetch Property Details
                const propertyRes = await AxiosInstance.get(`/properties/${id}`);
                setProperty(propertyRes.data.property);

                // 2. NEW: If user is a tenant, check if they have already applied to this property
                if (user?.role === 'tenant') {
                    try {
                        const appRes = await AxiosInstance.get('/tenants/my/applications');
                        // Check if any application in their history matches this property's ID
                        const alreadyApplied = appRes.data.applications.some(app => app.propertyId._id === id);
                        setHasApplied(alreadyApplied);
                    } catch (err) {
                        console.error("Could not fetch application status:", err);
                    }
                }

            } catch (err) {
                console.error("Error fetching property details:", err);
                setError("We couldn't find this property. It may have been removed or rented out.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [id, user]);

    // --- VISIT SCHEDULING HANDLER ---
    const handleScheduleVisit = async (e) => {
        e.preventDefault();
        if (!visitDate) return toast.error("Please select a date for your visit.");

        try {
            setIsSubmitting(true);
            const payload = { visitDate: new Date(visitDate).toISOString() };
            await AxiosInstance.post(`/properties/${id}/visit-request`, payload);

            toast.success("Visit request sent to the landlord successfully!");
            setShowVisitModal(false);
            setVisitDate('');
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to schedule visit. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- NEW: APPLICATION HANDLER ---
    const handleApplyForProperty = async (e) => {
        e.preventDefault();
        try {
            setIsApplying(true);

            // Call the Tenant Service endpoint we just built
            await AxiosInstance.post(`/tenants/apply/${property._id}`, {
                landlordId: property.landlordId,
                message: applyMessage
            });

            toast.success("Application submitted successfully!");
            setShowApplyModal(false);
            setApplyMessage('');
            setHasApplied(true); // Changes the UI button instantly
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to submit application.");
        } finally {
            setIsApplying(false);
        }
    };

    const getTodayString = () => new Date().toISOString().split('T')[0];

    if (isLoading) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
                <Loader2 className="animate-spin text-blue-600" size={48} />
                <p className="text-slate-500 font-bold animate-pulse">Loading property details...</p>
            </div>
        );
    }

    if (error || !property) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4 text-center px-4">
                <ShieldCheck className="text-slate-300" size={64} />
                <h2 className="text-2xl font-bold text-slate-800">Property Not Found</h2>
                <p className="text-slate-500 max-w-md">{error}</p>
                <button onClick={() => navigate(-1)} className="mt-4 text-blue-600 font-bold hover:underline flex items-center gap-2">
                    <ArrowLeft size={16} /> Go Back
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 animate-in fade-in duration-500 relative">

            {/* --- BACK NAVIGATION --- */}
            <button onClick={() => navigate(-1)} className="text-slate-500 font-bold hover:text-blue-600 flex items-center gap-2 mb-6 transition">
                <ArrowLeft size={18} /> Back to Search
            </button>

            {/* --- HEADER TITLE & LOCATION --- */}
            <div className="mb-8">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-2">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight">
                        {property.title}
                    </h1>
                    <div className="flex-shrink-0">
                        <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full font-bold tracking-wider text-sm uppercase shadow-sm border border-green-200">
                            {property.status === 'available' ? 'Available Now' : property.status}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-2 text-slate-600 text-lg font-medium">
                    <MapPin size={20} className="text-blue-500" />
                    {property.address?.street}, {property.address?.city}, {property.address?.state} - {property.address?.pincode}
                </div>
            </div>

            {/* --- IMAGE GALLERY --- */}
            <div className="mb-12">
                {property.photos && property.photos.length > 0 ? (
                    <div className="flex flex-col md:flex-row gap-4 h-auto md:h-[500px]">
                        {/* Main Image */}
                        <div className="w-full md:w-3/4 h-[300px] md:h-full rounded-2xl overflow-hidden shadow-md">
                            <img
                                src={property.photos[activeImage]}
                                alt="Main Property View"
                                className="w-full h-full object-cover transition-all duration-500"
                            />
                        </div>
                        {/* Thumbnail Sidebar */}
                        <div className="w-full md:w-1/4 flex flex-row md:flex-col gap-4 overflow-x-auto md:overflow-y-auto pb-2 md:pb-0 hide-scrollbar">
                            {property.photos.map((photo, index) => (
                                <button
                                    key={index}
                                    onClick={() => setActiveImage(index)}
                                    className={`flex-shrink-0 h-24 md:h-[114px] w-32 md:w-full rounded-xl overflow-hidden border-2 transition ${activeImage === index ? 'border-blue-600 opacity-100 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                >
                                    <img src={photo} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="w-full h-64 bg-slate-100 rounded-2xl flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-300">
                        <ImageIcon size={48} className="mb-2 opacity-50" />
                        <p className="font-medium">No images available for this property</p>
                    </div>
                )}
            </div>

            {/* --- MAIN CONTENT & SIDEBAR GRID --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                {/* Left Column: Details */}
                <div className="lg:col-span-2 space-y-10">
                    {/* Quick Specs */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-5 pb-10 border-b border-slate-200">
                        <div className="flex flex-col">
                            <span className="text-slate-500 text-sm font-bold uppercase mb-1 flex items-center gap-1"><Home size={16} /> Type</span>
                            <span className="text-lg font-bold text-slate-900 capitalize">{property.type}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-slate-500 text-sm font-bold uppercase mb-1 flex items-center gap-1"><Home size={16} /> Config</span>
                            <span className="text-lg font-bold text-slate-900">{property.bhk} BHK</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-slate-500 text-sm font-bold uppercase mb-1 flex items-center gap-1"><Info size={16} /> Furnishing</span>
                            <span className="text-lg font-bold text-slate-900 capitalize">{property.furnishing} Furnished</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-slate-500 text-sm font-bold uppercase mb-1 flex items-center gap-1"><Square size={16} /> Sqft</span>
                            <span className="text-lg font-bold text-slate-900">{property.sqft} SQFT</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-slate-500 text-sm font-bold uppercase mb-1 flex items-center gap-1"><Calendar size={16} /> Available</span>
                            <span className="text-lg font-bold text-slate-900">
                                {property.availableFrom ? new Date(property.availableFrom).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Immediate'}
                            </span>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">About this Property</h2>
                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 leading-relaxed text-slate-700 whitespace-pre-line">
                            {property.description}
                        </div>
                    </div>

                    {/* Amenities */}
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-6">Amenities</h2>
                        {property.amenities && property.amenities.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-4">
                                {property.amenities.map((amenity, index) => (
                                    <div key={index} className="flex items-center gap-3 text-slate-700 font-medium">
                                        <CheckCircle className="text-blue-500 flex-shrink-0" size={20} />
                                        <span>{amenity}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-slate-500 italic">No specific amenities listed.</p>
                        )}
                    </div>
                </div>

                {/* Right Column: Sticky Pricing Card */}
                <div className="lg:col-span-1">
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xl sticky top-28">
                        <h3 className="text-2xl font-extrabold text-slate-900 mb-6 flex items-center gap-1">
                            ₹{property.rent?.toLocaleString('en-IN')} <span className="text-sm font-medium text-slate-500">/ month</span>
                        </h3>

                        <div className="space-y-4 mb-8">
                            <div className="flex justify-between items-center py-3 border-b border-slate-100">
                                <span className="text-slate-600 font-medium">Security Deposit</span>
                                <span className="font-bold text-slate-900">₹{property.deposit?.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="flex justify-between items-center py-3 border-b border-slate-100">
                                <span className="text-slate-600 font-medium">Brokerage</span>
                                <span className="font-bold text-green-600">No Brokerage</span>
                            </div>
                        </div>

                        {/* --- APPLY BUTTON --- */}
                        {hasApplied ? (
                            <button disabled className="w-full bg-green-100 text-green-700 py-4 rounded-xl font-bold text-lg mb-4 flex justify-center items-center gap-2 border border-green-200 shadow-sm cursor-not-allowed">
                                <CheckCircle size={20} /> Application Submitted
                            </button>
                        ) : (
                            <button
                                onClick={() => {
                                    if (!user) {
                                        navigate('/login', { state: { message: "Please log in to apply for this property." } });
                                    } else if (user.role === 'tenant') {
                                        setShowApplyModal(true);
                                    } else {
                                        toast.error("Only tenants apply for properties.");
                                    }
                                }}
                                className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition shadow-lg hover:shadow-xl mb-4 flex justify-center items-center gap-2"
                            >
                                <Send size={20} /> Apply Now
                            </button>
                        )}

                        {/* --- VISIT BUTTON --- */}
                        <button
                            onClick={() => {
                                if (!user) {
                                    navigate('/login', { state: { message: "Please log in to schedule a visit." } });
                                } else if (user.role === 'tenant') {
                                    setShowVisitModal(true);
                                } else {
                                    toast.error("Only tenants schedule visits.");
                                }
                            }}
                            className="w-full bg-white text-slate-900 border-2 border-slate-900 py-3.5 rounded-xl font-bold text-lg hover:bg-slate-50 transition shadow-sm mb-4"
                        >
                            Schedule a Visit
                        </button>

                        <p className="text-center text-xs text-slate-500 font-medium flex items-center justify-center gap-1">
                            <ShieldCheck size={14} className="text-green-500" /> Admin Verified Property
                        </p>
                    </div>
                </div>

            </div>

            {/* --- VISIT SCHEDULING MODAL --- */}
            {showVisitModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                            <h3 className="text-xl font-bold text-slate-900">Schedule a Visit</h3>
                            <button onClick={() => { setShowVisitModal(false); setVisitDate(''); }} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-full transition">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="p-6">
                            <p className="text-sm text-slate-600 mb-4">Select a date to visit <span className="font-bold text-slate-900">{property.title}</span>. The landlord will receive your request.</p>
                            <form onSubmit={handleScheduleVisit}>
                                <div className="mb-6">
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Preferred Visit Date</label>
                                    <input
                                        type="date"
                                        min={getTodayString()}
                                        value={visitDate}
                                        onChange={(e) => setVisitDate(e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                                        required
                                        disabled={isSubmitting}
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <button type="button" onClick={() => { setShowVisitModal(false); setVisitDate(''); }} disabled={isSubmitting} className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition">
                                        Cancel
                                    </button>
                                    <button type="submit" disabled={isSubmitting || !visitDate} className="flex-1 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition shadow-md flex justify-center items-center disabled:opacity-70">
                                        {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : 'Send Request'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* --- NEW: APPLY MODAL --- */}
            {showApplyModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-blue-50">
                            <h3 className="text-xl font-bold text-blue-900">Apply for Property</h3>
                            <button onClick={() => { setShowApplyModal(false); setApplyMessage(''); }} className="p-2 text-blue-400 hover:text-blue-700 hover:bg-blue-100 rounded-full transition">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="p-6">
                            <p className="text-sm text-slate-600 mb-4">
                                You are applying for <span className="font-bold text-slate-900">{property.title}</span>. The landlord will review your profile before making a decision.
                            </p>
                            <form onSubmit={handleApplyForProperty}>
                                <div className="mb-6">
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Message to Landlord <span className="text-slate-400 font-normal">(Optional)</span></label>
                                    <textarea
                                        rows="4"
                                        placeholder="Hi, I am very interested in this property because..."
                                        value={applyMessage}
                                        onChange={(e) => setApplyMessage(e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none"
                                        disabled={isApplying}
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <button type="button" onClick={() => { setShowApplyModal(false); setApplyMessage(''); }} disabled={isApplying} className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition">
                                        Cancel
                                    </button>
                                    <button type="submit" disabled={isApplying} className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-md flex justify-center items-center disabled:opacity-70">
                                        {isApplying ? <Loader2 size={20} className="animate-spin" /> : 'Submit Application'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default PropertyDetails;