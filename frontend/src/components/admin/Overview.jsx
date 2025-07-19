import { motion } from "framer-motion"
import { 
  FileText, 
  Users, 
  DollarSign, 
  TrendingUp,
  Plus,
  Download,
  Bell,
  Settings
} from "lucide-react"
import { buttonHover, staggerContainer, staggerItem } from "../../animations/animation"
import analyticsData from "../../data/analytics.json"
import deals from "../../data/deals.json"
import buyers from "../../data/buyers.json"

export default function Overview() {
  const quickActions = [
    { label: "Add New Deal", icon: Plus, color: "red" },
    { label: "Export Data", icon: Download, color: "green" },
    { label: "Notifications", icon: Bell, color: "gold" },
    { label: "Settings", icon: Settings, color: "gray" }
  ]

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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
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
          <div className="mt-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-amber-400" />
            <span className="text-sm text-amber-400">{analyticsData.monthlyGrowth}</span>
          </div>
        </motion.div>

        <motion.div
          variants={staggerItem}
          className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Active Buyers</p>
              <p className="text-2xl font-bold text-white">{buyers.filter(b => b.status === "Active").length}</p>
            </div>
            <div className="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center">
              <Users size={24} className="text-green-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-green-400" />
            <span className="text-sm text-green-400">+5 this month</span>
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
          <div className="mt-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-amber-400" />
            <span className="text-sm text-amber-400">+8%</span>
          </div>
        </motion.div>

        <motion.div
          variants={staggerItem}
          className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Conversion Rate</p>
              <p className="text-2xl font-bold text-white">{analyticsData.conversionRate}</p>
            </div>
            <div className="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center">
              <TrendingUp size={24} className="text-green-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-green-400" />
            <span className="text-sm text-green-400">+3%</span>
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
          {deals.slice(0, 3).map((deal) => (
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
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
} 