import { useNavigate, useParams } from "react-router-dom"
import { useState, useEffect } from "react"
import { ArrowLeft, User, Star, Check, Loader2, AlertCircle, X, CheckCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { pageVariants, pageTransition, staggerContainer, staggerItem } from "../../../animations/animation"
import { getDealMatches, updateDeal, getDealById } from "../../../services/dealsService"

export default function DealMatches() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [assignedBuyer, setAssignedBuyer] = useState(null)
  const [matchedBuyers, setMatchedBuyers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [buyersCount, setBuyersCount] = useState(0)
  const [showModal, setShowModal] = useState(false)
  const [assigning, setAssigning] = useState(false);
  const [selectedBuyer, setSelectedBuyer] = useState(null)

  useEffect(() => {
    const fetchDealMatches = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const data = await getDealMatches(id)
        setMatchedBuyers(data.matchedBuyers || [])
        setBuyersCount(data.buyersCount || 0)
        const response = await getDealById(id);
        if (!response) {
          throw new Error("Deal not found");
        }
        if (response.assignedBuyerId) {
          setAssignedBuyer(response.assignedBuyerId)
        }

      } catch (error) {
        console.error("Error fetching deal matches:", error)
        setError(error.message)
      } finally {
        setIsLoading(false)
      }
    }

    if (id) {
      fetchDealMatches()
    }
  }, [id])


  const openAssignModal = (buyer) => {
    setSelectedBuyer(buyer)
    setShowModal(true)
  }

  const confirmAssign = async () => {
    if (!selectedBuyer) return;

    try {
      setAssigning(true);
      await updateDeal(id, {
        assignedBuyerId: selectedBuyer.id,
        assignedBuyerName: selectedBuyer.name || `${selectedBuyer.firstName} ${selectedBuyer.lastName}`,
      });
      setAssignedBuyer(selectedBuyer.id);
      setShowModal(false);
    } catch (error) {
      console.error("Error assigning buyer:", error);
      alert(`Failed to assign buyer: ${error.message}`);
    } finally {
      setAssigning(false);
    }
  };


  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-amber-400 mx-auto mb-4" />
          <p className="text-gray-400">Loading buyer matches...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-[var(--mafia-red)] mx-auto mb-4" />
          <p className="text-red-400 mb-4">Error loading matches: {error}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-amber-400 text-gray-900 rounded-lg hover:bg-amber-500 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    )
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
            {matchedBuyers.map(buyer => (
              <motion.div
                key={buyer.id}
                variants={staggerItem}
                className="relative bg-gray-700 rounded-xl border border-gray-600 shadow-lg p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 group hover:shadow-xl transition-shadow"
              >
                <div className={`absolute left-0 top-0 h-full w-1 rounded-l-xl ${assignedBuyer === buyer.id ? 'bg-green-400' : 'bg-amber-400'} transition-colors`}></div>
                <div className="flex-1 flex flex-col gap-2 text-center sm:text-left">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-lg font-semibold text-white justify-center sm:justify-start">
                    <User size={22} className="text-[var(--mafia-red)] mx-auto sm:mx-0" />
                    <span>{buyer.name || buyer.firstName + ' ' + buyer.lastName || 'Unknown Buyer'}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-400 justify-center sm:justify-start">
                    <span className="flex items-center gap-1 justify-center sm:justify-start">
                      <Star size={16} className="text-amber-400" />
                      Fit Score: <span className="font-bold text-amber-400">{buyer.fitScore || buyer.matchPercent || 0}</span>
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-center sm:justify-end mt-2 sm:mt-0 w-full sm:w-auto">
                  <button
                    onClick={() => openAssignModal(buyer)}
                    disabled={assignedBuyer === buyer.id}
                    className={`w-full sm:w-auto px-6 py-2 rounded-full font-semibold transition-colors shadow-lg text-base flex items-center justify-center text-center gap-2
                      ${assignedBuyer === buyer.id ? "bg-green-600 text-white" : "bg-[var(--mafia-red)] text-white hover:bg-[var(--mafia-red-strong)]"}`}
                  >
                    {assignedBuyer === buyer.id ? (
                      <span className="flex items-center gap-1 justify-center w-full"><Check size={18} /> Assigned</span>
                    ) : (
                      <span className="w-full text-center">Assign</span>
                    )}
                  </button>
                </div>
              </motion.div>
            ))}
            {matchedBuyers.length === 0 && (
              <div className="text-center text-gray-400 py-12">No matching buyers found.</div>
            )}
          </motion.div>
        </motion.div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-gray-800 rounded-xl shadow-xl p-6 max-w-md w-full border border-gray-700 text-center"
            >
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white"
              >
                <X size={20} />
              </button>
              <CheckCircle size={48} className="text-amber-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Assign Buyer</h3>
              <p className="text-gray-400 mb-6">
                Are you sure you want to assign <span className="text-amber-400 font-semibold">{selectedBuyer?.name || selectedBuyer?.firstName + ' ' + selectedBuyer?.lastName}</span> to this deal?
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-500 text-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmAssign}
                  disabled={assigning}
                  className={`px-4 py-2 rounded-lg bg-green-600 hover:bg-green-500 text-white font-semibold flex items-center justify-center gap-2 ${assigning ? 'opacity-80 cursor-not-allowed' : ''}`}
                >
                  {assigning ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Assigning...
                    </>
                  ) : (
                    "Confirm"
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
