export const handleGeneratedData = (response, setEnhancedData, data) => {
  const parseDuration = (durationStr) => {
    if (!durationStr) return { start: '', end: '' };
    const [start = '', end = ''] = durationStr.split('-').map(s => s.trim());
    return { start, end };
  };

  const processProjects = () => {
    const removedNames = response?.projects?.removed || [];
    const modifiedProjects = response?.projects?.modified || [];
    const newProjects = response?.projects?.newly_added || [];

    const filteredExisting = (data.projects || []).filter(
      project => !removedNames.includes(project.name)
    );

    const mergedProjects = filteredExisting.map(project => {
      const modified = modifiedProjects.find(m => m.project_name === project.name);
      return modified ? { 
        ...project, 
        description: modified.description
      } : project;
    });

    const addedProjects = newProjects.map(np => ({
      name: np.project_name || 'New Project',
      description: np.description || 'Project description',
      link: ''
    }));

    return [...mergedProjects, ...addedProjects];
  };

  const processExperience = () => {
    const removedExperiences = response?.experience?.removed || [];
    const modifiedExperiences = response?.experience?.modified || [];
    const newExperiences = response?.experience?.newly_added || [];

    const filteredExisting = (data.experience || []).filter(
      exp => !removedExperiences.includes(exp.company)
    );

    const mergedExperiences = filteredExisting.map(exp => {
      const modified = modifiedExperiences.find(m => m.company === exp.company);
      return modified ? { 
        ...exp, 
        description: modified.description || exp.description
      } : exp;
    });

    const addedExperiences = newExperiences.map(ne => ({
      company: ne.company || 'New Company',
      position: ne.position || 'Position',
      location: ne.location || '',
      duration: ne.duration || '',
      description: ne.description || 'Experience description'
    }));

    return [...mergedExperiences, ...addedExperiences];
  };

  // ✅ New: Process Certifications
  const processCertifications = () => {
    const removedCerts = response?.certifications?.removed || [];
    const modifiedCerts = response?.certifications?.modified || [];
    const newCerts = response?.certifications?.newly_added || [];

    const filteredExisting = (data.certifications || []).filter(
      cert => !removedCerts.includes(cert.name)
    );

    const mergedCerts = filteredExisting.map(cert => {
      const modified = modifiedCerts.find(m => m.name === cert.name);
      return modified ? {
        ...cert,
        name: modified.name || cert.name,
        issuer: modified.issuer || cert.issuer,
        date: modified.date || cert.date
      } : cert;
    });

    const addedCerts = newCerts.map(nc => ({
      name: nc.name || 'New Certification',
      issuer: nc.issuer || '',
      date: nc.date || ''
    }));

    return [...mergedCerts, ...addedCerts];
  };

  let updatedDescription = data.personalInfo.summary;
  if (response?.description) updatedDescription = response.description;

  const updatedData = {
    personalInfo: {
      ...data.personalInfo,
      summary: updatedDescription
    },
    skills: {
      technical_skills: [
        ...new Set([
          ...data.skills.technical_skills,
          ...(response?.skills_missing?.technical_skills || [])
        ])
      ],
      soft_skills: [
        ...new Set([
          ...data.skills.soft_skills,
          ...(response?.skills_missing?.soft_skills || [])
        ])
      ]
    },
    projects: processProjects(),
    experience: processExperience(),
    certifications: processCertifications(), 
    achievements: [
      ...new Set([
        ...(data?.achievements || []),
        ...(response.achievements || [])
      ])
    ]
  };

  setEnhancedData(updatedData);
  return updatedData;
};

