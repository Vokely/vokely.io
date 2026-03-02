import { useState } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  ChevronsDown, 
  ChevronsUp, 
  ShieldQuestion,
  TrendingUp
} from 'lucide-react';
import { FilledTick } from '../icons/FilledTick';
import { FilledMinus } from '../icons/FilledMinus';
import { useRouter } from 'next/navigation';

// Keyword Density Item Component
const KeywordItem = ({ keyword }) => {
  const getImportanceIcon = (importance) => {
    switch (importance) {
      case 'high': return <div className="bg-green-200 rounded-full p-1"><ChevronsUp className='h-3 w-3 text-green-500'/></div>;
      case 'medium': return <div className="bg-amber-200 rounded-full p-1"><TrendingUp className='h-3 w-3 text-amber-500'/></div>;
      case 'low': return <div className="bg-red-200 rounded-full p-1"><ChevronsDown className='h-3 w-3 text-red-500'/></div>;
    }
  };

  return (
    <div className="flex items-center justify-between py-1">
      <div className="flex items-center space-x-2">
        {getImportanceIcon(keyword.importance)}
        <span className="text-sm text-gray-700">{keyword.keyword}</span>
      </div>
      <div className="flex items-center space-x-3 text-xs">
        <span className='text-primary'>Freq: {keyword.frequency}</span>
        <span className="capitalize text-gray-500">({keyword.importance})</span>
      </div>
    </div>
  );
};

// Job Requirement Item Component
const JobRequirementItem = ({ requirement }) => {
  const getStatusIcon = (matched) => {
    return matched 
      ? <FilledTick/>
      : <FilledMinus/>
  };

  return (
    <div className="py-2">
      <div className="flex items-center space-x-2 mb-2">
        {getStatusIcon(requirement.matched)}
        <span className="text-sm text-gray-700 flex-1">{requirement.requirement}</span>
      </div>
      {requirement.suggestion && !requirement.matched && (
        <div className="ml-4 text-xs text-gray-500">
          {requirement.suggestion.suggestion || requirement.suggestion}
        </div>
      )}
    </div>
  );
};

