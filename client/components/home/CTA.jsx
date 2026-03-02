'use client';
import { motion } from 'framer-motion';

export default function CTA() {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 md:px-8">
        <div className="bg-gradient-to-r from-primary/90 to-primary rounded-2xl overflow-hidden shadow-lg">
          <div className="flex flex-col md:flex-row items-center justify-between p-8 md:p-12">
            <div className="text-white mb-8 md:mb-0 md:max-w-xl">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4">
                Start Building Your Future Today
              </h2>
              <p className="mb-6">
                Unlock your potential with our AI Resume Builder and practice interviews for free!
              </p>
              <motion.a
                href="/create-account"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <button className="bg-white text-primary px-8 py-3 rounded-md font-semibold hover:bg-gray-100 transition-colors duration-300">
                  Get Started Free
                </button>
              </motion.a>
              <p className="text-white/80 text-sm mt-2">
                No credit card required. Try all features risk-free.
              </p>
            </div>

            <div className="w-full md:w-1/3">
              <img
                src={`${process.env.NEXT_PUBLIC_BUCKET_URL}/images/home/cta-dashboard.png`}
                alt="Vokely Platform"
                className="w-full h-auto rounded-lg shadow-md"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://via.placeholder.com/400x300?text=Vokely";
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
