'use client'
import { useState } from 'react';
import useIsMobile from '@/hooks/IsMobile';
import FeedbackComponent from '@/app/feedback/page';
import ShareButton from './ShareButton';
import LogoText from '../reusables/LogoText';
import { ArrowLeft, ArrowLeftToLine, ChevronsLeft } from 'lucide-react';

// Mock data based on the provided JSON
const mockInterviewData = {
    "conclusion": "You demonstrated strong technical skills and a proactive approach to system optimization and data consistency, which are valuable for this role.",
    "feedback": "You possess solid full-stack development experience with a focus on scalability and performance tuning. Your problem-solving skills are evident through your effective handling of cache invalidation and system bottlenecks. To further strengthen your profile, providing more context on teamwork and collaborative problem-solving would be beneficial.",
    "strengths": [
      "Strong technical expertise in building scalable applications with React, Node.js, and MongoDB, supported by concrete project examples.",
      "Proactive problem-solving in optimizing system performance and ensuring data accuracy, exemplified by your cache invalidation strategies."
    ],
    "areas_for_improvement": [
      "Expand on your teamwork experiences, especially how you collaborated with others to solve complex issues, to showcase your ability to work effectively in a team environment.",
      "Provide more details on your approach to communication during technical challenges to highlight your clarity and leadership in team settings."
    ],
    "confidence": 8.0,
    "communication": 8.0,
    "problem_solving": 8.5,
    "team_player": 6.5,
    "cultural_fit": 7.5,
    "technical_skills": 8.5,
    "leadership": 6.0,
    "jd_alignment_summary": {
      "Full-stack development experience": "Strong evidence demonstrated through multiple projects involving React, Node.js, and database optimization.",
      "Scalability and performance optimization": "Well addressed with specific strategies like load handling, caching, and uptime improvements.",
      "Team collaboration": "Limited direct examples provided; improving details on team interactions would be beneficial."
    },
    "performance_rating": 4.0
  }

