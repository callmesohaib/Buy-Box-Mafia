import { useState, useEffect } from "react"
import { useParams, useNavigate, useLocation } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "../store/AuthContext"
import {
  ChevronLeft,
  Upload,
  FileText,
  MapPin,
  User,
  Building,
  AlertCircle,
  CheckCircle,
  X,
  Send,
  Download,
  Eye,
  Users
} from "lucide-react"
import {
  fadeInUp,
  fadeInDown,
  scaleIn,
  modalBackdrop,
  modalContent,
  buttonHover,
  staggerContainer,
  staggerItem
} from "../animations/animation"
import { addDeal } from "../services/dealsService"

export default function DealSubmission() {
  const removeFile = () => {
    setSelectedFile(null);
    setFormData(prev => ({
      ...prev,
      contractFile: null
    }));
  }
  const { user } = useAuth();
  const { id: urlId } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const location = useLocation();
  const dealId = location.state?.dealId || urlId;
  const initialFormData = location.state?.contractData
    ? {
      ...location.state.contractData,
      status: "pending", // Always use "Pending" as default from dropdown
      scoutNotes: location.state.contractData.scoutNotes || "",
      contractFile: null,
      // Preserve buyer data from contract preparation
      matchedBuyers: location.state.contractData.matchedBuyers || [],
      buyersCount: location.state.contractData.buyersCount || 0,
      buyerIds: location.state.contractData.buyerIds || []
    }
    : {
      status: "pending", // Always use "Pending" as default
      scoutNotes: "",
      contractFile: null,
      matchedBuyers: [],
      buyersCount: 0,
      buyerIds: []
    };
  const [formData, setFormData] = useState(initialFormData);

  console.log("DealSubmission formData:", formData);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (location.state?.contractData) {
      setFormData((prev) => ({
        ...prev,
        ...location.state.contractData,
        status: "pending", // Always use "Pending" from dropdown, ignore API status
        scoutNotes: location.state.contractData.scoutNotes || "",
        scoutName: user?.name,
        scoutEmail: user?.email,
        scoutPhone: user?.phone || "",
        Company: user?.company || "Buy Box Mafia",
        submittedBy: user?.id || user?.uid,
        // Preserve buyer data
        matchedBuyers: location.state.contractData.matchedBuyers || prev.matchedBuyers || [],
        buyersCount: location.state.contractData.buyersCount || prev.buyersCount || 0,
        buyerIds: location.state.contractData.buyerIds || prev.buyerIds || []
      }));
    }
    // eslint-disable-next-line
  }, [location.state?.contractData]);

  const statusOptions = [
    "Pending",
    "Closed",
    "Cancelled",
    "Expired"
  ]

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file && file.type === "application/pdf") {
      setSelectedFile(file)
      setFormData(prev => ({
        ...prev,
        contractFile: file
      }))
    } else {
      alert("Please select a valid PDF file")
    }
  }

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      await addDeal(formData);
      setShowModal(true);
    } catch (error) {
      alert(error.message || "Failed to submit deal. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  const handleConfirmSubmit = () => {
    setShowModal(false)
    navigate("/property-search")
  }


  // Build parcelData from contractData (from navigation state or formData)
  const contractData = location.state?.contractData || formData || {};
  console.log(contractData)
  const parcelData = {
    id: dealId || contractData.dealId || 'N/A',
    address: contractData.propertyAddress || contractData.address || 'N/A',
    parcelId: contractData.apn || contractData.apn || 'N/A',
    size: contractData.size || contractData.propertySize || 'N/A',
    zoning: contractData.propertyZoning || contractData.propertyZoning || 'N/A',
    currentValue: contractData.currentValue || contractData.propertyPrice || 'N/A',
    estimatedValue: contractData.estimatedValue || contractData.listPrice || 'N/A',
    owner: contractData.owner || contractData.sellerName || 'N/A',
    ownerPhone: contractData.sellerPhone || 'N/A',
    ownerEmail: contractData.sellerEmail || 'N/A',
    lastContact: contractData.lastContact || 'N/A',
    propertyType: contractData.propertyType || 'N/A',
    utilities: contractData.utilities || 'N/A',
    roadAccess: contractData.roadAccess || 'N/A',
    topography: contractData.topography || 'N/A',
    floodZone: contractData.floodZone || 'N/A',
    taxAssessedValue: contractData.taxAssessedValue || 'N/A',
    annualTaxes: contractData.annualTaxes || 'N/A'
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-[var(--from-bg)] to-[var(--secondary-gray-bg)] pt-5 pb-8 overflow-x-hidden"
    >
      <div className="w-[90%] mx-auto max-w-6xl">
        {/* Header */}
        <motion.div
          variants={fadeInDown}
          initial="initial"
          animate="animate"
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 text-[var(--primary-gray-text)] hover:text-[var(--mafia-red)] transition-colors rounded-full focus:outline-none focus:ring-2 focus:ring-[var(--mafia-red)]"
            >
              <ChevronLeft size={24} />
            </button>
            <h1 className="text-2xl font-bold text-white tracking-tight">Deal Submission</h1>
          </div>
          <p className="text-[var(--secondary-gray-text)]">Deal ID: #{dealId}</p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* Parcel Summary */}
          <motion.div
            variants={staggerItem}
            className="lg:col-span-2"
          >
            <div className="bg-[var(--secondary-gray-bg)] rounded-2xl p-6 shadow-sm border border-[var(--tertiary-gray-bg)]">
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <MapPin size={24} className="text-[var(--mafia-red)]" />
                Parcel Summary
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-[var(--tertiary-gray-bg)] rounded-lg">
                    <span className="text-sm font-medium text-[var(--primary-gray-text)]">Parcel ID</span>
                    <span className="text-sm font-semibold text-[var(--mafia-red)]">{parcelData.parcelId}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-[var(--primary-gray-bg)] rounded-lg">
                    <span className="text-sm font-medium text-[var(--primary-gray-text)]">Address</span>
                    <span className="text-sm text-white text-right">{parcelData.address}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-[var(--primary-gray-bg)] rounded-lg">
                    <span className="text-sm font-medium text-[var(--primary-gray-text)]">Size</span>
                    <span className="text-sm text-white">{parcelData.size}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-[var(--primary-gray-bg)] rounded-lg">
                    <span className="text-sm font-medium text-[var(--primary-gray-text)]">Zoning</span>
                    <span className="text-sm text-white">{parcelData.zoning}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-[var(--primary-gray-bg)] rounded-lg">
                    <span className="text-sm font-medium text-[var(--primary-gray-text)]">Property Type</span>
                    <span className="text-sm text-white">{parcelData.propertyType}</span>
                  </div>
                </div>

                {/* Financial Information */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-[var(--tertiary-gray-bg)] rounded-lg">
                    <span className="text-sm font-medium text-[var(--primary-gray-text)]">Current Value</span>
                    <span className="text-sm font-semibold text-[var(--green)]">{parcelData.currentValue}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-[var(--tertiary-gray-bg)] rounded-lg">
                    <span className="text-sm font-medium text-[var(--primary-gray-text)]">Estimated Value</span>
                    <span className="text-sm font-semibold text-[var(--gold)]">{parcelData.estimatedValue}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-[var(--primary-gray-bg)] rounded-lg">
                    <span className="text-sm font-medium text-[var(--primary-gray-text)]">Tax Assessed</span>
                    <span className="text-sm text-white">{parcelData.taxAssessedValue}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-[var(--primary-gray-bg)] rounded-lg">
                    <span className="text-sm font-medium text-[var(--primary-gray-text)]">Annual Taxes</span>
                    <span className="text-sm text-white">{parcelData.annualTaxes}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-[var(--primary-gray-bg)] rounded-lg">
                    <span className="text-sm font-medium text-[var(--primary-gray-text)]">Flood Zone</span>
                    <span className="text-sm text-white">{parcelData.floodZone}</span>
                  </div>
                </div>
              </div>

              {/* Buyer Matching Information */}
              <div className="mt-6 pt-6 border-t border-[var(--tertiary-gray-bg)]">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Users size={20} className="text-green-500" />
                  Buyer Matching ({formData.buyersCount || 0} matches)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-3 bg-[var(--primary-gray-bg)] rounded-lg">
                    <span className="text-sm font-medium text-[var(--primary-gray-text)]">Matched Buyers</span>
                    <span className="text-sm font-semibold text-green-400">{formData.buyersCount || 0}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-[var(--primary-gray-bg)] rounded-lg">
                    <span className="text-sm font-medium text-[var(--primary-gray-text)]">Top Match Score</span>
                    <span className="text-sm font-semibold text-[var(--gold)]">
                      {formData.matchedBuyers && formData.matchedBuyers.length > 0 
                        ? `${formData.matchedBuyers[0].matchPercent}%` 
                        : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Owner Information */}
              <div className="mt-6 pt-6 border-t border-[var(--tertiary-gray-bg)]">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <User size={20} className="text-[var(--mafia-red)]" />
                  Owner Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center justify-between p-3 bg-[var(--primary-gray-bg)] rounded-lg">
                    <span className="text-sm font-medium text-[var(--primary-gray-text)]">Owner</span>
                    <span className="text-sm text-white">{parcelData.owner}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-[var(--primary-gray-bg)] rounded-lg">
                    <span className="text-sm font-medium text-[var(--primary-gray-text)]">Phone</span>
                    <span className="text-sm text-white">{parcelData.ownerPhone}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-[var(--primary-gray-bg)] rounded-lg">
                    <span className="text-sm font-medium text-[var(--primary-gray-text)]">Email</span>
                    <span className="text-sm text-white">{parcelData.ownerEmail}</span>
                  </div>
                </div>
              </div>

              {/* Property Details */}
              <div className="mt-6 pt-6 border-t border-[var(--tertiary-gray-bg)]">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Building size={20} className="text-[var(--mafia-red)]" />
                  Property Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-3 bg-[var(--primary-gray-bg)] rounded-lg">
                    <span className="text-sm font-medium text-[var(--primary-gray-text)]">Utilities</span>
                    <span className="text-sm text-white">{parcelData.utilities}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-[var(--primary-gray-bg)] rounded-lg">
                    <span className="text-sm font-medium text-[var(--primary-gray-text)]">Road Access</span>
                    <span className="text-sm text-white">{parcelData.roadAccess}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-[var(--primary-gray-bg)] rounded-lg">
                    <span className="text-sm font-medium text-[var(--primary-gray-text)]">Topography</span>
                    <span className="text-sm text-white">{parcelData.topography}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-[var(--primary-gray-bg)] rounded-lg">
                    <span className="text-sm font-medium text-[var(--primary-gray-text)]">Last Contact</span>
                    <span className="text-sm text-white">{parcelData.lastContact}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Submission Form */}
          <motion.div
            variants={staggerItem}
            className="space-y-6"
          >
            {/* Status Dropdown */}
            <div className="bg-[var(--secondary-gray-bg)] rounded-2xl p-6 shadow-sm border border-[var(--tertiary-gray-bg)]">
              <h3 className="text-lg font-semibold text-white mb-4">Deal Status</h3>
              <select
                name="status"
                value={formData.status || "pending"}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-[var(--primary-gray-bg)] text-white border border-[var(--tertiary-gray-bg)] rounded-xl focus:ring-2 focus:ring-[var(--mafia-red)] focus:border-transparent transition-all duration-200"
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            {/* Scout Notes */}
            <div className="bg-[var(--secondary-gray-bg)] rounded-2xl p-6 shadow-sm border border-[var(--tertiary-gray-bg)]">
              <h3 className="text-lg font-semibold text-white mb-4">Scout Notes</h3>
              <textarea
                name="scoutNotes"
                value={formData.scoutNotes}
                onChange={handleInputChange}
                rows={6}
                className="w-full px-4 py-3 bg-[var(--primary-gray-bg)] text-white border border-[var(--tertiary-gray-bg)] rounded-xl focus:ring-2 focus:ring-[var(--mafia-red)] focus:border-transparent transition-all duration-200 resize-none placeholder-[var(--secondary-gray-text)]"
                placeholder="Enter your notes about this deal, including any important details, negotiations, or observations..."
              />
            </div>

            {/* Contract Upload */}
            <div className="bg-[var(--secondary-gray-bg)] rounded-2xl p-6 shadow-sm border border-[var(--tertiary-gray-bg)]">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <FileText size={20} className="text-[var(--mafia-red)]" />
                Contract Upload
              </h3>

              {!selectedFile ? (
                <div className="border-2 border-dashed border-[var(--tertiary-gray-bg)] rounded-xl p-8 text-center hover:border-[var(--mafia-red)] transition-colors">
                  <Upload size={48} className="mx-auto text-[var(--primary-gray-text)] mb-4" />
                  <p className="text-[var(--primary-gray-text)] mb-2">Upload your contract PDF</p>
                  <p className="text-sm text-[var(--secondary-gray-text)] mb-4">Drag and drop or click to browse</p>
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <span className="inline-flex items-center px-4 py-2 bg-[var(--mafia-red)] text-white rounded-lg hover:bg-[var(--mafia-red)]/90 transition-colors">
                      Choose File
                    </span>
                  </label>
                </div>
              ) : (
                <div className="border border-[var(--tertiary-gray-bg)] rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText size={24} className="text-[var(--mafia-red)]" />
                      <div>
                        <p className="font-medium text-white">{selectedFile.name}</p>
                        <p className="text-sm text-[var(--secondary-gray-text)]">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={removeFile}
                        className="p-2 text-red-600 hover:text-red-700 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <motion.button
              variants={buttonHover}
              whileHover="whileHover"
              whileTap="whileTap"
              onClick={handleSubmit}
              disabled={isLoading || !selectedFile}
              className="w-full bg-[var(--mafia-red)] text-white py-4 px-6 rounded-xl font-semibold hover:bg-[var(--mafia-red)]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Submitting Deal...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Send size={20} />
                  Submit Deal Package
                </div>
              )}
            </motion.button>
          </motion.div>
        </motion.div>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            variants={modalBackdrop}
            initial="initial"
            animate="animate"
            exit="exit"
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              variants={modalContent}
              initial="initial"
              animate="animate"
              exit="exit"
              className="bg-[var(--secondary-gray-bg)] rounded-2xl p-8 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-[var(--mafia-red)]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={32} className="text-[var(--mafia-red)]" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Deal Submitted Successfully!</h3>
                <p className="text-[var(--primary-gray-text)] mb-6">
                  Your deal package has been submitted and is now under review. You'll receive a confirmation email shortly.
                </p>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 p-3 bg-[var(--tertiary-gray-bg)] rounded-lg">
                    <CheckCircle size={20} className="text-[var(--mafia-red)]" />
                    <span className="text-sm text-[var(--mafia-red)]">Deal package submitted</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-[var(--primary-gray-bg)] rounded-lg">
                    <FileText size={20} className="text-[var(--gold)]" />
                    <span className="text-sm text-[var(--gold)]">Contract uploaded</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-[var(--primary-gray-bg)] rounded-lg">
                    <AlertCircle size={20} className="text-[var(--primary-gray-text)]" />
                    <span className="text-sm text-[var(--primary-gray-text)]">Pending review</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 border border-[var(--tertiary-gray-bg)] text-[var(--primary-gray-text)] rounded-lg hover:bg-[var(--tertiary-gray-bg)]/60 transition-colors"
                  >
                    Stay Here
                  </button>
                  <button
                    onClick={handleConfirmSubmit}
                    className="flex-1 px-4 py-2 bg-[var(--mafia-red)] text-white rounded-lg hover:bg-[var(--mafia-red)]/90 transition-colors"
                  >
                    Go to Property Search
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
} 