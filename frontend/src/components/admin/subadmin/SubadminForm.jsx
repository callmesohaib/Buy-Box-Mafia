import { useState, useEffect } from "react"
import { useNavigate, useParams, useLocation } from "react-router-dom"
import { motion } from "framer-motion"
import { scaleIn } from "../../../animations/animation"
import { subadminService } from "../../../services/subadminService"

export default function SubadminForm({ onClose }) {
  const navigate = useNavigate()
  const { id } = useParams()
  const location = useLocation()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    role: "subadmin",
    permissions: ["read", "write"]
  })

  const isEditMode = !!id

  // Load subadmin data when in edit mode
  useEffect(() => {
    if (isEditMode) {
      const subadminData = location.state?.subadminData
      if (subadminData) {
        setForm({
          name: subadminData.name || "",
          email: subadminData.email || "",
          phone: subadminData.phone || "",
          location: subadminData.location || "",
          role: subadminData.role || "subadmin",
          permissions: subadminData.permissions || ["read", "write"]
        })
      }
    }
  }, [isEditMode, location.state])

  const handleChange = e => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      let response

      if (isEditMode) {
        // Update existing subadmin (excluding password)
        const updateData = {
          name: form.name,
          email: form.email,
          phone: form.phone,
          location: form.location,
          role: form.role,
          permissions: form.permissions
        }
        response = await subadminService.updateSubadmin(id, updateData)

        if (response.success) {
          alert("Subadmin updated successfully!")
          if (onClose) onClose()
          else navigate(-1)
        } else {
          setError(response.message || "Failed to update subadmin")
        }
      } else {
        // Create new subadmin
        response = await subadminService.createSubadmin(form)

        if (response.success) {
          alert(`Subadmin created successfully! Email sent to ${form.email}`)
          if (onClose) onClose()
          else navigate(-1)
        } else {
          setError(response.message || "Failed to create subadmin")
        }
      }
    } catch (error) {
      console.error(isEditMode ? "Error updating subadmin:" : "Error creating subadmin:", error)
      setError(error.message || (isEditMode ? "Failed to update subadmin" : "Failed to create subadmin"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      className="max-w-xl w-full mx-auto bg-gray-800 rounded-xl shadow-lg p-4 md:p-8 mt-4 md:mt-8 border border-gray-700"
      variants={scaleIn}
      initial="initial"
      animate="animate"
    >
      <button
        onClick={() => (onClose ? onClose() : navigate(-1))}
        className="mb-6 text-amber-400 hover:text-amber-300 transition-colors"
      >
        ← Back to Subadmins
      </button>
      <h2 className="text-2xl font-bold mb-6 text-white">
        {isEditMode ? "Edit Subadmin" : "Add New Subadmin"}
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              disabled={loading}
              className="w-full border border-gray-600 rounded-lg px-4 py-2 bg-gray-700 text-white focus:ring-2 focus:ring-amber-400 focus:border-transparent disabled:opacity-50"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 gap-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
              <input
                name="email"
                value={form.email}
                onChange={handleChange}
                type="email"
                required
                disabled={loading}
                className="w-full border border-gray-600 rounded-lg px-4 py-2 bg-gray-700 text-white focus:ring-2 focus:ring-amber-400 focus:border-transparent disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Phone</label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                required
                disabled={loading}
                className="w-full border border-gray-600 rounded-lg px-4 py-2 bg-gray-700 text-white focus:ring-2 focus:ring-amber-400 focus:border-transparent disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Location</label>
              <input
                name="location"
                value={form.location}
                onChange={handleChange}
                required
                disabled={loading}
                placeholder="e.g., New York, NY"
                className="w-full border border-gray-600 rounded-lg px-4 py-2 bg-gray-700 text-white focus:ring-2 focus:ring-amber-400 focus:border-transparent disabled:opacity-50"
              />
            </div>
          </div>
        </div>
        <div className="flex justify-end mt-8">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 rounded-lg bg-[var(--mafia-red)] text-white font-semibold hover:bg-[var(--mafia-red-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                {isEditMode ? "Updating..." : "Creating..."}
              </>
            ) : (
              isEditMode ? "Save Changes" : "Add Subadmin"
            )}
          </button>
        </div>
      </form>
    </motion.div>
  )
} 