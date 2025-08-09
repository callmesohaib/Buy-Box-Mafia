import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  DollarSign,
  Loader2,
  AlertCircle,
  Users,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { staggerContainer, staggerItem } from "../../animations/animation";
import { getOverviewAnalytics } from "../../services/dealsService";

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const analyticsData = await getOverviewAnalytics();
        setData(analyticsData);
      } catch (error) {
        console.error("Error fetching analytics:", error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-700 text-red-400 p-4 rounded-xl">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <span>Error loading analytics: {error}</span>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-gray-400 bg-gray-800/50 p-4 rounded-xl">
        No analytics data available
      </div>
    );
  }

  const monthlyDealsData = data.monthlyStats || [];

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="p-4 lg:p-6 space-y-8"
    >
      {/* Top Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Total Deals */}
        <motion.div
          variants={staggerItem}
          className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Total Deals</p>
              <p className="text-2xl font-bold text-white">{data.totalDeals}</p>
            </div>
            <div className="w-12 h-12 bg-amber-400/20 rounded-lg flex items-center justify-center">
              <FileText size={24} className="text-amber-400" />
            </div>
          </div>
        </motion.div>

        {/* Total Buyers */}
        <motion.div
          variants={staggerItem}
          className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Total Buyers</p>
              <p className="text-2xl font-bold text-white">{data.totalBuyers}</p>
            </div>
            <div className="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center">
              <Users size={24} className="text-green-400" />
            </div>
          </div>
        </motion.div>

        {/* Total Value */}
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
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Deals Over Time */}
        {/* Deals Over Time Chart */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg">
          <h3 className="text-lg font-semibold text-white mb-4">Deals Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyDealsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1F2937",
                  border: "none",
                  borderRadius: "0.5rem",
                }}
                itemStyle={{ color: "#FFFFFF" }} // White text for values
                labelStyle={{ color: "#FFFFFF", fontWeight: "bold" }} // White text for month label
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="deals"
                stroke="#FBBF24"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Deal Value Chart */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg">
          <h3 className="text-lg font-semibold text-white mb-4">Monthly Deal Value</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyDealsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1F2937",
                  border: "none",
                  borderRadius: "0.5rem",
                }}
                itemStyle={{ color: "#FFFFFF" }} // White text for values
                labelStyle={{ color: "#FFFFFF", fontWeight: "bold" }} // White text for month label
              />
              <Legend />
              <Bar
                dataKey="value"
                fill="#10B981"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
}
