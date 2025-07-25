import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useParams, useNavigate } from "react-router-dom"
import {
  MapPin,
  DollarSign,
  Ruler,
  Calendar,
  TrendingUp,
  FileText,
  Download,
  Share2,
  ArrowLeft,
  Star,
  Eye,
  Clock,
  Building,
  Users,
  Target,
  CheckCircle,
  UserCheck,
  Award,
  TrendingDown,
  Zap,
  Timer
} from "lucide-react"

import {
  fadeInUp,
  staggerContainer,
  staggerItem,
  scaleInBounce,
  heroAnimation,
  textReveal,
  slideInUp,
  gridContainer,
  gridItem
} from "../animations/animation"

export default function ValuationResult() {

  const { id: mlsNumber } = useParams()
  const navigate = useNavigate()
  const [propertyData, setPropertyData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('top')
  const [buyers, setBuyers] = useState([])
  const [buyersLoading, setBuyersLoading] = useState(true)
  const [buyersError, setBuyersError] = useState(null)
  const [matchedBuyers, setMatchedBuyers] = useState([])

  const PROPERTY_IMAGE_URL = 'https://cdn.repliers.io/sandbox/IMG-SANDBOX_3.jpg';

  // Format helpers
  const formatValue = (val) => (val === undefined || val === null || val === "" ? "N/A" : val);
  const formatBudget = (min, max) => {
    if (min && max) return `$${min} - $${max}`;
    if (min) return `From $${min}`;
    if (max) return `Up to $${max}`;
    return "N/A";
  };
  const formatList = (val) => {
    if (!val) return "N/A";
    if (Array.isArray(val)) return val.join(", ");
    return val;
  };

  // Fetch property data from Repliers API by MLS number
  useEffect(() => {
    if (!mlsNumber) return;
    setIsLoading(true);
    setPropertyData(null);
    fetch(`https://api.repliers.io/listings/${mlsNumber}`, {
      headers: {
        'REPLIERS-API-KEY': '41MCTXQRjF5HUStcQkFuNfYhGU56Je',
        'accept': 'application/json',
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch property');
        return res.json();
      })
      .then((data) => {
        setPropertyData(data);
        setIsLoading(false);
      })
      .catch((e) => {
        setPropertyData(null);
        setIsLoading(false);
      });
  }, [mlsNumber]);


  // Helper: calculate match percentage between property and buyer
  function calculateBuyerMatch(property, buyer) {
    if (!property || !buyer) return 0;
    let score = 0;
    let total = 0;

    // 1. City match
    total++;
    if (
      property.address?.city &&
      buyer.city &&
      property.address.city.toLowerCase() === buyer.city.toLowerCase()
    ) score++;

    // 2. Country match
    total++;
    if (
      property.address?.country &&
      buyer.country &&
      property.address.country.toLowerCase() === buyer.country.toLowerCase()
    ) score++;

    // 3. Class match (property.class vs buyer.zoningTypes)
    total++;
    if (
      property.class &&
      buyer.zoningTypes &&
      Array.isArray(buyer.zoningTypes) &&
      buyer.zoningTypes.map(z => z.toLowerCase()).includes(property.class.toLowerCase())
    ) score++;

    // 4. Buying locations (property city in buyer.buyingLocations)
    total++;
    if (
      property.address?.city &&
      buyer.buyingLocations &&
      Array.isArray(buyer.buyingLocations) &&
      buyer.buyingLocations.map(l => l.toLowerCase()).includes(property.address.city.toLowerCase())
    ) score++;

    // 5. Budget match (property.originalPrice between buyer.budgetMin and buyer.budgetMax)
    total++;
    const price = Number(property.originalPrice || property.listPrice);
    const min = Number(buyer.budgetMin);
    const max = Number(buyer.budgetMax);
    if (!isNaN(price) && !isNaN(min) && !isNaN(max) && price >= min && price <= max) score++;
    else if (!isNaN(price) && !isNaN(min) && isNaN(max) && price >= min) score++;
    else if (!isNaN(price) && isNaN(min) && !isNaN(max) && price <= max) score++;

    // Return percentage
    return Math.round((score / total) * 100);
  }

  // Fetch buyers from API and calculate matches
  useEffect(() => {
    setBuyersLoading(true);
    setBuyersError(null);
    fetch("http://localhost:3001/api/buyers")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch buyers");
        return res.json();
      })
      .then((data) => {
        setBuyers(data);
        // Calculate matches if propertyData is available
        if (propertyData) {
          const matches = data
            .map(buyer => ({
              ...buyer,
              matchPercent: calculateBuyerMatch(propertyData, buyer)
            }))
            .filter(b => b.matchPercent > 0)
            .sort((a, b) => b.matchPercent - a.matchPercent);
          setMatchedBuyers(matches);
        }
        setBuyersLoading(false);
      })
      .catch((e) => {
        setBuyersError(e.message);
        setBuyers([]);
        setMatchedBuyers([]);
        setBuyersLoading(false);
      });
  }, [propertyData]);

  const handlePrepareDealPackage = () => {

    navigate(`/contract/${mlsNumber}`)
  }

  // Show loading spinner until BOTH property and buyers are loaded
  if (isLoading || buyersLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-gray-800 font-inter flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--mafia-red)] mx-auto mb-4"></div>
          <p className="text-[var(--secondary-gray-text)]">Loading property analysis...</p>
        </div>
      </div>
    );
  }

  if (!propertyData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-gray-800 font-inter flex items-center justify-center">
        <div className="text-center">
          <p className="text-[var(--secondary-gray-text)] mb-4">Property not found</p>
          <button
            onClick={() => navigate('/property-search')}
            className="bg-[var(--mafia-red)] text-white px-6 py-3 rounded-xl hover:bg-[var(--mafia-red-hover)] transition-colors"
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
            Comprehensive analysis for {propertyData.address?.streetNumber} {propertyData.address?.streetName} {propertyData.address?.streetSuffix}, {propertyData.address?.city}, {propertyData.address?.state} {propertyData.address?.zip}
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
              <img
                src={PROPERTY_IMAGE_URL}
                alt={formatValue(propertyData.address?.streetName) || 'Property'}
                className="w-full h-64 sm:h-80 lg:h-full object-cover"
                onError={e => { e.target.src = 'https://cdn.repliers.io/sandbox/IMG-SANDBOX_2.jpg'; }}
              />
              <div className="absolute top-4 left-4 bg-[var(--mafia-red)] text-white px-3 py-1 rounded-lg text-sm font-medium">
                {propertyData.class}
              </div>
            </div>

            <div className="p-4 sm:p-6 lg:p-8">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">
                {propertyData.address?.streetNumber} {propertyData.address?.streetName} {propertyData.address?.streetSuffix}, {propertyData.address?.city}, {propertyData.address?.state} {propertyData.address?.zip}
              </h2>

              {/* Buyer Match Alert */}
              {/* Example Buyer Match Alert (static, since API does not provide this) */}
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
                  We can sell it to them for <span className="font-bold">${propertyData.listPrice}</span>.
                </p>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <TrendingUp size={14} className="text-green-300" />
                    <span className="text-green-200">List Price: ${propertyData.listPrice}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingDown size={14} className="text-[var(--mafia-red)]" />
                    <span className="text-[var(--mafia-red)]">Original Price: ${propertyData.originalPrice}</span>
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
                    <p className="text-lg font-bold text-white">${propertyData.listPrice}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-900 rounded-xl flex items-center justify-center">
                    <Ruler size={18} className="text-green-300" />
                  </div>
                  <div>
                    <p className="text-sm text-[var(--secondary-gray-text)]">Lot Size</p>
                    <p className="text-lg font-bold text-white">{propertyData.lot?.width} x {propertyData.lot?.depth} {propertyData.lot?.measurement}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-900 rounded-xl flex items-center justify-center">
                    <Building size={18} className="text-purple-300" />
                  </div>
                  <div>
                    <p className="text-sm text-[var(--secondary-gray-text)]">Type</p>
                    <p className="text-lg font-bold text-white">{propertyData.details?.propertyType}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-900 rounded-xl flex items-center justify-center">
                    <Calendar size={18} className="text-orange-300" />
                  </div>
                  <div>
                    <p className="text-sm text-[var(--secondary-gray-text)]">List Date</p>
                    <p className="text-lg font-bold text-white">{propertyData.listDate ? new Date(propertyData.listDate).toLocaleDateString() : '-'}</p>
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
                <button className="px-4 py-3 border border-[var(--tertiary-gray-bg)] text-[var(--primary-gray-text)] rounded-xl hover:bg-[var(--tertiary-gray-bg)] transition-colors flex items-center justify-center gap-2">
                  <Share2 size={18} />
                  <span>Share</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Resale Estimate (API does not provide, so show price and status) */}
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
                <div className="text-2xl font-bold text-green-300 mb-1">${propertyData.listPrice}</div>
                <div className="text-sm text-green-200 font-medium mb-2">List Price</div>
                <div className="flex items-center justify-center gap-1 text-xs text-green-300">
                  <Timer size={12} />
                  {propertyData.status}
                </div>
              </div>
              <div className="text-center p-4 bg-yellow-900/30 rounded-xl border border-yellow-700">
                <div className="text-2xl font-bold text-yellow-300 mb-1">{propertyData.details?.numBedrooms} Bed</div>
                <div className="text-sm text-yellow-200 font-medium mb-2">Bedrooms</div>
                <div className="flex items-center justify-center gap-1 text-xs text-yellow-300">
                  <Timer size={12} />
                  {propertyData.details?.numBathrooms} Bath
                </div>
              </div>
              <div className="text-center p-4 bg-purple-900/30 rounded-xl border border-purple-700">
                <div className="text-2xl font-bold text-purple-300 mb-1">{propertyData.details?.sqft}</div>
                <div className="text-sm text-purple-200 font-medium mb-2">Sqft</div>
                <div className="flex items-center justify-center gap-1 text-xs text-purple-300">
                  <Timer size={12} />
                  {propertyData.details?.style}
                </div>
              </div>
            </div>
          </div>
        </motion.div>


        {/* Buyers Table with Match Percentage */}
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
                Top Matches ({matchedBuyers.length > 3 ? 3 : matchedBuyers.length})
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
                    <th className="px-4 py-3 text-left text-xs font-medium text-[var(--primary-gray-text)] uppercase tracking-wider border-b border-[var(--quaternary-gray-bg)]">Offer</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[var(--primary-gray-text)] uppercase tracking-wider border-b border-[var(--quaternary-gray-bg)]">Timeline</th>
                  </tr>
                </thead>
                <tbody className="bg-[var(--secondary-gray-bg)] divide-y divide-[var(--quaternary-gray-bg)]">
                  {(activeTab === 'top' ? matchedBuyers.slice(0, 3) : matchedBuyers).map((buyer, index) => {
                    // Gold for first, silver for second, bronze for third
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
                        <td className="px-4 py-3 whitespace-nowrap font-bold text-green-400">{formatBudget(buyer.budgetMin, buyer.budgetMax)}</td>
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
                <span className="text-[var(--primary-gray-text)] font-medium">Status</span>
                <span className="text-green-400 font-semibold">{propertyData.status}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-[var(--tertiary-gray-bg)] rounded-xl">
                <span className="text-[var(--primary-gray-text)] font-medium">Description</span>
                <span className="text-white font-semibold truncate max-w-xs">{formatValue(propertyData.details?.description)}</span>
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
                <span className="text-green-400 font-semibold">${formatValue(propertyData.taxes?.annualAmount)}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-[var(--tertiary-gray-bg)] rounded-xl">
                <span className="text-[var(--primary-gray-text)] font-medium">Assessment Year</span>
                <span className="text-white font-semibold">{formatValue(propertyData.taxes?.assessmentYear)}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-[var(--tertiary-gray-bg)] rounded-xl">
                <span className="text-[var(--primary-gray-text)] font-medium">Coop Compensation</span>
                <span className="text-green-400 font-semibold">{formatValue(propertyData.coopCompensation)}</span>
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
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-[var(--tertiary-gray-bg)] rounded-xl">
                <CheckCircle size={16} className="text-green-500 flex-shrink-0" />
                <span className="text-[var(--primary-gray-text)]">Air Conditioning: {formatValue(propertyData.details?.airConditioning)}</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-[var(--tertiary-gray-bg)] rounded-xl">
                <CheckCircle size={16} className="text-green-500 flex-shrink-0" />
                <span className="text-[var(--primary-gray-text)]">Basement: {formatValue(propertyData.details?.basement1)} {formatValue(propertyData.details?.basement2)}</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-[var(--tertiary-gray-bg)] rounded-xl">
                <CheckCircle size={16} className="text-green-500 flex-shrink-0" />
                <span className="text-[var(--primary-gray-text)]">Garage: {formatValue(propertyData.details?.garage)}</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-[var(--tertiary-gray-bg)] rounded-xl">
                <CheckCircle size={16} className="text-green-500 flex-shrink-0" />
                <span className="text-[var(--primary-gray-text)]">Heating: {formatValue(propertyData.details?.heating)}</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-[var(--tertiary-gray-bg)] rounded-xl">
                <CheckCircle size={16} className="text-green-500 flex-shrink-0" />
                <span className="text-[var(--primary-gray-text)]">Swimming Pool: {formatValue(propertyData.details?.swimmingPool)}</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-[var(--tertiary-gray-bg)] rounded-xl">
                <CheckCircle size={16} className="text-green-500 flex-shrink-0" />
                <span className="text-[var(--primary-gray-text)]">Water Source: {formatValue(propertyData.details?.waterSource)}</span>
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
              {propertyData.rooms && propertyData.rooms.length > 0 ? propertyData.rooms.slice(0, 6).map((room, idx) => (
                <div key={idx} className="p-4 bg-[var(--tertiary-gray-bg)] rounded-xl border border-[var(--quaternary-gray-bg)]">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-white">{formatValue(room.description)}</h4>
                    <span className="text-orange-500 font-bold">{formatValue(room.length)} x {formatValue(room.width)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-[var(--secondary-gray-text)]">
                    <span>{formatValue(room.level)}</span>
                    <span>{formatValue(room.features)}</span>
                  </div>
                </div>
              )) : <div className="text-[var(--secondary-gray-text)]">No room data available.</div>}
            </div>
          </motion.div>
        </motion.div>

        {/* Aerial View (show map if available) */}
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
            {propertyData.map?.latitude && propertyData.map?.longitude ? (
              <iframe
                title="Map"
                width="100%"
                height="350"
                style={{ border: 0, borderRadius: '1rem' }}
                loading="lazy"
                allowFullScreen
                src={`https://www.google.com/maps?q=${propertyData.map.latitude},${propertyData.map.longitude}&z=16&output=embed`}
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