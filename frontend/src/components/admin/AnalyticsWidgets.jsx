import { motion } from "framer-motion"
import { 
  FileText, 
  DollarSign, 
  Clock, 
  BarChart3, 
  TrendingUp, 
  TrendingDown 
} from "lucide-react"
import { staggerContainer, staggerItem } from "../../animations/animation"
import analyticsData from '../../data/analytics.json';

export default function AnalyticsWidgets({ analyticsData: analyticsDataProp }) {
  const data = analyticsDataProp || analyticsData;
  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      {/* Analytics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
        <motion.div
          variants={staggerItem}
          className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Total Deals</p>
              <p className="text-2xl font-bold text-white">{data.totalDeals}</p>
            </div>
            <div className="w-12 h-12 bg-red-600/20 rounded-lg flex items-center justify-center">
              <FileText size={24} className="text-red-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-green-400" />
            <span className="text-sm text-green-400">{data.monthlyGrowth}</span>
          </div>
        </motion.div>

        <motion.div
          variants={staggerItem}
          className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Total Value</p>
              <p className="text-2xl font-bold text-white">{data.totalValue}</p>
            </div>
            <div className="w-12 h-12 bg-amber-400/20 rounded-lg flex items-center justify-center">
              <DollarSign size={24} className="text-amber-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-green-400" />
            <span className="text-sm text-green-400">+8%</span>
          </div>
        </motion.div>

        <motion.div
          variants={staggerItem}
          className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Avg Close Time</p>
              <p className="text-2xl font-bold text-white">{data.avgCloseTime}</p>
            </div>
            <div className="w-12 h-12 bg-amber-400/20 rounded-lg flex items-center justify-center">
              <Clock size={24} className="text-amber-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <TrendingDown size={16} className="text-red-400" />
            <span className="text-sm text-red-400">-5 days</span>
          </div>
        </motion.div>

        <motion.div
          variants={staggerItem}
          className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Conversion Rate</p>
              <p className="text-2xl font-bold text-white">{data.conversionRate}</p>
            </div>
            <div className="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center">
              <BarChart3 size={24} className="text-green-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-green-400" />
            <span className="text-sm text-green-400">+3%</span>
          </div>
        </motion.div>
      </div>

      {/* Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          variants={staggerItem}
          className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Deal Status Distribution</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-amber-400 rounded-full"></div>
                <span className="text-sm text-gray-300">Pending</span>
              </div>
              <span className="text-sm font-medium text-white">40%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                <span className="text-sm text-gray-300">Offer</span>
              </div>
              <span className="text-sm font-medium text-white">20%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <span className="text-sm text-gray-300">Closed</span>
              </div>
              <span className="text-sm font-medium text-white">20%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                <span className="text-sm text-gray-300">Draft</span>
              </div>
              <span className="text-sm font-medium text-white">20%</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={staggerItem}
          className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Monthly Performance</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">January</span>
              <div className="flex items-center gap-2">
                <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full" style={{ width: '75%' }}></div>
                </div>
                <span className="text-sm font-medium text-white">75%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">December</span>
              <div className="flex items-center gap-2">
                <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full" style={{ width: '60%' }}></div>
                </div>
                <span className="text-sm font-medium text-white">60%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">November</span>
              <div className="flex items-center gap-2">
                <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full" style={{ width: '85%' }}></div>
                </div>
                <span className="text-sm font-medium text-white">85%</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
} 