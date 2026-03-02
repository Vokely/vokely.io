import { ArrowUpRight } from "lucide-react";

const CurvedDiv = ({ children, className = '',flip=false }) => {
  return (
    <div className={`relative w-[200px] h-[200px] ${className}`}>
      {/* Background SVG */}
      <svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`absolute inset-0 w-full h-full ${flip ? 'scale-x-[-1]':''}`}
        preserveAspectRatio="none"
      >
        <path
          d="M0 20C0 8.95431 8.95431 0 20 0H180C191.046 0 200 8.9543 200 20V104.5C200 115.546 191.046 124.5 180 124.5H145.5C134.454 124.5 125.5 133.454 125.5 144.5V180C125.5 191.046 116.546 200 105.5 200H20C8.95431 200 0 191.046 0 180V20Z"
          fill="#F3F3F5"
        />
      </svg>

      {/* Foreground content */}
      <div className="relative z-10 w-full h-full p-6 flex flex-col justify-start text-center">
        {children}
      </div>
    </div>
  );
};

const BentoGridLayout = ({ sectionData }) => {
  const { stats, centerContent, bottomSection } = sectionData;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 lg:grid-rows-[200px_200px] gap-6">
      
      {/* Row 1 - First Card */}
      <div className="relative">
        <CurvedDiv className="rounded-2xl">
          <div className="text-4xl font-bold text-gray-900 mb-2">
            {stats.find(stat => stat.position === 'left')?.value}
          </div>
          <p className="text-gray-600 text-sm">
            {stats.find(stat => stat.position === 'left')?.label}
          </p>
        </CurvedDiv>
        <div className="absolute right-10 bottom-0 w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mt-4 mx-auto">
            <ArrowUpRight className="w-10 h-10 text-white" />
        </div>
      </div>


      {/* Row 1 - Second Card (Image) (spans 2 columns) */}
      <div className="lg:col-span-2 h-full rounded-xl p-4 flex items-center justify-center">
        {centerContent.topRow[0]?.type === 'image' ? (
          <img
            src={centerContent.topRow[0].src}
            alt={centerContent.topRow[0].alt}
            className="w-full h-full object-cover rounded-lg"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = centerContent.topRow[0].fallback;
            }}
          />
        ) : (
          <div className="w-full h-24 bg-gradient-to-br from-teal-200 to-teal-300 rounded-lg flex items-center justify-center">
            <div className="w-16 h-16 bg-white/50 rounded-lg flex items-center justify-center">
              <div className="w-8 h-10 bg-gray-400 rounded-sm"></div>
            </div>
          </div>
        )}
      </div>

      {/* Row 1 - Third Card */}
      <div className="rounded-xl p-6 border border-gray-200 flex flex-col justify-center">
        <h3 className="font-medium text-[#333747] text-lg leading-snug">
          {centerContent.topRow[1]?.title}
        </h3>
      </div>

      {/* Row 1 - Fourth Card */}
      <div className="relative">
        <CurvedDiv className="rounded-2xl" flip={true}>
          <div className="text-4xl font-bold text-gray-900 mb-2">
            {stats.find(stat => stat.position === 'right')?.value}
          </div>
          <p className="text-gray-600 text-sm">
            {stats.find(stat => stat.position === 'right')?.label}
          </p>
        </CurvedDiv>
        <div className="absolute left-0 bottom-0 w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mt-4 mx-auto">
            <ArrowUpRight className="w-10 h-10 text-white" />
        </div>
      </div>


      {/* Row 2 - First Card */}
      <div className="rounded-xl p-6 border border-gray-200 flex flex-col justify-center">
        <h3 className="font-medium text-[#333747] text-lg leading-snug">
          {centerContent.bottomRow[0]?.title}
        </h3>
      </div>

      {/* Row 2 - Second Card (Score) */}
      <div className="relative">
        <CurvedDiv className="rounded-2xl" flip={true}>
          <div className="text-4xl font-bold text-gray-900 mb-2">
            {stats.find(stat => stat.position === 'bottom')?.value}
          </div>
          <p className="text-gray-600 text-sm">
            {stats.find(stat => stat.position === 'bottom')?.label}
          </p>
        </CurvedDiv>
        <div className="absolute left-0 bottom-0 w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mt-4 mx-auto">
            <ArrowUpRight className="w-10 h-10 text-white" />
        </div>
      </div>

      {/* Row 2 - Third Card (Image) (spans 2 columns) */}
      <div className="lg:col-span-2 h-full rounded-xl p-4 flex items-center justify-center">
        {centerContent.bottomRow[1]?.type === 'image' ? (
          <img
            src={centerContent.bottomRow[1].src}
            alt={centerContent.bottomRow[1].alt}
            className="w-full h-full object-cover rounded-lg"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = centerContent.bottomRow[1].fallback;
            }}
          />
        ) : (
          <div className="w-full h-24 bg-gradient-to-br from-teal-200 to-teal-300 rounded-lg flex items-center justify-center">
            <div className="w-16 h-16 bg-white/50 rounded-lg flex items-center justify-center">
              <div className="w-8 h-10 bg-gray-400 rounded-sm"></div>
            </div>
          </div>
        )}
      </div>

      {/* Row 2 - Fourth Card */}
      <div className="rounded-xl p-6 border border-gray-200 flex flex-col justify-center">
        <h3 className="font-medium text-[#333747] text-lg mb-2">{bottomSection.title}</h3>
      </div>

    </div>
  );
};

export default BentoGridLayout;