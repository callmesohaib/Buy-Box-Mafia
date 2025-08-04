import { useState, useEffect } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { Lock, ArrowRight } from "lucide-react";
import { toast } from 'react-hot-toast';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");

  useEffect(() => {
    const emailParam = searchParams.get("email");
    const tokenParam = searchParams.get("token");
    setEmail(emailParam || "");
    setToken(tokenParam || "");
    if (emailParam && tokenParam) {
      // Verify token with backend
      fetch(`http://localhost:3001/api/auth/verify-reset-token?email=${encodeURIComponent(emailParam)}&token=${tokenParam}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setTokenValid(true);
          } else {
            toast.error(data.message || "Invalid or expired link.");
            setTokenValid(false);
          }
        })
        .catch(() => {
          toast.error("Invalid or expired link.");
          setTokenValid(false);
        });
    }
  }, [searchParams]);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!password || password.length < 4) {
      toast.error("Password must be at least 4 characters.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    setIsLoading(true);
    const res = await fetch("http://localhost:3001/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    setIsLoading(false);
    if (res.ok) {
      toast.success("Password reset successful. You can now log in.");
      setTimeout(() => navigate("/login"), 2000);
    } else {
      toast.error("Failed to reset password. Try again.");
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-[var(--primary-gray-bg)] px-4">
      <div className="w-full max-w-md bg-[var(--secondary-gray-bg)] rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">Reset Password</h1>
        {tokenValid ? (
          <form onSubmit={handleResetPassword} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-[var(--primary-gray-text)]">New Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={16} className="text-[var(--placeholder-gray)]" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-transparent border-0 border-b border-b-[var(--tertiary-gray-bg)] focus:ring-0 focus:border-b-red-500 text-white placeholder-[var(--placeholder-gray)] transition-all duration-200"
                  placeholder="New password"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-[var(--primary-gray-text)]">Confirm Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={16} className="text-[var(--placeholder-gray)]" />
                </div>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-transparent border-0 border-b border-b-[var(--tertiary-gray-bg)] focus:ring-0 focus:border-b-red-500 text-white placeholder-[var(--placeholder-gray)] transition-all duration-200"
                  placeholder="Confirm password"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-lg bg-[var(--mafia-red)] text-white font-semibold shadow-lg hover:bg-[var(--mafia-red-hover)] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isLoading ? "Resetting..." : <>Reset Password <ArrowRight size={16} /></>}
            </button>
          </form>
        ) : (
          <div className="text-center">
            <p className="text-red-400 mb-4">Invalid or expired reset link.</p>
            <Link to="/forgot-password" className="text-[var(--mafia-red)] hover:text-[var(--mafia-red-hover)] font-medium">Request new link</Link>
          </div>
        )}
      </div>
    </div>
  );
}