// Radar chart component
const RadarChart = ({ scores }) => {
  const categories = Object.keys(scores);
  const values = Object.values(scores);
  const maxValue = 10;
  const isMobile = useIsMobile();
  const fontSize = isMobile ? '8' : '10';
  const [hoveredPoint, setHoveredPoint] = useState(false);

  const calculatePoint = (index, value) => {
    const angle = (Math.PI * 2 * index) / categories.length - Math.PI / 2;
    const radius = (value / maxValue) * 100;
    const xScale = 0.90; 
  
    return {
      x: 100 + radius * Math.cos(angle), 
      y: 100 + radius * Math.sin(angle) * xScale,          
    };
  };
  

  const points = values
    .map((value, index) => {
      const point = calculatePoint(index, value);
      return `${point.x},${point.y}`;
    })
    .join(' ');

  const levelValues = [2, 4, 6, 8, 10];

  // Custom stroke colors for each level (light to dark)
  const levelColors = ["#cbd5e1", "#94a3b8", "#64748b", "#475569", "#334155"];

  return (
    <div className="w-full h-64 relative flex items-center justify-center"             
    onMouseEnter={() => setHoveredPoint(true)}
    onMouseLeave={() => setHoveredPoint(false)}
    >
      <svg viewBox="0 0 200 200" className="w-full h-full">
        {/* Background polygons with custom stroke colors */}
        {levelValues.map((value, i) => {
          const hexPoints = categories
            .map((_, index) => {
              const point = calculatePoint(index, value);
              return `${point.x},${point.y}`;
            })
            .join(" ");

          return (
            <polygon
              key={i}
              points={hexPoints}
              fill="none"
              stroke={levelColors[i] || "#e2e8f0"} // fallback if colors run out
              strokeWidth="0.8"
            />
          );
        })}

        {/* Ring labels */}
        {levelValues.map((value, i) => {
          const point = calculatePoint(0, value);
          return (
            <text
              key={`label-${i}`}
              x={point.x}
              y={point.y - 4}
              fontSize="5"
              textAnchor="middle"
              fill="#94a3b8"
            >
              {value * 10}
            </text>
          );
        })}

        {/* Axes */}
        {categories.map((_, index) => {
          const point = calculatePoint(index, maxValue);
          return (
            <line
              key={index}
              x1="100"
              y1="100"
              x2={point.x}
              y2={point.y}
              stroke="#e2e8f0"
              strokeWidth="0.5"
            />
          );
        })}

        {/* Data polygon */}
        <polygon
          points={points}
          fill="rgba(139, 92, 246, 0.3)"
          stroke="#8b5cf6"
          strokeWidth="2"
        />

        {/* Data points with hover effect */}
        {values.map((value, index) => {
          const point = calculatePoint(index, value);
          return (
            <g key={index}>
              <circle 
                cx={point.x} 
                cy={point.y} 
                r="3" 
                fill="#8b5cf6" 
                className="cursor-pointer hover:stroke-white hover:stroke-2"
              />
              
              {/* Show tooltip when hovering */}
              {hoveredPoint && (
                <g>
                  <rect
                    x={point.x - 20}
                    y={point.y - 25}
                    width="40"
                    height="18"
                    rx="4"
                    fill="#1e293b"
                    fillOpacity="0.9"
                  />
                  <text
                    x={point.x}
                    y={point.y - 15}
                    textAnchor="middle"
                    fontSize="8"
                    fill="white"
                    dominantBaseline="middle"
                  >
                    {value * 10}
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* Category labels */}
        {categories.map((category, index) => {
          const point = calculatePoint(index, maxValue + 2.5);
          if(index === 3){
            point.y = point.y - 18;
          } 
          if(index === 0){
            point.y = point.y + 18;
          } 
          return (
            <text
              key={index}
              x={point.x}
              y={point.y}
              textAnchor="middle"
              fontSize={fontSize}
              fill="#64748b"
              dominantBaseline="middle"
            >
              {category}
            </text>
          );
        })}
      </svg>
    </div>
  );
};

const InterviewSummary = ({ 
  conclusion = mockInterviewData, 
  interview_id, 
  isPublic = false,
  candidateName = "John Doe", 
  jobDescription 
}) => {
  const [showFeedback, setShowFeedback] = useState(true); 
  if(conclusion == null) return(
    <div className="flex h-screen w-full items-center justify-center">
      <p className="text-lg font-medium text-gray-700">An error occurred while generating your feedback.</p>
    </div>
  );

  // Extract needed data
  const radarData = {
    "Technical Proficiency": conclusion.technical_skills,
    "Problem Solving": conclusion.problem_solving,
    "Communication": conclusion.communication,
    "Leadership": conclusion.leadership,
    "Cultural Fit": conclusion.cultural_fit,
    "Team Player": conclusion.team_player
  };

  // JD alignment data for the table
  const jdSummmary = conclusion.jd_alignment_summary
  const jdAlignmentData = Object.entries(jdSummmary).map(([area, suggestion]) => ({
    area,
    suggestion,
  }));

  return (
    <div className="bg-gray-50 h-fit w-full p-4 font-sans">
      {/* Feedback Modal */}
      {showFeedback && !isPublic && (
        <FeedbackComponent
          onClose={() => setShowFeedback(false)}
          title="How was your mock interview experience?"
          description="Help us improve our AI interviewer! Share your thoughts on the questions, feedback quality, and overall experience."
          moduleName="mock_interview"
          moduleId={interview_id}
        />
      )}

      {/* Header with logo and buttons */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
        <div className={`${isPublic ? 'absolute left-4 top-4 md:left-6 md:top-6 z-10':'flex flex-col items-center cursor pointer gap-5'}`}>
          <LogoText color='#342EE5'/>
          {!isPublic && (
            <p className='text-gray-600 flex items-center justify-center gap-2 cursor-pointer hover:text-purple-600 mt-2' onClick={()=>window.location.href='/dashboard'}>
            <span><ArrowLeft /></span>
            Go to DashBoard
            </p>
          )}
        </div>

        
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
          {!isPublic && (
            <>
              <ShareButton
                interview_id={interview_id}
                conclusion={conclusion}
                candidateName={candidateName}
              />
            </>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-4xl mx-auto bg-white">
        {/* Purple header */}
        <div className="bg-purple-500 text-white p-6 rounded-t-lg">
          <h1 className="text-2xl font-bold mb-1 text-center">Interview Summary for {candidateName}</h1>
          <p className="text-center text-purple-100">Tailored feedback generated from {candidateName}'s resume and the job requirements.</p>
        </div>
        
        {/* Summary section */}
        <div className="bg-white p-0 md:p-6 rounded-b-lg mb-4">
          <h2 className="font-semibold text-lg mb-4">Summary:</h2>
          <p className="text-gray-700 mb-8">
            {conclusion.conclusion}
          </p>
          <h2 className="font-semibold text-lg mb-4">Geneva's Feedback:</h2>
          <p className="text-gray-700 mb-8">
            {conclusion.feedback}
          </p>
          
          {/* Two column layout for strengths and radar chart */}
          <div className="flex flex-col md:flex-row items-start justify-between gap-8">
            {/* Strengths section */}
            <div className='w-full md:w-1/2'>
              <h2 className="font-semibold text-lg mb-4 text-center">Strengths</h2>
              <ul className="space-y-4">
                {conclusion.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start">
                    <div className="mr-2 mt-1 bg-green-500 rounded-full p-1">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                      </svg>
                    </div>
                    <span className="text-gray-700">{strength}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Radar chart */}
            <div className='w-full md:w-1/2'>
              <h2 className="font-semibold text-lg mb-4 text-center">Candidate Performance Review</h2>
              <RadarChart scores={radarData} />
            </div>
          </div>
        </div>
        
        {/* Areas for improvement */}
        <div className="bg-yellow-50 p-6 rounded-lg mb-4 shadow-sm">
          <h2 className="font-semibold text-lg mb-4">Opportunities for Growth</h2>
          <ul className="space-y-4">
            {conclusion.areas_for_improvement.map((area, index) => (
              <li key={index} className="flex items-start">
                <div className="mr-2 mt-1 bg-yellow-500 rounded-full p-1">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
                  </svg>
                </div>
                <span className="text-gray-700">{area}</span>
              </li>
            ))}
          </ul>
        </div>
        
        {/* Job alignment section */}
        <div className="bg-white p-6 rounded-lg">
          <h2 className="font-semibold text-lg mb-4">How "{candidateName}" Aligns with Job</h2>
          
          <div className="overflow-hidden">
            <table className="min-w-full border border-gray-300 border-collapse">
              <thead>
                <tr>
                  <th className="px-6 py-3 bg-gray-100 text-left text-sm font-medium text-gray-600 uppercase w-1/3 border border-gray-300">
                    JD Focus Area
                  </th>
                  <th className="px-6 py-3 bg-gray-100 text-left text-sm font-medium text-gray-600 uppercase border border-gray-300">
                    AI Suggestions for Improvement
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {jdAlignmentData.map((item, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 text-sm text-gray-900 border border-gray-300">
                      {item.area}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 border border-gray-300">
                      {item.suggestion}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewSummary;