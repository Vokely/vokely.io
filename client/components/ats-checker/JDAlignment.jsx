// components/JDAlignmentSection.jsx
import { useState } from 'react';
import { MainSection } from './MainSection';
import AiStick from '../icons/AiStick';
import { analyzeJD } from '@/lib/atsChecker';
import useToastStore from '@/store/toastStore';
import { useATSStore } from '@/store/atsStore';
import { JDSubSections } from './JDSubSections';

const JDBackDropWrapper = ({ children }) => {
  return (
    <div className="relative w-full max-w-6xl mx-auto py-10 px-6 overflow-hidden">
      {/* Background SVG */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 870 153"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <path
            d="M9.03496 1.00586L1 10.1094V144.609L9.03492 151.605L183.5 151.609L189.804 144.609H335.74L343.5 151.609H521.272L527.583 144.609H673.52L680.772 151.609H860.772L869 144.609V8.10938L860.772 1.00586H591.272L584.916 8.10938H280.229L272 1.00586H9.03496Z"
            fill="#F1F3F9"
            stroke="#E9EBF3"
          />
        </svg>
      </div>

      {/* JD Input Content */}
      <div className="relative z-20">
        {children}
      </div>
    </div>
  );
};

export const JDAlignmentSection = () => {
  const addToast = useToastStore((state) => state.addToast);
  const [jobDescription, setJobDescription] = useState('');
  const {resumeId:resume_id, JDAnalysis, setJDAnalysis, report_id, setScore} = useATSStore();
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    try {
      if (!jobDescription.trim()) {
        addToast('Please enter a job description', 'warning', 'top-middle', 3000);
        return;
      }
      setLoading(true);

      const result = await analyzeJD(jobDescription, resume_id, report_id);
      const resultJson = await result.json()
      if(!result.ok){
          throw new Error(resultJson.detail)
      }
      setJDAnalysis(resultJson.jd_analysis);
      setScore(resultJson.scoring);
    } catch (error) {
      addToast(error.message || 'An error occurred while analyzing the JD', 'error', 'top-middle', 3000);
    } finally{
      setLoading(false)
    }
  };
  console.log(JDAnalysis)

  return (
    <>
      <MainSection title="JD Alignment"></MainSection>
      <JDBackDropWrapper>
         <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-700">Paste your preferred Job Description</h2>
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className={`font-medium text-white flex items-center gap-2 px-4 py-2 rounded-md ${
                loading ? 'bg-primary/60 cursor-not-allowed' : 'bg-primary'
              }`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    />
                  </svg>
                  Analyzing...
                </>
              ) : (
                <>
                  <AiStick />
                  Analyze
                </>
              )}
            </button>
          </div>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Enter the job role or paste the job description."
            className="w-full rounded-md border border-gray-300 px-4 py-3 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none min-h-[80px]"
          />
        </div>
      </JDBackDropWrapper>
      {JDAnalysis!=null && <JDSubSections data={JDAnalysis}/>}
    </>
  );
};