import { motion } from "framer-motion";
import {
  Edit,
  Trash2,
  Upload,
  ChevronDown,
  ChevronUp,
  Plus,
  Search,
  Eye
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { buttonHover, fadeInUp, scaleIn } from "../../../animations/animation";
import Papa from "papaparse";
import { toast } from 'react-hot-toast';
import { useAuth } from "../../../store/AuthContext";

function getInitials(name) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
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
    return 'Invalid Date';
  }

  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function BuyersPanel() {
  const [buyers, setBuyers] = useState([]);
  const [noBuyers, setNoBuyers] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "name", direction: "asc" });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [loading, setLoading] = useState(true);
  const [importError, setImportError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedBuyer, setSelectedBuyer] = useState(null);
  const { user } = useAuth();
  const [submittedByFilter, setSubmittedByFilter] = useState("");
  const submittedByOptions = Array.from(new Set(buyers.map(b => b.submittedByName || "N/A")));


  const userRole = user?.role || 'guest';

  const fetchBuyers = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:3001/api/buyers");

      if (!response.ok) {
        if (response.status === 404) {
          setNoBuyers(true); // Set no buyers state
        } else {
          throw new Error("Server error");
        }
        return;
      }

      const data = await response.json();

      if (data.length === 0) {
        setNoBuyers(true); // Set no buyers state
      } else {
        setBuyers(data);
        setNoBuyers(false); // Reset state if we have buyers
      }

      if (userRole === 'subadmin') {
        setBuyers(data.filter(buyer => buyer.submittedBy === user.id));
      }
    } catch (error) {
      console.error("Error fetching buyers:", error);
      toast.error("Failed to load buyers");
      setNoBuyers(true); // Set no buyers state on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedBuyers = [...buyers].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const filteredBuyers = sortedBuyers.filter(buyer => {
    const matchesSearch =
      buyer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      buyer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      buyer.phone.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSubmittedBy =
      submittedByFilter === "" || buyer.submittedByName === submittedByFilter;

    return matchesSearch && matchesSubmittedBy;
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchBuyers();
  }, []);

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:3001/api/buyers/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        toast.success("Buyer deleted successfully");
        fetchBuyers();
      } else {
        toast.error("Failed to delete buyer");
      }
    } catch (error) {
      console.error("Error deleting buyer:", error);
      toast.error("Failed to delete buyer");
    }
  };

  const handleEdit = (buyer) => {
    if (userRole === 'subadmin') {
      navigate(`/subadmin/buyer/edit/${buyer.id}`, { state: { buyerData: buyer } });
    } else if (userRole === 'admin') {
      navigate(`/admin/buyer/edit/${buyer.id}`, { state: { buyerData: buyer } });
    } else {
      navigate(`/buyer/edit/${buyer.id}`, { state: { buyerData: buyer } });
    }
  };
  const handleView = (buyer) => {
    setSelectedBuyer(buyer);
    setModalOpen(true);
  }

  // CSV Import logic
  const fileInputRef = useRef();
  const [importing, setImporting] = useState(false);

  const handleImportClick = () => {
    if (fileInputRef.current) fileInputRef.current.value = null;
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImporting(true);
    setImportError("");
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        let buyers = results.data;
        const submittedBy = user?.id || 'Unknown';
        buyers = buyers.map(b => ({ ...b, submittedBy }));
        try {
          const response = await fetch("http://localhost:3001/api/buyers/import", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ buyers }),
          });
          const data = await response.json();
          if (data.success) {
            toast.success(`${buyers.length} buyers imported successfully!`);
            fetchBuyers();
          } else {
            setImportError(data.message || "Failed to import buyers");
            toast.error(data.message || "Failed to import buyers");
          }
        } catch (err) {
          setImportError("Error importing buyers");
          toast.error("Error importing buyers");
        }
        setImporting(false);
      },
      error: () => {
        setImportError("Failed to parse CSV file");
        toast.error("Failed to parse CSV file");
        setImporting(false);
      }
    });
  };
