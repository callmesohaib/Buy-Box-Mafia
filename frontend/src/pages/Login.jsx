import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowRight,
} from "lucide-react";
import { toast } from 'react-hot-toast';
import { auth, signInWithEmailAndPassword } from "../firebase/client";

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check existing auth state
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        user.getIdTokenResult().then((idTokenResult) => {
          const role = idTokenResult.claims.role || "scout";
          localStorage.setItem("isLoggedIn", "true");
          localStorage.setItem("role", role);
          redirectBasedOnRole(role);
        });
      }
    });
    return () => unsubscribe();
  }, []);

  const redirectBasedOnRole = (role) => {
    switch (role) {
      case "admin":
        navigate("/admin");
        break;
      case "subadmin":
        navigate("/subadmin/buyer");
        break;
      case "scout":
        navigate("/property-search");
        break;
      default:
        navigate("/");
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);

    try {
      // Sign in with Firebase client SDK for password verification
      const userCredential = await signInWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      // Force refresh the ID token to get latest custom claims
      await userCredential.user.getIdToken(true);
      const idTokenResult = await userCredential.user.getIdTokenResult();
      const role = idTokenResult.claims.role || "scout";

      // Store login state
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("role", role);

      // Fetch user profile and store name/email
      try {
        const userProfileRes = await fetch(
          `http://localhost:3001/api/users/by-email/${formData.email}`
        );
        if (userProfileRes.ok) {
          const { user } = await userProfileRes.json();
          localStorage.setItem("name", user.name);
          localStorage.setItem("email", user.email);
          localStorage.setItem("uid", user.uid);
          if (user.id) localStorage.setItem("subadminId", user.id);
        }
      } catch (e) {
        /* ignore profile fetch errors for now */
      }

      // Redirect based on role
      redirectBasedOnRole(role);
      toast.success("Login successful!");
    } catch (error) {
      console.error("Login error:", error);
      let errorMessage = "Login failed. Please try again.";

      if (error.code === "auth/wrong-password") {
        errorMessage = "Invalid password. Please try again.";
      } else if (error.code === "auth/user-not-found") {
        errorMessage = "No user found with this email.";
      } else if (error.code === "auth/invalid-credential") {
        errorMessage = "Invalid email or password. Please try again.";
      }

      toast.error(errorMessage);
      setErrors({ general: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
      toast.error("Email is required");
      setErrors(newErrors);
      return false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
      toast.error("Please enter a valid email");
      setErrors(newErrors);
      return false;
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
      toast.error("Password is required");
      setErrors(newErrors);
      return false;
    }
    setErrors(newErrors);
    return true;
  };
  return (
    <div className="h-screen w-screen flex flex-col md:flex-row overflow-hidden">
      <div className="w-full md:w-1/2 h-full bg-gradient-to-br from-[var(--primary-gray-bg)] to-[var(--secondary-gray-bg)] px-6 py-6 sm:px-16 sm:py-10 md:px-28 md:py-10 flex flex-col justify-center">
        <div className="mb-8 flex items-center gap-3">
          <span className="text-2xl font-bold text-[var(--mafia-red)] tracking-tight">
            Buy Box Mafia
          </span>
        </div>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Welcome back!</h1>
          <p className="text-[var(--secondary-gray-text)]">
            Sign in to access your exclusive property portfolio
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2 text-[var(--primary-gray-text)]">
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail size={16} className="text-[var(--placeholder-gray)]" />
              </div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full pl-10 pr-4 py-3 bg-transparent border-0 border-b ${errors.email
                    ? "border-b-red-500"
                    : "border-b-[var(--tertiary-gray-bg)] hover:border-b-[var(--quaternary-gray-bg)]"
                  } focus:ring-0 focus:border-b-red-500 text-white placeholder-[var(--placeholder-gray)] transition-all duration-200`}
                placeholder="your@email.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-[var(--primary-gray-text)]">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock size={16} className="text-[var(--placeholder-gray)]" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`w-full pl-10 pr-10 py-3 bg-transparent border-0 border-b ${errors.password
                    ? "border-b-red-500"
                    : "border-b-[var(--tertiary-gray-bg)] hover:border-b-[var(--quaternary-gray-bg)]"
                  } focus:ring-0 focus:border-b-red-500 text-white placeholder-[var(--placeholder-gray)] transition-all duration-200`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--placeholder-gray)] hover:text-white transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="rememberMe"
                type="checkbox"
                checked={formData.rememberMe}
                onChange={handleInputChange}
                className="h-4 w-4 text-red-600 focus:ring-red-500 border-[var(--quaternary-gray-bg)] rounded bg-[var(--tertiary-gray-bg)]"
              />
              <label
                htmlFor="remember-me"
                className="ml-2 block text-sm text-[var(--primary-gray-text)]"
              >
                Remember me
              </label>
            </div>
            <Link
              to="/forgot-password"
              className="text-sm font-medium text-[var(--mafia-red)] hover:text-[var(--mafia-red-hover)]"
            >
              Forgot password?
            </Link>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-lg bg-[var(--mafia-red)] text-white font-semibold shadow-lg hover:bg-[var(--mafia-red-hover)] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70"
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
                  Signing in...
                </>
              ) : (
                <>
                  Sign in <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>

          <div className="mt-8 text-center text-sm text-[var(--secondary-gray-text)]">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-medium text-red-500 hover:text-red-400 transition-colors"
            >
              Get started
            </Link>
          </div>
        </form>
      </div>

      <div className="hidden md:block w-1/2 h-full overflow-hidden bg-[var(--primary-gray-bg)]">
        <img
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80"
          alt="Luxury Property"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
}
