'use client';
import useToastStore from '@/store/toastStore';
import Toast from './Toast';

// Mark this as a Client Component

const ToastManager = () => {
  const toasts = useToastStore((state) => state.toasts); // Get all toasts from the store
  const removeToast = useToastStore((state) => state.removeToast); // Get the removeToast function

  return (
    <div>
      {toasts.map((toast, index) => (
        <Toast
          key={toast.id}
          id={toast.id}
          message={toast.message}
          type={toast.type}
          position={toast.position}
          duration={toast.duration}
          index={index} // Pass the index to calculate vertical offset
          onClose={() => removeToast(toast.id)} // Remove the toast when it closes
        />
      ))}
    </div>
  );
};

export default ToastManager;