export const getUpdatedSections = (response,data,
  updatePersonal,
  addProjectWithDetails,updateProjectByName,removeProjectByName,
  addSkill,addAchievement,updateExperienceWithName,
  setGeneratedData) => {
  let updatedSections = [];

  const description = response?.description;
  if(description!==undefined && description.length>0){
    updatedSections.push({
      content: "Enhanced description",
      heading: "Personal Info",
      generated_data:description,
      onClick : (dataToBeAdded)=> {
        updatePersonal("summary",dataToBeAdded);
        const updatedData = {
          ...response,
          description : ""
      };
      setGeneratedData(updatedData)
      }
    });
  }
  if (response==null || !response.description) {
    updatedSections.filter(section => section.heading !== "Personal Info");
  }

  const new_skills = response?.skills_missing || {};
  const hasSkills = Object.values(new_skills).some((skills) => skills.length > 0);
  if (Object.keys(new_skills).length > 0) {
    updatedSections.push({
      content: "Relevant skills",
      heading: "Skills",
      generated_data: new_skills,
      onClick: (addedSkills) => {
        let updatedSkills = { ...response.skills_missing }; // Copy existing missing skills
        Object.entries(addedSkills).forEach(([category, skills]) => {
          skills.forEach(skill => {
            addSkill(category, skill);
            // Remove the skill from the missing skills list
            if (updatedSkills[category]) {
              updatedSkills[category] = updatedSkills[category].filter(s => s !== skill);
      
              // Remove the category if it has no more missing skills
              if (updatedSkills[category].length === 0) {
                delete updatedSkills[category];
              }
            }
          });
        });
        const updatedData = {
          ...response,
          skills_missing: Object.keys(updatedSkills).length > 0 ? updatedSkills : null,
        };
        setGeneratedData(updatedData);
      }      
    });
  }
  // const keywords = response?.keywords;
  // if(keywords!== undefined && keywords.length>0){
  //   updatedSections.push({
  //     content: "ATS perfect keywords",
  //     heading: "Skills",
  //     generated_data: keywords
  //   });
  // }
  if (!hasSkills) {
    updatedSections = updatedSections.filter(section => section.heading !== "Skills");
}
const projectsModified = Array.isArray(response?.projects?.modified) ? response.projects.modified : [];
const projectsNewlySuggested = Array.isArray(response?.projects?.newly_added) ? response.projects.newly_added : [];
const projectsRemoved = Array.isArray(response?.projects?.removed) ? response.projects.removed : [];

if (projectsModified.length > 0 || projectsNewlySuggested.length > 0 || projectsRemoved.length > 0) {
  updatedSections.push({
    content: "Highly Impactful projects",
    heading: "Projects",
    generated_data: { 
      "modified": projectsModified,
      "added": projectsNewlySuggested,
      "removed": projectsRemoved
    },
    onClick: (data) => {
      // Handle modified projects
      if (data.modified && Array.isArray(data.modified)) {
        data.modified.forEach((project) => {
          const { project_name, description } = project;
          updateProjectByName(project_name, "description", description);
        });
      }

      // Handle newly added projects
      if (data.added && Array.isArray(data.added)) {
        data.added.forEach((project) => {
          const { project_name, description } = project;
          addProjectWithDetails(project_name, description, "");
        });
      }

      // Handle removed projects
      if (data.removed && Array.isArray(data.removed)) {
        data.removed.forEach((project_name) => {
          removeProjectByName(project_name);
        });
      }

      // Update the state without using prevData
      const updatedModifiedProjects = Array.isArray(response?.projects?.modified)
        ? response.projects.modified.filter(
            (proj) => !data.modified.some((item) => item.project_name === proj.project_name)
          )
        : [];

      const updatedAddedProjects = Array.isArray(response?.projects?.newly_added)
        ? response.projects.newly_added.filter(
            (proj) => !data.added.some((item) => item.project_name === proj.project_name)
          )
        : [];

      const updatedRemovedProjects = Array.isArray(response?.projects?.removed)
        ? response.projects.removed.filter(
            (proj) => !data.removed.some((item) => item.project_name === proj.project_name)
          )
        : [];

      setGeneratedData({
        ...response,
        projects: {
          ...response.projects,
          modified: updatedModifiedProjects,
          newly_added: updatedAddedProjects,
          removed: updatedRemovedProjects,
        },
      });
    },
  });
}
  let generated_achievements = Array.isArray(response?.achievements) ? response.achievements : [];
  if(data?.achievements.length>0) {
    generated_achievements = generated_achievements.filter((ach) => !data.achievements.includes(ach));
  }
  
  if (generated_achievements.length > 0) {
    updatedSections.push({
      content: "Achievements",
      heading: "Achievements",
      generated_data: generated_achievements,
      onClick: (data) => {
        data.forEach((item) => addAchievement(item));
        const updatedData = {...response,
          achievements: response.achievements.filter(item => !data.includes(item))}
        setGeneratedData(updatedData)
      } 
    });
  }

  if (!generated_achievements) {
    updatedSections.filter(section => section.heading !== "Achievements");
  }

  const experienceModified = Array.isArray(response?.experience?.modified) ? response.experience.modified : [];

  if (experienceModified.length > 0) {
    updatedSections.push({
        content: "Tweak your experience",
        heading: "Experience",
        generated_data: { experienceModified },
        onClick: (dataToBeAdded) => {
          let updatedExperienceList = Array.isArray(response?.experience?.modified)
              ? [...response.experience.modified]
              : [];
      
          dataToBeAdded.forEach((exp) => {
              updateExperienceWithName(exp.company, "company", exp.company);
              updateExperienceWithName(exp.company, "description", exp.description);
          });
      
          updatedExperienceList = updatedExperienceList.filter(
              (exp) => !dataToBeAdded.some((item) => item.company === exp.company)
          );
      
          setGeneratedData({
              ...response,
              experience: {
                  ...response.experience,
                  modified: updatedExperienceList
              }
          });
      },
    });
  }
  return updatedSections;
};

export const constructGeneratedData = (updatedSections, response) => {
  const generatedData = {
    keywords: response?.keywords || [],
    skills_missing: {
      technical_skills: [],
      soft_skills: []
    },
    description: "",
    projects: {
      modified: [],
      newly_added: [],
      removed: [],
    },
    experience: {
      modified: [],
    },
    achievements: [],
    old_score: response?.old_score, // Default score
    new_score: response?.new_score, // Default score
  };

  updatedSections.forEach((item) => {
    switch (item.heading) {
      case "Personal Info":
        generatedData.description = item.generated_data || "";
        break;
      case "Skills":
        generatedData.skills_missing = item.generated_data || {
          technical_skills: [],
          soft_skills: [],
        };
        break;
      case "Projects":
        generatedData.projects = {
          modified: item.generated_data?.modified || [],
          newly_added: item.generated_data?.added || [],
          removed: item.generated_data?.removed || [],
        };
        break;
      case "Experience":
        generatedData.experience = {
          modified: item.generated_data?.experienceModified || [],
        };
        break;
      case "Achievements":
        generatedData.achievements = item.generated_data || [];
        break;
      default:
        break;
    }
  });

  return generatedData;
};
