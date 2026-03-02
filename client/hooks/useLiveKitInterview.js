import { useState, useEffect, useRef, useCallback } from 'react';
import { Room, RoomEvent, ConnectionState, Track } from 'livekit-client';
import { startVoiceInterview, endVoiceInterview } from '@/lib/interviewUtil';
import useJobStore from '@/store/prepareInterview';

export function useLiveKitInterview() {
  const roomRef = useRef(new Room({
    adaptiveStream: true,
    dynacast: true,
    videoCaptureDefaults: {
      resolution: { width: 1280, height: 720 },
    },
  }));
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const [isMicEnabled, setIsMicEnabled] = useState(false);
  const [isAgentSpeaking, setIsAgentSpeaking] = useState(false);
  const [sessionData, setSessionData] = useState(null);

  // Get resume ID and job description from store as fallback
  const { resumeId: storeResumeId, jobDescription: storeJobDescription } = useJobStore();

  // Setup room event listeners
  useEffect(() => {
    const room = roomRef.current;

    const handleConnected = () => {
      console.log('Connected to LiveKit room');
      setIsConnected(true);
      setIsConnecting(false);
      setConnectionError(null);
    };

    const handleDisconnected = () => {
      console.log('Disconnected from LiveKit room');
      setIsConnected(false);
      setIsConnecting(false);
    };

    const handleConnectionStateChanged = (state) => {
      console.log('Connection state changed:', state);
      if (state === ConnectionState.Failed) {
        setConnectionError('Failed to connect to interview room');
        setIsConnecting(false);
      }
    };

    const handleTrackSubscribed = (track, publication, participant) => {
      if (track.kind === Track.Kind.Audio && participant.isAgent) {
        console.log('Agent audio track subscribed');
        // Handle agent audio
        const audioElement = track.attach();
        audioElement.play();

        // Monitor agent speaking
        track.on('audioPlaybackStarted', () => setIsAgentSpeaking(true));
        track.on('audioPlaybackStopped', () => setIsAgentSpeaking(false));
      }
    };

    const handleTrackUnsubscribed = (track, publication, participant) => {
      if (track.kind === Track.Kind.Audio && participant.isAgent) {
        console.log('Agent audio track unsubscribed');
        setIsAgentSpeaking(false);
      }
    };

    room.on(RoomEvent.Connected, handleConnected);
    room.on(RoomEvent.Disconnected, handleDisconnected);
    room.on(RoomEvent.ConnectionStateChanged, handleConnectionStateChanged);
    room.on(RoomEvent.TrackSubscribed, handleTrackSubscribed);
    room.on(RoomEvent.TrackUnsubscribed, handleTrackUnsubscribed);

    return () => {
      room.off(RoomEvent.Connected, handleConnected);
      room.off(RoomEvent.Disconnected, handleDisconnected);
      room.off(RoomEvent.ConnectionStateChanged, handleConnectionStateChanged);
      room.off(RoomEvent.TrackSubscribed, handleTrackSubscribed);
      room.off(RoomEvent.TrackUnsubscribed, handleTrackUnsubscribed);
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    const room = roomRef.current;
    return () => {
      room.disconnect();
    };
  }, []);

  // Start voice interview
  const startInterview = useCallback(async (resumeId, jobDescription) => {
    try {
      setIsConnecting(true);
      setConnectionError(null);

      // Use store values as fallback if props are empty
      const finalResumeId = resumeId || storeResumeId;
      const finalJobDescription = jobDescription || storeJobDescription;

      console.log('Starting voice interview session...');
      console.log('Resume ID:', finalResumeId, 'Job Description length:', finalJobDescription?.length);

      if (!finalResumeId) {
        throw new Error('Resume ID is required to start interview');
      }

      // Start voice interview session
      const response = await startVoiceInterview(finalResumeId, finalJobDescription || '');
      console.log('Start voice interview response:', response);

      if (!response || !response.success) {
        throw new Error('Failed to start voice interview session');
      }

      setSessionData(response);

      // Connect to LiveKit room
      const serverUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL || 'wss://vokely-0dzq7f4x.livekit.cloud';
      console.log('Connecting to LiveKit server:', serverUrl);

      try {
        await Promise.race([
          roomRef.current.connect(serverUrl, response.token, {
            autoSubscribe: true,
          }),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timed out')), 10000))
        ]);
        console.log('Successfully connected to LiveKit room');
      } catch (connError) {
        console.error('LiveKit connection error:', connError);
        throw new Error(`Failed to connect to LiveKit: ${connError.message}`);
      }

      return response;
    } catch (error) {
      console.error('Error starting interview:', error);
      setConnectionError(error.message);
      setIsConnecting(false);
      throw error;
    }
  }, []);

  // End voice interview
  const endInterview = useCallback(async () => {
    try {
      if (sessionData?.session_id) {
        const response = await endVoiceInterview(sessionData.session_id);

        // Disconnect from room
        if (roomRef.current) {
          await roomRef.current.disconnect();
        }

        return response;
      }
    } catch (error) {
      console.error('Error ending interview:', error);
      throw error;
    }
  }, [sessionData]);

  // Toggle microphone
  const toggleMicrophone = useCallback(async () => {
    if (!roomRef.current || !isConnected) return;

    try {
      if (isMicEnabled) {
        // Disable microphone
        await roomRef.current.localParticipant.setMicrophoneEnabled(false);
        setIsMicEnabled(false);
      } else {
        // Enable microphone
        await roomRef.current.localParticipant.setMicrophoneEnabled(true);
        setIsMicEnabled(true);
      }
    } catch (error) {
      console.error('Error toggling microphone:', error);
    }
  }, [isMicEnabled, isConnected]);

  // Get microphone permission
  const requestMicrophonePermission = useCallback(async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      return true;
    } catch (error) {
      console.error('Microphone permission denied:', error);
      setConnectionError('Microphone permission is required for voice interviews');
      return false;
    }
  }, []);

  return {
    room: roomRef.current,
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
  };
};