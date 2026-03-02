import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createShareableLink, formatExpiryDate } from '@/lib/externalLinksUtil';

const ShareLinkForm = ({ interview_id, conclusion, onLinkCreated, candidateName }) => {
  const [linkName, setLinkName] = useState("");
  const [expiryOption, setExpiryOption] = useState("never");
  const [customExpiry, setCustomExpiry] = useState("");
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleCreateLink = async () => {
    try {
      setIsLoading(true);
      
      // Prepare link data and make sure datetime is properly formatted with timezone info
      let expiryValue = "never";
      if (expiryOption === "custom" && customExpiry) {
        // Ensure we're using UTC time consistently
        const customDate = new Date(customExpiry);
        expiryValue = customDate.toISOString();
      } else if (expiryOption !== "never") {
        expiryValue = formatExpiryDate(expiryOption);  
      }
      
      const linkData = {
        name: linkName.trim(),
        expires: expiryValue,
        requires_password: requiresPassword,
        password: requiresPassword ? password : null,
        type: "feedbacks",
        relation_id: interview_id,
        candidate_name : candidateName,
        data: conclusion
      };
            
      const response = await createShareableLink(linkData);
      
      if (response.ok) {
        const data = await response.json();
        
        // Reset form
        setLinkName("");
        setExpiryOption("never");
        setCustomExpiry("");
        setRequiresPassword(false);
        setPassword("");
        
        // Notify parent component
        if (onLinkCreated) {
          onLinkCreated(data);
        }
      }
    } catch (error) {
      console.error('Error creating link:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const expiryOptions = [
    { value: "never", label: "Never" },
    { value: "24h", label: "24 Hours" },
    { value: "7d", label: "7 Days" },
    { value: "30d", label: "30 Days" },
    { value: "custom", label: "Custom Date" }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white p-6 rounded-lg shadow-md"
    >
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Create New Shareable Link</h3>
      
      {/* Link Name */}
      <div className="mb-5">
        <label className="block text-sm font-medium text-gray-700 mb-2">Link Name</label>
        <motion.input 
          whileFocus={{ scale: 1.01 }}
          transition={{ type: "spring", stiffness: 300 }}
          type="text" 
          value={linkName}
          onChange={(e) => setLinkName(e.target.value)}
          placeholder="e.g., Interview Feedback for HR"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
        />
      </div>
      
      {/* Expiry Options - Custom Dropdown */}
      <div className="mb-5 relative">
        <label className="block text-sm font-medium text-gray-700 mb-2">Link Expiry</label>
        <motion.div 
          className="relative"
          initial={false}
        >
          <motion.button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full flex justify-between items-center px-4 py-2 text-left border border-gray-300 rounded-lg bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
            whileHover={{ backgroundColor: "#f9fafb" }}
          >
            <span>{expiryOptions.find(option => option.value === expiryOption)?.label}</span>
            <motion.svg 
              animate={{ rotate: isDropdownOpen ? 180 : 0 }}
              className="h-5 w-5 text-gray-500"
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </motion.svg>
          </motion.button>
          
          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg"
              >
                {expiryOptions.map((option) => (
                  <motion.button
                    key={option.value}
                    type="button"
                    whileHover={{ backgroundColor: "#f3f4f6" }}
                    onClick={() => {
                      setExpiryOption(option.value);
                      setIsDropdownOpen(false);
                    }}
                    className={`block w-full text-left px-4 py-2 hover:bg-gray-100 ${expiryOption === option.value ? 'bg-purple-50 text-purple-700' : ''}`}
                  >
                    {option.label}
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
      
      {/* Custom Expiry Date */}
      <AnimatePresence>
        {expiryOption === "custom" && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-5 overflow-hidden"
          >
            <label className="block text-sm font-medium text-gray-700 mb-2">Custom Expiry Date</label>
            <input 
              type="datetime-local" 
              value={customExpiry}
              onChange={(e) => setCustomExpiry(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
            />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Password Protection */}
      <div className="mb-6">
        <div className="flex items-center mb-3">
          <input 
            type="checkbox" 
            id="requirePassword"
            checked={requiresPassword}
            onChange={(e) => setRequiresPassword(e.target.checked)}
            className="ml-3 relative rounded border-2 accent-primary border-violet-500 border-solid cursor-pointer"
            />
          <label htmlFor="requirePassword" className="ml-2 text-sm font-medium text-gray-700">Require Password</label>
        </div>
        
        <AnimatePresence>
          {requiresPassword && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <input 
                type="text" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Create Button */}
      <motion.button 
        onClick={handleCreateLink}
        disabled={!linkName.trim() || isLoading || (requiresPassword && !password)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        className={`w-full py-3 px-4 rounded-lg text-white font-medium shadow-sm ${
          !linkName.trim() || isLoading || (requiresPassword && !password) 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-purple-600 hover:bg-purple-700'
        }`}
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
            />
            <span>Creating...</span>
          </div>
        ) : 'Create Shareable Link'}
      </motion.button>
    </motion.div>
  );
};

export default ShareLinkForm;