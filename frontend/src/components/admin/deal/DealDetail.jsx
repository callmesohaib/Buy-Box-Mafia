import { useNavigate } from "react-router-dom"
import { ArrowLeft, MapPin, User, DollarSign, FileText, Calendar, Users } from "lucide-react"
import { motion } from "framer-motion"
import { pageVariants, pageTransition } from "../../../animations/animation"

const mockDeal = {
  id: 1,
  propertyAddress: "123 Oak Street, Atlanta",
  county: "Fulton County",
  status: "Pending",
  offerPrice: "$125,000",
  earnestMoney: "$5,000",
  potentialBuyers: 3,
  scout: "John Smith",
  notes: "Owner is motivated to sell quickly.",
  closingDate: "2024-03-15",
  submittedDate: "2024-01-15",
  propertyType: "Residential Land",
  size: "2.5 acres",
}

const statusColors = {
  Pending: "bg-amber-400/20 text-amber-400 border-amber-400/30",
  Approved: "bg-green-600/20 text-green-400 border-green-400/30",
  Rejected: "bg-red-600/20 text-red-400 border-red-400/30",
  "Under Review": "bg-blue-600/20 text-blue-400 border-blue-400/30",
}

export default function DealDetail() {
  const navigate = useNavigate()
  const deal = mockDeal 

  return (
    <div className="w-full max-w-3xl mx-auto p-4 font-sans">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 mb-8 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium shadow-lg transition-colors border border-gray-700"
      >
        <ArrowLeft size={18} /> Back to Deals
      </button>
      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="in"
        exit="out"
        transition={pageTransition}
        className="bg-gray-800 rounded-2xl shadow-xl p-8 flex flex-col gap-6 border border-gray-700"
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 border-b border-gray-700 pb-4">
          <div>
            <div className="flex items-center gap-2 text-amber-400 font-semibold text-lg">
              <MapPin size={20} className="text-amber-400" />
              {deal.propertyAddress}
            </div>
            <div className="text-gray-400 text-sm mt-1">{deal.county}</div>
          </div>
          <span className={`inline-block px-4 py-1 rounded-full text-sm font-semibold border ${statusColors[deal.status] || "bg-gray-700 text-gray-300 border-gray-600"}`}>{deal.status}</span>
        </div>
        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center gap-3">
            <DollarSign size={18} className="text-amber-400" />
            <div>
              <div className="text-gray-400 text-xs">Offer Price</div>
              <div className="font-semibold text-white">{deal.offerPrice}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <FileText size={18} className="text-green-400" />
            <div>
              <div className="text-gray-400 text-xs">Earnest Money</div>
              <div className="font-semibold text-white">{deal.earnestMoney}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Users size={18} className="text-green-400" />
            <div>
              <div className="text-gray-400 text-xs">Potential Buyers</div>
              <div className="font-semibold text-green-400">{deal.potentialBuyers}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <User size={18} className="text-red-400" />
            <div>
              <div className="text-gray-400 text-xs">Scout</div>
              <div className="font-semibold text-white">{deal.scout}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <FileText size={18} className="text-gray-400" />
            <div>
              <div className="text-gray-400 text-xs">Property Type</div>
              <div className="font-semibold text-white">{deal.propertyType}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <FileText size={18} className="text-gray-400" />
            <div>
              <div className="text-gray-400 text-xs">Size</div>
              <div className="font-semibold text-white">{deal.size}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Calendar size={18} className="text-amber-400" />
            <div>
              <div className="text-gray-400 text-xs">Closing Date</div>
              <div className="font-semibold text-white">{deal.closingDate}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Calendar size={18} className="text-amber-400" />
            <div>
              <div className="text-gray-400 text-xs">Submitted Date</div>
              <div className="font-semibold text-white">{deal.submittedDate}</div>
            </div>
          </div>
        </div>
        {/* Notes Section */}
        <div>
          <div className="text-gray-400 mb-1 font-medium flex items-center gap-2"><FileText size={16} className="text-gray-400" /> Notes</div>
          <div className="bg-gray-700 rounded-lg p-4 text-gray-300 text-sm border border-gray-600 min-h-[48px]">{deal.notes}</div>
        </div>
      </motion.div>
    </div>
  )
} 