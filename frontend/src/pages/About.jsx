// AboutMap.jsx
import React, { useRef, useEffect } from "react";
import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    Tooltip
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

/*
  Changes in this version:
  - Removed any mention or display of active user counts.
  - Country tooltip/popup now only shows the country name.
  - Clicking a country toggles display of its counties (no counts).
  - County tooltip shows only county name; hovering a county shows a soft highlight ring.
  - Fixed styling so no white boxes appear while tiles load.
*/

const activeCountries = {
    US: {
        name: "United States",
        tier: "Enterprise",
        counties: [
            { name: "Los Angeles County", coords: [34.0522, -118.2437] },
            { name: "Cook County", coords: [41.8818, -87.6231] },
            { name: "Harris County", coords: [29.7752, -95.3103] }
        ]
    },
    GB: {
        name: "United Kingdom",
        tier: "Enterprise",
        counties: [
            { name: "Greater London", coords: [51.5074, -0.1278] },
            { name: "West Midlands", coords: [52.4862, -1.8904] }
        ]
    },
    DE: {
        name: "Germany",
        tier: "Enterprise",
        counties: [
            { name: "Berlin", coords: [52.52, 13.405] },
            { name: "Bavaria", coords: [48.7904, 11.4979] }
        ]
    },
    // add other countries the same way (no counts)
};

const getColor = (tier) => {
    return tier === "Enterprise" ? "#4f46e5" :
        tier === "Business" ? "#7c3aed" :
            "#a78bfa";
};

// fixed sizes for consistent, professional markers
const COUNTRY_ICON_SIZE = 20;
const COUNTY_ICON_SIZE = 10;

// simple divIcon without white square; subtle ring only
const createIcon = (color, size) => {
    const inner = Math.round(size * 0.48);
    const html = `
    <div style="
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      background: linear-gradient(180deg, ${color}, ${color}cc);
      display:flex;
      align-items:center;
      justify-content:center;
      box-shadow: 0 6px 14px ${color}33, inset 0 -4px 10px #00000044;
      border: 1px solid rgba(255,255,255,0.06);
    ">
      <div style="
        width: ${inner}px;
        height: ${inner}px;
        border-radius: 50%;
        background: rgba(255,255,255,0.06);
        transform: translateY(1px);
      "></div>
    </div>
  `;
    return L.divIcon({
        html,
        className: `bbm-marker`,
        iconSize: [size, size],
        iconAnchor: [Math.round(size / 2), Math.round(size / 2)],
        popupAnchor: [0, -Math.round(size / 2) - 6],
    });
};

function getCountryCenter(countryCode) {
    const centers = {
        US: [37.0902, -95.7129],
        GB: [55.3781, -3.4360],
        DE: [51.1657, 10.4515],
        FR: [46.2276, 2.2137],
        IT: [41.8719, 12.5674],
        ES: [40.4637, -3.7492],
        NL: [52.1326, 5.2913],
        CA: [56.1304, -106.3468],
        AU: [-25.2744, 133.7751],
        JP: [36.2048, 138.2529],
        AE: [23.4241, 53.8478],
        SG: [1.3521, 103.8198],
        IN: [20.5937, 78.9629],
        BR: [-14.2350, -51.9253],
        MX: [23.6345, -102.5528],
    };
    return centers[countryCode] || [20, 0];
}

