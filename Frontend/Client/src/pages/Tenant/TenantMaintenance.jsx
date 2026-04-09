import React, { useState, useEffect } from 'react';
import {
    Wrench, Plus, Clock, CheckCircle, AlertCircle,
    X, Loader2, Calendar, Send, Home, User, ImagePlus
} from 'lucide-react';
import { DashboardHeader } from '../../components/DashboardSharedUI';
import AxiosInstance from '../../api/axiosInstance';

const TenantMaintenance = () => {
    const [requests, setRequests] = useState([]);
    const [activeLease, setActiveLease] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [showForm, setShowForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form Data
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'general',
        priority: 'medium'
    });

    // Image Upload State
    const [selectedImages, setSelectedImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const [requestsRes, leaseRes] = await Promise.all([
                    AxiosInstance.get('/maintenance/my/requests'),
                    AxiosInstance.get('/leases').catch(() => ({ data: { leases: [] } }))
                ]);

                setRequests(requestsRes.data.requests || []);
                const currentLease = (leaseRes.data.leases || []).find(l => l.status === 'active');
                setActiveLease(currentLease || null);
            } catch (err) {
                console.error("Error fetching data:", err);
                setError("Failed to load your maintenance requests.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    // --- HANDLE IMAGE SELECTION ---
    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);

        if (selectedImages.length + files.length > 3) {
            setError("You can only upload a maximum of 3 images.");
            return;
        }

        setSelectedImages([...selectedImages, ...files]);
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setImagePreviews([...imagePreviews, ...newPreviews]);
    };

    const removeImage = (index) => {
        const updatedImages = selectedImages.filter((_, i) => i !== index);
        const updatedPreviews = imagePreviews.filter((_, i) => i !== index);
        setSelectedImages(updatedImages);
        setImagePreviews(updatedPreviews);
    };

    // --- HANDLE FORM SUBMIT WITH IMAGES ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!activeLease) return;

        try {
            setIsSubmitting(true);
            setError(null);

            const submitData = new FormData();
            submitData.append('title', formData.title);
            submitData.append('description', formData.description);
            submitData.append('category', formData.category);
            submitData.append('priority', formData.priority);
            submitData.append('landlordId', activeLease.landlordId._id || activeLease.landlordId);
            submitData.append('propertyId', activeLease.propertyId._id || activeLease.propertyId);

            selectedImages.forEach(image => {
                submitData.append('images', image);
            });

            const response = await AxiosInstance.post('/maintenance', submitData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setRequests([response.data.request, ...requests]);
            setFormData({ title: '', description: '', category: 'general', priority: 'medium' });
            setSelectedImages([]);
            setImagePreviews([]);
            setShowForm(false);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to submit request.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- UI HELPERS ---
    const getPriorityBadge = (priority) => {
        const styles = {
            urgent: "bg-red-100 text-red-800 border-red-300",
            high: "bg-orange-100 text-orange-800 border-orange-300",
            medium: "bg-blue-100 text-blue-800 border-blue-300",
            low: "bg-slate-100 text-slate-800 border-slate-300"
        };
        return <span className={`px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider rounded-md border ${styles[priority] || styles.low}`}>{priority} Priority</span>;
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'resolved': return <span className="flex items-center justify-center gap-1.5 text-green-700 bg-green-50 px-3 py-1.5 rounded-lg font-bold text-sm border border-green-200"><CheckCircle size={16} /> Resolved</span>;
            case 'in-progress': return <span className="flex items-center justify-center gap-1.5 text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg font-bold text-sm border border-blue-200"><Wrench size={16} /> In Progress</span>;
            case 'cancelled': return <span className="flex items-center justify-center gap-1.5 text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg font-bold text-sm border border-slate-200"><X size={16} /> Cancelled</span>;
            default: return <span className="flex items-center justify-center gap-1.5 text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg font-bold text-sm border border-amber-200"><Clock size={16} /> Pending</span>;
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-300">

            <DashboardHeader
                title="Maintenance & Repairs"
                subtitle="Report issues and track the status of your maintenance requests."
                action={
                    <button
                        onClick={() => setShowForm(!showForm)}
                        disabled={!activeLease}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold transition shadow-sm ${showForm
                            ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed'
                            }`}
                    >
                        {showForm ? <X size={20} /> : <Plus size={20} />}
                        {showForm ? 'Cancel' : 'New Request'}
                    </button>
                }
            />

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-2 border border-red-100">
                    <AlertCircle size={20} /> {error}
                </div>
            )}

            {/* --- NEW REQUEST FORM --- */}
            {showForm && activeLease && (
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-8 animate-in slide-in-from-top-4 fade-in duration-300">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <Wrench className="text-blue-600" size={20} /> Report an Issue
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-5">

                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex items-center gap-2 text-sm text-slate-600 font-medium">
                            <Home size={16} className="text-slate-400" /> Requesting for: <span className="text-slate-900 font-bold">{activeLease.propertyId?.title || 'Your Home'}</span>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Issue Title</label>
                            <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="e.g. Leaking pipe under kitchen sink" className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none transition" required />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Category</label>
                                <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none transition bg-white">
                                    <option value="general">General Maintenance</option>
                                    <option value="plumbing">Plumbing</option>
                                    <option value="electrical">Electrical</option>
                                    <option value="appliance">Appliance Repair</option>
                                    <option value="hvac">Heating/Cooling (HVAC)</option>
                                    <option value="exterior">Exterior/Roofing</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Priority Level</label>
                                <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none transition bg-white">
                                    <option value="low">Low (Routine maintenance)</option>
                                    <option value="medium">Medium (Needs attention soon)</option>
                                    <option value="high">High (Urgent issue)</option>
                                    <option value="urgent">Urgent (Emergency/Safety risk)</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Detailed Description</label>
                            <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Where exactly is the issue? When did it start?" rows="3" className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none transition resize-none" required></textarea>
                        </div>

                        {/* --- IMAGE UPLOAD SECTION --- */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Upload Photos (Max 3)</label>

                            <div className="flex flex-wrap gap-4">
                                {imagePreviews.map((src, index) => (
                                    <div key={index} className="relative w-24 h-24 rounded-lg overflow-hidden border border-slate-200 shadow-sm group">
                                        <img src={src} alt="Preview" className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition shadow-sm"
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                ))}

                                {selectedImages.length < 3 && (
                                    <label className="w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 hover:border-blue-500 transition text-slate-500 hover:text-blue-600">
                                        <ImagePlus size={24} className="mb-1" />
                                        <span className="text-xs font-bold">Add Photo</span>
                                        <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageChange} />
                                    </label>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end pt-4 border-t border-slate-100">
                            <button type="submit" disabled={isSubmitting} className="bg-slate-900 text-white px-8 py-3 rounded-lg font-bold hover:bg-slate-800 transition shadow-md flex items-center gap-2 disabled:opacity-70">
                                {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                                Submit Request
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* --- REQUESTS LIST WITH IMAGES AND VENDOR INFO --- */}
            {isLoading ? (
                <div className="flex justify-center items-center h-48"><Loader2 className="animate-spin text-blue-600" size={40} /></div>
            ) : requests.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
                    <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle size={32} /></div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">No Maintenance Issues</h3>
                    <p className="text-slate-500 max-w-md mx-auto">You haven't reported any issues yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {requests.map((request) => (
                        <div key={request._id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col md:flex-row gap-6 hover:shadow-md transition relative overflow-hidden">
                            <div className={`absolute left-0 top-0 bottom-0 w-1 ${request.status === 'resolved' ? 'bg-green-500' : request.status === 'in-progress' ? 'bg-blue-500' : 'bg-amber-500'}`}></div>

                            <div className="flex-shrink-0 flex flex-row md:flex-col items-start gap-3 md:w-36 border-b md:border-b-0 md:border-r border-slate-100 pb-4 md:pb-0 md:pr-4">
                                <div className="w-full">{getStatusBadge(request.status)}</div>
                                {getPriorityBadge(request.priority)}
                            </div>

                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="text-lg font-bold text-slate-900">{request.title}</h3>
                                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold uppercase tracking-wider">{request.category}</span>
                                </div>
                                <p className="text-slate-600 text-sm mb-4 leading-relaxed">{request.description}</p>

                                {/* DISPLAY ATTACHED IMAGES */}
                                {request.images && request.images.length > 0 && (
                                    <div className="flex gap-3 mb-4">
                                        {request.images.map((imgUrl, i) => (
                                            <a key={i} href={imgUrl} target="_blank" rel="noreferrer" className="block w-16 h-16 rounded-lg overflow-hidden border border-slate-200 hover:ring-2 hover:ring-blue-500 transition">
                                                <img src={imgUrl} alt="Issue" className="w-full h-full object-cover" />
                                            </a>
                                        ))}
                                    </div>
                                )}

                                <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                    <span className="flex items-center gap-1"><Calendar size={14} /> Reported: {new Date(request.createdAt).toLocaleDateString('en-IN')}</span>
                                    <span>ID: #{request._id.slice(-6).toUpperCase()}</span>
                                </div>
                            </div>

                            {/* --- NEW: DISPLAY VENDOR INFO IF ASSIGNED --- */}
                            {request.status === 'in-progress' && request.assignedVendor?.name && (
                                <div className="md:w-64 bg-blue-50 p-4 rounded-xl border border-blue-100 flex flex-col justify-center mt-4 md:mt-0">
                                    <p className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-2 flex items-center gap-1"><Wrench size={12} /> Technician Assigned</p>
                                    <p className="font-bold text-blue-900">{request.assignedVendor.name}</p>
                                    <p className="text-xs text-blue-700 flex items-center gap-1 mt-1"><User size={12} /> {request.assignedVendor.contact || 'No contact provided'}</p>

                                    {request.scheduledDate && (
                                        <div className="mt-3 pt-3 border-t border-blue-200/50">
                                            <p className="text-[10px] font-bold text-blue-500 uppercase">Scheduled For</p>
                                            <p className="text-sm font-bold text-blue-800">{new Date(request.scheduledDate).toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
                                        </div>
                                    )}
                                </div>
                            )}

                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TenantMaintenance;