// CollapsibleSection Component with Framer Motion
const CollapsibleSection = ({ title, emoji, subtitle, description, children, ctaText, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm font-medium overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
      >
        <div className="flex items-center space-x-3">
          <div className='text-xl'>
            {emoji}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-primary">{title}</h3>
          </div>
        </div>
        {isOpen ? (
          <ChevronUp size={20} className="text-gray-400 flex-shrink-0" />
        ) : (
          <ChevronDown size={20} className="text-gray-400 flex-shrink-0" />
        )}
      </button>

      {/* Content with animation */}
      {isOpen && (
        <div
          className="overflow-hidden px-6 pb-6 border-t border-gray-100"
          style={{
            animation: 'slideDown 0.3s ease-out',
          }}
        >
          <div className="pt-6 space-y-6">
          <p className="text-sm bg-blue-100 text-primary w-fit rounded-md mx-auto px-2 py-1 leading-relaxed">{subtitle}</p>
            <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
            
            <div className="mb-6">
              {children}
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-center text-sm font-medium text-gray-700 mb-3">
                Build an ATS-friendly resume using Vokely AI Resume builder
              </p>
              <div className="flex justify-center">
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm">
                  {ctaText}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            max-height: 0;
          }
          to {
            opacity: 1;
            max-height: 1000px;
          }
        }
      `}</style>
    </div>
  );
};

// Skills List Item Component
const SkillListItem = ({ skill, status }) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'matched':
        return <FilledTick className="h-5 w-5"/>;
      case 'partial_match':
        return <div className='text-yellow-600 bg-yellow-100 rounded-full p-1'><ShieldQuestion className='h-4 w-4'/></div>;
      case 'missing':
        return <FilledMinus className="h-5 w-5"/>;
      default:
        return <div className='text-yellow-600 bg-yellow-100 rounded-full'><ShieldQuestion className='h-5 w-5'/></div>;
    }
  };

  return (
    <div className="flex items-center space-x-2 py-1">
      {getStatusIcon(status)}
      <span className="text-sm text-gray-700">{skill}</span>
    </div>
  );
};

// Skills Section Component
const SkillsSection = ({ title, skills, icon, sectionType }) => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const totalSkills = (skills.matched?.length || 0) + (skills.partial_match?.length || 0) + (skills.missing?.length || 0);
  const matchedCount = (skills.matched?.length || 0) + (skills.partial_match?.length || 0);
  
  const allSkills = [
    ...(skills.matched?.map(skill => ({ skill, status: 'matched' })) || []),
    ...(skills.partial_match?.map(skill => ({ skill, status: 'partial_match' })) || []),
    ...(skills.missing?.map(skill => ({ skill, status: 'missing' })) || [])
  ];

  const getHeaderText = () => {
    if (sectionType === 'hard') {
      return `${matchedCount}/${totalSkills} Job Keywords Matched`;
    } else {
      return 'More Soft Skills = Better Match';
    }
  };

  const getDescription = () => {
    if (sectionType === 'hard') {
      return "You've nailed the major terms like \"JavaScript\" and \"Node.js\" - just a few left to add for an even better score.";
    } else {
      return "Soft skills shape culture fit. Show them through how you work, not just what you did.";
    }
  };

  const getCtaText = () => {
    if (sectionType === 'hard') {
      return "Insert Missing Keywords with AI";
    } else {
      return "Add Soft Skills with Resume Builder";
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm font-medium overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
      >
        <div className="flex items-center space-x-3">
          <div className="text-xl">
            {icon}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-primary">{title}</h3>
          </div>
        </div>
        {isOpen ? (
          <ChevronUp size={20} className="text-gray-400 flex-shrink-0" />
        ) : (
          <ChevronDown size={20} className="text-gray-400 flex-shrink-0" />
        )}
      </button>

      {/* Content with animation */}
      {isOpen && (
        <div
          className="overflow-hidden px-6 pb-6 border-t border-gray-100"
          style={{
            animation: 'slideDown 0.3s ease-out',
          }}
        >
          <div className="pt-6 space-y-6">
          <p className="text-sm bg-blue-100 text-primary w-fit rounded-md mx-auto px-2 py-1 leading-relaxed">{getHeaderText()}</p>
            <p className="text-sm text-gray-600">{getDescription()}</p>
            
            <div className="grid grid-cols-3 gap-x-8 gap-y-2 mb-6 p-2 border-light-gray rounded-xl">
              {allSkills.map((item, index) => (
                <SkillListItem key={index} skill={item.skill} status={item.status} />
              ))}
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-center text-sm font-medium text-gray-700 mb-3">
                Build an ATS-friendly resume using Vokely AI Resume builder
              </p>
              <div className="flex justify-center" onClick={()=> router.push('/dashboard')}>
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm">
                  {getCtaText()}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            max-height: 0;
          }
          to {
            opacity: 1;
            max-height: 1000px;
          }
        }
      `}</style>
    </div>
  );
};

