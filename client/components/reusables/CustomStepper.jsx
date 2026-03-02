import React from 'react';
import { Check } from 'lucide-react';

export const CustomStepper = ({ steps, currentStep }) => {
  return (
    <div className="flex items-center justify-between w-full max-w-4xl gap-2 mx-auto p-4">
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isCompleted = stepNumber < currentStep;
        const isCurrent = stepNumber === currentStep;        
        return (
          <div key={index} className="flex items-center flex-1 gap-2">
            {/* Step Circle and Content */}
            <div className="flex flex-col items-center">
              {/* Circle */}
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                ${isCompleted 
                  ? 'bg-green-500 text-white' 
                  : isCurrent 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-blue-200 text-blue-400'
                }
              `}>
                {isCompleted ? (
                  <Check size={16} />
                ) : (
                  stepNumber
                )}
              </div>
              
              {/* Step Details */}
              <div className="mt-2 text-center">
                <div className="text-xs text-gray-500 uppercase tracking-wide">
                  {step.name}
                </div>
                <div className={`text-sm font-medium mt-1 ${
                  isCompleted ? 'text-gray-900' : isCurrent ? 'text-blue-600' : 'text-gray-400'
                }`}>
                  {step.title}
                </div>
                <div className={`text-xs mt-1 ${
                  isCompleted 
                    ? 'text-green-600' 
                    : isCurrent 
                      ? 'text-blue-500' 
                      : 'text-gray-400'
                }`}>
                  {isCompleted ? 'Completed' : isCurrent ? 'In Progress' : 'Pending'}
                </div>
              </div>
            </div>
            
            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div className={`flex-1 h-[2px] ${
                stepNumber < currentStep ? 'bg-green-500' : 'bg-gray-300'
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );
};