import { motion } from "framer-motion";
import {
  Edit,
  Trash2,
  Upload,
  ChevronDown,
  ChevronUp,
  Search
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import buyersData from '../../../data/buyers.json';
import { buttonHover } from "../../../animations/animation";

function getInitials(name) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function BuyersPanel() {
  const [buyers, setBuyers] = useState(buyersData);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "name", direction: "asc" });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [expandedRow, setExpandedRow] = useState(null);

  const userRole = localStorage.getItem('role');

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

  const filteredBuyers = sortedBuyers.filter(buyer =>
    buyer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    buyer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    buyer.phone.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const navigate = useNavigate();

  const toggleRowExpand = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  return (
    <div className="bg-gray-900 rounded-xl p-4 md:p-6">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
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

        {userRole === 'subadmin' && (
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/subadmin/buyer/new_buyer')}
              className="px-4 py-2 bg-[var(--mafia-red)] text-white rounded-lg font-semibold shadow hover:bg-[var(--mafia-red-hover)] transition-colors flex items-center justify-center gap-2"
            >
              <span>+</span>
              <span>Add Buyer</span>
            </button>
            <button
              onClick={() => {/* TODO: Implement import functionality */ }}
              className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold shadow hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
            >
              <Upload size={16} />
              <span className="hidden md:inline">Import</span>
            </button>
          </div>
        )}
      </div>

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
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('totalDeals')}>
                <div className="flex items-center gap-1">
                  Deals
                  {sortConfig.key === 'totalDeals' && (sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                </div>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('totalValue')}>
                <div className="flex items-center gap-1">
                  Value
                  {sortConfig.key === 'totalValue' && (sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                </div>
              </th>
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
                  <div className="text-sm text-gray-300">{buyer.submittedBy}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex gap-4">
                    <div className="text-center">
                      <span className="block text-lg font-bold text-amber-400">{buyer.totalDeals}</span>
                      <span className="text-xs text-gray-400">Total</span>
                    </div>
                    <div className="text-center">
                      <span className="block text-lg font-bold text-green-400">{buyer.closedDeals}</span>
                      <span className="text-xs text-gray-400">Closed</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-lg font-semibold text-amber-400">{buyer.totalValue}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end gap-2">
                    <motion.button variants={buttonHover} whileHover="whileHover" whileTap="whileTap" className="p-2 text-amber-400 hover:bg-amber-400/10 rounded-lg transition-colors" title="Edit Buyer">
                      <Edit size={18} />
                    </motion.button>
                    <motion.button variants={buttonHover} whileHover="whileHover" whileTap="whileTap" className="p-2 text-red-400 hover:bg-red-600/10 rounded-lg transition-colors" title="Delete Buyer">
                      <Trash2 size={18} />
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
              <div><span className="font-medium text-gray-400">Submitted By:</span> {buyer.submittedBy}</div>
              <div><span className="font-medium text-gray-400">Joined:</span> {new Date(buyer.joinDate).toLocaleDateString()}</div>
              <div><span className="font-medium text-gray-400">Total Deals:</span> <span className="text-amber-400 font-bold">{buyer.totalDeals}</span></div>
              <div><span className="font-medium text-gray-400">Closed:</span> <span className="text-green-400 font-bold">{buyer.closedDeals}</span></div>
              <div><span className="font-medium text-gray-400">Total Value:</span> <span className="text-amber-400 font-semibold">{buyer.totalValue}</span></div>
            </div>
            <div className="flex gap-2 pt-2 border-t border-gray-700 mt-2">
              <motion.button variants={buttonHover} whileHover="whileHover" whileTap="whileTap" className="flex-1 px-3 py-2 border border-amber-400 text-amber-400 text-xs rounded-lg hover:bg-amber-400/10 transition-colors flex items-center justify-center gap-1 font-semibold" title="Edit Buyer">
                <Edit size={15} />
                Edit
              </motion.button>
              <motion.button variants={buttonHover} whileHover="whileHover" whileTap="whileTap" className="flex-1 px-3 py-2 border border-red-400 text-red-400 text-xs rounded-lg hover:bg-red-600/10 transition-colors flex items-center justify-center gap-1 font-semibold" title="Delete Buyer">
                <Trash2 size={15} />
                Delete
              </motion.button>
            </div>
          </div>
        ))}
      </div>
      {/* Empty State */}
      {filteredBuyers.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-2">No buyers found</div>
          {searchTerm && (
            <button onClick={() => setSearchTerm("")} className="text-amber-400 hover:underline">Clear search</button>
          )}
        </div>
      )}
    </div>
  );
}