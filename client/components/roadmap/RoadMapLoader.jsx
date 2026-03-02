import React, { useState, useEffect } from 'react';

export const RoadMapLoader = ({ skill }) => {
  const [loadingMessage, setLoadingMessage] = useState('Analyzing your request...');

  // Array of loading messages to cycle through
  const loadingMessages = [
    `Analyzing "${skill}" skill requirements...`,
    `Identifying key learning milestones...`,
    `Organizing knowledge prerequisites...`,
    `Structuring learning path for "${skill}"...`,
    `Finalizing your personalized roadmap...`,
  ];

  // Change the message every 3 seconds
  useEffect(() => {
    let currentIndex = 0;

    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % loadingMessages.length;
      setLoadingMessage(loadingMessages[currentIndex]);
    }, 3000);

    return () => clearInterval(interval);
  }, [skill, loadingMessages]);

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center py-12">
      <div className="relative">
        {/* Pulsing circle animation */}
        <div className="absolute inset-0 rounded-full bg-blue-400 opacity-30 animate-ping"></div>

        {/* Brain icon */}
        <div className="relative w-20 h-20 flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600 rounded-full">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
      </div>

      <h3 className="mt-6 text-xl font-semibold text-gray-800">{loadingMessage}</h3>

      <div className="flex space-x-2 mt-4">
        <div className="w-3 h-3 rounded-full bg-blue-600 animate-bounce"></div>
        <div className="w-3 h-3 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        <div className="w-3 h-3 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
      </div>
    </div>
  );
};
