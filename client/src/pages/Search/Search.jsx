import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import "aos/dist/aos.css";
import AOS from "aos";
import { FiX, FiSearch, FiFilter } from "react-icons/fi";
import { Button } from "../../components/Button";
import Navbar from "../Home/Navbar";
import {useItemStore} from "../../store/itemStore";
import { useChatStore } from "../../store/chatStore";

const LostFoundTable = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredItems, setFilteredItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const { items, loading, error, fetchItems ,claimItem} = useItemStore();
  const { setSelectedUser } = useChatStore();

  const navigate = useNavigate();

  useEffect(() => {
    AOS.init({ duration: 500 });
    fetchItems();
  }, [fetchItems]);

  useEffect(() => {
    const query = searchQuery.toLowerCase();
    setFilteredItems(
      items
        .filter(
          (item) =>
            item?.itemName?.toLowerCase().includes(query) ||
            item?.itemType?.toLowerCase().includes(query) ||
            item?.status?.toLowerCase().includes(query) ||
            item?.description?.toLowerCase().includes(query)
        )
        .filter(
          (item) =>
            (!filterType || item.itemType === filterType) &&
            (!filterStatus || item.status === filterStatus)
        )
    );
  }, [searchQuery, items, filterType, filterStatus]);

  const getReporterName = (item) => {
    console.log("ownner or founder",item.ownerId || item.founderId);
    return item.ownerId?.name || item.founderId?.name || "Unknown";
  };

  // const getReporterId=(item)={
  //   return item.owner
  // }

  const handleClaim = async (itemId,user) => {
    setSelectedUser(user);
    await claimItem(itemId);
    navigate(`/messages/user/${itemId}`); // Redirects to the chat page
  };

  return (
    <div>
      <Navbar />
      <div className="p-8 bg-gray-900 text-white min-h-screen">
        {loading && <div>Loading...</div>}
        {error && <div className="text-red-500">Error: {error}</div>}

        <div className="mb-6 flex justify-center gap-4 ">
          <div className="relative w-full sm:w-96">
            <input
              type="text"
              placeholder="Search items..."
              className="w-full px-4 py-2 pl-10 text-gray-900 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 shadow-md hover:shadow-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <FiSearch
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 "
              size={20}
            />
          </div>
          <FiFilter
            className="text-white cursor-pointer  text-2xl hover:text-blue-400 transition-all  mt-2"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
          />
        </div>

        {isFilterOpen && (
          <div className="mb-6 flex justify-center gap-4">
            <select
              className="px-4 py-2 rounded bg-gray-800 text-white focus:outline-none"
              onChange={(e) => setFilterType(e.target.value)}
              value={filterType}
            >
              <option value="">All Types</option>
              <option value="Lost">Lost</option>
              <option value="Found">Found</option>
            </select>
            <select
              className="px-4 py-2 rounded bg-gray-800 text-white focus:outline-none"
              onChange={(e) => setFilterStatus(e.target.value)}
              value={filterStatus}
            >
              <option value="">All Status</option>
              <option value="Active">Active</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
              className="bg-gray-800 rounded-lg overflow-hidden shadow-lg cursor-pointer transition-transform"
              onClick={() => setSelectedItem(item)}
            >
              <img
                src={`http://localhost:5100/${item.images}`}
                alt={item.itemName}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h2 className="text-lg font-semibold mb-2">{item.itemName}</h2>
                <h2 className="font-semibold">{item.itemType}</h2>
                <p className="text-gray-400 text-sm">
                  Reported by: {getReporterName(item)}
                </p>
                <p className="text-gray-400 text-sm">
                  Location: {item.location}
                </p>
                <div className="flex justify-between items-center mt-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      item.status === "Active"
                        ? "bg-yellow-500"
                        : "bg-green-500"
                    }`}
                  >
                    {item.status}
                  </span>
                  <Button className="bg-blue-500">Claim</Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {selectedItem && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80 z-50"
          >
            <div className="bg-gray-800 rounded-lg p-8 relative w-8/12 max-w-lg">
              <button
                className="absolute top-1 right-2 text-white text-2xl hover:text-gray-500 transition"
                onClick={() => setSelectedItem(null)}
              >
                <FiX />
              </button>
              <img
                src={`http://localhost:5100/${selectedItem.images[0]}`}
                alt={selectedItem.itemName}
                className="w-full h-64 object-cover rounded-md mb-4"
              />
              <h2 className="text-2xl font-bold mb-2">
                {selectedItem.itemName}
              </h2>
              <p className="text-gray-400 mb-2">
                Reported by: {getReporterName(selectedItem)}
              </p>
              <p className="text-gray-400 mb-2">
                Location: {selectedItem.location}
              </p>
              <p className="text-gray-400 mb-2">
                Status: {selectedItem.itemType}
              </p>
              <p className="text-gray-400 mb-4">
                Description: {selectedItem.description}
              </p>
              <Button className="bg-blue-500" onClick={() => { handleClaim(selectedItem._id, selectedItem.ownerId || selectedItem.founderId)}} >Claim</Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default LostFoundTable;
