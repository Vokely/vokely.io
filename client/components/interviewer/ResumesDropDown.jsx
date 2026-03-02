import { useEffect, useState, useRef } from 'react';
import { getAllResumes } from '@/lib/resumeUtils';
import useInterviewStore from '@/store/interviewStore';
import useJobStore from '@/store/prepareInterview';
import { getSesionIdViaJson } from '@/lib/interviewUtil';
import useToastStore from '@/store/toastStore';
import ResumesDropdownItems from '../reusables/ResumeDropDownItems';

const formatUpdateDate = (dateString) => {
  if (!dateString) return null;
  try {
    // Example: "19 Feb. 2025"
    return `${new Date(dateString).toLocaleDateString(undefined, {
      day: 'numeric', // 19
      month: 'short', // Feb.
      year: 'numeric', // 2025
    })}`;
  } catch (error) {
    console.error("Error formatting date:", error);
    return 'Invalid Date';
  }
};

function useOnClickOutside(ref, handler) {
  useEffect(() => {
    const listener = (event) => {
      // Do nothing if clicking ref's element or descendent elements
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
      handler(event);
    };
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]); // Reload only if ref or handler changes
}


export default function ResumesDropDown({resumes, setResumes,selectedFile,setSelectedFile,setIsResumeUploaded, setJobDescription, closeAccordian,isExistingResume,setIsExistingResume }) {
  const addToast = useToastStore((state) => state.addToast);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(true); 
  const [loadingText, setLoadingText] = useState('Fetching resumes');
  const {setSessionId} = useInterviewStore();
  const dropdownRef = useRef(null); 

  // Use the custom hook to close dropdown on outside click
  useOnClickOutside(dropdownRef, () => setIsOpen(false));


   useEffect(() => {
    let messageIndex = 0;
    let interval;

    if (loading) {
      interval = setInterval(() => {
        if (loadingMessages.length > 0) {
          setLoadingText(loadingMessages[messageIndex % loadingMessages.length]);
          messageIndex++;
        }
      }, 3000);
    } else {
        if (interval) clearInterval(interval);
    }
    if(resumes.length===0){
      fetchResumes().finally(() => { if(interval) clearInterval(interval); }); 
    } else {
        setLoading(false); 
        if (interval) clearInterval(interval); 
    }


    return () => {
      if (interval) clearInterval(interval);
    };
  }, []); 

  const fetchResumes = async () => {
    if (!loading) setLoading(true);
    try {
      const resumeData = await getAllResumes();
      setResumes(resumeData.data || []);
      // setIsResumeUploaded(false)
      // setSelectedFile(null); 
      // setIsExistingResume(false)
    } catch (error) {
      console.error("Failed to fetch resumes:", error);
      setResumes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelection = async(resume) => {
    // For voice interviews, we'll create the session later
    // For now, just store the resume data and ID
    setSelectedFile(resume);
    setJobDescription(resume?.job_description || '');
    setIsExistingResume(true);
    setIsResumeUploaded(true);
    setIsOpen(false);
    closeAccordian();

    // Store resume ID in the job store for voice interviews
    const { setResumeId } = useJobStore.getState();
    setResumeId(resume._id);

    // For traditional interviews, still create session immediately
    try {
      const response = await getSesionIdViaJson(resume._id);
      const responseJson = await response.json();

      if(response.status === 402) {
        addToast(responseJson.detail, 'warning', 'top-middle', 3000);
        return;
      }

      if (responseJson.session_id) {
        setSessionId(responseJson.session_id);
      }
    } catch (error) {
      console.error('Error creating traditional interview session:', error);
      // Don't show error for voice interviews
    }
  };

  return (
    <ResumesDropdownItems
    resumes={resumes}
    selectedFile={selectedFile}
    handleSelection={handleSelection}
    loading={loading}
    loadingText={loadingText}
    isExistingResume={isExistingResume}
  />
  );
}