'use client';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

export default function InterviewCoachSection() {
  return (
    <section className="py-16 px-4 md:px-12 md:py-24 bg-gray-50">
      <motion.div
        className="max-w-6xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-gray-500 text-sm font-medium mb-4 tracking-wide uppercase">
            AI INTERVIEW COACH
          </p>
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
            Crack Every Interview with AI-Powered Practice
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto text-lg leading-relaxed mb-8">
            Turn nerves into confidence. Simulate real-world interview scenarios, receive instant 
            AI feedback, and walk into every interview fully prepared to impress.
          </p>
          <motion.button
            className="bg-primary text-white px-8 py-3 rounded-full font-semibold text-lg hover:bg-primary/90 transition-colors duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Start Mock Interview
          </motion.button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 items-stretch">
          {/* 24/7 Availability */}
          <motion.div
            className="bg-white rounded-2xl p-6 text-center shadow-sm"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="text-4xl font-bold text-gray-900 mb-2">24/7</div>
            <p className="text-gray-600 text-sm mb-4">Availability</p>
            <div className="flex justify-start">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                <ArrowUpRight className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </div>
            </div>
          </motion.div>

          {/* Center Content - Interview Feedback */}
          <motion.div
            className="lg:col-span-3 relative"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Interview Feedback Preview */}
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <img
                  src={`${process.env.NEXT_PUBLIC_BUCKET_URL}/images/interviewfeedback.png?t=${Date.now()}`}
                  alt="Interview Feedback Interface"
                  className="w-full h-auto object-contain rounded-lg"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://via.placeholder.com/300x200/f3f4f6/6b7280?text=Interview+Feedback`;
                  }}
                />
              </div>

              {/* Instant Feedback Card */}
              <div className="bg-white rounded-xl p-6 shadow-sm flex flex-col justify-center text-center">
                <h3 className="font-semibold text-gray-900 mb-2">Instant feedback on your responses and tone</h3>
                <p className="text-gray-600 text-sm">Get real-time analysis of your answers, speaking pace, and communication style</p>
              </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Mock Interviews Card */}
              <div className="bg-white rounded-xl p-6 shadow-sm text-center">
                <h3 className="font-semibold text-gray-900 mb-2 text-sm">Mock interviews based on your targeted roles</h3>
                <p className="text-gray-600 text-xs">Practice with questions specific to your industry and role</p>
              </div>

              {/* 1000+ Questions */}
              <div className="bg-white rounded-xl p-6 text-center shadow-sm">
                <div className="text-3xl font-bold text-gray-900 mb-1">1000+</div>
                <p className="text-gray-600 text-sm mb-3">Curated Questions</p>
                <div className="w-6 h-6 md:w-8 md:h-8 bg-primary rounded-full flex items-center justify-center mx-auto flex-shrink-0">
                  <ArrowUpRight className="w-3 h-3 md:w-4 md:h-4 text-white" />
                </div>
              </div>

              {/* Interview Person Image */}
              <div className="bg-gray-100 rounded-xl p-4 flex items-center justify-center shadow-sm">
                <img
                  src={`${process.env.NEXT_PUBLIC_BUCKET_URL}/images/interviewperson.png?t=${Date.now()}`}
                  alt="Person in interview"
                  className="w-full h-24 object-cover rounded-lg"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://via.placeholder.com/120x96/f3f4f6/6b7280?text=Interview`;
                  }}
                />
              </div>
            </div>
          </motion.div>

          {/* 72% Increased Callback */}
          <motion.div
            className="bg-white rounded-2xl p-6 text-center shadow-sm"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="text-4xl font-bold text-gray-900 mb-2">72%</div>
            <p className="text-gray-600 text-sm mb-4">Increased Callback</p>
            <div className="w-8 h-8 md:w-10 md:h-10 bg-primary rounded-full flex items-center justify-center mx-auto flex-shrink-0">
              <ArrowUpRight className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>
          </motion.div>
        </div>

        {/* Bottom Enhancement Card */}
        <motion.div
          className="mt-8 bg-white rounded-xl p-6 text-center shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h3 className="font-semibold text-gray-900 mb-2">Improves confidence, clarity, and storytelling</h3>
          <p className="text-gray-600 text-sm">Our AI helps you articulate your experiences compellingly and answer with confidence</p>
        </motion.div>
      </motion.div>
    </section>
  );
}