import { useState, useEffect } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { Crown, Menu, X } from "lucide-react"
import { motion } from "framer-motion"
import { buttonHover, fadeInDown } from "../animations/animation"
import { toast } from 'react-toastify'
import { handleLogout as logoutUtil } from '../utils/logout'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('isLoggedIn') === 'true')

  useEffect(() => {
    const syncLoginState = () => {
      setIsLoggedIn(localStorage.getItem('isLoggedIn') === 'true')
    }
    window.addEventListener('storage', syncLoginState)
    return () => window.removeEventListener('storage', syncLoginState)
  }, [])

  useEffect(() => {
    setIsLoggedIn(localStorage.getItem('isLoggedIn') === 'true')
  }, [location])

  // Unified navItems array
  const navItems = [
    { path: "/property-search", label: "Property Search", show: true },
    { path: "/deals", label: "My Deals", show: true },
    { path: "/logout", label: "Logout", show: isLoggedIn, isButton: true },
  ]

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  const handleLogout = () => {
    logoutUtil(navigate);
    setIsLoggedIn(false);
    toast.success('Successfully logged out.');
  }

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 bg-[var(--primary-gray-bg)]/95 backdrop-blur-md border-b border-[var(--tertiary-gray-bg)] shadow-sm"
      initial={fadeInDown.initial}
      animate={fadeInDown.animate}
      transition={fadeInDown.transition}
    >
      <div className="w-[90%] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            {/* Removed icon container here */}
            <div className="hidden sm:block">
              <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-[var(--mafia-red-strong)] to-[var(--primary-gray-text)] bg-clip-text text-transparent group-hover:from-[var(--primary-gray-text)] group-hover:to-[var(--mafia-red-strong)] transition-all duration-300">
                Buy Box Mafia
              </h1>
            </div>
            <div className="sm:hidden">
              <h1 className="text-lg font-bold bg-gradient-to-r from-[var(--mafia-red-strong)] to-[var(--primary-gray-text)] bg-clip-text text-transparent group-hover:from-[var(--primary-gray-text)] group-hover:to-[var(--mafia-red-strong)] transition-all duration-300">
                BBM
              </h1>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.filter(item => item.show).map((item) => (
              item.isButton ? (
                <motion.button
                  key={item.path}
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-medium rounded-lg bg-[var(--mafia-red)] text-white hover:bg-[var(--mafia-red-hover)] transition-all duration-200 shadow"
                  whileHover={buttonHover.whileHover}
                  whileTap={buttonHover.whileTap}
                >
                  {item.label}
                </motion.button>
              ) : (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${location.pathname === item.path
                    ? 'text-[var(--mafia-red)] bg-[var(--secondary-gray-bg)]'
                    : 'text-[var(--primary-gray-text)] hover:text-[var(--mafia-red)] hover:bg-[var(--secondary-gray-bg)]'
                    }`}
                >
                  {item.label}
                  {location.pathname === item.path && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--mafia-red)] rounded-full"></div>
                  )}
                </Link>
              )
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 rounded-lg text-[var(--primary-gray-text)] hover:text-[var(--mafia-red)] hover:bg-[var(--secondary-gray-bg)] transition-colors"
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-[var(--tertiary-gray-bg)] bg-[var(--primary-gray-bg)]/95 backdrop-blur-md">
            <div className="px-4 py-4 space-y-2">
              {navItems.filter(item => item.show).map((item) => (
                item.isButton ? (
                  <motion.button
                    key={item.path}
                    onClick={() => { handleLogout(); closeMenu(); }}
                    className="w-full block px-4 py-3 text-sm font-medium rounded-lg bg-[var(--mafia-red)] text-white hover:bg-[var(--mafia-red-hover)] text-center transition-all duration-200"
                    whileHover={buttonHover.whileHover}
                    whileTap={buttonHover.whileTap}
                  >
                    {item.label}
                  </motion.button>
                ) : (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={closeMenu}
                    className={`block px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${location.pathname === item.path
                      ? 'text-[var(--mafia-red)] bg-[var(--secondary-gray-bg)] border-l-4 border-[var(--mafia-red)]'
                      : 'text-[var(--primary-gray-text)] hover:text-[var(--mafia-red)] hover:bg-[var(--secondary-gray-bg)]'
                      }`}
                  >
                    {item.label}
                  </Link>
                )
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.nav>
  )
}