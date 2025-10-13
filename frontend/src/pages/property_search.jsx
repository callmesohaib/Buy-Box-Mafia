import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Search, X, Home, Calculator } from "lucide-react";
import { fadeInUp, heroAnimation, textReveal, slideInUp } from "../animations/animation";
import { useCsvData } from "../store/CSVDataContext";
import { useNavigate } from "react-router-dom";

export default function PropertySearch() {
  const navigate = useNavigate();
  const { csvData, loading, error } = useCsvData();
  const [zip, setZip] = useState("");
  const [result, setResult] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    setHasSearched(true);

    if (!csvData || csvData.length === 0) return;

    const found = csvData.find(
      (row) => String(row.Zip || row["Zip Code"] || "").trim() === zip.trim()
    );

    setResult(found || null);
  };

  const handleClear = () => {
    setZip("");
    setResult(null);
    setHasSearched(false);
  };

  const handleRunValuation = () => {
    navigate(`/valuation/${zip}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--from-bg)] to-[var(--secondary-gray-bg)] font-inter">
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-screen gap-4">
          <div className="relative">
            <div className="loader mb-4"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Home className="text-white w-6 h-6 animate-pulse" />
            </div>
          </div>
          <span className="text-white text-lg font-semibold">Loading data...</span>
          <style>{`
            .loader {
              border:4px solid rgba(255,255,255,0.1);
              border-top:4px solid var(--mafia-red);
              border-radius:50%;
              width:48px; height:48px;
              animation:spin 1s linear infinite;
            }
            @keyframes spin { 0%{transform:rotate(0deg);}100%{transform:rotate(360deg);} }
          `}</style>
        </div>
      ) : (
        <div className="w-[95%] max-w-4xl mx-auto py-10">
          <motion.div
            variants={heroAnimation}
            initial="initial"
            animate="animate"
            className="mb-10 text-center"
          >
            <motion.h1
              variants={textReveal}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3 bg-clip-text text-transparent bg-gradient-to-r from-white to-[var(--mafia-red)]"
            >
              Explore Market Insights by ZIP Code
            </motion.h1>
            <motion.p
              variants={textReveal}
              className="text-[var(--secondary-gray-text)] text-lg sm:text-xl max-w-2xl mx-auto"
            >
              Enter a ZIP code to view real estate market trends and insights.
            </motion.p>
          </motion.div>

          {/* Search Form */}
          <motion.div
            variants={slideInUp}
            initial="initial"
            animate="animate"
            className="bg-[var(--secondary-gray-bg)] rounded-xl shadow-lg border border-[var(--tertiary-gray-bg)] p-6 mb-10 backdrop-blur-sm bg-opacity-70"
          >
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <MapPin
                  size={18}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--placeholder-gray)]"
                />
                <input
                  type="text"
                  placeholder="Enter ZIP code (e.g., 90210)"
                  value={zip}
                  onChange={(e) => setZip(e.target.value)}
                  required
                  className="w-full pl-10 py-3 pr-4 border border-[var(--tertiary-gray-bg)] bg-[var(--primary-gray-bg)] text-white placeholder-[var(--placeholder-gray)] rounded-lg focus:ring-2 focus:ring-[var(--mafia-red)] focus:border-transparent transition-all duration-200"
                />
              </div>

              <button
                type="submit"
                className="flex items-center justify-center gap-2 bg-[var(--mafia-red)] hover:bg-[var(--mafia-red-dark)] text-white py-3 px-6 rounded-lg transition-colors duration-200"
              >
                <Search size={18} />
                <span>Search</span>
              </button>

              {hasSearched && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="flex items-center justify-center gap-2 border border-[var(--tertiary-gray-bg)] hover:bg-[var(--tertiary-gray-bg)] text-[var(--primary-gray-text)] py-3 px-6 rounded-lg transition-colors duration-200"
                >
                  <X size={18} />
                  <span>Clear</span>
                </button>
              )}
            </form>
          </motion.div>

          {/* Results Section */}
          <AnimatePresence mode="wait">
            {!hasSearched ? (
              <motion.div
                key="initial"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center py-20"
              >
                <Home size={64} className="text-[var(--mafia-red)] mb-4 animate-pulse" />
                <h3 className="text-2xl font-semibold text-white mb-3">
                  Start by entering a ZIP code
                </h3>
                <p className="text-[var(--secondary-gray-text)] text-center max-w-md">
                  You’ll get detailed market insights, including price trends, days on market, and more.
                </p>
              </motion.div>
            ) : result ? (
              <motion.div
                key="found"
                variants={fadeInUp}
                initial="initial"
                animate="animate"
                exit={{ opacity: 0 }}
                className="bg-[var(--secondary-gray-bg)] border border-[var(--tertiary-gray-bg)] rounded-xl p-8 shadow-lg"
              >
                <h3 className="text-2xl font-bold text-white mb-6">
                  Market Insights for ZIP: <span className="text-[var(--mafia-red)]">{zip}</span>
                </h3>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {[
                    { label: "City Name", value: result["City name"] },
                    { label: "Count", value: result["Count"] },
                    { label: "DOM", value: result["DOM"] },
                    { label: "PPA", value: result["PPA"] },
                    { label: "STR", value: result["STR"] },
                    { label: "Absorption Rate", value: result["Absorption Rate"] },
                    { label: "Months of Supply", value: result["Months of Supply"] },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ y: -3 }}
                      className="bg-[var(--tertiary-gray-bg)] p-4 rounded-lg text-white border border-[var(--tertiary-gray-bg)] hover:border-[var(--mafia-red)] transition-all duration-200"
                    >
                      <p className="text-sm text-[var(--secondary-gray-text)] mb-1">
                        {item.label}
                      </p>
                      <p className="text-lg font-semibold">
                        {item.value || "N/A"}
                      </p>
                    </motion.div>
                  ))}
                </div>

                {/* 🔹 Run Valuation Button */}
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleRunValuation}
                  className="flex items-center justify-center gap-2 mx-auto bg-[var(--mafia-red)] hover:bg-[var(--mafia-red-dark)] text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
                >
                  <Calculator size={18} />
                  <span>Run Valuation</span>
                </motion.button>
              </motion.div>
            ) : (
              <motion.div
                key="not-found"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center py-20"
              >
                <X size={64} className="text-[var(--mafia-red)] mb-4" />
                <h3 className="text-2xl font-semibold text-white mb-3">No Data Found</h3>
                <p className="text-[var(--secondary-gray-text)] text-center max-w-md">
                  We couldn't find any market data for ZIP code{" "}
                  <span className="font-semibold">{zip}</span>. Please try another one.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
