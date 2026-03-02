'use client';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

export default function CareerRoadmapSection() {
  return (
    <section className="py-16 px-4 md:px-12 md:py-24 bg-white">
      <motion.div
        className="max-w-6xl mx-auto border-2 border-cyan-300 rounded-3xl p-8 md:p-12 bg-white"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-gray-500 text-sm font-medium mb-4 tracking-wide uppercase">
            AI CAREER ROADMAP
          </p>
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
            Design a Future-Proof Career with AI Guidance
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto text-lg leading-relaxed mb-8">
            Unsure what's next? Our AI Roadmap tool builds a customized career plan with clear, 
            actionable milestones — helping you grow with confidence and direction.
          </p>
          <motion.button
            className="bg-primary text-white px-8 py-3 rounded-full font-semibold text-lg hover:bg-primary/90 transition-colors duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Generate My Roadmap
          </motion.button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 items-center">
          {/* 100% Personalized Plans */}
          <motion.div
            className="bg-gray-100 rounded-2xl p-6 text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="text-4xl font-bold text-gray-900 mb-2">100%</div>
            <p className="text-gray-600 text-sm">Personalized plans</p>
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center mt-4 mx-auto">
              <ArrowUpRight className="w-5 h-5 text-white" />
            </div>
          </motion.div>

          {/* Center Content */}
          <motion.div
            className="lg:col-span-3 relative"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Roadmap Interface Preview */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <img
                  src={`${process.env.NEXT_PUBLIC_BUCKET_URL}/images/roadmaptracker.png?t=${Date.now()}`}
                  alt="Career Roadmap Interface"
                  className="w-full h-auto object-contain rounded-lg"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://via.placeholder.com/300x200/f3f4f6/6b7280?text=Roadmap+Table`;
                  }}
                />
              </div>

              {/* Journey Card */}
              <div className="bg-white rounded-xl p-4 border border-gray-200 flex flex-col justify-center">
                <h3 className="font-semibold text-gray-900 mb-2">Maps your journey to roles that match your goals</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <div className="flex items-start gap-2">
                    <div className="w-1 h-1 bg-gray-400 rounded-full mt-2"></div>
                    <span>Career Progression</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1 h-1 bg-gray-400 rounded-full mt-2"></div>
                    <span>Skill Development</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1 h-1 bg-gray-400 rounded-full mt-2"></div>
                    <span>Goal Alignment</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Skills Gap Card */}
              <div className="bg-gray-100 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 mb-2 text-sm">Identifies gaps and recommends skills to learn next</h3>
              </div>

              {/* 3x Faster Clarity */}
              <div className="bg-gray-100 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-gray-900 mb-1">3x</div>
                <p className="text-gray-600 text-sm">Faster Clarity</p>
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center mt-3 mx-auto">
                  <ArrowUpRight className="w-4 h-4 text-white" />
                </div>
              </div>

              {/* Career Planning Image */}
              <div className="bg-cyan-100 rounded-xl p-4 flex items-center justify-center">
                <img
                  src={`${process.env.NEXT_PUBLIC_BUCKET_URL}/images/roadmaptable.png?t=${Date.now()}`}
                  alt="Career planning session"
                  className="w-full h-24 object-cover rounded-lg"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://via.placeholder.com/120x96/06b6d4/ffffff?text=Planning`;
                  }}
                />
              </div>
            </div>
          </motion.div>

          {/* 80% User Satisfaction */}
          <motion.div
            className="bg-gray-100 rounded-2xl p-6 text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="text-4xl font-bold text-gray-900 mb-2">80%</div>
            <p className="text-gray-600 text-sm">User Satisfaction</p>
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center mt-4 mx-auto">
              <ArrowUpRight className="w-5 h-5 text-white" />
            </div>
          </motion.div>
        </div>

        {/* Bottom Row with Adaptability */}
        <motion.div
          className="mt-8 bg-gray-50 rounded-xl p-6 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h3 className="font-semibold text-gray-900 mb-2">Adapts to transitions, upskilling, and new ambitions</h3>
          <p className="text-gray-600 text-sm">Our AI roadmap evolves with your career changes and helps you navigate pivots with confidence</p>
        </motion.div>
      </motion.div>
    </section>
  );
}