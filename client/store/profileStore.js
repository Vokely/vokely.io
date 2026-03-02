import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const useProfileStore = create(
  persist(
    (set) => ({
      resumeId: null,
      setResumeId: (value) => set({ resumeId: value }),
      currentResume: "Untitled Resume",
      setCurrentResume: (value) => set({ currentResume: value }),
      old_score: null,
      setOldScore: (value) => set({ old_score: value }),
      new_score: null,
      setNewScore: (value) => set({ new_score: value }),
      generatedData: null,
      setGeneratedData: (data) => set({ generatedData: data }),
      oldResume: {},
      setOldResume: (data) => set({ oldResume: data }),
      jobDescription: "",
      setJobDescription: (data) => set({ jobDescription: data }),
      modified_at: "",
      setModified: (data) => set({ modified_at: data }),
      filteredSection: null,
      setFilteredSection: (data) => set({ filteredSection: data }),
      isRefreshRequired: false,
      setRefresh: () => set((state) => ({ isRefreshRequired: !state.isRefreshRequired })),

      hasUntrackedChanges: false,
      setHasUntrackedChanges: (value) => set({ hasUntrackedChanges: value }),
      resetUntrackedChanges: () => set({ hasUntrackedChanges: false }),
      //CHANGES TO BE TRACKED FROM HERE
      // Personal Info
      personalInfo: {},

      // Skills
      skills: {
        technical_skills: [],
        soft_skills: []
      },

      // Social Links
      socialLinks: [],
      // Experience
      experience: [],

      // Education
      education: [],

      // Education Headings
      educationHeadings: ["DEGEREE", "INSTITUTE", "YEAR", "CGPA"],

      // Projects
      projects: [],

      // Achievements
      achievements: [],

      certifications:[],

      // Hobbies
      hobbies: [],

      // Languages
      languages: [],

      //Reset all states
      resetAllState: () => set({
        resumeId: null,
        currentResume: "Untitled Resume",
        old_score: null,
        new_score: null,
        generatedData: null,
        oldResume: {},
        jobDescription: "",
        modified_at: "",
        filteredSection: null,
        isRefreshRequired: false,
        hasUntrackedChanges: false,
      personalInfo: {},
      skills: {
        technical_skills: [],
        soft_skills: []
      },
      socialLinks: [],
      experience: [],
      education: [],
      educationHeadings: ["DEGEREE", "INSTITUTE", "YEAR", "CGPA"],
      projects: [],
      achievements: [],
      hobbies: [],
      languages: [],
      certifications:[]
      }),

      updatePersonalInfo: (field, value) =>
        set((state) => ({
          personalInfo: { ...state.personalInfo, [field]: value },
          hasUntrackedChanges: true
        })),

      // SKILLS
      addSkill: (category, value) =>
        set((state) => ({
          skills: {
            ...state.skills,
            [category]: [...state.skills[category], value],
          },
          hasUntrackedChanges: true
        })),

      removeSkill: (category, index) =>
        set((state) => ({
          skills: {
            ...state.skills,
            [category]: state.skills[category].filter((_, i) => i !== index),
          },
          hasUntrackedChanges: true
        })),

      updateSkill: (category, index, newSkill) =>
        set((state) => {
          const updatedSkills = [...state.skills[category]];
          if (index >= 0 && index < updatedSkills.length) {
            updatedSkills[index] = newSkill;
          }
          return {
            skills: {
              ...state.skills,
              [category]: updatedSkills,
            },
            hasUntrackedChanges: true
          };
        }),

      // Socials
      addSocialLink: () =>
        set((state) => (
          {
            socialLinks: [
              ...state.socialLinks,
              {
                platform: "New Link",
                url: "",
                icon: "",
                label: "",
              }
            ],
            hasUntrackedChanges: true
          })),

      removeSocialLink: (index) =>
        set((state) => ({
          socialLinks: state.socialLinks.filter((_, i) => i !== index),
          hasUntrackedChanges: true
        })),
      updateSocialLink: (index, field, value) =>
        set((state) => {
          const updatedSocialLinks = [...state.socialLinks];
          if (index >= 0 && index < updatedSocialLinks.length) {
            updatedSocialLinks[index] = {
              ...updatedSocialLinks[index],
              [field]: value,
            };
          }
          return {
            socialLinks: updatedSocialLinks,
            hasUntrackedChanges: true
          };
        }),

      // Experience
      addExperience: () =>
        set((state) => ({
          experience: [
            ...state.experience,
            {
              title: "Role",
              company: "Company Name",
              location: "Location",
              startDate: "dd-mm-yyyy",
              endDate: "dd-mm-yyyy",
              description: "",
            },
          ],
          hasUntrackedChanges: true
        })),
      updateExperience: (index, field, value) =>
        set((state) => {
          const updatedExperience = [...state.experience];
          updatedExperience[index] = { ...updatedExperience[index], [field]: value };
          return {
            experience: updatedExperience,
            hasUntrackedChanges: true
          };
        }),
      updateExperienceWithName: (companyName, field, value) =>
        set((state) => {
          const updatedExperience = state.experience.map((exp) =>
            exp.company === companyName ? { ...exp, [field]: value } : exp
          );
          return {
            experience: updatedExperience,
            hasUntrackedChanges: true
          };
        }),
      removeExperience: (index) =>
        set((state) => ({
          experience: state.experience.filter((_, i) => i !== index),
          hasUntrackedChanges: true
        })),

      // Education
      addEducation: () =>
        set((state) => ({
          education: [
            ...state.education,
            {
              degree: "Degeree",
              school: "Untitled School",
              location: "Untitled Location",
              startDate: "dd-mm-yyyy",
              endDate: "dd-mm-yyyy",
              gpa: "x.x",
            },
          ],
          hasUntrackedChanges: true
        })),
      updateEducation: (index, field, value) =>
        set((state) => {
          const updatedEducation = [...state.education];
          updatedEducation[index] = { ...updatedEducation[index], [field]: value };
          return {
            education: updatedEducation,
            hasUntrackedChanges: true
          };
        }),
      removeEducation: (index) =>
        set((state) => ({
          education: state.education.filter((_, i) => i !== index),
          hasUntrackedChanges: true
        })),

      //PROJECTS
      addProject: () =>
        set((state) => ({
          projects: [
            ...state.projects,
            {
              name: "Untitled Project",
              description: "Description",
              link: "",
            },
          ],
          hasUntrackedChanges: true
        })),

      addProjectWithDetails: (name, description, link) => set((state) => ({
        projects: [
          ...state.projects,
          {
            name,
            description,
            link: link || "",
          },
        ],
        hasUntrackedChanges: true
      })),

      updateProject: (index, field, value) =>
        set((state) => {
          const updatedProjects = [...state.projects];
          updatedProjects[index] = { ...updatedProjects[index], [field]: value };
          return {
            projects: updatedProjects,
            hasUntrackedChanges: true
          };
        }),

      removeProject: (index) =>
        set((state) => ({
          projects: state.projects.filter((_, i) => i !== index),
          hasUntrackedChanges: true
        })),

      // Update a project by its name
      updateProjectByName: (projectName, field, value) =>
        set((state) => {
          const updatedProjects = state.projects.map((project) =>
            project.name === projectName
              ? { ...project, [field]: value }
              : project
          );
          return {
            projects: updatedProjects,
            hasUntrackedChanges: true
          };
        }),

      // Remove a project by its name
      removeProjectByName: (projectName) =>
        set((state) => ({
          projects: state.projects.filter((project) => project.name !== projectName),
          hasUntrackedChanges: true
        })),

      //ACHIEVEMENTS
      addAchievement: (value) => set((state) => ({
        achievements: [...state.achievements, value],
        hasUntrackedChanges: true
      })),

      removeAchievement: (index) =>
        set((state) => ({
          achievements: state.achievements.filter((_, i) => i !== index),
          hasUntrackedChanges: true
        })),

      updateAchievement: (index, newAchievement) =>
        set((state) => {
          const updatedAchievements = [...state.achievements];
          if (index >= 0 && index < updatedAchievements.length) {
            updatedAchievements[index] = newAchievement;
          }
          return {
            achievements: updatedAchievements,
            hasUntrackedChanges: true
          };
        }),

      //HOBBIES
      addHobby: () =>
        set((state) => ({
          hobbies: [...state.hobbies, "New Hobby"],
          hasUntrackedChanges: true
        })),

      removeHobby: (index) =>
        set((state) => ({
          hobbies: state.hobbies.filter((_, i) => i !== index),
          hasUntrackedChanges: true
        })),

      updateHobby: (index, newHobby) =>
        set((state) => {
          const updatedHobbies = [...state.hobbies];
          if (index >= 0 && index < updatedHobbies.length) {
            updatedHobbies[index] = newHobby;
          }
          return {
            hobbies: updatedHobbies,
            hasUntrackedChanges: true
          };
        }),

      //CERTIFICATIONS

      addCertification: () =>
        set((state) => ({
          certifications: [...state.certifications, "New Certification"],
          hasUntrackedChanges: true
        })),

      removeCertification: (index) =>
        set((state) => ({
          certifications: state.certifications.filter((_, i) => i !== index),
          hasUntrackedChanges: true
        })),

      updateCertification: (index, newCertification) =>
        set((state) => {
          const updatedCertifications = [...state.certifications];
          if (index >= 0 && index < updatedCertifications.length) {
            updatedCertifications[index] = newCertification;
          }
          return {
            certifications: updatedCertifications,
            hasUntrackedChanges: true
          };
        }),

      //LANGUAGES
      addLanguage: (value) => set((state) => ({
        languages: [...state.languages, value],
        hasUntrackedChanges: true
      })),
      removeLanguage: (index) =>
        set((state) => ({
          languages: state.languages.filter((_, i) => i !== index),
          hasUntrackedChanges: true
        })),
      updateLanguage: (index, newlangauge) =>
        set((state) => {
          const updatedLanguages = [...state.languages];
          if (index >= 0 && index < updatedLanguages.length) {
            updatedLanguages[index] = newlangauge;
          }
          return {
            languages: updatedLanguages,
            hasUntrackedChanges: true
          };
        }),

      //EXTRACTED RESUME       
      setExtractedResumeData: (data) => {
        set((state) => ({
          personalInfo: data["personalInfo"] || state.personalInfo,
          skills: data["skills"] || [],
          socialLinks: data["socialLinks"] || [],
          experience: data["experience"] || [],
          education: data["education"] || [],
          projects: data["projects"] || [],
          achievements: data["achievements"] || [],
          certifications: data["certifications"] || [],
          hasUntrackedChanges: true
        }));
      },

      setEnhancedData: (data) => {
        set((state) => ({
          personalInfo: data["personalInfo"] || state.personalInfo,
          skills: data["skills"] || state.skills,
          experience: data["experience"] || state.experience,
          projects: data["projects"] || state.projects,
          achievements: data["achievements"] || state.achievements,
          certifications: data["certifications"] || state.certifications,
          hasUntrackedChanges: true
        }));
      }
    }),
    {
      name: 'profile-store', // name of the item in localStorage
      storage: createJSONStorage(() => localStorage), // use localStorage
    }
  )
);

export default useProfileStore;