import React, { useState } from 'react';
import { Search, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Hero() {
  const navigate = useNavigate();

  // State to hold search values
  const [city, setCity] = useState('');
  const [type, setType] = useState('');
  const [maxRent, setMaxRent] = useState('');

  // Handle the search click
  const handleSearch = () => {
    const queryParams = new URLSearchParams();

    if (city) queryParams.append('city', city);
    if (type) queryParams.append('type', type);
    if (maxRent) queryParams.append('maxRent', maxRent);

    // Redirect to Explore page with the filters attached to the URL
    navigate(`/explore?${queryParams.toString()}`);
  };

  return (
    <div className="relative bg-blue-900 text-white pt-24 pb-32">
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-black opacity-40"></div>
      <div
        className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-50"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80')" }}
      ></div>

      <div className="relative max-w-7xl mx-auto px-4 text-center z-10">
        <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
          Find a home that <span className="text-blue-400">matches your life</span>
        </h1>
        <p className="text-xl md:text-2xl text-gray-200 mb-10 max-w-2xl mx-auto">
          The most trusted platform for Tenants & Landlords. Verified listings, seamless payments.
        </p>

        {/* Integrated Search Bar */}
        <div className="bg-white p-4 rounded-xl shadow-2xl max-w-4xl mx-auto flex flex-col md:flex-row gap-4 items-center">

          <div className="flex-1 w-full relative">
            <MapPin className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Enter City, Zip, or Area"
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="w-full md:w-48">
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
            >
              <option value="">Property Type</option>
              {/* Updated to match your backend schema exactly */}
              <option value="apartment">Apartment</option>
              <option value="house">House</option>
              <option value="villa">Villa</option>
              <option value="pg">PG / Co-living</option>
              <option value="studio">Studio</option>
            </select>
          </div>

          <div className="w-full md:w-48">
            <select
              value={maxRent}
              onChange={(e) => setMaxRent(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
            >
              <option value="">Max Price</option>
              <option value="10000">Under ₹10,000</option>
              <option value="25000">Under ₹25,000</option>
              <option value="50000">Under ₹50,000</option>
              <option value="100000">Under ₹1,00,000</option>
            </select>
          </div>

          <button
            onClick={handleSearch}
            className="w-full md:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition shadow-lg flex items-center justify-center gap-2"
          >
            <Search size={20} />
            Search
          </button>
        </div>
      </div>
    </div>
  );
}