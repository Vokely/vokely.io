'use client'
import { useState } from 'react';
import { getInterview, startInterview } from '@/lib/interviewUtil';
import useInterviewStore from '@/store/interviewStore';
import Navbar from '@/components/layouts/Navbar';
import { useRouter } from 'next/navigation';
import SelectResumes from '@/components/interviewer/ResumeAccordian';
import JD from '@/components/interviewer/JD';
import useToastStore from '@/store/toastStore';
import useJobStore from '@/store/prepareInterview';
import PermissionsModal from '@/components/interviewer/PermissionsModal';

export default function InterviewerClient() {
  const { sessionId, setHistory, setTitle, setSuggestion} = useInterviewStore();
  const {jobDescription, setJobDescription, isPreparing, setIsPreparing,
    isResumesOpen, setIsResumesOpen, isResumeUploaded, setIsResumeUploaded, setSelectedFile, resumeId} = useJobStore();
  const addToast = useToastStore((state) => state.addToast);
  const router = useRouter();
  
  // New state for permissions modal
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
  const [pendingJD, setPendingJD] = useState(null);
  const [useVoiceInterview, setUseVoiceInterview] = useState(true); // Default to voice interview

  const validateInputs = () => {
    if (!isResumeUploaded) {
      addToast('Please upload/Select a resume', 'warning', 'top-middle', 3000);
      return false;
    } else if (jobDescription.trim().length === 0) {
      addToast('Please enter a JD (or) role', 'warning', 'top-middle', 3000);
      return false;
    }
    return true;
  };

  const handleStartClick = async () => {
    if (!validateInputs()) return;

    localStorage.removeItem('interview-storage')
    // Save the current JD in case we need it after permissions
    setPendingJD(jobDescription);
    
    // Open permissions modal
    setIsPermissionsModalOpen(true);
  };

  const handleContinueAfterPermissions = async () => {
    // Use the saved JD
    const jd = pendingJD || jobDescription;
    try {
      setIsPreparing(true);

      // if (useVoiceInterview) {
      //   // Voice Interview Flow
      //   const voiceSession = await startInterview(resumeId, jd);

      //   if (voiceSession && voiceSession.success) {
      //     setTitle(voiceSession.title || 'Voice Interview');

      //     // Clear form data
      //     setSelectedFile(null);
      //     setJobDescription('');
      //     setIsResumeUploaded(false);
      //     localStorage.removeItem('job-store');

      //     // Navigate to voice interview page
      //     router.push(`ai-interviewer/${voiceSession.session_id}?voice=true`);
      //   } else {
      //     addToast('Failed to start voice interview', 'error', 'top-middle', 3000);
      //     setSelectedFile(null);
      //     setJobDescription('');
      //     setIsResumeUploaded(false);
      //     setIsResumesOpen(true);
      //   }
      // } else {
        // Traditional Interview Flow
        const response = await getInterview(sessionId, jd);
        const responseJson = await response.json();

        if (response.ok) {
          setTitle(responseJson?.introduction?.title);
          setSuggestion(responseJson?.introduction?.ideal_answer);

          const questions = [
            {
              role: "interviewer",
              message: responseJson.introduction.intro,
            },
          ];

          setSelectedFile(null);
          setJobDescription('');
          setIsResumeUploaded(false);
          localStorage.removeItem('job-store');
          setHistory(questions);
          router.push(`ai-interviewer/${sessionId}`);
        } else {
          addToast('Failed to start interview', 'error', 'top-middle', 3000);
          setSelectedFile(null);
          setJobDescription('');
          setIsResumeUploaded(false);
          setIsResumesOpen(true);
        }
      // }
    } catch (error) {
      addToast('Failed to start interview', 'error', 'top-middle', 3000);
    } finally {
      setIsPreparing(false);
      setPendingJD(null);
    }
  };

  const closePermissionsModal = () => {
    setIsPermissionsModalOpen(false);
    setPendingJD(null);
  };

  return (
    <div className='min-h-screen'>
      <Navbar />
      <div className='flex flex-col justify-between items-center text-center min-h-[90vh] px-4 xxs:px-6 sm:px-8'>
        {/* Accordian-1 */}
        <div className='w-full flex flex-col items-center mt-3 xxs:mt-4 sm:mt-5'>
          <h1 className='text-xl xxs:text-2xl md:text-3xl mb-1 xxs:mb-2 font-semibold'>Let's set the stage for your AI Interview</h1>
          <p className='text-sm xxs:text-base tracking-wide max-w-3xl'>We'll personalize the interview based on your resume and the role you're aiming for. It only takes a minute!</p>
          {/* Accordians */}
          <div className='w-full xs:w-[90%] sm:w-[85%] md:w-[75%] lap:w-[60%] lg:w-1/2 mt-2 flex flex-col gap-3 sm:gap-4'>
            <SelectResumes 
              isResumeUploaded={isResumeUploaded} 
              setIsResumeUploaded={setIsResumeUploaded}
              setJobDescription={setJobDescription} 
              isResumesOpen={isResumesOpen} 
              setIsResumesOpen={setIsResumesOpen}
            />
            <JD 
              jobDescription={jobDescription} 
              setJobDescription={setJobDescription} 
              isResumesOpen={isResumesOpen} 
              setIsResumesOpen={setIsResumesOpen}
            />
          </div>
        </div>

        {/* Interview Type Toggle */}
        {/* <div className='my-4 sm:my-6'>
          <div className='flex items-center justify-center gap-4 p-3 bg-gray-50 rounded-lg'>
            <span className='text-sm font-medium text-gray-700'>Interview Type:</span>
            <div className='flex items-center gap-2'>
              <button
                onClick={() => setUseVoiceInterview(false)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  !useVoiceInterview
                    ? 'bg-primary text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                Text Interview
              </button>
              <button
                onClick={() => setUseVoiceInterview(true)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  useVoiceInterview
                    ? 'bg-primary text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                🎤 Voice Interview
              </button>
            </div>
          </div>
          {useVoiceInterview && (
            <p className='text-xs text-gray-600 mt-2 max-w-md mx-auto'>
              Experience real-time voice conversation with Geneva using advanced AI technology
            </p>
          )}
        </div> */}

        <div className='relative my-6 sm:my-8 md:my-10'>
          <button
            className={`${isPreparing ? 'bg-primary/40 text-[#999]' : 'bg-primary text-white'} rounded-full px-6 xxs:px-8 py-1.5 xxs:py-2 text-sm xxs:text-base font-semibold`}
            onClick={handleStartClick}
            disabled={isPreparing}
          >
            {isPreparing ? "Geneva is Preparing.." : `Start ${useVoiceInterview ? 'Voice ' : ''}Interview`}
          </button>
        </div>
      </div>

      {/* Permissions Modal */}
      <PermissionsModal 
        isOpen={isPermissionsModalOpen}
        onClose={closePermissionsModal}
        onContinue={handleContinueAfterPermissions}
      />
    </div>
  );
}