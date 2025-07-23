import React, { useState } from "react";
import { Mail, Lock, Eye, EyeOff, Phone, User } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";

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

  const handleSubmit = async (e) => {
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

    try {
      const res = await fetch("http://localhost:3001/api/scout/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Account created! Please check your email for credentials.");
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          password: "",
          confirmPassword: "",
        });
      } else {
        toast.error(data.message || "Registration failed");
      }
    } catch (err) {
      toast.error("Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col md:flex-row overflow-hidden">
      <div className="hidden md:block w-1/2 h-full overflow-hidden bg-[var(--primary-gray-bg)]">
        <img
          src=" https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=800&q=80"
          alt="Luxury Property"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="w-full md:w-1/2 h-full bg-gradient-to-br from-[var(--primary-gray-bg)] to-[var(--secondary-gray-bg)] px-4 py-4 sm:px-8 sm:py-8 flex flex-col justify-center">
        <div className="mb-5 text-left">
          <span className="text-lg md:text-base font-bold text-[var(--mafia-red)]">
            Buy Box Mafia
          </span>
          <h2 className="text-3xl md:text-2xl font-bold text-white mt-5">
            Create Account!
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-2">
            {["firstName", "lastName"].map((field, i) => (
              <div key={field}>
                <label className="block text-base md:text-sm font-medium mb-1 text-[var(--primary-gray-text)]">
                  {field === "firstName" ? "First Name" : "Last Name"}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                    <User size={17} className="text-[var(--placeholder-gray)]" />
                  </div>
                  <input
                    type="text"
                    name={field}
                    value={formData[field]}
                    onChange={handleInputChange}
                    className={`w-full pl-8 pr-2 py-2 bg-transparent border-0 border-b ${errors[field]
                      ? "border-b-red-500"
                      : "border-b-[var(--tertiary-gray-bg)] hover:border-b-[var(--quaternary-gray-bg)]"
                      } focus:ring-0 focus:border-b-red-500 text-base md:text-sm text-white placeholder-[var(--placeholder-gray)] transition-all duration-200`}
                    placeholder={field === "firstName" ? "John" : "Doe"}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Email */}
          <div>
            <label className="block text-base md:text-sm font-medium mb-1 text-[var(--primary-gray-text)]">
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                <Mail size={17} className="text-[var(--placeholder-gray)]" />
              </div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full pl-8 pr-2 py-2 bg-transparent border-0 border-b ${errors.email
                  ? "border-b-red-500"
                  : "border-b-[var(--tertiary-gray-bg)] hover:border-b-[var(--quaternary-gray-bg)]"
                  } focus:ring-0 focus:border-b-red-500 text-base md:text-sm text-white placeholder-[var(--placeholder-gray)] transition-all duration-200`}
                placeholder="john@example.com"
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-base md:text-sm font-medium mb-1 text-[var(--primary-gray-text)]">
              Phone <span className="text-[var(--secondary-gray-text)]">(optional)</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                <Phone size={17} className="text-[var(--placeholder-gray)]" />
              </div>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full pl-8 pr-2 py-2 bg-transparent border-0 border-b border-b-[var(--tertiary-gray-bg)] hover:border-b-[var(--quaternary-gray-bg)] focus:ring-0 focus:border-b-red-500 text-base md:text-sm text-white placeholder-[var(--placeholder-gray)] transition-all duration-200"
                placeholder="+1 555 123 4567"
              />
            </div>
          </div>

          {/* Password */}
          {["password", "confirmPassword"].map((field, i) => (
            <div key={field}>
              <label className="block text-base md:text-sm font-medium mb-1 text-[var(--primary-gray-text)]">
                {field === "password" ? "Password" : "Confirm Password"}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                  <Lock size={17} className="text-[var(--placeholder-gray)]" />
                </div>
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
                  className={`w-full pl-8 pr-8 py-2 bg-transparent border-0 border-b ${errors[field]
                    ? "border-b-red-500"
                    : "border-b-[var(--tertiary-gray-bg)] hover:border-b-[var(--quaternary-gray-bg)]"
                    } focus:ring-0 focus:border-b-red-500 text-base md:text-sm text-white placeholder-[var(--placeholder-gray)] transition-all duration-200`}
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
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--placeholder-gray)] hover:text-white transition-colors"
                  tabIndex={-1}
                >
                  {field === "password"
                    ? showPassword
                      ? <EyeOff size={14} />
                      : <Eye size={14} />
                    : showConfirmPassword
                      ? <EyeOff size={14} />
                      : <Eye size={14} />}
                </button>
              </div>
            </div>
          ))}

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 px-2 rounded bg-[var(--mafia-red)] text-base md:text-sm text-white font-semibold shadow hover:bg-[var(--mafia-red-hover)] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Creating Account...
              </>
            ) : (
              "Create Account"
            )}
          </button>

          <div className="mt-3 text-center text-base md:text-sm text-[var(--secondary-gray-text)]">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-[var(--mafia-red)] hover:text-[var(--mafia-red-hover)]"
            >
              Sign in here
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
