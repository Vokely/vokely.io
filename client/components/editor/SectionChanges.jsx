import DropDown from '../icons/DropDown';
import { getChangesHTML } from '@/lib/getChangesHtml';
import "@/styles/editor.css"
import {  useState } from 'react';

export default function SectionChanges({data,isOpen,setIsOpen}) {
    const [addedItems, setAddedItems] = useState([]);
    const handleSkillChange = (skill, isChecked) => {
        setAddedItems(prev => 
            isChecked ? [...prev, skill] : prev.filter(item => item !== skill)
        );
    };
    const [addedskills, setAddedSkills] = useState({ technical_skills: [], soft_skills: [] });

    const handleAddedSkills = (category, skill, isChecked) => {
        setAddedSkills(prev => ({
            ...prev,
            [category]: isChecked
                ? [...prev[category], skill]
                : prev[category].filter(item => item !== skill),
        }));
    };
    const [selectedExperience, setSelectedExperience] = useState([]);
    // Handle experience selection (store full object)
    const handleExperienceChange = (experience, isChecked) => {
        setSelectedExperience(prev => 
            isChecked 
                ? [...prev, experience] 
                : prev.filter(item => item.company !== experience.company) // Filter by company to remove
        );
    };

    const [selectedProjects, setSelectedProjects] = useState({
        modified: [],
        added: [],
        removed: []
    });
    const handleProjectSelection = (category, project, isChecked) => {
        setSelectedProjects(prev => ({
            ...prev,
            [category]: isChecked
                ? [...prev[category], project]
                : prev[category].filter(item => item.project_name !== project.project_name),
        }));
    };    
        
  return (
    <div className='rounded-md bg-multi-gradient p-[1px] mb-2 h-auto mx-2'>
        <div className='bg-[rgb(243,238,250)] p-4 rounded-md text-primary'>
            <div className='flex items-center justify-between' onClick={()=>(setIsOpen((cur)=>!cur))}>
                <h3 className='text-semibold text-[18px]'>{data.heading === 'Personal Info' ? `Enhanced Description` : `Enhanced ${data.heading}`}</h3>
                <div className={`${isOpen ? 'rotate-180 ':''} cursor-pointer smooth`}><DropDown size="32"/></div>
            </div>
            {isOpen && (
                <div>
                    <div className='my-4 w-full'>{getChangesHTML(data.generated_data,data.heading,data.onClick,addedItems,handleSkillChange,addedskills,handleAddedSkills,selectedExperience, handleExperienceChange,selectedProjects,handleProjectSelection,
                        setAddedSkills,setAddedItems,setSelectedExperience,setSelectedProjects
                    )}</div>
                </div>
            )}
        </div>
    </div>
  )
}
