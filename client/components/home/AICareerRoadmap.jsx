'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function AICareerRoadmap() {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { x: -30, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        duration: 0.6
      }
    }
  };

  const imageVariants = {
    hidden: { x: 30, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        duration: 0.6
      }
    }
  };

  return (
    <section className="py-16 md:py-24 bg-[#F0FFF4]">
      <div className="container mx-auto px-4 md:px-8">
        <motion.div 
          className="flex flex-col md:flex-row items-center justify-between gap-12 md:gap-16"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          {/* Left Content */}
          <motion.div 
            className="w-full md:w-1/2"
            variants={itemVariants}
          >
            <h3 className="text-sm uppercase tracking-wider mb-3">AI CAREER ROADMAP</h3>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Navigate Your Career<br />
              Path with Confidence
            </h2>
            <p className="text-gray-700 mb-8">
              Our AI Career Roadmap provides personalized guidance tailored to your unique career goals. Visualize your journey with clear milestones and actionable steps to achieve success.
            </p>
            
            <div className="space-y-4 mb-8">
              <h4 className="font-semibold text-lg">Key Benefits</h4>
              <div className="flex items-start">
                <div className="mr-2 text-[#27AE60]">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-gray-700">Roadmap based on your resume, goal, or skill gaps</p>
              </div>
              
              <div className="flex items-start">
                <div className="mr-2 text-[#27AE60]">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-gray-700">Custom milestones, tasks, and learning modules</p>
              </div>
              
              <div className="flex items-start">
                <div className="mr-2 text-[#27AE60]">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-gray-700">Covers career gaps, industry changes & role transitions</p>
              </div>
            </div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link href="/career-roadmap">
                <button className="bg-black text-white px-8 py-3 rounded-md font-semibold hover:bg-gray-800 transition-colors duration-300">
                  Generate My Roadmap
                </button>
              </Link>
            </motion.div>
          </motion.div>
          
          {/* Right Content - Image with decorative elements */}
          <motion.div 
            className="w-full md:w-1/2 relative"
            variants={imageVariants}
          >
            {/* Green star decoration */}
            <div className="absolute -top-10 -left-4 z-20">
              <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M40 0L50 30L80 40L50 50L40 80L30 50L0 40L30 30L40 0Z" fill="#27AE60" />
              </svg>
            </div>
            
            {/* Main image container with border */}
            <div className="relative z-10 rounded-xl overflow-hidden border-4 border-white shadow-xl">
              <img
                src={`${process.env.NEXT_PUBLIC_BUCKET_URL}/images/roadmap-card.png`}
                alt="Person planning career roadmap with AI"
                className="w-full h-auto object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://via.placeholder.com/600x400?text=Career+Roadmap";
                }}
              />
              
              {/* Personalized roadmap badge */}
              <div className="absolute top-4 right-4 bg-[#27AE60]/90 text-white px-4 py-2 rounded-lg shadow-md text-sm font-semibold">
                PERSONALIZED CAREER MAP
              </div>
              
              {/* Path guidance badge */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white/90 text-[#27AE60] px-6 py-2 rounded-full shadow-md text-sm uppercase tracking-wider">
                PATH GUIDANCE TO SUCCESS
              </div>
              
              {/* Small green star decoration */}
              <div className="absolute bottom-10 right-10 z-20">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 0L25 15L40 20L25 25L20 40L15 25L0 20L15 15L20 0Z" fill="#27AE60" />
                </svg>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
