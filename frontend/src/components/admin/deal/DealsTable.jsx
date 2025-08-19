import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Search,
  ChevronDown,
  ChevronUp,
  Edit,
  Eye,
  Trash2,
  FileText,
  Clock,
  AlertCircle,
  CheckCircle,
  Download,
  RefreshCw,
  Users,
  X,
  Loader2,
  Phone,
  Mail,
  User,
} from "lucide-react";
import { pageVariants, pageTransition } from "../../../animations/animation";
import { getDeals, updateDeal } from "../../../services/dealsService";
import { Modal } from "antd"; // Import Ant Design Modal

const statusColors = {
  pending: "bg-amber-400/20 text-amber-400 border-amber-400/30",
  Approved: "bg-green-600/20 text-green-400 border-green-400/30",
  Rejected: "bg-red-600/20 text-red-400 border-red-400/30",
  "Under Review": "bg-blue-600/20 text-blue-400 border-blue-400/30",
};

const statusIcons = {
  pending: <Clock size={18} className="text-amber-400" />,
  Approved: <CheckCircle size={18} className="text-green-400" />,
  Rejected: <X size={18} className="text-red-400" />,
  "Under Review": <ChevronUp size={18} className="text-blue-400" />,
};

const ALL_STATUSES = [
  "pending",
  "Approved",
  "Rejected",
  "Closed",
  "Offer",
  "Draft",
];

export default function DealsTable() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [county, setCounty] = useState("");
  const [status, setStatus] = useState("");
  const [scout, setScout] = useState("");
  const [dealList, setDealList] = useState([]);
  const [statusEditId, setStatusEditId] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingDeals, setUpdatingDeals] = useState({});
  const [errorMessages, setErrorMessages] = useState({});
  const [isScoutModalVisible, setIsScoutModalVisible] = useState(false);
  const [selectedScout, setSelectedScout] = useState(null);


  // Unique filter options
  const statuses = Array.from(new Set(dealList.map((d) => d.status)));
  const scouts = Array.from(new Set(dealList.map((d) => d.scoutName)));

  // Filtering
  const filtered = dealList.filter(
    (d) =>
      (search === "" ||
        d.address?.toLowerCase().includes(search.toLowerCase()) ||
        d.scoutName?.toLowerCase().includes(search.toLowerCase())) &&
      (status === "" || d.status === status) &&
      (scout === "" || d.scoutName === scout)
  );

  // Summary counts
  const total = dealList.length;
  const pending = dealList.filter((d) => d.status === "pending").length;
  const approved = dealList.filter((d) => d.status === "Approved").length;
  const rejected = dealList.filter((d) => d.status === "Rejected").length;

  // Handlers
