'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function FinalCTA() {
  return (
    <section className="py-16 md:py-[10%] bg-gray-100 relative h-screen">
      <div className="container mx-auto px-4 md:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Step into your next opportunity with us
          </h2>
          <p className="text-gray-600 text-lg md:text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of professionals who have transformed their careers with Vokely's AI-powered tools.
          </p>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-block"
          >
            <Link href="/create-account">
              <button className="bg-black text-white px-8 py-4 rounded-md font-semibold text-lg shadow-lg hover:bg-gray-800 transition-colors duration-300">
                Get Started For Free
              </button>
            </Link>
          </motion.div>
          
          <p className="mt-4 text-gray-500 text-sm">
            No credit card required. Free forever plan available.
          </p>
        </div>
      </div>
      
      {/* Background Image */}
      <div className="absolute bottom-0 left-0 w-full h-screen">
        <img
          src={`${process.env.NEXT_PUBLIC_BUCKET_URL}/images/join-us-background.jpg?t=${Date.now()}`}
          alt="Background"
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://via.placeholder.com/1920x1080?text=Background";
          }}
        />
      </div>
    </section>
  );
}
