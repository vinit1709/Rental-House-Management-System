import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, MapPin, Edit, Eye, Trash2, Home, AlertCircle } from 'lucide-react';
import { DashboardHeader } from '../../components/DashboardSharedUI'; // Adjust path if needed
import AxiosInstance from '../../api/axiosInstance';

const LandlordProperties = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // 1. Fetch Properties from Backend
  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setIsLoading(true);
      // Calls the exact route we built in property.router.js
      const response = await AxiosInstance.get('/properties/my/listings');
      console.log(response);
      setProperties(response.data.properties || []);
    } catch (err) {
      console.error("Error fetching properties:", err);
      setError("Failed to load properties. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Delete Property Handler
  const handleDelete = async (propertyId, propertyTitle) => {
    if (window.confirm(`Are you sure you want to delete "${propertyTitle}"? This cannot be undone.`)) {
      try {
        await AxiosInstance.delete(`/properties/${propertyId}`);
        // Remove the deleted property from the state so the UI updates instantly
        setProperties(properties.filter(p => p._id !== propertyId));
      } catch (err) {
        console.error("Error deleting property:", err);
        alert("Failed to delete property.");
      }
    }
  };

  // 3. Helper function for Status Badges
  const getStatusBadge = (status) => {
    const styles = {
      draft: "bg-slate-100 text-slate-700 border-slate-200",
      pending: "bg-amber-100 text-amber-700 border-amber-200",
      available: "bg-green-100 text-green-700 border-green-200",
      rented: "bg-blue-100 text-blue-700 border-blue-200",
      rejected: "bg-red-100 text-red-700 border-red-200"
    };

    return (
      <span className={`px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-full border ${styles[status] || styles.draft}`}>
        {status}
      </span>
    );
  };

  // --- Add Property Button ---
  const AddPropertyButton = (
    <button
      onClick={() => navigate('/landlord/add-property')}
      className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg font-bold hover:bg-blue-700 transition shadow-sm hover:shadow-md"
    >
      <Plus size={20} /> Add Property
    </button>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">

      {/* HEADER */}
      <DashboardHeader
        title="My Properties"
        subtitle="Manage your listings, track availability, and update details."
        action={AddPropertyButton}
      />

      {/* ERROR STATE */}
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-2 border border-red-100">
          <AlertCircle size={20} /> {error}
        </div>
      )}

      {/* LOADING STATE */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      ) : properties.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Home size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">No Properties Found</h3>
          <p className="text-slate-500 max-w-md mx-auto mb-6">
            You haven't listed any properties yet. Click the button below to add your first rental property.
          </p>
          {AddPropertyButton}
        </div>

      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <div key={property._id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition group flex flex-col">

              {/* Property Image Placeholder (Uses first photo if available) */}
              <div className="h-48 bg-slate-100 relative overflow-hidden">
                {property.photos && property.photos.length > 0 ? (
                  <img
                    src={property.photos[0]}
                    alt={property.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                    <Home size={40} className="mb-2 opacity-20" />
                    <span className="text-sm font-medium">No Image</span>
                  </div>
                )}
                <div className="absolute top-3 right-3">
                  {getStatusBadge(property.status)}
                </div>
              </div>

              {/* Property Details */}
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg text-slate-900 line-clamp-1">{property.title}</h3>
                </div>

                <div className="flex items-center gap-1.5 text-slate-500 text-sm mb-4">
                  <MapPin size={16} className="flex-shrink-0" />
                  <span className="line-clamp-1">{`${property.address.street}, ${property.address.city}`}</span>
                </div>

                <div className="flex items-center gap-4 text-sm text-slate-600 mb-6 bg-slate-50 p-3 rounded-lg">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-400 uppercase">Rent</span>
                    <span className="font-bold text-slate-900">₹{property.rent?.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="w-px h-8 bg-slate-200"></div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-400 uppercase">Type</span>
                    <span className="font-medium capitalize">{property.type}</span>
                  </div>
                  <div className="w-px h-8 bg-slate-200"></div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-400 uppercase">Config</span>
                    <span className="font-medium">{property.bhk} BHK</span>
                  </div>
                  <div className="w-px h-8 bg-slate-200"></div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-400 uppercase">SQFT</span>
                    <span className="font-medium">{property.sqft} SQFT</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-auto grid grid-cols-3 gap-2 border-t border-slate-100 pt-4">
                  <button
                    onClick={() => navigate(`/property/${property._id}`)}
                    className="flex flex-col items-center justify-center gap-1 p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                  >
                    <Eye size={18} />
                    <span className="text-[10px] font-bold uppercase">View</span>
                  </button>
                  <button
                    onClick={() => {
                      if (property.status === 'draft' || property.status === 'rejected') {
                        navigate(`/landlord/edit-property/${property._id}`);
                      } else {
                        alert("This property is currently under verification or active and cannot be edited.");
                      }
                    }}
                    className={`flex flex-col items-center justify-center gap-1 p-2 rounded-lg transition ${property.status === 'draft' || property.status === 'rejected'
                      ? 'text-slate-500 hover:text-emerald-600 hover:bg-emerald-50'
                      : 'text-slate-300 cursor-not-allowed'
                      }`}
                  >
                    <Edit size={18} />
                    <span className="text-[10px] font-bold uppercase">Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(property._id, property.title)}
                    className="flex flex-col items-center justify-center gap-1 p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 size={18} />
                    <span className="text-[10px] font-bold uppercase">Delete</span>
                  </button>
                </div>

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LandlordProperties;