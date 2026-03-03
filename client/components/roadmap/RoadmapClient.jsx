'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import useToastStore from '@/store/toastStore';
import { generateRoadmap } from '@/lib/roadmapUtil';
import { RoadMapLoader } from '@/components/roadmap/RoadMapLoader';
import useRoadmapStore from '@/store/roadmapStore';
import NewSideBar from '@/components/layouts/NewSideBar';
import useAPIWrapper from '@/hooks/useAPIWrapper';

export default function SkillGapAnalyzer() {
  const {targetSkill, setTargetSkill} = useRoadmapStore();
  const router = useRouter();
  const addToast = useToastStore((state) => state.addToast);
  const { callApi } = useAPIWrapper();

  // State for form inputs
  const [activeTab, setActiveTab] = useState('new');
  const [includeResumeInsights, setIncludeResumeInsights] = useState(true);
  const [includeInterviewFeedback, setIncludeInterviewFeedback] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleSubmit = async () => {
    if (!targetSkill.trim()) {
      addToast('Please enter a target skill or role', 'warning', 'top-middle', 3000);
      return;
    }
    
    setIsGenerating(true);

    try {
      const response = await callApi(generateRoadmap,targetSkill);
      setIsGenerating(false)
      if(response!=null){
        router.push(`ai-learning-guide/learn/${response.id}`);
      }
    } catch (error) {
      setIsGenerating(false);
    } 
  };

  if(isGenerating){
    return <RoadMapLoader/>
  }

  return (
    <div className="h-screen bg-bgviolet">
      <div className='absolute top-0 left-0 z-[999]'><NewSideBar/></div>

      <main className="h-screen flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-8 sm:p-10">
            <h1 className="text-2xl sm:text-3xl font-bold text-center text-primary">
              Build Your Custom Learning Roadmap
            </h1>

            <p className="mt-2 text-center text-gray-600">
              Powered by AI · Resume Analysis · Interview Prep
            </p>

            {/* Tabs */}
            <div className="mt-8 flex border-b border-gray-200">
              {/* <button
                className={`flex-1 py-3 text-center ${
                  activeTab === 'existing'
                    ? 'border-b-2 border-primary text-primary font-medium'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => handleTabChange('existing')}
              >
                Use Existing Profile data
              </button> */}
              <button
                className={`flex-1 py-3 text-center ${
                  activeTab === 'new'
                    ? 'border-b-2 border-primary text-primary font-medium'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => handleTabChange('new')}
              >
                Craft My Roadmap
              </button>
            </div>

            {/* Form */}
              <div className="mt-8 space-y-6">
                <div>
                  <label htmlFor="skill" className="block text-sm font-medium text-gray-700">
                    What skill or role are you aiming for?
                  </label>
                  <div className="mt-1">
                    <input
                      id="skill"
                      name="skill"
                      type="text"
                      required
                      value={targetSkill}
                      onChange={(e) => setTargetSkill(e.target.value)}
                      placeholder="e.g. React.js Developer"
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                </div>

                {/* Customized roadmap */}
                <div className="min-h-[180px]">
                  {/* {activeTab === 'new' && (
                    <div>
                      <label htmlFor="background" className="block text-sm font-medium text-gray-700">
                        What's your origin story? Drop in your goals, experience (or none at all), and we'll take it from there
                      </label>
                      Customized roadmap
                      <div className="mt-1">
                        <textarea
                          id="background"
                          name="background"
                          rows={4}
                          value={background}
                          onChange={(e) => setBackground(e.target.value)}
                          placeholder="e.g. I have a background in marketing (non-tech) and 0 experience. Let's go! I've dabbled in HTML, now I want to make full-stack sites."
                          className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                      </div>
                    </div>
                  )} */}

                  {activeTab === 'existing' && (
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="resume-insights"
                            name="resume-insights"
                            type="checkbox"
                            checked={includeResumeInsights}
                            onChange={(e) => setIncludeResumeInsights(e.target.checked)}
                            className="focus:ring-blue-500 h-4 w-4 text-primary border-gray-300 rounded"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="resume-insights" className="font-medium text-gray-700">
                            Include my smart resume insights
                          </label>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="interview-feedback"
                            name="interview-feedback"
                            type="checkbox"
                            checked={includeInterviewFeedback}
                            onChange={(e) => setIncludeInterviewFeedback(e.target.checked)}
                            className="focus:ring-blue-500 h-4 w-4 text-primary border-gray-300 rounded"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="interview-feedback" className="font-medium text-gray-700">
                            Include my AI interview feedback
                          </label>
                        </div>
                      </div>

                      <div className="text-right relative">
                        <a
                          href="#"
                          className="text-sm text-primary hover:text-blue-500"
                          onMouseEnter={() => setShowTooltip(true)}
                          onMouseLeave={() => setShowTooltip(false)}
                        >
                          Why include these?
                        </a>
                        {showTooltip && (
                          <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg p-4 z-10 border border-gray-200">
                            <div className="flex items-start">
                              <div className="flex-shrink-0 text-gray-500">
                                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <div className="ml-3">
                                <p className="text-sm text-gray-700">
                                  Resume insights highlight your existing strengths. Interview feedback shows where to focus.
                                </p>
                              </div>
                            </div>
                            <div className="absolute top-0 right-5 transform -translate-y-1/2 rotate-45 w-3 h-3 bg-white border-t border-l border-gray-200"></div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isGenerating}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed"
                  >
                    {isGenerating ? 'Generating...' : 'Generate My Roadmap'}
                  </button>
                  <p className="mt-2 text-xs text-center text-gray-500">
                    It takes ~10-15 seconds. You'll see a personalized step-by-step plan.
                  </p>
                </div>
              </div>
          </div>
        </div>
      </main>
    </div>
  );
}
