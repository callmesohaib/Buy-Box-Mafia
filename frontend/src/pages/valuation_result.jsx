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
import propertiesData from "../data/properties.json";

export default function ValuationResult() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [propertyData, setPropertyData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('top')

  // Simulate fetching property data by ID
  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      const foundProperty = propertiesData.find((p) => p.id === id);
      setPropertyData(foundProperty || null);
      setIsLoading(false);
    }, 500);
  }, [id]);

  const handlePrepareDealPackage = () => {
    navigate("/contract/22")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-gray-800 font-inter flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--mafia-red)] mx-auto mb-4"></div>
          <p className="text-[var(--secondary-gray-text)]">Loading property analysis...</p>
        </div>
      </div>
    )
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
    )
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
            Comprehensive analysis for {propertyData.address}
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
                src={propertyData.propertyImage}
                alt="Property"
                className="w-full h-64 sm:h-80 lg:h-full object-cover"
              />
              <div className="absolute top-4 left-4 bg-[var(--mafia-red)] text-white px-3 py-1 rounded-lg text-sm font-medium">
                {propertyData.zoningType}
              </div>
            </div>

            <div className="p-4 sm:p-6 lg:p-8">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">
                {propertyData.address}
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
                  There are <span className="font-bold">{propertyData.buyerMatch.totalBuyers} buyers</span> who match this property.
                  We can sell it to them for <span className="font-bold">{propertyData.resaleValue}</span>.
                </p>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <TrendingUp size={14} className="text-green-300" />
                    <span className="text-green-200">Resale Value: {propertyData.resaleValue}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingDown size={14} className="text-[var(--mafia-red)]" />
                    <span className="text-[var(--mafia-red)]">Offer Price: {propertyData.estimatedValue}</span>
                  </div>
                </div>
              </motion.div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[var(--tertiary-gray-bg)] rounded-xl flex items-center justify-center">
                    <DollarSign size={18} className="text-[var(--mafia-red)]" />
                  </div>
                  <div>
                    <p className="text-sm text-[var(--secondary-gray-text)]">Estimated Value</p>
                    <p className="text-lg font-bold text-white">{propertyData.estimatedValue}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-900 rounded-xl flex items-center justify-center">
                    <Ruler size={18} className="text-green-300" />
                  </div>
                  <div>
                    <p className="text-sm text-[var(--secondary-gray-text)]">Lot Size</p>
                    <p className="text-lg font-bold text-white">{propertyData.lotSize} acres</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-900 rounded-xl flex items-center justify-center">
                    <Building size={18} className="text-purple-300" />
                  </div>
                  <div>
                    <p className="text-sm text-[var(--secondary-gray-text)]">Owner</p>
                    <p className="text-lg font-bold text-white">{propertyData.ownerName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-900 rounded-xl flex items-center justify-center">
                    <Calendar size={18} className="text-orange-300" />
                  </div>
                  <div>
                    <p className="text-sm text-[var(--secondary-gray-text)]">Last Sale</p>
                    <p className="text-lg font-bold text-white">{propertyData.lastSale}</p>
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

        {/* Resale Estimate with Badges */}
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
              <h3 className="text-lg font-semibold text-white">Resale Estimate</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-900/30 rounded-xl border border-green-700">
                <div className="text-2xl font-bold text-green-300 mb-1">{propertyData.resaleEstimate.quickSale}</div>
                <div className="text-sm text-green-200 font-medium mb-2">Quick Sale</div>
                <div className="flex items-center justify-center gap-1 text-xs text-green-300">
                  <Timer size={12} />
                  {propertyData.resaleEstimate.timeframes.quick}
                </div>
              </div>

              <div className="text-center p-4 bg-yellow-900/30 rounded-xl border border-yellow-700">
                <div className="text-2xl font-bold text-yellow-300 mb-1">{propertyData.resaleEstimate.marketValue}</div>
                <div className="text-sm text-yellow-200 font-medium mb-2">Market Value</div>
                <div className="flex items-center justify-center gap-1 text-xs text-yellow-300">
                  <Timer size={12} />
                  {propertyData.resaleEstimate.timeframes.market}
                </div>
              </div>

              <div className="text-center p-4 bg-purple-900/30 rounded-xl border border-purple-700">
                <div className="text-2xl font-bold text-purple-300 mb-1">{propertyData.resaleEstimate.premium}</div>
                <div className="text-sm text-purple-200 font-medium mb-2">Premium</div>
                <div className="flex items-center justify-center gap-1 text-xs text-purple-300">
                  <Timer size={12} />
                  {propertyData.resaleEstimate.timeframes.premium}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Buyers Table with Tabs */}
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
                Top Matches ({propertyData.buyerMatch.topBuyers.length})
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
                All Buyers ({propertyData.buyerMatch.totalBuyers})
              </div>
            </button>
          </div>

          <div className="overflow-x-auto buyer-table-scroll" style={{ maxHeight: '340px', minHeight: '120px', overflowY: 'auto' }}>
            <table className="w-full border-collapse">
              <thead className="bg-[var(--tertiary-gray-bg)] sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--primary-gray-text)] uppercase tracking-wider border-b border-[var(--quaternary-gray-bg)]">Rank</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--primary-gray-text)] uppercase tracking-wider border-b border-[var(--quaternary-gray-bg)]">Buyer</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--primary-gray-text)] uppercase tracking-wider border-b border-[var(--quaternary-gray-bg)]">Fit Score</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--primary-gray-text)] uppercase tracking-wider border-b border-[var(--quaternary-gray-bg)]">Offer</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--primary-gray-text)] uppercase tracking-wider border-b border-[var(--quaternary-gray-bg)]">Close Time</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--primary-gray-text)] uppercase tracking-wider border-b border-[var(--quaternary-gray-bg)]">Status</th>
                </tr>
              </thead>
              <tbody className="bg-[var(--secondary-gray-bg)] divide-y divide-[var(--quaternary-gray-bg)]">
                {(activeTab === 'top' ? propertyData.buyerMatch.topBuyers : [...propertyData.buyerMatch.topBuyers, ...propertyData.buyerMatch.allBuyers]).map((buyer, index) => (
                  <motion.tr
                    key={buyer.id}
                    variants={staggerItem}
                    initial="initial"
                    animate="animate"
                    className={`hover:bg-[var(--tertiary-gray-bg)] transition-colors ${index === 0 && activeTab === 'top'
                      ? 'bg-[linear-gradient(to_right,rgba(247,200,68,0.2),rgba(247,200,68,0.1))] border-l-4 border-[var(--gold)]'
                      : ''
                      }`}
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${index === 0 ? 'bg-[var(--gold)] text-[var(--grey)]' :
                        index === 1 ? 'bg-[var(--secondary-gray-text)] text-white' :
                          index === 2 ? 'bg-[var(--quaternary-gray-bg)] text-white' : 'bg-[var(--tertiary-gray-bg)] text-[var(--primary-gray-text)]'
                        }`}>
                        {index + 1}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div>
                        <div className={`text-sm font-medium ${index === 0 && activeTab === 'top' ? 'text-[var(--gold)]' : 'text-white'
                          }`}>Buyer {index + 1}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className={`text-sm font-bold ${buyer.fitScore >= 90 ? 'text-[var(--green)]' :
                          buyer.fitScore >= 85 ? 'text-[var(--gold)]' :
                            'text-[var(--primary-gray-text)]'
                          }`}>
                          {buyer.fitScore}%
                        </div>
                        {index === 0 && activeTab === 'top' && (
                          <Star size={12} className="text-[var(--gold)] fill-current" />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className={`text-sm font-semibold ${index === 0 && activeTab === 'top' ? 'text-[var(--gold)]' : 'text-[var(--green)]'
                        }`}>{buyer.maxPrice}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-sm text-[var(--primary-gray-text)]">
                        <Clock size={12} className="text-[var(--secondary-gray-text)]" />
                        {buyer.closeTime}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${index === 0 && activeTab === 'top'
                        ? 'bg-[var(--gold)/20] text-[var(--gold)]'
                        : 'bg-[var(--green)/20] text-[var(--green)]'
                        }`}>
                        {buyer.status}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Market Analysis & Investment Metrics */}
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

            <motion.div
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="space-y-4"
            >
              <motion.div variants={staggerItem} className="flex items-center justify-between p-4 bg-[var(--tertiary-gray-bg)] rounded-xl">
                <span className="text-[var(--primary-gray-text)] font-medium">Market Trend</span>
                <span className="text-green-400 font-semibold">{propertyData.marketAnalysis.marketTrend}</span>
              </motion.div>

              <motion.div variants={staggerItem} className="flex items-center justify-between p-4 bg-[var(--tertiary-gray-bg)] rounded-xl">
                <span className="text-[var(--primary-gray-text)] font-medium">Days on Market</span>
                <span className="text-white font-semibold">{propertyData.marketAnalysis.daysOnMarket}</span>
              </motion.div>

              <motion.div variants={staggerItem} className="flex items-center justify-between p-4 bg-[var(--tertiary-gray-bg)] rounded-xl">
                <span className="text-[var(--primary-gray-text)] font-medium">Comparable Sales</span>
                <span className="text-white font-semibold">{propertyData.marketAnalysis.comparableSales}</span>
              </motion.div>

              <motion.div variants={staggerItem} className="flex items-center justify-between p-4 bg-[var(--tertiary-gray-bg)] rounded-xl">
                <span className="text-[var(--primary-gray-text)] font-medium">Market Activity</span>
                <span className="text-green-400 font-semibold">{propertyData.marketAnalysis.marketActivity}</span>
              </motion.div>
            </motion.div>
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

            <motion.div
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="space-y-4"
            >
              <motion.div variants={staggerItem} className="flex items-center justify-between p-4 bg-[var(--tertiary-gray-bg)] rounded-xl">
                <span className="text-[var(--primary-gray-text)] font-medium">Cap Rate</span>
                <span className="text-green-400 font-semibold">{propertyData.investmentMetrics.capRate}</span>
              </motion.div>

              <motion.div variants={staggerItem} className="flex items-center justify-between p-4 bg-[var(--tertiary-gray-bg)] rounded-xl">
                <span className="text-[var(--primary-gray-text)] font-medium">Cash on Cash</span>
                <span className="text-green-400 font-semibold">{propertyData.investmentMetrics.cashOnCash}</span>
              </motion.div>

              <motion.div variants={staggerItem} className="flex items-center justify-between p-4 bg-[var(--tertiary-gray-bg)] rounded-xl">
                <span className="text-[var(--primary-gray-text)] font-medium">Appreciation</span>
                <span className="text-green-400 font-semibold">{propertyData.investmentMetrics.appreciation}</span>
              </motion.div>

              <motion.div variants={staggerItem} className="flex items-center justify-between p-4 bg-[var(--tertiary-gray-bg)] rounded-xl">
                <span className="text-[var(--primary-gray-text)] font-medium">Risk Level</span>
                <span className="text-orange-400 font-semibold">{propertyData.investmentMetrics.riskLevel}</span>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Property Features & Comparable Properties */}
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

            <motion.div
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="space-y-3"
            >
              {propertyData.propertyFeatures.map((feature, index) => (
                <motion.div
                  key={index}
                  variants={staggerItem}
                  className="flex items-center gap-3 p-3 bg-[var(--tertiary-gray-bg)] rounded-xl"
                >
                  <CheckCircle size={16} className="text-green-500 flex-shrink-0" />
                  <span className="text-[var(--primary-gray-text)]">{feature}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Comparable Properties */}
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
              <h3 className="text-xl font-semibold text-white">Comparable Properties</h3>
            </div>

            <motion.div
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="space-y-4"
            >
              {propertyData.comparableProperties.map((comp, index) => (
                <motion.div
                  key={index}
                  variants={staggerItem}
                  className="p-4 bg-[var(--tertiary-gray-bg)] rounded-xl border border-[var(--quaternary-gray-bg)]"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-white">{comp.address}</h4>
                    <span className="text-orange-500 font-bold">{comp.price}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-[var(--secondary-gray-text)]">
                    <span>{comp.size}</span>
                    <span>Sold: {new Date(comp.soldDate).toLocaleDateString()}</span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Aerial View */}
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
            <img
              src={propertyData.aerialImage}
              alt="Aerial View"
              className="w-full h-64 sm:h-80 lg:h-96 object-cover rounded-xl"
            />
          </div>
        </motion.div>
      </div>
    </div>
  )
} 