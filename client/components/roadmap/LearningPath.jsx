import { useRef, useEffect } from 'react';
import RunningPerson from '../icons/RunningPerson';

const LearningPath = ({roadmap}) => {
  const scrollContainerRef = useRef(null);
  const currentSectionRef = useRef(null);

  const roadmapWithInterleavedItems = Array.from({ length: roadmap.length * 2 });
  const topCols = [0,4,8,12,16,20,24,28];
  const bottomCols = [3,7,11,15,19];

  const getFirstIncompleteSection = () => {
    for (let i = 0; i < roadmap.length; i++) {
      const section = roadmap[i];
      if (section.sub_headings.some(subHeading => subHeading.sub_heading_status !== "completed")) {
        return i;
      }
    }
    return roadmap.length - 1;
  };

  const currentSectionIndex = getFirstIncompleteSection(); 
  
  useEffect(() => {
    // Auto scroll to current section when component mounts
    if (currentSectionRef.current && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const element = currentSectionRef.current;
      
      // Calculate scroll position (center the element in the viewport)
      const scrollLeft = element.offsetLeft - (container.clientWidth / 2) + (element.clientWidth / 2);
      
      // Scroll smoothly to the element
      container.scrollTo({
        left: Math.max(0, scrollLeft),
        behavior: 'smooth'
      });
    }
  }, []);


  return (
    <div className="w-full py-6 px-4 bg-white rounded-xl h-fit">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">
        Staying Consistent Builds Mastery
      </h2>
      <p className="text-gray-600 mb-8 text-center">
        Here's your personalized journey toward becoming a skilled developer — keep learning, keep building.
      </p>

      {/* Timeline container with horizontal scroll */}
      <div 
        className="relative w-full overflow-x-auto pb-12"
        ref={scrollContainerRef}
      >
        <div className="min-w-max">
          <div className="grid grid-rows-[auto_100px_100px_auto] px-8">
            {/* Row 1 - Top cards (odd-indexed sections) */}
            <div className="grid grid-cols-10 grid-rows-1">
              {roadmap.map((section, idx) => (
                idx % 2 === 0 ? (
                  <div 
                    key={`top-${idx}`} 
                    className="relative flex justify-center"
                    ref={idx === currentSectionIndex ? currentSectionRef : null}
                  >
                    <div className={`w-64 border rounded-lg border-primary/70 shadow-sm shadow-primary/30 p-4 bg-white`}>
                      <h3 className="font-semibold text-gray-800 mb-3">{idx+1}.&nbsp;{section.heading}</h3>
                      <ul className="space-y-2">
                        {section.sub_headings.map((subHeading, subIdx) => (
                          <li key={`${section.heading}-sub-${subIdx}`} className="flex items-start">
                            <span className={`inline-block w-2 h-2 rounded-full mt-1.5 mr-2 ${
                              subHeading.sub_heading_status === "completed" ? "bg-green-500" : "bg-gray-300"
                            }`}></span>
                            <span className="text-sm text-gray-600">{subHeading.heading}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div key={`top-empty-${idx}`} className="col-span-1"></div>
                )
              ))}
            </div>
            
            {/* Row 2 - Vertical connectors for top cards */}
            <div className="grid grid-cols-10 gap-8 border-b ">
              {roadmapWithInterleavedItems.map((_, idx) => (
                (idx % 2 === 0) && (
                  <div key={`connector-top-${idx}`} className={`relative flex justify-center gap-2`}>
                    <div className={`w-1/2 relative ${topCols.includes(idx) ? 'border-r-2 border-primary' : ''} ${currentSectionIndex <=idx ? 'border-primary' : ''}`}>
                    <div className='absolute bottom-0 -right-10'>
                      {(currentSectionIndex%2===0 && (idx-currentSectionIndex*2<=1 && idx-currentSectionIndex*2>=0)) && (
                        <RunningPerson size='32'/>
                      )}
                    </div>
                      {topCols.includes(idx) && <div className="absolute -bottom-2 -right-2 w-4 h-4 rounded-full bg-purple-500 border-2 border-white"></div>}
                    </div>
                    <div className='w-1/2'></div>
                  </div>
                )
                ))}
            </div>
            
            {/* Row 3 - Vertical connectors for bottom cards */}
            <div className="grid grid-cols-10 gap-8">
              {roadmapWithInterleavedItems.map((_, idx) => (
                  (idx % 2 === 1) && (
                  <div key={`connector-top-${idx}`} className="relative flex justify-center">
                    <div className={`w-1/2 relative ${bottomCols.includes(idx) ? 'border-r-2 border-primary' : ''} ${currentSectionIndex <=idx ? 'border-primary' : ''}`}>
                    <div className='absolute top-0 -right-10'>
                      {(currentSectionIndex%2 === 1 && (idx-currentSectionIndex*2<=1 && idx-currentSectionIndex*2>=0)) && (
                        <RunningPerson size='32'/>
                      )}
                    </div>
                    {bottomCols.includes(idx) && <div className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-purple-500 border-2 border-white"></div>}
                    </div>
                    <div className='w-1/2'></div>
                  </div>
                )
              ))}
            </div>
            

            {/* Row 4,5- Bottom cards (even-indexed sections) */}
            <div className="grid grid-cols-10 grid-rows-1">
              {roadmap.map((section, idx) => (
                idx % 2 === 1 ? (
                  <div 
                    key={`bottom-${idx}`} 
                    className="relative flex justify-center"
                    ref={idx === currentSectionIndex ? currentSectionRef : null}
                  >
                    <div className={`w-64 border rounded-lg border-primary/70 shadow-sm shadow-primary/30 p-4 bg-white`}>
                      <h3 className="font-semibold text-gray-800 mb-3">{idx+1}.&nbsp;{section.heading}</h3>
                      <ul className="space-y-2">
                        {section.sub_headings.map((subHeading, subIdx) => (
                          <li key={`${section.heading}-sub-${subIdx}`} className="flex items-start">
                            <span className={`inline-block w-2 h-2 rounded-full mt-1.5 mr-2 ${
                              subHeading.sub_heading_task_status === "completed" ? "bg-green-500" : "bg-gray-300"
                            }`}></span>
                            <span className="text-sm text-gray-600">{subHeading.heading}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div key={`bottom-empty-${idx}`} className="col-span-1"></div>
                )
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningPath;