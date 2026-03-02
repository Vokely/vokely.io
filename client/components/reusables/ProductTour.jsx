
'use client';

import { useState, useEffect, useRef } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Check,
  Rocket,
  Info,
  Sparkles,
} from 'lucide-react';

/**
 * ProductTour Component
 * 
 * A fully customizable, reusable product tour component for Next.js
 * 
 * @param {Object} props
 * @param {Array} props.steps - Array of tour step objects
 * @param {boolean} props.isOpen - Controls tour visibility
 * @param {Function} props.onClose - Callback when tour is closed
 * @param {Function} props.onComplete - Callback when tour is completed
 * @param {Function} props.onStepChange - Callback when step changes (receives stepIndex)
 * @param {string} props.primaryColor - Primary color for buttons and accents (default: 'blue')
 * @param {boolean} props.showProgress - Show progress bar (default: true)
 * @param {boolean} props.allowSkip - Allow skipping the tour (default: true)
 * @param {boolean} props.closeOnOverlayClick - Close tour when clicking overlay (default: false)
 * @param {string} props.overlayOpacity - Overlay opacity from 0-100 (default: '50')
 * @param {string} props.animation - Animation style: 'fade', 'slide', 'zoom' (default: 'fade')
 * 
 * Step Object Structure:
 * {
 *   target: string (CSS selector or null for center modal),
 *   title: string,
 *   content: string or JSX,
 *   position: 'top' | 'bottom' | 'left' | 'right' | 'center' (default: 'bottom'),
 *   icon: React Component (optional),
 *   action: { label: string, onClick: function } (optional),
 *   spotlightPadding: number (default: 10),
 *   disableOverlay: boolean (default: false),
 *   beforeEnter: function (optional) - Called before entering this step,
 *   onEnter: function (optional) - Called when entering this step,
 *   onLeave: function (optional) - Called when leaving this step
 * }
 */
