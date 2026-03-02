// store/useCreditsStore.js
import {create} from 'zustand';

const useCreditsStore = create((set) => ({
  credits: null,
  setCredits: (value) => set({ credits:value }),
  reset: () => set({ credits: 0 }),
}));

export default useCreditsStore;