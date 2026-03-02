'use client'
import { useState } from 'react';
import PermissionsComponent from './Permissions';
const PermissionsModal = ({ isOpen, onClose, onContinue }) => {
  const [permissionsGranted, setPermissionsGranted] = useState(false);

  const handlePermissionsGranted = () => {
    setPermissionsGranted(true);
  };

  const handleContinue = () => {
    onContinue();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed px-2 md:px-0 inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Before We Start</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <PermissionsComponent onPermissionsGranted={handlePermissionsGranted} />

        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleContinue}
            disabled={!permissionsGranted}
            className={`px-4 py-2 rounded-md ${
              permissionsGranted 
                ? 'bg-primary text-white hover:bg-primary/90' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Continue to Interview
          </button>
        </div>
      </div>
    </div>
  );
};

export default PermissionsModal;