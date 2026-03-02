import { create } from 'zustand';

export const useAuthStore = create((set, get) => ({
  user: null,
  loading: true,

  setUser: (user) => set({ user, loading: false }),
  clearUser: () => set({ user: null, loading: false }),

  checkFeatureExists: (featureName) => {
    const { user } = get(); 
    return user?.plan_details?.features?.includes(featureName) || false;
  },
}));
