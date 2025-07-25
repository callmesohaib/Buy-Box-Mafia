import { useNavigate } from "react-router-dom"
import { useState } from "react"
import { ArrowLeft, User, DollarSign, Star, Check } from "lucide-react"
import { motion } from "framer-motion"
import { pageVariants, pageTransition, staggerContainer, staggerItem } from "../../../animations/animation"

const mockBuyers = [
  { id: 1, name: "Alice Brown", fitScore: 92, maxOffer: 120000 },
  { id: 2, name: "Bob Smith", fitScore: 88, maxOffer: 118000 },
  { id: 3, name: "Charlie Green", fitScore: 80, maxOffer: 115000 },
]

export default function DealMatches() {
  const navigate = useNavigate()
  const [assignedBuyer, setAssignedBuyer] = useState(null)

  const handleAssign = (buyerId) => {
    setAssignedBuyer(buyerId)
  }

  return (
    <div className="w-full min-h-screen bg-gray-900 py-4 px-2">
      <div className="max-w-3xl mx-auto">
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
          className="bg-gray-800 rounded-2xl shadow-xl p-4 sm:p-8 flex flex-col gap-6 border border-gray-700"
        >
          <div className="mb-2">
            <h2 className="text-2xl font-bold text-white mb-1">Matching Buyers</h2>
            <p className="text-gray-400">These buyers match this deal. You can assign one manually if needed.</p>
          </div>
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="flex flex-col gap-5"
          >
            {mockBuyers.map(buyer => (
              <motion.div
                key={buyer.id}
                variants={staggerItem}
                className="relative bg-gray-700 rounded-xl border border-gray-600 shadow-lg p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 group hover:shadow-xl transition-shadow"
              >
                {/* Accent bar */}
                <div className={`absolute left-0 top-0 h-full w-1 rounded-l-xl ${assignedBuyer === buyer.id ? 'bg-green-400' : 'bg-amber-400'} transition-colors`}></div>
                <div className="flex-1 flex flex-col gap-2 text-center sm:text-left">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-lg font-semibold text-white justify-center sm:justify-start">
                    <User size={22} className="text-red-400 mx-auto sm:mx-0" />
                    <span>{buyer.name}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-400 justify-center sm:justify-start">
                    <span className="flex items-center gap-1 justify-center sm:justify-start"><Star size={16} className="text-amber-400" /> Fit Score: <span className="font-bold text-amber-400">{buyer.fitScore}</span></span>
                    <span className="flex items-center gap-1 justify-center sm:justify-start"><DollarSign size={16} className="text-green-400" /> Max Offer: <span className="font-bold text-green-400">${buyer.maxOffer.toLocaleString()}</span></span>
                  </div>
                </div>
                <div className="flex items-center justify-center sm:justify-end mt-2 sm:mt-0 w-full sm:w-auto">
                  <button
                    onClick={() => handleAssign(buyer.id)}
                    disabled={assignedBuyer === buyer.id}
                    className={`w-full sm:w-auto px-6 py-2 rounded-full font-semibold transition-colors shadow-lg text-base flex items-center justify-center text-center gap-2
                      ${assignedBuyer === buyer.id ? "bg-green-600 text-white" : "bg-red-600 text-white hover:bg-red-700"}`}
                  >
                    {assignedBuyer === buyer.id ? <span className="flex items-center gap-1 justify-center w-full"><Check size={18} /> Assigned</span> : <span className="w-full text-center">Assign</span>}
                  </button>
                </div>
              </motion.div>
            ))}
            {mockBuyers.length === 0 && (
              <div className="text-center text-gray-400 py-12">No matching buyers found.</div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
} 