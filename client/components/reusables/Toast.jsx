'use client'; // Mark this as a Client Component

import { useEffect, useState } from 'react';
import { CircleCheck, Info, Lightbulb, ShieldX, TriangleAlert, X } from 'lucide-react'; // Import Lucide close icon

const Toast = ({
  id,
  message,
  type = 'info',
  position = 'top-middle',
  duration = 3000,
  index, // Index of the toast in the list
  onClose,
}) => {
  const [visible, setVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);
  const [progress, setProgress] = useState(100); // Progress bar width (100% to 0%)

  useEffect(() => {
    const startTime = Date.now();

    // Smooth progress bar animation
    const interval = setInterval(() => {
      const elapsedTime = Date.now() - startTime;
      const remainingTime = duration - elapsedTime;
      setProgress((remainingTime / duration) * 100);

      if (remainingTime <= 300) {
        clearInterval(interval);
        startExitAnimation(); // Start exit animation when duration ends
      }
    }, 10); // Update every 16ms (~60fps)

    return () => clearInterval(interval);
  }, [duration]);

  const startExitAnimation = () => {
    setIsExiting(true); // Start exit animation
    setTimeout(() => {
      setVisible(false); // Remove toast after animation completes
      onClose(); // Notify parent to remove toast from the list
    }, 300); // Match this duration with the animation duration
  };

  const handleClose = () => {
    startExitAnimation(); // Start exit animation when close button is clicked
  };

  if (!visible) return null;

  const getTypeClasses = () => {
    switch (type) {
      case 'success':
        return 'bg-green-500 text-white';
      case 'error':
        return 'bg-red-500 text-white';
      case 'warning':
        return 'bg-yellow-500 text-white';
      case 'info':
        return 'bg-blue-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getEmoji = () => {
    switch (type) {
      case 'success':
        return (<CircleCheck size={22} strokeWidth={2} />)
      case 'error':
        return (<ShieldX size={22} strokeWidth={2}/>);
      case 'warning':
        return (<TriangleAlert size={22} strokeWidth={2} />);
      case 'info':
        return (<Info size={22} strokeWidth={2}/>);
      default:
        return (<Lightbulb size={22} strokeWidth={2} />);
    }
  };

  const getAnimationClasses = () => {
    switch (position) {
      case 'top-right':
        return isExiting ? 'animate-slide-out-right' : 'animate-slide-in-right';
      case 'top-left':
        return isExiting ? 'animate-slide-out-left' : 'animate-slide-in-left';
      case 'top-middle':
        return isExiting ? 'animate-slide-out-up' : 'animate-slide-in-down';
      case 'bottom-right':
        return isExiting ? 'animate-slide-out-right' : 'animate-slide-in-right';
      case 'bottom-left':
        return isExiting ? 'animate-slide-out-left' : 'animate-slide-in-left';
      case 'bottom-middle':
        return isExiting ? 'animate-slide-out-down' : 'animate-slide-in-up';
      default:
        return isExiting ? 'animate-slide-out-right' : 'animate-slide-in-right';
    }
  };

  const getPositionStyles = () => {
    const styles = {};

    styles.zIndex =  9999;

    // Calculate vertical offset based on the toast's index
    const offset = index * 70; // 70px is the height of each toast + margin
    switch (position) {
      case 'top-right':
        styles.top = `${16 + offset}px`; // 16px is the default top margin
        styles.right = '16px';
        break;
      case 'top-left':
        styles.top = `${16 + offset}px`;
        styles.left = '16px';
        break;
      case 'top-middle':
        styles.top = `${16 + offset}px`;
        styles.left = '50%';
        styles.transform = 'translateX(-50%)';
        break;
      case 'bottom-right':
        styles.bottom = `${16 + offset}px`;
        styles.right = '16px';
        break;
      case 'bottom-left':
        styles.bottom = `${16 + offset}px`;
        styles.left = '16px';
        break;
      case 'bottom-middle':
        styles.bottom = `${16 + offset}px`;
        styles.left = '50%';
        styles.transform = 'translateX(-50%)';
        break;
      default:
        styles.top = '16px';
        styles.right = '16px';
    }

    return styles;
  };

  return (
    <div
      className={`fixed ${getTypeClasses()} px-6 py-3 rounded-md shadow-lg ${getAnimationClasses()} min-w-[300px] max-w-[350px]`}
      style={getPositionStyles()} // Apply dynamic positioning
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className='font-medium'>{message}</span> {/* Message */}
          <span className="text-lg">{getEmoji()}</span> {/* Smaller emoji */}
        </div>
        <button
          onClick={handleClose}
          className="text-white/80 hover:text-white ml-4"
        >
          <X size={22} strokeWidth={1.75}/> {/* Lucide close icon */}
        </button>
      </div>
      {/* Smooth progress bar */}
      <div className="w-full h-1 bg-black/10 mt-2 rounded-full overflow-hidden">
        <div
          className="h-full bg-white/50 rounded-full transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default Toast;