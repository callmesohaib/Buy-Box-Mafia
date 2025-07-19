import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { scaleIn } from "../../../animations/animation"

export default function SubadminForm({ onClose }) {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    role: "",
    permissions: "",
    status: "Active"
  })
  const handleChange = e => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }
  const handleSubmit = e => {
    e.preventDefault()
    console.log(form)
    alert("Subadmin added! (Check console for data)")
    if (onClose) onClose()
    else navigate(-1)
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
      <h2 className="text-2xl font-bold mb-6 text-white">Add New Subadmin</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
            <input name="name" value={form.name} onChange={handleChange} required className="w-full border border-gray-600 rounded-lg px-4 py-2 bg-gray-700 text-white focus:ring-2 focus:ring-amber-400 focus:border-transparent" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 gap-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
              <input name="email" value={form.email} onChange={handleChange} type="email" required className="w-full border border-gray-600 rounded-lg px-4 py-2 bg-gray-700 text-white focus:ring-2 focus:ring-amber-400 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Phone</label>
              <input name="phone" value={form.phone} onChange={handleChange} required className="w-full border border-gray-600 rounded-lg px-4 py-2 bg-gray-700 text-white focus:ring-2 focus:ring-amber-400 focus:border-transparent" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Location</label>
            <input name="location" value={form.location} onChange={handleChange} required className="w-full border border-gray-600 rounded-lg px-4 py-2 bg-gray-700 text-white focus:ring-2 focus:ring-amber-400 focus:border-transparent" />
          </div>
        </div>
        <div className="flex justify-end mt-8">
          <button type="submit" className="px-6 py-2 rounded-lg bg-[var(--mafia-red)] text-white font-semibold hover:bg-[var(--mafia-red-hover)] transition-colors">Add Subadmin</button>
        </div>
      </form>
    </motion.div>
  )
} 