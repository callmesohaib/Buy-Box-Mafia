import { useState, useEffect } from "react"
import { useNavigate, useParams, useLocation } from "react-router-dom"
import { motion } from "framer-motion"
import { fadeInUp, scaleIn } from "../../../animations/animation"
import { Check } from "lucide-react"
import { toast } from 'react-hot-toast';
import { useAuth } from "../../../store/AuthContext"

const steps = [
  "Basic Info",
  "Preferences",
  "Requirements",
  "Budget & Timeline"
]

export default function BuyerForm({ onClose }) {
  const navigate = useNavigate()
  const { id } = useParams();
  const location = useLocation();
  const { user } = useAuth();
  const [step, setStep] = useState(0)
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    country: "",
    buyingLocations: "",
    lotSizeMin: "",
    lotSizeMax: "",
    pricePer: "",
    mustBeCleared: "no",
    zoningTypes: "",
    accessRequired: "no",
    utilities: "",
    buyOnMarket: "no",
    budgetMin: "",
    budgetMax: "",
    timeline: ""
  })
  const [loading, setLoading] = useState(false);
  const isEdit = Boolean(id);
  const API_BASE_URL = import.meta.env.VITE_BASE_URL;



  useEffect(() => {
    if (isEdit) {
      // Try to get buyer data from location.state first
      const buyerData = location.state?.buyerData;
      if (buyerData) {
        setForm({ ...buyerData });
      } else {
        // Fetch from backend if not in state
        setLoading(true);
        fetch(`${API_BASE_URL}/buyers`)
          .then(res => res.json())
          .then(buyers => {
            const found = buyers.find(b => b.id === id);
            if (found) setForm({ ...found });
            setLoading(false);
          })
          .catch(() => setLoading(false));
      }
    }
  }, [isEdit, id, location.state]);

  const handleChange = e => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleNext = e => {
    e && e.preventDefault()
    setStep(s => Math.min(s + 1, steps.length - 1))
  }
  const handleBack = e => {
    e && e.preventDefault()
    setStep(s => Math.max(s - 1, 0))
  }
  const handleSubmit = async e => {
    e.preventDefault();
    const submittedBy = user.id || 'Unknown';
    const payload = { ...form, submittedBy };
    try {
      let response, data;
      if (isEdit) {
        response = await fetch(`${API_BASE_URL}/buyers/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        data = await response.json();
        if (data.success) {
          toast.success("Buyer updated!");
          if (onClose) onClose();
          else navigate(-1);
        } else {
          toast.error(data.message || "Failed to update buyer");
        }
      } else {
        response = await fetch(`${API_BASE_URL}/buyers`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        data = await response.json();
        if (data.success) {
          toast.success("Buyer added!");
          if (onClose) onClose();
          else navigate(-1);
        } else {
          toast.error(data.message || "Failed to add buyer");
        }
      }
    } catch (err) {
      toast.error(isEdit ? "Error updating buyer" : "Error adding buyer");
    }
  };

  if (loading) return <div className="text-center text-gray-300 py-12">Loading...</div>;

  return (
    <motion.div
      className="max-w-3xl w-full mx-auto bg-gray-800 rounded-xl shadow-lg p-4 md:p-8 mt-4 md:mt-8 border border-gray-700"
      variants={scaleIn}
      initial="initial"
      animate="animate"
    >
      <button
        onClick={() => (onClose ? onClose() : navigate(-1))}
        className="mb-6 text-amber-400 hover:text-amber-300 transition-colors"
      >
        ← Back to Buyers
      </button>
      <h2 className="text-2xl font-bold mb-6 text-white">{isEdit ? "Edit Buyer" : "Add New Buyer"}</h2>
      {/* Stepper */}
      {/* Mobile Stepper: Progress bar and label */}
      <div className="md:hidden mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-400">Step {step + 1} of {steps.length}</span>
          <span className="text-sm font-semibold text-amber-400">{steps[step]}</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div className="bg-amber-400 h-2 rounded-full transition-all duration-300" style={{ width: `${((step + 1) / steps.length) * 100}%` }} />
        </div>
      </div>
      {/* Desktop Stepper: Modern horizontal with progress bar and aligned circles/labels */}
      <div className="hidden md:block mb-8">
        <div className="relative flex items-center justify-between w-full max-w-3xl mx-auto" style={{ minHeight: '64px' }}>
          {/* Progress Bar (background) */}
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-700 z-0" style={{ transform: 'translateY(-50%)' }} />
          {/* Progress Bar (active) */}
          <div className="absolute top-1/2 left-0 h-1 bg-amber-400 z-10 transition-all duration-300" style={{ width: `${(step / (steps.length - 1)) * 100}%`, transform: 'translateY(-50%)' }} />
          {/* Step Circles */}
          {steps.map((label, idx) => (
            <div key={label} className="relative z-20 flex flex-col items-center flex-1">
              <div className={`w-10 h-10 flex items-center justify-center rounded-full font-bold border-2 mb-2 transition-all duration-300
                ${step === idx ? 'bg-amber-400 border-amber-400 text-gray-900 scale-110 shadow-lg' :
                  idx < step ? 'bg-green-400 border-green-400 text-gray-900' :
                    'bg-gray-600 border-gray-600 text-gray-300'}
              `}>
                {idx < step ? <Check size={20} /> : idx + 1}
              </div>
              <span className={`text-sm font-medium text-center mt-0 ${step === idx ? 'text-amber-400' : idx < step ? 'text-green-400' : 'text-gray-400'}`}>{label}</span>
            </div>
          ))}
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <motion.div
          key={step}
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          {step === 0 && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter buyer's full name"
                  className="w-full border border-gray-600 rounded-lg px-4 py-2 bg-gray-700 text-white focus:ring-2 focus:ring-amber-400 focus:border-transparent"
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
                    placeholder="example@email.com"
                    className="w-full border border-gray-600 rounded-lg px-4 py-2 bg-gray-700 text-white focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Phone</label>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    required
                    placeholder="+1 (123) 456-7890"
                    className="w-full border border-gray-600 rounded-lg px-4 py-2 bg-gray-700 text-white focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 gap-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">City</label>
                  <input
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    required
                    placeholder="e.g. New York"
                    className="w-full border border-gray-600 rounded-lg px-4 py-2 bg-gray-700 text-white focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Country</label>
                  <input
                    name="country"
                    value={form.country}
                    onChange={handleChange}
                    required
                    placeholder="e.g. United States"
                    className="w-full border border-gray-600 rounded-lg px-4 py-2 bg-gray-700 text-white focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Buying Locations</label>
                <input
                  name="buyingLocations"
                  value={form.buyingLocations}
                  onChange={handleChange}
                  required
                  placeholder="Location 1 / Location 2 / Location 3"
                  className="w-full border border-gray-600 rounded-lg px-4 py-2 bg-gray-700 text-white focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                />
              </div>
            </div>
          )}
          {step === 1 && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 gap-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Lot Size Min (acres)</label>
                  <input
                    name="lotSizeMin"
                    value={form.lotSizeMin}
                    onChange={handleChange}
                    type="number"
                    min="0"
                    step="any"
                    placeholder="Minimum lot size in acres"
                    className="w-full border border-gray-600 rounded-lg px-4 py-2 bg-gray-700 text-white focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Lot Size Max (acres)</label>
                  <input
                    name="lotSizeMax"
                    value={form.lotSizeMax}
                    onChange={handleChange}
                    type="number"
                    min="0"
                    step="any"
                    placeholder="Maximum lot size in acres"
                    className="w-full border border-gray-600 rounded-lg px-4 py-2 bg-gray-700 text-white focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Price per acre or per lot</label>
                <input
                  name="pricePer"
                  value={form.pricePer}
                  onChange={handleChange}
                  placeholder="e.g. $10,000 per acre or $500,000 per lot"
                  className="w-full border border-gray-600 rounded-lg px-4 py-2 bg-gray-700 text-white focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Zoning Types Accepted</label>
                <input
                  name="zoningTypes"
                  value={form.zoningTypes}
                  onChange={handleChange}
                  placeholder="Residential, Agricultural, Commercial, etc."
                  className="w-full border border-gray-600 rounded-lg px-4 py-2 bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                />
              </div>
            </div>
          )}
          {step === 2 && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 gap-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Must be cleared?</label>
                  <select
                    name="mustBeCleared"
                    value={form.mustBeCleared}
                    onChange={handleChange}
                    className="w-full border border-gray-600 rounded-lg px-4 py-2 bg-gray-700 text-white focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                  >
                    <option value="yes">Yes - Land must be cleared</option>
                    <option value="no">No - Can be uncleared</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Access Requirements</label>
                  <select
                    name="accessRequired"
                    value={form.accessRequired}
                    onChange={handleChange}
                    className="w-full border border-gray-600 rounded-lg px-4 py-2 bg-gray-700 text-white focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                  >
                    <option value="yes">Yes - Must have road access</option>
                    <option value="no">No - No road access required</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Utilities Needed / Preferences</label>
                <input
                  name="utilities"
                  value={form.utilities}
                  onChange={handleChange}
                  placeholder="e.g. Electricity, Water, Sewer, etc."
                  className="w-full border border-gray-600 rounded-lg px-4 py-2 bg-gray-700 text-white focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 gap-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Buy On Market?</label>
                  <select
                    name="buyOnMarket"
                    value={form.buyOnMarket}
                    onChange={handleChange}
                    className="w-full border border-gray-600 rounded-lg px-4 py-2 bg-gray-700 text-white focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                  >
                    <option value="yes">Yes - Will buy listed properties</option>
                    <option value="no">No - Only off-market deals</option>
                  </select>
                </div>
              </div>
            </div>
          )}
          {step === 3 && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 gap-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Min Purchase Budget</label>
                  <input
                    name="budgetMin"
                    value={form.budgetMin}
                    onChange={handleChange}
                    type="number"
                    min="0"
                    step="any"
                    placeholder="Minimum budget amount"
                    className="w-full border border-gray-600 rounded-lg px-4 py-2 bg-gray-700 text-white focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Max Purchase Budget</label>
                  <input
                    name="budgetMax"
                    value={form.budgetMax}
                    onChange={handleChange}
                    type="number"
                    min="0"
                    step="any"
                    placeholder="Maximum budget amount"
                    className="w-full border border-gray-600 rounded-lg px-4 py-2 bg-gray-700 text-white focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Timeline to Close</label>
                <input
                  name="timeline"
                  value={form.timeline}
                  onChange={handleChange}
                  placeholder="e.g. Within 30 days, Flexible, etc."
                  className="w-full border border-gray-600 rounded-lg px-4 py-2 bg-gray-700 text-white focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                />
              </div>
            </div>
          )}
        </motion.div>
        {/* Navigation Buttons */}
        <div className="flex flex-col md:flex-row justify-between mt-8 gap-4">
          {step > 0 && (
            <button type="button" onClick={handleBack} className="w-full md:w-auto px-6 py-2 rounded-lg bg-gray-700 text-gray-300 font-semibold hover:bg-gray-600 transition-colors border border-gray-600">Back</button>
          )}
          {step < steps.length - 1 ? (
            <button type="button" onClick={handleNext} className="w-full md:w-auto ml-auto px-6 py-2 rounded-lg bg-[var(--mafia-red)] text-white font-semibold hover:bg-[var(--mafia-red-hover)] transition-colors">Next</button>
          ) : (
            <button type="submit" className="w-full md:w-auto ml-auto px-6 py-2 rounded-lg bg-[var(--mafia-red)] text-white font-semibold hover:bg-[var(--mafia-red-hover)] transition-colors">{isEdit ? "Save Changes" : "Add Buyer"}</button>
          )}
        </div>
      </form>
    </motion.div>
  )
} 