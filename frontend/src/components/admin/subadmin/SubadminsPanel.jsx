import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Mail, Phone, Calendar, Shield, Edit, Trash2, UserCheck, UserX, RefreshCw, Users, Filter } from "lucide-react"
import { buttonHover, staggerContainer, staggerItem } from "../../../animations/animation"
import { useNavigate } from "react-router-dom"
import { subadminService } from "../../../services/subadminService"

function getInitials(name) {
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

export default function SubadminsPanel() {
    const [users, setUsers] = useState([]);
    const [subadmins, setSubadmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    function formatDate(date) {
        if (!date) return 'Unknown';

        // If it's already a formatted string like "Jul 19, 2025", return it as is
        if (typeof date === 'string' && /^[A-Za-z]{3}\s\d{1,2},\s\d{4}$/.test(date)) {
            return date;
        }

        let dateToFormat = date;

        // If Firestore Timestamp (has toDate method)
        if (date && typeof date.toDate === 'function') {
            dateToFormat = date.toDate();
        }
        // If it's a Firestore Timestamp object with _seconds and _nanoseconds
        else if (date && typeof date === 'object' && date._seconds !== undefined) {
            dateToFormat = new Date(date._seconds * 1000);
        }
        // If it's already a Date object
        else if (date instanceof Date) {
            dateToFormat = date;
        }
        // If it's a timestamp number
        else if (typeof date === 'number') {
            dateToFormat = new Date(date);
        }
        // If it's a string, try to parse it
        else if (typeof date === 'string') {
            dateToFormat = new Date(date);
        }

        const d = new Date(dateToFormat);
        if (isNaN(d.getTime())) {
            console.log('Invalid date value:', date, 'type:', typeof date);
            return 'Invalid Date';
        }

        return d.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    }

    const fetchSubadmins = async () => {
        try {
            setLoading(true);
            setError("");
            const response = await subadminService.getAllSubadmins();
            if (response.success) {
                console.log('Users data:', response.data);
                setUsers(response.data);
                // Filter to only show subadmins
                const subadminUsers = response.data.filter(user => user.role === 'subadmin');
                setSubadmins(subadminUsers);
            } else {
                setError(response.message || "Failed to fetch subadmins");
            }
        } catch (error) {
            console.error("Error fetching subadmins:", error);
            setError(error.message || "Failed to fetch subadmins");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubadmins();
    }, []);

    const handleDelete = async (id, name) => {
        if (window.confirm(`Are you sure you want to delete ${name}?`)) {
            try {
                const response = await subadminService.deleteSubadmin(id);
                if (response.success) {
                    fetchSubadmins();
                } else {
                    alert(response.message || "Failed to delete subadmin");
                }
            } catch (error) {
                console.error("Error deleting subadmin:", error);
                alert(error.message || "Failed to delete subadmin");
            }
        }
    };

    const handleResetPassword = async (id, name) => {
        if (window.confirm(`Reset password for ${name}? A new password will be sent to their email.`)) {
            try {
                const response = await subadminService.resetPassword(id);
                if (response.success) {
                    alert("Password reset successfully! Check their email for new credentials.");
                } else {
                    alert(response.message || "Failed to reset password");
                }
            } catch (error) {
                console.error("Error resetting password:", error);
                alert(error.message || "Failed to reset password");
            }
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="w-8 h-8 border-4 border-[var(--mafia-red)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading subadmins...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mb-6">
                <div className="flex items-center gap-4">
                    <h2 className="text-2xl font-bold text-white">Subadmin Management</h2>
                    {error && (
                        <div className="text-red-400 text-sm bg-red-500/10 px-3 py-1 rounded-lg border border-red-500/20">
                            {error}
                        </div>
                    )}
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={fetchSubadmins}
                        disabled={loading}
                        className="px-4 py-2 bg-gray-700 text-white rounded-lg font-semibold shadow hover:bg-gray-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                        <span>Refresh</span>
                    </button>
                    <button
                        onClick={() => navigate('/admin/subadmin/new_subadmin')}
                        className="px-4 py-2 bg-[var(--mafia-red)] text-white rounded-lg font-semibold shadow hover:bg-[var(--mafia-red-hover)] transition-colors flex items-center justify-center gap-2"
                    >
                        <span>+</span>
                        <span>Add Subadmin</span>
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm">Total Subadmins</p>
                            <p className="text-2xl font-bold text-blue-400">{subadmins.length}</p>
                        </div>
                        <Shield className="text-blue-400" size={24} />
                    </div>
                </div>
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm">Active Subadmins</p>
                            <p className="text-2xl font-bold text-green-400">{subadmins.filter(u => u.status === 'active' || !u.status).length}</p>
                        </div>
                        <UserCheck className="text-green-400" size={24} />
                    </div>
                </div>
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm">Inactive Subadmins</p>
                            <p className="text-2xl font-bold text-red-400">{subadmins.filter(u => u.status === 'inactive').length}</p>
                        </div>
                        <UserX className="text-red-400" size={24} />
                    </div>
                </div>
            </div>

            {subadmins.length === 0 ? (
                <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                        <UserX size={48} className="mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-white mb-2">No Subadmins Found</h3>
                        <p className="text-gray-400">Get started by adding your first subadmin.</p>
                    </div>
                    <button
                        onClick={() => navigate('/admin/subadmin/new_subadmin')}
                        className="px-6 py-3 bg-[var(--mafia-red)] text-white rounded-lg font-semibold hover:bg-[var(--mafia-red-hover)] transition-colors"
                    >
                        Add Your First Subadmin
                    </button>
                </div>
            ) : (
                <motion.div
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                    className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6"
                >
                    {subadmins.map((subadmin) => (
                        <motion.div
                            key={subadmin.id}
                            variants={staggerItem}
                            className="bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-700 hover:shadow-2xl transition-all duration-200 flex flex-col gap-6 relative group"
                        >
                            {/* Avatar and Name */}
                            <div className="flex items-center gap-4 mb-2">
                                <div className="w-12 h-12 rounded-full bg-gray-700 text-white flex items-center justify-center font-bold text-lg shadow-inner border border-gray-600">
                                    {getInitials(subadmin.name)}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-white text-lg leading-tight">{subadmin.name}</h3>
                                    <p className="text-xs text-gray-400 mt-0.5">{subadmin.location}</p>
                                </div>
                            </div>
                            
                            {/* Role Badge */}
                            <div className="flex items-center gap-2">
                                <Shield size={16} className="text-blue-400" />
                                <span className="text-sm font-semibold text-blue-400">
                                    Subadmin
                                </span>
                            </div>

                            {/* Divider */}
                            <div className="border-t border-gray-700 my-2" />
                            
                            {/* Contact Info */}
                            <div className="flex flex-col gap-2 mb-2">
                                <div className="flex items-center gap-2 text-sm text-gray-300">
                                    <Mail size={16} className="text-amber-400" />
                                    <span>{subadmin.email}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-300">
                                    <Phone size={16} className="text-green-400" />
                                    <span>{subadmin.phone}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-300">
                                    <Calendar size={16} className="text-gray-400" />
                                    <span>Joined: {formatDate(subadmin.createdAt)}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-300">
                                    <UserCheck size={16} className="text-blue-400" />
                                    <span>Status: {subadmin.status || 'Active'}</span>
                                </div>
                            </div>
                            
                            {/* Actions */}
                            <div className="flex gap-2 pt-2 border-t border-gray-700 mt-2">
                                <motion.button
                                    variants={buttonHover}
                                    whileHover="whileHover"
                                    whileTap="whileTap"
                                    onClick={() => handleResetPassword(subadmin.uid, subadmin.name)}
                                    className="flex-1 px-3 py-2 border border-blue-400 text-blue-400 text-sm rounded-lg hover:bg-blue-600/10 transition-colors flex items-center justify-center gap-1 font-semibold"
                                    title="Reset Password"
                                >
                                    <Shield size={16} />
                                    <span className="hidden sm:inline">Reset</span>
                                </motion.button>
                                <motion.button
                                    variants={buttonHover}
                                    whileHover="whileHover"
                                    whileTap="whileTap"
                                    onClick={() => handleDelete(subadmin.uid, subadmin.name)}
                                    className="flex-1 px-3 py-2 border border-red-400 text-red-400 text-sm rounded-lg hover:bg-red-600/10 transition-colors flex items-center justify-center gap-1 font-semibold"
                                    title="Delete Subadmin"
                                >
                                    <Trash2 size={16} />
                                    <span className="hidden sm:inline">Delete</span>
                                </motion.button>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            )}
        </>
    )
} 