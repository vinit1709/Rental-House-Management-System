import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, MapPin, IndianRupee, Info, List, CheckCircle, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import { DashboardHeader } from '../../components/DashboardSharedUI';
import AxiosInstance from '../../api/axiosInstance';
import LocationMapSelector from '../../components/Property/LocationMapSelector';
import toast from 'react-hot-toast';

const AddProperty = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  // --- AI States ---
  const [isAILoading, setIsAILoading] = useState(false);
  const [aiFeedback, setAiFeedback] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'apartment',
    bhk: '',
    sqft: '',
    furnishing: 'unfurnished',
    rent: '',
    deposit: '',
    availableFrom: '',
    address: {
      street: '',
      city: '',
      state: '',
      country: 'India',
      pincode: '',
      lat: 0,
      lng: 0
    },
    amenities: []
  });

  const amenityOptions = [
    "WiFi", "Parking", "Gym", "Swimming Pool",
    "Security", "Power Backup", "Lift", "AC", "Gas Pipeline"
  ];

  const getTodayString = () => new Date().toISOString().split('T')[0];

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: null }));
    }

    if (name === 'street') {
      setFormData(prev => ({
        ...prev,
        address: { ...prev.address, street: value }
      }));
    } else if (name === 'rent') {
      // FIX: Auto-calculate deposit as 3x the rent when user types manually!
      const numericRent = Number(value);
      setFormData(prev => ({
        ...prev,
        rent: value,
        deposit: numericRent > 0 ? (numericRent * 3).toString() : ''
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleLocationChange = (mapData) => {
    setFormData(prev => ({
      ...prev,
      address: { ...prev.address, ...mapData }
    }));

    setValidationErrors(prev => ({
      ...prev,
      city: mapData.city ? null : prev.city,
      state: mapData.state ? null : prev.state,
      pincode: mapData.pincode ? null : prev.pincode,
    }));
  };

  const handleAmenityToggle = (amenity) => {
    setFormData(prev => {
      const isSelected = prev.amenities.includes(amenity);
      return {
        ...prev,
        amenities: isSelected
          ? prev.amenities.filter(a => a !== amenity)
          : [...prev.amenities, amenity]
      };
    });
  };

  // --- AI RENT ESTIMATOR ---
  const handleGetAISuggestion = async () => {
    if (!formData.address.city || !formData.type) {
      toast.error("Please fill in the Property Type and City first so the AI can analyze the market!");
      return;
    }

    try {
      setIsAILoading(true);
      setAiFeedback(null);

      const locationString = `${formData.address.street}, ${formData.address.city}, ${formData.address.pincode}`.replace(/^, | ,/g, '').trim();

      const response = await AxiosInstance.post('/ai/rent-price', {
        propertyType: formData.type,
        bhk: formData.bhk ? `${formData.bhk} BHK` : 'Not specified',
        location: locationString,
        furnishing: formData.furnishing,
        size: formData.sqft
      });

      const aiData = response.data.data;
      const recommendedRent = aiData.recommendedRent;

      // FIX: Auto-fill the rent input AND calculate the 3x deposit!
      setFormData(prev => ({
        ...prev,
        rent: recommendedRent,
        deposit: recommendedRent ? (recommendedRent * 3).toString() : ''
      }));

      setAiFeedback({
        text: aiData.explanation,
        range: `Estimated Range: ₹${aiData.minRent.toLocaleString('en-IN')} - ₹${aiData.maxRent.toLocaleString('en-IN')}`
      });

      toast.success("AI Rent Suggestion applied!");

    } catch (error) {
      console.error("AI Error:", error);
      toast.error("Failed to get AI suggestion. Check your API Gateway connection.");
    } finally {
      setIsAILoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    if (formData.title.trim().length < 5) errors.title = "Title must be at least 5 characters.";
    if (formData.description.trim().length < 10) errors.description = "Please provide a more detailed description.";
    if (!formData.bhk || formData.bhk <= 0) errors.bhk = "Valid BHK number is required.";
    if (!formData.sqft || formData.sqft <= 0) errors.sqft = "Valid Sq.Ft area is required.";
    if (!formData.rent || formData.rent <= 0) errors.rent = "Rent must be greater than 0.";
    if (!formData.deposit || formData.deposit < 0) errors.deposit = "Deposit cannot be negative.";
    if (!formData.availableFrom) errors.availableFrom = "Available date is required.";

    if (!formData.address.street.trim()) errors.street = "Street address is required.";
    if (!formData.address.city.trim()) errors.city = "City is required.";
    if (!formData.address.state.trim()) errors.state = "State is required.";
    if (!formData.address.pincode.trim() || formData.address.pincode.length < 6) errors.pincode = "Valid Pincode is required.";

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);

    if (!validateForm()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    try {
      setIsLoading(true);

      const payload = {
        ...formData,
        bhk: Number(formData.bhk),
        sqft: Number(formData.sqft),
        rent: Number(formData.rent),
        deposit: Number(formData.deposit)
      };

      const response = await AxiosInstance.post('/properties', payload);

      if (response.status !== 201) {
        navigate('/landlord/properties');
      }

      const newPropertyId = response.data.property._id;
      navigate(`/landlord/edit-property/${newPropertyId}`, {
        state: { message: "Draft created successfully! Now upload your photos and verification documents." }
      });

    } catch (error) {
      console.error("Property creation error:", error);
      setApiError(error.response?.data?.message || "Failed to create property. Please try again.");
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-12 animate-in fade-in duration-300">
      <DashboardHeader
        title="Add New Property"
        subtitle="Fill in the details below to create a draft. You can upload photos on the next step."
      />

      {apiError && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8 rounded-r-lg flex items-center gap-3">
          <AlertCircle className="text-red-500" size={20} />
          <p className="text-red-700 font-medium">{apiError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">

        {/* --- 1. BASIC INFO --- */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
            <Info className="text-blue-600" size={20} />
            <h2 className="text-lg font-bold text-slate-800">Basic Information</h2>
          </div>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Property Title <span className="text-red-500">*</span></label>
              <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="e.g. Beautiful 2BHK Apartment in City Center" className={`w-full px-4 py-2.5 rounded-lg border ${validationErrors.title ? 'border-red-500 bg-red-50' : 'border-slate-300'} focus:ring-2 focus:ring-blue-500 outline-none transition`} />
              {validationErrors.title && <p className="text-red-500 text-xs mt-1 font-medium">{validationErrors.title}</p>}
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Description <span className="text-red-500">*</span></label>
              <textarea name="description" value={formData.description} onChange={handleChange} rows="4" placeholder="Highlight the key features of your property..." className={`w-full px-4 py-2.5 rounded-lg border ${validationErrors.description ? 'border-red-500 bg-red-50' : 'border-slate-300'} focus:ring-2 focus:ring-blue-500 outline-none transition`}></textarea>
              {validationErrors.description && <p className="text-red-500 text-xs mt-1 font-medium">{validationErrors.description}</p>}
            </div>
          </div>
        </div>

        {/* --- 2. SPECIFICATIONS --- */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
            <Home className="text-blue-600" size={20} />
            <h2 className="text-lg font-bold text-slate-800">Specifications</h2>
          </div>
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Property Type</label>
                <select name="type" value={formData.type} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none transition bg-white">
                  <option value="apartment">Apartment</option>
                  <option value="house">House</option>
                  <option value="villa">Villa</option>
                  <option value="pg">PG / Co-living</option>
                  <option value="studio">Studio</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Furnishing</label>
                <select name="furnishing" value={formData.furnishing} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none transition bg-white">
                  <option value="unfurnished">Unfurnished</option>
                  <option value="semi">Semi-Furnished</option>
                  <option value="fully">Fully Furnished</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">BHK <span className="text-red-500">*</span></label>
                <input type="number" name="bhk" value={formData.bhk} onChange={handleChange} placeholder="e.g. 2" className={`w-full px-4 py-2.5 rounded-lg border ${validationErrors.bhk ? 'border-red-500' : 'border-slate-300'} focus:ring-2 focus:ring-blue-500 outline-none transition`} />
                {validationErrors.bhk && <p className="text-red-500 text-xs mt-1 font-medium">{validationErrors.bhk}</p>}
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Sq. Ft Area <span className="text-red-500">*</span></label>
                <input type="number" name="sqft" value={formData.sqft} onChange={handleChange} placeholder="e.g. 1200" className={`w-full px-4 py-2.5 rounded-lg border ${validationErrors.sqft ? 'border-red-500' : 'border-slate-300'} focus:ring-2 focus:ring-blue-500 outline-none transition`} />
                {validationErrors.sqft && <p className="text-red-500 text-xs mt-1 font-medium">{validationErrors.sqft}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* --- 3. FINANCIALS WITH AI MAGIC --- */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-400/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100 relative z-10">
            <div className="flex items-center gap-2">
              <IndianRupee className="text-blue-600" size={20} />
              <h2 className="text-lg font-bold text-slate-800">Financials</h2>
            </div>

            {/* --- AI BUTTON --- */}
            <button
              type="button"
              onClick={handleGetAISuggestion}
              disabled={isAILoading}
              className="flex items-center gap-2 px-4 py-2 text-sm font-extrabold text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-lg shadow-md transition disabled:opacity-70"
            >
              {isAILoading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
              {isAILoading ? 'Analyzing Market...' : 'Get AI Rent Estimate'}
            </button>
          </div>

          <div className="space-y-5 relative z-10">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Monthly Rent <span className="text-red-500">*</span></label>
                <input type="number" name="rent" value={formData.rent} onChange={handleChange} placeholder="e.g. 15000" className={`w-full px-4 py-2.5 rounded-lg border ${validationErrors.rent ? 'border-red-500' : 'border-slate-300'} focus:ring-2 focus:ring-blue-500 outline-none transition`} />
                {validationErrors.rent && <p className="text-red-500 text-xs mt-1 font-medium">{validationErrors.rent}</p>}
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Security Deposit <span className="text-red-500">*</span></label>
                <input type="number" name="deposit" value={formData.deposit} onChange={handleChange} placeholder="e.g. 45000" className={`w-full px-4 py-2.5 rounded-lg border ${validationErrors.deposit ? 'border-red-500' : 'border-slate-300'} focus:ring-2 focus:ring-blue-500 outline-none transition`} />
                {validationErrors.deposit && <p className="text-red-500 text-xs mt-1 font-medium">{validationErrors.deposit}</p>}
              </div>
            </div>

            {/* --- AI FEEDBACK DISPLAY --- */}
            {aiFeedback && (
              <div className="mt-4 p-4 bg-purple-50 border border-purple-100 rounded-xl animate-in fade-in slide-in-from-top-2">
                <div className="flex items-start gap-3">
                  <Sparkles className="text-purple-600 mt-1 flex-shrink-0" size={18} />
                  <div>
                    <p className="text-sm font-bold text-purple-900">{aiFeedback.range}</p>
                    <p className="text-sm text-purple-700 mt-1 leading-relaxed">{aiFeedback.text}</p>
                    {/* FIX: New clear note added right below the explanation */}
                    <p className="inline-block mt-3 px-3 py-1.5 bg-purple-100 text-purple-800 text-xs font-bold rounded-md">
                      💡 Note: The Monthly Rent has been auto-filled, and the Security Deposit is automatically set to 3 months' rent.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1 mt-4">Available From <span className="text-red-500">*</span></label>
              <input type="date" name="availableFrom" value={formData.availableFrom} onChange={handleChange} min={getTodayString()} className={`w-full px-4 py-2.5 rounded-lg border ${validationErrors.availableFrom ? 'border-red-500' : 'border-slate-300'} focus:ring-2 focus:ring-blue-500 outline-none transition`} />
              {validationErrors.availableFrom && <p className="text-red-500 text-xs mt-1 font-medium">{validationErrors.availableFrom}</p>}
            </div>
          </div>
        </div>

        {/* --- 4. LOCATION WITH MAP --- */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
            <MapPin className="text-blue-600" size={20} />
            <h2 className="text-lg font-bold text-slate-800">Location Details</h2>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Street Address / Society Name <span className="text-red-500">*</span></label>
              <input type="text" name="street" value={formData.address.street} onChange={handleChange} placeholder="e.g. A-402, Royal Palms Society" className={`w-full px-4 py-2.5 rounded-lg border ${validationErrors.street ? 'border-red-500' : 'border-slate-300'} focus:ring-2 focus:ring-blue-500 outline-none transition`} />
              {validationErrors.street && <p className="text-red-500 text-xs mt-1 font-medium">{validationErrors.street}</p>}
            </div>

            <LocationMapSelector
              onLocationChange={handleLocationChange}
              validationErrors={validationErrors}
            />
          </div>
        </div>

        {/* --- 5. AMENITIES --- */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
            <List className="text-blue-600" size={20} />
            <h2 className="text-lg font-bold text-slate-800">Amenities</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            {amenityOptions.map((amenity) => {
              const isSelected = formData.amenities.includes(amenity);
              return (
                <button
                  key={amenity}
                  type="button"
                  onClick={() => handleAmenityToggle(amenity)}
                  className={`px-4 py-2 rounded-full text-sm font-bold border transition-all duration-200 flex items-center gap-2 ${isSelected ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300 hover:bg-slate-50'}`}
                >
                  {isSelected && <CheckCircle size={14} className="text-blue-600" />}
                  {amenity}
                </button>
              );
            })}
          </div>
        </div>

        {/* --- SUBMIT ACTIONS --- */}
        <div className="flex justify-end gap-4 pt-4 border-t border-slate-200">
          <button type="button" onClick={() => navigate('/landlord/properties')} className="px-6 py-3 rounded-lg font-bold text-slate-600 hover:bg-slate-100 transition" disabled={isLoading}>
            Cancel
          </button>
          <button type="submit" disabled={isLoading} className="flex items-center gap-2 bg-slate-900 text-white px-8 py-3 rounded-lg font-bold hover:bg-slate-800 transition shadow-lg disabled:opacity-70">
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : null}
            {isLoading ? 'Creating...' : 'Save & Continue'}
          </button>
        </div>

      </form>
    </div>
  );
};

export default AddProperty;