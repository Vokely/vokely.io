import { ChevronRight } from 'lucide-react';
import { ScoreGauge } from './ScoreGauge';

export const ATSScoreCard = ({ scoreData }) => {
  const breakdown = scoreData?.breakdown || {};

  const scores = [
    {
      name: "Essentials",
      score: breakdown.resume_essentials?.score ?? "—",
    },
    {
      name: "Grammar & Format",
      score: breakdown.basic_analysis?.score ?? "—",
    },
    {
      name: "JD Alignment",
      score: breakdown.jd_analysis?.score ?? "—",
    },
  ];

  return (
    <div className="flex flex-col justify-between rounded-xl h-full w-full max-w-sm mx-auto">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">ATS Score</h2>

        <ScoreGauge
          score={scoreData?.total_score ?? 0}
          maxScore={100}
        />

        <div className="space-y-3 my-8 border-t-2 border-gray-100">
          {scores.map((item, i) => (
            <div className="flex items-center justify-between py-3 px-4" key={i}>
              <span className="text-gray-700 font-medium">{item.name}</span>
              <div className="flex items-center space-x-2">
                <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                  {typeof item.score === "number" ? item.score : "—"}
                </span>
                <ChevronRight size={16} className="text-gray-400" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <a href="/ai-resume-builder">
        <button 
          className="w-full bg-primary text-white py-3 px-4 rounded-lg font-medium hover:bg-hover transition-colors"
        >
          Get an ATS Resume
        </button>
      </a>
    </div>
  );
};
