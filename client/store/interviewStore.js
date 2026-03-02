'use client';

import { create } from 'zustand';

// Define interview store
const useInterviewStore = create((set, get) => ({
  sessionId: null,
  history: [],
  animatedHistory: [],
  title: '',
  jobDescription: '',
  suggestion: '',
  interviewEnded: false,
  conclusion: null,
  interviewStartTime: null, // Store the interview start time
  interviewDuration: 10 * 60, // Default duration in seconds (10 minutes)
  
  // Actions
  setSessionId: (id) => set({ sessionId: id }),
  setHistory: (history) => set({ history }),
  addHistory: (message) => set((state) => ({
    history: [...state.history, message],
  })),
  setTitle: (title) => set({ title }),
  setJobDescription: (description) => set({ jobDescription: description }),
  setSuggestion: (suggestion) => set({ suggestion }),
  setInterviewEnded: (ended) => set({ interviewEnded: ended }),
  setConclusion: (conclusion) => set({ conclusion }),
  setInterviewStartTime: (startTime) => set({ interviewStartTime: startTime }),
  setInterviewDuration: (duration) => set({ interviewDuration: duration }),
  
  getRemainingTime: () => {
    const { interviewStartTime, interviewDuration, interviewEnded } = get();
    
    if (interviewEnded || !interviewStartTime) return 0;
    
    const now = Date.now();
    const endTime = interviewStartTime + (interviewDuration * 1000);
    
    if (endTime <= now) return 0;
    
    return Math.floor((endTime - now) / 1000);
  },
}));

export default useInterviewStore;