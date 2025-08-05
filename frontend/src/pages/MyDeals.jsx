import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  Search,
  MapPin,
  DollarSign,
  User,
  Eye,
  Edit,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  Plus,
  Mail,
  Calendar
} from "lucide-react"
import {
  fadeInUp,
  fadeInDown,
  buttonHover,
  staggerContainer,
  staggerItem
} from "../animations/animation"
import { getMyDeals } from "../services/dealsService"
import { useAuth } from "../store/AuthContext"

export default function MyDeals() {
  const navigate = useNavigate()
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("All")
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [sortBy, setSortBy] = useState("date")
  const [deals, setDeals] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  useEffect(() => {
    const fetchDeals = async () => {
      setLoading(true);
      try {
        const myDeals = await getMyDeals(user);
        setDeals(myDeals);
      } catch (err) {
        setDeals([]);
      } finally {
        setLoading(false);
      }
    };
    fetchDeals();
  }, [user]);

  const statusOptions = ["All", "Draft", "Pending", "Offer", "Closed"]

  const getStatusColor = (dealStatus) => {
    const status = (dealStatus || "").trim().toLowerCase();
    switch (status) {
      case "draft": return "bg-[var(--tertiary-gray-bg)] text-[var(--primary-gray-text)] border-[var(--quaternary-gray-bg)]";
      case "pending": return "bg-yellow-400/30 text-yellow-400 border-yellow-400";
      case "offer": return "bg-[var(--mafia-red)]/20 text-[var(--mafia-red)] border-[var(--mafia-red)]/30";
      case "closed": return "bg-green-900/50 text-green-200 border-green-700";
      default: return "bg-[var(--tertiary-gray-bg)] text-[var(--primary-gray-text)] border-[var(--quaternary-gray-bg)]";
    }
  }

  const getStatusIcon = (dealStatus) => {
    const status = (dealStatus || "").trim().toLowerCase();
    switch (status) {
      case "draft": return <FileText size={16} />;
      case "pending": return <Clock size={16} />;
      case "offer": return <AlertCircle size={16} />;
      case "closed": return <CheckCircle size={16} />;
      default: return <FileText size={16} />;
    }
  }

  const filterDealsByDateRange = (deal) => {
    if (!startDate && !endDate) return true;

    const closingDate = new Date(deal.closingDate);

    if (startDate && !endDate) {
      return closingDate >= startDate;
    }

    if (!startDate && endDate) {
      return closingDate <= endDate;
    }

    return closingDate >= startDate && closingDate <= endDate;
  }

  const filteredDeals = deals.filter(deal => {
    const matchesSearch = (deal.propertyAddress || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (deal.dealId || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (deal.owner || deal.sellerName || "").toLowerCase().includes(searchTerm.toLowerCase());
    const status = (deal.status || "").trim().toLowerCase();
    const selected = selectedStatus.trim().toLowerCase();
    const matchesStatus = selected === "all" || status === selected;
    const matchesDate = filterDealsByDateRange(deal)
    return matchesSearch && matchesStatus && matchesDate
  })

  const sortedDeals = [...filteredDeals].sort((a, b) => {
    switch (sortBy) {
      case "price":
        return parseFloat(a.offerPrice.replace(/[$,]/g, "")) - parseFloat(b.offerPrice.replace(/[$,]/g, ""))
      case "status":
        return (a.status || "").localeCompare(b.status || "")
      case "closing":
        return new Date(a.closingDate) - new Date(b.closingDate)
      default:
        return new Date(b.submittedDate) - new Date(a.submittedDate)
    }
  })

  const handleViewDetails = (dealId) => {
    const deal = deals.find(d => d.id === dealId);
    if (deal) {
      setSelectedDeal(deal);
      setModalOpen(true);
    }
  }

  const handleEditDeal = (dealId) => {
    navigate(`/contract/${dealId}`)
  }

  const clearDateRange = () => {
    setStartDate(null);
    setEndDate(null);
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-[var(--from-bg)] to-[var(--secondary-gray-bg)] pt-5 pb-8 overflow-x-hidden flex items-center justify-center"
    >
      {modalOpen && selectedDeal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-2xl p-6 w-full max-w-2xl relative border border-gray-700 max-h-[90vh] overflow-y-auto"
          >
            <button
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-700 transition-colors duration-200"
              onClick={() => setModalOpen(false)}
              aria-label="Close"
            >
              <svg className="w-5 h-5 text-gray-400 hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Header */}
            <div className="border-b border-gray-700 pb-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">Deal Overview</h2>
                  <div className="text-gray-400 text-xs mt-1">
                    Deal ID: <span className="font-mono bg-gray-700 px-2 py-1 rounded-md text-blue-300">{selectedDeal.dealId}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Property Info */}
              <div className="space-y-4">
                <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                  <div className="flex items-center gap-2 mb-3">
                    <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    <h3 className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Property</h3>
                  </div>
                  <div className="space-y-3">
                    <DetailItem label="Address" value={selectedDeal.propertyAddress} />
                    <DetailItem label="Type" value={selectedDeal.propertyType} />
                  </div>
                </div>

                {/* Seller Info */}
                <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                  <div className="flex items-center gap-2 mb-3">
                    <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <h3 className="text-xs font-semibold text-purple-400 uppercase tracking-wider">Seller</h3>
                  </div>
                  <div className="space-y-3">
                    <DetailItem label="Name" value={selectedDeal.sellerName} />
                    <DetailItem label="Email" value={selectedDeal.sellerEmail} isEmail />
                    <DetailItem label="Phone" value={selectedDeal.sellerPhone} isPhone />
                  </div>
                </div>
              </div>

              {/* Deal Info */}
              <div className="space-y-4">
                <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                  <div className="flex items-center gap-2 mb-3">
                    <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-xs font-semibold text-green-400 uppercase tracking-wider">Terms</h3>
                  </div>
                  <div className="space-y-3">
                    <DetailItem label="Offer Price" value={selectedDeal.offerPrice} isPrice />
                    <DetailItem label="Status" value={selectedDeal.status} />
                    <DetailItem label="Financing" value={selectedDeal.financingType || 'Not specified'} />
                  </div>
                </div>

                {/* Dates */}
                <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                  <div className="flex items-center gap-2 mb-3">
                    <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <h3 className="text-xs font-semibold text-yellow-400 uppercase tracking-wider">Timeline</h3>
                  </div>
                  <div className="space-y-3">
                    <DetailItem
                      label="Closing Date"
                      value={selectedDeal.closingDate ? new Date(selectedDeal.closingDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      }) : 'Not set'}
                    />
                    <DetailItem
                      label="Inspection"
                      value={selectedDeal.inspectionPeriod || 'Not specified'}

                    />
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="md:col-span-2 bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">Additional Details</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 justify-between">
                  <div className="flex-1 min-w-0">
                    <DetailItem label="Survey" value={selectedDeal.surveyRequired ? 'Required' : 'Not required'} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <DetailItem label="Title Insurance" value={selectedDeal.titleInsurance || 'Not specified'} />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="mt-6 pt-4 border-t border-gray-700 flex justify-end space-x-3">
              <button
                className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors duration-200"
                onClick={() => setModalOpen(false)}
              >
                Close
              </button>

            </div>
          </motion.div>
        </div>
      )}
      {loading ? (
        <div className="flex flex-col items-center justify-center w-full h-[60vh]">
          <svg className="animate-spin h-14 w-14 text-[var(--mafia-red)] mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
          </svg>
          <div className="text-white text-lg font-semibold">Loading your deals...</div>
        </div>
      ) : (
        <div className="w-[90%] mx-auto max-w-7xl">
          {/* Header */}
          <motion.div
            variants={fadeInDown}
            initial="initial"
            animate="animate"
            className="mb-8"
          >
            <div className="mb-4">
              <div>
                <h1 className="text-3xl font-bold text-white">My Deals Tracker</h1>
                <p className="text-[var(--secondary-gray-text)] mt-1">Track and manage your submitted deals</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            className="bg-[var(--secondary-gray-bg)] rounded-xl p-4 shadow-sm border border-[var(--tertiary-gray-bg)] mb-8"
          >
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-center">
              <div className="relative flex-1 w-full sm:w-auto">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--placeholder-gray)]" />
                <input
                  type="text"
                  placeholder="Search deals by address, deal ID, or owner..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-2 py-2 text-sm border border-[var(--tertiary-gray-bg)] bg-[var(--secondary-gray-bg)] text-white placeholder-[var(--placeholder-gray)] rounded-lg focus:ring-2 focus:ring-[var(--mafia-red)] focus:border-transparent transition-all duration-200 h-9"
                />
              </div>
              {/* Filters and Sort By */}
              <div className="flex gap-2 flex-wrap">
                {/* Calendar Date Range Picker */}
                <div className="flex items-center gap-2 bg-[var(--tertiary-gray-bg)] rounded-lg px-2 border border-[var(--quaternary-gray-bg)]">
                  <Calendar size={14} className="text-[var(--placeholder-gray)]" />
                  <div className="flex items-center gap-1">
                    <DatePicker
                      selected={startDate}
                      onChange={(date) => setStartDate(date)}
                      selectsStart
                      startDate={startDate}
                      endDate={endDate}
                      placeholderText="Start date"
                      className="bg-transparent text-white text-sm py-2 w-24 focus:outline-none"
                      dateFormat="MM/dd/yyyy"
                    />
                    <span className="text-[var(--placeholder-gray)]">to</span>
                    <DatePicker
                      selected={endDate}
                      onChange={(date) => setEndDate(date)}
                      selectsEnd
                      startDate={startDate}
                      endDate={endDate}
                      minDate={startDate}
                      placeholderText="End date"
                      className="bg-transparent text-white text-sm py-2 w-24 focus:outline-none"
                      dateFormat="MM/dd/yyyy"
                    />
                    {(startDate || endDate) && (
                      <button
                        onClick={clearDateRange}
                        className="text-[var(--placeholder-gray)] hover:text-white p-1"
                        title="Clear dates"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </button>
                    )}
                  </div>
                </div>

                <div className="relative">
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="px-3 py-2 text-sm border border-[var(--tertiary-gray-bg)] bg-[var(--secondary-gray-bg)] text-white rounded-lg focus:ring-2 focus:ring-[var(--mafia-red)] focus:border-transparent transition-all duration-200 appearance-none pr-8 h-9"
                    style={{ minWidth: 90 }}
                  >
                    {statusOptions.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[var(--placeholder-gray)] pointer-events-none" />
                </div>
              </div>
            </div>
          </motion.div>
          {/* Results Count */}
          <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            className="mb-6"
          >
            <p className="text-[var(--secondary-gray-text)]">
              Showing {sortedDeals.length} of {deals.length} deals
            </p>
          </motion.div>
          <AnimatePresence mode="wait">
            <motion.div
              key="cards"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {sortedDeals.map((deal, index) => (
                <motion.div
                  key={deal.id}
                  variants={staggerItem}
                  className="bg-[var(--secondary-gray-bg)] rounded-xl p-6 shadow-sm border border-[var(--tertiary-gray-bg)] hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-white">{deal.dealId}</h3>
                      <p className="text-sm text-[var(--secondary-gray-text)]">{deal.propertyType}</p>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(deal.status)}`}>
                      {getStatusIcon(deal.status)}
                      {deal.status}
                    </span>
                  </div>
                  <div className="space-y-3 mb-4">
                    <div className="flex items-start gap-2">
                      <MapPin size={16} className="text-[var(--placeholder-gray)] mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-[var(--primary-gray-text)] line-clamp-2">{deal.propertyAddress}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <User size={16} className="text-[var(--placeholder-gray)]" />
                      <p className="text-sm text-[var(--primary-gray-text)]">{deal.sellerName}</p>
                      <Mail size={16} className="text-[var(--placeholder-gray)]" />
                      <p className="text-sm text-[var(--primary-gray-text)]">{deal.sellerEmail}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign size={16} className="text-[var(--placeholder-gray)]" />
                      <p className="text-sm font-medium text-white">{deal.offerPrice}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText size={16} className="text-[var(--placeholder-gray)]" />
                      <p className="text-sm text-[var(--primary-gray-text)]">Inspection Period: {deal.inspectionPeriod || 'N/A'}</p>
                    </div>
                  </div>
                  {/* Dates */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-xs text-[var(--secondary-gray-text)]">
                      <Clock size={14} />
                      <span>Closing: {new Date(deal.closingDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                  {/* Actions */}
                  <div className="flex gap-2">
                    <motion.button
                      variants={buttonHover}
                      whileHover="whileHover"
                      whileTap="whileTap"
                      onClick={() => handleViewDetails(deal.id)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[var(--mafia-red)] text-white text-sm rounded-lg hover:bg-[var(--mafia-red-hover)] transition-colors"
                    >
                      <Eye size={16} />
                      View
                    </motion.button>
                    <motion.button
                      variants={buttonHover}
                      whileHover="whileHover"
                      whileTap="whileTap"
                      onClick={() => handleEditDeal(deal.dealId)}
                      className="px-3 py-2 border border-[var(--tertiary-gray-bg)] text-[var(--primary-gray-text)] text-sm rounded-lg hover:bg-[var(--tertiary-gray-bg)] transition-colors"
                    >
                      <Edit size={16} />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
          {/* Empty State */}
          {sortedDeals.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <div className="w-16 h-16 bg-[var(--tertiary-gray-bg)] rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText size={32} className="text-[var(--placeholder-gray)]" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">No deals found</h3>
              <p className="text-[var(--secondary-gray-text)] mb-6">Try adjusting your search criteria or create a new deal.</p>
              <motion.button
                variants={buttonHover}
                whileHover="whileHover"
                whileTap="whileTap"
                onClick={() => navigate("/property-search")}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--mafia-red)] text-white rounded-lg hover:bg-[var(--mafia-red-hover)] transition-colors"
              >
                <Plus size={20} />
                Create New Deal
              </motion.button>
            </motion.div>
          )}
        </div>
      )}
    </motion.div>
  )
}

const DetailItem = ({ label, value, isEmail = false, isPrice = false }) => (
  <div>
    <p className="text-xs text-[var(--secondary-gray-text)] uppercase tracking-wider">{label}</p>
    <p className="text-white font-medium break-words">
      {isEmail ? (
        <a href={`mailto:${value}`} className="hover:text-[var(--mafia-red)] transition-colors">
          {value}
        </a>
      ) : isPrice ? (
        <span className="text-green-400">${value.toLocaleString()}</span>
      ) : (
        value
      )}
    </p>
  </div>
);