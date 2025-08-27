import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import { useProperty } from "../store/PropertyContext";
import {
  MapPin,
  DollarSign,
  Ruler,
  Calendar,
  TrendingUp,
  FileText,
  ArrowLeft,
  UserCheck,
  Zap,
  Award,
  Users,
  Building,
  Target,
  CheckCircle
} from "lucide-react";
import {
  fadeInUp,
  heroAnimation,
  textReveal,
  slideInUp,
  gridContainer,
  gridItem,
  scaleInBounce
} from "../animations/animation";

export default function ValuationResult() {
  const { fullAddress } = useParams();
  const navigate = useNavigate();
  const { propertyData, loading, error, fetchProperty, clearProperty } = useProperty();
  const [buyers, setBuyers] = useState([]);
  const [buyersLoading, setBuyersLoading] = useState(true);
  const [buyersError, setBuyersError] = useState(null);
  const [matchedBuyers, setMatchedBuyers] = useState([]);
  const [activeTab, setActiveTab] = useState('top');
  const [initialLoad, setInitialLoad] = useState(true);
  const API_BASE_URL = import.meta.env.VITE_BASE_URL;

  const MATCH_RATIO = 0.6;

  const parseBudgetField = (field) => {
    if (field == null) return [];
    if (Array.isArray(field)) return field.map(v => {
      const n = Number(String(v).replace(/[^0-9.-]+/g, ''));
      return isNaN(n) ? NaN : n;
    });
    if (typeof field === 'string' && field.includes('/')) {
      return field.split('/').map(s => {
        const n = Number(s.replace(/[^0-9.-]+/g, ''));
        return isNaN(n) ? NaN : n;
      });
    }
    const n = Number(String(field).replace(/[^0-9.-]+/g, ''));
    return [isNaN(n) ? NaN : n];
  };

  function findMatchingLocationIndex(locations, property) {
    const target = property.address?.oneLine?.toLowerCase();
    if (!target) return -1;

    const targetWords = target.split(/[,\s]+/).filter(Boolean);
    const postalCode = property.address?.postal1;
    const hasPostalCode = postalCode && /^\d+$/.test(postalCode);

    for (let i = 0; i < locations.length; i++) {
      const loc = locations[i];
      const parts = String(loc).split("/").map(p => p.trim().toLowerCase()).filter(Boolean);

      for (const part of parts) {
        const partWords = part.split(/[,\s]+/).filter(Boolean);
        if (partWords.length === 0) continue;

        // Check for postal code match first (if both have postal codes)
        if (hasPostalCode) {
          const postalMatch = partWords.some(word =>
            /^\d+$/.test(word) && word === postalCode
          );
          if (postalMatch) return i;
        }

        // Original address matching logic
        let matches = 0;
        for (const word of partWords) {
          if (targetWords.includes(word)) matches++;
        }
        const matchRatio = matches / partWords.length;
        if (matchRatio >= MATCH_RATIO) return i;
      }
    }
    return -1;
  }

  const calculateBuyerMatch = useCallback((property, buyer) => {
    let score = 0, total = 0;

    // --- Normalize buyer zoning ---
    const zoning = Array.isArray(buyer.zoningTypes)
      ? buyer.zoningTypes
      : (buyer.zoningTypes ? [buyer.zoningTypes] : []);

    // --- Normalize buyer locations ---
    const rawLocations = Array.isArray(buyer.buyingLocations)
      ? buyer.buyingLocations
      : (buyer.buyingLocations ? [buyer.buyingLocations] : []);

    const locations = rawLocations.flatMap(loc => {
      if (loc && typeof loc === "object") {
        if (loc.label) loc = loc.label;
        else if (loc.name) loc = loc.name;
        else if (loc.value) loc = loc.value;
        else if (loc.location) loc = loc.location;
        else loc = JSON.stringify(loc);
      }
      return String(loc).split("/").map(s => s.trim()).filter(Boolean);
    });

    const pricePerValues = parseBudgetField(buyer.pricePer);

    // --- Match by city ---
    total++;
    if (property.address?.locality?.toLowerCase() === String(buyer.city || "").toLowerCase()) score++;

    // --- Match by country ---
    total++;
    if (property.address?.country?.toLowerCase() === String(buyer.country || "").toLowerCase()) score++;

    // --- Match by zoning ---
    total++;
    if (zoning.some(z => String(z || "").toLowerCase() === property.lot?.zoningType?.toLowerCase())) score++;

    // --- Match by locations ---
    total++;
    const matchedIndex = findMatchingLocationIndex(locations, property);
    if (matchedIndex > -1) score++;

    // --- Match by price ---
    total++;
    const rawPropertyPrice = property?.assessment?.assessed?.assdTtlValue;
    const propertyPrice = Number(String(rawPropertyPrice).replace(/[^0-9.-]+/g, "")); // force numeric

    let matchedRange = null;
    let usedIndex = -1;
    let isPriceMatched = false;

    const isValidNumber = v => typeof v === "number" && !isNaN(v);

    // Get the first valid price value from buyer
    const getBuyerPrice = (index = -1) => {
      if (Array.isArray(pricePerValues) && pricePerValues.length > 0) {
        // If specific index is requested and valid, use it
        if (index >= 0 && index < pricePerValues.length && isValidNumber(pricePerValues[index])) {
          return pricePerValues[index];
        }
        // Otherwise find the first valid price value
        for (let i = 0; i < pricePerValues.length; i++) {
          if (isValidNumber(pricePerValues[i])) {
            return pricePerValues[i];
          }
        }
      }
      return NaN;
    };

    const buyerPrice = getBuyerPrice(matchedIndex);
    const hasValidPrice = isValidNumber(buyerPrice);

    if (!isNaN(propertyPrice) && propertyPrice > 0) {
      if (hasValidPrice) {
        usedIndex = matchedIndex > -1 ? matchedIndex : 0;
        matchedRange = `$${Math.round(buyerPrice).toLocaleString()}`;

        // Check if property price is available and within ±1000 range
        if (Math.abs(propertyPrice - buyerPrice) <= 1000) {
          score++;
          isPriceMatched = true;
        }
      } else {
        // ✅ fallback: show 50% of property price
        const fiftyPercentPrice = propertyPrice * 0.5;
        matchedRange = `$${Math.round(fiftyPercentPrice).toLocaleString()} (50% of property price)`;
      }
    } else {
      matchedRange = "No price data";
    }

    const percent = Math.round((score / total) * 100);
    return { percent, matchedRange, matchedIndex: usedIndex, isPriceMatched };
  }, []);

  const formatPrice = (buyer) => {
    if (!buyer.matchedRange) return 'N/A';

    if (buyer.isPriceMatched) {
      return <span className="text-green-400 font-bold">{buyer.matchedRange}</span>;
    } else if (buyer.matchedRange.includes('50% of property price')) {
      return <span className="text-blue-400">{buyer.matchedRange}</span>;
    } else {
      return <span className="text-green-400">{buyer.matchedRange}</span>;
    }
  };
  useEffect(() => {
    if (fullAddress && initialLoad) {
      const query = decodeURIComponent(fullAddress);
      fetchProperty(query);
      setInitialLoad(false);
    }
  }, [fullAddress, fetchProperty, initialLoad]);


  useEffect(() => {
    if (!propertyData) return;


    const fetchBuyers = async () => {
      setBuyersLoading(true);
      setBuyersError(null);


      try {
        const response = await fetch(`${API_BASE_URL}/buyers`);
        if (!response.ok) throw new Error("Failed to fetch buyers");


        const data = await response.json();
        setBuyers(data);


        const matches = data
          .map(buyer => {
            const { percent, matchedRange, matchedIndex } = calculateBuyerMatch(propertyData, buyer);
            return {
              ...buyer,
              matchPercent: percent,
              matchedRange,
              matchedRangeIndex: matchedIndex
            };
          })
          .filter(b => b.matchPercent > 0)
          .sort((a, b) => b.matchPercent - a.matchPercent);


        setMatchedBuyers(matches);
      } catch (err) {
        console.error("Buyer fetch error:", err);
        setBuyersError(err.message);
      } finally {
        setBuyersLoading(false);
      }
    };


    fetchBuyers();
  }, [propertyData, calculateBuyerMatch]);

  const handlePrepareDealPackage = useCallback(() => {
    navigate(
      `/contract/${encodeURIComponent(fullAddress)}`,
      { state: { matchedBuyers, buyerIds: matchedBuyers.map(b => b.id) } }
    );
  }, [navigate, fullAddress, matchedBuyers]);

  const formatValue = val => val ?? 'N/A';
  const formatBudget = (buyerOrMin, maxArg) => {
    if (buyerOrMin && typeof buyerOrMin === 'object' && (buyerOrMin.matchedRange || buyerOrMin.budgetMin || buyerOrMin.budgetMax)) {
      if (buyerOrMin.matchedRange) return buyerOrMin.matchedRange;
      const mins = parseBudgetField(buyerOrMin.budgetMin);
      const maxs = parseBudgetField(buyerOrMin.budgetMax);
      if (mins.length || maxs.length) return buildRangeString(mins[0], maxs[0]);
      return 'N/A';
    }
    const min = buyerOrMin;
    const max = maxArg;
    return buildRangeString(min, max);
  };

  const formatAddress = addr => addr?.oneLine || [addr?.line1, addr?.line2].filter(Boolean).join(', ');
  const formatSize = size => `${size?.bldgSize || size?.livingSize || size?.universalSize || 'N/A'} sqft`;


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-gray-800">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--mafia-red)]"></div>
          <p className="text-white">Loading property data...</p>
        </div>
      </div>
    );
  }

  if (error || !propertyData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-gray-800">
        <div className="text-center p-6 bg-[var(--secondary-gray-bg)] rounded-xl">
          <p className="text-[var(--mafia-red)] mb-4">
            {error || 'Property not found'}
          </p>
          <button
            onClick={() => navigate('/property-search')}
            className="bg-[var(--mafia-red)] text-white px-6 py-2 rounded-lg hover:bg-[var(--mafia-red-dark)] transition-colors"
          >
            Back to Search
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--from-bg)] to-[var(--secondary-gray-bg)] font-inter">
      <div className="w-[90%] mx-auto py-6 sm:py-8">
        {/* Header */}
        <motion.div
          variants={heroAnimation}
          initial="initial"
          animate="animate"
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate('/property-search')}
              className="flex items-center gap-2 text-[var(--mafia-red)] hover:text-[var(--mafia-red-hover)] transition-colors"
            >
              <ArrowLeft size={20} />
              <span className="hidden sm:inline">Back to Search</span>
            </button>
          </div>
          <motion.h1
            variants={textReveal}
            className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2"
          >
            Property Valuation Report
          </motion.h1>
          <motion.p
            variants={textReveal}
            className="text-[var(--secondary-gray-text)] text-base sm:text-lg"
          >
            Comprehensive analysis for {formatAddress(propertyData.address)}
          </motion.p>
        </motion.div>

        {/* Property Overview */}
        <motion.div
          variants={slideInUp}
          initial="initial"
          animate="animate"
          className="bg-[var(--secondary-gray-bg)] rounded-2xl shadow-sm border border-[var(--tertiary-gray-bg)] overflow-hidden mb-8"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="relative">
              {propertyData.location?.latitude && propertyData.location?.longitude ? (
                <iframe
                  title="Aerial View Map"
                  width="100%"
                  height="100%"
                  className="w-full h-64 sm:h-80 lg:h-full"
                  style={{ border: 0, borderRadius: '0' }}
                  loading="lazy"
                  allowFullScreen
                  src={`https://www.google.com/maps?q=${propertyData.location.latitude},${propertyData.location.longitude}&z=16&output=embed`}
                ></iframe>
              ) : (
                <div className="w-full h-64 sm:h-80 lg:h-full bg-gray-800 flex items-center justify-center">
                  <div className="text-[var(--secondary-gray-text)]">No map data available.</div>
                </div>
              )}
              <div className="absolute top-4 left-4 bg-[var(--mafia-red)] text-white px-3 py-1 rounded-lg text-sm font-medium">
                {propertyData.lot?.zoningType || 'Property'}
              </div>
              <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1 rounded-lg text-sm">
                <MapPin size={14} className="inline mr-1" />
                Aerial View
              </div>
            </div>

            <div className="p-4 sm:p-6 lg:p-8">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">
                {formatAddress(propertyData.address)}
              </h2>

              {/* Buyer Match Alert */}
              <motion.div
                variants={fadeInUp}
                initial="initial"
                animate="animate"
                className="bg-[var(--tertiary-gray-bg)] border border-green-700 rounded-xl p-4 mb-6"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                    <UserCheck size={16} className="text-white" />
                  </div>
                  <h3 className="font-semibold text-green-200">Perfect Buyer Match Found!</h3>
                </div>
                <p className="text-green-200 text-sm mb-3">
                  There are <span className="font-bold">{matchedBuyers.length}</span> buyers who match this property.
                  We can sell it to them for <span className="font-bold">
                    {matchedBuyers.length > 0 ?
                      `$${Math.max(...matchedBuyers.map(b => b.pricePer || 0)).toLocaleString()}` :
                      'N/A'
                    }
                  </span>.
                </p>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <TrendingUp size={14} className="text-green-300" />
                    <span className="text-green-200">
                      Top Offer Price Per Acre: {
                        matchedBuyers.length > 0 ?
                          `$${Math.max(...matchedBuyers.map(b => b.pricePer || 0)).toLocaleString()} Per Acre` :
                          'N/A'
                      }
                    </span>
                  </div>
                </div>
              </motion.div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[var(--tertiary-gray-bg)] rounded-xl flex items-center justify-center">
                    <DollarSign size={18} className="text-[var(--mafia-red)]" />
                  </div>
                  <div>
                    <p className="text-sm text-[var(--secondary-gray-text)]">List Price</p>
                    <p className="text-lg font-bold text-white">
                      {propertyData.assessment?.assessed?.assdTtlValue ? `$${propertyData.assessment?.assessed?.assdTtlValue.toLocaleString()}` : 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-900 rounded-xl flex items-center justify-center">
                    <Ruler size={18} className="text-green-300" />
                  </div>
                  <div>
                    <p className="text-sm text-[var(--secondary-gray-text)]">Lot Size</p>
                    <p className="text-lg font-bold text-white">
                      {propertyData.lot?.lotSize1 ? `${propertyData.lot.lotSize1} acres` : 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-900 rounded-xl flex items-center justify-center">
                    <Building size={18} className="text-purple-300" />
                  </div>
                  <div>
                    <p className="text-sm text-[var(--secondary-gray-text)]">Type</p>
                    <p className="text-lg font-bold text-white">
                      {propertyData.lot?.zoningType || 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-900 rounded-xl flex items-center justify-center">
                    <Calendar size={18} className="text-orange-300" />
                  </div>
                  <div>
                    <p className="text-sm text-[var(--secondary-gray-text)]">Year Built</p>
                    <p className="text-lg font-bold text-white">
                      {propertyData.summary?.yearBuilt || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handlePrepareDealPackage}
                  className="flex-1 bg-[var(--mafia-red)] hover:bg-[var(--mafia-red-hover)] text-white font-semibold py-3 px-6 rounded-xl transition-colors shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                >
                  <FileText size={18} />
                  <span className="hidden sm:inline">Prepare Deal Package</span>
                  <span className="sm:hidden">Deal Package</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.1 }}
          className="bg-[var(--secondary-gray-bg)] rounded-2xl shadow-sm border border-[var(--tertiary-gray-bg)] overflow-hidden mb-6"
        >
          <div className="p-4 sm:p-6 border-b border-[var(--tertiary-gray-bg)]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-[var(--mafia-red)] rounded-lg flex items-center justify-center">
                <Zap size={16} className="text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white">Listing Details</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-900/30 rounded-xl border border-green-700">
                <div className="text-2xl font-bold text-green-300 mb-1">${propertyData.assessment?.assessed?.assdTtlValue || 'N/A'}</div>
                <div className="text-sm text-green-200 font-medium mb-2">List Price</div>
                <div className="flex items-center justify-center gap-1 text-xs text-green-300">

                </div>
              </div>
              <div className="text-center p-4 bg-yellow-900/30 rounded-xl border border-yellow-700">
                <div className="text-2xl font-bold text-yellow-300 mb-1">{propertyData.building?.rooms?.beds || 'N/A'}</div>
                <div className="text-sm text-yellow-200 font-medium mb-2">Bedrooms</div>
                <div className="flex items-center justify-center gap-1 text-xs text-yellow-300">

                </div>
              </div>
              <div className="text-center p-4 bg-purple-900/30 rounded-xl border border-purple-700">
                <div className="text-2xl font-bold text-purple-300 mb-1">{formatSize(propertyData.building?.size)}</div>
                <div className="text-sm text-purple-200 font-medium mb-2">Size</div>
                <div className="flex items-center justify-center gap-1 text-xs text-purple-300">

                </div>
              </div>
            </div>
          </div>
        </motion.div>


        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.2 }}
          className="bg-[var(--secondary-gray-bg)] rounded-2xl shadow-sm border border-[var(--tertiary-gray-bg)] overflow-hidden mb-8"
        >
          {/* Tab Headers */}
          <div className="flex border-b border-[var(--tertiary-gray-bg)]">
            <button
              onClick={() => setActiveTab('top')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${activeTab === 'top'
                ? 'text-[var(--gold)] border-b-2 border-[var(--gold)] bg-[var(--tertiary-gray-bg)]'
                : 'text-[var(--primary-gray-text)] hover:text-[var(--gold)]'
                }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Award size={16} />
                Top Match ({matchedBuyers.length > 0 ? 1 : 0})
              </div>
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${activeTab === 'all'
                ? 'text-[var(--gold)] border-b-2 border-[var(--gold)] bg-[var(--tertiary-gray-bg)]'
                : 'text-[var(--primary-gray-text)] hover:text-[var(--gold)]'
                }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Users size={16} />
                All Matches ({matchedBuyers.length})
              </div>
            </button>
          </div>

          <div className="overflow-x-auto buyer-table-scroll" style={{ maxHeight: '340px', minHeight: '120px', overflowY: 'auto' }}>
            {buyersLoading ? (
              <div className="text-center text-white py-8">Loading buyers...</div>
            ) : buyersError ? (
              <div className="text-center text-red-500 py-8">{buyersError}</div>
            ) : matchedBuyers.length === 0 ? (
              <div className="text-center text-[var(--mafia-red)] font-medium py-8">No matched buyers found.</div>
            ) : (
              <table className="w-full border-collapse">
                <thead className="bg-[var(--tertiary-gray-bg)] sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[var(--primary-gray-text)] uppercase tracking-wider border-b border-[var(--quaternary-gray-bg)]">Rank</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[var(--primary-gray-text)] uppercase tracking-wider border-b border-[var(--quaternary-gray-bg)]">Buyer</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[var(--primary-gray-text)] uppercase tracking-wider border-b border-[var(--quaternary-gray-bg)]">Fit Score</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[var(--primary-gray-text)] uppercase tracking-wider border-b border-[var(--quaternary-gray-bg)]">Price Per Acre</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[var(--primary-gray-text)] uppercase tracking-wider border-b border-[var(--quaternary-gray-bg)]">Timeline</th>
                  </tr>
                </thead>
                <tbody className="bg-[var(--secondary-gray-bg)] divide-y divide-[var(--quaternary-gray-bg)]">
                  {(activeTab === 'top' ? matchedBuyers.slice(0, 1) : matchedBuyers).map((buyer, index) => {
                    let rankCircle;
                    if (index === 0) {
                      rankCircle = <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 text-black font-bold mr-2">1</span>;
                    } else if (index === 1) {
                      rankCircle = <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 text-black font-bold mr-2">2</span>;
                    } else if (index === 2) {
                      rankCircle = <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-amber-700 to-yellow-300 text-white font-bold mr-2">3</span>;
                    } else {
                      rankCircle = <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[var(--tertiary-gray-bg)] text-white font-bold mr-2">{index + 1}</span>;
                    }




                    return (
                      <tr
                        key={buyer.id || index}
                        className={`hover:bg-[var(--tertiary-gray-bg)] transition-colors ${index === 0 && activeTab === 'top'
                          ? 'bg-[linear-gradient(to_right,rgba(247,200,68,0.2),rgba(247,200,68,0.1))] border-l-4 border-[var(--gold)]'
                          : ''
                          }`}
                      >
                        <td className="px-4 py-3 whitespace-nowrap font-bold">{rankCircle}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-white">Buyer {index + 1}</td>
                        <td className="px-4 py-3 whitespace-nowrap font-bold" style={{ color: buyer.matchPercent >= 90 ? '#22c55e' : buyer.matchPercent >= 80 ? '#f59e42' : '#eab308' }}>{buyer.matchPercent}%</td>
                        <td className="px-4 py-3 whitespace-nowrap font-bold text-green-400">{formatPrice(buyer)}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-200 flex items-center gap-1">{formatValue(buyer.timeline)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </motion.div>
        {/* Market Analysis & Investment Metrics (API does not provide, so show description and status) */}
        <motion.div
          variants={gridContainer}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-8"
        >
          {/* Market Analysis */}
          <motion.div
            variants={gridItem}
            className="bg-[var(--secondary-gray-bg)] rounded-2xl p-4 sm:p-6 lg:p-8 shadow-sm border border-[var(--tertiary-gray-bg)]"
          >
            <div className="flex items-center gap-3 mb-6">
              <motion.div
                variants={scaleInBounce}
                className="w-10 h-10 bg-[var(--mafia-red)] rounded-xl flex items-center justify-center"
              >
                <TrendingUp size={18} className="text-white" />
              </motion.div>
              <h3 className="text-xl font-semibold text-white">Market Analysis</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-[var(--tertiary-gray-bg)] rounded-xl">
                <span className="text-[var(--primary-gray-text)] font-medium">Total Market Value</span>
                <span className="text-[var(--mafia-red)] font-semibold">${propertyData.assessment.market.mktTtlValue}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-[var(--tertiary-gray-bg)] rounded-xl">
                <span className="text-[var(--primary-gray-text)] font-medium">Land Value</span>
                <span className="text-white font-semibold truncate max-w-xs">${propertyData.assessment.market.mktLandValue}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-[var(--tertiary-gray-bg)] rounded-xl">
                <span className="text-[var(--primary-gray-text)] font-medium">Improvement Value</span>
                <span className="text-white font-semibold">${propertyData.assessment.market.mktImprValue}</span>
              </div>
            </div>
          </motion.div>
          {/* Investment Metrics */}
          <motion.div
            variants={gridItem}
            className="bg-[var(--secondary-gray-bg)] rounded-2xl p-4 sm:p-6 lg:p-8 shadow-sm border border-[var(--tertiary-gray-bg)]"
          >
            <div className="flex items-center gap-3 mb-6">
              <motion.div
                variants={scaleInBounce}
                className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center"
              >
                <Target size={18} className="text-white" />
              </motion.div>
              <h3 className="text-xl font-semibold text-white">Investment Metrics</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-[var(--tertiary-gray-bg)] rounded-xl">
                <span className="text-[var(--primary-gray-text)] font-medium">Taxes</span>
                <span className="text-green-400 font-semibold">${propertyData.assessment.tax?.taxAmt}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-[var(--tertiary-gray-bg)] rounded-xl">
                <span className="text-[var(--primary-gray-text)] font-medium">Tax Year</span>
                <span className="text-white font-semibold">{formatValue(propertyData.assessment.tax?.taxYear)}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-[var(--tertiary-gray-bg)] rounded-xl">
                <span className="text-[var(--primary-gray-text)] font-medium">Unit</span>
                <span className="text-white font-semibold">{propertyData.assessment.tax?.taxPerSizeUnit}</span>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Property Features & Rooms */}
        <motion.div
          variants={gridContainer}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-8"
        >
          {/* Property Features */}
          <motion.div
            variants={gridItem}
            className="bg-[var(--secondary-gray-bg)] rounded-2xl p-4 sm:p-6 lg:p-8 shadow-sm border border-[var(--tertiary-gray-bg)]"
          >
            <div className="flex items-center gap-3 mb-6">
              <motion.div
                variants={scaleInBounce}
                className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center"
              >
                <CheckCircle size={18} className="text-white" />
              </motion.div>
              <h3 className="text-xl font-semibold text-white">Property Features</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-[var(--tertiary-gray-bg)] rounded-xl">
                <span className="text-[var(--primary-gray-text)] font-medium">Heating Fuel</span>
                <span className="text-purple-500 font-semibold">{propertyData.utilities?.heatingFuel || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-[var(--tertiary-gray-bg)] rounded-xl">
                <span className="text-[var(--primary-gray-text)] font-medium">Heating</span>
                <span className="text-white font-semibold">{propertyData.utilities?.heatingType || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-[var(--tertiary-gray-bg)] rounded-xl">
                <span className="text-[var(--primary-gray-text)] font-medium">Cooling</span>
                <span className="text-white font-semibold">{formatValue(propertyData.utilities?.coolingtype)}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-[var(--tertiary-gray-bg)] rounded-xl">
                <span className="text-[var(--primary-gray-text)] font-medium">Swimming Pool</span>
                <span className="text-white font-semibold">{propertyData.lot?.poolType || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-[var(--tertiary-gray-bg)] rounded-xl">
                <span className="text-[var(--primary-gray-text)] font-medium">Built Year</span>
                <span className="text-white font-semibold">{formatValue(propertyData.summary?.yearBuilt)}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-[var(--tertiary-gray-bg)] rounded-xl">
                <span className="text-[var(--primary-gray-text)] font-medium">Condition</span>
                <span className="text-white font-semibold">{propertyData.building?.construction.condition}</span>
              </div>
            </div>
          </motion.div>
          {/* Rooms */}
          <motion.div
            variants={gridItem}
            className="bg-[var(--secondary-gray-bg)] rounded-2xl p-4 sm:p-6 lg:p-8 shadow-sm border border-[var(--tertiary-gray-bg)]"
          >
            <div className="flex items-center gap-3 mb-6">
              <motion.div
                variants={scaleInBounce}
                className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center"
              >
                <Users size={18} className="text-white" />
              </motion.div>
              <h3 className="text-xl font-semibold text-white">Rooms</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-[var(--tertiary-gray-bg)] rounded-xl">
                <span className="text-[var(--primary-gray-text)] font-medium">Bath Fixtures</span>
                <span className="text-orange-500 font-semibold">{formatValue(propertyData.building?.rooms?.bathFixtures)}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-[var(--tertiary-gray-bg)] rounded-xl">
                <span className="text-[var(--primary-gray-text)] font-medium">Full Baths</span>
                <span className="text-white font-semibold">{formatValue(propertyData.building?.rooms?.bathsFull)}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-[var(--tertiary-gray-bg)] rounded-xl">
                <span className="text-[var(--primary-gray-text)] font-medium">Total Baths</span>
                <span className="text-white font-semibold">{formatValue(propertyData.building?.rooms?.bathsTotal)}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-[var(--tertiary-gray-bg)] rounded-xl">
                <span className="text-[var(--primary-gray-text)] font-medium">Bedrooms</span>
                <span className="text-white font-semibold">{formatValue(propertyData.building?.rooms?.beds)}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-[var(--tertiary-gray-bg)] rounded-xl">
                <span className="text-[var(--primary-gray-text)] font-medium">Total Rooms</span>
                <span className="text-white font-semibold">{formatValue(propertyData.building?.rooms?.roomsTotal)}</span>
              </div>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.4 }}
          className="bg-[var(--secondary-gray-bg)] rounded-2xl shadow-sm border border-[var(--tertiary-gray-bg)] overflow-hidden mb-8"
        >
          <div className="p-4 sm:p-6 lg:p-8 border-b border-[var(--tertiary-gray-bg)]">
            <h3 className="text-xl font-semibold text-white">Aerial View</h3>
            <p className="text-[var(--secondary-gray-text)] text-sm sm:text-base">Satellite imagery and property boundaries</p>
          </div>
          <div className="p-4 sm:p-6 lg:p-8">
            {propertyData.location?.latitude && propertyData.location?.longitude ? (
              <iframe
                title="Map"
                width="100%"
                height="350"
                style={{ border: 0, borderRadius: '1rem' }}
                loading="lazy"
                allowFullScreen
                src={`https://www.google.com/maps?q=${propertyData.location.latitude},${propertyData.location.longitude}&z=16&output=embed`}
              ></iframe>
            ) : (
              <div className="text-[var(--secondary-gray-text)]">No map data available.</div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
