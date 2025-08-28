import { useState, useEffect } from "react";
import { useAuth } from "../store/AuthContext";
import { Eye, EyeOff, Mail, Phone, User, Lock } from "lucide-react";
import { toast } from 'react-hot-toast';

export default function ScoutProfile() {
    const { user, logout } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });
    const [errors, setErrors] = useState({});
    const API_BASE_URL = import.meta.env.VITE_BASE_URL;

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData((prev) => ({
            ...prev,
            [name]: value,
        }));

        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ""
            }));
        }
    };

    const validatePasswordForm = () => {
        const newErrors = {};

        if (!passwordData.currentPassword) {
            newErrors.currentPassword = "Current password is required";
        }

        if (!passwordData.newPassword) {
            newErrors.newPassword = "New password is required";
        } else if (passwordData.newPassword.length < 4) {
            newErrors.newPassword = "Password must be at least 4 characters";
        }

        if (!passwordData.confirmPassword) {
            newErrors.confirmPassword = "Please confirm your password";
        } else if (passwordData.newPassword !== passwordData.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (!validatePasswordForm()) return;

        setIsLoading(true);
        setErrors({});
        try {
            const res = await fetch(`${API_BASE_URL}/auth/change-password`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({
                    userId: user?.id,
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword,
                }),
            });

            const data = await res.json();
            if (res.ok && data.success) {
                toast.success(data.message || "Password changed successfully");

                setIsChangePasswordModalOpen(false);
                setPasswordData({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: ""
                });

                return;
            }

            const message = data.message || "Failed to change password";
            setErrors({ general: message });
            toast.error(message);

        } catch (error) {
            console.error("Fetch error:", error);
            setErrors({ general: "An error occurred. Please try again." });
            toast.error("An error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div className="min-h-screen bg-gradient-to-br from-[var(--primary-gray-bg)] to-[var(--secondary-gray-bg)] px-6 py-6 sm:px-16 sm:py-10 md:px-28 md:py-10">
            <div className="mb-8 flex items-center gap-3">
                <span className="text-2xl font-bold text-[var(--mafia-red)] tracking-tight">
                    Buy Box Mafia
                </span>
            </div>

            <div className="max-w-2xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">Scout Profile</h1>
                    <p className="text-[var(--secondary-gray-text)]">
                        Manage your account information and security settings
                    </p>
                </div>

                <div className="bg-[var(--tertiary-gray-bg)] rounded-lg p-6 shadow-lg">
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium mb-2 text-[var(--primary-gray-text)]">
                                Full Name
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User size={16} className="text-[var(--placeholder-gray)]" />
                                </div>
                                <input
                                    type="text"
                                    value={user?.name || ""}
                                    readOnly
                                    className="w-full pl-10 pr-4 py-3 bg-[var(--quaternary-gray-bg)] border-0 rounded-lg text-white cursor-not-allowed opacity-70"
                                />
                            </div>
                        </div>

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
                                    value={user?.email || ""}
                                    readOnly
                                    className="w-full pl-10 pr-4 py-3 bg-[var(--quaternary-gray-bg)] border-0 rounded-lg text-white cursor-not-allowed opacity-70"
                                />
                            </div>
                        </div>

                        {user?.phone && (
                            <div>
                                <label className="block text-sm font-medium mb-2 text-[var(--primary-gray-text)]">
                                    Phone Number
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Phone size={16} className="text-[var(--placeholder-gray)]" />
                                    </div>
                                    <input
                                        type="tel"
                                        value={user.phone}
                                        readOnly
                                        className="w-full pl-10 pr-4 py-3 bg-[var(--quaternary-gray-bg)] border-0 rounded-lg text-white cursor-not-allowed opacity-70"
                                    />
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium mb-2 text-[var(--primary-gray-text)]">
                                Role
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : ""}
                                    readOnly
                                    className="w-full px-4 py-3 bg-[var(--quaternary-gray-bg)] border-0 rounded-lg text-white cursor-not-allowed opacity-70"
                                />
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                onClick={() => setIsChangePasswordModalOpen(true)}
                                className="w-full py-3 px-4 rounded-lg bg-[var(--mafia-red)] text-white font-semibold shadow-lg hover:bg-[var(--mafia-red-hover)] transition-all duration-300"
                            >
                                Change Password
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Change Password Modal */}
            {isChangePasswordModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-[var(--tertiary-gray-bg)] rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-2xl font-bold text-white mb-6">Change Password</h2>

                        <form onSubmit={handlePasswordSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium mb-2 text-[var(--primary-gray-text)]">
                                    Current Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock size={16} className="text-[var(--placeholder-gray)]" />
                                    </div>
                                    <input
                                        type="password"
                                        name="currentPassword"
                                        value={passwordData.currentPassword}
                                        onChange={handlePasswordChange}
                                        className={`w-full pl-10 pr-4 py-3 bg-transparent border-0 border-b ${errors.currentPassword
                                            ? "border-b-red-500"
                                            : "border-b-[var(--tertiary-gray-bg)] hover:border-b-[var(--quaternary-gray-bg)]"
                                            } focus:ring-0 focus:border-b-red-500 text-white placeholder-[var(--placeholder-gray)] transition-all duration-200`}
                                        placeholder="Current password"
                                    />
                                </div>
                                {errors.currentPassword && (
                                    <p className="mt-1 text-sm text-red-500">{errors.currentPassword}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2 text-[var(--primary-gray-text)]">
                                    New Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock size={16} className="text-[var(--placeholder-gray)]" />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="newPassword"
                                        value={passwordData.newPassword}
                                        onChange={handlePasswordChange}
                                        className={`w-full pl-10 pr-10 py-3 bg-transparent border-0 border-b ${errors.newPassword
                                            ? "border-b-red-500"
                                            : "border-b-[var(--tertiary-gray-bg)] hover:border-b-[var(--quaternary-gray-bg)]"
                                            } focus:ring-0 focus:border-b-red-500 text-white placeholder-[var(--placeholder-gray)] transition-all duration-200`}
                                        placeholder="New password"
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
                                {errors.newPassword && (
                                    <p className="mt-1 text-sm text-red-500">{errors.newPassword}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2 text-[var(--primary-gray-text)]">
                                    Confirm Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock size={16} className="text-[var(--placeholder-gray)]" />
                                    </div>
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        name="confirmPassword"
                                        value={passwordData.confirmPassword}
                                        onChange={handlePasswordChange}
                                        className={`w-full pl-10 pr-10 py-3 bg-transparent border-0 border-b ${errors.confirmPassword
                                            ? "border-b-red-500"
                                            : "border-b-[var(--tertiary-gray-bg)] hover:border-b-[var(--quaternary-gray-bg)]"
                                            } focus:ring-0 focus:border-b-red-500 text-white placeholder-[var(--placeholder-gray)] transition-all duration-200`}
                                        placeholder="Confirm password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--placeholder-gray)] hover:text-white transition-colors"
                                        tabIndex={-1}
                                    >
                                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                {errors.confirmPassword && (
                                    <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
                                )}
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsChangePasswordModalOpen(false);
                                        setPasswordData({
                                            currentPassword: "",
                                            newPassword: "",
                                            confirmPassword: ""
                                        });
                                        setErrors({});
                                    }}
                                    className="flex-1 py-3 px-4 rounded-lg bg-[var(--quaternary-gray-bg)] text-white font-semibold hover:bg-gray-700 transition-all duration-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="flex-1 py-3 px-4 rounded-lg bg-[var(--mafia-red)] text-white font-semibold shadow-lg hover:bg-[var(--mafia-red-hover)] transition-all duration-300 disabled:opacity-70"
                                >
                                    {isLoading ? "Changing..." : "Change Password"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}