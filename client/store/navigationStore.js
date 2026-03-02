import { create } from "zustand";

const useNavigationStore = create((set) => ({
  isOpen: false,
  activeMenu: "editor",
  toggleSidebar: () => set((state) => ({ isOpen: !state.isOpen })),
  setActiveMenu: (menu) => set({ activeMenu: menu }),
  activeSection: "Personal Info",
  setActiveSection: (section) => set({ activeSection: section }),
  isJDActive: true,
  toggleEditor: () => set((state) => ({ isJDActive: !state.isJDActive })),
  activeProfileSection: "Personal Info",
  setActiveProfileSection: (value) => set({ activeProfileSection: value }),
  isTemplatesVisible : false,
  setIsTemplatesVisible: (value) => set({ isTemplatesVisible: value }),
  showMobilePreview:false,
  toggleMobilePreview: () => set((state)=> ({showMobilePreview: !state.showMobilePreview })),
  getFeedback: false,
  setGetFeedback: (value)=> set({getFeedback: value}),
  isTourOpen: false,
  setIsTourOpen: (value) => set({isTourOpen: value}),
}));

export default useNavigationStore;
