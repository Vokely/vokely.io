'use client';

import { useEffect, useState } from 'react';
import StopWatch from '../icons/StopWatch';
import useInterviewStore from '@/store/interviewStore';

export default function Timer({ sessionId, onTimeUp, hasEndedByUser, setInterviewEnded, interviewEnded, isBreakPoint }) {
  const [timeLeft, setTimeLeft] = useState(null);
  const [isActive, setIsActive] = useState(true);
  
  const interviewStartTime = useInterviewStore(state => state.interviewStartTime);
  const interviewDuration = useInterviewStore(state => state.interviewDuration);
  
  useEffect(() => {
    // If user has ended the session, stop the timer
    if (hasEndedByUser || interviewEnded) {
      setInterviewEnded(true);
      setTimeLeft(0);
      setIsActive(false);
      return;
    }

    // Get the stored end time from localStorage
    const storedEndTime = localStorage.getItem(`interview-end-time-${sessionId}`);
    
    // Calculate time left
    if (storedEndTime) {
      const endTime = parseInt(storedEndTime, 10);
      const now = Date.now();
      
      // If the end time is in the future, continue timer
      if (endTime > now) {
        setTimeLeft(Math.floor((endTime - now) / 1000));
      } else {
        // Time already expired
        setInterviewEnded(true);
        setTimeLeft(0);
        onTimeUp();
        return;
      }
    } else if (interviewStartTime) {
      // Use interview start time from store if available
      const endTime = interviewStartTime + (interviewDuration * 1000);
      const now = Date.now();
      
      // Store in localStorage for persistence
      localStorage.setItem(`interview-end-time-${sessionId}`, endTime.toString());
      
      if (endTime > now) {
        setTimeLeft(Math.floor((endTime - now) / 1000));
      } else {
        setInterviewEnded(true);
        setTimeLeft(0);
        onTimeUp();
        return;
      }
    } else {
      // No stored time or interview start time, initialize a new timer
      const startTime = Date.now();
      const endTime = startTime + (interviewDuration * 1000);
      
      localStorage.setItem(`interview-end-time-${sessionId}`, endTime.toString());
      
      setTimeLeft(interviewDuration);
    }
    
    // Start the timer only if not ended by user
    const timerInterval = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1 || hasEndedByUser) {
          clearInterval(timerInterval);
          if (prevTime <= 1) onTimeUp();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
    
    // Cleanup
    return () => clearInterval(timerInterval);
  }, [sessionId, onTimeUp, hasEndedByUser, interviewStartTime, interviewDuration]);
  
  // Format time as mm:ss
  const formatTime = (seconds) => {
    if (seconds === null) return '--:--';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  // Determine timer color based on time remaining
  const getTimerColor = () => {
    if (timeLeft === null) return 'text-gray-400'; // Default state
    if (timeLeft <= 300) return 'text-red-500'; // Urgent: Last 5 minutes
    if (timeLeft <= 420) return 'text-orange-500'; // Warning: Last 7 minutes
    return 'text-primary'; // Safe: More than 7 minutes remaining
  };
  
  const getStatusText = () => {
    if (hasEndedByUser) return 'Interview ended';
    if (timeLeft === null) return 'Waiting to start...';
    if (timeLeft <= 300) return 'Interview ending soon';
    if (timeLeft <= 420) return 'Halfway through, keep going!';
    return 'Interview in progress';
  };
  
  return (
    <div className="bg-lightviolet rounded-md p-2 lap:p-4 flex items-center justify-between">
      <div className='mr-3'>
        <StopWatch size={isBreakPoint ? '20' : '40'}/>
      </div>
      <p className={`font-medium ${getTimerColor()} mt-2`}>{isBreakPoint ? '' : getStatusText()}</p>
      <div className={`flex items-center gap-2 font-semibold text-lg ${getTimerColor()}`}>
        <p className='lap:text-3xl'>{formatTime(timeLeft)}</p>
      </div>
    </div>
  );
}