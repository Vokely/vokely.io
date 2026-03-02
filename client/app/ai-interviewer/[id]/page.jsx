'use client';
import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import useInterviewStore from '@/store/interviewStore';
import {
  getNextQuestion,
  endInterview,
} from '@/lib/interviewUtil';
import { BotMessageSquare } from 'lucide-react';
import Speaking from '@/components/icons/Speaking';
import Lock from '@/components/icons/Lock';
import ChatInterface from '@/components/interviewer/Chat';
import Timer from '@/components/interviewer/Timer';
import Profile from '@/components/icons/Profile';
import VideoCall from '@/components/interviewer/User';
import TriStar from '@/components/icons/TriStar';
import Suggestion from '@/components/interviewer/Suggestion';
import Geneva from '@/components/interviewer/Geneva';
import InterviewSummary from '@/components/interviewer/InterviewSummary';
import Spinner from '@/components/reusables/Spinner';
import useUserDetailsStore from '@/store/userDetails';
import { getProfileDetails } from '@/lib/fetchUtil';
import { getInterviewDetails } from '@/lib/interviewUtil';
import LiveKitInterviewPage from '@/components/interviewer/LiveKitInterviewPage';
import { useLiveKitInterview } from '@/hooks/useLiveKitInterview'; // Adjust path as needed

