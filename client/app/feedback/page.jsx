'use client'
import { useState } from 'react';
import { X } from 'lucide-react';
import { createRating } from '@/lib/userRating';
import useToastStore from '@/store/toastStore';

export default function FeedbackComponent({ 
    onSubmit, 
    onClose, 
    title = "Give us a feedback!",
    description = "Your input is important for us. We take customer feedback very seriously.",
    showCloseButton = true,
    className = "",
    moduleName="resume_builder",
    moduleId
  }) {
    const addToast = useToastStore((state) => state.addToast);
    const [selectedRating, setSelectedRating] = useState(null);
    const [hoveredRating, setHoveredRating] = useState(null);
    const [comment, setComment] = useState('');
  
    const ratings = [
      { value: 1, emoji: '😞', label: 'Very unhappy' },
      { value: 2, emoji: '😔', label: 'Unhappy' },
      { value: 3, emoji: '😐', label: 'Neutral' },
      { value: 4, emoji: '😊', label: 'Happy' },
      { value: 5, emoji: '😎', label: 'Very happy' }
    ];
  
    const handleSubmit = async() => {
     try {
      const feedbackData = {
        rating: selectedRating,
        module_name : moduleName,
        module_id: moduleId
      };

      const trimmedComment = comment.trim();
      if (trimmedComment) {
        feedbackData.comment = trimmedComment;
      }
      const response = await createRating(feedbackData);
      const responseJson = await response.json()
      if(!response.ok){
        throw new Error(responseJson.detail)
      }else{
        addToast('Feedback Submitted Successfully', 'success', 'top-middle', 3000) 
      }
     } catch (error) {
      addToast('An error occured while submitting feedback', 'error', 'top-middle', 3000);
     }finally{
      onClose()
     }
    };
  
    const handleClose = () => {
      if (onClose) {
        onClose();
      }
    };
  
    return (
      <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[999] ${className}`}>
        <div className="bg-white rounded-2xl shadow-lg max-w-md w-full mx-4 relative">
          {/* Close button */}
          {showCloseButton && (
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          )}
  
          {/* Component content */}
          <div className="p-6 sm:p-8">
            {/* Header */}
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Feedback</h2>
            </div>
  
            {/* Title */}
            <div className="text-center mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
                {title}
              </h1>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                {description}
              </p>
            </div>
  
            {/* Rating emojis */}
            <div className="flex justify-center gap-3 sm:gap-4 mb-6">
              {ratings.map((rating) => (
                <button
                  key={rating.value}
                  onClick={() => setSelectedRating(rating.value)}
                  onMouseEnter={() => setHoveredRating(rating.value)}
                  onMouseLeave={() => setHoveredRating(null)}
                  className={`text-3xl sm:text-4xl p-2 rounded-full transition-all duration-200 hover:scale-110 ${
                    selectedRating === rating.value 
                      ? '' 
                      : ''
                  }`}
                  title={rating.label}
                  style={{
                    filter: (selectedRating === rating.value || hoveredRating === rating.value) 
                      ? 'none' 
                      : 'grayscale(100%)'
                  }}
                >
                  {rating.emoji}
                </button>
              ))}
            </div>
  
            {/* Comment textarea */}
            <div className="mb-6">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a comment"
                className="w-full h-24 sm:h-32 p-4 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent text-sm sm:text-base"
              />
            </div>
  
            {/* Submit button */}
            <button
              onClick={handleSubmit}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold py-3 sm:py-4 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] text-sm sm:text-base"
            >
              Submit Feedback
            </button>
          </div>
        </div>
      </div>
    );
  }