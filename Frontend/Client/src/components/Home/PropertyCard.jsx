import { Bed, Bath, Square, BadgeCheck, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PropertyCard({ data }) {
    // console.log(data);

    // Destructure for cleaner code
    const { id, title, location, price, beds, baths, sqft, type, isVerified, image } = data;

    const navigate = useNavigate();

    return (
        <div className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl transition duration-300 flex flex-col">

            {/* Image Section */}
            <div className="relative h-64 overflow-hidden">
                <img
                    src={image}
                    alt={title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-gray-800 uppercase tracking-wide">
                    {type}
                </div>
                <button className="absolute top-4 right-4 p-2 bg-white/50 backdrop-blur-sm rounded-full hover:bg-white text-gray-800 transition">
                    <Heart size={18} />
                </button>
            </div>

            {/* Content Section */}
            <div className="p-5 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{title}</h3>
                        <p className="text-gray-500 text-sm flex items-center gap-1 mt-1">
                            <span className="text-blue-500">📍</span> {location}
                        </p>
                    </div>
                    {isVerified && (
                        <div className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-md text-xs font-bold border border-green-100">
                            <BadgeCheck size={14} /> Verified
                        </div>
                    )}
                </div>

                {/* Features Row */}
                <div className="grid grid-cols-3 gap-2 py-4 border-y border-gray-100 my-4">
                    <div className="flex flex-col items-center justify-center text-center">
                        <Bed size={20} className="text-gray-400 mb-1" />
                        <span className="text-sm font-semibold text-gray-700">{beds} Beds</span>
                    </div>
                    <div className="flex flex-col items-center justify-center text-center border-l border-gray-100">
                        <Bath size={20} className="text-gray-400 mb-1" />
                        <span className="text-sm font-semibold text-gray-700">{baths} Baths</span>
                    </div>
                    <div className="flex flex-col items-center justify-center text-center border-l border-gray-100">
                        <Square size={20} className="text-gray-400 mb-1" />
                        <span className="text-sm font-semibold text-gray-700">{sqft} sqft</span>
                    </div>
                </div>

                {/* Footer: Price & Action */}
                <div className="flex justify-between items-center mt-auto pt-2">
                    <div>
                        <span className="text-sm text-gray-500">Rent</span>
                        <p className="text-2xl font-bold text-blue-600">₹{price.toLocaleString()}<span className="text-sm text-gray-400 font-normal">/mo</span></p>
                    </div>
                    <button onClick={() => navigate(`/property/${id}`)} className="bg-gray-900 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-gray-800 transition shadow-md">
                        View Details
                    </button>
                </div>
            </div>
        </div>
    );
}