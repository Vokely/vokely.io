import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const useUserDetailsStore = create(
  persist(
    (set) => ({
      user_details: {
        personalInfo: {},
        skills: {
          technical_skills: [],
          soft_skills: []
        },
        socialLinks: [],
        experience: [],
        education: [],
        projects: [],
        certifications:[],
        achievements: [],
        hobbies: [],
        languages: [],
      },
      
      hasUntrackedChanges: false,
      setHasUntrackedChanges: (value) => set({ hasUntrackedChanges: value }),
      resetUntrackedChanges: () => set({ hasUntrackedChanges: false }),
      modified_at: "",
      setModified: (value) => set({ modified_at: value }),
      user_id: null,
      setUserId: (value) => set({ user_id: value }),

      setUserDetails: (data) => set((state) => ({
        user_details: { 
          // Start with default structure
          personalInfo: data.personalInfo || {},
          skills: data.skills || {
            technical_skills: [],
            soft_skills: []
          },
          socialLinks: data.socialLinks || [],
          experience: data.experience || [],
          education: data.education || [],
          projects: data.projects || [],
          certifications : data.certifications || [],
          achievements: data.achievements || [],
          hobbies: data.hobbies || [],
          languages: data.languages || [],
        },
        hasUntrackedChanges: true 
      })),
      resetAllState: () => set({
        user_details: {
          personalInfo: {},
          skills: {
            technical_skills: [],
            soft_skills: []
          },
          socialLinks: [],
          experience: [],
          education: [],
          projects: [],
          achievements: [],
          hobbies: [],
          languages: [],
        },
        hasUntrackedChanges: false,
        modified_at: "",
      }),
      // Personal Info
      updatePersonalInfo: (field, value) =>
        set((state) => ({
          user_details: {
            ...state.user_details,
            personalInfo: { 
              ...state.user_details.personalInfo, 
              [field]: value 
            }
          },
          hasUntrackedChanges: true 
        })),

      // Skills
      addSkill: (category, value) =>
        set((state) => {
          return {
            user_details: {
              ...state.user_details,
              skills: {
                ...state.user_details.skills,
                [category]: [...state.user_details.skills[category], value],
              },
            },
            hasUntrackedChanges: true 
          };
        }),
      updateSkill: (category, index, newSkill) =>
        set((state) => {
          const updatedSkills = [...(state.user_details.skills[category] || [])];
          if (index >= 0 && index < updatedSkills.length) {
            updatedSkills[index] = newSkill;
          }
          return {
            user_details: {
              ...state.user_details,
              skills: {
                ...state.user_details.skills,
                [category]: updatedSkills,
              },
            },
            hasUntrackedChanges: true 
          };
        }),        

      removeSkill: (category, index) =>
        set((state) => ({
          user_details: {
            ...state.user_details,
            skills: {
              ...state.user_details.skills,
              [category]: state.user_details.skills[category].filter((_, i) => i !== index),
            },
          },
          hasUntrackedChanges: true 
        })),

      // Social Links
      addSocialLink: (value) =>
        set((state) => ({
          user_details: {
            ...state.user_details,
            socialLinks: [...state.user_details.socialLinks, {
              platform: value,
              url: "",
              icon: "",
              label: "",
            }],
          },
          hasUntrackedChanges: true 
        })),

      updateSocialLink: (index, field, value) =>
        set((state) => {
          const updatedSocialLinks = [...state.user_details.socialLinks];
          if (index >= 0 && index < updatedSocialLinks.length) {
            updatedSocialLinks[index] = { 
              ...updatedSocialLinks[index], 
              [field]: value 
            };
          }
          return { 
            user_details: { ...state.user_details, socialLinks: updatedSocialLinks },
            hasUntrackedChanges: true 
          };
        }),

      removeSocialLink: (index) =>
        set((state) => ({
          user_details: {
            ...state.user_details,
            socialLinks: state.user_details.socialLinks.filter((_, i) => i !== index),
          },
          hasUntrackedChanges: true 
        })),

      // Experience
      addExperience: () =>
        set((state) => ({
          user_details: {
            ...state.user_details,
            experience: [
              ...state.user_details.experience,
              {
                title: "Role",
                company: "Company Name",
                location: "Location",
                startDate: "dd-mm-yyyy",
                endDate: "dd-mm-yyyy",
                description: "",
              },
            ],
          },
          hasUntrackedChanges: true 
        })),

      updateExperience: (index, field, value) =>
        set((state) => {
          const updatedExperience = [...state.user_details.experience];
          updatedExperience[index] = { 
            ...updatedExperience[index], 
            [field]: value 
          };
          return { 
            user_details: { ...state.user_details, experience: updatedExperience },
            hasUntrackedChanges: true 
          };
        }),

      removeExperience: (index) =>
        set((state) => ({
          user_details: {
            ...state.user_details,
            experience: state.user_details.experience.filter((_, i) => i !== index),
          },
          hasUntrackedChanges: true 
        })),

      // Education
      addEducation: () =>
        set((state) => ({
          user_details: {
            ...state.user_details,
            education: [
              ...state.user_details.education,
              {
                degree: "Degree",
                school: "Untitled School",
                location: "Untitled Location",
                startDate: "dd-mm-yyyy",
                endDate: "dd-mm-yyyy",
                gpa: "x.x",
              },
            ],
          },
          hasUntrackedChanges: true 
        })),

      updateEducation: (index, field, value) =>
        set((state) => {
          const updatedEducation = [...state.user_details.education];
          updatedEducation[index] = { 
            ...updatedEducation[index], 
            [field]: value 
          };
          return { 
            user_details: { ...state.user_details, education: updatedEducation },
            hasUntrackedChanges: true 
          };
        }),

      removeEducation: (index) =>
        set((state) => ({
          user_details: {
            ...state.user_details,
            education: state.user_details.education.filter((_, i) => i !== index),
          },
          hasUntrackedChanges: true 
        })),

      // Projects
      addProject: () =>
        set((state) => ({
          user_details: {
            ...state.user_details,
            projects: [
              ...state.user_details.projects,
              {
                name: "Untitled Project",
                description: "Description",
                link: "",
              },
            ],
          },
          hasUntrackedChanges: true 
        })),

      updateProject: (index, field, value) =>
        set((state) => {
          const updatedProjects = [...state.user_details.projects];
          updatedProjects[index] = { 
            ...updatedProjects[index], 
            [field]: value 
          };
          return { 
            user_details: { ...state.user_details, projects: updatedProjects },
            hasUntrackedChanges: true 
          };
        }),

      removeProject: (index) =>
        set((state) => ({
          user_details: {
            ...state.user_details,
            projects: state.user_details.projects.filter((_, i) => i !== index),
          },
          hasUntrackedChanges: true 
        })),

      // Hobbies
      addHobby: () =>
        set((state) => ({
          user_details: {
            ...state.user_details,
            hobbies: [...state.user_details.hobbies, "New Hobby"],
          },
          hasUntrackedChanges: true 
        })),

      updateHobby: (index, newHobby) =>
        set((state) => {
          const updatedHobbies = [...state.user_details.hobbies];
          updatedHobbies[index] = newHobby;
          return { 
            user_details: { ...state.user_details, hobbies: updatedHobbies },
            hasUntrackedChanges: true 
          };
        }),

      removeHobby: (index) =>
        set((state) => ({
          user_details: {
            ...state.user_details,
            hobbies: state.user_details.hobbies.filter((_, i) => i !== index),
          },
          hasUntrackedChanges: true 
        })),

      // Languages
      addLanguage: (value) =>
        set((state) => ({
          user_details: {
            ...state.user_details,
            languages: [...state.user_details.languages, value],
          },
          hasUntrackedChanges: true 
        })),

      updateLanguage: (index, newLanguage) =>
        set((state) => {
          const updatedLanguages = [...state.user_details.languages];
          updatedLanguages[index] = newLanguage;
          return { 
            user_details: { ...state.user_details, languages: updatedLanguages },
            hasUntrackedChanges: true 
          };
        }),

      removeLanguage: (index) =>
        set((state) => ({
          user_details: {
            ...state.user_details,
            languages: state.user_details.languages.filter((_, i) => i !== index),
          },
          hasUntrackedChanges: true 
        })),

      // Achievements
      addAchievement: (value) =>
        set((state) => ({
          user_details: {
            ...state.user_details,
            achievements: [...state.user_details.achievements, value],
          },
          hasUntrackedChanges: true 
        })),

      updateAchievement: (index, newAchievement) =>
        set((state) => {
          const updatedAchievements = [...state.user_details.achievements];
          if (index >= 0 && index < updatedAchievements.length) {
            updatedAchievements[index] = newAchievement;
          }
          return { 
            user_details: { ...state.user_details, achievements: updatedAchievements },
            hasUntrackedChanges: true 
          };
        }),

      removeAchievement: (index) =>
        set((state) => ({
          user_details: {
            ...state.user_details,
            achievements: state.user_details.achievements.filter((_, i) => i !== index),
          },
          hasUntrackedChanges: true 
        })),
        //CERTIFICATIONS
      addCertification: (value) =>
        set((state) => ({
          user_details: {
            ...state.user_details,
            certifications: [...state.user_details.certifications, value],
          },
          hasUntrackedChanges: true,
        })),

      updateCertification: (index, newCertification) =>
        set((state) => {
          const updatedCertifications = [...state.user_details.certifications];
          if (index >= 0 && index < updatedCertifications.length) {
            updatedCertifications[index] = newCertification;
          }
          return {
            user_details: {
              ...state.user_details,
              certifications: updatedCertifications,
            },
            hasUntrackedChanges: true,
          };
        }),

      removeCertification: (index) =>
        set((state) => ({
          user_details: {
            ...state.user_details,
            certifications: state.user_details.certifications.filter((_, i) => i !== index),
          },
          hasUntrackedChanges: true,
        })),
    }),
    {
      name: 'user-details-storage', 
      storage: createJSONStorage(() => localStorage), 
    }
  )
);

export default useUserDetailsStore;