export default function Page({params}) {
  const searchParams = useSearchParams();
  const isVoiceInterview = searchParams.get('voice') === 'true';
  const session_id = params.id;

  // If this is a voice interview, render the LiveKit component
  if (isVoiceInterview) {
    return <LiveKitInterviewPage sessionId={session_id} />;
  }

  // LiveKit Integration
  const {
    room,
    isConnected,
    isConnecting,
    connectionError,
    isMicEnabled,
    isAgentSpeaking,
    sessionData,
    startInterview,
    endInterview: endLiveKitInterview,
    toggleMicrophone,
    requestMicrophonePermission,
  } = useLiveKitInterview();

  // Store states
  const { 
    history, 
    addHistory,
    setHistory, 
    title, 
    setTitle, 
    suggestion, 
    setSuggestion, 
    interviewEnded, 
    setInterviewEnded,
    conclusion, 
    setConclusion, 
    jobDescription, 
    setJobDescription, 
    setInterviewStartTime
  } = useInterviewStore();

  // UI States - mapped to LiveKit equivalents
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [userResponse, setUserResponse] = useState('');
  const [hasEndedByUser, setHasEndedByUser] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const [showPopUp, setShowPopUp] = useState(false);
  const [isUserTurn, setIsUserTurn] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [animatedHistory, setAnimatedHistory] = useState([]);
  const lastProcessedIndexRef = useRef(-1);
  const processingRef = useRef(false);
  const [isBreakPoint, setIsBreakPoint] = useState(null);
  const [buttonPosition, setButtonPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [showChatWindow, setShowChatWindow] = useState(false);
  const chatwindowRef = useRef(null);
  const [generatingFeedback, setGeneratingFeedback] = useState(false);
  const [livekitInitialized, setLivekitInitialized] = useState(false);

  const {
    user_details: {
      personalInfo
    },
    setUserDetails,
    resetAllState,
    setHasUntrackedChanges
  } = useUserDetailsStore();
  const candidateName = personalInfo.firstName + " " + personalInfo.lastName;

  // Sync LiveKit states with UI states
  useEffect(() => {
    setIsAudioPlaying(isAgentSpeaking);
  }, [isAgentSpeaking]);

  useEffect(() => {
    setIsMicOn(isMicEnabled);
  }, [isMicEnabled]);

  useEffect(() => {
    // When agent stops speaking, it's user's turn
    if (!isAgentSpeaking && isConnected) {
      setIsUserTurn(true);
      setShowPopUp(true);
    } else if (isAgentSpeaking) {
      setIsUserTurn(false);
      setShowPopUp(false);
    }
  }, [isAgentSpeaking, isConnected]);

  const fetchData = async() => {
    const response = await getProfileDetails();
    if(response?.profile_details != null) {
      setUserDetails(response?.profile_details?.resume_data);
    } else {
      resetAllState();
    }
    setHasUntrackedChanges(false);
  };

  useEffect(() => {
    const storedData = localStorage.getItem("user-details-storage");
    if(!storedData){
      fetchData();
    }
  }, []);

  const handleDragStart = (e) => {
    const isTouchEvent = e.type === 'touchstart';
    const startX = isTouchEvent ? e.touches[0].clientX : e.clientX;
    const startY = isTouchEvent ? e.touches[0].clientY : e.clientY;
    const startLeft = buttonPosition.x;
    const startTop = buttonPosition.y;
    setIsDragging(false);
  
    const handleMove = (e) => {
      setIsDragging(true);
      const clientX = isTouchEvent ? e.touches[0].clientX : e.clientX;
      const clientY = isTouchEvent ? e.touches[0].clientY : e.clientY;
      const newX = startLeft + (clientX - startX);
      const newY = startTop + (clientY - startY);
  
      const clampedX = Math.max(20, Math.min(window.innerWidth - 60, newX));
      const clampedY = Math.max(20, Math.min(window.innerHeight - 60, newY));
  
      setButtonPosition({ x: clampedX, y: clampedY });
    };
  
    const handleEnd = () => {
      if (isTouchEvent) {
        document.removeEventListener('touchmove', handleMove);
        document.removeEventListener('touchend', handleEnd);
      } else {
        document.removeEventListener('mousemove', handleMove);
        document.removeEventListener('mouseup', handleEnd);
      }
    };
  
    if (isTouchEvent) {
      document.addEventListener('touchmove', handleMove);
      document.addEventListener('touchend', handleEnd);
    } else {
      document.addEventListener('mousemove', handleMove);
      document.addEventListener('mouseup', handleEnd);
    }
  };
  
  useEffect(() => {
    const handleResize = () => setIsBreakPoint(window.innerWidth < 900);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const chatRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (chatwindowRef.current && !chatwindowRef.current.contains(event.target)) {
        setShowChatWindow(false);
      }
    };

    if (showChatWindow) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showChatWindow]);

  // LiveKit Integration Functions
  const startLiveKitRecording = async () => {
    try {
      if (!isConnected && !isConnecting) {
        // Request microphone permission first
        const hasPermission = await requestMicrophonePermission();
        if (!hasPermission) {
          return;
        }

        // Start LiveKit interview session
        await startInterview(session_id, jobDescription);
        setLivekitInitialized(true);
      }
      
      // Toggle microphone
      await toggleMicrophone();
    } catch (error) {
      console.error('Error starting LiveKit recording:', error);
    }
  };

  const stopLiveKitRecording = async () => {
    try {
      if (isMicEnabled) {
        await toggleMicrophone();
      }
    } catch (error) {
      console.error('Error stopping LiveKit recording:', error);
    }
  };

  // Modified handlers to work with LiveKit
  const handleSendResponse = async () => {
    if (!userResponse.trim() || isAudioPlaying) return;
    setIsGenerating(true);
    setShowSuggestions(false);
    setIsUserTurn(false);
    addHistory({ role: 'user', content: userResponse });
    
    const response = await getNextQuestion(userResponse, session_id);
    setUserResponse('');
    
    if (response?.stage === 'finish') {
      localStorage.removeItem(`interview-end-time-${session_id}`);
      await fetchData();
      setInterviewEnded(true);
      setIsGenerating(false);
      setConclusion(response.conclusion);
      if (response?.question?.conclusion && response?.question?.feedback) {
        addHistory({ role: 'AI', content: response?.question?.conclusion });
        addHistory({ role: 'AI', content: response?.question?.feedback });
      }
      return;
    }
    
    if (response?.question) {
      // With LiveKit, the agent will handle TTS automatically
      addHistory({ role: 'AI', content: response.question });
      setSuggestion(response.ideal_answer);
    }
    setIsGenerating(false);
  };

  const getRemainingMessage = () => {
    const lastAIMessageIndex =
      lastProcessedIndexRef.current === -1 ? 0 : lastProcessedIndexRef.current;
    const originalMessage = animatedHistory[lastAIMessageIndex];
    const updatedHistory = [...animatedHistory];
    updatedHistory[lastAIMessageIndex] = {
      content: originalMessage.content,
      animatedText: originalMessage.content,
      role: originalMessage.role,
    };
    processingRef.current = false;
    return updatedHistory;
  };

  const handleEndInterview = async () => {
    setGeneratingFeedback(true);
    
    // Stop LiveKit recording
    await stopLiveKitRecording();
    
    // End LiveKit session
    if (sessionData?.session_id) {
      await endLiveKitInterview();
    }

    // Clear LiveKit session data from localStorage
    localStorage.removeItem(`livekit-token-${session_id}`);
    localStorage.removeItem(`livekit-session-${session_id}`);

    if (animatedHistory.length > 0) {
      const updatedChat = getRemainingMessage();
      setAnimatedHistory(updatedChat);
    }
    
    setHasEndedByUser(true);

    const data = await endInterview(session_id);
    await fetchData();
    localStorage.removeItem(`interview-end-time-${session_id}`);
    setInterviewEnded(true);
    setGeneratingFeedback(false);
    setConclusion(data.conclusion);
    
    if (data) {
      addHistory({ role: 'AI', content: data?.conclusion?.conclusion });
      addHistory({ role: 'AI', content: data?.conclusion?.feedback });
      if (data?.conclusion?.feedback && data.conclusion.conclusion) {
        setAnimatedHistory((prevHistory) => [
          ...prevHistory,
          {
            role: 'AI',
            content: data.conclusion.conclusion,
            animatedText: data.conclusion.conclusion,
          },
          {
            role: 'AI',
            content: data.conclusion.feedback,
            animatedText: data.conclusion.feedback,
          },
        ]);
      }
    }
  };

  const checkInterviewStatus = (response) => {
    if (!response || !response.interview || !response.interview.history) {
      console.error("Invalid response format");
      return {
        error: true,
        message: "Invalid response format"
      };
    }
  
    const { history } = response.interview;
    const lastEntry = history[history.length - 1];
    const isInterviewEnded = lastEntry.stage === "finish";
    
    let conclusion = null;
    if (isInterviewEnded) {
      conclusion = response.interview.feedback;
    }
    
    const isUserTurn = lastEntry.role === "interviewer" && !isInterviewEnded;
    const createdAt = response.interview.created_at ? new Date(response.interview.created_at) : null;
    
    return {
      isInterviewEnded,
      isUserTurn,
      lastStage: lastEntry.stage,
      conclusion,
      lastEntryRole: lastEntry.role,
      lastEntryContent: lastEntry.content,
      createdAt
    };
  };
  
  const updateInterviewState = async(response) => {
    const status = checkInterviewStatus(response);
    
    if (status.createdAt) {
      const startTimeMs = status.createdAt.getTime();
      setInterviewStartTime(startTimeMs);
      
      const sessionId = response?.interview?.session_id;
      if (sessionId) {
        const INTERVIEW_DURATION = 10 * 60 * 1000;
        const endTime = startTimeMs + INTERVIEW_DURATION;
        
        if (!localStorage.getItem(`interview-end-time-${sessionId}`)) {
          localStorage.setItem(`interview-end-time-${sessionId}`, endTime.toString());
        }
      }
    }
    
    const history = response.interview.history;
    if (status.isInterviewEnded) {
      setInterviewEnded(true);
      setConclusion(status.conclusion);
      localStorage.removeItem(`interview-end-time-${session_id}`);
      // Clear LiveKit session data when interview is already ended
      localStorage.removeItem(`livekit-token-${session_id}`);
      localStorage.removeItem(`livekit-session-${session_id}`);
    } else {
      setIsUserTurn(status.isUserTurn);
      // With LiveKit, the agent will handle the initial audio automatically
    }
    
    return status;
  };

  // Initialize LiveKit when component mounts
  useEffect(() => {
    const checkExistingSession = async (interviewData) => {
      // Check if there's an existing LiveKit session for this interview
      const existingToken = localStorage.getItem(`livekit-token-${session_id}`);
      const existingSessionData = localStorage.getItem(`livekit-session-${session_id}`);
      
      if (existingToken && existingSessionData && !interviewEnded) {
        try {
          console.log('Reconnecting to existing LiveKit session...');
          const sessionData = JSON.parse(existingSessionData);
          
          // Try to reconnect to the existing room
          const serverUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL || 'wss://vokely-0dzq7f4x.livekit.cloud';
          await room.connect(serverUrl, existingToken, {
            autoSubscribe: true,
          });
          
          setLivekitInitialized(true);
          console.log('Successfully reconnected to existing LiveKit session');
          return true;
        } catch (error) {
          console.log('Failed to reconnect to existing session, creating new one:', error);
          // Clear invalid session data
          localStorage.removeItem(`livekit-token-${session_id}`);
          localStorage.removeItem(`livekit-session-${session_id}`);
          return false;
        }
      }
      return false;
    };

    const initializeLiveKit = async (interviewData) => {
      if (!livekitInitialized && !isConnecting && !isConnected && !interviewEnded) {
        try {
          // First try to reconnect to existing session
          const reconnected = await checkExistingSession(interviewData);
          
          if (!reconnected) {
            // Create new session if reconnection failed or no existing session
            console.log('Creating new LiveKit session...');
            const hasPermission = await requestMicrophonePermission();
            if (hasPermission) {
              const response = await startInterview(session_id, interviewData.resume?.job_description || jobDescription);
              
              // Store session data for reconnection
              if (response && response.token) {
                localStorage.setItem(`livekit-token-${session_id}`, response.token);
                localStorage.setItem(`livekit-session-${session_id}`, JSON.stringify(response));
              }
              
              setLivekitInitialized(true);
              console.log('Successfully created new LiveKit session');
            }
          }
        } catch (error) {
          console.error('Error initializing LiveKit:', error);
        }
      }
    };

    const fetchInterviewData = async() => {
      const data = await getInterviewDetails(session_id);
      if(data){
        setHistory(data.interview.history);
        setAnimatedHistory(data.interview.history);
        setJobDescription(data.resume.job_description);
        setTitle(data.interview.title);
        const ideal_answers = data.interview.ideal_answers;
        if(ideal_answers!==null && ideal_answers.length>0){
          setSuggestion(ideal_answers[ideal_answers.length-1]);
        }
        await updateInterviewState(data);
        
        // Initialize LiveKit after getting interview data
        await initializeLiveKit(data);
      }
    };

    fetchInterviewData();
  }, []);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [history]);

  useEffect(() => {
    const checkWidth = () => setIsBreakPoint(window.innerWidth < 900);
    checkWidth();

    window.addEventListener('resize', checkWidth);
    return () => window.removeEventListener('resize', checkWidth);
  }, []);

  // Show connection error if LiveKit fails
  if (connectionError) {
    return (
      <div className='grid place-items-center h-screen w-screen'>
        <div className='flex flex-col items-center justify-center gap-5'>
          <h1 className='text-2xl font-semibold text-red-600 text-center'>Connection Error</h1>
          <p className='text-center'>{connectionError}</p>
          <button 
            onClick={() => window.location.reload()} 
            className='px-4 py-2 bg-blue-500 text-white rounded-md'
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if(interviewEnded){
    return (
      generatingFeedback ? (
      <div className='grid place-items-center h-screen w-screen'>
        <div className='flex flex-col items-center justify-center gap-5'>
          <h1 className='text-2xl font-semibold text-primary text-center'>Geneva is analysing your performance and<br />generating your personalized feedback</h1>
          <Spinner />
        </div>
      </div>  
    ) : <div className='h-screen w-screen'><InterviewSummary conclusion={conclusion} interview_id={session_id} candidateName={candidateName} jobDescription={jobDescription} /></div>
    )
  }

  return isBreakPoint ? (
    <div>
      <div className="flex flex-col items-center gap-1 justify-between px-2 py-2 md:col-span-2">
        <div>
          <h1 className="text-lg font-medium text-center">{title} - Interview</h1>
          <p className="text-sm text-gray-600">A comprehensive {title} role</p>
        </div>
        <Timer
        sessionId={session_id}
        onTimeUp={handleEndInterview}
        interviewEnded={interviewEnded}
        hasEndedByUser={hasEndedByUser}
        setInterviewEnded={setInterviewEnded}
        isBreakPoint={isBreakPoint}
        />
      </div>
        
      <div className="flex h-[75vh] w-[90vw] flex-col gap-2 m-auto">
        <div className="flex-1 overflow-auto">
          <VideoCall
            isUserTurn={isUserTurn}
            sendAudioToAPI={() => {}} // LiveKit handles audio automatically
            startRecording={startLiveKitRecording}
            stopRecording={stopLiveKitRecording}
            handleEndInterview={handleEndInterview}
            showPopUp={showPopUp}
            setShowPopUp={setShowPopUp}
            isMicOn={isMicOn}
            setIsMicOn={setIsMicOn}
            isBreakPoint={isBreakPoint}
          />
        </div>
        <div className='flex justify-between items-center'>
          <div className="w-[20vh]">
              <Geneva isAudioPlaying={isAudioPlaying} isBreakPoint={isBreakPoint} small={true} />
          </div>
          <button
            className="flex flex-wrap px-4 py-2 text-sm items-center justify-center text-white rounded-md bg-black"
            onClick={() => {
              setShowSuggestions(true);
            }}
          >
            AI Suggestions
            <TriStar size="16" />
          </button>
          {showSuggestions && (
            <div className='absolute top-0 left-0 h-screen w-screen grid place-items-center'>
              <div className='asbolute h-full w-full bg-[#BDBBBF] z-[998] opacity-[.8]'></div>
              <div className='h-fit w-[90vw] absolute z-[999] rounded-md bg-white overflow-hidden'ref={chatwindowRef}>
                <Suggestion
                    data={suggestion}
                    onClose={() => setShowSuggestions(false)}
                  />
              </div>
            </div>
            )}
            {!interviewEnded && (
              <div
                className="fixed z-50"
                style={{
                  right: buttonPosition.x,
                  bottom: buttonPosition.y,
                }}
              >
              <button
                className="flex h-12 w-12 cursor-move items-center justify-center rounded-full text-white bg-black shadow-lg transition-all hover:scale-110"
                onTouchStart={handleDragStart}
                onClick={() => {
                  setShowChatWindow(true);
                }}
              >
                <BotMessageSquare size={22}/>
              </button>
              </div>
            )}
            {showChatWindow && (
               <div className='absolute top-0 left-0 h-screen w-screen grid place-items-center'>
                  <div className='asbolute h-full w-full bg-[#BDBBBF] z-[998] opacity-[.8]'></div>
                  <div className='h-[80vh] w-[90vw] absolute z-[999] rounded-md bg-white overflow-hidden'ref={chatwindowRef}>
                    <ChatInterface
                      history={history}
                      setUserResponse={setUserResponse}
                      handleSendResponse={handleSendResponse}
                      userResponse={userResponse}
                      animatedHistory={animatedHistory}
                      setAnimatedHistory={setAnimatedHistory}
                      lastProcessedIndexRef={lastProcessedIndexRef}
                      processingRef={processingRef}
                      isGenerating={isGenerating}
                      isUserTurn={isUserTurn}
                      closeSuggestions={() => setShowSuggestions(false)}
                      closeChatInterface={() => setShowChatWindow(false)}
                      isBreakPoint={isBreakPoint}
                    />
                    </div>
               </div>
            )}
        </div>
      </div>
    </div>
  ) : (
    <div
      className="grid h-screen grid-cols-[70vw_1fr] gap-x-4 gap-y-2 bg-white p-4"
      style={{ gridTemplateRows: '10vh 80vh' }}
    >
      {/* Left */}
      <div className="flex items-center gap-10 px-2 py-4">
        <div>
          <h1 className="font-medium">{title} - Interview</h1>
          <p>A comprehensive {title} role</p>
        </div>
      </div>

      {/* Timer */}
      <Timer
        sessionId={session_id}
        onTimeUp={handleEndInterview}
        hasEndedByUser={hasEndedByUser}
        setInterviewEnded={setInterviewEnded}
        isBreakPoint={isBreakPoint}
        interviewEnded={interviewEnded}
      />
      <div className="bg-[#F8F3FF]">
        {/* Video Container */}
        <div className="h-[75%] w-[100%] rounded-md p-2">
          <VideoCall
            isUserTurn={isUserTurn}
            sendAudioToAPI={() => {}} // LiveKit handles audio automatically
            startRecording={startLiveKitRecording}
            stopRecording={stopLiveKitRecording}
            handleEndInterview={handleEndInterview}
            showPopUp={showPopUp}
            setShowPopUp={setShowPopUp}
            isMicOn={isMicOn}
            setIsMicOn={setIsMicOn}
            isBreakPoint={isBreakPoint}
          />
        </div>

        {/* AI */}
        <div className="flex h-[24%] items-center justify-between pl-2">
          <div className="img-container relative float-end mr-1 flex h-[100%] w-[150px] justify-center rounded-md border-[1px] border-gray-200">
            {personalInfo.profileImage ? (
              <div className="h-[100%] w-[100%]">
                <img src={personalInfo.profileImage} alt="ai-interviewer" />
              </div>
            ) : (
              <div className="grid h-[100%] w-[100%] place-items-center">
                <Profile size="32" />
              </div>
            )}
            <div className="absolute bottom-2 right-5">
              <Speaking isSpeaking={isMicOn} />
            </div>
          </div>

          {showSuggestions ? (
            <div className='w-[60%] overflow-y-scroll py-1 h-[100%]'>
              <Suggestion
              data={suggestion}
              onClose={() => setShowSuggestions(false)}
            />
            </div>
            ) : (
              <button
                className="flex h-fit w-fit items-center gap-2 rounded-full bg-black px-4 py-2"
                onClick={() => {
                  setShowSuggestions(true);
                }}
              >
                <span className="text-gradient font-semibold">
                  Get AI Suggestion
                </span>
                <TriStar size="22" />
              </button>
            )}

            <Geneva
              isAudioPlaying={isAudioPlaying}
              isBreakPoint={isBreakPoint}
            />
          </div>
        </div>

      {/* Chat Window */}
      <div className="rounded-md border-2 border-gray-200 bg-[#F1EAFC]">
        <ChatInterface
          history={history}
          setUserResponse={setUserResponse}
          handleSendResponse={handleSendResponse}
          userResponse={userResponse}
          animatedHistory={animatedHistory}
          setAnimatedHistory={setAnimatedHistory}
          lastProcessedIndexRef={lastProcessedIndexRef}
          processingRef={processingRef}
          isGenerating={isGenerating}
          isUserTurn={isUserTurn}
          closeChatInterface={() => setShowChatWindow(false)}
          closeSuggestions={() => setShowSuggestions(false)}
        />
      </div>

      <p className="absolute bottom-1 flex items-end gap-2 text-sm text-[#737373]">
        Session ID:{session_id}
        <span className="flex items-center gap-2 text-black">
          <Lock size={16} />
          Encrypted
        </span>
      </p>
    </div>
  );
}