import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import axios from 'axios';
import { State, City as CityLib } from 'country-state-city'; // NEW: The dropdown library
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default Leaflet marker icons in React
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
});

const MapUpdater = ({ center, zoom }) => {
    const map = useMap();
    useEffect(() => { map.flyTo(center, zoom, { duration: 1.5 }); }, [center, zoom, map]);
    return null;
};

const MapClickListener = ({ setCoordinates }) => {
    useMapEvents({
        click(e) { setCoordinates([e.latlng.lat, e.latlng.lng]); },
    });
    return null;
};

const LocationMapSelector = ({ onLocationChange, validationErrors }) => {
    const [country] = useState('India');
    const [stateName, setStateName] = useState('');
    const [stateIsoCode, setStateIsoCode] = useState(''); // Needed to fetch matching cities
    const [cityName, setCityName] = useState('');
    const [pincode, setPincode] = useState('');

    const [coordinates, setCoordinates] = useState([20.5937, 78.9629]);
    const [mapZoom, setMapZoom] = useState(5);

    // Fetch lists from the library for the dropdowns
    const indianStates = State.getStatesOfCountry('IN');
    const availableCities = stateIsoCode ? CityLib.getCitiesOfState('IN', stateIsoCode) : [];

    useEffect(() => {
        onLocationChange({
            country, state: stateName, city: cityName, pincode,
            lat: coordinates[0], lng: coordinates[1]
        });
    }, [country, stateName, cityName, pincode, coordinates]);

    const updateMapLocation = async (searchQuery, zoomLevel) => {
        if (!searchQuery) return;
        try {
            const response = await axios.get(`https://nominatim.openstreetmap.org/search`, {
                params: { q: searchQuery, format: 'json', limit: 1 }
            });
            if (response.data && response.data.length > 0) {
                const { lat, lon } = response.data[0];
                setCoordinates([parseFloat(lat), parseFloat(lon)]);
                setMapZoom(zoomLevel);
            }
        } catch (error) {
            console.error("Geocoding failed:", error);
        }
    };

    // --- DROPDOWN HANDLERS ---
    const handleStateChange = (e) => {
        const selectedCode = e.target.value;
        const selectedState = indianStates.find(s => s.isoCode === selectedCode);

        setStateIsoCode(selectedCode);
        setStateName(selectedState ? selectedState.name : '');
        setCityName(''); // Reset city when state changes

        if (selectedState) updateMapLocation(`${selectedState.name}, India`, 6);
    };

    const handleCityChange = (e) => {
        const selectedCity = e.target.value;
        setCityName(selectedCity);
        if (selectedCity) updateMapLocation(`${selectedCity}, ${stateName}, India`, 10);
    };

    const handlePincodeChange = async (e) => {
        const val = e.target.value;
        setPincode(val);

        if (val.length === 6) {
            try {
                const postalRes = await axios.get(`https://api.postalpincode.in/pincode/${val}`);
                if (postalRes.data[0].Status === "Success") {
                    const data = postalRes.data[0].PostOffice[0];
                    const foundStateName = data.State;
                    const foundCityName = data.District;

                    // Reverse match the State name to get the ISO Code for the dropdown
                    const matchedState = indianStates.find(s => s.name.toLowerCase() === foundStateName.toLowerCase());

                    if (matchedState) {
                        setStateIsoCode(matchedState.isoCode);
                        setStateName(matchedState.name);
                        setCityName(foundCityName);
                    }

                    updateMapLocation(`${foundCityName}, ${foundStateName}, India`, 13);
                } else {
                    updateMapLocation(`${val}, India`, 12);
                }
            } catch (err) {
                updateMapLocation(`${val}, India`, 12);
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                {/* 1. COUNTRY */}
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Country</label>
                    <select disabled className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-slate-100 text-slate-500 outline-none">
                        <option value="India">India</option>
                    </select>
                </div>

                {/* 2. STATE DROPDOWN */}
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">State <span className="text-red-500">*</span></label>
                    <select
                        value={stateIsoCode}
                        onChange={handleStateChange}
                        className={`w-full px-4 py-2.5 rounded-lg border ${validationErrors?.state ? 'border-red-500 bg-red-50' : 'border-slate-300'} focus:ring-2 focus:ring-blue-500 outline-none bg-white`}
                    >
                        <option value="">Select State</option>
                        {indianStates.map((state) => (
                            <option key={state.isoCode} value={state.isoCode}>{state.name}</option>
                        ))}
                    </select>
                    {validationErrors?.state && <p className="text-red-500 text-xs mt-1 font-medium">{validationErrors.state}</p>}
                </div>

                {/* 3. CITY DROPDOWN (Cascaded) */}
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">City / District <span className="text-red-500">*</span></label>
                    <select
                        value={cityName}
                        onChange={handleCityChange}
                        disabled={!stateIsoCode} // Disabled until state is chosen!
                        className={`w-full px-4 py-2.5 rounded-lg border ${validationErrors?.city ? 'border-red-500 bg-red-50' : 'border-slate-300'} focus:ring-2 focus:ring-blue-500 outline-none bg-white disabled:bg-slate-50`}
                    >
                        <option value="">{stateIsoCode ? "Select City" : "Select State First"}</option>
                        {availableCities.map((city) => (
                            <option key={city.name} value={city.name}>{city.name}</option>
                        ))}
                    </select>
                    {validationErrors?.city && <p className="text-red-500 text-xs mt-1 font-medium">{validationErrors.city}</p>}
                </div>

                {/* 4. PINCODE (With Auto-fill Power) */}
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Pincode <span className="text-red-500">*</span></label>
                    <input
                        type="text"
                        value={pincode}
                        onChange={handlePincodeChange}
                        placeholder="e.g. 360001"
                        maxLength={6}
                        className={`w-full px-4 py-2.5 rounded-lg border ${validationErrors?.pincode ? 'border-red-500 bg-red-50' : 'border-slate-300'} focus:ring-2 focus:ring-blue-500 outline-none`}
                    />
                    <p className="text-xs text-blue-500 mt-1 font-medium">Type 6 digits to auto-fill state & city!</p>
                    {validationErrors?.pincode && <p className="text-red-500 text-xs mt-1 font-medium">{validationErrors.pincode}</p>}
                </div>

            </div>

            <div className="w-full h-[350px] rounded-xl overflow-hidden border-2 border-slate-200 shadow-sm relative">
                <div className="absolute top-2 left-2 z-[1000] bg-white/95 px-3 py-1.5 rounded-md text-xs font-bold text-blue-700 shadow border border-blue-100">
                    📍 Click anywhere on the map to drop the exact pin
                </div>
                <MapContainer center={coordinates} zoom={mapZoom} style={{ width: '100%', height: '100%' }}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <MapUpdater center={coordinates} zoom={mapZoom} />
                    <MapClickListener setCoordinates={setCoordinates} />
                    <Marker position={coordinates} />
                </MapContainer>
            </div>
            <p className="text-xs text-slate-500 font-medium">Selected Coordinates: Lat {coordinates[0].toFixed(5)}, Lng {coordinates[1].toFixed(5)}</p>
        </div>
    );
};

export default LocationMapSelector;