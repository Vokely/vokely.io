'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { navItems } from '@/data/navItems';
import LogoText from '../reusables/LogoText';
import '@/styles/home.css';
import { ChevronDown, Menu, X } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import ProfileDropdown from '../reusables/ProfileDropdown';

export default function Navbar() {
  const [currentDropdown, setCurrentDropdown] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const {user} = useAuthStore();

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      // Close mobile menu when resizing to desktop
      if (window.innerWidth >= 890) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleMobileDropdownClick = (itemName) => {
    setCurrentDropdown(currentDropdown === itemName ? null : itemName);
  };

  return (
    <div className="sticky top-[10px] z-[999] px-4 py-3 bg-white md:shadow-sm shadow-md rounded-md border-light-gray mx-5">
      <nav className="flex items-center justify-between rounded-full px-4 md:px-8">
      {/* Left - Logo */}
      <div className="flex items-center gap-4">
        <LogoText color='#342EE5'/>
      </div>

      {/* Mobile Menu Button - Only visible on small screens */}
      <div className="lap:hidden">
        <button
          onClick={toggleMobileMenu}
          className="p-2 focus:outline-none"
          aria-label="Toggle mobile menu"
        >
          {isMobileMenuOpen ? (
            <X size={24} />
          ) : (
            <Menu size={24} />
          )}
        </button>
      </div>

      {/* Desktop Navigation - Hidden on mobile */}
      <div className="hidden lap:flex items-center gap-8 lg:gap-16 justify-self-center">
        {navItems.map((item, i) =>
          item.dropdown ? (
            <div
              key={i}
              className="relative group flex gap-2 items-center"
              onMouseEnter={() => setCurrentDropdown(item.name)}
              onMouseLeave={() => setCurrentDropdown(null)}
            >
              <span className="cursor-pointer flex items-center gap-1">
                {item.name}
                <ChevronDown size="16" color="black" />
              </span>

              <AnimatePresence>
                {currentDropdown === item.name && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="absolute top-full left-0 mt-2 w-64 bg-white shadow-md rounded-md overflow-hidden"
                  >
                    {item.dropdown.map((subItem, j) => (
                      <a
                        key={j}
                        href={subItem.link}
                        className="relative block px-4 py-2 hover:bg-gray-100"
                      >
                        <span className="font-semibold">{subItem.name}</span>
                        <p className="text-xs text-[#333747]">{subItem.description}</p>
                        {subItem.info && (
                          <span
                          className="animate-jiggle absolute right-0 top-0 rotate-[15deg] bg-multi-gradient text-white text-[10px] px-2 py-[1px] rounded-full font-semibold animate-pop shadow-md"
                        >
                          {subItem.info}
                        </span>
                        )}
                      </a>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
              <a key={i} href={item.link} className="relative cursor-pointer">
                {item.name}
                {item.info && (
                <span
                  className="animate-jiggle absolute -top-[10px] -right-[20px] rotate-[15deg] bg-multi-gradient text-white text-[10px] px-2 py-[1px] rounded-full font-semibold animate-pop shadow-md"
                >
                  {item.info}
                </span>
              )}
              </a>
          )
        )}
      </div>

      {/* CTA Buttons - Hidden on mobile */}
      <div className="hidden lap:block">
        {user!=null ? (
          <ProfileDropdown/>
        ) : (
          <div>
            <a href="/signin" className="block">
              <button className="custom-button w-full py-2 text-center">
              SignIn
              </button>
            </a>
          </div>
        )}
      </div>

      {/* Mobile Menu - Only visible when toggled */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white shadow-lg rounded-lg overflow-hidden z-50 mx-0 mobile-menu-container"
          >
            <div className="py-4 px-6 flex flex-col gap-4">
              {/* Mobile CTA */}
              <div className="pb-4 border-b border-gray-200">
                {user!=null ? (
                  <ProfileDropdown isMobile={true}/>
                ) : (
                    <a href="/signin" className="block">
                      <button className="custom-button w-full py-2 text-center">
                      SignIn
                      </button>
                    </a>
                )}
              </div>
              {/* Mobile Navigation Items */}
              {navItems.map((item, i) => (
                <div key={i} className="py-2">
                  {item.dropdown ? (
                    <div className="flex flex-col">
                      <button
                        onClick={() => handleMobileDropdownClick(item.name)}
                        className="flex items-center justify-between w-full text-left py-2"
                      >
                        <span>{item.name}</span>
                        <ChevronDown
                          size={16}
                          className={`transition-transform duration-200 ${currentDropdown === item.name ? 'rotate-180' : ''}`}
                        />
                      </button>

                      <AnimatePresence>
                        {currentDropdown === item.name && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="pl-4 mt-2 border-l-2 border-gray-200"
                          >
                            {item.dropdown.map((subItem, j) => (
                              <a
                                key={j}
                                href={subItem.link}
                                className="block py-2"
                              >
                                <span className="font-medium">{subItem.name}</span>
                                <p className="text-xs text-[#333747]">{subItem.description}</p>
                              </a>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <a href={item.link} className="block py-2">
                      {item.name}
                    </a>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
    </div>
  );
}