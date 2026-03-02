'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const FiltersAndSearch = ({ statusFilter, setStatusFilter }) => {
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  const handleStatusSelect = (status) => {
    setStatusFilter(status);
    setShowStatusDropdown(false);
  };

  const dropdownVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 }
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-[#bababa] border rounded-md p-4">
      {/* Filter Dropdown */}
      <div className="relative mb-4 sm:mb-0">
        <button
          className="flex items-center justify-between w-48 px-4 py-2 text-sm bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none"
          onClick={() => setShowStatusDropdown((prev) => !prev)}
        >
          <span>Filter by: {statusFilter}</span>
          <ChevronDown className="w-4 h-4 ml-2" />
        </button>

        <AnimatePresence>
          {showStatusDropdown && (
            <motion.div
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={dropdownVariants}
              transition={{ duration: 0.2 }}
              className="absolute z-10 w-48 mt-1 bg-white border border-gray-200 rounded-md shadow-lg"
            >
              <ul className="py-1">
                {['All Status', 'Not Started', 'In Progress', 'Completed'].map((status) => (
                  <li
                    key={status}
                    className="px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleStatusSelect(status)}
                  >
                    {status}
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Search Box */}
      {/* <div className="relative w-full sm:w-64">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search in Roadmap"
          className="w-full px-4 py-2 pl-10 text-sm bg-white border-[#bababa] rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500"
        />
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
      </div> */}
    </div>
  );
};

export default FiltersAndSearch;