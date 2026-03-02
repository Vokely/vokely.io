'use client';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

export default function ResumeBuilderSection() {
  return (
    <section className="py-16 px-4 md:px-12 md:py-24">
      <motion.div
        className="border-[1px] border-gray-200 rounded-3xl p-8 md:p-12 bg-white"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-gray-500 text-sm font-medium mb-4 tracking-wide uppercase">
            AI RESUME BUILDER
          </p>
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
            Make it to Top 1% of Resumes
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto text-lg leading-relaxed mb-8">
            No more guesswork. Our AI Resume Builder crafts impactful resumes that align with 
            the roles you want — ensuring your profile rises to the top of the recruiter's stack.
          </p>
          <motion.button
            className="bg-primary text-white px-8 py-3 rounded-full font-semibold text-lg hover:bg-primary/90 transition-colors duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Optimize My Resume Now
          </motion.button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 items-center">
          {/* 50k Stat Left */}
          <motion.div
            className="bg-gray-100 rounded-2xl p-6 text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="text-4xl font-bold text-gray-900 mb-2">50k</div>
            <p className="text-gray-600 text-sm">Resumes Created</p>
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
              {/* Resume Interface Preview */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <img
                  src={`${process.env.NEXT_PUBLIC_BUCKET_URL}/images/Aisuggestions.png?t=${Date.now()}`}
                  alt="AI Resume Suggestions Interface"
                  className="w-full h-auto object-contain rounded-lg"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://via.placeholder.com/300x200/f3f4f6/6b7280?text=AI+Suggestions`;
                  }}
                />
              </div>

              {/* Summary Card */}
              <div className="bg-white rounded-xl p-4 border border-gray-200 flex flex-col justify-center">
                <h3 className="font-semibold text-gray-900 mb-2">Crafts compelling summaries tailored to your goals</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <div className="flex items-start gap-2">
                    <div className="w-1 h-1 bg-gray-400 rounded-full mt-2"></div>
                    <span>Professional Summary</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1 h-1 bg-gray-400 rounded-full mt-2"></div>
                    <span>Technical Skills</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1 h-1 bg-gray-400 rounded-full mt-2"></div>
                    <span>Work Experience</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Transform Card */}
              <div className="bg-gray-100 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 mb-2 text-sm">Transforms your resume to match job-specific language</h3>
              </div>

              {/* ATS Score */}
              <div className="bg-gray-100 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-gray-900 mb-1">84</div>
                <p className="text-gray-600 text-sm">Average ATS Score</p>
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center mt-3 mx-auto">
                  <ArrowUpRight className="w-4 h-4 text-white" />
                </div>
              </div>

              {/* Professional Image */}
              <div className="bt rounded-xl p-4 flex items-center justify-center">
                <img
                  src={`${process.env.NEXT_PUBLIC_BUCKET_URL}/images/resumehand.png?t=${Date.now()}`}
                  alt="Resume in hand"
                  className="w-full h-full object-cover rounded-lg"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://via.placeholder.com/120x96/14b8a6/ffffff?text=Resume`;
                  }}
                />
              </div>
            </div>
          </motion.div>

          {/* 50k Stat Right */}
          <motion.div
            className="bg-gray-100 rounded-2xl p-6 text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="text-4xl font-bold text-gray-900 mb-2">50k</div>
            <p className="text-gray-600 text-sm">Resumes Created</p>
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center mt-4 mx-auto">
              <ArrowUpRight className="w-5 h-5 text-white" />
            </div>
          </motion.div>
        </div>

        {/* Bottom Row with ATS Enhancement */}
        <motion.div
          className="mt-8 bg-gray-50 rounded-xl p-6 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h3 className="font-semibold text-gray-900 mb-2">Boosts visibility with ATS-friendly formatting</h3>
          <p className="text-gray-600 text-sm">Our AI ensures your resume passes through Applicant Tracking Systems with optimized keywords and formatting</p>
        </motion.div>
      </motion.div>
    </section>
  );
}