if (noBuyers) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center min-h-[400px] bg-gray-900 rounded-xl p-6 text-center"
      variants={fadeInUp}
      initial="initial"
      animate="animate"
    >
      <div className="bg-gray-800 p-8 rounded-xl border border-gray-700 max-w-md">
        <div className="text-2xl font-bold text-white mb-2">
          {userRole === 'admin' ? 'No Buyers Added Yet' : 'No Buyers Found'}
        </div>
        <p className="text-gray-400 mb-6">
          {userRole === 'admin' 
            ? "Subadmins haven't added any buyers yet."
            : searchTerm
              ? "No buyers match your search criteria."
              : "You haven't added any buyers yet."}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {searchTerm ? (
            <button
              onClick={() => setSearchTerm("")}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Clear Search
            </button>
          ) : null}

          {/* Only show "Add New Buyer" button for subadmin */}
          {userRole === 'subadmin' && (
            <button
              onClick={() => navigate('/subadmin/buyer/new_buyer')}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Plus size={18} />
              Add New Buyer
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

  if (loading) {
    return (
      <motion.div className="flex items-center justify-center min-h-[300px]" variants={fadeInUp} initial="initial" animate="animate">
        <svg className="animate-spin h-8 w-8 text-amber-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </motion.div>
    );
  }

  return (
    <motion.div className="bg-gray-900 rounded-xl p-4 md:p-6" variants={scaleIn} initial="initial" animate="animate">
      {/* Modal for Buyer Details */}
      {modalOpen && selectedBuyer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-gray-800 rounded-xl shadow-xl p-4 sm:p-8 w-full max-w-md sm:max-w-2xl relative animate-fadeIn border border-amber-400">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-amber-400 text-xl font-bold focus:outline-none"
              onClick={() => setModalOpen(false)}
              aria-label="Close"
            >
              ×
            </button>
            <div className="flex flex-col items-center mb-4 sm:mb-8">
              <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-gray-700 flex items-center justify-center text-2xl sm:text-3xl font-bold text-amber-400 mb-2 sm:mb-3 shadow-lg">
                {getInitials(selectedBuyer.name)}
              </div>
              <div className="text-lg sm:text-2xl font-semibold text-white mb-0.5 sm:mb-1 text-center truncate w-full" title={selectedBuyer.name}>{selectedBuyer.name}</div>
              <div className="text-xs sm:text-base text-gray-400 text-center truncate w-full" title={selectedBuyer.location}>{selectedBuyer.location}</div>
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-2 sm:grid-cols-2 sm:gap-x-12 sm:gap-y-4 text-gray-300 text-xs sm:text-sm">
              <div><span className="font-medium text-gray-400">Email:</span> <span className="ml-1 break-all">{selectedBuyer.email}</span></div>
              <div><span className="font-medium text-gray-400">Phone:</span> <span className="ml-1">{selectedBuyer.phone}</span></div>
              <div><span className="font-medium text-gray-400">Submitted By:</span> <span className="ml-1">{selectedBuyer.submittedByName || 'N/A'}</span></div>
              <div><span className="font-medium text-gray-400">Joined:</span> <span className="ml-1">{selectedBuyer.createdAt ? formatDate(selectedBuyer.createdAt) : 'N/A'}</span></div>
              <div><span className="font-medium text-gray-400">Access:</span> <span className="ml-1">{selectedBuyer.accessRequired || 'N/A'}</span></div>
              <div><span className="font-medium text-gray-400">Budget Min:</span> <span className="ml-1">{selectedBuyer.budgetMin || 'N/A'}</span></div>
              <div><span className="font-medium text-gray-400">Budget Max:</span> <span className="ml-1">{selectedBuyer.budgetMax || 'N/A'}</span></div>
              <div><span className="font-medium text-gray-400">Market:</span> <span className="ml-1">{selectedBuyer.buyOnMarket || 'N/A'}</span></div>
              <div className="col-span-2"><span className="font-medium text-gray-400">Buying Locations:</span> <span className="ml-1">{selectedBuyer.buyingLocations || 'N/A'}</span></div>
              <div><span className="font-medium text-gray-400">City:</span> <span className="ml-1">{selectedBuyer.city || 'N/A'}</span></div>
              <div><span className="font-medium text-gray-400">Country:</span> <span className="ml-1">{selectedBuyer.country || 'N/A'}</span></div>
              <div><span className="font-medium text-gray-400">Lot Min:</span> <span className="ml-1">{selectedBuyer.lotSizeMin || 'N/A'}</span></div>
              <div><span className="font-medium text-gray-400">Lot Max:</span> <span className="ml-1">{selectedBuyer.lotSizeMax || 'N/A'}</span></div>
              <div><span className="font-medium text-gray-400">Cleared:</span> <span className="ml-1">{selectedBuyer.mustBeCleared || 'N/A'}</span></div>
              <div><span className="font-medium text-gray-400">Price Per:</span> <span className="ml-1">{selectedBuyer.pricePer || 'N/A'}</span></div>
              <div><span className="font-medium text-gray-400">Timeline:</span> <span className="ml-1">{selectedBuyer.timeline || 'N/A'}</span></div>
              <div><span className="font-medium text-gray-400">Utilities:</span> <span className="ml-1">{selectedBuyer.utilities || 'N/A'}</span></div>
              <div className="col-span-2"><span className="font-medium text-gray-400">Zoning Types:</span> <span className="ml-1">{selectedBuyer.zoningTypes || 'N/A'}</span></div>
            </div>
          </div>
        </div>
      )}
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-2 items-start sm:items-center">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search buyers..."
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Submitted By Filter */}
        {userRole === 'admin' && (
          <select
            value={submittedByFilter}
            onChange={(e) => setSubmittedByFilter(e.target.value)}
            className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          >
            <option value="">All Submitters</option>
            {submittedByOptions.map((name, i) => (
              <option key={i} value={name}>
                {name}
              </option>
            ))}
          </select>
        )}
        {userRole === 'subadmin' && (
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/subadmin/buyer/new_buyer')}
              className="px-4 py-2 bg-[var(--mafia-red)] text-white rounded-lg font-semibold shadow hover:bg-[var(--mafia-red-hover)] transition-colors flex items-center justify-center gap-2"
            >
              <span>+</span>
              <span className="hidden md:inline">Add Buyer</span>
            </button>
            <button
              onClick={handleImportClick}
              disabled={importing}
              className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold shadow hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <Upload size={16} />
              <span className="hidden md:inline">{importing ? "Importing..." : "Import"}</span>
            </button>
            <input
              type="file"
              accept=".csv"
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
          </div>
        )}
      </div>



      {
        importError && (
          <div className="text-center text-red-400 font-medium mb-4">{importError}</div>
        )
      }

      {/* Table for md+ */}
      <div className="overflow-x-auto rounded-lg  border border-gray-700 hidden md:block" >
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-800">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('name')}>
                <div className="flex items-center gap-1">
                  Buyer
                  {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                </div>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Contact</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Submitted By</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Joined</th>

              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>

            </tr>
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-700">
            {filteredBuyers.map((buyer) => (
              <tr key={buyer.id} className="hover:bg-gray-750 transition-colors cursor-pointer">
                <td className="px-2 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center text-lg font-bold text-amber-400">
                      {getInitials(buyer.name)}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-white">{buyer.name}</div>
                      <div className="text-sm text-gray-400">{buyer.location}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-300">{buyer.email}</div>
                  <div className="text-sm text-gray-400">{buyer.phone}</div>

                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-300">{buyer.submittedByName || 'N/A'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-300">{buyer.createdAt ? formatDate(buyer.createdAt) : 'N/A'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end gap-2">
                    {userRole === 'subadmin' && (
                      <>
                        <motion.button
                          variants={buttonHover}
                          whileHover="whileHover"
                          whileTap="whileTap"
                          className="p-2 text-amber-400 hover:bg-amber-400/10 rounded-lg transition-colors"
                          title="Edit Buyer"
                          onClick={() => handleEdit(buyer)}
                        >
                          <Edit size={18} />
                        </motion.button>

                        <motion.button
                          variants={buttonHover}
                          whileHover="whileHover"
                          whileTap="whileTap"
                          className="p-2 text-red-400 hover:bg-red-600/10 rounded-lg transition-colors"
                          title="Delete Buyer"
                          onClick={() => handleDelete(buyer.id)}
                        >
                          <Trash2 size={18} />
                        </motion.button>
                      </>
                    )}
                    <motion.button
                      variants={buttonHover}
                      whileHover="whileHover"
                      whileTap="whileTap"
                      className="p-2 text-amber-400 hover:bg-amber-400/10 rounded-lg transition-colors"
                      title="View Buyer"
                      onClick={() => handleView(buyer)}
                    >
                      <Eye size={18} />
                    </motion.button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Mobile Card List */}
      <div className="block md:hidden space-y-4">
        {filteredBuyers.map((buyer) => (
          <div key={buyer.id} className="bg-gray-800 rounded-2xl p-4 shadow-lg border border-gray-700 flex flex-col gap-2">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-lg font-bold text-amber-400 shadow-inner">
                {getInitials(buyer.name)}
              </div>
              <div>
                <div className="font-semibold text-white leading-tight text-base">{buyer.name}</div>
                <div className="text-xs text-gray-400">{buyer.location}</div>
              </div>
            </div>
            <div className="flex flex-col gap-1 text-xs text-gray-300">
              <div><span className="font-medium text-gray-400">Email:</span> {buyer.email}</div>
              <div><span className="font-medium text-gray-400">Phone:</span> {buyer.phone}</div>
              <div><span className="font-medium text-gray-400">Submitted By:</span> {buyer.submittedByName || 'N/A'}</div>
              <div><span className="font-medium text-gray-400">Joined:</span> {buyer.createdAt ? formatDate(buyer.createdAt) : 'N/A'}</div>
            </div>


            <div className="flex gap-2 pt-2 border-t border-gray-700 mt-2">
              {userRole === 'subadmin' && (
                <>
                  <motion.button variants={buttonHover} whileHover="whileHover" whileTap="whileTap" className="flex-1 px-3 py-2 border border-amber-400 text-amber-400 text-xs rounded-lg hover:bg-amber-400/10 transition-colors flex items-center justify-center gap-1 font-semibold" title="Edit Buyer" onClick={() => handleEdit(buyer)}>
                    <Edit size={15} />
                    Edit
                  </motion.button>

                  <motion.button variants={buttonHover} whileHover="whileHover" whileTap="whileTap" className="flex-1 px-3 py-2 border border-red-400 text-red-400 text-xs rounded-lg hover:bg-red-600/10 transition-colors flex items-center justify-center gap-1 font-semibold" title="Delete Buyer" onClick={() => handleDelete(buyer.id)}>
                    <Trash2 size={15} />
                    Delete
                  </motion.button>
                </>
              )}
              <motion.button variants={buttonHover} whileHover="whileHover" whileTap="whileTap" className="flex-1 px-3 py-2 border  border-amber-400 text-amber-400 text-xs rounded-lg hover:bg-amber-400/10 transition-colors flex items-center justify-center gap-1 font-semibold" title="View Buyer" onClick={() => handleView(buyer)}>
                <Eye size={15} />
                View
              </motion.button>
            </div>
          </div>
        ))}
      </div>
      {/* Empty State */}
      {
        filteredBuyers.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-2">No buyers found</div>
            {searchTerm && (
              <button onClick={() => setSearchTerm("")} className="text-amber-400 hover:underline">Clear search</button>
            )}
          </div>
        )
      }
    </motion.div >
  );
}