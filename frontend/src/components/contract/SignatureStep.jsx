import { motion } from "framer-motion"
import { PenTool } from "lucide-react"
import { fadeInUp, scaleIn } from "../../animations/animation"

export default function SignatureStep() {
  return (
    <motion.div
      variants={fadeInUp}
      initial="initial"
      animate="animate"
      className="text-center"
    >
      <motion.div 
        variants={scaleIn}
        className="bg-[var(--secondary-gray-bg)] rounded-2xl p-8 shadow-sm border border-[var(--tertiary-gray-bg)] max-w-md mx-auto"
      >
        <div className="w-16 h-16 bg-[var(--mafia-red)]/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <PenTool size={32} className="text-[var(--mafia-red)]" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">Digital Signature</h3>
        <p className="text-[var(--primary-gray-text)] mb-6">Sign the contract using your digital signature</p>
        
        <div className="space-y-4">
          <button className="w-full bg-[var(--mafia-red)] text-white py-3 px-6 rounded-lg font-semibold hover:bg-[var(--mafia-red)]/90 transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--mafia-red)] shadow">
            Sign with DocuSign
          </button>
          <button className="w-full border border-[var(--tertiary-gray-bg)] text-[var(--primary-gray-text)] py-3 px-6 rounded-lg font-semibold hover:bg-[var(--tertiary-gray-bg)]/60 transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--mafia-red)]">
            Draw Signature
          </button>
          <button className="w-full border border-[var(--tertiary-gray-bg)] text-[var(--primary-gray-text)] py-3 px-6 rounded-lg font-semibold hover:bg-[var(--tertiary-gray-bg)]/60 transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--mafia-red)]">
            Upload Signature
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
} 