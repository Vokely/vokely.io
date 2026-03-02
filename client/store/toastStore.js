import { create } from 'zustand';

const useToastStore = create((set) => ({
  toasts: [], // Array to hold all active toasts
  addToast: (message, type = 'info', position = 'top-right', duration = 3000) => {
    const id = Math.random().toString(36).substr(2, 9); // Generate a unique ID for the toast
    set((state) => ({
      toasts: [...state.toasts, { id, message, type, position, duration }], // Add the new toast
    }));

    // Automatically remove the toast after the specified duration
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((toast) => toast.id !== id), // Remove the toast by ID
      }));
    }, duration);
  },
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id), // Remove a specific toast by ID
    }));
  },
}));

export default useToastStore;