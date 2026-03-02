import { EssentialsSection } from "./Essentials";
import { GrammarFormatSection } from "./GrammarCheck";
import { JDAlignmentSection } from "./JDAlignment";

const BackDropWrapper = () => {
  return (
    <div className="relative h-screen w-full max-w-6xl mx-auto overflow-hidden py-5">
      {/* Background SVG */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 971 832"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <path
            d="M940.269 1L970.07 34.6389V306.403L953.862 319.929V507.103L969.76 525.547V796.246L939.746 831H902.16L888.543 816.099H94.6753L79.4739 831L27.9222 830.999L1.31213 796.246L1.00189 34.6389L28.4451 1H67.993L79.4739 12.481H888.543L900.024 1H940.269Z"
            fill="white"
            stroke="#E6E6E6"
          />
        </svg>
      </div>

      {/* Scrollable content area */}
      <div className="relative z-20 h-full overflow-y-auto py-10 px-6 space-y-6">
        <JDAlignmentSection />
        <EssentialsSection />
        <GrammarFormatSection />
      </div>
    </div>
  );
};

export const RightPanel = () => {
  return <BackDropWrapper />;
};
