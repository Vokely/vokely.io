'use client';
import { motion } from 'framer-motion';
import BentoGridLayout from './BentoGrid';

export default function ServiceItem({sectionData}) {

  const { header, stats, centerContent, bottomSection } = sectionData;

  return (
    <section className="px-4 md:px-12 py-10">
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
            {header.subtitle}
          </p>
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
            {header.title}
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto text-lg leading-relaxed mb-8">
            {header.description}
          </p>
          <a href={header.buttonLink}>
            <motion.button
              className="bg-primary text-white px-8 py-3 rounded-full font-semibold text-lg hover:bg-primary/90 transition-colors duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {header.buttonText}
            </motion.button>
          </a>
        </div>

        <BentoGridLayout sectionData={sectionData}/>
      </motion.div>
    </section>
  );
}