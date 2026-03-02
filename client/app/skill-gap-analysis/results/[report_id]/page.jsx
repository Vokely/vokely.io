'use client'
import { useEffect, useState } from 'react';
import useSkillGapStore from '@/store/skillGapStore';
import { getSkillGap } from '@/lib/skillGap';
import useIsMobile from '@/hooks/IsMobile';
import { generateRoadmapFromReport } from '@/lib/skillGap';
import { RoadMapLoader } from '@/components/roadmap/RoadMapLoader';
import { useRouter } from 'next/navigation';
import useToastStore from '@/store/toastStore';
import NewSideBar from '@/components/layouts/NewSideBar';


const MobileSkillCard = ({ skill, index, addedSkills, handleAddToRoadmap, getSkillCategory, getSkillReason, getSkillType, getBadgeClass }) => {
  const category = getSkillCategory(skill);
  const reason = getSkillReason(skill);
  const skillType = getSkillType(skill);
  const isAdded = addedSkills.includes(skill);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <div className="flex flex-col gap-2">
        <div className="text-sm font-semibold text-gray-800">
          {index + 1}. {skill}
        </div>
        {reason && (
          <div className="text-xs text-amber-600 italic">{reason}</div>
        )}
        <div className="text-xs text-gray-500">
          <span className="font-medium">Type:</span> {skillType}
        </div>
        <div>
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getBadgeClass(category)}`}>
            {category}
          </span>
        </div>
        <button
          onClick={() => handleAddToRoadmap(skill)}
          className={`mt-2 w-full text-xs font-medium rounded-full px-4 py-2 transition-colors ${
            isAdded
              ? 'bg-purple-100 text-purple-800 border border-purple-200'
              : 'bg-purple-600 text-white hover:bg-purple-700'
          }`}
        >
          {isAdded ? 'Added' : 'Add'}
        </button>
      </div>
    </div>
  );
};

const DesktopSkillTable = ({ sortedSkills, addedSkills, handleAddToRoadmap, getSkillCategory, getSkillReason, getSkillType, getBadgeClass }) => {
  return (
    <div className="mt-5 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col">
      <div className="flex-1 overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Skills
              </th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                Type
              </th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedSkills.map((skill, index) => {
              const category = getSkillCategory(skill);
              const reason = getSkillReason(skill);
              const skillType = getSkillType(skill);
              const isAdded = addedSkills.includes(skill);

              return (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-3 sm:px-6 py-4 text-sm font-medium text-gray-900">
                    <div className="flex flex-col">
                      <span className="whitespace-nowrap font-semibold">
                        {index + 1}. {skill}
                      </span>
                      {reason && (
                        <span className="text-xs text-amber-600 mt-1 italic sm:hidden">
                          {reason}
                        </span>
                      )}
                      <span className="text-xs text-gray-500 mt-1 sm:hidden">
                        {skillType}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">
                    <div className="flex flex-col">
                      <span>{skillType}</span>
                      {reason && (
                        <span className="text-xs text-amber-600 mt-1 italic">
                          {reason}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-medium border ${getBadgeClass(category)}`}>
                      {category}
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleAddToRoadmap(skill)}
                      className={`inline-flex items-center px-4 w-full justify-center sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-medium transition-colors ${
                        isAdded
                          ? 'bg-purple-100 text-purple-800 border border-purple-200'
                          : 'bg-purple-600 text-white hover:bg-purple-700'
                      }`}
                    >
                      {isAdded ? 'Added' : 'Add'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default function SkillGapAnalysis({ params }) {
  const isMobile = useIsMobile()
  const router = useRouter()
  const report_id = params.report_id;

  const [loading, setLoading] = useState(true);
  const [generating,setIsGenerating] = useState(false);
  const addToast = useToastStore((state)=> state.addToast);

  const {
    skillGapReport,
    requiredSkills,
    matchedSkills,
    missedSkills,
    skillsToBeImproved,
    addedSkills,
    addToRoadmap,
    removeFromRoadmap,
    updateFromResponse,
    setSkillGapReport,
    setAddedSkills
  } = useSkillGapStore();

  const loadSkillGapData = async () => {
    try {
      setLoading(true);
      const apiData = await getSkillGap(report_id);
      updateFromResponse(apiData);
      setSkillGapReport(apiData.data);
  
      // Auto-add up to 5 skills: prioritize missed, then improved
      const missedTechnical = apiData.data?.missed_skills?.technical_skills || [];
      const missedSoft = apiData.data?.missed_skills?.soft_skills || [];
      const toBeImproved = apiData.data?.skills_to_be_improved || [];
  
      const allMissed = [...missedTechnical, ...missedSoft];
      const selectedSkills = [];
  
      for (const skill of allMissed) {
        if (selectedSkills.length < 5 && !selectedSkills.includes(skill)) {
          selectedSkills.push(skill);
        }
      }
  
      for (const item of toBeImproved) {
        const skill = item.skill;
        if (selectedSkills.length < 5 && !selectedSkills.includes(skill)) {
          selectedSkills.push(skill);
        }
      }
  
      setAddedSkills(selectedSkills);
    } catch (error) {
      console.error('Failed to load skill gap data:', error);
    } finally {
      setLoading(false);
    }
  };  

  useEffect(() => {
    if (skillGapReport === null) {
      loadSkillGapData();
    }else{
      setLoading(false)
    }
  }, [report_id]);

  // Sort skills: Missing, Matched, To Improve
  const getSortedSkills = () => {
    const allMatchedSkills = [...matchedSkills.technical, ...matchedSkills.soft];
    const allMissedSkills = [...missedSkills.technical, ...missedSkills.soft];
    const allSkillsToImprove = skillsToBeImproved.map(skillObj => skillObj.skill);

    return [
      ...allMatchedSkills,
      ...allSkillsToImprove,
      ...allMissedSkills
    ];
  };

  const sortedSkills = getSortedSkills();

  const getSkillType = (skill) => {
    if (
      requiredSkills.technical.includes(skill) ||
      matchedSkills.technical.includes(skill) ||
      missedSkills.technical.includes(skill)
    ) {
      return 'Technical';
    }
    return 'Soft';
  };

  const getSkillCategory = (skill) => {
    const allMissedSkills = [...missedSkills.technical, ...missedSkills.soft];
    const allMatchedSkills = [...matchedSkills.technical, ...matchedSkills.soft];
    const allSkillsToImprove = skillsToBeImproved.map(skillObj => skillObj.skill);

    if (allMissedSkills.includes(skill)) return 'Missing';
    if (allMatchedSkills.includes(skill)) return 'Matched';
    if (allSkillsToImprove.includes(skill)) return 'To Improve';
    return 'Missing';
  };

  const getSkillReason = (skill) => {
    const skillObj = skillsToBeImproved.find(s => s.skill === skill);
    return skillObj?.reason || null;
  };

  const getBadgeClass = (category) => {
    switch (category) {
      case 'Missing':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Matched':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'To Improve':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleAddToRoadmap = (skill) => {
    const isAlreadyAdded = addedSkills.includes(skill);
  
    if (isAlreadyAdded) {
      removeFromRoadmap(skill);
    } else {
      if (addedSkills.length >= 5) {
        addToast('Cannot add more than 5 skills in a roadmap', 'warning', 'top-middle', 3000);
        return;
      }
      addToRoadmap(skill);
    }
  };
  

  const generateRoadmap = async()=>{
    try {
      setIsGenerating(true)
      const response = await generateRoadmapFromReport(skillGapReport.resume_id,addedSkills);
      if(response.status!==200){
        addToast('An error occurred while generating roadmap', 'error', 'top-middle', 3000)
        return;
      }
      const responseJson = await response.json();

      router.push(`/ai-learning-guide/learn/${responseJson.id}`);
    } catch (error) {
      addToast('An error occurred while generating roadmap', 'error', 'top-middle', 3000);
    }finally{
      setIsGenerating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-purple-600 border-opacity-50"></div>
      </div>
    );
  }

  const allMissedSkills = [...missedSkills.technical, ...missedSkills.soft];
  const allMatchedSkills = [...matchedSkills.technical, ...matchedSkills.soft];

  if(generating){
    return <RoadMapLoader/>
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row">
        {/* Sidebar */}
        <div className="w-fit">
          <NewSideBar />
        </div>

        {/* Main Content */}
        <div className="w-[90vw] flex-1 p-3 sm:p-5">
          {/* Stats Cards - Responsive Grid */}
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
            <div className="bg-white rounded-lg p-4 sm:p-6 border border-purple-200 text-purple-700 shadow-sm">
              <h3 className="text-xs sm:text-sm font-medium mb-1 sm:mb-2">Required Skills</h3>
              <p className="text-xl sm:text-3xl font-bold">{sortedSkills.length}</p>
            </div>
            <div className="bg-red-50 rounded-lg p-4 sm:p-6 border border-red-200 text-red-700 shadow-sm">
              <h3 className="text-xs sm:text-sm font-medium mb-1 sm:mb-2">Missing Skills</h3>
              <p className="text-xl sm:text-3xl font-bold">{allMissedSkills.length}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 sm:p-6 border border-green-200 text-green-700 shadow-sm">
              <h3 className="text-xs sm:text-sm font-medium mb-1 sm:mb-2">Matched Skills</h3>
              <p className="text-xl sm:text-3xl font-bold">{allMatchedSkills.length}</p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4 sm:p-6 border border-yellow-200 text-yellow-700 shadow-sm">
              <h3 className="text-xs sm:text-sm font-medium mb-1 sm:mb-2">Skills to Improve</h3>
              <p className="text-xl sm:text-3xl font-bold">{skillsToBeImproved.length}</p>
            </div>
          </div>

          {/* Added Skills */}
          <div className="px-0 sm:px-6 py-4 border-t border-gray-200 bg-white sticky bottom-0 z-10">
            <div className="grid grid-cols-1 sm:grid-cols-[80%_20%] sm:items-center gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-gray-600 font-medium">Skills Added ({addedSkills.length}):</span>
                {addedSkills.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200"
                  >
                    <span className="max-w-[120px] truncate">{skill}</span>
                    <button
                      onClick={() => removeFromRoadmap(skill)}
                      className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full text-purple-600 hover:bg-purple-200 flex-shrink-0"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              <div className="sm:justify-self-end">
                <button
                  onClick={generateRoadmap}
                  disabled={addedSkills.length === 0}
                  className={`flex w-full sm:w-auto h-fit items-center justify-center px-4 sm:px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                    addedSkills.length === 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-multi-gradient text-white font-semibold'
                  }`}
                >
                  Generate Road-map
                </button>
              </div>
            </div>
          </div>

          {/* Skills Table */}
          {isMobile ? (
            <div className="mt-4 flex flex-col gap-4">
              {sortedSkills.map((skill, index) => (
                <MobileSkillCard key={index} skill={skill} index={index} />
              ))}
            </div>
          ) : (
            <DesktopSkillTable
              sortedSkills={sortedSkills}
              addedSkills={addedSkills}
              handleAddToRoadmap={handleAddToRoadmap}
              getSkillCategory={getSkillCategory}
              getSkillReason={getSkillReason}
              getSkillType={getSkillType}
              getBadgeClass={getBadgeClass}
            />
          )}
        </div>
      </div>
    </div>
  );
}