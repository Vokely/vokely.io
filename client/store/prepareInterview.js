import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useJobStore = create(
  persist(
    (set) => ({
      jobDescription: "",
      isPreparing: false,
      isResumesOpen: true,
      isResumeUploaded: false,
      selectedFile: null,
      isExistingResume: false,
      activeOption: 'import',
      resumeId: null,

      setJobDescription: (value) => set({ jobDescription: value }),
      setIsPreparing: (value) => set({ isPreparing: value }),
      setIsResumesOpen: () => set((state) => ({ isResumesOpen: !state.isResumesOpen })),
      setIsResumeUploaded: (value) => set({ isResumeUploaded: value }),
      setSelectedFile: (file) => set({ selectedFile: file }),
      setIsExistingResume: (value) => set({ isExistingResume: value }),
      setActiveOption: (value) => set({ activeOption: value }),
      setResumeId: (value) => set({ resumeId: value }),
    }),
    {
      name: 'job-store',
      partialize: (state) => ({
        jobDescription: state.jobDescription,
        isPreparing: state.isPreparing,
        isResumesOpen: state.isResumesOpen,
        isResumeUploaded: state.isResumeUploaded,
        selectedFile: state.selectedFile,
        isExistingResume: state.isExistingResume,
        activeOption: state.activeOption,
        resumeId: state.resumeId,
      }),
    }
  )
);

export default useJobStore;
