import React, { useState, useEffect, useCallback, useMemo } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { motion } from "framer-motion"
import { fadeInDown } from "../animations/animation"
import Sidebar from "../components/admin/Sidebar"
import { Outlet } from "react-router-dom"

function AdminDashboard() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const role = useMemo(() => localStorage.getItem('role'), [])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  // Memoize the setActiveTab function to prevent Sidebar re-renders
  const setActiveTab = useCallback(() => {}, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--from-bg)] to-[var(--secondary-gray-bg)] flex">
      <Sidebar
        activeTab={null}
        setActiveTab={setActiveTab}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      {/* Main Content */}
      <div className="flex-1 lg:ml-64">
        <div className="pt-16 lg:pt-0 p-4 lg:p-2">
          {/* Always show header */}
          <motion.div
            variants={fadeInDown}
            initial="initial"
            animate="animate"
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-4">



              {role === "admin" ? <div>
                <h1 className="text-2xl mt-5 ml-3 font-bold text-white">Admin Dashboard</h1>
                <p className="text-gray-400 mt-1 ml-3">Full management interface for administrators</p>
              </div> : <div>
                <h1 className="text-2xl mt-5 font-bold ml-3 text-white">SubAdmin Dashboard</h1>
                <p className="text-gray-400 mt-1 ml-3">Management interface for subadministrators</p>
              </div>}
            </div>
          </motion.div>
          <Outlet />
        </div>
      </div>
    </div>
  )
}

// Memoize the component to prevent unnecessary re-renders
export default React.memo(AdminDashboard)