import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
    Home, Image as ImageIcon, FileText, CheckCircle, AlertCircle,
    Trash2, UploadCloud, Loader2, Send, X
} from 'lucide-react';
import { DashboardHeader } from '../../components/DashboardSharedUI';
import AxiosInstance from '../../api/axiosInstance';

const EditProperty = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    // --- STATE ---
    const [activeTab, setActiveTab] = useState('details');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState(location.state?.message || null);
    const [error, setError] = useState(null);

    const [property, setProperty] = useState(null);

    const [formData, setFormData] = useState({
        title: '', description: '', type: '', bhk: '', furnishing: '',
        rent: '', deposit: '', availableFrom: '',
        address: { street: '', city: '', state: '', pincode: '' }
    });

    // Photo Upload State (Staging Area)
    const [selectedPhotos, setSelectedPhotos] = useState([]);
    const [photoPreviews, setPhotoPreviews] = useState([]);

    // Document Upload State
    const [docType, setDocType] = useState('lightbill');
    const [docFile, setDocFile] = useState(null);

    // --- 1. FETCH DATA ---
    useEffect(() => {
        const fetchProperty = async () => {
            try {
                setIsLoading(true);
                const response = await AxiosInstance.get(`/properties/${id}`);
                const data = response.data.property;

                setProperty(data);
                setFormData({
                    title: data.title, description: data.description, type: data.type,
                    bhk: data.bhk, furnishing: data.furnishing, rent: data.rent,
                    deposit: data.deposit, availableFrom: data.availableFrom ? data.availableFrom.split('T')[0] : '',
                    address: data.address || { street: '', city: '', state: '', pincode: '' }
                });
            } catch (err) {
                setError("Failed to load property details.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchProperty();
    }, [id]);

    const isEditable = property?.status === 'draft' || property?.status === 'rejected';

    // --- 2. DETAILS HANDLER (With Auto-Redirect) ---
    const handleUpdateDetails = async (e) => {
        e.preventDefault();
        try {
            setIsSaving(true);
            setError(null);
            setMessage(null);

            const payload = { ...formData, bhk: Number(formData.bhk), rent: Number(formData.rent), deposit: Number(formData.deposit) };
            const res = await AxiosInstance.put(`/properties/${id}`, payload);

            setProperty(res.data.property);
            setMessage("Property details updated successfully!");

            // Auto redirect to Photos tab after 1 second
            setTimeout(() => {
                setMessage(null);
                setActiveTab('photos');
            }, 1000);

        } catch (err) {
            setError(err.response?.data?.message || "Failed to update details.");
        } finally {
            setIsSaving(false);
        }
    };

    // --- 3. FRONTEND PREVIEW HANDLERS (Cover & Remove) ---
    const handlePhotoSelect = (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;

        const totalAllowed = 10 - (property?.photos?.length || 0);
        if (selectedPhotos.length + files.length > totalAllowed) {
            alert(`You can only upload ${totalAllowed} more photos.`);
            return;
        }

        const newSelected = [...selectedPhotos, ...files];
        setSelectedPhotos(newSelected);
        setPhotoPreviews(newSelected.map(file => URL.createObjectURL(file)));

        // Reset file input so you can select the same file again if needed
        e.target.value = '';
    };

    const handleRemovePreview = (indexToRemove) => {
        setSelectedPhotos(prev => prev.filter((_, i) => i !== indexToRemove));
        setPhotoPreviews(prev => prev.filter((_, i) => i !== indexToRemove));
    };

    const handleSetPreviewCover = (indexToCover) => {
        if (indexToCover === 0) return; // It's already the cover

        // Move selected index to the front of the arrays
        setSelectedPhotos(prev => {
            const newArr = [...prev];
            const [item] = newArr.splice(indexToCover, 1);
            newArr.unshift(item);
            return newArr;
        });

        setPhotoPreviews(prev => {
            const newArr = [...prev];
            const [item] = newArr.splice(indexToCover, 1);
            newArr.unshift(item);
            return newArr;
        });
    };

    const clearSelectedPhotos = () => {
        setSelectedPhotos([]);
        setPhotoPreviews([]);
    };

    // --- 4. PHOTO UPLOAD (With Auto-Redirect) ---
    const handlePhotoUpload = async () => {
        if (!selectedPhotos.length) return;

        const uploadData = new FormData();
        // Since we re-ordered selectedPhotos, index 0 is uploaded first as the cover!
        selectedPhotos.forEach(file => uploadData.append('photos', file));

        try {
            setIsSaving(true);
            setError(null);
            setMessage(null);

            const res = await AxiosInstance.post(`/properties/${id}/photos`, uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setProperty(res.data.property);
            clearSelectedPhotos();
            setMessage("Photos uploaded successfully!");

            // Auto redirect to Documents tab after 1 second
            setTimeout(() => {
                setMessage(null);
                setActiveTab('documents');
            }, 1000);

        } catch (err) {
            setError(err.response?.data?.message || "Failed to upload photos.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeletePhoto = async (photoUrl) => {
        if (!window.confirm("Delete this photo?")) return;
        try {
            const encodedUrl = encodeURIComponent(photoUrl);
            await AxiosInstance.delete(`/properties/${id}/photos/${encodedUrl}`);
            setProperty(prev => ({ ...prev, photos: prev.photos.filter(url => url !== photoUrl) }));
        } catch (err) {
            alert("Failed to delete photo.");
        }
    };

    // --- 5. DOCUMENT HANDLERS ---
    const handleDocumentUpload = async (e) => {
        e.preventDefault();
        if (!docFile) return alert("Please select a file.");

        const uploadData = new FormData();
        uploadData.append('document', docFile);
        uploadData.append('type', docType);

        try {
            setIsSaving(true);
            setError(null);
            setMessage(null);

            const res = await AxiosInstance.post(`/properties/${id}/documents`, uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setProperty(res.data.property);
            setDocFile(null);
            document.getElementById('doc-input').value = '';
            setMessage("Document uploaded successfully!");
        } catch (err) {
            setError(err.response?.data?.message || "Failed to upload document.");
        } finally {
            setIsSaving(false);
        }
    };

    // --- 6. SUBMIT VERIFICATION ---
    const handleSubmitProperty = async () => {
        try {
            setIsSaving(true);
            const res = await AxiosInstance.post(`/properties/${id}/submit`);
            setProperty(res.data.property);
            setMessage("Property submitted! Awaiting admin verification.");
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setTimeout(() => navigate('/landlord/properties'), 1500);
        } catch (err) {
            setError(err.response?.data?.message || "Ensure you have uploaded photos and documents.");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <div className="p-12 text-center text-blue-600 font-bold"><Loader2 className="animate-spin mx-auto mb-2" size={32} /> Loading...</div>;

    return (
        <div className="max-w-5xl mx-auto pb-12 animate-in fade-in duration-300">
            <DashboardHeader
                title={`Edit: ${property?.title || 'Property'}`}
                subtitle={`Status: ${property?.status.toUpperCase()} ${!isEditable ? '(Read-Only)' : ''}`}
            />

            {/* MESSAGES */}
            {message && <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 text-green-700 font-medium">{message}</div>}
            {error && <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 text-red-700 font-medium">{error}</div>}

            {/* TABS */}
            <div className="flex gap-2 border-b border-slate-200 mb-8 overflow-x-auto pb-2">
                <button onClick={() => setActiveTab('details')} className={`px-5 py-3 font-bold rounded-t-lg transition ${activeTab === 'details' ? 'bg-white text-blue-600 shadow-[0_4px_0_0_white]' : 'text-slate-500'}`}>Basic Details</button>
                <button onClick={() => setActiveTab('photos')} className={`px-5 py-3 font-bold rounded-t-lg transition ${activeTab === 'photos' ? 'bg-white text-blue-600 shadow-[0_4px_0_0_white]' : 'text-slate-500'}`}>Gallery ({property?.photos?.length || 0}/10)</button>
                <button onClick={() => setActiveTab('documents')} className={`px-5 py-3 font-bold rounded-t-lg transition ${activeTab === 'documents' ? 'bg-white text-blue-600 shadow-[0_4px_0_0_white]' : 'text-slate-500'}`}>Verification Docs</button>
            </div>

            {/* TAB 1: DETAILS */}
            {activeTab === 'details' && (
                <form onSubmit={handleUpdateDetails} className="bg-white p-6 rounded-xl shadow-sm space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="col-span-1 md:col-span-2">
                            <label className="block text-sm font-bold text-slate-700 mb-1">Title</label>
                            <input type="text" name="title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} disabled={!isEditable} className="w-full px-4 py-2 border rounded-lg bg-slate-50 focus:bg-white" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Rent (₹)</label>
                            <input type="number" name="rent" value={formData.rent} onChange={(e) => setFormData({ ...formData, rent: e.target.value })} disabled={!isEditable} className="w-full px-4 py-2 border rounded-lg bg-slate-50 focus:bg-white" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Deposit (₹)</label>
                            <input type="number" name="deposit" value={formData.deposit} onChange={(e) => setFormData({ ...formData, deposit: e.target.value })} disabled={!isEditable} className="w-full px-4 py-2 border rounded-lg bg-slate-50 focus:bg-white" />
                        </div>
                    </div>
                    {isEditable && (
                        <button type="submit" disabled={isSaving} className="bg-[#121212] text-white px-6 py-2.5 rounded-lg font-bold flex items-center gap-2">
                            {isSaving ? <Loader2 className="animate-spin" /> : 'Save Details'}
                        </button>
                    )}
                </form>
            )}

            {/* TAB 2: PHOTOS */}
            {activeTab === 'photos' && (
                <div className="bg-white p-6 rounded-xl shadow-sm space-y-6">

                    {/* Uploader Staging Area */}
                    {isEditable && (
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                            <label className="flex flex-col items-center justify-center border-2 border-dashed border-blue-300 bg-white rounded-lg p-8 cursor-pointer hover:bg-slate-50 transition">
                                <UploadCloud className="text-blue-500 mb-2" size={40} />
                                <span className="font-bold text-blue-900">Select Images to Upload</span>
                                <input type="file" multiple accept="image/*" onChange={handlePhotoSelect} className="hidden" />
                            </label>

                            {/* Local Previews BEFORE upload */}
                            {photoPreviews.length > 0 && (
                                <div className="mt-6">
                                    <div className="flex justify-between items-center mb-2">
                                        <p className="font-bold text-slate-800">Ready to upload ({photoPreviews.length})</p>
                                        <button onClick={clearSelectedPhotos} className="text-sm text-red-600 font-bold flex items-center gap-1"><X size={16} /> Clear Selection</button>
                                    </div>

                                    {/* Preview Grid with Cover and Remove Options */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                        {photoPreviews.map((url, i) => (
                                            <div key={i} className={`relative group rounded-lg overflow-hidden border-2 aspect-square ${i === 0 ? 'border-blue-500 shadow-md' : 'border-slate-300 bg-slate-100'}`}>
                                                <img src={url} alt="Preview" className="w-full h-full object-cover" />

                                                {/* Cover Badge */}
                                                {i === 0 && (
                                                    <div className="absolute top-2 left-2 bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg">
                                                        COVER
                                                    </div>
                                                )}

                                                {/* Hover Overlay for Actions */}
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center gap-2">
                                                    {i !== 0 && (
                                                        <button
                                                            onClick={() => handleSetPreviewCover(i)}
                                                            className="bg-white text-blue-600 px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-blue-50 transition shadow-sm"
                                                        >
                                                            Set as Cover
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleRemovePreview(i)}
                                                        className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 transition shadow-sm"
                                                        title="Remove from Preview"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <button onClick={handlePhotoUpload} disabled={isSaving} className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-bold flex justify-center items-center gap-2">
                                        {isSaving ? <Loader2 className="animate-spin" /> : `Upload ${photoPreviews.length} Photo(s) Now`}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Uploaded Gallery Grid */}
                    <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-2">Live Gallery</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {property?.photos?.map((url, idx) => (
                            <div key={idx} className="relative group rounded-lg overflow-hidden border border-slate-200 aspect-square bg-slate-100">
                                <img src={url} alt="Property" className="w-full h-full object-cover" />
                                {isEditable && (
                                    <button onClick={() => handleDeletePhoto(url)} className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition">
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* TAB 3: DOCUMENTS */}
            {activeTab === 'documents' && (
                <div className="bg-white p-6 rounded-xl shadow-sm space-y-6">
                    {isEditable && (
                        <form onSubmit={handleDocumentUpload} className="bg-slate-50 p-6 rounded-xl border border-slate-200 flex flex-col md:flex-row gap-4 items-end">
                            <div className="flex-1 w-full">
                                <label className="block text-sm font-bold text-slate-700 mb-1">Type</label>
                                <select value={docType} onChange={(e) => setDocType(e.target.value)} className="w-full px-4 py-2 border rounded-lg">
                                    <option value="lightbill">Electricity Bill</option>
                                    <option value="propertyTax">Property Tax</option>
                                    <option value="ownershipProof">Ownership Proof</option>
                                </select>
                            </div>
                            <div className="flex-1 w-full">
                                <label className="block text-sm font-bold text-slate-700 mb-1">Select PDF/JPG</label>
                                <input id="doc-input" type="file" onChange={(e) => setDocFile(e.target.files[0])} className="w-full px-4 py-1.5 border bg-white rounded-lg" />
                            </div>
                            <button type="submit" disabled={isSaving || !docFile} className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-bold flex items-center gap-2">
                                {isSaving ? <Loader2 className="animate-spin" /> : 'Upload'}
                            </button>
                        </form>
                    )}

                    <div className="space-y-3 mt-4">
                        {property?.verificationDocuments?.map((doc, idx) => (
                            <div key={idx} className="flex justify-between p-4 border rounded-lg hover:bg-slate-50">
                                <div className="flex items-center gap-3">
                                    <div className="bg-blue-100 text-blue-600 p-2 rounded-lg"><FileText size={20} /></div>
                                    <div>
                                        <p className="font-bold text-slate-800 capitalize">{doc.type}</p>
                                        <a href={doc.url} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline">View Uploaded Document</a>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* SUBMIT BUTTON */}
            {isEditable && (
                <div className="mt-8 bg-blue-50 border border-blue-200 p-6 rounded-xl flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div>
                        <h3 className="font-bold text-blue-900 text-lg">Ready to Publish?</h3>
                        <p className="text-blue-700 text-sm">Submit your listing to the admin team for verification.</p>
                    </div>
                    <button
                        onClick={handleSubmitProperty}
                        disabled={isSaving || !property?.photos?.length || !property?.verificationDocuments?.length}
                        className="flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto justify-center"
                    >
                        {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                        Submit for Verification
                    </button>
                </div>
            )}
        </div>
    );
};

export default EditProperty;