import ExperienceSection from '@/components/editor/Experience';
import PersonalInfoSection from '@/components/editor/Personal';
import EducationSection from '@/components/editor/Education';
import ProjectsSection from '@/components/editor/Projects';
import LinksSection from '@/components/editor/Links';

export const PROFILE_SECTIONS = [
    {
    name: "Personal Info",
    included_in: ["Simple", "ATS", "Modern", "Creative"],
    component : <PersonalInfoSection template='Modern'/>
    },
    {
    name: "Social Links",
    included_in: ["Simple", "ATS", "Modern", "Creative"],
    component : <LinksSection/> 
    },
    {
    name: "Experience",
    included_in: ["Simple", "ATS", "Modern", "Creative"],
    component : <ExperienceSection/> 
    },
    {
    name: "Projects",
    included_in: ["Simple", "ATS", "Modern", "Creative"],
    component : <ProjectsSection/> 
    },
    {
    name: "Education",
    included_in: ["Simple", "ATS", "Modern", "Creative"],
    component : <EducationSection/> 
    },
]