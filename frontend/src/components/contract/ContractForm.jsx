import { motion, AnimatePresence } from "framer-motion"
import { useEffect } from "react";
import { User, Building, MapPin, DollarSign, FileCheck, Mail, Phone, AlertCircle } from "lucide-react"
import { staggerContainer, staggerItem, inputFocusVariants, errorMessageVariants } from "../../animations/animation"
import { scoutService } from "../../services/scoutService";
import { useAuth } from "../../store/AuthContext";


export default function ContractForm({ formData, setFormData, errors, setErrors }) {
  const { user } = useAuth();
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }))
    }
  }

  // Minimalist section card style
  const sectionClass =
    "bg-[var(--secondary-gray-bg)] rounded-2xl p-6 shadow-sm border border-[var(--tertiary-gray-bg)]"
  const headingClass =
    "text-lg font-semibold text-white mb-4 flex items-center gap-2"
  const labelClass =
    "block text-sm font-medium text-[var(--primary-gray-text)] mb-2"
  const inputBase =
    "w-full px-4 py-3 bg-[var(--primary-gray-bg)] text-white border border-[var(--tertiary-gray-bg)] rounded-xl focus:ring-2 focus:ring-[var(--mafia-red)] focus:border-transparent transition-all duration-200 placeholder-[var(--secondary-gray-text)]"
  const inputIconClass =
    "absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--secondary-gray-text)]"
  const selectClass =
    "w-full px-4 py-3 bg-[var(--primary-gray-bg)] text-white border border-[var(--tertiary-gray-bg)] rounded-xl focus:ring-2 focus:ring-[var(--mafia-red)] focus:border-transparent transition-all duration-200"
  const textareaClass =
    "w-full px-4 py-3 bg-[var(--primary-gray-bg)] text-white border border-[var(--tertiary-gray-bg)] rounded-xl focus:ring-2 focus:ring-[var(--mafia-red)] focus:border-transparent transition-all duration-200 placeholder-[var(--secondary-gray-text)]"

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="space-y-6"
    >
      {/* Scout Information */}
      <motion.div variants={staggerItem} className={sectionClass}>
        <h3 className={headingClass}>
          <User size={20} className="text-[var(--mafia-red)]" />
          Scout Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Scout Name</label>
            <motion.div className="relative" variants={inputFocusVariants} whileFocus="focus">
              <User size={18} className={inputIconClass} />
              <input
                type="text"
                name="scoutName"
                value={user?.name || ""}
                onChange={handleInputChange}
                className={inputBase + " pl-10"}
                placeholder="Enter scout's name"
                readOnly={!!formData.scoutName}
              />
            </motion.div>
          </div>
          <div>
            <label className={labelClass}>Scout Email</label>
            <motion.div className="relative" variants={inputFocusVariants} whileFocus="focus">
              <Mail size={18} className={inputIconClass} />
              <input
                type="email"
                name="scoutEmail"
                value={user?.email || ""}
                onChange={handleInputChange}
                className={inputBase + " pl-10"}
                placeholder="scout@example.com"
                readOnly={!!formData.scoutEmail}
              />
            </motion.div>
          </div>
          <div>
            <label className={labelClass}>Scout Phone</label>
            <motion.div className="relative" variants={inputFocusVariants} whileFocus="focus">
              <Phone size={18} className={inputIconClass} />
              <input
                type="tel"
                name="scoutPhone"
                value={user?.phone || formData.scoutPhone}
                onChange={handleInputChange}
                className={inputBase + " pl-10"}
                placeholder="+1 (555) 123-4567"
                disabled={!!user?.phone}
              />
            </motion.div>
          </div>

          <div>
            <label className={labelClass}>Company</label>
            <motion.div className="relative" variants={inputFocusVariants} whileFocus="focus">
              <Building size={18} className={inputIconClass} />
              <input
                type="text"
                name="scoutCompany"
                value="Buy Box Mafia"
                onChange={handleInputChange}
                className={inputBase + " pl-10"}
                placeholder="Company name"
                readOnly={!!formData.scoutCompany}
              />
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Seller Information */}
      <motion.div variants={staggerItem} className={sectionClass}>
        <h3 className={headingClass}>
          <Building size={20} className="text-[var(--mafia-red)]" />
          Seller Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Seller Name *</label>
            <motion.div className="relative" variants={inputFocusVariants} whileFocus="focus">
              <User size={18} className={inputIconClass} />
              <input
                type="text"
                name="sellerName"
                value={formData.sellerName || ""}
                onChange={handleInputChange}
                className={inputBase + ` pl-10 ${errors.sellerName ? 'border-[var(--mafia-red)] bg-[var(--mafia-red)]/10' : ''}`}
                placeholder="Enter seller's full name"
              />
            </motion.div>
            <AnimatePresence>
              {errors.sellerName && (
                <motion.div
                  className="flex items-center gap-1 mt-1 text-[var(--mafia-red)] text-sm"
                  variants={errorMessageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  <AlertCircle size={14} />
                  {errors.sellerName}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div>
            <label className={labelClass}>Seller Email</label>
            <motion.div className="relative" variants={inputFocusVariants} whileFocus="focus">
              <Mail size={18} className={inputIconClass} />
              <input
                type="email"
                name="sellerEmail"
                value={formData.sellerEmail || ""}
                onChange={handleInputChange}
                className={inputBase + " pl-10"}
                placeholder="seller@example.com"
              />
            </motion.div>
          </div>
          <div>
            <label className={labelClass}>Seller Phone</label>
            <motion.div className="relative" variants={inputFocusVariants} whileFocus="focus">
              <Phone size={18} className={inputIconClass} />
              <input
                type="tel"
                name="sellerPhone"
                value={formData.sellerPhone || ""}
                onChange={handleInputChange}
                className={inputBase + " pl-10"}
                placeholder="+1 (555) 123-4567"
              />
            </motion.div>
          </div>
          <div>
            <label className={labelClass}>Seller Address</label>
            <motion.div className="relative" variants={inputFocusVariants} whileFocus="focus">
              <MapPin size={18} className={inputIconClass} />
              <input
                type="text"
                name="sellerAddress"
                value={formData.sellerAddress || ""}
                onChange={handleInputChange}
                className={inputBase + " pl-10"}
                placeholder="Enter seller's address"
              />
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Property Information */}
      <motion.div variants={staggerItem} className={sectionClass}>
        <h3 className={headingClass}>
          <MapPin size={20} className="text-[var(--mafia-red)]" />
          Property Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className={labelClass}>Property Address</label>
            <motion.div className="relative" variants={inputFocusVariants} whileFocus="focus">
              <MapPin size={18} className={inputIconClass} />
              <input
                type="text"
                name="propertyAddress"
                value={formData.propertyAddress || ""}
                onChange={handleInputChange}
                className={inputBase + " pl-10"}
                placeholder="Enter property address"
                readOnly={!!formData.propertyAddress}
              />
            </motion.div>
          </div>
          <div>
            <label className={labelClass}>Property Type</label>
            <input
              type="text"
              name="propertyType"
              value={formData.propertyType || ""}
              onChange={handleInputChange}
              className={inputBase}
              placeholder="e.g. Sale"
              readOnly={!!formData.propertyType}
            />
          </div>
          <div>
            <label className={labelClass}>Property Size</label>
            <input
              type="text"
              name="propertySize"
              value={formData.propertySize || ""}
              onChange={handleInputChange}
              className={inputBase}
              placeholder="e.g. 2,000 sqft"
            />
          </div>
          <div>
            <label className={labelClass}>APN</label>
            <input
              type="text"
              name="apn"
              value={formData.apn || ""}
              onChange={handleInputChange}
              className={inputBase}
              placeholder="Enter APN (Assessor's Parcel Number)"
            />
          </div>
          <div>
            <label className={labelClass}>Zoning</label>
            <input
              type="text"
              name="propertyZoning"
              value={formData.propertyZoning || ""}
              onChange={handleInputChange}
              className={inputBase}
              placeholder="e.g. Residential"
              readOnly={!!formData.propertyZoning}
            />
          </div>
        </div>
      </motion.div>

      {/* Offer Details */}
      <motion.div variants={staggerItem} className={sectionClass}>
        <h3 className={headingClass}>
          <DollarSign size={20} className="text-[var(--mafia-red)]" />
          Offer Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Offer Price *</label>
            <input
              type="number"
              name="offerPrice"
              value={formData.propertyPrice || ""}
              onChange={handleInputChange}
              className={inputBase + (errors.offerPrice ? ' border-[var(--mafia-red)] bg-[var(--mafia-red)]/10' : '')}
              placeholder="Enter offer price"
            />
            <AnimatePresence>
              {errors.offerPrice && (
                <motion.div
                  className="flex items-center gap-1 mt-1 text-[var(--mafia-red)] text-sm"
                  variants={errorMessageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  <AlertCircle size={14} />
                  {errors.offerPrice}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div>
            <label className={labelClass}>Earnest Money</label>
            <input
              type="number"
              name="earnestMoney"
              value={formData.earnestMoney || ""}
              onChange={handleInputChange}
              className={inputBase}
              placeholder="Enter earnest money amount"
            />
          </div>
          <div>
            <label className={labelClass}>Closing Date</label>
            <input
              type="date"
              name="closingDate"
              value={formData.closingDate || ""}
              onChange={handleInputChange}
              className={inputBase}
            />
          </div>
          <div>
            <label className={labelClass}>Financing Type</label>
            <select
              name="financingType"
              value={formData.financingType || ""}
              onChange={handleInputChange}
              className={selectClass}
            >
              <option value="Cash">Cash</option>
              <option value="Conventional Loan">Conventional Loan</option>
              <option value="FHA Loan">FHA Loan</option>
              <option value="VA Loan">VA Loan</option>
              <option value="Owner Financing">Owner Financing</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Terms and Conditions */}
      <motion.div variants={staggerItem} className={sectionClass}>
        <h3 className={headingClass}>
          <FileCheck size={20} className="text-[var(--mafia-red)]" />
          Terms and Conditions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Inspection Period</label>
            <select
              name="inspectionPeriod"
              value={formData.inspectionPeriod || ""}
              onChange={handleInputChange}
              className={selectClass}
            >
              <option value="7 days">7 days</option>
              <option value="10 days">10 days</option>
              <option value="14 days">14 days</option>
              <option value="21 days">21 days</option>
              <option value="30 days">30 days</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Title Insurance</label>
            <select
              name="titleInsurance"
              value={formData.titleInsurance || ""}
              onChange={handleInputChange}
              className={selectClass}
            >
              <option value="Yes">Yes</option>
              <option value="No">No</option>
              <option value="Buyer's Choice">Buyer's Choice</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Survey Required</label>
            <select
              name="surveyRequired"
              value={formData.surveyRequired || ""}
              onChange={handleInputChange}
              className={selectClass}
            >
              <option value="Yes">Yes</option>
              <option value="No">No</option>
              <option value="Optional">Optional</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Additional Terms</label>
            <textarea
              name="additionalTerms"
              value={formData.additionalTerms || ""}
              onChange={handleInputChange}
              rows={3}
              className={textareaClass}
              placeholder="Enter any additional terms or conditions..."
            />
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
} 