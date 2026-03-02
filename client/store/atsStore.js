import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useATSStore = create(
  persist(
    (set) => ({
      report_id:null,
      setReportId: (value) => set({ report_id:value  }),
      
      resumeId:null,
      setResumeId: (value) => set({ resumeId:value  }),
      
      score: null,
      setScore: (value) => set({ score: value }),

      essentials: null,
      setEssentials: (value) => set({ essentials: value }),

      grammarErrors: null,
      setGrammarErrors: (value) => set({ grammarErrors: value }),

      JDAnalysis: null,
      setJDAnalysis: (value) => set({ JDAnalysis: value }),
    }),
    {
      name: 'ats-storage', 
    }
  )
);
