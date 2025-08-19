import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Mail, Phone, Calendar, Shield, Edit, Trash2, UserCheck, UserX, RefreshCw, Users, Filter } from "lucide-react"
import { buttonHover, staggerContainer, staggerItem } from "../../../animations/animation"
import { useNavigate } from "react-router-dom"
import { subadminService } from "../../../services/subadminService"
import toast from "react-hot-toast"
import { Modal } from "antd";

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
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedSubadmin, setSelectedSubadmin] = useState(null);
    const [buyersCountMap, setBuyersCountMap] = useState({}); // Added state for buyers count map
    const API_BASE_URL = import.meta.env.VITE_BASE_URL;

    function formatDate(date) {
        if (!date) return 'Unknown';

        if (typeof date === 'string' && /^[A-Za-z]{3}\s\d{1,2},\s\d{4}$/.test(date)) {
            return date;
        }

        let dateToFormat = date;

        if (date && typeof date.toDate === 'function') {
            dateToFormat = date.toDate();
        }
        else if (date && typeof date === 'object' && date._seconds !== undefined) {
            dateToFormat = new Date(date._seconds * 1000);
        }
        else if (date instanceof Date) {
            dateToFormat = date;
        }
        else if (typeof date === 'number') {
            dateToFormat = new Date(date);
        }
        else if (typeof date === 'string') {
            dateToFormat = new Date(date);
        }

        const d = new Date(dateToFormat);
        if (isNaN(d.getTime())) {
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

            // 1. Fetch all subadmins
            const response = await subadminService.getAllSubadmins();

            if (response.success) {
                const allUsers = response.data;
                const subadminUsers = allUsers.filter(user => user.role === "subadmin");

                // 2. Fetch buyers count per subadmin
                const res = await fetch(`${API_BASE_URL}/buyers/total-buyers-by-subadmin`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });

                const buyersData = await res.json();

                // Create map: { subadminId: count }
                const newBuyersCountMap = {};
                buyersData.forEach(buyer => {
                    newBuyersCountMap[buyer.submittedBy] = buyer.count;
                });

                setBuyersCountMap(newBuyersCountMap); // Store the map in state

                // 3. Merge buyersCount into subadmins
                const subadminsWithBuyers = subadminUsers.map(sub => ({
                    ...sub,
                    buyersCount: newBuyersCountMap[sub.uid] || 0, // Use uid to match with submittedBy
                }));

                // 4. Update state
                setUsers(allUsers);
                setSubadmins(subadminsWithBuyers);
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

    const showDeleteModal = (subadmin) => {
        setSelectedSubadmin(subadmin);
        setIsModalVisible(true);
    };

    const handleModalOk = async () => {
        if (selectedSubadmin) {
            try {
                const response = await subadminService.deleteSubadmin(selectedSubadmin.uid);
                if (response.success) {
                    fetchSubadmins();
                    toast.success("Subadmin deleted successfully");
                } else {
                    toast.error(response.message || "Failed to delete subadmin");
                }
            } catch (error) {
                toast.error(error.message || "Failed to delete subadmin");
            }
        }
        setIsModalVisible(false);
        setSelectedSubadmin(null);
    };

    const handleModalCancel = () => {
        setIsModalVisible(false);
        setSelectedSubadmin(null);
    };

    const handleDelete = (uid, name) => {
        const subadmin = subadmins.find(sa => sa.uid === uid);
        showDeleteModal(subadmin);
    };

    const handleEdit = (subadmin) => {
        navigate(`/admin/subadmin/edit/${subadmin.uid}`, {
            state: { subadminData: subadmin }
        });
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
                                <div className="flex items-center gap-2 text-sm text-gray-300">
                                    <Users size={16} className="text-purple-400" />
                                    <span>Total Buyers: {subadmin.buyersCount ?? 0}</span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2 pt-2 border-t border-gray-700 mt-2">
                                <motion.button
                                    variants={buttonHover}
                                    whileHover="whileHover"
                                    whileTap="whileTap"
                                    onClick={() => handleEdit(subadmin)}
                                    className="flex-1 px-3 py-2 border border-blue-400 text-blue-400 text-sm rounded-lg hover:bg-blue-600/10 transition-colors flex items-center justify-center gap-1 font-semibold"
                                    title="Edit Subadmin"
                                >
                                    <Edit size={16} />
                                    <span className="hidden sm:inline">Edit</span>
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
            {/* Modal for delete confirmation */}
            <Modal
                title="Confirm Delete"
                open={isModalVisible}
                onOk={handleModalOk}
                onCancel={handleModalCancel}
                okText="Delete"
                okButtonProps={{ danger: true }}
                cancelText="Cancel"
            >
                <p>Are you sure you want to delete <b>{selectedSubadmin?.name}</b>?</p>
            </Modal>
        </>
    )
} 