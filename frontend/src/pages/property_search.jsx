import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Home, Bed, Bath, Ruler, Layers, Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useProperty } from '../store/PropertyContext';
import { fadeInUp, heroAnimation, textReveal, slideInUp } from '../animations/animation';

export default function PropertySearch() {
  const navigate = useNavigate();
  const {
    propertyData,
    loading,
    error,
    fetchProperty,
    clearProperty
  } = useProperty();

  const [hasSearched, setHasSearched] = useState(false);
  const [address1, setAddress1] = useState('');
  const [address2, setAddress2] = useState('');
  const initialSearch = !hasSearched && !loading;

  // Format helpers
  const formatAddress = (addressObj) =>
    addressObj ?
      addressObj.oneLine || [addressObj.line1, addressObj.line2].filter(Boolean).join(', ')
      : 'Address not available';
  const formatPrice = (price) => price ? `$${Number(price).toLocaleString()}` : 'Price not available';
  const formatSize = (size) =>
    size ? `${size.bldgSize || size.livingSize || size.universalSize || 'N/A'} sqft`
      : 'Size not available';

  const propertyObject = propertyData && ({
    id: propertyData.identifier?.attomId || propertyData.identifier?.Id || 'N/A',
    apn: propertyData.identifier?.apn || 'N/A',
    address: propertyData.address,
    price: formatPrice(propertyData.assessment?.assessed?.assdTtlValue),
    size: formatSize(propertyData.building?.size),
    zoningType: propertyData.lot?.zoningType || propertyData.summary?.propertyType || 'Property',
    propertyType: propertyData.summary?.propClass || 'N/A',
    yearBuilt: propertyData.summary?.yearBuilt || 'N/A',
    lotSize: propertyData.lot?.lotSize1 ? `${propertyData.lot.lotSize1} acres` : 'N/A',
    bedrooms: propertyData.building?.rooms?.beds || 'N/A',
    bathrooms: propertyData.building?.rooms?.bathsTotal || 'N/A'
  });

  const handleSearch = (e) => {
    e.preventDefault();
    setHasSearched(true);
    const fullAddress = [address1, address2].filter(Boolean).join(' / ');
    fetchProperty(fullAddress);
  };

  const handleClear = () => {
    clearProperty();
    setHasSearched(false);
    setAddress1('');
    setAddress2('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--from-bg)] to-[var(--secondary-gray-bg)] font-inter">
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-screen gap-4">
          <div className="relative">
            <div className="loader mb-4"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Home className="text-white w-6 h-6 animate-pulse" />
            </div>
          </div>
          <span className="text-white text-lg font-semibold">Loading property...</span>
          <style>{`
            .loader { border:4px solid rgba(255,255,255,0.1); border-top:4px solid var(--mafia-red); border-radius:50%; width:48px; height:48px; animation:spin 1s linear infinite; }
            @keyframes spin { 0%{transform:rotate(0deg);}100%{transform:rotate(360deg);} }
          `}</style>
        </div>
      ) : (
        <div className="w-[95%] max-w-6xl mx-auto py-6 sm:py-12">
          <motion.div variants={heroAnimation} initial="initial" animate="animate" className="mb-10 text-center">
            <motion.h1 variants={textReveal} className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3 bg-clip-text text-transparent bg-gradient-to-r from-white to-[var(--mafia-red)]">
              Discover Property Insights
            </motion.h1>
            <motion.p variants={textReveal} className="text-[var(--secondary-gray-text)] text-lg sm:text-xl max-w-2xl mx-auto">
              Unlock comprehensive details for any property with a simple search
            </motion.p>
          </motion.div>

          <motion.div
            variants={slideInUp}
            initial="initial"
            animate="animate"
            className="bg-[var(--secondary-gray-bg)] rounded-xl shadow-lg border border-[var(--tertiary-gray-bg)] p-6 mb-10 backdrop-blur-sm bg-opacity-70"
          >
            <form onSubmit={handleSearch} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Address Line 1 */}
                <div className="relative">
                  <MapPin size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--placeholder-gray)]" />
                  <input
                    type="text"
                    placeholder="Address Line 1 (e.g., 123 Main St)"
                    value={address1}
                    onChange={(e) => setAddress1(e.target.value)}
                    required
                    className="w-full pl-10 py-3 pr-4 border border-[var(--tertiary-gray-bg)] bg-[var(--primary-gray-bg)] text-white placeholder-[var(--placeholder-gray)] rounded-lg focus:ring-2 focus:ring-[var(--mafia-red)] focus:border-transparent transition-all duration-200"
                  />
                </div>

                {/* Address Line 2 */}
                <div className="relative">
                  <MapPin size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--placeholder-gray)] opacity-50" />
                  <input
                    type="text"
                    placeholder="Address Line 2 (Apt, Suite, etc.)"
                    value={address2}
                    onChange={(e) => setAddress2(e.target.value)}
                    className="w-full pl-10 py-3 pr-4 border border-[var(--tertiary-gray-bg)] bg-[var(--primary-gray-bg)] text-white placeholder-[var(--placeholder-gray)] rounded-lg focus:ring-2 focus:ring-[var(--mafia-red)] focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex items-center gap-2 bg-[var(--mafia-red)] hover:bg-[var(--mafia-red-dark)] text-white py-3 px-6 rounded-lg transition-colors duration-200"
                >
                  <Search size={18} />
                  <span>Search</span>
                </button>
                {hasSearched && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="flex items-center gap-2 border border-[var(--tertiary-gray-bg)] hover:bg-[var(--tertiary-gray-bg)] text-[var(--primary-gray-text)] py-3 px-6 rounded-lg transition-colors duration-200"
                  >
                    <X size={18} />
                    <span>Clear</span>
                  </button>
                )}
              </div>
            </form>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-[var(--mafia-red)] mt-3 flex items-center gap-2"
              >
                <X size={16} />
                <span>{error}</span>
              </motion.p>
            )}
          </motion.div>

          <div className="relative">
            <AnimatePresence mode="wait">
              {initialSearch ? (
                <motion.div
                  key="initial"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center py-20"
                >
                  <div className="relative mb-6">
                    <Home size={64} className="text-[var(--mafia-red)] animate-pulse" />
                    <div className="absolute -inset-4 bg-[var(--mafia-red)] rounded-full opacity-10 blur-md"></div>
                  </div>
                  <h3 className="text-2xl font-semibold text-white mb-3">Start Your Property Search</h3>
                  <p className="text-[var(--secondary-gray-text)] text-center max-w-md">
                    Enter an address above to view comprehensive property details, valuation estimates, and key features.
                  </p>
                </motion.div>
              ) : propertyData ? (
                <motion.div
                  key="details"
                  variants={fadeInUp}
                  initial="initial"
                  animate="animate"
                  exit={{ opacity: 0 }}
                  className="grid lg:grid-cols-3 bg-[var(--secondary-gray-bg)] rounded-xl overflow-hidden shadow-lg border border-[var(--tertiary-gray-bg)]"
                >
                  {/* Left Panel - Details */}
                  <div className="p-8 bg-gradient-to-b from-[var(--tertiary-gray-bg)] to-[var(--primary-gray-bg)]">
                    <h3 className="text-xl font-bold text-white mb-6 pb-3 border-b border-[var(--tertiary-gray-bg)]">
                      Property Details
                    </h3>
                    <div className="space-y-5">
                      <div>
                        <p className="text-sm text-[var(--secondary-gray-text)]">Address</p>
                        <p className="text-white font-medium">{formatAddress(propertyObject.address)}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-[var(--secondary-gray-text)]">Type</p>
                          <p className="text-white font-medium">{propertyObject.propertyType}</p>
                        </div>
                        <div>
                          <p className="text-sm text-[var(--secondary-gray-text)]">Zoning</p>
                          <p className="text-white font-medium">{propertyObject.zoningType}</p>
                        </div>
                        <div>
                          <p className="text-sm text-[var(--secondary-gray-text)]">Year Built</p>
                          <p className="text-white font-medium">{propertyObject.yearBuilt}</p>
                        </div>
                        <div>
                          <p className="text-sm text-[var(--secondary-gray-text)]">APN</p>
                          <p className="text-white font-medium">{propertyObject.apn}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Middle Panel - Image */}
                  <div className="relative h-64 lg:h-auto group overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80"
                      alt={propertyObject.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => e.target.src = 'https://via.placeholder.com/800x600?text=Property+Image+Not+Available'}
                    />
                    <div className="absolute bottom-4 left-4 bg-[var(--mafia-red)] text-white text-sm px-4 py-2 rounded-lg shadow-md">
                      {propertyObject.price}
                    </div>
                  </div>

                  {/* Right Panel - Features */}
                  <div className="p-8">
                    <h3 className="text-xl font-bold text-white mb-6 pb-3 border-b border-[var(--tertiary-gray-bg)]">
                      Key Features
                    </h3>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      {[
                        { icon: Bed, label: 'Bedrooms', value: propertyObject.bedrooms },
                        { icon: Bath, label: 'Bathrooms', value: propertyObject.bathrooms },
                        { icon: Ruler, label: 'Area', value: propertyObject.size },
                        { icon: Layers, label: 'Lot', value: propertyObject.lotSize }
                      ].map((item, i) => (
                        <motion.div
                          key={i}
                          whileHover={{ y: -3 }}
                          className="bg-[var(--tertiary-gray-bg)] p-4 rounded-lg border border-[var(--tertiary-gray-bg)] hover:border-[var(--mafia-red)] transition-all duration-200"
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-[var(--primary-gray-bg)] rounded-lg">
                              <item.icon className="w-5 h-5 text-[var(--mafia-red)]" />
                            </div>
                            <span className="text-sm text-[var(--secondary-gray-text)]">{item.label}</span>
                          </div>
                          <p className="font-bold text-white text-lg">{item.value}</p>
                        </motion.div>
                      ))}
                    </div>
                    <button
                      onClick={() => navigate(`/valuation/${encodeURIComponent([address1, address2].filter(Boolean).join(' / '))}`)}
                      className="w-full mt-6 bg-gradient-to-r from-[var(--mafia-red)] to-[var(--mafia-red-dark)] hover:from-[var(--mafia-red-dark)] hover:to-[var(--mafia-red)] text-white py-3 rounded-lg font-medium transition-all duration-300 shadow-md hover:shadow-lg"
                    >
                      Run Valuation Analysis
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="none"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center py-20"
                >
                  <div className="relative mb-6">
                    <Home size={64} className="text-[var(--mafia-red)]" />
                    <div className="absolute -inset-4 bg-[var(--mafia-red)] rounded-full opacity-10 blur-md"></div>
                  </div>
                  <h3 className="text-2xl font-semibold text-white mb-3">No Property Found</h3>
                  <p className="text-[var(--secondary-gray-text)] text-center max-w-md mb-6">
                    We couldn't find any property matching your search. Please try a different address.
                  </p>
                  <button
                    onClick={handleClear}
                    className="flex items-center gap-2 px-6 py-2 bg-[var(--tertiary-gray-bg)] hover:bg-[var(--primary-gray-bg)] text-white rounded-lg transition-colors duration-200"
                  >
                    <X size={16} />
                    <span>Clear Search</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}