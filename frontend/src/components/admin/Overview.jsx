import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  FileText,
  Users,
  DollarSign,
  TrendingUp,
  Loader2,
  AlertCircle,
} from "lucide-react"
import { staggerContainer, staggerItem } from "../../animations/animation"
import { getOverviewAnalytics } from "../../services/dealsService"

export default function Overview() {
  const [analyticsData, setAnalyticsData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const data = await getOverviewAnalytics()
        setAnalyticsData(data)
      } catch (error) {
        console.error("Error fetching analytics:", error)
        setError(error.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnalytics()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-amber-400 mx-auto mb-4" />
          <p className="text-gray-400">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-4" />
          <p className="text-red-400 mb-4">Error loading analytics: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-amber-400 text-gray-900 rounded-lg hover:bg-amber-500 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!analyticsData) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-4" />
          <p className="text-red-400">No analytics data available</p>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      {/* Welcome Section */}
      <motion.div
        variants={staggerItem}
        className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-6 text-white mb-8 border border-gray-700"
      >
        <h2 className="text-2xl font-bold mb-2">Welcome back, Admin!</h2>
        <p className="text-gray-300">Here's what's happening with your deals today.</p>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-8">
        <motion.div
          variants={staggerItem}
          className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Total Deals</p>
              <p className="text-2xl font-bold text-white">{analyticsData.totalDeals}</p>
            </div>
            <div className="w-12 h-12 bg-amber-400/20 rounded-lg flex items-center justify-center">
              <FileText size={24} className="text-amber-400" />
            </div>
          </div>

        </motion.div>

        <motion.div
          variants={staggerItem}
          className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Total Buyers</p>
              <p className="text-2xl font-bold text-white">{analyticsData.totalBuyers}</p>
            </div>
            <div className="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center">
              <Users size={24} className="text-green-400" />
            </div>
          </div>

        </motion.div>

        <motion.div
          variants={staggerItem}
          className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Total Value</p>
              <p className="text-2xl font-bold text-white">{analyticsData.totalValue}</p>
            </div>
            <div className="w-12 h-12 bg-amber-400/20 rounded-lg flex items-center justify-center">
              <DollarSign size={24} className="text-amber-400" />
            </div>
          </div>

        </motion.div>

      </div>

      {/* Recent Activity */}
      <motion.div
        variants={staggerItem}
        className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {analyticsData.recentDeals && analyticsData.recentDeals.length > 0 ? (
            analyticsData.recentDeals.map((deal) => (
              <div key={deal.id} className="flex items-center gap-4 p-3 bg-gray-700 rounded-lg border border-gray-600">
                <div className="w-10 h-10 bg-green-600/20 rounded-lg flex items-center justify-center">
                  <FileText size={20} className="text-green-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{deal.dealId}</p>
                  <p className="text-xs text-gray-400">{deal.propertyAddress}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-amber-400">{deal.offerPrice}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-400 py-8">
              <FileText size={48} className="mx-auto mb-4 text-gray-600" />
              <p>No recent deals found</p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
} 