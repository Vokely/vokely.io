// stores/alertStore.js
import { create } from 'zustand';

const useAlertStore = create((set) => ({
  isOpen: false,
  title: '',
  message: '',
  confirmText: 'Yes',
  cancelText: 'No',
  resolveCallback: null,

  openAlert: (title, message, options = {}) => {
    const { confirmText = 'Yes', cancelText = 'No' } = options;
    return new Promise((resolve) => {
      set({
        isOpen: true,
        title,
        message,
        confirmText,
        cancelText,
        resolveCallback: resolve,
      });
    });
  },

  closeAlert: () => {
    set({
      isOpen: false,
      title: '',
      message: '',
      resolveCallback: null,
    });
  },
}));

export default useAlertStore;
