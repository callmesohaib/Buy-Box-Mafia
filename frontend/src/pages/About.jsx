import React, { useRef, useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Tooltip } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const About = () => {
    const [buyers, setBuyers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [hoveredBuyer, setHoveredBuyer] = useState(null);
    const mapRef = useRef(null);
    const API_BASE_URL = import.meta.env.VITE_BASE_URL;


    // Enhanced geocoding that includes country information
    const geocodeCity = async (cityName) => {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cityName)}&addressdetails=1`
            );
            const data = await response.json();

            if (data.length > 0) {
                const firstResult = data[0];
                return {
                    coords: [parseFloat(firstResult.lat), parseFloat(firstResult.lon)],
                    country: firstResult.address.country,
                    fullAddress: firstResult.display_name
                };
            }
            return null;
        } catch (err) {
            console.error("Geocoding error:", err);
            return null;
        }
    };

    const fetchBuyers = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_BASE_URL}/buyers`);
            if (!response.ok) {
                throw new Error(response.status === 404 ? "No buyers found" : "Server error");
            }

            const buyersData = await response.json();
            if (buyersData.length === 0) {
                setError("No buyers found");
                return;
            }

            const processedBuyers = [];

            for (const buyer of buyersData) {
                if (!buyer.buyingLocations) continue;

                // split by "/" and trim spaces
                const locations = buyer.buyingLocations.split("/").map(loc => loc.trim());

                for (const loc of locations) {
                    const location = await geocodeCity(loc);
                    if (location) {
                        processedBuyers.push({
                            ...buyer,
                            locationName: loc, // keep original location string
                            ...location
                        });
                    }
                }
            }

            setBuyers(processedBuyers);
        } catch (err) {
            console.error("Error fetching buyers:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        fetchBuyers();
    }, []);

    useEffect(() => {
        if (!mapRef.current || buyers.length === 0) return;

        const map = mapRef.current;
        const bounds = L.latLngBounds(
            buyers.map(buyer => buyer.coords)
        );

        if (bounds.isValid()) {
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [buyers]);

    const createRedIcon = (size = 15) => {
        return L.divIcon({
            html: `
                <div style="
                    width: ${size}px;
                    height: ${size}px;
                    border-radius: 50%;
                    background: #ff0000;
                    box-shadow: 0 0 0 3px rgba(255,0,0,0.3);
                    border: 1px solid #ffffff;
                    position: relative;
                ">
                    <div style="
                        position: absolute;
                        bottom: -20px;
                        left: 50%;
                        transform: translateX(-50%);
                        white-space: nowrap;
                        font-weight: bold;
                        color: white;
                        text-shadow: 0 0 3px black;
                    ">${size === 15 ? '' : '📍'}</div>
                </div>
            `,
            className: "red-marker",
            iconSize: [size, size],
            iconAnchor: [size / 2, size / 2],
        });
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 text-white" style={{ position: 'relative', zIndex: 1 }}>
            <div className="bg-gray-900 p-6 rounded-xl border border-gray-700">
                <style>{`
                    .leaflet-container { background: #0f172a; }
                    .leaflet-popup-content-wrapper, .leaflet-tooltip {
                        background: rgba(17,24,39,0.98);
                        color: #e6eef8;
                        border-radius: 8px;
                        border: 1px solid rgba(148,163,184,0.06);
                        box-shadow: 0 8px 20px rgba(2,6,23,0.6);
                    }
                    .leaflet-tooltip { padding: 6px 10px; font-size: 13px; }
                    .red-marker { background: transparent !important; }
                    .leaflet-tooltip-city {
                        font-size: 14px;
                        font-weight: bold;
                        color: white;
                        text-shadow: 0 0 3px black;
                        background: transparent;
                        border: none;
                        box-shadow: none;
                    }
                `}</style>

                <div className="mb-4">
                    <h3 className="text-2xl font-bold text-white">Buyer Locations</h3>
                    <p className="text-gray-400 text-sm">
                        {loading ? "Loading buyer data..." :
                            error ? error :
                                `Showing ${buyers.length} buyer locations`}
                    </p>
                </div>

                <div className="relative h-[520px] border border-gray-700 rounded-lg overflow-hidden">
                    <MapContainer
                        center={[20, 0]}
                        zoom={2}
                        minZoom={2}
                        style={{ height: "100%", width: "100%" }}
                        attributionControl={false}
                        scrollWheelZoom={true}
                        whenCreated={(mapInstance) => { mapRef.current = mapInstance; }}
                    >
                        {/* TileLayer with labels */}
                        <TileLayer
                            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />

                        {/* Buyer location markers */}
                        {buyers.map((buyer, idx) => (
                            <Marker
                                key={`${buyer.id}-${idx}-${buyer.locationName}`}
                                position={buyer.coords}
                                icon={createRedIcon()}
                                eventHandlers={{
                                    mouseover: () => setHoveredBuyer(buyer),
                                    mouseout: () => setHoveredBuyer(null)
                                }}
                            >
                                <Tooltip
                                    direction="top"
                                    offset={[0, -10]}
                                    permanent
                                    className="leaflet-tooltip-city"
                                >
                                    {buyer.locationName}
                                </Tooltip>

                                <Popup>
                                    <div style={{ minWidth: 200 }}>
                                        <div style={{ fontWeight: 700, fontSize: '16px' }}>{buyer.locationName}</div>
                                        <div style={{ color: '#94a3b8', marginTop: '4px' }}>{buyer.country}</div>
                                        <div style={{ marginTop: '8px', fontSize: '14px' }}>
                                            {buyers.filter(b => b.locationName === buyer.locationName).length} buyers in this location
                                        </div>
                                        <div style={{ marginTop: '8px', fontSize: '12px', color: '#64748b' }}>
                                            {buyer.fullAddress}
                                        </div>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}


                        {hoveredBuyer && (
                            <Marker
                                position={hoveredBuyer.coords}
                                icon={L.divIcon({
                                    html: `<div style="
                                        width: 30px;
                                        height: 30px;
                                        border-radius: 50%;
                                        border: 2px solid rgba(255,255,255,0.3);
                                        background: rgba(255,0,0,0.1);
                                    "></div>`,
                                    className: "hover-marker",
                                    iconSize: [30, 30],
                                    iconAnchor: [15, 15]
                                })}
                            />
                        )}
                    </MapContainer>
                </div>
            </div>
        </div>
    );
};

export default About;