export default function ProductTour({
  steps = [],
  isOpen = false,
  onClose = () => {},
  onComplete = () => {},
  onStepChange = () => {},
  primaryColor = 'blue',
  showProgress = true,
  allowSkip = true,
  closeOnOverlayClick = false,
  overlayOpacity = '50',
  animation = 'fade',
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [spotlightRect, setSpotlightRect] = useState(null);
  const tooltipRef = useRef(null);

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  // Calculate tooltip and spotlight positions
  useEffect(() => {
    if (!isOpen || !currentStepData) return;

    const calculatePositions = () => {
      const targetSelector = currentStepData.target;
      
      if (!targetSelector) {
        setSpotlightRect(null);
        return;
      }

      const targetElement = document.querySelector(targetSelector);
      if (!targetElement) {
        console.warn(`Target element not found: ${targetSelector}`);
        setSpotlightRect(null);
        return;
      }

      const rect = targetElement.getBoundingClientRect();
      const padding = currentStepData.spotlightPadding || 10;
      
      setSpotlightRect({
        top: rect.top - padding,
        left: rect.left - padding,
        width: rect.width + padding * 2,
        height: rect.height + padding * 2,
      });

      if (tooltipRef.current) {
        const tooltipRect = tooltipRef.current.getBoundingClientRect();
        const position = currentStepData.position || 'bottom';
        let top = 0;
        let left = 0;

        switch (position) {
          case 'top':
            top = rect.top - tooltipRect.height - 20;
            left = rect.left + rect.width / 2 - tooltipRect.width / 2;
            break;
          case 'bottom':
            top = rect.bottom + 20;
            left = rect.left + rect.width / 2 - tooltipRect.width / 2;
            break;
          case 'left':
            top = rect.top + rect.height / 2 - tooltipRect.height / 2;
            left = rect.left - tooltipRect.width - 20;
            break;
          case 'right':
            top = rect.top + rect.height / 2 - tooltipRect.height / 2;
            left = rect.right + 20;
            break;
          case 'center':
            top = window.innerHeight / 2 - tooltipRect.height / 2;
            left = window.innerWidth / 2 - tooltipRect.width / 2;
            break;
          default:
            top = rect.bottom + 20;
            left = rect.left + rect.width / 2 - tooltipRect.width / 2;
        }

        const margin = 20;
        if (left < margin) left = margin;
        if (left + tooltipRect.width > window.innerWidth - margin) {
          left = window.innerWidth - tooltipRect.width - margin;
        }
        if (top < margin) top = margin;
        if (top + tooltipRect.height > window.innerHeight - margin) {
          top = window.innerHeight - tooltipRect.height - margin;
        }

        setTooltipPosition({ top, left });
      }
    };

    calculatePositions();
    window.addEventListener('resize', calculatePositions);
    window.addEventListener('scroll', calculatePositions);

    return () => {
      window.removeEventListener('resize', calculatePositions);
      window.removeEventListener('scroll', calculatePositions);
    };
  }, [isOpen, currentStep, currentStepData]);

  useEffect(() => {
    if (!isOpen || !currentStepData?.target) return;

    const targetElement = document.querySelector(currentStepData.target);
    if (targetElement) {
      targetElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [isOpen, currentStep, currentStepData]);

  const handleNext = () => {
    // Call onLeave for current step
    if (currentStepData?.onLeave) {
      currentStepData.onLeave();
    }

    if (isLastStep) {
      handleComplete();
    } else {
      const nextStep = currentStep + 1;
      const nextStepData = steps[nextStep];
      
      // Call beforeEnter for next step
      if (nextStepData?.beforeEnter) {
        nextStepData.beforeEnter();
      }
      
      setCurrentStep(nextStep);
      onStepChange(nextStep);
      
      // Call onEnter for next step after a short delay to allow DOM updates
      setTimeout(() => {
        if (nextStepData?.onEnter) {
          nextStepData.onEnter();
        }
      }, 100);
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      // Call onLeave for current step
      if (currentStepData?.onLeave) {
        currentStepData.onLeave();
      }
      
      const prevStep = currentStep - 1;
      const prevStepData = steps[prevStep];
      
      // Call beforeEnter for previous step
      if (prevStepData?.beforeEnter) {
        prevStepData.beforeEnter();
      }
      
      setCurrentStep(prevStep);
      onStepChange(prevStep);
      
      // Call onEnter for previous step
      setTimeout(() => {
        if (prevStepData?.onEnter) {
          prevStepData.onEnter();
        }
      }, 100);
    }
  };

  const handleClose = () => {
    setCurrentStep(0);
    onClose();
  };

  const handleComplete = () => {
    setCurrentStep(0);
    onComplete();
    onClose();
  };

  const handleOverlayClick = () => {
    if (closeOnOverlayClick) {
      handleClose();
    }
  };

  const handleStepAction = () => {
    if (currentStepData.action?.onClick) {
      currentStepData.action.onClick();
    }
  };

  if (!isOpen || steps.length === 0) return null;

  const colorSchemes = {
    blue: {
      gradient: 'from-blue-500 via-blue-600 to-indigo-600',
      spotlightColor: '#3b82f6',
      glowColor: 'rgba(59, 130, 246, 0.4)',
      iconBg: 'from-blue-500/20 to-indigo-500/20',
      badge: 'from-blue-500/10 to-indigo-500/10 text-blue-700 border-blue-300/30',
      button: 'from-blue-600 via-blue-500 to-indigo-600',
      progressGlow: 'shadow-[0_0_15px_rgba(59,130,246,0.5)]',
    },
    green: {
      gradient: 'from-emerald-500 via-green-600 to-teal-600',
      spotlightColor: '#22c55e',
      glowColor: 'rgba(34, 197, 94, 0.4)',
      iconBg: 'from-emerald-500/20 to-teal-500/20',
      badge: 'from-emerald-500/10 to-teal-500/10 text-emerald-700 border-emerald-300/30',
      button: 'from-emerald-600 via-green-500 to-teal-600',
      progressGlow: 'shadow-[0_0_15px_rgba(34,197,94,0.5)]',
    },
    purple: {
      gradient: 'from-purple-500 via-violet-600 to-fuchsia-600',
      spotlightColor: '#a855f7',
      glowColor: 'rgba(168, 85, 247, 0.4)',
      iconBg: 'from-purple-500/20 to-fuchsia-500/20',
      badge: 'from-purple-500/10 to-fuchsia-500/10 text-purple-700 border-purple-300/30',
      button: 'from-purple-600 via-violet-500 to-fuchsia-600',
      progressGlow: 'shadow-[0_0_15px_rgba(168,85,247,0.5)]',
    },
    orange: {
      gradient: 'from-orange-500 via-amber-600 to-red-600',
      spotlightColor: '#f97316',
      glowColor: 'rgba(249, 115, 22, 0.4)',
      iconBg: 'from-orange-500/20 to-red-500/20',
      badge: 'from-orange-500/10 to-red-500/10 text-orange-700 border-orange-300/30',
      button: 'from-orange-600 via-amber-500 to-red-600',
      progressGlow: 'shadow-[0_0_15px_rgba(249,115,22,0.5)]',
    },
    indigo: {
      gradient: 'from-indigo-500 via-blue-600 to-violet-600',
      spotlightColor: '#6366f1',
      glowColor: 'rgba(99, 102, 241, 0.4)',
      iconBg: 'from-indigo-500/20 to-violet-500/20',
      badge: 'from-indigo-500/10 to-violet-500/10 text-indigo-700 border-indigo-300/30',
      button: 'from-indigo-600 via-blue-500 to-violet-600',
      progressGlow: 'shadow-[0_0_15px_rgba(99,102,241,0.5)]',
    },
  };

  const colors = colorSchemes[primaryColor] || colorSchemes.blue;

  const animationClasses = {
    fade: 'animate-fadeIn',
    slide: 'animate-slideUp',
    zoom: 'animate-zoomIn',
  };

  return (
    <div className="fixed inset-0 z-[9999]">
      {/* Overlay with spotlight */}
      <div
        className="absolute inset-0 backdrop-blur-sm"
        onClick={handleOverlayClick}
        style={{
          backgroundColor: `rgba(0, 0, 0, ${parseInt(overlayOpacity) / 100})`,
        }}
      >
        {spotlightRect && !currentStepData.disableOverlay && (
          <>
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{ zIndex: 1 }}
            >
              <defs>
                <mask id="spotlight-mask">
                  <rect x="0" y="0" width="100%" height="100%" fill="white" />
                  <rect
                    x={spotlightRect.left}
                    y={spotlightRect.top}
                    width={spotlightRect.width}
                    height={spotlightRect.height}
                    rx="12"
                    fill="black"
                  />
                </mask>
                <filter id="spotlight-glow">
                  <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              <rect
                x="0"
                y="0"
                width="100%"
                height="100%"
                fill={`rgba(0, 0, 0, ${parseInt(overlayOpacity) / 100})`}
                mask="url(#spotlight-mask)"
              />
            </svg>

            {/* Animated spotlight border with glow */}
            <div
              className="absolute pointer-events-none animate-spotlightPulse"
              style={{
                top: spotlightRect.top,
                left: spotlightRect.left,
                width: spotlightRect.width,
                height: spotlightRect.height,
                border: `3px solid ${colors.spotlightColor}`,
                borderRadius: '12px',
                boxShadow: `0 0 0 1px rgba(255,255,255,0.1), 0 0 30px ${colors.glowColor}, inset 0 0 20px ${colors.glowColor}`,
                zIndex: 2,
              }}
            />

            {/* Sparkle effects around spotlight */}
            <div className="absolute pointer-events-none" style={{ top: spotlightRect.top - 20, left: spotlightRect.left - 20, zIndex: 3 }}>
              <Sparkles className="h-4 w-4 text-white animate-sparkle" style={{ animationDelay: '0s' }} />
            </div>
            <div className="absolute pointer-events-none" style={{ top: spotlightRect.top - 15, right: window.innerWidth - spotlightRect.left - spotlightRect.width - 15, zIndex: 3 }}>
              <Sparkles className="h-3 w-3 text-white animate-sparkle" style={{ animationDelay: '0.3s' }} />
            </div>
            <div className="absolute pointer-events-none" style={{ bottom: window.innerHeight - spotlightRect.top - spotlightRect.height - 15, left: spotlightRect.left + spotlightRect.width + 10, zIndex: 3 }}>
              <Sparkles className="h-4 w-4 text-white animate-sparkle" style={{ animationDelay: '0.6s' }} />
            </div>
          </>
        )}
      </div>

      {/* Tooltip with glassmorphism */}
      <div
        ref={tooltipRef}
        className={`absolute z-[10000] ${animationClasses[animation] || 'animate-fadeIn'}`}
        style={{
          top: currentStepData.target ? `${tooltipPosition.top}px` : '50%',
          left: currentStepData.target ? `${tooltipPosition.left}px` : '50%',
          transform: !currentStepData.target ? 'translate(-50%, -50%)' : 'none',
          maxWidth: '90vw',
          width: currentStepData.target ? '420px' : '520px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Gradient background glow */}
        <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} opacity-20 blur-3xl rounded-3xl transform scale-105`} />
        
        {/* Main card with glassmorphism */}
        <div className="relative backdrop-blur-2xl bg-white/95 rounded-3xl shadow-2xl border border-white/40 overflow-hidden">
          {/* Animated gradient background */}
          <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${colors.gradient} opacity-10 rounded-full blur-3xl animate-gradientFloat`} />
          <div className={`absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr ${colors.gradient} opacity-10 rounded-full blur-3xl animate-gradientFloat`} style={{ animationDelay: '1s' }} />
          
          {/* Decorative top border */}
          <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${colors.gradient}`} />
          
          {/* Header */}
          <div className="relative p-7 pb-5">
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-start gap-4 flex-1">
                {/* Icon with gradient background */}
                <div className={`relative p-3 rounded-2xl bg-gradient-to-br ${colors.iconBg} backdrop-blur-xl border border-white/30 shadow-lg`}>
                  {currentStepData.icon ? (
                    <currentStepData.icon className="h-7 w-7 text-gray-700" />
                  ) : (
                    <Info className="h-7 w-7 text-gray-700" />
                  )}
                  {/* Icon glow effect */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} opacity-20 blur-xl rounded-2xl`} />
                </div>
                
                <div className="flex-1">
                  <h3 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">
                    {currentStepData.title}
                  </h3>
                  <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-gradient-to-r ${colors.badge} backdrop-blur-xl border shadow-sm`}>
                    <span className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${colors.gradient} animate-pulse`} />
                    Step {currentStep + 1} of {steps.length}
                  </span>
                </div>
              </div>
              
              {allowSkip && (
                <button
                  onClick={handleClose}
                  className="group relative p-2.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100/80 rounded-xl transition-all backdrop-blur-xl border border-transparent hover:border-gray-200/50"
                  aria-label="Close tour"
                >
                  <X className="h-5 w-5 relative z-10" />
                  <div className="absolute inset-0 bg-gradient-to-br from-red-500/0 to-red-500/0 group-hover:from-red-500/10 group-hover:to-pink-500/10 rounded-xl transition-all" />
                </button>
              )}
            </div>

            {/* Progress Bar with gradient and glow */}
            {showProgress && (
              <div className="relative w-full bg-gray-200/50 backdrop-blur-xl rounded-full h-2.5 mb-5 overflow-hidden border border-white/30 shadow-inner">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${colors.gradient} transition-all duration-500 ease-out ${colors.progressGlow} relative overflow-hidden`}
                  style={{
                    width: `${((currentStep + 1) / steps.length) * 100}%`,
                  }}
                >
                  {/* Animated shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                </div>
              </div>
            )}

            {/* Content */}
            <div className="relative text-gray-700 text-[15px] leading-relaxed font-medium">
              {typeof currentStepData.content === 'string' ? (
                <p className="text-gray-600">{currentStepData.content}</p>
              ) : (
                currentStepData.content
              )}
            </div>
          </div>

          {/* Footer with glass effect */}
          <div className="relative bg-gradient-to-br from-gray-50/80 to-white/60 backdrop-blur-xl px-7 py-5 flex items-center justify-between border-t border-white/50">
            <button
              onClick={handlePrevious}
              disabled={isFirstStep}
              className="group flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-gray-700 hover:text-gray-900 hover:bg-white/80 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent backdrop-blur-xl border border-gray-200/50 hover:border-gray-300/50 shadow-sm hover:shadow-md disabled:shadow-none"
            >
              <ChevronLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
              Previous
            </button>

            <div className="flex items-center gap-3">
              {currentStepData.action && (
                <button
                  onClick={handleStepAction}
                  className="px-5 py-2.5 text-sm font-bold text-gray-700 bg-white/80 backdrop-blur-xl border border-gray-200/50 hover:border-gray-300/50 hover:bg-white rounded-xl transition-all shadow-sm hover:shadow-md"
                >
                  {currentStepData.action.label}
                </button>
              )}
              <button
                onClick={handleNext}
                className={`group relative flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white rounded-xl transition-all shadow-lg hover:shadow-xl overflow-hidden`}
              >
                {/* Gradient background */}
                <div className={`absolute inset-0 bg-gradient-to-r ${colors.button} transition-transform group-hover:scale-105`} />
                
                {/* Animated shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
                
                <span className="relative z-10">
                  {isLastStep ? 'Complete' : 'Next'}
                </span>
                {isLastStep ? (
                  <Check className="h-4 w-4 relative z-10 group-hover:scale-110 transition-transform" />
                ) : (
                  <ChevronRight className="h-4 w-4 relative z-10 group-hover:translate-x-0.5 transition-transform" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Arrow indicator with gradient */}
        {currentStepData.target && currentStepData.position !== 'center' && (
          <div className="absolute" style={{
            ...(currentStepData.position === 'top' ? { bottom: '-12px', left: '50%', transform: 'translateX(-50%)' } :
                currentStepData.position === 'bottom' ? { top: '-12px', left: '50%', transform: 'translateX(-50%)' } :
                currentStepData.position === 'left' ? { right: '-12px', top: '50%', transform: 'translateY(-50%)' } :
                currentStepData.position === 'right' ? { left: '-12px', top: '50%', transform: 'translateY(-50%)' } : {})
          }}>
            <div className={`relative w-6 h-6 rotate-45 bg-white/95 backdrop-blur-2xl border-t border-l border-white/40 shadow-xl ${
              currentStepData.position === 'top' ? '' :
              currentStepData.position === 'bottom' ? 'border-t-0 border-l-0 border-b border-r' :
              currentStepData.position === 'left' ? 'border-t-0 border-l-0 border-b border-r' :
              'border-t border-l border-r-0 border-b-0'
            }`} />
          </div>
        )}
      </div>

      {/* Enhanced Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes zoomIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes spotlightPulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.02);
          }
        }
        @keyframes sparkle {
          0%, 100% {
            opacity: 0;
            transform: scale(0) rotate(0deg);
          }
          50% {
            opacity: 1;
            transform: scale(1) rotate(180deg);
          }
        }
        @keyframes gradientFloat {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -30px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .animate-slideUp {
          animation: slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .animate-zoomIn {
          animation: zoomIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .animate-spotlightPulse {
          animation: spotlightPulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .animate-sparkle {
          animation: sparkle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .animate-gradientFloat {
          animation: gradientFloat 8s ease-in-out infinite;
        }
        .animate-shimmer {
          animation: shimmer 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}