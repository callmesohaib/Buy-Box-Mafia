import { motion } from "framer-motion"
import { Send, CheckCircle, Clock } from "lucide-react"
import { fadeInUp, scaleIn } from "../../animations/animation"

export default function SubmitStep({ isLoading, handleSubmit }) {
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
          <Send size={32} className="text-[var(--mafia-red)]" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">Submit Contract</h3>
        <p className="text-[var(--primary-gray-text)] mb-6">Review and submit the contract for processing</p>
        
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-[var(--tertiary-gray-bg)] rounded-lg">
            <CheckCircle size={20} className="text-[var(--gold)]" />
            <span className="text-sm text-[var(--gold)]">Contract reviewed and signed</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-[var(--primary-gray-bg)] rounded-lg">
            <Clock size={20} className="text-[var(--mafia-red)]" />
            <span className="text-sm text-[var(--primary-gray-text)]">Ready for submission</span>
          </div>
          
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full bg-[var(--mafia-red)] text-white py-3 px-6 rounded-lg font-semibold hover:bg-[var(--mafia-red)]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[var(--mafia-red)] shadow"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Submitting...
              </div>
            ) : (
              "Submit Contract"
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
} 