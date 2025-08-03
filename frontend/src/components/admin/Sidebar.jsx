import React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useNavigate, NavLink } from "react-router-dom"
import { useMemo, useCallback } from "react"
import {
  FileText,
  Users,
  BarChart3,
  Bell,
  Shield,
  Home,
  LogOut,
  ArrowLeft,
  Menu,
} from "lucide-react"
import { buttonHover } from "../../animations/animation"

import { toast } from 'react-toastify'
import { useAuth } from '../../store/AuthContext'


function Sidebar({ activeTab, setActiveTab, isMobileMenuOpen, setIsMobileMenuOpen }) {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const userRole = user?.role;

  const navItems = useMemo(() => {
    return userRole === 'subadmin'
      ? [
        { id: "buyers", label: "Buyers", icon: Users, path: "/subadmin/buyer" },
      ]
      : [
        { id: "overview", label: "Overview", icon: Home, path: "/admin" },
        { id: "deals", label: "Deals", icon: FileText, path: "/admin/deals" },
        { id: "buyers", label: "Buyers", icon: Users, path: "/admin/buyer" },
        { id: "subadmins", label: "Subadmins", icon: Shield, path: "/admin/subadmin" },
        { id: "analytics", label: "Analytics", icon: BarChart3, path: "/admin/analytics" },
      ];
  }, [userRole]);

  const handleLogout = useCallback(() => {
    logout();
    navigate("/");
    toast.success("Logged out successfully");
  }, [logout, navigate]);

  const userName = user?.name || (userRole === 'subadmin' ? 'Subadmin User' : 'Admin User');
  const userEmail = user?.email || (userRole === 'subadmin' ? 'subadmin@buyboxmafia.com' : 'admin@buyboxmafia.com');

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-gray-900 border-b border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-gray-300 hover:text-amber-400 transition-colors"
            >
              <Menu size={24} />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-[var(--mafia-red)] to-[var(--mafia-red-strong)] rounded-lg flex items-center justify-center">
                <Shield size={16} className="text-gray-900" />
              </div>
              <span className="font-semibold text-white">{userRole === 'subadmin' ? 'Subadmin' : 'Admin'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <motion.div
        initial={{ x: -300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="hidden lg:block fixed left-0 top-0 h-full w-64 bg-gray-900 shadow-lg border-r border-gray-700 z-40"
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-gradient-to-br from-[var(--mafia-red)] to-[var(--mafia-red-strong)] rounded-lg flex items-center justify-center">
              <Shield size={20} className="text-gray-900" />
            </div>
            <div>
              <h1 className="text-base font-semibold text-white">{userRole === 'subadmin' ? 'Subadmin Panel' : 'Admin Panel'}</h1>
              <p className="text-xs text-gray-400">Buy Box Mafia</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-3">
          <div className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.id}
                to={item.path}
                end={item.id === "overview"}
                className={({ isActive }) =>
                  `w-full flex items-center gap-2.5 px-3 py-2 rounded-md font-medium transition-all duration-200 ${isActive
                    ? "bg-[var(--mafia-red)] text-white shadow-sm"
                    : "text-gray-300 hover:text-amber-400 hover:bg-gray-800"
                  }`
                }
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              >
                <item.icon size={18} />
                {item.label}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Bottom Section */}
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-gray-700">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 bg-gray-700 rounded-full flex items-center justify-center">
              <span className="text-xs font-medium text-gray-300">A</span>
            </div>
            <div>
              <p className="text-xs font-medium text-white">{userName}</p>
              <p className="text-xs text-gray-400">{userEmail}</p>
            </div>
          </div>

          <div className="flex gap-1.5">
            <motion.button
              variants={buttonHover}
              whileHover="whileHover"
              whileTap="whileTap"
              className="flex-1 flex gap-1.5 px-2 py-1.5 text-xs text-gray-300 hover:text-amber-400 hover:bg-gray-800 rounded-md transition-colors"
            >
              <Bell size={14} />
              Notifications
            </motion.button>
            <motion.button
              variants={buttonHover}
              whileHover="whileHover"
              whileTap="whileTap"
              onClick={handleLogout}
              className="flex items-center justify-center gap-1.5 px-2 py-1.5 text-xs text-gray-300 hover:text-red-400 hover:bg-red-900/20 rounded-md transition-colors"
            >
              <LogOut size={14} />
              <span>Logout</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            />

            {/* Mobile Sidebar */}
            <motion.div
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden fixed left-0 top-0 h-full w-72 bg-gray-900 shadow-lg border-r border-gray-700 z-50"
            >
              {/* Header */}
              <div className="p-4 border-b border-gray-700">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-[var(--mafia-red)] to-[var(--mafia-red-strong)] rounded-lg flex items-center justify-center">
                    <Shield size={20} className="text-gray-900" />
                  </div>
                  <div>
                    <h1 className="text-base font-semibold text-white">{userRole === 'subadmin' ? 'Subadmin Panel' : 'Admin Panel'}</h1>
                    <p className="text-xs text-gray-400">Buy Box Mafia</p>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <nav className="p-3">
                <div className="space-y-1">
                  {navItems.map((item) => (
                    <NavLink
                      key={item.id}
                      to={item.path}
                      end={item.id === "overview"}
                      className={({ isActive }) =>
                        `w-full flex items-center gap-2.5 px-3 py-2 rounded-md font-medium transition-all duration-200 ${isActive
                          ? "bg-[var(--mafia-red)] text-white shadow-sm"
                          : "text-gray-300 hover:text-amber-400 hover:bg-gray-800"
                        }`
                      }
                      onClick={() => {
                        setActiveTab(item.id)
                        setIsMobileMenuOpen(false)
                        window.scrollTo({ top: 0, behavior: 'smooth' })
                      }}
                    >
                      <item.icon size={18} />
                      {item.label}
                    </NavLink>
                  ))}
                </div>
              </nav>

              {/* Bottom Section */}
              <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-gray-700">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 bg-gray-700 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-gray-300">A</span>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-white">{userName}</p>
                    <p className="text-xs text-gray-400">{userEmail}</p>
                  </div>
                </div>

                <div className="flex gap-1.5 justify-center items-center">
                  <motion.button
                    variants={buttonHover}
                    whileHover="whileHover"
                    whileTap="whileTap"
                    className="flex-1 flex gap-1.5 px-2 py-1.5 text-xs text-gray-300 hover:text-amber-400 hover:bg-gray-800 rounded-md transition-colors"
                  >
                    <Bell size={14} />
                    <span className="text-left">Notifications</span>
                  </motion.button>
                  <motion.button
                    variants={buttonHover}
                    whileHover="whileHover"
                    whileTap="whileTap"
                    onClick={handleLogout}
                    className="flex items-center justify-center gap-1.5 px-2 py-1.5 text-xs text-gray-300 hover:text-red-400 hover:bg-red-900/20 rounded-md transition-colors"
                  >
                    <LogOut size={14} />
                    <span>Logout</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

// Memoize the component to prevent unnecessary re-renders
export default React.memo(Sidebar)