'use client';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { companies } from '@/data/home';

export default function TrustedBy() {
  const [isPaused, setIsPaused] = useState(false);

  // Create duplicate array for seamless loop
  const duplicatedCompanies = [...companies, ...companies];

  return (
    <div className="py-3 md:py-6 bg-gray-50 shadow-sm overflow-hidden">
      <div className="mx-[5%] px-4 md:px-6 bg-white rounded-md py-16">
        <div className="text-center mb-4">
          <h2 className="text-normal md:text-2xl font-bold">
            Trusted by top professionals at leading companies
          </h2>
        </div> 

        <div 
          className="relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="overflow-hidden">
            <motion.div
              className="flex items-center gap-8 md:gap-12"
              animate={{
                x: isPaused ? undefined : [0, -companies.length * 120]
              }}
              transition={{
                duration: companies.length * 3,
                ease: "linear",
                repeat: isPaused ? 0 : Infinity,
                repeatType: "loop"
              }}
              style={{ width: `${duplicatedCompanies.length * 120}px` }}
            >
              {duplicatedCompanies.map((company, index) => (
                <motion.div 
                  key={index} 
                  className="flex-shrink-0 h-8 md:h-12 flex items-center justify-center border-[1px] border-gray-200 p-2"
                  whileHover={{ 
                    scale: 1.1,
                    transition: { duration: 0.2 }
                  }}
                >
                  <img
                    src={`${process.env.NEXT_PUBLIC_BUCKET_URL}/images/logo/${company.logo}`}
                    alt={`${company.name} logo`}
                    className="h-full w-auto max-w-full object-contain"
                  />
                </motion.div>
              ))}
            </motion.div>
          </div>
          
          {/* Gradient overlays for fade effect */}
          <div className="absolute top-0 left-0 w-16 md:w-24 h-full bg-gradient-to-r from-gray-50 to-transparent pointer-events-none z-10"></div>
          <div className="absolute top-0 right-0 w-16 md:w-24 h-full bg-gradient-to-l from-gray-50 to-transparent pointer-events-none z-10"></div>
        </div>
      </div>
    </div>
  );
}