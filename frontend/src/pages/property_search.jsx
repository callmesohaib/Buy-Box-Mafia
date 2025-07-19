import { useState, useMemo, useEffect } from "react"
import { motion } from "framer-motion"
import { MapPin, Hash, Link as LinkIcon } from "lucide-react";
import PropertyResults from "../components/property_search/PropertyResults";
import {
  fadeInUp,
  heroAnimation,
  textReveal,
  slideInUp,
  gridContainer
} from "../animations/animation"

export default function PropertySearch() {
  const [propertiesData, setpropertiesData] = useState([])
  const [sortBy, setSortBy] = useState("relevance");
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [listingsData, setListingsData] = useState([]);
  const [searchParams, setSearchParams] = useState({
    searchType: "address",
    searchValue: "",
    propertyType: ""
  });
  const [error, setError] = useState("");
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true); // <-- Add loading state

  const key = import.meta.env.VITE_REPLIERS_API_KEY;
  const url = import.meta.env.VITE_REPLIERS_API_URL;

  async function fetchListings() {
    setLoading(true); // <-- Set loading true before fetch
    try {
      const response = await fetch(
        `${url}?listings=true&operator=AND&sortBy=updatedOnDesc&status=A`,
        {
          method: 'POST',
          headers: {
            'REPLIERS-API-KEY': key,
            'accept': 'application/json',
            'content-type': 'application/json',
          },
        }
      );
      const data = await response.json();
      if (data.listings && Array.isArray(data.listings)) {
        setpropertiesData(data.listings);
        setFilteredProperties(data.listings);
        setListingsData(data.listings);
      } else {
        setpropertiesData([]);
        setFilteredProperties([]);
        setListingsData([]);
      }
    } catch (error) {
      setpropertiesData([]);
      setFilteredProperties([]);
      setListingsData([]);
    } finally {
      setLoading(false); // <-- Set loading false after fetch
    }
  }

  useEffect(() => {
    fetchListings();
  }, []);

  // Filtering logic for API data
  useEffect(() => {
    let filtered = propertiesData || [];
    // Search type filtering
    if (searchParams.searchType === "address" && searchParams.searchValue) {
      const searchTerm = searchParams.searchValue.toLowerCase();
      filtered = filtered.filter(p => {
        const addressStr = formatAddressForSearch(p.address);
        return addressStr.includes(searchTerm);
      });
    } else if (searchParams.searchType === "mlsNumber" && searchParams.searchValue) {
      const searchTerm = searchParams.searchValue.toLowerCase();
      filtered = filtered.filter(p =>
        p.mlsNumber && p.mlsNumber.toLowerCase().includes(searchTerm)
      );
    } else if (searchParams.searchType === "zillowRedfinUrl" && searchParams.searchValue) {
      const searchTerm = searchParams.searchValue.toLowerCase();
      filtered = filtered.filter(p =>
        (p.zillowUrl && p.zillowUrl.toLowerCase().includes(searchTerm)) ||
        (p.redfinUrl && p.redfinUrl.toLowerCase().includes(searchTerm))
      );
    }
    // Property type filtering
    if (searchParams.propertyType) {
      filtered = filtered.filter(p =>
        p.class && p.class.toLowerCase().includes(searchParams.propertyType.toLowerCase())
      );
    }
    setFilteredProperties(filtered);
  }, [searchParams, propertiesData]);

  // Sorting logic
  const sortedProperties = useMemo(() => {
    let sorted = [...filteredProperties];
    function parsePrice(price) {
      if (typeof price === 'number') return price;
      if (typeof price === 'string') {
        return parseInt(price.replace(/[^0-9]/g, ""), 10) || 0;
      }
      return 0;
    }
    switch (sortBy) {
      case "price-low":
        sorted.sort((a, b) => parsePrice(a.originalPrice) - parsePrice(b.originalPrice));
        break;
      case "price-high":
        sorted.sort((a, b) => parsePrice(b.originalPrice) - parsePrice(a.originalPrice));
        break;
      case "mlsNumber":
        sorted.sort((a, b) => {
          const aMls = a.mlsNumber || '';
          const bMls = b.mlsNumber || '';
          return aMls.localeCompare(bMls);
        });
        break;
      case "propertyType":
        sorted.sort((a, b) => {
          const aType = a.class || '';
          const bType = b.class || '';
          return aType.localeCompare(bType);
        });
        break;
      case "city":
        sorted.sort((a, b) => {
          const aCity = a.address?.city || '';
          const bCity = b.address?.city || '';
          return aCity.localeCompare(bCity);
        });
        break;
      default:
        sorted.sort((a, b) => {
          const aMls = a.mlsNumber || '';
          const bMls = b.mlsNumber || '';
          return aMls.localeCompare(bMls);
        });
        break;
    }
    return sorted;
  }, [filteredProperties, sortBy]);

  // Helper for address formatting
  function formatAddressForSearch(addressObj) {
    if (typeof addressObj === 'string') {
      return addressObj.toLowerCase();
    }
    if (addressObj && typeof addressObj === 'object') {
      const parts = [
        addressObj.streetNumber,
        addressObj.streetName,
        addressObj.city,
        addressObj.state,
        addressObj.zip
      ].filter(Boolean);
      return parts.join(' ').toLowerCase();
    }
    return '';
  }

  // Handlers
  const handleSearch = (e) => {
    e.preventDefault();
    setError("");
  };
  const clearFilters = () => {
    setSearchParams({
      searchType: "address",
      searchValue: "",
      propertyType: ""
    });
    setError("");
  };

  // Card click handler
  const handleCardClick = (property) => {
    setSelectedProperty(property);
    setShowModal(true);
  };
  const closeModal = () => {
    setShowModal(false);
    setSelectedProperty(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--from-bg)] to-[var(--secondary-gray-bg)] font-inter">
      {loading ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center">
            <div className="loader mb-4"></div>
            <span className="text-white text-lg font-semibold">Loading properties...</span>
          </div>
          <style>{`
            .loader {
              border: 4px solid var(--tertiary-gray-bg);
              border-top: 4px solid var(--mafia-red);
              border-radius: 50%;
              width: 48px;
              height: 48px;
              animation: spin 1s linear infinite;
            }
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      ) : (
        <div className="w-[95%] max-w-6xl mx-auto py-6 sm:py-10">
          {/* Header */}
          <motion.div
            variants={heroAnimation}
            initial="initial"
            animate="animate"
            className="mb-8"
          >
            <motion.h1
              variants={textReveal}
              className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2"
            >
              Find Your Perfect Investment
            </motion.h1>
            <motion.p
              variants={textReveal}
              className="text-[var(--secondary-gray-text)] text-base sm:text-lg"
            >
              Search by address, APN/Parcel ID, or Zillow/Redfin URL to discover land investment opportunities across Texas.
            </motion.p>
          </motion.div>

          {/* Search Form */}
          <motion.div
            variants={slideInUp}
            initial="initial"
            animate="animate"
            className="bg-[var(--secondary-gray-bg)] rounded-2xl shadow-sm border border-[var(--tertiary-gray-bg)] p-4 sm:p-6 lg:p-8 mb-8"
          >
            <form onSubmit={handleSearch} className="space-y-4 sm:space-y-6">
              {/* Search Type Toggle */}
              <div className="flex items-center justify-center">
                <div className="bg-[var(--tertiary-gray-bg)] rounded-xl p-1 flex">
                  <button
                    type="button"
                    onClick={() => setSearchParams({ ...searchParams, searchType: "address" })}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${searchParams.searchType === "address"
                      ? "bg-[var(--secondary-gray-bg)] text-[var(--mafia-red)] shadow-sm"
                      : "text-[var(--primary-gray-text)] hover:text-white"}
                  `}
                  >
                    <div className="flex items-center gap-2">
                      <MapPin size={16} />
                      <span className="hidden sm:inline">Address</span>
                      <span className="sm:hidden">Addr</span>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSearchParams({ ...searchParams, searchType: "mlsNumber" })}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${searchParams.searchType === "mlsNumber"
                      ? "bg-[var(--secondary-gray-bg)] text-[var(--mafia-red)] shadow-sm"
                      : "text-[var(--primary-gray-text)] hover:text-white"}
                  `}
                  >
                    <div className="flex items-center gap-2">
                      <Hash size={16} />
                      <span className="hidden sm:inline">MLS Number</span>
                      <span className="sm:hidden">MLS</span>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSearchParams({ ...searchParams, searchType: "zillowRedfinUrl" })}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${searchParams.searchType === "zillowRedfinUrl"
                      ? "bg-[var(--secondary-gray-bg)] text-[var(--mafia-red)] shadow-sm"
                      : "text-[var(--primary-gray-text)] hover:text-white"}
                  `}
                  >
                    <div className="flex items-center gap-2">
                      <LinkIcon size={16} />
                      <span className="hidden sm:inline">Zillow/Redfin URL</span>
                      <span className="sm:hidden">URL</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Main Search Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="relative">
                  {searchParams.searchType === "address" ? (
                    <MapPin size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--placeholder-gray)]" />
                  ) : searchParams.searchType === "mlsNumber" ? (
                    <Hash size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--placeholder-gray)]" />
                  ) : (
                    <LinkIcon size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--placeholder-gray)]" />
                  )}
                  <input
                    type="text"
                    placeholder={
                      searchParams.searchType === "address"
                        ? "Enter city, county, zip code, or full address"
                        : searchParams.searchType === "mlsNumber"
                          ? "Enter MLS Number"
                          : "Paste Zillow or Redfin URL"
                    }
                    value={searchParams.searchValue}
                    onChange={(e) => {
                      setSearchParams({ ...searchParams, searchValue: e.target.value });
                      setError("");
                    }}
                    className="w-full pl-10 pr-4 py-3 border border-[var(--tertiary-gray-bg)] bg-[var(--secondary-gray-bg)] text-white placeholder-[var(--placeholder-gray)] rounded-xl focus:ring-2 focus:ring-[var(--mafia-red)] focus:border-transparent transition-all"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 bg-[var(--mafia-red)] hover:bg-[var(--mafia-red-hover)] text-white font-semibold py-3 px-6 rounded-xl transition-colors shadow-sm hover:shadow-md flex items-center justify-center gap-2 focus:ring-2 focus:ring-[var(--mafia-red)] focus:border-transparent"
                  >
                    <span>Search</span>
                  </button>
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="px-4 py-3 border border-[var(--tertiary-gray-bg)] text-[var(--primary-gray-text)] bg-[var(--secondary-gray-bg)] rounded-xl hover:bg-[var(--mafia-red)] hover:text-white transition-colors flex items-center gap-2"
                  >
                    <span>Clear</span>
                  </button>
                </div>
              </div>

              {error && (
                <div className="text-[var(--mafia-red)] text-sm font-medium mt-2 text-center">
                  {error}
                </div>
              )}
            </form>
          </motion.div>

          {/* Results Header */}
          <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6"
          >
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold text-white">
                {sortedProperties.length} Properties Found
              </h2>
              <p className="text-[var(--secondary-gray-text)] text-sm sm:text-base">
                Showing results for land investments in Texas
              </p>
            </div>

            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-[var(--primary-gray-text)]">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 bg-[var(--secondary-gray-bg)] border border-[var(--tertiary-gray-bg)] rounded-lg focus:ring-2 focus:ring-[var(--mafia-red)] focus:border-transparent transition-all text-sm text-white"
              >
                <option value="relevance">MLS Number</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="propertyType">Property Type</option>
                <option value="city">City</option>
              </select>
            </div>
          </motion.div>

          {/* Properties Grid */}
          <motion.div
            variants={gridContainer}
            initial="initial"
            animate="animate"
          >
            <PropertyResults properties={sortedProperties} onCardClick={handleCardClick} />
          </motion.div>

          {/* Modal for property details */}
          {showModal && selectedProperty && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 animate-fadein" onClick={closeModal}>
              <div className="bg-[var(--secondary-gray-bg)] rounded-2xl shadow-xl border border-[var(--tertiary-gray-bg)] max-w-md w-full relative overflow-hidden font-inter" onClick={e => e.stopPropagation()} style={{ boxShadow: '0 6px 32px 0 rgba(0,0,0,0.45)' }}>
                {/* Close Button */}
                <button className="absolute top-4 right-4 text-[var(--primary-gray-text)] hover:text-[var(--mafia-red)] transition-colors p-1 rounded-full focus:outline-none" onClick={closeModal} aria-label="Close">
                  <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </button>
                {/* Property Image */}
                <div className="w-full h-48 bg-[var(--tertiary-gray-bg)] flex items-center justify-center overflow-hidden">
                  <img
                    src={selectedProperty.images && selectedProperty.images.length > 0 ? selectedProperty.images[0] : 'https://cdn.repliers.io/sandbox/IMG-SANDBOX_1.jpg'}
                    alt={selectedProperty.address?.streetName || selectedProperty.address || 'Property'}
                    className="object-cover w-full h-full"
                    style={{ minHeight: '100px' }}
                    onError={e => { e.target.src = 'https://cdn.repliers.io/sandbox/IMG-SANDBOX_2.jpg'; }}
                  />
                </div>
                {/* Property Info */}
                <div className="p-6 flex flex-col gap-2">
                  <h3 className="text-lg font-bold text-white mb-1 leading-tight">
                    {selectedProperty.address?.streetName || selectedProperty.address}
                  </h3>
                  <div className="text-sm text-[var(--primary-gray-text)] mb-2">
                    {selectedProperty.address?.city}, {selectedProperty.address?.state} {selectedProperty.address?.zip}
                  </div>
                  <div className="flex flex-wrap gap-4 mb-2">
                    <div className="flex items-center gap-1 text-sm">
                      <span className="text-[var(--mafia-red)] font-semibold">MLS:</span>
                      <span className="text-white">{selectedProperty.mlsNumber}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <span className="text-[var(--gold)] font-semibold">Price:</span>
                      <span className="text-white">${selectedProperty.originalPrice || selectedProperty.price}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <span className="text-[var(--primary-gray-text)]">Type:</span>
                      <span className="text-white">{selectedProperty.class}</span>
                    </div>
                    {selectedProperty.details?.sqft && (
                      <div className="flex items-center gap-1 text-sm">
                        <span className="text-[var(--primary-gray-text)]">Size:</span>
                        <span className="text-white">{selectedProperty.details.sqft}</span>
                      </div>
                    )}
                  </div>
                  {selectedProperty.description && (
                    <div className="text-[var(--secondary-gray-text)] text-sm mb-2 line-clamp-4">
                      {selectedProperty.description}
                    </div>
                  )}
                  <div className="flex gap-2 flex-wrap mb-2">
                    {selectedProperty.features && selectedProperty.features.slice(0, 3).map((feature, idx) => (
                      <span key={idx} className="text-xs bg-[var(--quaternary-gray-bg)] text-[var(--primary-gray-text)] px-2 py-1 rounded-lg font-medium">
                        {feature}
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-3 mt-2">
                    {selectedProperty.zillowUrl && (
                      <a href={selectedProperty.zillowUrl} target="_blank" rel="noopener noreferrer" className="text-[var(--mafia-red)] underline text-sm font-medium hover:text-[var(--gold)] transition-colors">Zillow</a>
                    )}
                    {selectedProperty.redfinUrl && (
                      <a href={selectedProperty.redfinUrl} target="_blank" rel="noopener noreferrer" className="text-[var(--mafia-red)] underline text-sm font-medium hover:text-[var(--gold)] transition-colors">Redfin</a>
                    )}
                  </div>
                </div>
              </div>
              <style>{`
                @keyframes fadein { from { opacity: 0; } to { opacity: 1; } }
                .animate-fadein { animation: fadein 0.25s cubic-bezier(.4,0,.2,1); }
              `}</style>
            </div>
          )}

          {/* Load More */}
          <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.6 }}
            className="text-center mt-8 sm:mt-12"
          >
          </motion.div>
        </div>
      )}
    </div>
  );
}
