'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ChevronRight,
  ChevronsUpDown,
  Eye,
  Info,
  Maximize,
  Menu,
  X,
} from 'lucide-react';
import dynamic from 'next/dynamic';

import '@/styles/editor.css';
import { renderHtmlToCanvas } from '@/lib/downloadUtil';
import generateResume, { updateUserDetails } from '@/lib/fetchUtil';
import ReactDOMServer from 'react-dom/server';
import { resumeTour } from '@/lib/productTour';

// LeftMenu Editor Components
import ExperienceSection from '@/components/editor/Experience';
import PersonalInfoSection from '@/components/editor/Personal';
import SkillsSection from '@/components/editor/Skills';
import EducationSection from '@/components/editor/Education';
import ProjectsSection from '@/components/editor/Projects';
import AchievementsSection from '@/components/editor/Achievements';
import JD from '@/components/editor/JD';
import ChangesNavbar from '@/components/editor/ChangesNavbar';
import SectionChanges from '@/components/editor/SectionChanges';
import PageDots from '@/components/editor/PageDots';

import useProfileStore from '@/store/profileStore';
import useNavigationStore from '@/store/navigationStore';

import { SECTION_HEADINGS } from '@/data/editor';
import AiStar from '@/components/icons/AiStar';
import EditableHeading from '@/components/editor/Heading';
import ATSScore from '@/components/editor/ATSScore';

const MinimalistTemplate = dynamic(() => import('@/components/templates/new/NewSimple'));
const ImpactTemplate = dynamic(() => import('@/components/templates/new/NewImpact'));
const ATSTemplate = dynamic(() => import('@/components/templates/new/NewATS'));
const ModernTemplate = dynamic(() => import('@/components/templates/old/Modern'));
const CreativeTemplate = dynamic(() => import('@/components/templates/new/NewCreative'));

import { renderNewATS } from '@/components/templates/new/NewATS';
import { renderNewImpact } from '@/components/templates/new/NewImpact';
import { renderNewSimple } from '@/components/templates/new/NewSimple';
import { renderCreativePage } from '@/components/templates/new/NewCreative';

import { getUpdatedSections} from '@/lib/handleGeneratedData';
import LinksSection from '@/components/editor/Links';
import useToastStore from '@/store/toastStore';
import { usePathname, useRouter } from 'next/navigation';
import EnhanceStar from '@/components/icons/EnhanceStar';
import { getResumeDetails, updateResume } from '@/lib/resumeUtils';
import NewSideBar from '@/components/layouts/NewSideBar';
import { AnimatePresence, motion } from 'framer-motion';
import useClickOutside from '@/hooks/useClickOutside';
import SynChanges from '@/components/editor/SynChanges';

import OptimizeLottie from '@/components/lottie/Optimize';
import Loader from '@/components/reusables/Loader';

import useIsMobile from '@/hooks/IsMobile';
import PaginationEl from '@/components/editor/Pagination';
import { getTimeAgo } from '@/lib/dateUtil';
import { customFetch } from '@/lib/apiWrapper';
import FeedbackComponent from '@/app/feedback/page';
import { useAuthStore } from '@/store/authStore';
import ProductTour from '@/components/reusables/ProductTour';
import useAPIWrapper from '@/hooks/useAPIWrapper';

