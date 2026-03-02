'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import useInterviewStore from '@/store/interviewStore';
import useUserDetailsStore from '@/store/userDetails';
import useJobStore from '@/store/prepareInterview';
import useToastStore from '@/store/toastStore';
import { getProfileDetails } from '@/lib/fetchUtil';
import { endVoiceInterview } from '@/lib/interviewUtil';
import LiveKitVoiceInterview from './LiveKitVoiceInterview';
import Timer from './Timer';
import InterviewSummary from './InterviewSummary';
import Spinner from '@/components/reusables/Spinner';

export default function LiveKitInterviewPage({ sessionId }) {
  const router = useRouter();
  const { addToast } = useToastStore();
  const {
    history,
    addHistory,
    setHistory,
    title,
    setTitle,
    interviewEnded,
    setInterviewEnded,
    conclusion,
    setConclusion,
    jobDescription: storedJobDescription,
    setJobDescription,
    setInterviewStartTime,
  } = useInterviewStore();

  // Get job description and resume ID from store
  const { jobDescription: jobStoreDescription, resumeId: jobStoreResumeId } = useJobStore();

  const {
    user_details: { personalInfo },
    setUserDetails,
  } = useUserDetailsStore();

  // Interview state
  const [isBreakPoint, setIsBreakPoint] = useState(null);
  const [generatingFeedback, setGeneratingFeedback] = useState(false);
  const [hasEndedByUser, setHasEndedByUser] = useState(false);
  const [candidateName, setCandidateName] = useState('');
  const [resumeId, setResumeId] = useState('');
  const [jobDescription, setLocalJobDescription] = useState('');

  // Check for breakpoints
  useEffect(() => {
    const checkBreakpoint = () => {
      setIsBreakPoint(window.innerWidth < 768);
    };

    checkBreakpoint();
    window.addEventListener('resize', checkBreakpoint);
    return () => window.removeEventListener('resize', checkBreakpoint);
  }, []);

  // Fetch user details and set up interview data
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('LiveKitInterviewPage fetchData - resumeId:', resumeId, 'jobDescription:', jobDescription);
        console.log('Store values - jobStoreResumeId:', jobStoreResumeId, 'jobStoreDescription:', jobStoreDescription);

        // Get user details
        const userDetails = await getProfileDetails();
        if (userDetails?.profile_details != null) {
          setUserDetails(userDetails?.profile_details?.resume_data);
          setCandidateName(
            userDetails.profile_details.resume_data.personalInfo?.firstName || 'Candidate'
          );
        }

        // Use job description and resume ID from store
        if (jobStoreDescription) {
          console.log('Setting job description from store:', jobStoreDescription);
          setLocalJobDescription(jobStoreDescription);
          setJobDescription(jobStoreDescription);
        }

        if (jobStoreResumeId) {
          console.log('Setting resume ID from store:', jobStoreResumeId);
          setResumeId(jobStoreResumeId);
        }

        setTitle('Voice Interview');
      } catch (error) {
        console.error('Error fetching data:', error);
        addToast('Error loading interview data', 'error', 'top-middle', 5000);
      }
    };

    fetchData();
  }, [sessionId, jobStoreDescription, jobStoreResumeId]);

  // Set interview start time
  useEffect(() => {
    setInterviewStartTime(Date.now());
  }, []);

  const handleInterviewStart = (sessionData) => {
    console.log('Interview started:', sessionData);
    // Interview has started successfully
  };

  const handleInterviewEnd = async (result) => {
    try {
      setGeneratingFeedback(true);
      setHasEndedByUser(true);

      // Get final feedback
      if (result?.conclusion) {
        setConclusion(result.conclusion);
        addHistory({ role: 'AI', content: result.conclusion.feedback || 'Thank you for the interview!' });
      }

      // Mark interview as ended
      setInterviewEnded(true);
      setGeneratingFeedback(false);

    } catch (error) {
      console.error('Error handling interview end:', error);
      setGeneratingFeedback(false);
      addToast('Error ending interview', 'error', 'top-middle', 3000);
    }
  };

  const handleEndInterview = async () => {
    try {
      setGeneratingFeedback(true);
      const result = await endVoiceInterview(sessionId);
      await handleInterviewEnd(result);
    } catch (error) {
      console.error('Error ending interview:', error);
      setGeneratingFeedback(false);
      addToast('Error ending interview', 'error', 'top-middle', 3000);
    }
  };

  console.log('LiveKitInterviewPage render - resumeId:', resumeId, 'jobDescription:', jobDescription);

  // Show loading only if profile data isn't loaded yet
  // Resume ID and job description will be set by LiveKitVoiceInterview component
  if (!personalInfo?.firstName) {
    return (
      <div className="grid place-items-center h-screen w-screen">
        <div className="flex flex-col items-center justify-center gap-5">
          <h1 className="text-2xl font-semibold text-primary text-center">
            Loading interview session...
          </h1>
          <Spinner />
        </div>
      </div>
    );
  }

  // Show interview ended state
  if (interviewEnded) {
    return generatingFeedback ? (
      <div className="grid place-items-center h-screen w-screen">
        <div className="flex flex-col items-center justify-center gap-5">
          <h1 className="text-2xl font-semibold text-primary text-center">
            Geneva is analyzing your performance and
            <br />
            generating your personalized feedback
          </h1>
          <Spinner />
        </div>
      </div>
    ) : (
      <div className="h-screen w-screen">
        <InterviewSummary
          conclusion={conclusion}
          interview_id={sessionId}
          candidateName={candidateName}
          jobDescription={jobDescription}
        />
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-[#F8F3FF] relative overflow-hidden">
      {/* Timer */}
      <Timer
        sessionId={sessionId}
        onTimeUp={handleEndInterview}
        hasEndedByUser={hasEndedByUser}
        setInterviewEnded={setInterviewEnded}
        isBreakPoint={isBreakPoint}
        interviewEnded={interviewEnded}
      />

      {/* Main Interview Container */}
      <div className="h-full w-full flex items-center justify-center p-4">
        <div className="w-full max-w-4xl h-[80vh] bg-white rounded-lg shadow-lg overflow-hidden">
          <LiveKitVoiceInterview
            resumeId={resumeId}
            jobDescription={jobDescription}
            onInterviewStart={handleInterviewStart}
            onInterviewEnd={handleInterviewEnd}
            isBreakPoint={isBreakPoint}
          />
        </div>
      </div>

      {/* End Interview Button */}
      <div className="absolute top-4 right-4">
        <button
          onClick={handleEndInterview}
          className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
        >
          End Interview
        </button>
      </div>
    </div>
  );
}