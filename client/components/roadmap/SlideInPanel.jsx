'use client';

import { motion } from 'framer-motion';
import { ChevronDown, X, FileText, Book, Video, Copy, Check } from 'lucide-react';
import SkeletonLoader from './SkeletonLoader';
import { useState } from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter/dist/esm/default-highlight';
import { AnimatePresence } from 'framer-motion';
const STATUS_OPTIONS = ["Not Started", "In Progress","Completed"];

const SlideInPanel = ({ selectedTopic, onClose, isGenerating,handleStatusChange,selectedHeading }) => { 
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [status, setStatus] = useState(selectedTopic?.sub_heading_status);
  const [copying, setCopying] = useState({});
  const [thumbnailError, setThumbnailError] = useState({});
  
  // Format status for display
  const formatStatus = (status) => {
    return status.replace(/_/g, ' ').split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };
  
  // Get status styling
  const getStatusStyling = (statusValue) => {
    switch(statusValue) {
      case 'completed':
        return { bg: 'bg-green-100', text: 'text-green-800' };
      case 'in_progress':
        return { bg: 'bg-yellow-100', text: 'text-yellow-800' };
      case 'not_started':
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-800' };
    }
  };
  
  const handleStatusSelect = (newStatus) => {
    if(status===newStatus.toLowerCase().replace(' ', '_')){
        setDropdownOpen(false)
        return
    } 
    setStatus(newStatus.toLowerCase().replace(' ', '_'));
    handleStatusChange(selectedHeading,selectedTopic.heading ,newStatus.toLowerCase().replace(' ', '_'), "content");
    setDropdownOpen(false)
  };
  
  // Extract YouTube video ID from URL
  const getYoutubeVideoId = (url) => {
    const regex = /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };
  
  // Handle copy to clipboard
  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopying(prev => ({ ...prev, [key]: true }));
      setTimeout(() => {
        setCopying(prev => ({ ...prev, [key]: false }));
      }, 2000);
    });
  };
  
  // Handle resource click
  const handleResourceClick = (url) => {
    window.open(url, '_blank');
  };

  return (
    <motion.div
      className="fixed top-0 right-0 bottom-0 w-full sm:w-96 md:w-[70vw] bg-white shadow-xl z-50 overflow-y-auto"
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
    >
      {/* Modal Header */}
      <div className="bg-white px-3 sm:px-6 py-3 sm:py-4 flex justify-between items-center sticky top-0 z-10 border-b">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 truncate pr-2">
          {selectedTopic?.heading}
        </h2>
        <div className="flex items-center space-x-2 relative shrink-0">
          {/* Dropdown Trigger */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setDropdownOpen(!dropdownOpen);
            }}
            className={`px-2 sm:px-3 py-1 sm:py-1.5 ${getStatusStyling(status).bg} ${getStatusStyling(status).text} rounded-full text-xs sm:text-sm font-medium flex items-center whitespace-nowrap`}
          >
            {formatStatus(status)}
            <ChevronDown className="ml-1 h-3 w-3 sm:h-4 sm:w-4" />
          </button>

          {/* Dropdown Menu with Animation */}
          <AnimatePresence>
            {dropdownOpen && (
              <motion.div
                key="dropdown"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full mt-2 right-0 w-36 sm:w-48 bg-white shadow-md border rounded-md z-20"
              >
                {STATUS_OPTIONS.map((option) => {
                  const { text } = getStatusStyling(option);
                  return (
                    <button
                      key={option}
                      onClick={() => handleStatusSelect(option)}
                      className={`w-full text-left px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm ${text} hover:bg-gray-100`}
                    >
                      {formatStatus(option)}
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Close Button */}
          <button
            type="button"
            className="bg-red-100 p-1.5 sm:p-2 rounded-full focus:outline-none"
            onClick={onClose}
          >
            <span className="sr-only">Close</span>
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Modal Content */}
      <div className="px-3 sm:px-6 py-4 sm:py-5 space-y-4 sm:space-y-6">
        {isGenerating ? (
          <SkeletonLoader/>
        ) : (
          <>                  
            {selectedTopic?.your_task && (() => {
              const style = getStatusStyling(selectedTopic.sub_heading_task_status);
              return (
                <div className="bg-blue-50 rounded-lg p-3 sm:p-4 border border-blue-100">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <h3 className="text-base sm:text-lg font-semibold text-blue-700">Your Task</h3>
                    <button 
                      className={`flex items-center justify-center space-x-1 px-2 py-1 rounded-md smooth gap-1 sm:gap-2 text-xs ${
                        selectedTopic.sub_heading_task_status === 'completed' 
                          ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                          : 'bg-red-100 text-red-600 hover:bg-red-200'
                      }`}
                      onClick={() => handleStatusChange(
                        selectedHeading,
                        selectedTopic.heading, 
                        selectedTopic.sub_heading_task_status === 'completed' ? 'not_started' : 'completed', 
                        "task"
                      )}
                    >
                      {selectedTopic.sub_heading_task_status === 'not_started' ? `Mark as Complete` : 'Completed'} 
                      {selectedTopic.sub_heading_task_status === 'not_started' && <Check size={12} />}
                    </button>
                  </div>
                  <p className="text-xs sm:text-sm text-blue-700 mt-2">{selectedTopic.your_task}</p>
                </div>
              );
            })()}

            {/* Dynamic Summary Section */}
            {selectedTopic?.summary && Array.isArray(selectedTopic.summary) && selectedTopic.summary.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 shadow-sm">
                {selectedTopic.summary.map((item, index) => {
                  switch(item.type) {
                    case 'heading':
                      return (
                        <h3 key={index} className="text-base sm:text-lg font-semibold text-gray-800 mb-2 sm:mb-3">
                          {item.content}
                        </h3>
                      );
                    case 'para':
                      return (
                        <p key={index} className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
                          {item.content}
                        </p>
                      );
                    case 'list':
                      return (
                        <ul key={index} className="list-disc pl-4 sm:pl-5 mb-3 sm:mb-4 text-xs sm:text-sm text-gray-600 space-y-1">
                          {item.content.map((listItem, listIndex) => (
                            <li key={listIndex}>{listItem}</li>
                          ))}
                        </ul>
                      );
                    case 'codeblock':
                      return (
                        <div key={index} className="mb-3 sm:mb-4">
                          <div className="bg-gray-800 text-gray-100 rounded-t-md px-2 sm:px-3 py-1 text-xs font-mono">
                            {item.language || 'code'}
                          </div>
                          <div className="bg-gray-900 rounded-b-md overflow-x-auto">
                            <SyntaxHighlighter 
                              language={item.language || 'javascript'} 
                              customStyle={{
                                margin: 0,
                                padding: '8px 12px',
                                borderRadius: '0 0 6px 6px',
                                fontSize: '0.75rem'
                              }}
                              codeTagProps={{
                                style: {
                                  fontSize: '0.75rem',
                                  lineHeight: '1.4'
                                }
                              }}
                            >
                              {item.content}
                            </SyntaxHighlighter>
                          </div>
                        </div>
                      );
                    default:
                      return null;
                  }
                })}
              </div>
            )}
            
            {/* Fallback for string summary (backwards compatibility) */}
            {selectedTopic?.summary && typeof selectedTopic.summary === 'string' && selectedTopic.summary.length > 0 && (
              <p className="text-xs sm:text-sm text-gray-600">{selectedTopic.summary}</p>
            )}

            {/* Blogs Section */}
            {selectedTopic?.links?.blogs && selectedTopic.links.blogs.length > 0 && (
              <div>
                <h4 className="text-sm sm:text-md font-medium text-gray-700 mb-2 sm:mb-4">Articles & Blog Posts</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3">
                  {selectedTopic.links.blogs.map((link, index) => {
                    // Extract domain for display
                    const url = new URL(link);
                    const domain = url.hostname.replace('www.', '');
                    const title = `${domain} Article ${index + 1}`;
                    const key = `blog-${index}`;
                    
                    return (
                      <motion.div
                        key={link}
                        className="bg-blue-50 rounded-lg p-2 sm:p-3 hover:shadow-md transition-shadow cursor-pointer"
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                        onClick={() => handleResourceClick(link)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start">
                            <div className="bg-blue-100 p-1.5 sm:p-2 rounded-md mr-2 sm:mr-3 text-blue-600">
                              <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-blue-600 text-xs sm:text-sm font-medium">
                                {title}
                              </p>
                              <p className="text-xs text-gray-500 mt-0.5 sm:mt-1 truncate max-w-[90px] sm:max-w-[150px]">{link}</p>
                            </div>
                          </div>
                          <button 
                            className="p-1 sm:p-1.5 bg-blue-100 rounded-md text-blue-600 hover:bg-blue-200 flex-shrink-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopy(link, key);
                            }}
                          >
                            {copying[key] ? <Check className="w-3 h-3 sm:w-4 sm:h-4" /> : <Copy className="w-3 h-3 sm:w-4 sm:h-4" />}
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Documentation Section */}
            {selectedTopic?.links?.documentations && selectedTopic.links.documentations.length > 0 && (
              <div>
                <h4 className="text-sm sm:text-md font-medium text-gray-700 mb-2 sm:mb-4">Documentation</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3">
                  {selectedTopic.links.documentations.map((link, index) => {
                    // Extract domain for display
                    const url = new URL(link);
                    const domain = url.hostname.replace('www.', '');
                    const title = `${domain} Documentation`;
                    const key = `doc-${index}`;
                    
                    return (
                      <motion.div
                        key={link}
                        className="bg-purple-50 rounded-lg p-2 sm:p-3 hover:shadow-md transition-shadow cursor-pointer"
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                        onClick={() => handleResourceClick(link)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start">
                            <div className="bg-purple-100 p-1.5 sm:p-2 rounded-md mr-2 sm:mr-3 text-purple-600">
                              <Book className="w-4 h-4 sm:w-5 sm:h-5" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-purple-600 text-xs sm:text-sm font-medium">
                                {title}
                              </p>
                              <p className="text-xs text-gray-500 mt-0.5 sm:mt-1 truncate max-w-[90px] sm:max-w-[150px]">{link}</p>
                            </div>
                          </div>
                          <button 
                            className="p-1 sm:p-1.5 bg-purple-100 rounded-md text-purple-600 hover:bg-purple-200 flex-shrink-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopy(link, key);
                            }}
                          >
                            {copying[key] ? <Check className="w-3 h-3 sm:w-4 sm:h-4" /> : <Copy className="w-3 h-3 sm:w-4 sm:h-4" />}
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Courses Section */}
            {selectedTopic?.links?.courses && selectedTopic.links.courses.length > 0 && (
              <div>
                <h4 className="text-sm sm:text-md font-medium text-gray-700 mb-2 sm:mb-4">Courses</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3">
                  {selectedTopic.links.courses.map((link, index) => {
                    // Extract domain for display
                    const url = new URL(link);
                    const domain = url.hostname.replace('www.', '');
                    const title = `${domain} Course`;
                    const key = `course-${index}`;
                    
                    return (
                      <motion.div
                        key={link}
                        className="bg-green-50 rounded-lg p-2 sm:p-3 hover:shadow-md transition-shadow cursor-pointer"
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                        onClick={() => handleResourceClick(link)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start">
                            <div className="bg-green-100 p-1.5 sm:p-2 rounded-md mr-2 sm:mr-3 text-green-600">
                              <Book className="w-4 h-4 sm:w-5 sm:h-5" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-green-600 text-xs sm:text-sm font-medium">
                                {title}
                              </p>
                              <p className="text-xs text-gray-500 mt-0.5 sm:mt-1 truncate max-w-[90px] sm:max-w-[150px]">{link}</p>
                            </div>
                          </div>
                          <button 
                            className="p-1 sm:p-1.5 bg-green-100 rounded-md text-green-600 hover:bg-green-200 flex-shrink-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopy(link, key);
                            }}
                          >
                            {copying[key] ? <Check className="w-3 h-3 sm:w-4 sm:h-4" /> : <Copy className="w-3 h-3 sm:w-4 sm:h-4" />}
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* YouTube Videos Section */}
            {selectedTopic?.links?.youtube_videos && selectedTopic.links.youtube_videos.length > 0 && (
              <div>
                <h4 className="text-sm sm:text-md font-medium text-gray-700 mb-2 sm:mb-4">YouTube Tutorials</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  {selectedTopic.links.youtube_videos.map((link, index) => {
                    const videoId = getYoutubeVideoId(link);
                    const key = `video-${index}`;
                    
                    if (!videoId) return null;
                    
                    return (
                      <motion.div
                        key={link}
                        className="bg-red-50 rounded-lg p-2 sm:p-3 hover:shadow-md transition-shadow"
                        whileHover={{ scale: 1.01 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                      >
                        <div className="space-y-2 sm:space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center">
                              <div className="bg-red-100 p-1.5 sm:p-2 rounded-md mr-2 sm:mr-3 text-red-600">
                                <Video className="w-4 h-4 sm:w-5 sm:h-5" />
                              </div>
                              <div>
                                <p className="text-red-600 text-xs sm:text-sm font-medium cursor-pointer" 
                                   onClick={() => handleResourceClick(link)}>
                                  Tutorial-{index+1}
                                </p>
                              </div>
                            </div>
                            <button 
                              className="p-1 sm:p-1.5 bg-red-100 rounded-md text-red-600 hover:bg-red-200"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopy(link, key);
                              }}
                            >
                              {copying[key] ? <Check className="w-3 h-3 sm:w-4 sm:h-4" /> : <Copy className="w-3 h-3 sm:w-4 sm:h-4" />}
                            </button>
                          </div>
                          
                          <div className="relative rounded-lg overflow-hidden w-full pt-[56.25%] bg-red-100">
                            {/* Thumbnail fallback handling */}
                            {thumbnailError[videoId] ? (
                              <div className="absolute inset-0 flex items-center justify-center bg-red-100">
                                <div className="flex flex-col items-center justify-center">
                                  <Video className="w-10 h-10 sm:w-16 sm:h-16 text-red-400 mb-1 sm:mb-2" />
                                  <p className="text-xs sm:text-sm text-red-700">Click to watch video</p>
                                </div>
                              </div>
                            ) : (
                              <img
                                src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
                                alt="YouTube Video Thumbnail"
                                className="absolute inset-0 w-full h-full object-cover cursor-pointer"
                                onClick={() => handleResourceClick(link)}
                                onError={() => {
                                  // Try medium quality thumbnail if high quality fails
                                  const img = new Image();
                                  img.src = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
                                  img.onload = () => {
                                    // Update the src attribute of the image element
                                    document.querySelector(`[data-video-id="${videoId}"]`).src = img.src;
                                  };
                                  img.onerror = () => {
                                    // If medium quality also fails, use fallback
                                    setThumbnailError(prev => ({...prev, [videoId]: true}));
                                  };
                                }}
                                data-video-id={videoId}
                              />
                            )}
                            
                            {/* Play button overlay */}
                            <div 
                              className="absolute inset-0 flex items-center justify-center cursor-pointer"
                              onClick={() => handleResourceClick(link)}
                            >
                              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-600 bg-opacity-90 rounded-full flex items-center justify-center">
                                <div className="w-0 h-0 border-t-6 sm:border-t-8 border-t-transparent border-l-12 sm:border-l-16 border-l-white border-b-6 sm:border-b-8 border-b-transparent ml-1"></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}
            
            {/* Projects Section */}
            {selectedTopic?.links?.projects && selectedTopic.links.projects.length > 0 && (
              <div>
                <h4 className="text-sm sm:text-md font-medium text-gray-700 mb-2 sm:mb-4">Practice Projects</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3">
                  {selectedTopic.links.projects.map((link, index) => {
                    const url = new URL(link);
                    const domain = url.hostname.replace('www.', '');
                    const title = `Project ${index + 1}`;
                    const key = `project-${index}`;
                    
                    return (
                      <motion.div
                        key={link}
                        className="bg-amber-50 rounded-lg p-2 sm:p-3 hover:shadow-md transition-shadow cursor-pointer"
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                        onClick={() => handleResourceClick(link)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start">
                            <div className="bg-amber-100 p-1.5 sm:p-2 rounded-md mr-2 sm:mr-3 text-amber-600">
                              <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-amber-600 text-xs sm:text-sm font-medium">
                                {title}
                              </p>
                              <p className="text-xs text-gray-500 mt-0.5 sm:mt-1 truncate max-w-[90px] sm:max-w-[150px]">{link}</p>
                            </div>
                          </div>
                          <button 
                            className="p-1 sm:p-1.5 bg-amber-100 rounded-md text-amber-600 hover:bg-amber-200 flex-shrink-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopy(link, key);
                            }}
                          >
                            {copying[key] ? <Check className="w-3 h-3 sm:w-4 sm:h-4" /> : <Copy className="w-3 h-3 sm:w-4 sm:h-4" />}
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </motion.div>

  );
};

export default SlideInPanel;