import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Hash, Home, Bed, Bath, Ruler, Layers, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useProperty } from "../store/PropertyContext";
import {
  fadeInUp,
  heroAnimation,
  textReveal,
  slideInUp
} from "../animations/animation";

export default function PropertySearch() {
  const navigate = useNavigate();
  const {
    propertyData,
    loading,
    error,
    updateProperty,
    setLoading,
    setError,
    clearProperty
  } = useProperty();
  const formatAddress = (addressObj) => {
    if (!addressObj) return 'Address not available';
    return addressObj.oneLine || [addressObj.line1, addressObj.line2].filter(Boolean).join(', ');
  };

  const formatPrice = (price) => {
    if (!price) return 'Price not available';
    return `$${Number(price).toLocaleString()}`;
  };

  const formatSize = (size) => {
    if (!size) return 'Size not available';
    return `${size.bldgSize || size.livingSize || size.universalSize || 'N/A'} sqft`;
  };

  const propertyObject = propertyData ? {
    id: propertyData.identifier?.attomId || propertyData.identifier?.Id || 'N/A',
    apn: propertyData.identifier?.apn || 'N/A',
    city: propertyData.address?.locality || 'City not available',
    country: propertyData.address?.country || 'Country not available',
    title: propertyData.address?.oneLine || 'Property Listing',
    address: propertyData.address,
    price: formatPrice(propertyData.sale?.amount?.saleAmt),
    size: formatSize(propertyData.building?.size),
    zoningType: propertyData.lot?.zoningType || propertyData.summary?.propertyType || 'Property',
    propertyType: propertyData.summary?.propClass || 'N/A',
    description: propertyData.summary?.legal1 || 'No description available',
    yearBuilt: propertyData.summary?.yearBuilt || 'N/A',
    lotSize: propertyData.lot?.lotSize1 ? `${propertyData.lot.lotSize1} acres` : 'N/A',
    bedrooms: propertyData.building?.rooms?.beds || 'N/A',
    bathrooms: propertyData.building?.rooms?.bathsTotal || 'N/A'
  } : null;


  const [searchParams, setSearchParams] = useState({
    searchType: "address",
    searchValue: "",
  });
  const [initialSearch, setInitialSearch] = useState(true);

  const attomKey = import.meta.env.VITE_ATTOM_API_KEY;
  const attomUrl = import.meta.env.VITE_ATTOM_API_URL;

  async function fetchProperty() {
    if (!searchParams.searchValue.trim()) {
      setError("Please enter a search value");
      return;
    }

    setLoading(true);
    setInitialSearch(false);

    try {
      const addressParts = searchParams.searchValue.split('/').map(part => part.trim());
      const address1 = encodeURIComponent(addressParts[0]);
      const address2 = addressParts.length > 1 ? encodeURIComponent(addressParts[1]) : '';

      const apiUrl = `${attomUrl}?address1=${address1}${address2 ? `&address2=${address2}` : ''}`;

      const response = await fetch(apiUrl, {
        headers: {
          'Accept': 'application/json',
          'apikey': attomKey
        }
      });

      const data = await response.json();

      if (data.property && data.property.length > 0) {
        updateProperty(data.property[0]);
      } else {
        clearProperty();
        setError("No property found");
      }
    } catch (error) {
      console.error("Error fetching property:", error);
      clearProperty();
      setError("Failed to fetch property");
    } finally {
      setLoading(false);
    }
  }

  const handleSearch = (e) => {
    e.preventDefault();
    setError("");
    fetchProperty();
  };

  const handleClearSearch = () => {
    setSearchParams({
      searchType: "address",
      searchValue: "",
    });
    clearProperty();
    setError("");
    setInitialSearch(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--from-bg)] to-[var(--secondary-gray-bg)] font-inter">
      {loading ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center">
            <div className="loader mb-4"></div>
            <span className="text-white text-lg font-semibold">Loading property...</span>
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
              Find Your Property
            </motion.h1>
            <motion.p
              variants={textReveal}
              className="text-[var(--secondary-gray-text)] text-base sm:text-lg"
            >
              Search by address to discover property details
            </motion.p>
          </motion.div>

          <motion.div
            variants={slideInUp}
            initial="initial"
            animate="animate"
            className="bg-[var(--secondary-gray-bg)] rounded-2xl shadow-sm border border-[var(--tertiary-gray-bg)] p-4 sm:p-6 lg:p-8 mb-8"
          >
            <form onSubmit={handleSearch} className="space-y-4 sm:space-y-6">
              <div className="flex items-center justify-center">
                <div className="bg-[var(--tertiary-gray-bg)] rounded-xl p-1 flex">
                  <button
                    type="button"
                    onClick={() => setSearchParams({ ...searchParams, searchType: "address" })}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${searchParams.searchType === "address"
                      ? "bg-[var(--secondary-gray-bg)] text-[var(--mafia-red)] shadow-sm"
                      : "text-[var(--primary-gray-text)] hover:text-white"
                      }`}
                  >
                    <div className="flex items-center gap-2">
                      <MapPin size={16} />
                      <span>Address</span>
                    </div>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="relative">
                  <MapPin size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--placeholder-gray)]" />
                  <input
                    type="text"
                    placeholder="Enter address (e.g. 123 Main St / Austin, TX)"
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
                    className="flex-1 bg-[var(--mafia-red)] hover:bg-[var(--mafia-red-hover)] text-white font-semibold py-3 px-6 rounded-xl transition-colors shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                  >
                    <span>Search</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleClearSearch}
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

          {/* Property Display Area */}
          <div className="relative">
            <AnimatePresence mode="wait">
              {initialSearch ? (
                <motion.div
                  key="initial-state"
                  className="flex flex-col items-center justify-center py-20"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Home size={48} className="text-[var(--mafia-red)] mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">Search for a Property</h3>
                  <p className="text-[var(--secondary-gray-text)] text-center max-w-md">
                    Enter an address above to view property details
                  </p>
                </motion.div>
              ) : propertyData ? (
                <motion.div
                  key="property-details"
                  variants={fadeInUp}
                  initial="initial"
                  animate="animate"
                  exit={{ opacity: 0 }}
                  className="bg-[var(--secondary-gray-bg)] rounded-2xl border border-[var(--tertiary-gray-bg)] overflow-hidden"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
                    {/* Left Details Panel */}
                    <div className="p-6 lg:p-8 bg-[var(--tertiary-gray-bg)]">
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-bold text-white mb-1">Property Details</h3>
                          <div className="h-1 w-12 bg-[var(--mafia-red)] mb-4"></div>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <p className="text-xs text-[var(--secondary-gray-text)]">Address</p>
                            <p className="text-sm text-white">
                              {propertyData?.address ? formatAddress(propertyObject.address) : 'Address not available'}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-[var(--secondary-gray-text)]">Property Type</p>
                            <p className="text-sm text-white">{propertyObject.propertyType}</p>
                          </div>

                          <div>
                            <p className="text-xs text-[var(--secondary-gray-text)]">Zoning</p>
                            <p className="text-sm text-white">{propertyObject.zoningType}</p>
                          </div>

                          <div>
                            <p className="text-xs text-[var(--secondary-gray-text)]">Year Built</p>
                            <p className="text-sm text-white">{propertyObject.yearBuilt}</p>
                          </div>

                          <div>
                            <p className="text-xs text-[var(--secondary-gray-text)]">APN</p>
                            <p className="text-sm text-white">{propertyObject.apn}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Center Image */}
                    <div className="order-first lg:order-none">
                      <div className="relative h-full">
                        <img
                          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80"
                          alt={propertyObject.title}
                          className="w-full h-64 lg:h-full object-cover"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                          }}
                        />
                        <div className="absolute bottom-4 left-4 bg-[var(--mafia-red)] text-white text-xs font-medium px-3 py-1 rounded-lg">
                          {propertyObject.price}
                        </div>
                      </div>
                    </div>

                    {/* Right Details Panel */}
                    <div className="p-6 lg:p-8">
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-bold text-white mb-1">Key Features</h3>
                          <div className="h-1 w-12 bg-[var(--mafia-red)] mb-4"></div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-[var(--tertiary-gray-bg)] p-3 rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                              <Bed className="w-4 h-4 text-[var(--mafia-red)]" />
                              <span className="text-sm font-medium text-white">Bedrooms</span>
                            </div>
                            <p className="text-md font-bold text-white">{propertyObject.bedrooms}</p>
                          </div>

                          <div className="bg-[var(--tertiary-gray-bg)] p-3 rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                              <Bath className="w-4 h-4 text-[var(--mafia-red)]" />
                              <span className="text-sm font-medium text-white">Bathrooms</span>
                            </div>
                            <p className="text-md font-bold text-white">{propertyObject.bathrooms}</p>
                          </div>

                          <div className="bg-[var(--tertiary-gray-bg)] p-3 rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                              <Ruler className="w-4 h-4 text-[var(--mafia-red)]" />
                              <span className="text-sm font-medium text-white">Living Area</span>
                            </div>
                            <p className="text-md font-bold text-white">{propertyObject.size}</p>
                          </div>

                          <div className="bg-[var(--tertiary-gray-bg)] p-3 rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                              <Layers className="w-4 h-4 text-[var(--mafia-red)]" />
                              <span className="text-sm font-medium text-white">Lot Size</span>
                            </div>
                            <p className="text-md font-bold text-white">{propertyObject.lotSize}</p>
                          </div>
                        </div>

                        <div className="pt-4">
                          <button
                            className="w-full bg-[var(--mafia-red)] hover:bg-[var(--mafia-red-hover)] text-white font-medium py-3 px-6 rounded-lg transition-colors"
                            onClick={() => {
                              const parts = searchParams.searchValue.split('/').map(p => p.trim());
                              const addr1 = encodeURIComponent(parts[0]);
                              const addr2 = parts.length > 1 ? encodeURIComponent(parts[1]) : '';
                              navigate(`/valuation/${addr1}/${addr2}`);
                            }}
                          >
                            Run Valuation
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="no-results"
                  className="flex flex-col items-center justify-center py-20"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Home size={48} className="text-[var(--mafia-red)] mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No Property Found</h3>
                  <p className="text-[var(--secondary-gray-text)] text-center max-w-md">
                    Try searching with a different address
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}