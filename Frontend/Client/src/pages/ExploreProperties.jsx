import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, Loader2, MapPin, Home } from 'lucide-react';
import PropertyCard from '../components/Home/PropertyCard'; // Reuse your card
import AxiosInstance from '../api/axiosInstance';

export default function ExploreProperties() {
    const [searchParams] = useSearchParams();

    const [properties, setProperties] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Filter States
    const [filters, setFilters] = useState({
        city: searchParams.get('city') || '',
        type: searchParams.get('type') || '',
        bhk: searchParams.get('bhk') || '',
        maxRent: searchParams.get('maxRent') || ''
    });

    // Fetch properties whenever filters change
    useEffect(() => {
        fetchProperties();
    }, [filters]);

    const fetchProperties = async () => {
        try {
            setIsLoading(true);

            // Convert state filters to URL query params
            // Example: /properties?city=Mumbai&bhk=2
            const queryParams = new URLSearchParams();
            if (filters.city) queryParams.append('city', filters.city);
            if (filters.type) queryParams.append('type', filters.type);
            if (filters.bhk) queryParams.append('bhk', filters.bhk);
            if (filters.maxRent) queryParams.append('maxRent', filters.maxRent);

            const response = await AxiosInstance.get(`/properties?${queryParams.toString()}`);

            const liveProperties = response.data.properties || [];

            // Map to PropertyCard format
            const mappedProperties = liveProperties.map(p => ({
                id: p._id,
                title: p.title,
                location: `${p.address?.city || ''}, ${p.address?.state || ''}`,
                price: p.rent,
                beds: p.bhk,
                baths: p.bhk,
                sqft: p.carpetArea || 1000,
                type: p.type,
                isVerified: p.verificationDocuments?.length > 0,
                image: p.photos?.[0] || "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=400"
            }));

            setProperties(mappedProperties);
        } catch (error) {
            console.error("Error fetching properties:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-24 pb-12 font-sans">
            <div className="max-w-7xl mx-auto px-4 flex flex-col lg:flex-row gap-8">

                {/* --- SIDEBAR FILTERS --- */}
                <aside className="lg:w-1/4">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 sticky top-24">
                        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Filter size={20} className="text-blue-600" /> Filter Search
                        </h3>

                        <div className="space-y-6">
                            {/* City Filter */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">City</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                    <input
                                        type="text"
                                        name="city"
                                        value={filters.city}
                                        onChange={handleFilterChange}
                                        placeholder="e.g. Mumbai, Bangalore"
                                        className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            {/* Property Type */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Property Type</label>
                                <select
                                    name="type"
                                    value={filters.type}
                                    onChange={handleFilterChange}
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 capitalize"
                                >
                                    <option value="">All Types</option>
                                    <option value="apartment">Apartment</option>
                                    <option value="house">House</option>
                                    <option value="villa">Villa</option>
                                    <option value="pg">PG / Co-living</option>
                                    <option value="studio">Studio</option>
                                </select>
                            </div>

                            {/* BHK */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Bedrooms (BHK)</label>
                                <select
                                    name="bhk"
                                    value={filters.bhk}
                                    onChange={handleFilterChange}
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                                >
                                    <option value="">Any</option>
                                    <option value="1">1 BHK</option>
                                    <option value="2">2 BHK</option>
                                    <option value="3">3 BHK</option>
                                    <option value="4">4+ BHK</option>
                                </select>
                            </div>

                            {/* Max Rent */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Max Rent (₹)</label>
                                <input
                                    type="number"
                                    name="maxRent"
                                    value={filters.maxRent}
                                    onChange={handleFilterChange}
                                    placeholder="e.g. 50000"
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                                />
                            </div>

                            <button
                                onClick={() => setFilters({ city: '', type: '', bhk: '', maxRent: '' })}
                                className="w-full py-2 text-sm font-bold text-red-600 hover:bg-red-50 rounded-lg transition"
                            >
                                Clear Filters
                            </button>
                        </div>
                    </div>
                </aside>

                {/* --- RESULTS GRID --- */}
                <main className="lg:w-3/4">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold text-gray-900">
                            {properties.length} Properties Found
                        </h1>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center items-center h-64 bg-white rounded-2xl shadow-sm border border-gray-200">
                            <Loader2 className="animate-spin text-blue-600" size={40} />
                        </div>
                    ) : properties.length === 0 ? (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-16 text-center">
                            <Home size={48} className="mx-auto text-gray-300 mb-4" />
                            <h3 className="text-xl font-bold text-gray-800 mb-2">No Matches Found</h3>
                            <p className="text-gray-500">Try removing some filters or searching a different city.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {properties.map((property) => (
                                <PropertyCard key={property.id} data={property} />
                            ))}
                        </div>
                    )}
                </main>

            </div>
        </div>
    );
}