// Experience Analysis Section
const ExperienceAnalysisSection = ({ experienceData }) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm font-medium overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
      >
        <div className="flex items-center space-x-3">
          <div className="text-xl">
            💼
          </div>
          <div>
            <h3 className="text-lg font-semibold text-primary">Experience Analysis</h3>
          </div>
        </div>
        {isOpen ? (
          <ChevronUp size={20} className="text-gray-400 flex-shrink-0" />
        ) : (
          <ChevronDown size={20} className="text-gray-400 flex-shrink-0" />
        )}
      </button>

      {/* Content with animation */}
      {isOpen && (
        <div
          className="overflow-hidden px-6 pb-6 border-t border-gray-100"
          style={{
            animation: 'slideDown 0.3s ease-out',
          }}
        >
          <div className="pt-6 space-y-6">
            <p className="text-sm bg-blue-100 text-primary w-fit rounded-md mx-auto px-2 py-1 leading-relaxed">
              Compare your background with job requirements to identify experience gaps and strengths.
            </p>
            
            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-red-50 border-[1px] rounded-lg border-red-400 p-4">
                  <h4 className="font-medium text-red-900 mb-1 text-sm">Required Experience</h4>
                  <p className="text-sm text-red-600">{experienceData.required_experience}</p>
                </div>
                <div className="bg-green-50 border-[1px] rounded-lg border-green-400 p-4">
                  <h4 className="font-medium text-green-900 mb-1 text-sm">Your Experience</h4>
                  <p className="text-sm text-green-600">{experienceData.user_experience}</p>
                </div>
                {experienceData.gap_analysis && (
                <div className="bg-amber-50 border-[1px] rounded-lg border-amber-400 p-4">
                  <h4 className="font-medium text-amber-900 mb-1 text-sm">Gap Analysis</h4>
                  <p className="text-sm text-amber-600">{experienceData.gap_analysis}</p>
                </div>
              )}
              </div>
              

            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-center text-sm font-medium text-gray-700 mb-3">
                Build an ATS-friendly resume using Vokely AI Resume builder
              </p>
              <div className="flex justify-center" onClick={()=> router.push('/dashboard')}>
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm">
                  Enhance Experience Section
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            max-height: 0;
          }
          to {
            opacity: 1;
            max-height: 1000px;
          }
        }
      `}</style>
    </div>
  );
};

// Main Dashboard Component
export const JDSubSections = ({ data = sampleData }) => {
  return (
    <div className="">

      <div className="space-y-6">
        {/* Hard Skills Section */}
        <SkillsSection 
          title="Keyword Match"
          icon="🎯 "
          skills={data.hard_skills_match}
          sectionType="hard"
        />

        {/* Soft Skills Section */}
        <SkillsSection 
          title="Soft Skills Detection"
          icon="🧠"
          skills={data.soft_skills_match}
          sectionType="soft"
        />

        {/* Keyword Density Section */}
        <CollapsibleSection 
          title="Keyword Analysis" 
          emoji="📊"
          subtitle="Optimize Keyword Frequency"
          description="Track how often important keywords appear in your resume and their priority levels for better ATS optimization."
          ctaText="Optimize Keywords with AI"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-y-2 gap-x-8">
            {data.keyword_density.map((keyword, index) => (
              <KeywordItem key={index} keyword={keyword} />
            ))}
          </div>
        </CollapsibleSection>

        {/* Experience Analysis Section */}
        <ExperienceAnalysisSection experienceData={data.experience_analysis} />

        {/* Job Requirements Match Section */}
        <CollapsibleSection 
          title="Job Requirements Analysis" 
          emoji="🎯"
          subtitle="Meet All Job Requirements"
          description="See how well your resume matches each specific job requirement and get suggestions for improvement."
          ctaText="Improve Job Match Score"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-y-1 gap-x-8">
            {data.job_requirements_match.map((requirement, index) => (
              <JobRequirementItem key={index} requirement={requirement} />
            ))}
          </div>
        </CollapsibleSection>

        {/* Achievement Statements Section */}
        {data.achievement_statements?.length > 0 && (
          <CollapsibleSection 
            title="Achievement Statements" 
            emoji="🏆"
            subtitle="Quantify Your Impact"
            description="Add measurable achievements and specific outcomes to make your experience more compelling to employers."
            ctaText="Generate Achievement Statements"
          >
            <div className="space-y-4">
              {data.achievement_statements.map((achievement, index) => (
                <div key={index} className="py-2 border-b border-gray-100 last:border-b-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <div className="w-2 h-2 bg-amber-500 rounded-full flex-shrink-0"></div>
                    <span className="text-sm font-medium text-gray-700">
                      Section: {achievement.section}
                    </span>
                  </div>
                  {achievement.project_name && (
                    <p className="text-xs text-gray-500 ml-4 mb-1">Project: {achievement.project_name}</p>
                  )}
                  <p className="text-sm text-green-600 ml-4">{achievement.suggestion}</p>
                </div>
              ))}
            </div>
          </CollapsibleSection>
        )}
      </div>
    </div>
  );
};