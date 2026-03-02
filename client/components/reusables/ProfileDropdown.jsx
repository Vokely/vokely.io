"use client"; 

import { useState, useEffect, useRef } from "react";
import { User, LogOut } from "lucide-react";
import { useRouter } from "next/navigation"; 
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from "@/store/authStore";

const ProfileDropdown = ({ isMobile = false}) => {
  const {clearUser} = useAuthStore()
  const [isOpen, setIsOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const dropdownRef = useRef(null);
  const router = useRouter(); 

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]); 

  const handleImageError = () => {
    setImageError(true); 
  };

  const handleProfileClick = () => {
    router.push("/profile"); 
    setIsOpen(false); 
  };

  const handleLogoutClick = async() => {
    const res = await fetch('/api/auth/signout');
    const json = await res.json()

    if(json.success){
      localStorage.clear();
      clearUser();
      router.push(`${process.env.NEXT_PUBLIC_CURRENT_URL}/signin`)
    }
  };

  const profileImage = null;//Have to store image

  if (isMobile) {
    return (
      <div className="w-full">
        <div className="flex flex-col gap-2">
          <button
            onClick={handleProfileClick}
            className="flex items-center gap-2 py-2 w-full text-left hover:bg-gray-100 transition-colors"
          >
            <User className="w-5 h-5 text-gray-600" />
            <span className="font-medium">Profile</span>
          </button>
          <button
            onClick={handleLogoutClick}
            className="flex items-center gap-2 py-2 w-full text-left hover:bg-gray-100 transition-colors"
          >
            <LogOut className="w-5 h-5 text-gray-600" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Image Button */}
      <button
        onClick={toggleDropdown}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 focus:outline-none"
        aria-label="Toggle profile menu"
      >
        {profileImage && !imageError ? (
          <img
            src={profileImage}
            alt="Profile"
            className="w-full h-full rounded-full object-cover"
            onError={handleImageError} 
          />
        ) : (
          <User className="w-5 h-5 text-gray-600" /> 
        )}
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
            className="absolute mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-50 right-1/2 lap:right-0 lap:left-auto transform lap:translate-x-0 -translate-x-1/2 w-48"
          >
            <ul className="py-2">
              <li>
                <button
                  onClick={handleProfileClick} 
                  className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <User className="w-5 h-5 mr-2" />
                  Profile
                </button>
              </li>
              <li>
                <button
                  onClick={handleLogoutClick}
                  className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <LogOut className="w-5 h-5 mr-2" />
                  Logout
                </button>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfileDropdown;