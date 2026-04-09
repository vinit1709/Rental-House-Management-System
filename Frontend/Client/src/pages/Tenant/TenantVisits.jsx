import React, { useState, useEffect } from 'react';
import {
    Calendar, MapPin, Clock, CheckCircle,
    XCircle, ExternalLink, Loader2, Home
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DashboardHeader } from '../../components/DashboardSharedUI';
import AxiosInstance from '../../api/axiosInstance';

const TenantVisits = () => {
    const [visits, setVisits] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchMyVisits = async () => {
            try {
                setIsLoading(true);
                const response = await AxiosInstance.get('/properties/my/visits');
                // console.log(response.data);
                setVisits(response.data.visits || []);
            } catch (err) {
                console.error("Error fetching visits:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMyVisits();
    }, []);

    const getStatusBadge = (status) => {
        switch (status) {
            case 'approved':
                return <span className="flex items-center gap-1.5 text-green-700 bg-green-50 px-3 py-1.5 rounded-lg font-bold text-sm border border-green-200"><CheckCircle size={16} /> Approved</span>;
            case 'rejected':
                return <span className="flex items-center gap-1.5 text-red-700 bg-red-50 px-3 py-1.5 rounded-lg font-bold text-sm border border-red-200"><XCircle size={16} /> Rejected</span>;
            case 'rescheduled':
                return <span className="flex items-center gap-1.5 text-purple-700 bg-purple-50 px-3 py-1.5 rounded-lg font-bold text-sm border border-purple-200"><Calendar size={16} /> Rescheduled</span>;
            default:
                return <span className="flex items-center gap-1.5 text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg font-bold text-sm border border-amber-200"><Clock size={16} /> Pending</span>;
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-300">

            <DashboardHeader
                title="My Scheduled Visits"
                subtitle="Track the status of your property visit requests."
            />

            {isLoading ? (
                <div className="flex justify-center items-center h-64 bg-white rounded-xl border border-slate-200 shadow-sm">
                    <Loader2 className="animate-spin text-blue-600" size={40} />
                </div>
            ) : visits.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center">
                    <Calendar size={48} className="mx-auto text-slate-300 mb-4" />
                    <h3 className="text-xl font-bold text-slate-800 mb-2">No Visits Scheduled</h3>
                    <p className="text-slate-500 mb-6">You haven't requested to visit any properties yet.</p>
                    <button
                        onClick={() => navigate('/explore')}
                        className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-blue-700 transition shadow-sm"
                    >
                        Explore Properties
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {visits.map((visit) => {
                        // Check if propertyId is populated. If it's just a string, we show fallbacks.
                        const isPopulated = typeof visit.propertyId === 'object' && visit.propertyId !== null;
                        const propertyTitle = isPopulated ? visit.propertyId.title : 'Unknown Property';
                        const propertyCity = isPopulated ? visit.propertyId.address?.city : 'Location not available';
                        const propertyImage = isPopulated && visit.propertyId.photos?.length > 0 ? visit.propertyId.photos[0] : null;
                        const propertyLink = isPopulated ? `/property/${visit.propertyId._id}` : '#';

                        return (
                            <div key={visit._id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition overflow-hidden flex flex-col">

                                {/* Card Header (Image & Status) */}
                                <div className="h-40 bg-slate-100 relative">
                                    {propertyImage ? (
                                        <img src={propertyImage} alt="Property" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                                            <Home size={32} />
                                        </div>
                                    )}
                                    <div className="absolute top-3 right-3">
                                        {getStatusBadge(visit.status)}
                                    </div>
                                </div>

                                {/* Card Body (Details) */}
                                <div className="p-5 flex-1 flex flex-col">
                                    <h3 className="text-lg font-extrabold text-slate-900 line-clamp-1 mb-1">
                                        {propertyTitle}
                                    </h3>

                                    <div className="flex items-start gap-2 text-slate-500 text-sm mb-4">
                                        <MapPin size={16} className="mt-0.5 flex-shrink-0" />
                                        <p className="line-clamp-2">{propertyCity}</p>
                                    </div>

                                    {/* Date Highlight Box */}
                                    <div className="mt-auto bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-center gap-4">
                                        <div className="bg-white p-3 rounded-lg border border-blue-200 text-blue-600 shadow-sm">
                                            <Calendar size={24} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-0.5">Requested Date</p>
                                            <p className="font-bold text-slate-900">
                                                {new Date(visit.visitDate).toLocaleDateString('en-IN', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })}
                                            </p>
                                        </div>
                                    </div>

                                </div>

                                {/* Card Footer */}
                                <div className="p-4 border-t border-slate-100 bg-slate-50">
                                    <button
                                        onClick={() => isPopulated && navigate(propertyLink)}
                                        disabled={!isPopulated}
                                        className={`w-full flex items-center justify-center gap-2 text-sm font-bold py-2.5 rounded-lg shadow-sm transition ${isPopulated
                                            ? 'text-blue-600 hover:text-blue-800 bg-white border border-slate-200'
                                            : 'text-slate-400 bg-slate-100 border border-slate-100 cursor-not-allowed'
                                            }`}
                                    >
                                        View Listing <ExternalLink size={16} />
                                    </button>
                                </div>

                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default TenantVisits;