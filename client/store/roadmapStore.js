import { create } from 'zustand';
import formatBlogDate from '@/lib/dateUtil';
import { addDays } from 'date-fns';

const useRoadmapStore = create((set) => ({
  targetSkill : '',
  setTargetSkill: (skill) => set({ targetSkill: skill }),
  stats: null,
  setStats: (givenStats) => {
    set({ 
    stats: givenStats 
  })},
  streak:0,
  setStreak: (streak) => set({ streak }),
  roadmap: null,
  setRoadMap: (roadmap) => set({ roadmap }),
  filteredRoadmap: null,
  setFilteredRoadmap: (roadmap) => set({ filteredRoadmap: roadmap }),
  createdAt: null,
  endDate: null,
  setEndDate: (createdAt) => {
    const formattedDate = formatBlogDate(createdAt);
    const expiryDate = addDays(createdAt, 30);
    set({ createdAt: formattedDate, endDate: formatBlogDate(expiryDate) });
  },
  resetRoadMap: () => set({ roadmap: null }),
}));

export default useRoadmapStore;