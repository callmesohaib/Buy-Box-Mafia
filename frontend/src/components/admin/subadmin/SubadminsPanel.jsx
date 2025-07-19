import { motion } from "framer-motion"
import { Mail, Phone, Calendar, Shield, Edit, Trash2, UserCheck, UserX } from "lucide-react"
import { buttonHover, staggerContainer, staggerItem } from "../../../animations/animation"
import { useNavigate } from "react-router-dom"
import subadminsData from '../../../data/subadmins.json';

function getInitials(name) {
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

export default function SubadminsPanel() {
    const subadmins = subadminsData;
    const navigate = useNavigate();
    return (
        <>
            <div className="flex flex-col sm:flex-row justify-end gap-3 mb-4">
                <button
                    onClick={() => navigate('/admin/subadmin/new_subadmin')}
                    className="px-4 py-2 bg-[var(--mafia-red)] text-white rounded-lg font-semibold shadow hover:bg-[var(--mafia-red-hover)] transition-colors flex items-center justify-center gap-2"
                >
                    <span>+</span>
                    <span>Add Subadmin</span>
                </button>
            </div>
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
                            <img src={`https://i.pravatar.cc/150?u=${subadmin.email}`} alt={subadmin.name} className="w-12 h-12 rounded-full object-cover shadow-inner border border-gray-700" />
                            <div className="flex-1">
                                <h3 className="font-semibold text-white text-lg leading-tight">{subadmin.name}</h3>
                                <p className="text-xs text-gray-400 mt-0.5">{subadmin.location}</p>
                            </div>
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
                                <span>Joined: {new Date(subadmin.joinDate).toLocaleDateString()}</span>
                            </div>
                        </div>
                        {/* Actions */}
                        <div className="flex gap-6 pt-2 border-t border-gray-700 mt-2">
                            <motion.button
                                variants={buttonHover}
                                whileHover="whileHover"
                                whileTap="whileTap"
                                className="flex-1 px-3 py-2 border border-green-400 text-green-400 text-sm rounded-lg hover:bg-green-600/10 transition-colors flex items-center justify-center gap-1 font-semibold"
                                title="Edit Subadmin"
                            >
                                <Edit size={16} />
                                <span className="hidden sm:inline">Edit</span>
                            </motion.button>
                            <motion.button
                                variants={buttonHover}
                                whileHover="whileHover"
                                whileTap="whileTap"
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
        </>
    )
} 