const handleApprove = async (id) => {
  try {
    setUpdatingDeals((prev) => ({ ...prev, [id]: true }));
    
    await updateDeal(id, { 
      status: "Approved"
      // Don't send discordWebhookUrl as a separate field
    });
    
    setDealList((list) =>
      list.map((d) => (d.id === id ? { ...d, status: "Approved" } : d))
    );
  } catch (error) {
    console.error("Error approving deal:", error);
    setErrorMessages((prev) => ({ ...prev, [id]: error.message }));
    setTimeout(() => {
      setErrorMessages((prev) => {
        const newErrors = { ...prev };
        delete newErrors[id];
        return newErrors;
      });
    }, 5000);
  } finally {
    setUpdatingDeals((prev) => ({ ...prev, [id]: false }));
  }
};

  const handleReject = async (id) => {
    try {
      setUpdatingDeals((prev) => ({ ...prev, [id]: true }));
      await updateDeal(id, { status: "Rejected" });
      setDealList((list) =>
        list.map((d) => (d.id === id ? { ...d, status: "Rejected" } : d))
      );
    } catch (error) {
      console.error("Error rejecting deal:", error);
      setErrorMessages((prev) => ({ ...prev, [id]: error.message }));
      setTimeout(() => {
        setErrorMessages((prev) => {
          const newErrors = { ...prev };
          delete newErrors[id];
          return newErrors;
        });
      }, 5000);
    } finally {
      setUpdatingDeals((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleStatusUpdateDropdown = async (id, status) => {
    try {
      setUpdatingDeals((prev) => ({ ...prev, [id]: true }));
      await updateDeal(id, { status });
      setDealList((list) =>
        list.map((d) => (d.id === id ? { ...d, status } : d))
      );
      setStatusEditId(null);
    } catch (error) {
      console.error("Error updating deal status:", error);
      setErrorMessages((prev) => ({ ...prev, [id]: error.message }));
      setTimeout(() => {
        setErrorMessages((prev) => {
          const newErrors = { ...prev };
          delete newErrors[id];
          return newErrors;
        });
      }, 5000);
    } finally {
      setUpdatingDeals((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleViewDeal = (id) => {
    navigate(`/admin/deals/${id}/view`);
  };
  const showScoutModal = (scoutData) => {
    setSelectedScout({
      name: scoutData.scoutName || scoutData.submittedByName || "Unknown",
      phone: scoutData.scoutPhone || "Not available",
      email: scoutData.scoutEmail || "Not available"
    });
    setIsScoutModalVisible(true);
  };

  const handleScoutModalCancel = () => {
    setIsScoutModalVisible(false);
    setSelectedScout(null);
  };

  useEffect(() => {
    // Fetch deals from service
    const fetchDeals = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const fetchedDeals = await getDeals();
        setDealList(fetchedDeals);
      } catch (error) {
        console.error("Error fetching deals:", error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDeals();
  }, []);

  // Add refs and click outside handler for dropdown:
  const editBtnRef = useRef(null);
  const dropdownRef = useRef(null);
  useEffect(() => {
    if (!statusEditId) return;
    function handleClickOutside(e) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        editBtnRef.current &&
        !editBtnRef.current.contains(e.target)
      ) {
        setStatusEditId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [statusEditId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-amber-400 mx-auto mb-4" />
          <p className="text-gray-400">Loading deals...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-4" />
          <p className="text-red-400 mb-4">Error loading deals: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-amber-400 text-gray-900 rounded-lg hover:bg-amber-500 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="in"
      exit="out"
      transition={pageTransition}
    >
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-800 rounded-xl shadow-lg p-4 flex flex-col items-start border border-gray-700">
          <span className="text-gray-400 text-sm mb-1">Total Deals</span>
          <span className="text-2xl font-bold text-white">{total}</span>
        </div>
        <div className="bg-gray-800 rounded-xl shadow-lg p-4 flex flex-col items-start border border-gray-700">
          <span className="text-gray-400 text-sm mb-1">Pending</span>
          <span className="text-2xl font-bold text-amber-400">{pending}</span>
        </div>
        <div className="bg-gray-800 rounded-xl shadow-lg p-4 flex flex-col items-start border border-gray-700">
          <span className="text-gray-400 text-sm mb-1">Approved</span>
          <span className="text-2xl font-bold text-green-400">{approved}</span>
        </div>
        <div className="bg-gray-800 rounded-xl shadow-lg p-4 flex flex-col items-start border border-gray-700">
          <span className="text-gray-400 text-sm mb-1">Rejected</span>
          <span className="text-2xl font-bold text-red-400">{rejected}</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8">
        <input
          type="text"
          placeholder="Search deals or scouts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-gray-800 text-white placeholder-gray-400"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="px-4 py-2 border border-gray-600 rounded-lg bg-gray-800 text-white"
        >
          <option value="">All Statuses</option>
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          value={scout}
          onChange={(e) => setScout(e.target.value)}
          className="px-4 py-2 border border-gray-600 rounded-lg bg-gray-800 text-white"
        >
          <option value="">All Scouts</option>
          {scouts.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* Deal Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-8 justify-center items-start max-w-5xl mx-auto">
        {filtered.map((deal) => (
          <div
            key={deal.id}
            className="bg-gray-800 rounded-xl shadow-lg p-6 flex flex-col justify-between border border-gray-700"
          >
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="mr-2 text-gray-400">
                  {deal.dealId || deal.id}
                </span>
                <h3 className="font-semibold text-white text-lg mb-1">
                  {deal.propertyAddress}
                </h3>
                <div className="flex items-center text-gray-400 text-sm mb-2"></div>
              </div>
              <span
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[deal.status] ||
                  "bg-gray-700 text-gray-300 border-gray-600"
                  }`}
              >
                {statusIcons[deal.status]}
                {deal.status}
              </span>
            </div>
            <div className="flex flex-col gap-1 mb-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Offer Price</span>
                <span className="font-semibold text-amber-400">
                  {deal.propertyPrice || "Not specified"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Earn Money</span>
                <span className="font-semibold text-green-400">
                  {deal.earnestMoney}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Potential Buyers</span>
                <span className="font-semibold text-green-400">
                  {deal.buyersCount || 0}
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center text-gray-400 mb-4">
              <span className="mr-2">
                👤 Scout: {deal.scoutName || deal.submittedByName || "Unknown"}
              </span>
              <span
                onClick={() => showScoutModal(deal)}
                className="cursor-pointer hover:text-[var(--mafia-red)] transition-colors"
              >
                <Eye size={16} />
              </span>
            </div>
            {/* Status dropdown */}
            <div className="mb-3">
              <label
                htmlFor={`status-select-${deal.id}`}
                className="block text-xs font-medium text-gray-400 mb-1"
              >
                Change Status
              </label>
              <select
                id={`status-select-${deal.id}`}
                value={deal.status}
                onChange={(e) =>
                  handleStatusUpdateDropdown(deal.id, e.target.value)
                }
                className="w-full px-3 py-2 rounded-lg border border-gray-600 text-sm focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-gray-700 text-white"
                disabled={updatingDeals[deal.id]}
              >
                {ALL_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            {/* Error message */}
            {errorMessages[deal.id] && (
              <div className="text-red-400 text-xs mb-2">
                {errorMessages[deal.id]}
              </div>
            )}
            {/* Actions */}

            <div className="flex justify-between items-center gap-2 mt-auto pt-2">
              <button
                onClick={() => handleViewDeal(deal.id)}
                title="View Deal"
                className="p-2 rounded-full hover:bg-gray-700 text-amber-400 transition-colors"
              >
                <Eye size={20} />
              </button>
              <Link
                to={`/admin/deals/${deal.id}`}
                title="Matches"
                className="p-2 rounded-full hover:bg-gray-700 text-green-400 transition-colors"
              >
                <Users size={20} />
              </Link>

              {deal.status !== "Approved" && deal.status !== "Rejected" && (
                <>
                  <button
                    onClick={() => handleApprove(deal.id)}
                    title="Approve"
                    className="p-2 rounded-full hover:bg-green-600/20 text-green-400 transition-colors"
                    disabled={updatingDeals[deal.id]}
                  >
                    {updatingDeals[deal.id] ? (
                      <Loader2 size={20} className="animate-spin" />
                    ) : (
                      <CheckCircle size={20} />
                    )}
                  </button>

                  <button
                    onClick={() => handleReject(deal.id)}
                    title="Reject"
                    className="p-2 rounded-full hover:bg-red-600/20 text-red-400 transition-colors"
                    disabled={updatingDeals[deal.id]}
                  >
                    {updatingDeals[deal.id] ? (
                      <Loader2 size={20} className="animate-spin" />
                    ) : (
                      <X size={20} />
                    )}
                  </button>
                </>
              )}
            </div>

          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-center text-gray-400 py-12">
            No deals found.
          </div>
        )}
      </div>
      <Modal
        title="Scout Details"
        open={isScoutModalVisible}
        onCancel={handleScoutModalCancel}
        footer={null}
        centered
        className="scout-details-modal"
        styles={{
          content: {
            backgroundColor: 'var(--from-bg)',
            color: 'white',
            padding: 0,
          },
          header: {
            backgroundColor: 'var(--from-bg)',
            color: 'white',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          },
          body: {
            padding: '24px',
          }
        }}
      >
        {selectedScout && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <User className="text-blue-400" size={20} />
              <div>
                <p className="text-sm text-gray-300">Name</p>
                <p className="font-medium text-white">{selectedScout.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Phone className="text-green-400" size={20} />
              <div>
                <p className="text-sm text-gray-300">Phone</p>
                <p className="font-medium text-white">{selectedScout.phone}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Mail className="text-amber-400" size={20} />
              <div>
                <p className="text-sm text-gray-300">Email</p>
                <p className="font-medium text-white">{selectedScout.email}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  );
}