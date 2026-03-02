'use client';
import { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Code,
  Layout,
  FileText,
  MousePointer,
  Layers,
  Zap,
  RefreshCw,
  X,
  Check,
} from 'lucide-react';
import { Timer,TimerOff,SquareCheckBig } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shapes, Brick, Bush, Animation } from '../icons/SubHeadingIcons';
import { getSkillStatus } from '@/lib/roadmapUtil';

const icons = [<FileText size={24}/>,<Layout size={24}/>,<Code size={24}/>,<MousePointer size={24}/>,<Layers size={24}/>,<Zap size={24}/>,<RefreshCw size={24}/>,<X size={24}/>];
const subHeadingIcons = [
  <Brick size='22'/>,
  <Shapes size='22'/>,
  <Bush size='22'/>,
  <Animation size='22'/>
];

const SkillsList = ({ roadmap, setSelectedSubHeading, setSelectedHeading,handleStatusChange,selectedHeading }) => {
  const [expandedSections, setExpandedSections] = useState({});
  const toggleSection = (title) => {
    setExpandedSections(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'in_progress':
        return 'In Progress';
      case 'not_started':
        return 'Not Started';
      default:
        return 'Unknown';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <SquareCheckBig size={18} />;
      case 'in_progress':
        return <Timer size={18} />;
      case 'not_started':
        return <TimerOff size={18}/>;
      default:
        return <TimerOff size={18} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'not_started':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateProgress = (heading) => {
    const totalTasks = heading.sub_headings.length +1;
    const completed = heading.sub_headings.filter(
      (s) => s.sub_heading_status === 'completed'
    ).length + (heading.heading_task_status === 'completed' ? 1 : 0);
    return Math.round((completed / totalTasks) * 100);
  };

  const handleTaskStatusChange = (heading)=>{
    const newStatus = heading.heading_task_status === 'completed' ? 'not_started' : 'completed';
    handleStatusChange(heading.heading, null, newStatus, "task");
  }


  return (
    <div className="space-y-3 md:space-y-4">
      {roadmap?.map((heading, index) => {
        const Icon = icons[index % icons.length];
        const progress = calculateProgress(heading);
        const skillStatus = getSkillStatus(heading);

        return (
          <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div
              className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 md:p-4 cursor-pointer ${
                expandedSections[heading.heading] ? 'bg-[#F0F7FF] border-t' : 'bg-white border'
              } border-[#BABABA]/50 rounded-md`}
              onClick={() => toggleSection(heading.heading)}
            >
              <div className={`flex items-center space-x-2 md:space-x-3 mb-2 sm:mb-0`}>
                <span className='text-[#2870FF]'>{Icon}</span>
                <h3 className="font-bold text-sm md:text-base text-gray-800 truncate">{heading.heading}</h3>
              </div>

              <div className="flex flex-wrap w-full sm:w-auto items-center justify-between sm:justify-end gap-2 sm:gap-4">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                    skillStatus
                  )}`}
                >
                  {getStatusLabel(skillStatus)}
                </span>

                <div className="flex items-center space-x-2 sm:space-x-4">
                  <div className="w-16 sm:w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full bg-primary`}
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <span className="font-bold text-xs md:text-sm text-primary">{progress}%</span>
                </div>

                <div className="ml-auto sm:ml-0">
                  {expandedSections[heading.heading] ? (
                    <ChevronUp className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                  )}
                </div>
              </div>
            </div>

            <AnimatePresence initial={false}>
              {expandedSections[heading.heading] && (
                <motion.div
                  key={heading.heading}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="md:p-4 gap-x-2 bg-white grid grid-cols-1 sm:grid-cols-2 mx-2 sm:mx-8 md:mx-20 items-center">
                    {heading.sub_headings.map((sub, idx) => (
                      <div
                        key={idx}
                        className="flex items-center my-2 justify-between gap-1 md:gap-2 bg-[#F0F7FF] text-[#2870FF] w-full rounded-md cursor-pointer px-2 md:px-4 py-1 md:py-2 text-xs md:text-sm"
                        onClick={() => {
                          setSelectedHeading(heading.heading);
                          setSelectedSubHeading(sub.heading);
                        }}
                      >
                        <div className="flex items-center gap-1 md:gap-2">
                          {subHeadingIcons[idx % subHeadingIcons.length]}
                          <h3 className="font-medium truncate">{sub.heading}</h3>
                        </div>
                        <span className={`flex-shrink-0 ${getStatusColor(sub.sub_heading_status)}`}>
                          {getStatusIcon(sub.sub_heading_status)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="p-3 md:p-4 border-t border-dashed border-yellow-300 rounded-lg bg-yellow-50 hover:bg-blue-100 transition-colors mx-2 sm:mx-4 mb-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className='flex items-center space-x-2'>
                        <h4 className="font-medium text-sm md:text-base text-blue-900">Comprehensive Task</h4>
                      </div>
                      <button 
                        className={`flex items-center justify-center space-x-2 px-2 py-1 rounded-md smooth gap-2 text-xs ${
                          heading.heading_task_status === 'completed' 
                            ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                            : 'bg-red-100 text-red-600 hover:bg-red-200'
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTaskStatusChange(heading);
                        }}
                      >
                        {heading.heading_task_status === 'not_started' ? `Mark as Complete` : 'Completed'} 
                        {heading.heading_task_status === 'not_started' && <Check size={12} />}
                      </button>
                    </div>
                    <p className="mt-2 text-xs md:text-sm text-blue-900">{heading.comprehensive_task}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
};

export default SkillsList;