function BuyBoxMafiaHeatmap() {
    const mapRef = useRef(null);
    const [activeCountry, setActiveCountry] = React.useState(null);
    const [hoveredCounty, setHoveredCounty] = React.useState(null);

    // world bounds
    const maxBounds = L.latLngBounds(
        L.latLng(-85, -180),
        L.latLng(85, 180)
    );

    // set bounds & small protections after map is created
    useEffect(() => {
        if (!mapRef.current) return;
        const map = mapRef.current;
        map.setMaxBounds(maxBounds);
        const onDrag = () => map.panInsideBounds(maxBounds, { animate: false });
        map.on("drag", onDrag);
        try { map.doubleClickZoom.disable(); } catch (e) { }
        return () => map.off("drag", onDrag);
    }, [mapRef.current]);

    const handleCountryClick = (countryCode) => {
        setActiveCountry(prev => (prev === countryCode ? null : countryCode));
    };

    const legendItems = [
        { label: "Enterprise", color: "#4f46e5" },
        { label: "Business", color: "#7c3aed" },
        { label: "Starter", color: "#a78bfa" },
    ];

    return (
        <div
            className="bg-gray-900 p-6 rounded-xl border border-gray-700"
            style={{ position: "relative", zIndex: 1 }}
        >
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
        .bbm-marker { background: transparent !important; }
      `}</style>

            <div className="flex items-start justify-between mb-4">
                <div>
                    <h3 className="text-2xl font-bold text-white">Global BuyBoxMafia Presence</h3>
                    <p className="text-gray-400 text-sm">
                        Active countries (click a marker to highlight counties)
                    </p>
                </div>

                <div className="flex items-center space-x-3">
                    {legendItems.map((it) => (
                        <div key={it.label} className="flex items-center space-x-2">
                            <div style={{ width: 12, height: 12, borderRadius: 6, background: it.color }} />
                            <div className="text-xs text-gray-300">{it.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="relative h-[520px] border border-gray-700 rounded-lg overflow-hidden" style={{ zIndex: 1 }}>
                <MapContainer
                    center={[20, 0]}
                    zoom={2}
                    minZoom={2}
                    maxZoom={6}
                    style={{ height: "100%", width: "100%" }}
                    attributionControl={false}
                    scrollWheelZoom={false}
                    whenCreated={(mapInstance) => { mapRef.current = mapInstance; }}
                >
                    <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png" />

                    {/* Country markers: Tooltip & Popup contain ONLY the country name */}
                    {Object.entries(activeCountries).map(([code, country]) => {
                        const color = getColor(country.tier);
                        const center = getCountryCenter(code);
                        const icon = createIcon(color, COUNTRY_ICON_SIZE);

                        return (
                            <Marker
                                key={code}
                                position={center}
                                icon={icon}
                                eventHandlers={{ click: () => handleCountryClick(code) }}
                            >
                                <Tooltip direction="top" offset={[0, -COUNTRY_ICON_SIZE / 2]} sticky>
                                    <div style={{ minWidth: 120, textAlign: "center", fontWeight: 700 }}>
                                        {country.name}
                                    </div>
                                </Tooltip>

                                <Popup>
                                    <div style={{ minWidth: 160 }}>
                                        <div style={{ fontWeight: 700 }}>{country.name}</div>
                                        <div style={{ marginTop: 8, color: "#94a3b8", fontSize: 13 }}>
                                            Click marker to {activeCountry === code ? "hide" : "show"} counties
                                        </div>
                                    </div>
                                </Popup>
                            </Marker>
                        );
                    })}

                    {/* County markers for selected country: show only county name tooltip */}
                    {activeCountry && activeCountries[activeCountry]?.counties?.map(county => {
                        const color = getColor(activeCountries[activeCountry].tier);
                        const icon = createIcon(color, COUNTY_ICON_SIZE);

                        return (
                            <Marker
                                key={county.name}
                                position={county.coords}
                                icon={icon}
                                eventHandlers={{
                                    mouseover: () => setHoveredCounty(county),
                                    mouseout: () => setHoveredCounty(null)
                                }}
                            >
                                <Tooltip direction="top" offset={[0, -COUNTY_ICON_SIZE / 2]} sticky>
                                    <div style={{ minWidth: 110, textAlign: "center", fontWeight: 600 }}>
                                        {county.name}
                                    </div>
                                </Tooltip>
                            </Marker>
                        );
                    })}

                    {/* Hover highlight ring for county */}
                    {hoveredCounty && (
                        <Marker
                            key={`hover-${hoveredCounty.name}`}
                            position={hoveredCounty.coords}
                            icon={L.divIcon({
                                html: `<div style="
                    width: 44px;
                    height: 44px;
                    border-radius: 50%;
                    border: 2px solid rgba(255,255,255,0.14);
                    box-shadow: 0 10px 30px rgba(2,6,23,0.6);
                    background: rgba(255,255,255,0.02);
                    "></div>`,
                                className: "bbm-hover",
                                iconSize: [44, 44],
                                iconAnchor: [22, 22]
                            })}
                        />
                    )}
                </MapContainer>

                {/* small helper */}
                <div
                    style={{
                        position: "absolute",
                        bottom: 12,
                        left: 12,
                        background: "rgba(15,23,42,0.85)",
                        border: "1px solid rgba(148,163,184,0.08)",
                        padding: "8px 10px",
                        borderRadius: 8,
                        color: "#cbd5e1",
                        fontSize: 12,
                        backdropFilter: "blur(6px)",
                        zIndex: 1000
                    }}
                >
                    {activeCountry
                        ? `Showing counties in ${activeCountries[activeCountry].name}. Click marker to hide.`
                        : "Click a country marker to view its counties"}
                </div>
            </div>
        </div>
    );
}

const About = () => {
    return (
        <div className="max-w-7xl mx-auto px-4 py-8 text-white" style={{ position: 'relative', zIndex: 1 }}>
            <BuyBoxMafiaHeatmap />
        </div>
    );
};

export default About;