export default function EditorClient({ template,resumeId}) {
  const isMobile = useIsMobile();
  const router = useRouter();
  const pathname = usePathname()
  const segments = pathname.split('/');
  const id = segments[segments.length - 1];

  const {
    personalInfo,updatePersonalInfo: updatePersonal,
    skills,addSkill,updateSkill,removeSkill,
    experience,addExperience,updateExperience,removeExperience,updateExperienceWithName,
    education,addEducation,updateEducation,removeEducation,
    educationHeadings: education_headings,
    projects,addProject,removeProject,updateProject,updateProjectByName,removeProjectByName,addProjectWithDetails,
    achievements,addAchievement,updateAchievement,removeAchievement,
    hobbies,addHobby,updateHobby,removeHobby,
    languages,addLanguage,updateLanguage,removeLanguage,
    socialLinks,addSocialLink,removeSocialLink,updateSocialLink,
    certifications,addCertification,removeCertification,updateCertification,
    currentResume,setCurrentResume,
    generatedData,setGeneratedData,
    oldResume,setOldResume,
    modified_at,setModified,
    new_score,old_score,setNewScore,setOldScore,
    jobDescription,setJobDescription,
    filteredSection,setFilteredSection,
    setResumeId,setExtractedResumeData,
  } = useProfileStore();
  const { activeSection, setActiveSection,isJDActive,toggleEditor,setIsTemplatesVisible,showMobilePreview,toggleMobilePreview  } =useNavigationStore();
  const data = {
    personalInfo,
    skills,
    experience,
    education,
    education_headings,
    projects,
    achievements,
    certifications,
    socialLinks,
    hobbies,
    languages,
    userImage:personalInfo.profileImage,
  };
  const {checkFeatureExists,user,setUser} = useAuthStore();
  const {setGetFeedback,isTourOpen,setIsTourOpen} = useNavigationStore();

  const [isChecked, setIsChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isOptimizing, setOptimizing] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [sections, setSections] = useState([]);
  const [downloadToggled,setDownloadToggled] = useState(false);
  const [isDownLoading,setIsDownLoading] = useState(false);
  const [pages, setPages] = useState([]); // Stores content for each page
  const [currentPage, setCurrentPage] = useState(0); // Current page index
  const [changesHeadingOpen,setChangesHeadingOpen] = useState(true)
  const [changesContentOpen,setChangesContentOpen] = useState(false);
  const [showInfoDialog, setShowInfoDialog] = useState(false);
  const [iSideBarOpen,setIsSideBarOpen] = useState(true)
  const [remainingHeights,setRemainingHeights] = useState([])
  // const [isCanvasGenerating,setCanvasGenerating] = useState(false)
  const addToast = useToastStore((state) => state.addToast)
  const dropdownRef = useRef(null);
  const isCanvasGenerating = useRef(false);
  useClickOutside(dropdownRef, () => setDownloadToggled(false));
  const canvasRef = useRef(null);
  const [isCanvasPresent, setIsCanvasPresent] = useState(false);
  const [fullScreenMode, setFullScreenMode] = useState(false);
  const [showFeedBack,setShowFeedBack] = useState(false);
  const {callApi,loading} = useAPIWrapper();

  useEffect(() => {
    if (showMobilePreview) {
      // Optional: prevent body scrolling when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      // Restore scrolling when modal is closed
      document.body.style.overflow = 'auto';
    }
  },[showMobilePreview])

  useEffect(() => {
    const storedData = localStorage.getItem("profile-store");
    const fetchResumeDetails = async () => {
      if (resumeId === null) {
        router.push("/dashboard");
        setIsTemplatesVisible(false)
      } else{
        setIsLoading(true)
        const response = await getResumeDetails(resumeId);
        if(response){
          setGeneratedData(response?.data?.generated_data);
          setExtractedResumeData(response.data.resume_data);
          setJobDescription(response.data.job_description)
          setCurrentResume(response.data.name)
          setResumeId(response.data._id);
          setModified(response.data.modified_at);
          setOldScore(response?.data?.old_score)
          setNewScore(response?.data?.new_score)
          //If enhanced data is available
          if(response?.data?.generated_data){
            if(isJDActive)  toggleEditor();
            setChangesHeadingOpen(true);
            fetchUpdatedSections();
          }
          if(response?.data?.old_resume){
            setOldResume(response.data.old_resume)
          }
        }
        setIsLoading(false)
        // handleCanvas()
      }
    };
    if(!storedData){
      fetchResumeDetails();
    }
    setIsLoading(false)
  }, [resumeId]);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      if (canvasRef.current) {
        const canvas = canvasRef.current.querySelector('canvas');
        setIsCanvasPresent(!!canvas);
      }
    });

    if (canvasRef.current) {
      observer.observe(canvasRef.current, {
        childList: true,
        subtree: true,
      });

      // Initial check
      const canvas = canvasRef.current.querySelector('canvas');
      setIsCanvasPresent(!!canvas);
    }

    return () => observer.disconnect();
  }, []);


  const handleGenerate = async () => {
    try {
      if(!jobDescription || (!personalInfo || Object.values(personalInfo).every((value) => value === '' || value === null))){
        setShowInfoDialog(true);
        if(!isJDActive){
          toggleEditor();
        }
        setTimeout(()=>setShowInfoDialog(false),3000)
        return;
      }

      setIsLoading(true);
      setOldResume(data);

      let response = await generateResume(prompt, data, jobDescription,resumeId);
      let responseJson = await response.json()

      if(response.status!==200){
        addToast('An error occurred while generating resume', 'error', 'top-middle', 3000)
        return;
      }

      if (responseJson?.generated_resume) {
        responseJson = responseJson.generated_resume;
      }

      setGeneratedData(responseJson || ''); // Ensure it's not null
      if(responseJson.title)  setCurrentResume(responseJson.title)
      if(isJDActive)  toggleEditor();
      const updatedResponse = await updateResume(id, jobDescription, data, responseJson.title);

      // await new Promise(resolve => setTimeout(resolve, 2000));
      // handleCanvas()

    } catch (error) {
      console.error(error?.message)
      addToast('An error occurred while generating resume', 'error', 'top-middle', 3000)
    } finally {
      setIsLoading(false);
      // window.location.reload()
      setChangesHeadingOpen(true);
    }
  };

  const getTemplateComponent = (resume_data, isOldResumeRender) => {
    if(isOldResumeRender && oldResume === null || oldResume?.length === 0){
      return (
        <h1>
          Sorry no old Resume Data Found. Please generate a new resume first to
          compare
        </h1>
      );
    }
    let final_data = resume_data
    if(isOldResumeRender){
      final_data = {
        ...resume_data,
        personalInfo : resume_data.personalInfo
      }
    }
    // Common props for all templates
    const templateProps = {
      template,
      data: final_data,
      pages,
      setPages,
      currentPage,
      setCurrentPage,
      remainingHeights,
      setRemainingHeights,
      updatePersonal,
      isCanvasGenerating
    };

    switch (template.name) {
      case 'Minimalist':
        return <MinimalistTemplate {...templateProps} />;
      case 'Impact':
        return <ImpactTemplate {...templateProps} />;
      case 'Professional':
        return <ATSTemplate {...templateProps} />;
      case 'Tech Modern':
        return <ModernTemplate {...templateProps} />;
      case 'Creative Portfolio':
        return <CreativeTemplate {...templateProps} />;
      default:
        return <div>Template not found</div>;
    }
  };

  const getRenderFunction= (pages,pageno)=>{
    switch (template.name){
      case 'Minimalist':
        return renderNewSimple(pages,pageno)
      case 'Impact':
        return renderNewImpact(pages,pageno)
      case 'Professional':
        return renderNewATS(pages,pageno)
      case 'Tech Modern':
        return renderNewImpact(pages,pageno)
      case 'Creative Portfolio':
        return renderCreativePage(pages[pageno])
      case 'Modern':
        return <ModernTemplate data={oldResume} />;
      default:
        return null;
    }
  }

  const getHtml = (templateName=null) => {
    // Render each page separately and conditionally add margin to pages after page 0
    const isSpacingNeeded = templateName!= null && templateName !== "Creative Portfolio"
    const template = pages.map((page, pageno) => (
      <div
        key={`page-${pageno}`}
        className={`resume-template ${(pageno>0 && isSpacingNeeded) ?'margin':''} ${isSpacingNeeded ? 'padding':''}`}
      >
        {getRenderFunction(pages, pageno)}
      </div>
    ));
    const componentHtml = ReactDOMServer.renderToString(<>{template}</>);

    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Resume</title>
          <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
              body {
                font-family: 'Roboto', sans-serif;
                margin: 0;
                padding: 0;
              }
              .margin{
                margin-top:10px;
              }
              .resume-template {
                width: 210mm;
                height: 1100px;
                background: white;
                box-sizing: border-box;
              }
              .padding{
                padding: 0 10px;
              }
              @media print {
                .resume-template {
                  page-break-after: always;
                }
              }
          </style>
      </head>
      <body>
          ${componentHtml}
      </body>
      </html>
    `;
    return html;
  };

  const handlePDFDownload = async () => {
    try {
      setIsDownLoading(true);
      setDownloadToggled(false);

      const html = getHtml(template?.name);
      const response = await customFetch(`${process.env.NEXT_PUBLIC_DOWNLOAD_API_URL}/api/generate-pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ html }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      const blob = await response.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${currentResume}.pdf`;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error('Error downloading PDF:', error);
    } finally {
      setIsDownLoading(false);
      if(!showFeedBack){
        setShowFeedBack(true)
      }
    }
  };


  const handleCanvas = async () => {
    try {
      if (isCanvasGenerating.current) return;
      // setCanvasGenerating(true)
      isCanvasGenerating.current= true
      const right = document.querySelector('.resume-container');
      const fullScreen = document.querySelector('.full-screeen-resume-container');
      if (!right) return;

      const resume = document.querySelector('.resume-template-2');
      if (!resume) {
        console.error('.resume-template not found in the DOM');
        isCanvasGenerating.current= false
        // setCanvasGenerating(false)
        return;
      }

      // Temporarily make elements visible for capture
      // if(resume){
      // resume.style.opacity = '1';
      // resume.style.position = 'absolute';
      // resume.style.disisCanvasGeneratingplay = 'block';
      // resume.style.top = '-9999px';
      // resume.style.left = '-9999px';
      // }

      const canvas = await renderHtmlToCanvas(resume);
      const A4_WIDTH = 1240;
      const A4_HEIGHT = 1754;

      canvas.style.width = `100%`;
      // canvas.style.width = `${A4_HEIGHT}px`;
      // canvas.style.height = `${A4_WIDTH}px`;
      // const scaleFactor = 0.5; // Adjust this as needed
      // canvas.style.transform = `scale(${scaleFactor}) translate(-50%, -50%)`;
      // canvas.style.position = `absolute`;
      // canvas.style.top = `50%`;
      // canvas.style.left = `50%`;

    //  if(resume){
    //    // Reset resume styles after rendering
    //    resume.style.opacity = '0';
    //    resume.style.position = 'static';
    //    resume.style.display = 'none';
    //  }
      // Remove existing canvas
      canvas.classList.add('canvas-genresume');
      if(fullScreen){
        canvas.style.height = '1100px';
        const fullScreenCanvas = fullScreen.querySelectorAll('.canvas-genresume');
        fullScreenCanvas.forEach(canvas => canvas.remove());
        fullScreen.append(canvas);
        isCanvasGenerating.current= false
        return canvas;
      }else{
        canvas.style.height = `100%`;
        const existingCanvas = right.querySelectorAll('.canvas-genresume');
        existingCanvas.forEach(canvas => canvas.remove());
        right.prepend(canvas);
      }
      isCanvasGenerating.current= false
      // setCanvasGenerating(false)
      return canvas;
    } catch (error) {
      console.error('Failed to handle canvas:', error);
      isCanvasGenerating.current= false
      // setCanvasGenerating(false)
    }
  };
  // Add this function to handle mobile preview canvas rendering
  const handleMobileCanvas = async () => {
    try {
      if (!showMobilePreview || isCanvasGenerating.current) {
        return;
      }

      // Get the mobile container
      const mobileContainer = document.querySelector('.mobile-resume-container');
      if (!mobileContainer) {
        console.error('Mobile container not found');
        return;
      }

      // Show loading indicator while rendering
      const loadingIndicator = document.getElementById('mobile-loading-indicator');
      if (loadingIndicator) {
        loadingIndicator.classList.remove('hidden');
      }
      isCanvasGenerating.current = true;

      // Clear existing canvases
      const existingCanvases = mobileContainer.querySelectorAll('.canvas-genresume-mobile');
      existingCanvases.forEach(canvas => canvas.remove());

      try {
        // Get only content for current page
        const pageContent = pages[currentPage];
        if (!pageContent) {
          console.error('No content for current page');
          showFallbackContent();
          isCanvasGenerating.current = false;
          return;
        }

        // Find the resume element to render
        let resumeElement = document.querySelector('.resume-template-2');
        
        // Fallback options if the primary selector fails
        if (!resumeElement) {
          resumeElement = document.querySelector('.resume-template') || 
                        document.querySelector('.w-full.font-roboto') ||
                        document.querySelector('[class*="resume-template"]');
        }
        
        if (!resumeElement) {
          // If we can't find any template element, use the fallback
          showFallbackContent();
          isCanvasGenerating.current = false;
          return;
        }
        
        // Create a temporary container for displaying just the current page
        const tempContainer = document.createElement('div');
        tempContainer.style.position = 'absolute';
        tempContainer.style.left = '-9999px';
        tempContainer.style.width = '100%';
        tempContainer.style.background = 'white';
        tempContainer.style.padding = '20px';
        document.body.appendChild(tempContainer);
        
        // Clone the element but only render current page content
        const clonedElement = resumeElement.cloneNode(false); // shallow clone
        clonedElement.style.position = 'static';
        clonedElement.style.width = '100%';
        clonedElement.style.height = '1100px';
        clonedElement.innerHTML = ''; // Clear content
        
        // Add only current page content
        const pageDiv = document.createElement('div');
        pageDiv.className = 'resume-page-mobile';
        pageDiv.style.width = '100%';
        pageDiv.style.background = 'white';
        pageDiv.style.padding = '10px';
        pageDiv.style.width = '790px';
        pageDiv.style.height = '1100px';
        // pageDiv.style.position = 'relative';

        
        // Use the render function for the current template and page
        const renderCurrentPage = () => {
          switch (template.name) {
            case 'Minimalist':
              return renderNewSimple([pageContent], 0);
            case 'Impact':
              return renderNewImpact([pageContent], 0);
            case 'Professional':
              return renderNewATS([pageContent], 0);
            case 'Tech Modern':
              return renderNewImpact([pageContent], 0);
            case 'Creative Portfolio':
              return renderCreativePage(pageContent);
            default:
              return null;
          }
        };
        
        // Create a React element for the current page and render it
        const pageElement = renderCurrentPage();
        if (pageElement) {
          const pageHtml = ReactDOMServer.renderToString(pageElement);
          pageDiv.innerHTML = pageHtml;
        }
        
        clonedElement.appendChild(pageDiv);
        tempContainer.appendChild(clonedElement);
        
        // Wait a moment for styles to apply
        await new Promise(resolve => setTimeout(resolve, 300));

        // Use html2canvas to render the page
        const canvas = await renderHtmlToCanvas(pageDiv);
        
        // Clean up the temporary elements
        if (document.body.contains(tempContainer)) {
          document.body.removeChild(tempContainer);
        }

        // Style the canvas to fill the available space properly
        // canvas.style.width = '100vw';  
        // canvas.style.height = '100%'; // Let height be determined by content
        // canvas.style.display = 'block';
        // canvas.style.overflowX = 'hidden';
        // // canvas.style.objectFit = 'contain';
        // canvas.style.border = '1px solid red';
        // canvas.classList.add('canvas-genresume-mobile');
        
        const originalWidth = canvas.width; // real pixels (1580)
        const originalHeight = canvas.height; // real pixels (2200)
        // Target screen width (e.g., mobile: 375px)
        const targetWidth = Math.min(window.innerWidth * 2.55, 600); // soft limit
        const scaleRatio = targetWidth / originalWidth;
        const targetHeight = originalHeight *scaleRatio;
        
        canvas.style.width = `${targetWidth}px`;
        canvas.style.height = `${targetHeight}px`;
        canvas.style.display = 'block';
        canvas.style.margin = '0 auto';
        canvas.style.border = 'none';
        canvas.style.imageRendering = 'auto'; // or 'auto' for default
        canvas.classList.add('canvas-genresume-mobile');

        // Add to mobile container
        mobileContainer.appendChild(canvas);
        
        // Hide the fallback container since canvas rendered successfully
        const fallbackContainer = document.getElementById('mobile-fallback-container');
        if (fallbackContainer) {
          fallbackContainer.classList.add('hidden');
        }
        isCanvasGenerating.current = false;
      } catch (renderError) {
        console.error('Failed to render canvas:', renderError);
        showFallbackContent();
      }
    } catch (error) {
      console.error('Failed to handle mobile canvas:', error);
      showFallbackContent();
    } finally {
      // Hide loading indicator when done
      const loadingIndicator = document.getElementById('mobile-loading-indicator');
      if (loadingIndicator) {
        loadingIndicator.classList.add('hidden');
      }
      isCanvasGenerating.current = false;
    }
  };

// Helper function to show fallback content when canvas rendering fails
const showFallbackContent = () => {
  const fallbackContainer = document.getElementById('mobile-fallback-container');
  if (fallbackContainer) {
    fallbackContainer.classList.remove('hidden');
    fallbackContainer.style.position = 'static';
    fallbackContainer.style.top = '0';
  }
};

  // Effect for the mobile preview
  useEffect(() => {
  if (showMobilePreview) {
    const loadingIndicator = document.getElementById('mobile-loading-indicator');
    if (loadingIndicator) {
      loadingIndicator.classList.remove('hidden');
    }

    // Small delay to ensure DOM is ready
    const timeout = setTimeout(() => {
      handleMobileCanvas();
    }, 500); 

    return () => clearTimeout(timeout);
  }
}, [showMobilePreview, data, template, isChecked]);

// Additional effect to re-render mobile canvas when template changes with delay
  useEffect(() => {
    if (showMobilePreview) {
      // Show loading indicator
      const loadingIndicator = document.getElementById('mobile-loading-indicator');
      if (loadingIndicator) {
        loadingIndicator.classList.remove('hidden');
      }

      // Small delay to ensure DOM is ready
      const timeout = setTimeout(() => {
        handleMobileCanvas();
      }, 300);

      return () => clearTimeout(timeout);
    }
  }, [pages,currentPage, showMobilePreview]);

  // Modify your existing useEffect to prevent conflicts
  useEffect(() => {
    const generatedPreview = async() => {
      if(!fullScreenMode){
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      handleCanvas();
    };

    // Only run if not showing mobile preview to avoid conflicts
    if (!showMobilePreview || fullScreenMode) {
      generatedPreview();
    }
  }, [data, generatedData, template, isChecked,fullScreenMode]);

  const containerRef = useRef(null);
  const arrowRef = useRef(null);

  const handleScrollRight = () => {
    if (containerRef.current) {
        arrowRef.current.style.transition = 'transform 0.3s ease';
        containerRef.current.scrollBy({
          left: containerRef.current.scrollWidth,
          behavior: 'smooth',
      });
    }
  };

  const handleScrollLeft = ()=>{
    if(containerRef.current){
      arrowRef.current.style.transition = 'transform 0.3s ease';
      containerRef.current.scrollBy({
        left: -containerRef.current.scrollWidth,
        behavior: 'smooth',
      });
    }
  }

  const handleSectionToggle = ()=>{
    if(!changesContentOpen){
      setChangesHeadingOpen(false)
    }
    setChangesContentOpen((cur)=>!cur);
  }

  const handleHeadingToggle = ()=>{
    if(!changesHeadingOpen){
      setChangesContentOpen(false)
    }
    setChangesHeadingOpen((cur)=>!cur);
  }


  useEffect(() => {
    const filteredSections = SECTION_HEADINGS.filter((heading) =>
      heading.included_in.includes(template.category)
    );
    setSections(filteredSections);
  }, [template]);

  const fetchUpdatedSections = async () => {
    if (generatedData && Object.keys(generatedData).length>0) {
      try {
        const currentUpdations = getUpdatedSections(
          generatedData,
          data,
          updatePersonal,
          addProjectWithDetails,
          updateProjectByName,
          removeProjectByName,
          addSkill,
          addAchievement,
          updateExperienceWithName,
          setGeneratedData
        );
        // const updatedData = constructGeneratedData(currentUpdations,generatedData);
        const filteredSections = currentUpdations.filter(
          (section) => section.heading === activeSection
        );
        setFilteredSection(filteredSections[0] || null);
      } catch (error) {
        console.error("Error fetching updated sections:", error);
      }
    }
  };

  useEffect(() => {
    fetchUpdatedSections();
  }, [generatedData, oldResume, activeSection]);

  const handleSaveChanges = async()=>{
    setIsRotating(true)
    const response = await updateResume(id,jobDescription,data,currentResume);
    if(response!==null){
      setModified(response.updated_resume.modified_at)
    }
    setIsRotating(false);
  }

  const lastUpdatedTime = useMemo(() => getTimeAgo(modified_at), [modified_at]);

  const changed_sections = useMemo(() => getUpdatedSections(generatedData), [generatedData]);
  const changed_headings = useMemo(() => changed_sections.map(section => section.heading), [changed_sections]);
  useEffect(() => {
    if (user) {
      const shouldShow =
        !isMobile &&
        !Array.isArray(user.completed_tours) ||
        !user.completed_tours.includes('resume_editor');

      setIsTourOpen(shouldShow);
    }
  }, [user]);

  const handleTourClose = async() =>{
    setIsTourOpen(false);
    try{
      const updateDetails = {
        completed_tours: [...(user.completed_tours || []), 'resume_editor'],
      };
      const result = await callApi(updateUserDetails,updateDetails);
      setUser(result.user_details)
    }catch{
      console.error("Error updating completed tours")
    }
  }

  return (
    <div className={`flex flex-col md:flex-row h-screen overflow-hidden`}>
      <ProductTour steps={resumeTour} isOpen={isTourOpen} onClose={handleTourClose}/>
      {showFeedBack && (
        <FeedbackComponent
          onClose={() => {setShowFeedBack(false);setGetFeedback(false)}}
          title="How much are you loving this feature so far?"
          description="Help us improve our AI. Share your thoughts on AI Resume Builder."
          moduleName="resume_builder"
          moduleId={resumeId}
        />
      )}

    {/* Full Screen Preview */}
    {(fullScreenMode && !isMobile) && (
      <div id="full-screeen-preview-container" className="absolute w-screen h-screen bg-[#bdbbbf96] grid place-items-center z-[1000] overflow-hidden">
        <div className='gap-5 flex flex-row-reverse items-center justify-between'>
          <div className='bg-white rounded-full py-5 px-1 h-fit cursor-pointer'>
          <button className='absolute top-1 rounded-full bg-red-500 text-white h-10 w-10 grid place-items-center'>
            <X size={24} onClick={()=>setFullScreenMode(false)} />
          </button>
            <PageDots
              currentPage={currentPage} 
              pages={pages} 
              onPageChange={setCurrentPage} 
              fullScreenMode={true}
              />
          </div>
          <div className="full-screeen-resume-container relative h-screen w-[796px] bg-white overflow-y-scroll">
            {/* The canvas will be inserted here by useEffect */}
          </div>
        </div>
      </div>
    )}

    {/* Common Loader */}
    {isLoading && (
      <div className={`absolute top-0 left-0 z-[999] h-screen w-screen`}>
        <Loader />
      </div>
    )}

    {/* Optimizing Loader */}
    {isOptimizing && (
      <div className={`absolute top-0 left-0 z-[999] bg-white h-screen w-screen overflow-hidden grid place-items-center hide-scrollbar`}>
        <h1 className='text-gradient text-[28px] md:text-[32px] text-center px-4'>Sit Back and Relax, While we work on your Resume</h1>
        <OptimizeLottie />
      </div>
    )}

    {/* Overlay when sidebar is open */}
    {/* {(iSideBarOpen && !isMobile) && (
      <div
        className="disable-screen absolute h-screen w-full z-[998]"
        onClick={() => setIsSideBarOpen(false)}
      ></div>
    )} */}

    {/* Sidebar Animation */}
    {/* <AnimatePresence> */}
      {/* {(iSideBarOpen || isMobile) && ( */}
        {/* <motion.div
          initial={{ x: "-100%" }}
          animate={{ x: 0 }}
          exit={{ x: "-100%" }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="h-screen absolute top-0 left-0 z-[999]"
          id="resume-tour-1"
        > */}
          <NewSideBar />
        {/* </motion.div> */}
      {/* )} */}
    {/* </AnimatePresence> */}

    {/* {(!iSideBarOpen && !isMobile)&& (
      <div className='w-10 h-screen absolute top-0 left-0 z-[999] grid place-items-center cursor-pointer' onClick={()=>setIsSideBarOpen(true)}>
        <span className='text-primary'><ChevronsUpDown size={21} strokeWidth={2.5}/></span>
      </div>
    )}  */}

    {/* Editor Section */}
    <div className="ml-1 relative w-full md:w-[50%] bg-white">
      {/* Heading Row */}
      <div className="flex flex-row items-center justify-between px-2 sm:px-4 py-2 sm:py-3 border-b gap-2 sm:gap-0">
        
        {/* Left: Menu (mobile/tablet only) */}
        {isMobile && (
          <div className="absolute left-2 top-2 sm:mr-4">
            <button
              onClick={() => setIsSideBarOpen(true)}
              className="focus:outline-none flex gap-2 items-center text-sm sm:text-base md:text-lg"
            >
              <Menu size={22} className="sm:hidden md:block" strokeWidth={2} />
              <span className="hidden sm:inline">Menu</span>
            </button>
          </div>
        )}

        {/* Center: Editable Heading */}
        <div className="flex-1 flex justify-center">
          <EditableHeading
            currentResume={currentResume}
            setCurrentResume={setCurrentResume}
            data={data}
          />
        </div>

        {/* Right: Sync Button */}
        <div className="flex-shrink-0">
          <SynChanges 
            handleSaveChanges={handleSaveChanges} 
            isRotating={isRotating} 
            lastUpdatedTime={lastUpdatedTime} 
          />
        </div>
      </div>

      <div className="relative z-1 h-[92vh] flex flex-col">
        {(filteredSection || (generatedData && Object.keys(generatedData).length >0)) && (
          <ChangesNavbar
            isOpen={changesHeadingOpen}
            setIsOpen={handleHeadingToggle}
            openSection={handleSectionToggle}
            setOptimizing={setOptimizing}
            handleCanvas={handleCanvas}
            resumeId={resumeId}
          />
        )}

        {/* Editor */}
        <div className='h-full overflow-scroll border border-gray-300 rounded-t-lg px-3 md:px-5 hide-scrollbar shadow-none md:shadow-lg'>
          {!isJDActive && (
            <div className="w-full sticky top-0 rounded-lg bg-white z-[89]">
              <div className="w-[95%] md:w-[90%] pl-1 mx-auto relative">
                
                {/* Left Arrow */}
                <div
                  ref={arrowRef}
                  onClick={handleScrollLeft}
                  className="absolute top-1 md:top-2 cursor-pointer rotate-180 z-10 rounded-full p-1 md:-left-10 -left-4"
                >
                  <ChevronRight size={20} className="text-primary" />
                </div>

                {/* Scrollable Section Tabs */}
                <div
                  ref={containerRef}
                  className="hide-scrollbar flex w-full gap-4 md:gap-10 overflow-x-auto whitespace-nowrap border-b border-gray-200 scroll-smooth"
                >
                  {sections.map((filtered_heading, i) => (
                    <p
                      key={i}
                      className={`flex-shrink-0 pt-1 px-2 md:px-0 flex items-center gap-1 md:gap-2 cursor-pointer text-sm md:text-base smooth ${
                        filtered_heading.name === activeSection
                          ? 'font-semibold text-primary border-b-2 border-primary'
                          : 'text-gray-600'
                      }`}
                      onClick={() => setActiveSection(filtered_heading.name)}
                    >
                      {filtered_heading.name}
                      {changed_headings.includes(filtered_heading.name) && <EnhanceStar />}
                    </p>
                  ))}
                </div>

                {/* Right Arrow */}
                <div
                  ref={arrowRef}
                  onClick={handleScrollRight}
                  className="absolute top-1 md:top-2 cursor-pointer z-10 rounded-full p-1 md:-right-10 -right-4"
                >
                  <ChevronRight size={20} className="text-primary" />
                </div>
              </div>
            </div>  
          )}

          <div className="flex-2 pb-2 mt-2 overflow-y-scroll">
            {isJDActive ? (
              <JD
                jobDescription={jobDescription}
                setJobDescription={setJobDescription}
              />
            ) : (
              <>
                {filteredSection && (
                  <SectionChanges
                    data={filteredSection}
                    isOpen={changesContentOpen}
                    setIsOpen={handleSectionToggle}
                  />
                )}

                {activeSection === 'Personal Info' && (
                  <PersonalInfoSection
                    data={data}
                    template={template.category}
                    personalInfo={personalInfo}
                    updatePersonalInfo={updatePersonal}
                    resumeId={resumeId}
                  />
                )}

                {activeSection === "Links" && (
                  <LinksSection
                    data={data}
                    template={template.category}
                    socialLinks={socialLinks}
                    addLink={addSocialLink}
                    updateLinks={updateSocialLink}
                    removeLink={removeSocialLink}
                  />
                )}

                {activeSection === 'Skills' && (
                  <SkillsSection
                    data={data}
                    skills={skills}
                    addSkill={addSkill}
                    updateSkill={updateSkill}
                    removeSkill={removeSkill}
                    template={template.category}
                  />
                )}

                {activeSection === 'Experience' && (
                  <ExperienceSection
                    data={data}
                    template={template.category}
                    experience={experience}
                    addExperience={addExperience}
                    updateExperience={updateExperience}
                    removeExperience={removeExperience}
                  />
                )}

                {activeSection === 'Projects' && (
                  <ProjectsSection
                    data={data}
                    template={template.category}
                    projects={projects}
                    addProject={addProject}
                    updateProject={updateProject}
                    removeProject={removeProject}
                  />
                )}

                {activeSection === 'Education' && (
                  <EducationSection
                    data={data}
                    template={template.category}
                    education={education}
                    addEducation={addEducation}
                    updateEducation={updateEducation}
                    removeEducation={removeEducation}
                  />
                )}

                {activeSection === "Certifications" && (
                  <AchievementsSection
                    data={data}
                    items={data.certifications}
                    addItem={addCertification}
                    updateItem={updateCertification}
                    removeItem={removeCertification}
                    heading="Certification"
                  />
                )}

                {activeSection === "Achievements" && (
                  <AchievementsSection
                    data={data}
                    items={data.achievements}
                    addItem={addAchievement}
                    updateItem={updateAchievement}
                    removeItem={removeAchievement}
                    heading="Achievement"
                  />
                )}

                {activeSection === "Hobbies" && (
                  <AchievementsSection
                    data={data}
                    items={data.hobbies}
                    addItem={addHobby}
                    updateItem={updateHobby}
                    removeItem={removeHobby}
                    heading="Hobby"
                  />
                )}

                {activeSection === "Languages" && (
                  <AchievementsSection
                    data={data}
                    items={data.languages}
                    addItem={addLanguage}
                    updateItem={updateLanguage}
                    removeItem={removeLanguage}
                    heading="Language"
                  />
                )}
              </>
            )}
          </div>
        </div>

        <div className='px-3 py-2 md:py-3 bg-white flex flex-col md:flex-row gap-2 justify-center items-center md:justify-between border-t-2 border-gray-200 '>
          <div onClick={toggleEditor} className='w-[60%] md:w-fit' id='resume-tour-2'>
            <button className='bg-transparent w-full px-2 md:px-3 py-1 rounded-full border border-[#333333] text-sm md:text-base'>
              {isJDActive ? "Back To Editor" : "Job Description"}
            </button>
          </div>
        {checkFeatureExists("ai_resume_generator") && (
          <div
            className={`text-white font-semibold rounded-full px-4 py-2 text-center w-[60%] md:w-fit bg-primary relative ${showInfoDialog ? 'cursor-not-allowed pointer-events-none bg-primary/50' : 'cursor-pointer'}`}
            onClick={handleGenerate}
          >
            {showInfoDialog && (
              <span className='absolute text-center right-0 -top-[150px] min-h-[120px] flex flex-col gap-2 items-center justify-center w-full bg-primary shadow-lg p-4 rounded-md text-white font-semibold z-50'>
                <Info size={16} strokeWidth={3} />
                {!personalInfo || Object.values(personalInfo).every(value => value === '' || value === null)
                  ? 'Please fill in your Personal Info'
                  : !jobDescription
                    ? 'Please add the Job Description so our AI can analzye your resume'
                    : ''}
              </span>
            )}
              <button
                className={`flex items-center gap-2 justify-center w-full text-sm md:text-base lap:text-xl ${showInfoDialog ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
              >
                <AiStar color="white" size={20} />
                Enhance using GenAI
              </button>
          </div>
        )}
        </div>

      </div>
    </div>

    {/* Resume Preview */}
    <div className="hidden lap:block w-[50%] bg-[#F7F5FA] overflow-hidden">
      <div className={`shadow-md pr-5 flex items-center gap-4 sticky top-0 bg-[#F7F5FA] z-[89] mb-1 ${(new_score && (generatedData!=null && Object.keys(generatedData).length == 0)) ? 'justify-between p-0' : 'justify-end py-2'} px-5`}>
        {(new_score != null && (generatedData!=null && Object.keys(generatedData).length == 0)) && <ATSScore score={isChecked ? old_score : new_score} />}

        {/* RightContent */}
        <div className='float-end flex items-center gap-4 md:gap-2'>
          {/* {(oldResume && Object.keys(oldResume).length > 0) && (
            <div className="flex items-center space-x-2">
              <label
                htmlFor="customSwitch"
                className="font-medium text-primary text-sm md:text-base"
              >
                Compare Old <br />Resume
              </label>
              <button
                className={`custom-switch ${isChecked ? 'custom-switch-checked' : ''}`}
                onClick={() => setIsChecked((cur) => !cur)}
              >
              </button>
            </div>
          )} */}
          <button
            id='resume-tour-7'
            className="flex items-center h-fit rounded-full bg-black px-3 py-1 text-white text-sm md:text-base"
            onClick={() => handlePDFDownload('pdf')}
            disabled={isDownLoading}
          >
            {isDownLoading ? "Preparing.. " : "Download PDF"}
          </button>
          <button onClick={()=>setFullScreenMode((true))} id='resume-tour-6'>
            <Maximize size={24} />
          </button>
        </div>
      </div>

      {(!isMobile) && (
        <div className="w-full h-full">

          <div>
            {!isCanvasPresent && (
              <div className="text-xl font-semibold flex items-center justify-center space-x-1 mt-[40%]">
              <span>Loading</span>
              <span className="flex space-x-1">
                <span className="animate-bounce">.</span>
                <span className="animate-bounce delay-200">.</span>
                <span className="animate-bounce delay-400">.</span>
              </span>
            </div>
            ) }
          </div>

          <div className="flex xl:h-[95vh] items-center justify-center px-4 md:px-8">
            <div ref={canvasRef} className='w-full font-roboto h-full'>
              {isChecked ? getTemplateComponent(oldResume, true) : getTemplateComponent(data, false)}
            </div>
          </div>
        </div>
      )}
    </div>

    {/* Mobile Preview Toggle Button */}
    <div className="fixed bottom-4 right-4 z-[90] md:hidden">
      <button
        onClick={toggleMobilePreview}
        className="rounded-full bg-primary p-3 shadow-lg"
      >
        <Eye size={24} color="#fff" />
      </button>
    </div>

    {/* Mobile Resume Preview Modal */}
    {showMobilePreview && (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-[999] flex flex-col items-center justify-center p-4 md:hidden h-screen">
        {/* Resume HTML  */}
        <div className="absolute top-[999px] flex h-[1100px] w-[768px] items-center justify-center px-4 md:px-8">
          <div className='w-full font-roboto h-full'>
            {isChecked ? getTemplateComponent(oldResume, true) : getTemplateComponent(data, false)}
          </div>
        </div>

        {/* Resume Preveiw Modal */}
        <div className="bg-white rounded-lg w-full h-[90vh] flex flex-col">
          <div className="flex justify-between items-center py-1 px-2 border-b">
            <button
              className="bg-black text-white px-4 py-1 rounded-full text-sm font-semibold"
              onClick={() => handlePDFDownload('pdf')}
              disabled={isDownLoading}
            >
              {isDownLoading ? "Preparing.. " : "Download PDF"}
            </button>
            <button onClick={toggleMobilePreview}>
              <X size={24} />
            </button>
          </div>

          {/* Resume Preview Content */}
          <div className="flex-1 overflow-hidden relative">
            {/* Canvas Render Container */}
            <div id="mobile-preview-container" className="w-full h-full flex flex-col justify-center items-center">
              <div className="mobile-resume-container relative w-full h-full overflow-scroll">
                {/* The canvas will be inserted here by useEffect */}
              </div>
            </div>

            {/* Fallback if canvas doesn't render */}
            {/* <div className="w-full font-roboto absolute top-[9999px] overflow-hidden" id="mobile-fallback-container">
              {isChecked ? getTemplateComponent(oldResume, true) : getTemplateComponent(data, false)}
            </div> */}

            {/* Loading indicator while canvas is rendering */}
            <div id="mobile-loading-indicator" className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary overflow-y-scroll hide-scrollbar"></div>
            </div>
          </div>

          <div className="border-t">
            {/* {(oldResume && Object.keys(oldResume).length > 0) && (
              <div className="flex items-center space-x-2">
                <label htmlFor="customSwitch" className="font-medium text-primary text-sm">
                  Compare Old Resume
                </label>
                <button
                  className={`custom-switch ${isChecked ? 'custom-switch-checked' : ''}`}
                  onClick={() => setIsChecked(prev => !prev)}
                >
                </button>
              </div>
            )} */}
              {/* Pagination dots for mobile */}
              {pages.length && (
                <div className="pb-[5px]">
                  <PageDots
                    currentPage={currentPage}
                    pages={pages}
                    onPageChange={setCurrentPage}
                    isMobile={true}
                  />
                </div>
              )}
          </div>
        </div>
        <PaginationEl 
          currentTemplate={template}
        />
      </div>
    )}
  </div>
  );
}
