import { useState, useRef, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { motion } from "framer-motion"
import {
  Search,
  ChevronDown,
  ChevronUp,
  Edit,
  Eye,
  Trash2,
  FileText,
  Clock,
  AlertCircle,
  CheckCircle,
  Download,
  RefreshCw,
  Users,
  X
} from "lucide-react"
import { pageVariants, pageTransition } from "../../../animations/animation"
// import dealsData from '../../../data/deals.json';
import { getDeals } from "../../../services/dealsService"


const statusColors = {
  Pending: "bg-amber-400/20 text-amber-400 border-amber-400/30",
  Approved: "bg-green-600/20 text-green-400 border-green-400/30",
  Rejected: "bg-red-600/20 text-red-400 border-red-400/30",
  "Under Review": "bg-blue-600/20 text-blue-400 border-blue-400/30",
}
const statusIcons = {
  Pending: <Clock size={18} className="text-amber-400" />,
  Approved: <CheckCircle size={18} className="text-green-400" />,
  Rejected: <X size={18} className="text-red-400" />,
  "Under Review": <ChevronUp size={18} className="text-blue-400" />,
}

const ALL_STATUSES = [
  "Pending",
  "Approved",
  "Rejected",
  "Under Review",
  "Closed",
  "Offer",
  "Draft"
]

export default function DealsTable() {
  const navigate = useNavigate()
  const [search, setSearch] = useState("")
  const [county, setCounty] = useState("")
  const [status, setStatus] = useState("")
  const [scout, setScout] = useState("")
  const [dealList, setDealList] = useState([])
  const [statusEditId, setStatusEditId] = useState(null)
  const [newStatus, setNewStatus] = useState("")

  // Unique filter options
  const counties = Array.from(new Set(dealList.map(d => d.county)))
  const statuses = Array.from(new Set(dealList.map(d => d.status)))
  const scouts = Array.from(new Set(dealList.map(d => d.scout)))

  // Filtering
  const filtered = dealList.filter(d =>
    (search === "" || d.address.toLowerCase().includes(search.toLowerCase()) || d.scout.toLowerCase().includes(search.toLowerCase())) &&
    (county === "" || d.county === county) &&
    (status === "" || d.status === status) &&
    (scout === "" || d.scout === scout)
  )

  // Summary counts
  const total = dealList.length
  const pending = dealList.filter(d => d.status === "Pending").length
  const approved = dealList.filter(d => d.status === "Approved").length
  const rejected = dealList.filter(d => d.status === "Rejected").length

  // Handlers
  const handleApprove = (id) => {
    setDealList(list => list.map(d => d.id === id ? { ...d, status: "Approved" } : d))
  }
  const handleReject = (id) => {
    setDealList(list => list.map(d => d.id === id ? { ...d, status: "Rejected" } : d))
  }
  const handleStatusUpdate = (id) => {
    if (newStatus) setDealList(list => list.map(d => d.id === id ? { ...d, status: newStatus } : d))
    setStatusEditId(null)
    setNewStatus("")
  }
  const handleStatusUpdateDropdown = (id, newStatus) => {
    setDealList(list => list.map(d => d.id === id ? { ...d, status: newStatus } : d))
    setStatusEditId(null)
  }
  const handleViewDeal = (id) => {
    navigate(`/admin/deals/${id}/view`)
  }
  useEffect(() => {
    // Fetch deals from service
    const fetchDeals = async () => {
      try {
        const fetchedDeals = await getDeals()
        console.log("Fetched deals:", fetchedDeals)
        setDealList(fetchedDeals)
      } catch (error) {
        console.error("Error fetching deals:", error)
      }
    }
    fetchDeals()
  }, [])

  // Add refs and click outside handler for dropdown:
  const editBtnRef = useRef(null)
  const dropdownRef = useRef(null)
  useEffect(() => {
    if (!statusEditId) return
    function handleClickOutside(e) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        editBtnRef.current &&
        !editBtnRef.current.contains(e.target)
      ) {
        setStatusEditId(null)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [statusEditId])

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="in"
      exit="out"
      transition={pageTransition}
    >
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-800 rounded-xl shadow-lg p-4 flex flex-col items-start border border-gray-700">
          <span className="text-gray-400 text-sm mb-1">Total Deals</span>
          <span className="text-2xl font-bold text-white">{total}</span>
        </div>
        <div className="bg-gray-800 rounded-xl shadow-lg p-4 flex flex-col items-start border border-gray-700">
          <span className="text-gray-400 text-sm mb-1">Pending</span>
          <span className="text-2xl font-bold text-amber-400">{pending}</span>
        </div>
        <div className="bg-gray-800 rounded-xl shadow-lg p-4 flex flex-col items-start border border-gray-700">
          <span className="text-gray-400 text-sm mb-1">Approved</span>
          <span className="text-2xl font-bold text-green-400">{approved}</span>
        </div>
        <div className="bg-gray-800 rounded-xl shadow-lg p-4 flex flex-col items-start border border-gray-700">
          <span className="text-gray-400 text-sm mb-1">Rejected</span>
          <span className="text-2xl font-bold text-red-400">{rejected}</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8">
        <input
          type="text"
          placeholder="Search deals or scouts..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-gray-800 text-white placeholder-gray-400"
        />
        <select value={status} onChange={e => setStatus(e.target.value)} className="px-4 py-2 border border-gray-600 rounded-lg bg-gray-800 text-white">
          <option value="">All Statuses</option>
          {statuses.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={scout} onChange={e => setScout(e.target.value)} className="px-4 py-2 border border-gray-600 rounded-lg bg-gray-800 text-white">
          <option value="">All Scouts</option>
          {scouts.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Deal Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-8 justify-center items-start max-w-5xl mx-auto">
        {filtered.map(deal => (
          <div key={deal.id} className="bg-gray-800 rounded-xl shadow-lg p-6 flex flex-col justify-between border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="mr-2 text-gray-400">{deal.dealId}</span>
                <h3 className="font-semibold text-white text-lg mb-1">{deal.propertyAddress}</h3>
                <div className="flex items-center text-gray-400 text-sm mb-2">
                </div>
              </div>
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[deal.status] || "bg-gray-700 text-gray-300 border-gray-600"}`}>
                {statusIcons[deal.status]}
                {deal.status}
              </span>
            </div>
            <div className="flex flex-col gap-1 mb-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Offer Price</span>
                <span className="font-semibold text-amber-400">{deal.offerPrice}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Earn Money</span>
                <span className="font-semibold text-green-400">{deal.earnestMoney}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Potential Buyers</span>
                <span className="font-semibold text-green-400">{deal.potentialBuyers}</span>
              </div>
            </div>
            <div className="flex items-center text-sm text-gray-400 mb-4">
              <span className="mr-2">👤 Scout: {deal.scoutName}</span>
            </div>
            {/* Above the action buttons, add a dropdown input for changing status: */}
            <div className="mb-3">
              <label htmlFor={`status-select-${deal.id}`} className="block text-xs font-medium text-gray-400 mb-1">Change Status</label>
              <select
                id={`status-select-${deal.id}`}
                value={deal.status}
                onChange={e => handleStatusUpdateDropdown(deal.id, e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-600 text-sm focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-gray-700 text-white"
              >
                {ALL_STATUSES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            {/* Actions */}
            <div className="flex justify-between items-center gap-2 mt-auto pt-2">
              <button onClick={() => handleViewDeal(deal.id)} title="View Deal" className="p-2 rounded-full hover:bg-gray-700 text-amber-400 transition-colors">
                <Eye size={20} />
              </button>
              <Link to={`/admin/deals/${deal.id}`} title="Matches" className="p-2 rounded-full hover:bg-gray-700 text-green-400 transition-colors">
                <Users size={20} />
              </Link>
              <button onClick={() => handleApprove(deal.id)} title="Approve" className="p-2 rounded-full hover:bg-green-600/20 text-green-400 transition-colors">
                <CheckCircle size={20} />
              </button>
              <button onClick={() => handleReject(deal.id)} title="Reject" className="p-2 rounded-full hover:bg-red-600/20 text-red-400 transition-colors">
                <X size={20} />
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-center text-gray-400 py-12">No deals found.</div>
        )}
      </div>
    </motion.div>
  )
} 