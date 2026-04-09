import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Hero from '../components/Home/Hero';
import PropertyCard from '../components/Home/PropertyCard';
import StatsSection from '../components/Home/StatsSection';
import { ArrowRight, Loader2 } from 'lucide-react';
import AxiosInstance from '../api/axiosInstance'; // Make sure this path is correct

export default function Home() {
  const [properties, setProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeaturedProperties = async () => {
      try {
        setIsLoading(true);
        // Using the exact public route from your router: GET /properties
        const response = await AxiosInstance.get('/properties');
        console.log(response.data);

        // Grab only the first 3 properties for the featured section
        const liveProperties = response.data.properties?.slice(0, 3) || [];

        // Map backend schema to match your PropertyCard props
        const mappedProperties = liveProperties.map(p => ({
          id: p._id,
          title: p.title,
          location: `${p.address?.city || 'Unknown'}, ${p.address?.state || 'India'}`,
          price: p.rent,
          beds: p.bhk,
          baths: p.bhk, // Assuming 1 bath per BHK if not in schema
          sqft: p.sqft || 1000, // Fallback if not in schema
          type: p.type,
          isVerified: p.verificationDocuments?.length > 0,
          image: p.photos?.[0] || "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=400"
        }));

        setProperties(mappedProperties);
      } catch (error) {
        console.error("Error fetching featured properties:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeaturedProperties();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">

      {/* 1. Hero & Search */}
      <Hero />

      {/* 2. Featured Properties Section */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Featured Properties</h2>
            <p className="text-gray-500 mt-2">Handpicked verified listings for you</p>
          </div>
          <button
            onClick={() => navigate('/explore')}
            className="hidden md:flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-800 transition"
          >
            View All <ArrowRight size={20} />
          </button>
        </div>

        {/* The Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="animate-spin text-blue-600" size={40} />
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No properties available right now.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {properties.map((property) => (
              <PropertyCard key={property.id} data={property} />
            ))}
          </div>
        )}

        {/* Mobile View All Button */}
        <button
          onClick={() => navigate('/explore')}
          className="w-full md:hidden mt-8 py-3 border border-gray-300 rounded-lg text-gray-700 font-semibold"
        >
          View All Properties
        </button>
      </section>

      {/* 3. Trust Stats */}
      <StatsSection />
    </div>
  );
}