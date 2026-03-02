import { useATSStore } from "@/store/atsStore";
import { ATSScoreCard } from "./ATSScoreCard";

const BackDropWrapper = () => {
  const {score} = useATSStore()

  return (
    <div className="relative h-screen w-full max-w-[342px] mx-auto overflow-hidden">
      {/* Background SVG */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 342 832"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <path
            d="M30.6562 1.10938L1 34.7482V306.513L17.1288 320.038V507.213L1.30878 525.656L1.30878 796.356L31.1765 831.109H85.7827L99.3337 816.209H254.378L269.506 831.109L314.211 831.109L340.691 796.356V302.828L341 272.729V143.646V113.237V34.7482L313.691 1.10938H247.06L235.635 12.5903H157.822L146.397 1.10938H30.6562Z"
            fill="white"
            stroke="#E6E6E6"
          />
        </svg>
      </div>

      {/* Content area */}
      <div className="relative z-20 h-full py-10 px-6">
        <ATSScoreCard
          scoreData={score}
          issues={16}
        />
      </div>
    </div>
  );
};

// components/LeftPanel.jsx
export const LeftPanel = () => {
  return (
    <div className="lg:sticky lg:top-6">
      <BackDropWrapper />
    </div>
  );
};
