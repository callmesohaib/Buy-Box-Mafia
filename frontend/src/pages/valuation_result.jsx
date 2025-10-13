import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import {
  DollarSign,
  TrendingUp,
  FileText,
  ArrowLeft,
  UserCheck,
  Award,
  Users,
} from "lucide-react";
import {
  fadeInUp,
  heroAnimation,
  textReveal,
  slideInUp,
} from "../animations/animation";
import { useCsvData } from "../store/CSVDataContext";

export default function ValuationResult() {
  const { zip } = useParams();
  const navigate = useNavigate();
  const { csvData, loading, error } = useCsvData();

  const [selectedRow, setSelectedRow] = useState(null);
  const [activeTab, setActiveTab] = useState("top");

  useEffect(() => {
    if (!loading && csvData.length > 0) {
      const foundRow = csvData.find(
        (row) =>
          String(row["Zip"] || row["Zip Code"] || "").trim() === zip?.trim()
      );
      setSelectedRow(foundRow || null);
    }
  }, [csvData, loading, zip]);

  const calculateSellingPrice = (medianPrice) => {
    if (!medianPrice) return "N/A";
    const numericPrice = Number(String(medianPrice).replace(/[^0-9.-]+/g, ""));
    if (isNaN(numericPrice)) return "N/A";
    const sellingPrice = numericPrice * 0.7;
    return `$${Math.round(sellingPrice).toLocaleString()}`;
  };

  const handlePrepareDealPackage = () => {
    navigate(`/contract/${encodeURIComponent(zip)}`, {
      state: {
        selectedRow,
        sellingPrice: selectedRow
          ? calculateSellingPrice(selectedRow["Median Price"])
          : "N/A",
      },
    });
  };

  const formatValue = (val) => val || "N/A";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-gray-800">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--mafia-red)]"></div>
          <p className="text-white">Loading valuation data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-gray-800">
        <p className="text-red-400">Error loading CSV: {error}</p>
      </div>
    );
  }

  if (!selectedRow) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-gray-800">
        <div className="text-center p-6 bg-[var(--secondary-gray-bg)] rounded-xl">
          <p className="text-[var(--mafia-red)] mb-4">
            No data found for ZIP code: {zip}
          </p>
          <button
            onClick={() => navigate("/property-search")}
            className="bg-[var(--mafia-red)] text-white px-6 py-2 rounded-lg hover:bg-[var(--mafia-red-dark)] transition-colors"
          >
            Back to Search
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--from-bg)] to-[var(--secondary-gray-bg)] font-inter">
      <div className="w-[90%] mx-auto py-6 sm:py-8">
        {/* Header */}
        <motion.div
          variants={heroAnimation}
          initial="initial"
          animate="animate"
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate("/property-search")}
              className="flex items-center gap-2 text-[var(--mafia-red)] hover:text-[var(--mafia-red-hover)] transition-colors"
            >
              <ArrowLeft size={20} />
              <span className="hidden sm:inline">Back to Search</span>
            </button>
          </div>
          <motion.h1
            variants={textReveal}
            className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2"
          >
            Market Valuation Report
          </motion.h1>
          <motion.p
            variants={textReveal}
            className="text-[var(--secondary-gray-text)] text-base sm:text-lg"
          >
            Analysis for ZIP Code: {zip}
          </motion.p>
        </motion.div>

        {/* Selling Price Section */}
        <motion.div
          variants={slideInUp}
          initial="initial"
          animate="animate"
          className="bg-[var(--secondary-gray-bg)] rounded-2xl shadow-sm border border-[var(--tertiary-gray-bg)] overflow-hidden mb-8"
        >
          <div className="p-6 lg:p-8">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">
              {formatValue(selectedRow["City name"])}, {zip}
            </h2>

            {/* Optimal Selling Price */}
            <motion.div
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              className="bg-[var(--tertiary-gray-bg)] border border-green-700 rounded-xl p-4 mb-6"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                  <UserCheck size={16} className="text-white" />
                </div>
                <h3 className="font-semibold text-green-200">
                  Optimal Selling Price
                </h3>
              </div>

              <p className="text-green-200 text-sm mb-3">
                Based on market analysis, properties in this area can be sold for:
              </p>

              <div className="flex items-center gap-4 text-sm flex-wrap">
                <div className="flex items-center gap-1">
                  <TrendingUp size={14} className="text-green-300" />
                  <span className="text-green-200">
                    Price Per Acre:{" "}
                    <span className="font-bold text-white">
                      {formatValue(selectedRow["PPA"])}
                    </span>
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <DollarSign size={14} className="text-green-300" />
                  <span className="text-green-200">
                    Selling Price:{" "}
                    <span className="font-bold text-white text-lg">
                      {calculateSellingPrice(selectedRow["Median Price"])}
                    </span>
                  </span>
                </div>
              </div>
            </motion.div>

            <button
              onClick={handlePrepareDealPackage}
              className="w-full sm:w-auto bg-[var(--mafia-red)] hover:bg-[var(--mafia-red-hover)] text-white font-semibold py-3 px-6 rounded-xl transition-colors shadow-sm hover:shadow-md flex items-center justify-center gap-2"
            >
              <FileText size={18} />
              <span>Prepare Deal Package</span>
            </button>
          </div>
        </motion.div>

        {/* Market Data Table */}
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.2 }}
          className="bg-[var(--secondary-gray-bg)] rounded-2xl shadow-sm border border-[var(--tertiary-gray-bg)] overflow-hidden mb-8"
        >
          {/* Tabs */}
          <div className="flex border-b border-[var(--tertiary-gray-bg)]">
            <button
              onClick={() => setActiveTab("top")}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${activeTab === "top"
                ? "text-[var(--gold)] border-b-2 border-[var(--gold)] bg-[var(--tertiary-gray-bg)]"
                : "text-[var(--primary-gray-text)] hover:text-[var(--gold)]"
                }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Award size={16} />
                Current ZIP Data
              </div>
            </button>
            <button
              onClick={() => setActiveTab("all")}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${activeTab === "all"
                ? "text-[var(--gold)] border-b-2 border-[var(--gold)] bg-[var(--tertiary-gray-bg)]"
                : "text-[var(--primary-gray-text)] hover:text-[var(--gold)]"
                }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Users size={16} />
                All Market Data ({csvData.length})
              </div>
            </button>
          </div>

          {/* Table */}
          <div
            className="overflow-x-auto buyer-table-scroll"
            style={{ maxHeight: "400px", minHeight: "200px", overflowY: "auto" }}
          >
            <table className="w-full border-collapse">
              <thead className="bg-[var(--tertiary-gray-bg)] sticky top-0 z-10">
                <tr>
                  {[
                    "Rank",
                    "City / Zip",
                    "Price Per Acre",
                    "Selling Price",
                    "Months Supply",
                    "Count",
                  ].map((col, i) => (
                    <th
                      key={i}
                      className="px-4 py-3 text-left text-xs font-medium text-[var(--primary-gray-text)] uppercase tracking-wider border-b border-[var(--quaternary-gray-bg)]"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-[var(--secondary-gray-bg)] divide-y divide-[var(--quaternary-gray-bg)]">
                {(activeTab === "top" ? [selectedRow] : csvData).map(
                  (row, index) => {
                    const city = row["City name"] || "N/A";
                    const zipCode = row["Zip Code"] || "N/A";
                    const PPA = row["PPA"] || "N/A";
                    const medianPrice = row["Median Price"] || "N/A";
                    const monthsSupply = row["Months of Supply"] || "N/A";
                    const count = row["Count"] || "N/A";
                    const isCurrentZip = zipCode === zip;

                    return (
                      <tr
                        key={`${city}-${zipCode}-${index}`}
                        className={`hover:bg-[var(--tertiary-gray-bg)] transition-colors ${isCurrentZip
                          ? "bg-[linear-gradient(to_right,rgba(247,200,68,0.2),rgba(247,200,68,0.1))] border-l-4 border-[var(--gold)]"
                          : ""
                          }`}
                      >
                        <td className="px-4 py-3 whitespace-nowrap font-bold">
                          {index + 1}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-white">
                          <div className="font-semibold">{city}</div>
                          <div className="text-xs text-[var(--secondary-gray-text)]">
                            {zipCode}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap font-bold text-green-400">
                          {formatValue(PPA)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap font-bold text-[var(--gold)]">
                          {calculateSellingPrice(medianPrice)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-200">
                          {formatValue(monthsSupply)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-200">
                          {formatValue(count)}
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
