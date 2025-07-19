import { motion } from "framer-motion"
import { Edit3, Eye, PenTool, Send } from "lucide-react"
import { fadeInUp, cardHover } from "../../animations/animation"

export default function ProgressSteps({ currentStep, setCurrentStep }) {
  const steps = [
    { id: 0, title: "Edit", icon: Edit3, description: "Review and edit contract details" },
    { id: 1, title: "Preview", icon: Eye, description: "Preview the final contract" },
    { id: 2, title: "Sign", icon: PenTool, description: "Sign the contract digitally" },
    { id: 3, title: "Submit", icon: Send, description: "Submit for processing" }
  ]

  // Color classes
  const activeStepClass =
    "bg-[var(--mafia-red)] text-white shadow-lg border border-[var(--mafia-red)]"
  const inactiveStepClass =
    "bg-[var(--secondary-gray-bg)] text-[var(--primary-gray-text)] border border-[var(--tertiary-gray-bg)]"
  const connectorActive = "bg-[var(--mafia-red)]"
  const connectorInactive = "bg-[var(--tertiary-gray-bg)]"

  return (
    <motion.div
      variants={fadeInUp}
      initial="initial"
      animate="animate"
      className="mb-8"
    >
      {/* Desktop Progress Steps */}
      <div className="hidden md:flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <motion.div
              variants={cardHover}
              whileHover="whileHover"
              className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all duration-200 min-w-[180px] ${currentStep >= step.id
                ? activeStepClass
                : inactiveStepClass
                }`}
              onClick={() => setCurrentStep(step.id)}
            >
              <step.icon size={20} className={currentStep >= step.id ? "text-white" : "text-[var(--mafia-red)] opacity-70"} />
              <div>
                <div className="font-semibold">{step.title}</div>
                <div className="text-xs opacity-80">{step.description}</div>
              </div>
            </motion.div>
            {index < steps.length - 1 && (
              <div className={`w-12 h-0.5 mx-2 rounded-full transition-colors duration-200 ${currentStep > step.id ? connectorActive : connectorInactive}`} />
            )}
          </div>
        ))}
      </div>

      {/* Mobile Progress Steps */}
      <div className="md:hidden">
        <div className="grid grid-cols-4 gap-2 mb-4">
          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              variants={cardHover}
              whileHover="whileHover"
              className={`flex flex-col items-center justify-center p-3 rounded-lg cursor-pointer transition-all duration-200 h-20 ${currentStep >= step.id
                ? activeStepClass
                : inactiveStepClass
                }`}
              onClick={() => setCurrentStep(step.id)}
            >
              <step.icon size={16} className={currentStep >= step.id ? "text-white" : "text-[var(--mafia-red)] opacity-70"} />
              <div className="text-center mt-1">
                <div className="text-xs font-semibold leading-tight">{step.title}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-[var(--tertiary-gray-bg)] rounded-full h-1 mb-4">
          <motion.div
            className="bg-[var(--mafia-red)] h-1 rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Mobile Step Description */}
        <div className="text-center bg-[var(--secondary-gray-bg)] rounded-lg p-4 border border-[var(--tertiary-gray-bg)]">
          <div className="text-sm font-medium text-white">
            {steps[currentStep].title}
          </div>
          <div className="text-xs text-[var(--primary-gray-text)] mt-1">
            {steps[currentStep].description}
          </div>
        </div>
      </div>
    </motion.div>
  )
} 