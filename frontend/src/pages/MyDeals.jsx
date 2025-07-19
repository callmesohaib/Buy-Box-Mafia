import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
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
} from "lucide-react"
import {
  fadeInUp,
  fadeInDown,
  buttonHover,
  staggerContainer,
  staggerItem
} from "../animations/animation"
import mydeals from "../data/mydeals.json"

export default function MyDeals() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("All")
  const [selectedDateRange, setSelectedDateRange] = useState("All")
  const [sortBy, setSortBy] = useState("date")

  const [deals, setDeals] = useState(mydeals)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const statusOptions = ["All", "Draft", "Pending", "Offer", "Closed"]
  const dateRangeOptions = ["All", "Last 7 days", "Last 30 days", "Last 90 days", "This year"]
  const sortOptions = [
    { value: "date", label: "Date Submitted" },
    { value: "price", label: "Offer Price" },
    { value: "status", label: "Status" },
    { value: "closing", label: "Closing Date" }
  ]

  const getStatusColor = (status) => {
    switch (status) {
      case "Draft": return "bg-[var(--tertiary-gray-bg)] text-[var(--primary-gray-text)] border-[var(--quaternary-gray-bg)]"
      case "Pending": return "bg-yellow-900/50 text-yellow-200 border-yellow-700"
      case "Offer": return "bg-[var(--mafia-red)]/20 text-[var(--mafia-red)] border-[var(--mafia-red)]/30"
      case "Closed": return "bg-green-900/50 text-green-200 border-green-700"
      default: return "bg-[var(--tertiary-gray-bg)] text-[var(--primary-gray-text)] border-[var(--quaternary-gray-bg)]"
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "Draft": return <FileText size={16} />
      case "Pending": return <Clock size={16} />
      case "Offer": return <AlertCircle size={16} />
      case "Closed": return <CheckCircle size={16} />
      default: return <FileText size={16} />
    }
  }

  const filterDealsByDate = (deal) => {
    if (selectedDateRange === "All") return true
    
    const dealDate = new Date(deal.submittedDate)
    const now = new Date()
    const diffTime = Math.abs(now - dealDate)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    switch (selectedDateRange) {
      case "Last 7 days":
        return diffDays <= 7
      case "Last 30 days":
        return diffDays <= 30
      case "Last 90 days":
        return diffDays <= 90
      case "This year":
        return dealDate.getFullYear() === now.getFullYear()
      default:
        return true
    }
  }

  const filteredDeals = deals.filter(deal => {
    const matchesSearch = deal.propertyAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         deal.dealId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         deal.owner.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === "All" || deal.status === selectedStatus
    const matchesDate = filterDealsByDate(deal)
    return matchesSearch && matchesStatus && matchesDate
  })

  const sortedDeals = [...filteredDeals].sort((a, b) => {
    switch (sortBy) {
      case "price":
        return parseFloat(a.offerPrice.replace(/[$,]/g, "")) - parseFloat(b.offerPrice.replace(/[$,]/g, ""))
      case "status":
        return a.status.localeCompare(b.status)
      case "closing":
        return new Date(a.closingDate) - new Date(b.closingDate)
      default:
        return new Date(b.submittedDate) - new Date(a.submittedDate)
    }
  })

  const handleViewDetails = (dealId) => {
    navigate(`/submit/${dealId}`)
  }

  const handleEditDeal = (dealId) => {
    navigate(`/contract/${dealId}`)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-[var(--from-bg)] to-[var(--secondary-gray-bg)] pt-5 pb-8 overflow-x-hidden"
    >
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

        {/* Search and Filters */}
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          className="bg-[var(--secondary-gray-bg)] rounded-xl p-4 shadow-sm border border-[var(--tertiary-gray-bg)] mb-8"
        >
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-center">
            {/* Search */}
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
            <div className="flex gap-2">
              <div className="relative">
                <select
                  value={selectedDateRange}
                  onChange={(e) => setSelectedDateRange(e.target.value)}
                  className="px-3 py-2 text-sm border border-[var(--tertiary-gray-bg)] bg-[var(--secondary-gray-bg)] text-white rounded-lg focus:ring-2 focus:ring-[var(--mafia-red)] focus:border-transparent transition-all duration-200 appearance-none pr-8 h-9"
                  style={{ minWidth: 110 }}
                >
                  {dateRangeOptions.map(dateRange => (
                    <option key={dateRange} value={dateRange}>{dateRange}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[var(--placeholder-gray)] pointer-events-none" />
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
                {/* Header */}
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

                {/* Property Info */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-start gap-2">
                    <MapPin size={16} className="text-[var(--placeholder-gray)] mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-[var(--primary-gray-text)] line-clamp-2">{deal.propertyAddress}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-[var(--placeholder-gray)]" />
                    <p className="text-sm text-[var(--primary-gray-text)]">{deal.owner}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign size={16} className="text-[var(--placeholder-gray)]" />
                    <p className="text-sm font-medium text-white">{deal.offerPrice}</p>
                  </div>
                </div>

                {/* Dates */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-xs text-[var(--secondary-gray-text)]">
                    <Clock size={14} />
                    <span>Submitted: {new Date(deal.submittedDate).toLocaleDateString()}</span>
                  </div>
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
                    onClick={() => handleEditDeal(deal.id)}
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
    </motion.div>
  )
} 