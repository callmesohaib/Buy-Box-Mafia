import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowRight } from "lucide-react";
import { toast } from 'react-hot-toast';

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    const handleVerifyEmail = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        const res = await fetch("http://localhost:3001/api/auth/verify-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
        });
        setIsLoading(false);
        if (res.ok) {
            setEmailSent(true);
            toast.success("If this email exists, a reset link has been sent.");
        } else {
            toast.error("Email not found. Please check and try again.");
        }
    };



    return (
        <div className="h-screen w-screen flex flex-col items-center justify-center bg-[var(--primary-gray-bg)] px-4">
            <div className="w-full max-w-md bg-[var(--secondary-gray-bg)] rounded-lg shadow-lg p-8">
                <h1 className="text-2xl font-bold text-white mb-6 text-center">Forgot Password</h1>
                {emailSent ? (
                    <div className="text-center">
                        <p className="text-green-400 mb-4">If this email exists, a reset link has been sent to your inbox.</p>
                        <Link to="/login" className="text-[var(--mafia-red)] hover:text-[var(--mafia-red-hover)] font-medium">Back to Login</Link>
                    </div>
                ) : (
                    <form onSubmit={handleVerifyEmail} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium mb-2 text-[var(--primary-gray-text)]">Email</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail size={16} className="text-[var(--placeholder-gray)]" />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-transparent border-0 border-b border-b-[var(--tertiary-gray-bg)] focus:ring-0 focus:border-b-red-500 text-white placeholder-[var(--placeholder-gray)] transition-all duration-200"
                                    placeholder="your@email.com"
                                    required
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 px-4 rounded-lg bg-[var(--mafia-red)] text-white font-semibold shadow-lg hover:bg-[var(--mafia-red-hover)] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70"
                        >
                            {isLoading ? "Verifying..." : <>Verify Email <ArrowRight size={16} /></>}
                        </button>
                        <div className="text-center mt-4">
                            <Link to="/login" className="text-sm text-[var(--mafia-red)] hover:text-[var(--mafia-red-hover)]">Back to Login</Link>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
