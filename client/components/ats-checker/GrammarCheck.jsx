import { useState } from 'react';
import { useATSStore } from "@/store/atsStore";
import { categoryDescriptions } from "@/data/ats-sections";
import { GrammarSubSection } from "./GrammarSubSection";
import { MainSection } from './MainSection';

export const GrammarFormatSection = () => {
  const { grammarErrors:basic_analysis } = useATSStore();
  console.log(basic_analysis)
  const [openSections, setOpenSections] = useState({});
  
  const toggleSection = (sectionId) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };
  
  if (!basic_analysis) {
    return null;
  }

  return (
    <>
      <MainSection title="Grammar & Format" />
      <div className="space-y-4">
        {Object.entries(basic_analysis).map(([category, issues]) => {
          if (!issues || issues.length === 0) return null;
          
          return (
            <GrammarSubSection
              key={category}
              categoryTitle={category}
              issues={issues}
              isOpen={!!openSections[category]}
              onToggle={() => toggleSection(category)}
              categoryDescription={categoryDescriptions[category]}
            />
          );
        })}
      </div>
    </>
  );
};