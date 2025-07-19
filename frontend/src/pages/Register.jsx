import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Eye, EyeOff, Mail, Lock, User, Phone, Building, AlertCircle } from "lucide-react"
import { toast } from 'react-toastify'

export default function Register() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: ""
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.firstName.trim()) {
        newErrors.firstName = "First name is required"
        toast.error("First name is required")
        setErrors(newErrors)
        return false
    }
    if (!formData.lastName.trim()) {
        newErrors.lastName = "Last name is required"
        toast.error("Last name is required")
        setErrors(newErrors)
        return false
    }
    if (!formData.email.trim()) {
        newErrors.email = "Email is required"
        toast.error("Email is required")
        setErrors(newErrors)
        return false
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = "Please enter a valid email"
        toast.error("Please enter a valid email")
        setErrors(newErrors)
        return false
    }
    if (!formData.password) {
        newErrors.password = "Password is required"
        toast.error("Password is required")
        setErrors(newErrors)
        return false
    } else if (formData.password.length < 8) {
        newErrors.password = "Password must be at least 8 characters"
        toast.error("Password must be at least 8 characters")
        setErrors(newErrors)
        return false
    }
    if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match"
        toast.error("Passwords do not match")
        setErrors(newErrors)
        return false
    }
    setErrors(newErrors)
    return true
}

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      toast.success('Registration successful! Please login.')
      navigate("/login")
    }, 1500)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[var(--primary-gray-bg)] to-black">
      <div className="flex flex-col md:flex-row w-full max-w-5xl mx-2 sm:mx-4 rounded-2xl overflow-hidden shadow-2xl">
        {/* Left Side - Image (hidden on mobile) */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="hidden md:block w-1/2 relative bg-[var(--primary-gray-bg)]"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/30 z-10"></div>
          <img
            src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
            alt="Register Property"
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-8 left-8 right-8 z-20 text-white">
            <h3 className="text-2xl font-bold mb-2">Join Buy Box Mafia</h3>
            <p className="text-[var(--primary-gray-text)]">Unlock exclusive real estate opportunities</p>
          </div>
        </motion.div>
        {/* Right Side - Form */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full md:w-1/2 bg-gradient-to-br from-[var(--primary-gray-bg)] to-[var(--secondary-gray-bg)] p-4 sm:p-8 md:px-6 md:py-4 flex flex-col justify-center"
        >
          <div className="mb-2 flex items-center gap-3 justify-center">
            <span className="text-xl sm:text-2xl font-bold text-[var(--mafia-red)] tracking-tight">Buy Box Mafia</span>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-6 text-center"
          >
            <h2 className="text-2xl font-bold text-white mb-1">Create Account</h2>
            <p className="text-[var(--secondary-gray-text)]">Join the elite land investment community</p>
          </motion.div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium mb-1 text-[var(--primary-gray-text)]">First Name</label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--placeholder-gray)]" />
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={`w-full pl-9 pr-2 py-2 rounded-lg bg-[var(--secondary-gray-bg)] border ${errors.firstName ? 'border-red-500' : 'border-[var(--tertiary-gray-bg)] hover:border-[var(--quaternary-gray-bg)]'} focus:ring-2 focus:ring-red-500 focus:border-transparent text-white placeholder-[var(--placeholder-gray)] text-sm transition-all duration-200`}
                    placeholder="John"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 text-[var(--primary-gray-text)]">Last Name</label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--placeholder-gray)]" />
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={`w-full pl-9 pr-2 py-2 rounded-lg bg-[var(--secondary-gray-bg)] border ${errors.lastName ? 'border-red-500' : 'border-[var(--tertiary-gray-bg)] hover:border-[var(--quaternary-gray-bg)]'} focus:ring-2 focus:ring-red-500 focus:border-transparent text-white placeholder-[var(--placeholder-gray)] text-sm transition-all duration-200`}
                    placeholder="Doe"
                  />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 text-[var(--primary-gray-text)]">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--placeholder-gray)]" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full pl-9 pr-2 py-2 rounded-lg bg-[var(--secondary-gray-bg)] border ${errors.email ? 'border-red-500' : 'border-[var(--tertiary-gray-bg)] hover:border-[var(--quaternary-gray-bg)]'} focus:ring-2 focus:ring-red-500 focus:border-transparent text-white placeholder-[var(--placeholder-gray)] text-sm transition-all duration-200`}
                  placeholder="john@example.com"
                />
              </div>
            </div>
            {/* Phone Number Field (Optional) */}
            <div>
              <label className="block text-xs font-medium mb-1 text-[var(--primary-gray-text)]">Phone Number <span className="text-[var(--secondary-gray-text)]">(optional)</span></label>
              <div className="relative">
                <Phone size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--placeholder-gray)]" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full pl-9 pr-2 py-2 rounded-lg bg-[var(--secondary-gray-bg)] border border-[var(--tertiary-gray-bg)] hover:border-[var(--quaternary-gray-bg)] focus:ring-2 focus:ring-red-500 focus:border-transparent text-white placeholder-[var(--placeholder-gray)] text-sm transition-all duration-200"
                  placeholder="e.g. +1 555 123 4567"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 text-[var(--primary-gray-text)]">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--placeholder-gray)]" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full pl-9 pr-8 py-2 rounded-lg bg-[var(--secondary-gray-bg)] border ${errors.password ? 'border-red-500' : 'border-[var(--tertiary-gray-bg)] hover:border-[var(--quaternary-gray-bg)]'} focus:ring-2 focus:ring-red-500 focus:border-transparent text-white placeholder-[var(--placeholder-gray)] text-sm transition-all duration-200`}
                  placeholder="Create a strong password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[var(--placeholder-gray)] hover:text-white transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 text-[var(--primary-gray-text)]">Confirm Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--placeholder-gray)]" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`w-full pl-9 pr-8 py-2 rounded-lg bg-[var(--secondary-gray-bg)] border ${errors.confirmPassword ? 'border-red-500' : 'border-[var(--tertiary-gray-bg)] hover:border-[var(--quaternary-gray-bg)]'} focus:ring-2 focus:ring-red-500 focus:border-transparent text-white placeholder-[var(--placeholder-gray)] text-sm transition-all duration-200`}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[var(--placeholder-gray)] hover:text-white transition-colors"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 mt-2 rounded-lg bg-[var(--mafia-red)] text-white font-semibold shadow-lg hover:bg-[var(--mafia-red-hover)] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>
          <div className="mt-2 text-center text-sm text-[var(--secondary-gray-text)]">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-[var(--mafia-red)] hover:text-[var(--mafia-red-hover)] transition-colors">
              Sign in here
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
} 