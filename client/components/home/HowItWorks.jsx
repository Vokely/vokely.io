'use client';
import { motion } from 'framer-motion';
import { FileText, Target, Headphones, TrendingUp, ChevronDown } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      title: "Instant AI Resume",
      description: "Use AI Resume to instantly craft a polished, professional resume that gets noticed.",
      Icon: FileText,
    },
    {
      title: "Tailor It To Every Job",
      description: "AI Resume analyzes JDs and optimizes your resume for maximum impact.",
      Icon: Target,
    },
    {
      title: "AI Interview Prep",
      description: "Simulate real interviews, get feedback, and refine your answers.",
      Icon: Headphones,
    },
    {
      title: "Fast-Track Your Career",
      description: "Follow a step-by-step plan to fast-track your growth in your dream role.",
      Icon: TrendingUp,
    }
  ];  

  return (
    <section id='services' className="py-16 md:py-24 bg-gray-50">
      <div className="container mx-auto px-4 md:px-[5%]">
        <div className="text-center mb-16 relative">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
            Journey Towards Your Dream Job
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-8">
            Our streamlined process helps you optimize your job search and career development
          </p>
          
          {/* Scroll indicator */}
          <div className="hidden md:flex absolute top-0 right-4 md:right-8 flex-col items-center">
            <motion.div
              className="w-8 h-8 rounded-full border-2 border-primary flex items-center justify-center text-primary cursor-pointer"
              animate={{ y: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <ChevronDown className="w-4 h-4" />
            </motion.div>
            <span className="text-sm text-primary mt-2 font-medium">Scroll to Learn more</span>
          </div>
        </div>

        <div className="mb-10 md:flex items-center md:gap-8 justify-evenly">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              className="bg-white rounded-xl space-y-4 p-4 h-full border-[1px] border-gray-200"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              {/* Icon */}
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <step.Icon className="w-6 h-6 text-primary" />
              </div>
              
              {/* Content */}
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-primary mb-2">{step.title}</h3>
                <p className="text-gray-600 font-medium leading-relaxed">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
