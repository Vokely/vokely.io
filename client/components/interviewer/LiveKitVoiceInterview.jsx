import { useEffect, useState, useRef } from 'react';
import { Mic, MicOff, Phone, PhoneOff } from 'lucide-react';
import { useLiveKitInterview } from '@/hooks/useLiveKitInterview';
import Geneva from './Geneva';
import useInterviewStore from '@/store/interviewStore';
import useToastStore from '@/store/toastStore';

const LiveKitVoiceInterview = ({
  resumeId,
  jobDescription,
  onInterviewEnd,
  onInterviewStart,
  isBreakPoint
}) => {
  const {
    isConnected,
    isConnecting,
    connectionError,
    isMicEnabled,
    isAgentSpeaking,
    sessionData,
    startInterview,
    endInterview,
    toggleMicrophone,
    requestMicrophonePermission,
  } = useLiveKitInterview();

  const [interviewStarted, setInterviewStarted] = useState(false);
  const [showMicPrompt, setShowMicPrompt] = useState(false);
  const { addToast } = useToastStore();
  const { setSessionId, addHistory, setTitle, getHistory } = useInterviewStore();
  const conversationHistory =[] // Get current history

  // Start interview when component mounts
  useEffect(() => {
    console.log('LiveKitVoiceInterview mount - resumeId:', resumeId, 'jobDescription:', jobDescription);
    console.log('interviewStarted:', interviewStarted, 'isConnecting:', isConnecting, 'isConnected:', isConnected);

    // If we don't have resumeId/jobDescription, try to start anyway
    // The useLiveKitInterview hook will use values from the store
    if (!interviewStarted && !isConnecting && !isConnected) {
      console.log('Auto-starting interview...');
      handleStartInterview();
    }
  }, [resumeId, jobDescription, interviewStarted, isConnecting, isConnected]);

  // Handle connection errors
  useEffect(() => {
    if (connectionError) {
      addToast(connectionError, 'error', 'top-middle', 5000);
    }
  }, [connectionError]);

  // Update session data when connected
  useEffect(() => {
    if (sessionData && isConnected) {
      setSessionId(sessionData.session_id);
      setTitle(sessionData.title || 'Voice Interview');

      // Add introduction to history
      if (sessionData.introduction) {
        addHistory({
          role: 'AI',
          content: sessionData.introduction
        });
      }

      if (onInterviewStart) {
        onInterviewStart(sessionData);
      }
    }
  }, [sessionData, isConnected]);

  const handleStartInterview = async () => {
    try {
      console.log('handleStartInterview called with:', { resumeId, jobDescription });
      setInterviewStarted(true);

      // Request microphone permission first
      const hasPermission = await requestMicrophonePermission();
      if (!hasPermission) {
        setShowMicPrompt(true);
        return;
      }

      // Start interview - let the hook use values from store if props are empty
      const response = await startInterview(resumeId, jobDescription);
      console.log('Interview started, response:', response);

      if (response && onInterviewStart) {
        onInterviewStart(response);
      }
    } catch (error) {
      console.error('Error starting interview:', error);
      setInterviewStarted(false);
      addToast('Failed to start interview. Please try again.', 'error', 'top-middle', 5000);
    }
  };

  const handleEndInterview = async () => {
    try {
      const result = await endInterview();

      if (onInterviewEnd) {
        onInterviewEnd(result);
      }

      addToast('Interview ended successfully', 'success', 'top-middle', 3000);
    } catch (error) {
      console.error('Failed to end interview:', error);
      addToast('Error ending interview', 'error', 'top-middle', 3000);
    }
  };

  const handleMicToggle = async () => {
    if (!isConnected) {
      addToast('Please wait for connection to establish', 'warning', 'top-middle', 3000);
      return;
    }

    await toggleMicrophone();

    if (!isMicEnabled) {
      setShowMicPrompt(true);
      setTimeout(() => setShowMicPrompt(false), 3000);
    }
  };

  // Connection status indicator
  const getConnectionStatus = () => {
    if (isConnecting) return { text: 'Connecting...', color: 'text-yellow-500' };
    if (isConnected) return { text: 'Connected', color: 'text-green-500' };
    if (connectionError) return { text: 'Connection Failed', color: 'text-red-500' };
    return { text: 'Disconnected', color: 'text-gray-500' };
  };

  const connectionStatus = getConnectionStatus();

  return (
    <div className="relative w-full h-full flex flex-col bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header with Connection Status */}
      <div className="absolute top-0 left-0 right-0 z-20 px-6 py-4 bg-white/70 backdrop-blur-md border-b border-gray-200/50">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
            <span className={`text-sm font-medium ${connectionStatus.color}`}>
              {connectionStatus.text}
            </span>
          </div>
          {isConnected && (
            <div className="text-sm text-gray-500">
              {isAgentSpeaking ? '🔊 Speaking...' : '🎧 Listening...'}
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area - Split View */}
      <div className="flex-1 flex gap-8 pt-20 pb-32 px-6 max-w-7xl mx-auto w-full">
        {/* Left Side - Geneva Avatar */}
        <div className="w-1/2 flex items-center justify-center">
          <div className="relative">
            {/* Animated ring when agent is speaking */}
            {isAgentSpeaking && (
              <div className="absolute inset-0 -m-8">
                <div className="w-full h-full rounded-full border-4 border-purple-400 animate-ping opacity-75"></div>
              </div>
            )}

            {/* Geneva Avatar */}
            <div className={`transform transition-all duration-300 ${isAgentSpeaking ? 'scale-110' : 'scale-100'}`}>
              <Geneva isAudioPlaying={isAgentSpeaking} isBreakPoint={isBreakPoint} />
            </div>

            {/* Agent status text */}
            <div className="mt-6 text-center">
              <p className="text-lg font-medium text-gray-800">
                {isAgentSpeaking ? 'Geneva is speaking...' : isConnected ? 'Your turn to speak' : 'Waiting to connect...'}
              </p>
              {isConnected && !isAgentSpeaking && isMicEnabled && (
                <p className="text-sm text-gray-500 mt-1">Ask your question or respond</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Side - Conversation History */}
        <div className="w-1/2 flex flex-col">
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200/50 flex flex-col h-full max-h-[600px]">
            {/* Chat Header */}
            <div className="px-6 py-4 border-b border-gray-200/50">
              <h3 className="text-lg font-semibold text-gray-800">Interview Conversation</h3>
              <p className="text-sm text-gray-500">Transcript of your voice interview</p>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {conversationHistory.length === 0 ? (
                <div className="text-center text-gray-400 mt-8">
                  <p>Your conversation will appear here...</p>
                </div>
              ) : (
                conversationHistory.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === 'AI' ? 'justify-start' : 'justify-end'
                      } animate-fade-in`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${message.role === 'AI'
                          ? 'bg-gradient-to-br from-purple-100 to-blue-100 text-gray-800'
                          : 'bg-gradient-to-br from-green-500 to-green-600 text-white'
                        }`}
                    >
                      <div className="text-xs font-semibold mb-1 opacity-75">
                        {message.role === 'AI' ? 'Geneva' : 'You'}
                      </div>
                      <div className="text-sm leading-relaxed">{message.content}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 right-0 z-20 pb-8">
        <div className="max-w-sm mx-auto">
          {/* Control Buttons */}
          {isConnected && (
            <div className="flex items-center justify-center gap-6">
              {/* Microphone Button */}
              <div className="relative">
                <button
                  onClick={handleMicToggle}
                  className={`relative rounded-full w-16 h-16 flex items-center justify-center transition-all duration-200 shadow-lg ${isMicEnabled
                    ? 'bg-gradient-to-br from-green-400 to-green-600 text-white scale-110'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  disabled={!isConnected}
                >
                  {isMicEnabled ? <Mic size={28} /> : <MicOff size={28} />}

                  {/* Mic activity pulse */}
                  {isMicEnabled && (
                    <div className="absolute inset-0 rounded-full">
                      <div className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-40"></div>
                    </div>
                  )}
                </button>

                {/* Mic status tooltip */}
                {showMicPrompt && (
                  <div className="absolute -top-14 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-sm px-4 py-2 rounded-lg whitespace-nowrap shadow-xl animate-fade-in">
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                    Microphone is active
                  </div>
                )}

                {/* Mic label */}
                <p className="text-xs text-center mt-2 text-gray-600">
                  {isMicEnabled ? 'Mic On' : 'Mic Off'}
                </p>
              </div>

              {/* End Interview Button */}
              <div className="relative">
                <button
                  onClick={handleEndInterview}
                  className="rounded-full w-16 h-16 bg-gradient-to-br from-red-400 to-red-600 text-white flex items-center justify-center hover:from-red-500 hover:to-red-700 transition-all duration-200 shadow-lg hover:scale-105"
                >
                  <PhoneOff size={28} />
                </button>
                <p className="text-xs text-center mt-2 text-gray-600">End Call</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Loading Overlay */}
      {isConnecting && (
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/90 to-blue-900/90 backdrop-blur-sm flex items-center justify-center z-30">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-8 text-center max-w-sm shadow-2xl">
            <div className="relative w-16 h-16 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-purple-200"></div>
              <div className="absolute inset-0 rounded-full border-4 border-purple-500 border-t-transparent animate-spin"></div>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Connecting</h3>
            <p className="text-gray-600">Setting up your interview with Geneva...</p>
          </div>
        </div>
      )}

      {/* Error Overlay */}
      {connectionError && !isConnecting && (
        <div className="absolute inset-0 bg-gradient-to-br from-red-900/90 to-orange-900/90 backdrop-blur-sm flex items-center justify-center z-30">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-8 text-center max-w-md shadow-2xl">
            <div className="text-red-500 mb-6">
              <div className="w-16 h-16 mx-auto rounded-full bg-red-100 flex items-center justify-center">
                <PhoneOff size={32} />
              </div>
            </div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-3">Connection Failed</h3>
            <p className="text-gray-600 mb-6">{connectionError}</p>
            <button
              onClick={handleStartInterview}
              className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-3 rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all duration-200 shadow-lg font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveKitVoiceInterview;