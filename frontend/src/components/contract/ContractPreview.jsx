import { motion } from "framer-motion"
import { FileText, Download, Printer } from "lucide-react"
import { fadeInUp, fadeInLeft, fadeInRight } from "../../animations/animation"

export default function ContractPreview({ contractData, dealId }) {
  const generatePDFPreview = () => {
    return `
      CONTRACT FOR PURCHASE AND SALE OF REAL PROPERTY

      This Contract for Purchase and Sale of Real Property (the "Contract") is made and entered into as of ${new Date().toLocaleDateString()} by and between:

      SELLER: ${contractData.sellerName || "[Seller Name]"}
      Address: ${contractData.sellerAddress || "[Seller Address]"}
      Phone: ${contractData.sellerPhone || "[Seller Phone]"}
      Email: ${contractData.sellerEmail || "[Seller Email]"}

      BUYER: ${contractData.scoutName}
      Address: ${contractData.scoutCompany}
      Phone: ${contractData.scoutPhone}
      Email: ${contractData.scoutEmail}

      PROPERTY: ${contractData.propertyAddress}
      Property Type: ${contractData.propertyType}
      Size: ${contractData.propertySize}
      Zoning: ${contractData.propertyZoning}

      PURCHASE PRICE: $${contractData.offerPrice || "[Offer Price]"}
      Earnest Money: $${contractData.earnestMoney || "[Earnest Money]"}
      Closing Date: ${contractData.closingDate || "[Closing Date]"}
      Financing: ${contractData.financingType}

      TERMS AND CONDITIONS:
      - Inspection Period: ${contractData.inspectionPeriod}
      - Title Insurance: ${contractData.titleInsurance}
      - Survey Required: ${contractData.surveyRequired}
      - Additional Terms: ${contractData.additionalTerms || "None"}

      This contract is subject to the terms and conditions outlined above and any applicable state laws.
    `
  }

  return (
    <motion.div
      variants={fadeInUp}
      initial="initial"
      animate="animate"
      className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full"
    >
      {/* Contract Preview */}
      <motion.div 
        variants={fadeInLeft}
        className="bg-[var(--secondary-gray-bg)] rounded-2xl p-6 shadow-sm border border-[var(--tertiary-gray-bg)]"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <FileText size={20} className="text-[var(--mafia-red)]" />
            Contract Preview
          </h3>
          <div className="flex gap-2">
            <button className="p-2 text-[var(--primary-gray-text)] hover:text-[var(--mafia-red)] transition-colors rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--mafia-red)]">
              <Download size={16} />
            </button>
            <button className="p-2 text-[var(--primary-gray-text)] hover:text-[var(--mafia-red)] transition-colors rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--mafia-red)]">
              <Printer size={16} />
            </button>
          </div>
        </div>
        <div className="bg-[var(--primary-gray-bg)] rounded-lg p-4 h-96 overflow-y-auto border border-[var(--tertiary-gray-bg)]">
          <pre className="text-sm text-[var(--primary-gray-text)] whitespace-pre-wrap font-mono">
            {generatePDFPreview()}
          </pre>
        </div>
      </motion.div>

      {/* Summary */}
      <motion.div 
        variants={fadeInRight}
        className="bg-[var(--secondary-gray-bg)] rounded-2xl p-6 shadow-sm border border-[var(--tertiary-gray-bg)]"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Contract Summary</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-[var(--tertiary-gray-bg)] rounded-lg">
            <span className="text-sm font-medium text-[var(--primary-gray-text)]">Deal ID</span>
            <span className="text-sm font-semibold text-[var(--mafia-red)]">#{dealId}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-[var(--primary-gray-bg)] rounded-lg">
            <span className="text-sm font-medium text-[var(--primary-gray-text)]">Property</span>
            <span className="text-sm text-white">{contractData.propertyAddress}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-[var(--primary-gray-bg)] rounded-lg">
            <span className="text-sm font-medium text-[var(--primary-gray-text)]">Offer Price</span>
            <span className="text-sm font-semibold text-[var(--green)]">
              ${contractData.offerPrice ? Number(contractData.offerPrice).toLocaleString() : "Not set"}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-[var(--primary-gray-bg)] rounded-lg">
            <span className="text-sm font-medium text-[var(--primary-gray-text)]">Closing Date</span>
            <span className="text-sm text-white">
              {contractData.closingDate || "Not set"}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-[var(--primary-gray-bg)] rounded-lg">
            <span className="text-sm font-medium text-[var(--primary-gray-text)]">Status</span>
            <span className="text-sm font-semibold text-[var(--gold)]">Draft</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
} 