import { create } from 'zustand';

// Updated Zustand store with additional state for roadmap
const useSkillGapStore = create((set, get) => ({
  skillGapReport: null,

  requiredSkills: {
    technical: [],
    soft: [],
  },
  matchedSkills: {
    technical: [],
    soft: [],
  },
  missedSkills: {
    technical: [],
    soft: [],
  },
  skillsToBeImproved: [],
  userId: null,
  resumeId: null,
  reportId: null,
  status: null,
  
  addedSkills: [],
  
  setSkillGapReport: (report) => set({ skillGapReport: report }),

  updateFromResponse: (response) => {
    const data = response?.data || {};
  
    const missedSkills = {
      technical: data?.missed_skills?.technical_skills || [],
      soft: data?.missed_skills?.soft_skills || [],
    };
  
    const skillsToBeImproved = data?.skills_to_be_improved || [];
  
    // Prioritize missed skills first
    const allMissedSkills = [...missedSkills.technical, ...missedSkills.soft];
    const addedSkills = [];
  
    for (let skill of allMissedSkills) {
      if (addedSkills.length < 5 && !addedSkills.includes(skill)) {
        addedSkills.push(skill);
      }
    }
  
    // If there's still space, add skills to be improved
    for (let item of skillsToBeImproved) {
      const skill = item.skill;
      if (addedSkills.length < 5 && !addedSkills.includes(skill)) {
        addedSkills.push(skill);
      }
    }
  
    set({
      skillGapReport: data,
      requiredSkills: {
        technical: data?.required_skills?.technical_skills || [],
        soft: data?.required_skills?.soft_skills || [],
      },
      matchedSkills: {
        technical: data?.matched_skills?.technical_skills || [],
        soft: data?.matched_skills?.soft_skills || [],
      },
      missedSkills,
      skillsToBeImproved,
      addedSkills,
      userId: data?.user_id || null,
      resumeId: data?.resume_id || null,
      reportId: data?.id || null,
      status: data?.status || null,
    });
  },
  
  addToRoadmap: (skill) => {
    const currentRoadmap = get().addedSkills;
    if (!currentRoadmap.includes(skill)) {
      set({ addedSkills: [...currentRoadmap, skill] });
    }
  },

  removeFromRoadmap: (skill) => {
    const currentRoadmap = get().addedSkills;
    set({ addedSkills: currentRoadmap.filter(s => s !== skill) });
  },

  setAddedSkills: (skills) => {
    set({ addedSkills: skills });
  },

  clearSkillGapData: () =>
    set({
      skillGapReport: null,
      requiredSkills: { technical: [], soft: [] },
      matchedSkills: { technical: [], soft: [] },
      missedSkills: { technical: [], soft: [] },
      skillsToBeImproved: [],
      userId: null,
      resumeId: null,
      reportId: null,
      status: null,
      addedSkills: [],
    }),
}));

export default useSkillGapStore;