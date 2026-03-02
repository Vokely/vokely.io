'use client'
import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";


export default function Accordion({data}) {
  const [openIndex, setOpenIndex] = useState(0);

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-2">
      {data.map((item, index) => (
        <div key={index} className="rounded-lg overflow-hidden border-b-[1px] border-dashed border-gray-200">
          {/* Accordion Header */}
          <button
            className="w-full p-4 text-left font-medium flex justify-between items-center text-xl"
            onClick={() => toggleAccordion(index)}
          >
            {item.title}
            <span className="text-xl">
                <ChevronDown size="22" className={`${openIndex === index ? "rotate-180 smooth":""}`}/>
            </span>
          </button>

          {/* Accordion Content with Animation */}
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: openIndex === index ? "auto" : 0, opacity: openIndex === index ? 1 : 0 }}
            exit={{ height: 0, opacity: 0 }} // Ensures smooth closing
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden bg-white px-4"
          >
            <div className="py-3 text-gray-600">{item.content}</div>
          </motion.div>
        </div>
      ))}
    </div>
  );
}
