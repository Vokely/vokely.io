'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

export const CustomDropdown = ({ id, label, placeholder, options, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (selectedValue) => {
    onChange({ target: { value: selectedValue } });
    setIsOpen(false);
  };

  return (
    <div className="mb-4 text-left relative"> {/* reduced bottom margin */}
      <label htmlFor={id} className="block font-medium text-xs text-gray-700 mb-1">
        {label}
      </label>

      <div
        className="w-full p-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-800 focus:outline-none cursor-pointer relative flex items-center justify-between text-sm"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span className={`${value ? 'text-gray-800' : 'text-gray-400'}`}>
          {value || placeholder}
        </span>
        <ChevronDown className={`w-3 h-3 ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.ul
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
            className="absolute z-20 w-full bg-white p-1 rounded-lg shadow-lg shadow-primary/20 mt-1 overflow-y-auto
              max-h-48 sm:max-h-56 md:max-h-64"
          >
            {options.map((option, index) => (
              <li
                key={index}
                onClick={() => handleSelect(option)}
                className={`px-3 py-2 text-xs hover:bg-primary/10 cursor-pointer ${
                  value === option ? 'bg-primary-20' : ''
                }`}
              >
                {option}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
};

export const CustomInput = ({ id, label, placeholder, value, onChange }) => (
  <div className="mb-4 text-left">
    <label htmlFor={id} className="block font-medium text-xs text-gray-700 mb-1">
      {label}
    </label>
    <input
      type="text"
      id={id}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full p-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
    />
  </div>
);
