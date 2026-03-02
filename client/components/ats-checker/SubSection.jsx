import { ChevronDown, ChevronUp, XCircle, AlertCircle, CircleCheck, Check } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { FilledTick } from '../icons/FilledTick';
import { FilledMinus } from '../icons/FilledMinus';


export const SubSection = ({ sectionData, isOpen, onToggle }) => {
  if (!sectionData) return null;

  const { title, description, icon: Icon, gridItems, bottomDescription, ctaButton } = sectionData;

  const getStatusIcon = (status) => {
    switch (status) {
      case 'complete':
        return <FilledTick size='22'/>;
      case 'missing':
        return <FilledMinus size='22'/>;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-orange-500" />;
      default:
        return  <AlertCircle className="w-5 h-5 text-orange-500" />;
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm font-medium overflow-hidden">
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center space-x-3">
          {Icon}
          <h4 className="text-lg font-medium text-secondary">{title}</h4>
        </div>
        {isOpen ? (
          <ChevronUp size={20} className="text-gray-400 flex-shrink-0" />
        ) : (
          <ChevronDown size={20} className="text-gray-400 flex-shrink-0" />
        )}
      </button>

      {/* Content with animation */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden px-4 pb-4 border-t border-gray-100"
          >
            <div className="pt-4 space-y-6">
              {description && (
                <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
              )}

              {gridItems && gridItems.length > 0 && (
                <div className="mx-[10%] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {gridItems.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-3 p-3 rounded-lg border"
                    >
                      {getStatusIcon(item.status)}
                      <span className="text-sm font-medium">{item.label}</span>
                    </div>
                  ))}
                </div>
              )}

              {bottomDescription && (
                <div className="mx-10 bg-blue-50 border-light-gray p-4 rounded-lg">
                  <p className="text-center font-medium">{bottomDescription}</p>
                  {ctaButton && (
                    <div className="flex justify-center pt-2">
                      {ctaButton.href ? (
                        <Link href={ctaButton.href} className="inline-block">
                          <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                            {ctaButton.text}
                          </button>
                        </Link>
                      ) : (
                        <button
                          onClick={ctaButton.onClick}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                          {ctaButton.text}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
