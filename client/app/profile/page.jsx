'use client';
import SkillsSection from '@/components/editor/Skills';
import AchievementsSection from '@/components/editor/Achievements';
import '@/styles/profile.css';
import '@/styles/editor.css';
import { useEffect, useRef, useState } from 'react';
import NewSideBar from '@/components/layouts/NewSideBar';
import useUserDetailsStore from '@/store/userDetails';
import PersonalInfoSection from '@/components/editor/Personal';
import LinksSection from '@/components/editor/Links';
import ExperienceSection from '@/components/editor/Experience';
import ProjectsSection from '@/components/editor/Projects';
import EducationSection from '@/components/editor/Education';
import { getProfileDetails, updateProfileDetails } from '@/lib/fetchUtil';
import Loader from '@/components/reusables/Loader';
import useClickOutside from '@/hooks//useClickOutside';
import { CircleX } from 'lucide-react';
import useToastStore from '@/store/toastStore';
import NewUpload from '@/components/FileUpload/NewUpload';
import useIsMobile from '@/hooks/IsMobile';

export default function page() {
  const isMobile = useIsMobile();
  const percentage = useRef('30');
  
  const sectionRefs = {
    'Personal Info': useRef(null),
    'Links': useRef(null),
    'Experience': useRef(null),
    'Projects': useRef(null),
    'Education': useRef(null),
    'Skills': useRef(null),
    'Achievements': useRef(null),
    'Certifications': useRef(null),
    'Hobbies': useRef(null),
    'Languages': useRef(null),
  };

  const leftNavigation = Object.keys(sectionRefs);
  const [activeProfileSection, setActiveProfileSection] = useState("Personal Info");
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isResumeUploaded, setIsResumeUploaded] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isRotating, setIsRotating] = useState(false);
  const [isUpdated, setIsUpdated] = useState(false);
  const addToast = useToastStore((state) => state.addToast);
  const { resetAllState } = useUserDetailsStore();

  // Reference to the scrollable container
  const scrollContainerRef = useRef(null);

  const dropdownRef = useRef(null);
  useClickOutside(dropdownRef, () => setIsUploadOpen(false));

  const {
    setUserDetails,
    user_details: {
      personalInfo, 
      skills, 
      socialLinks, 
      experience, 
      education, 
      projects, 
      hobbies, 
      certifications,
      languages, 
      achievements
    }, 
    user_details: data,
    updatePersonalInfo,
    addSkill, updateSkill, removeSkill,
    addSocialLink, removeSocialLink, updateSocialLink,
    addExperience, updateExperience, removeExperience,
    addProject, removeProject, updateProject,
    addEducation, updateEducation, removeEducation,
    addHobby, removeHobby, updateHobby,
    addLanguage, updateLanguage, removeLanguage,
    addCertification,removeCertification,updateCertification,
    addAchievement, updateAchievement, removeAchievement,
    hasUntrackedChanges, resetUntrackedChanges,setHasUntrackedChanges, setModified,
    setUserId
  } = useUserDetailsStore();

  // Set up intersection observer to track active section
  useEffect(() => {
    if (isLoading) return;
    
    const options = {
      root: scrollContainerRef.current,
      rootMargin: '-10% 0px -70% 0px', // Adjust these values to control when a section is considered "active"
      threshold: 0
    };

    const observerCallback = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Find which section this element belongs to
          const sectionName = Object.keys(sectionRefs).find(
            key => sectionRefs[key].current === entry.target
          );
          
          if (sectionName && sectionName !== activeProfileSection) {
            setActiveProfileSection(sectionName);
          }
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, options);
    
    // Observe all section refs
    Object.values(sectionRefs).forEach(ref => {
      if (ref.current) {
        observer.observe(ref.current);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [isLoading, sectionRefs, activeProfileSection]);

  // Replace the existing handleNavigationClick with this updated version
  const handleNavigationClick = (section) => {
    scrollToActiveSection(section);
  };

  const handleSaveChanges = async () => {
    try {
      setIsRotating(true);
      const response = await updateProfileDetails(data);
  
      if (response !== null) {
        setModified(response.profile_details.modified_at);
      }
  
      setIsRotating(false);
  
      if (response?.profile_details != null) {
        setUserDetails(response?.profile_details?.resume_data);
        resetUntrackedChanges();
      }
  
      setHasUntrackedChanges(false)
      setIsUpdated(true);
      setTimeout(() => setIsUpdated(false), 3000);
    } catch (error) {
      console.error("Failed to save changes:", error);
      setIsRotating(false);
      addToast("Failed to Save Changes",'error','top-middle',3000)
    }
  };
  

  useEffect(() => {
    const storedData = localStorage.getItem("user-details-storage");

    const fetchData = async() => {
      const response = await getProfileDetails();
      if(response?.profile_details != null) {
        setUserDetails(response?.profile_details?.resume_data);
        setUserId(response?.profile_details?.user_id)
      }else{
        resetAllState();
      }
      setHasUntrackedChanges(false)
    }
    // if(!storedData){
      fetchData();
    // }
    setIsLoading(false);
  }, [isResumeUploaded]);

  // Add this function to handle scrolling for mobile view
const scrollToActiveSection = (section) => {
  setActiveProfileSection(section);
  
  if (sectionRefs[section]?.current) {
    // For mobile, we want to ensure the section is fully visible
    if (isMobile) {
      sectionRefs[section].current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start' // Aligns the top of the element to the top of the viewport
      });
    } else {
      // Desktop behavior remains the same
      sectionRefs[section].current.scrollIntoView({ behavior: 'smooth' });
    }
  }
};

  // Update the intersection observer effect to use our scrolling function
  useEffect(() => {
  if (isLoading) return;
  
  const options = {
    root: scrollContainerRef.current,
    rootMargin: isMobile ? '-5% 0px -75% 0px' : '-10% 0px -70% 0px', // Adjusted margins for mobile
    threshold: 0
  };

  const observerCallback = (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Find which section this element belongs to
        const sectionName = Object.keys(sectionRefs).find(
          key => sectionRefs[key].current === entry.target
        );
        
        if (sectionName && sectionName !== activeProfileSection) {
          setActiveProfileSection(sectionName);
          
          // If on mobile and we're scrolling past sections, ensure the navigation item is visible
          if (isMobile) {
            const navItems = document.querySelectorAll('.navigation-item');
            navItems.forEach(item => {
              if (item.textContent.trim() === sectionName) {
                item.scrollIntoView({ behavior: 'smooth', inline: 'center' });
              }
            });
          }
        }
      }
    });
  };

  const observer = new IntersectionObserver(observerCallback, options);
  
  // Observe all section refs
  Object.values(sectionRefs).forEach(ref => {
    if (ref.current) {
      observer.observe(ref.current);
    }
  });

    return () => {
      observer.disconnect();
    };
  }, [isLoading, sectionRefs, activeProfileSection, isMobile]);

  if(isLoading) {
    return (<Loader/>);
  }

  return (
      <div
        className={`h-screen overflow-hidden bg-bgviolet relative ${
          isMobile ? 'grid grid-rows-[auto_1fr_auto]' : 'grid grid-cols-[10vw_80vw_10vw]'
        }`}
      >
        {isUploadOpen && (
          <div className='h-screen w-screen absolute top-0 left-0 grid place-items-center z-[1000]'>
            <div className='h-full w-full bg-[#BDBBBF] opacity-50'></div>
            <div className='absolute bg-white rounded-xl'>
              <span className='absolute -top-10 right-0 text-red-500 font-semibold cursor-pointer' onClick={() => setIsUploadOpen(false)}>
                <CircleX size={32} />
              </span>
              <div className={`${isMobile ? 'h-[60vh] w-[90vw]' : 'h-[40vh] w-[40vw]'}`}>
                <NewUpload selectedFile={selectedFile} setSelectedFile={setSelectedFile} setIsResumeUploaded={setIsUploadOpen} />
              </div>
            </div>
          </div>
        )}
        {/* Sidebar */}
        <NewSideBar/>
  
        {/* Main Content */}
        <div
          ref={scrollContainerRef}
          className={`hide-scrollbar flex flex-col items-center overflow-y-scroll ${
            isMobile ? 'h-full w-full px-2' : 'h-full w-full'
          }`}
        >
          <div className={`grid place-items-center pb-10 ${isMobile ? 'w-[90%]' : 'w-[50%]'}`}>
            <h1 className="mt-5 text-xl font-semibold uppercase">
              WELCOME <span className="text-primary">{personalInfo?.firstName} {personalInfo?.lastName}</span>
            </h1>
            <p className='text-[#6B6B6B]'>Manage your profile details here</p>
  
            <div className='bg-[#EBE1FA] p-4 rounded-xl my-5 flex items-center justify-center text-center gap-4 flex-wrap'>
              <div className={`${isMobile ? 'w-full' : 'w-[70%]'}`}>
                <h2 className='font-semibold text-xl mb-2'>AutoFill my Profile</h2>
                <p className='text-sm text-[#333]'>Let us do the heavy lifting! Upload your existing resume...</p>
              </div>
              <div className={`w-full lap:w-fit`}>
                <button className='bg-primary rounded-md px-8 py-2 text-white w-full' onClick={() => setIsUploadOpen(true)}>
                  Smart Upload
                </button>
              </div>
            </div>
  
            {data && (
              <>
                {(hasUntrackedChanges && !isUpdated) && (
                  <div className='flex flex-col md:flex-row items-center w-full md:w-fit justify-between gap-2 mb-2 bg-red-600 px-4 py-2 text-white rounded-md md:sticky md:top-[10px] md:z-[999]'>
                    <p className='font-medium text-sm text-center'>Make sure you save the changes</p>
                    <button className='px-4 font-semibold bg-white text-primary rounded-md' onClick={handleSaveChanges}>Save</button>
                  </div>
                )}
  
                {isUpdated && (
                  <p className='px-4 py-2 rounded-md bg-green-400 text-white my-2 sticky top-[10px] z-[999]'>
                    Resume Updated Successfully
                  </p>
                )}
  
                {/* Sections */}
                {Object.entries(sectionRefs).map(([sectionName, ref]) => (
                  <section key={sectionName} ref={ref} className="w-full profile-section">
                    <h2 className="my-2 pb-2 text-2xl font-semibold">{sectionName}</h2>
                    {sectionName === 'Personal Info' && (
                      <PersonalInfoSection 
                        data={data} 
                        template='Modern' 
                        personalInfo={personalInfo} 
                        updatePersonalInfo={updatePersonalInfo} 
                        isProfile={true}
                      />
                    )}
                    {sectionName === 'Links' && (
                      <LinksSection
                        data={data} 
                        socialLinks={socialLinks}
                        addLink={addSocialLink}
                        updateLinks={updateSocialLink}
                        removeLink={removeSocialLink}
                      />
                    )}
                    {sectionName === 'Experience' && (
                      <ExperienceSection
                        data={data} 
                        experience={experience}
                        addExperience={addExperience}
                        updateExperience={updateExperience}
                        removeExperience={removeExperience}
                      />
                    )}
                    {sectionName === 'Projects' && (
                      <ProjectsSection
                        data={data} 
                        projects={projects}
                        addProject={addProject}
                        updateProject={updateProject}
                        removeProject={removeProject}
                      />
                    )}
                    {sectionName === 'Education' && (
                      <EducationSection
                        data={data} 
                        education={education}
                        addEducation={addEducation}
                        updateEducation={updateEducation}
                        removeEducation={removeEducation}
                      />
                    )}
                    {sectionName === 'Skills' && (
                      <SkillsSection
                        skills={skills}
                        addSkill={addSkill}
                        updateSkill={updateSkill}
                        removeSkill={removeSkill}
                      />
                    )}
                    {sectionName === 'Certifications' && (
                      <AchievementsSection
                        data={data} 
                        items={certifications}
                        addItem={addCertification}
                        updateItem={updateCertification}
                        removeItem={removeCertification}
                        heading="Certification"
                      />
                    )}
                    {sectionName === 'Achievements' && (
                      <AchievementsSection
                        data={data} 
                        items={achievements}
                        addItem={addAchievement}
                        updateItem={updateAchievement}
                        removeItem={removeAchievement}
                        heading="Achievement"
                      />
                    )}
                    {sectionName === 'Hobbies' && (
                      <AchievementsSection
                        data={data} 
                        items={hobbies}
                        addItem={addHobby}
                        updateItem={updateHobby}
                        removeItem={removeHobby}
                        heading="Hobby"
                      />
                    )}
                    {sectionName === 'Languages' && (
                      <AchievementsSection
                        data={data} 
                        items={languages}
                        addItem={addLanguage}
                        updateItem={updateLanguage}
                        removeItem={removeLanguage}
                        heading="Language"
                      />
                    )}
                  </section>
                ))}
              </>
            )}
          </div>
        </div>
  
        {/* Navigation (Right Side for Desktop / Bottom for Mobile) */}
        <div
          className={`${
            isMobile
              ? 'fixed bottom-0 left-0 w-full flex justify-around bg-white border-t z-10 overflow-x-auto hide-scrollbar'
              : 'gap-3 py-2 flex flex-col justify-center'
          }`}
        >
          {leftNavigation.map((item, i) => (
            <p
              key={i}
              className={`cursor-pointer px-4 py-2 hover:bg-lightviolet/70 smooth text-center navigation-item ${
                activeProfileSection === item ? 'bg-lightviolet text-primary' : ''
              } ${isMobile ? 'flex-shrink-0' : 'rounded-r-full'}`}
              onClick={() => handleNavigationClick(item)}
            >
              {item}
            </p>
          ))}
        </div>
      </div>
    );
  };
    