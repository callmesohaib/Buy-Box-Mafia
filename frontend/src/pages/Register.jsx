import React, { useState } from "react";
import { Mail, Lock, Eye, EyeOff, Phone, User } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!formData.firstName) newErrors.firstName = "First name is required";
    if (!formData.lastName) newErrors.lastName = "Last name is required";
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.password) newErrors.password = "Password is required";
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please correct the highlighted fields.");
      return;
    }

    setErrors({});
    setIsLoading(true);

    // Simulate registration
    setTimeout(() => {
      toast.success("Account created!");
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[var(--primary-gray-bg)] to-black">
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "#333",
            color: "#fff",
          },
        }}
      />

      <div className="flex flex-col md:flex-row w-full max-w-5xl mx-4 rounded-2xl overflow-hidden shadow-2xl">
        {/* Left Side */}
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
            <p className="text-[var(--primary-gray-text)]">
              Unlock exclusive real estate opportunities
            </p>
          </div>
        </motion.div>

        {/* Right Side */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full md:w-1/2 bg-gradient-to-br from-[var(--primary-gray-bg)] to-[var(--secondary-gray-bg)] p-6 sm:p-8 flex flex-col justify-center"
        >
          <div className="mb-4 text-center">
            <span className="text-xl sm:text-2xl font-bold text-[var(--mafia-red)]">
              Buy Box Mafia
            </span>
            <h2 className="text-2xl font-bold text-white mt-2">
              Create Account
            </h2>
            <p className="text-[var(--secondary-gray-text)]">
              Join the elite land investment community
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-2">
              {["firstName", "lastName"].map((field, i) => (
                <div key={field}>
                  <label className="block text-xs font-medium mb-1 text-[var(--primary-gray-text)]">
                    {field === "firstName" ? "First Name" : "Last Name"}
                  </label>
                  <div className="relative">
                    <User
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--placeholder-gray)]"
                    />
                    <input
                      type="text"
                      name={field}
                      value={formData[field]}
                      onChange={handleInputChange}
                      className={`w-full pl-9 pr-2 py-2 rounded-lg bg-[var(--secondary-gray-bg)] border ${
                        errors[field]
                          ? "border-red-500"
                          : "border-[var(--tertiary-gray-bg)] hover:border-[var(--quaternary-gray-bg)]"
                      } focus:ring-2 focus:ring-red-500 focus:border-transparent text-white placeholder-[var(--placeholder-gray)] text-sm transition-all duration-200`}
                      placeholder={field === "firstName" ? "John" : "Doe"}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-medium mb-1 text-[var(--primary-gray-text)]">
                Email Address
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--placeholder-gray)]"
                />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full pl-9 pr-2 py-2 rounded-lg bg-[var(--secondary-gray-bg)] border ${
                    errors.email
                      ? "border-red-500"
                      : "border-[var(--tertiary-gray-bg)] hover:border-[var(--quaternary-gray-bg)]"
                  } focus:ring-2 focus:ring-red-500 focus:border-transparent text-white placeholder-[var(--placeholder-gray)] text-sm transition-all duration-200`}
                  placeholder="john@example.com"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-medium mb-1 text-[var(--primary-gray-text)]">
                Phone Number <span className="text-[var(--secondary-gray-text)]">(optional)</span>
              </label>
              <div className="relative">
                <Phone
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--placeholder-gray)]"
                />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full pl-9 pr-2 py-2 rounded-lg bg-[var(--secondary-gray-bg)] border border-[var(--tertiary-gray-bg)] hover:border-[var(--quaternary-gray-bg)] focus:ring-2 focus:ring-red-500 focus:border-transparent text-white placeholder-[var(--placeholder-gray)] text-sm"
                  placeholder="+1 555 123 4567"
                />
              </div>
            </div>

            {/* Password */}
            {["password", "confirmPassword"].map((field, i) => (
              <div key={field}>
                <label className="block text-xs font-medium mb-1 text-[var(--primary-gray-text)]">
                  {field === "password" ? "Password" : "Confirm Password"}
                </label>
                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--placeholder-gray)]"
                  />
                  <input
                    type={
                      field === "password"
                        ? showPassword
                          ? "text"
                          : "password"
                        : showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    name={field}
                    value={formData[field]}
                    onChange={handleInputChange}
                    className={`w-full pl-9 pr-8 py-2 rounded-lg bg-[var(--secondary-gray-bg)] border ${
                      errors[field]
                        ? "border-red-500"
                        : "border-[var(--tertiary-gray-bg)] hover:border-[var(--quaternary-gray-bg)]"
                    } focus:ring-2 focus:ring-red-500 focus:border-transparent text-white placeholder-[var(--placeholder-gray)] text-sm`}
                    placeholder={
                      field === "password"
                        ? "Create a strong password"
                        : "Re-enter your password"
                    }
                  />
                  <button
                    type="button"
                    onClick={() =>
                      field === "password"
                        ? setShowPassword(!showPassword)
                        : setShowConfirmPassword(!showConfirmPassword)
                    }
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--placeholder-gray)] hover:text-white transition-colors"
                    tabIndex={-1}
                  >
                    {field === "password"
                      ? showPassword
                        ? <EyeOff size={16} />
                        : <Eye size={16} />
                      : showConfirmPassword
                      ? <EyeOff size={16} />
                      : <Eye size={16} />}
                  </button>
                </div>
              </div>
            ))}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 mt-2 rounded-lg bg-[var(--mafia-red)] text-white font-semibold shadow-lg hover:bg-[var(--mafia-red-hover)] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div className="mt-3 text-center text-sm text-[var(--secondary-gray-text)]">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-[var(--mafia-red)] hover:text-[var(--mafia-red-hover)]"
            >
              Sign in here
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
