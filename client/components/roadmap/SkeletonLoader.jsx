import { useState, useEffect } from 'react';

const SkeletonLoader = () => {
  // We'll no longer need loadingPhase if messages are based on progress
  // const [loadingPhase, setLoadingPhase] = useState(0);
  const [progress, setProgress] = useState(0);
  const [currentMessage, setCurrentMessage] = useState("Initializing loader..."); // New state for current message

  // Define loading messages based on progress ranges
  const getMessageByProgress = (currentProgress) => {
    if (currentProgress < 10) return "Initializing generation process...";
    if (currentProgress < 30) return "Analyzing topic content and keywords...";
    if (currentProgress < 50) return "Searching for relevant articles and videos...";
    if (currentProgress < 70) return "Curating and organizing learning resources...";
    if (currentProgress < 90) return "Generating structured roadmap sections...";
    if (currentProgress >= 90) return "Finalizing content. Almost ready...";
    return "Loading..."; // Fallback
  };

  // Progress bar animation
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + 0.5; // Increment progress gradually
        return newProgress > 95 ? 95 : newProgress;
      });
    }, 100); // Update every 100ms

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setCurrentMessage(getMessageByProgress(progress));
  }, [progress]); // Re-run when progress changes

  // Pulse effect elements with different timings
  const PulseElement = ({ width, delay, height = "h-4" }) => (
    <div
      className={`${height} bg-gray-200 rounded ${width} animate-pulse`}
      style={{
        animationDelay: `${delay}ms`,
        animationDuration: '1.5s'
      }}
    ></div>
  );

  return (
    <div className="space-y-6 relative">
      {/* Status message with typing effect */}
      <div className="sticky top-0 bg-white p-3 rounded-lg shadow-md z-10 mb-6">
        <div className="flex items-center space-x-3">
          <div className="relative w-6 h-6">
            <div className="absolute inset-0 border-t-2 border-blue-500 border-solid rounded-full animate-spin"></div>
            <div className="absolute inset-1 border-r-2 border-indigo-400 border-solid rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}></div>
          </div>
          <div className="font-medium text-gray-700 h-6 flex items-center">
            {currentMessage} {/* Use the dynamically updated message */}
          </div>
        </div>

        {/* Fancy progress bar */}
        <div className="mt-3 h-1 w-full bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500 rounded-full"
            style={{
              width: `${progress}%`,
              transition: 'width 0.3s ease-out',
              backgroundSize: '200% 100%',
              animation: 'gradientShift 2s ease infinite'
            }}
          ></div>
        </div>
      </div>

      {/* Summary with staggered animation */}
      <div className="space-y-2">
        <PulseElement width="w-1/2" delay={0} />
        <PulseElement width="w-3/4" delay={100} />
        <PulseElement width="w-2/3" delay={200} />
      </div>

      {/* Articles Section */}
      <div>
        <div className="flex items-center space-x-2 mb-4">
          <div className="h-5 w-5 rounded bg-indigo-100 flex items-center justify-center">
            <div className="h-3 w-3 rounded-sm bg-indigo-400 animate-pulse"></div>
          </div>
          <div className="p-4 bg-indigo-100 text-indigo-600 rounded-md px-3 py-1 w-1/4">Articles</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={`article-${i}`}
              className="bg-gray-50 border border-gray-100 p-4 rounded-lg space-y-3 hover:shadow-md transition-all duration-300"
              style={{
                animationDelay: `${i * 150}ms`,
                transform: 'translateY(0)',
                animation: 'pulseAndShift 2s infinite',
                animationDelay: `${i * 200}ms`
              }}
            >
              <PulseElement width={i % 2 === 0 ? "w-2/3" : "w-3/4"} delay={i * 100} height="h-4" />
              <PulseElement width="w-1/2" delay={i * 100 + 50} height="h-3" />
              <div className="flex items-center space-x-2 pt-2">
                <div className="h-3 w-3 rounded-full bg-blue-200"></div>
                <PulseElement width="w-1/4" delay={i * 100 + 100} height="h-3" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Videos Section with thumbnail placeholders */}
      <div>
        <div className="flex items-center space-x-2 mb-4">
          <div className="h-5 w-5 rounded bg-red-100 flex items-center justify-center">
            <div className="h-3 w-3 rounded-sm bg-red-400 animate-pulse"></div>
          </div>
          <div className="p-4 bg-red-100 text-red-600 rounded-md px-3 py-1 w-1/4">Videos</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={`video-${i}`}
              className="bg-gray-50 border border-gray-100 rounded-lg overflow-hidden hover:shadow-md transition-all duration-300"
              style={{ animation: 'pulseAndShift 2s infinite', animationDelay: `${i * 300}ms` }}
            >
              <div className="h-32 bg-gray-200 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-300 animate-pulse"
                  style={{ animationDuration: '2s', animationDelay: `${i * 200}ms` }}></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-white bg-opacity-30 flex items-center justify-center">
                    <div className="w-0 h-0 border-t-8 border-t-transparent border-l-12 border-l-red-500 border-b-8 border-b-transparent ml-1"></div>
                  </div>
                </div>
              </div>
              <div className="p-3 space-y-2">
                <PulseElement width="w-5/6" delay={i * 100} height="h-4" />
                <div className="flex items-center space-x-2">
                  <div className="h-3 w-3 rounded-full bg-red-200"></div>
                  <PulseElement width="w-1/3" delay={i * 100 + 150} height="h-3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Documentation Section */}
      <div>
        <div className="flex items-center space-x-2 mb-4">
          <div className="h-5 w-5 rounded bg-green-100 flex items-center justify-center">
            <div className="h-3 w-3 rounded-sm bg-green-400 animate-pulse"></div>
          </div>
          <div className="p-4 bg-green-100 text-green-600 rounded-md px-3 py-1 w-fit">Documentation</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={`doc-${i}`}
              className="bg-gray-50 border border-gray-100 p-4 rounded-lg space-y-2 hover:shadow-md transition-all duration-300"
              style={{ animation: 'pulseAndShift 2s infinite', animationDelay: `${i * 250}ms` }}
            >
              <div className="flex items-center space-x-2">
                <div className="h-4 w-4 rounded bg-green-200"></div>
                <PulseElement width={i % 2 === 0 ? "w-3/5" : "w-2/3"} delay={i * 150} height="h-4" />
              </div>
              <PulseElement width="w-5/6" delay={i * 150 + 100} height="h-3" />
            </div>
          ))}
        </div>
      </div>

      {/* Courses Section */}
      <div>
        <div className="flex items-center space-x-2 mb-4">
          <div className="h-5 w-5 rounded bg-yellow-100 flex items-center justify-center">
            <div className="h-3 w-3 rounded-sm bg-yellow-400 animate-pulse"></div>
          </div>
          <div className="p-4 bg-yellow-100 text-yellow-600 rounded-md px-3 py-1 w-1/4">Courses</div>
        </div>

        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={`course-${i}`}
              className="bg-gray-50 border border-gray-100 p-4 rounded-lg hover:shadow-md transition-all duration-300"
              style={{ animation: 'pulseAndShift 2s infinite', animationDelay: `${i * 350}ms` }}
            >
              <div className="flex justify-between items-start">
                <div className="space-y-3 w-3/4">
                  <PulseElement width="w-5/6" delay={i * 120} height="h-5" />
                  <div className="flex space-x-2">
                    <div className="px-2 h-6 rounded bg-gray-100 flex items-center">
                      <PulseElement width="w-12" delay={i * 120 + 200} height="h-3" />
                    </div>
                    <div className="px-2 h-6 rounded bg-gray-100 flex items-center">
                      <PulseElement width="w-16" delay={i * 120 + 300} height="h-3" />
                    </div>
                  </div>
                </div>
                <div className="h-9 w-20 bg-gray-100 rounded-md flex items-center justify-center">
                  <PulseElement width="w-12" delay={i * 120 + 400} height="h-3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx global>{`
        @keyframes pulseAndShift {
          0%, 100% {
            transform: translateY(0);
            opacity: 0.8;
          }
          50% {
            transform: translateY(-2px);
            opacity: 1;
          }
        }

        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
};

export default SkeletonLoader;