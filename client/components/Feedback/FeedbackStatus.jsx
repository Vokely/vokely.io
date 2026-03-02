'use client';
import { useState } from 'react';
import { CheckCircle, XCircle, Clock, AlertTriangle, Check } from 'lucide-react';
import DropDown from '../icons/DropDown';

const FeedbackStatus = ({ feedback }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusIcon = () => {
    switch (feedback.status) {
      case 'approved':
        return <CheckCircle className="text-green-500" size={18} />;
      case 'rejected':
        return <XCircle className="text-red-500" size={18} />;
      case 'pending':
      default:
        return <Clock className="text-yellow-500" size={18} />;
    }
  };


  const formatDate = (dateString) => {
    if (!dateString) return null;
    try {
      // Example: "19 Feb. 2025"
      return `${new Date(dateString).toLocaleDateString(undefined, {
        day: 'numeric', // 19
        month: 'short', // Feb.
        year: 'numeric', // 2025
      })}`;
    } catch (error) {
      console.error("Error formatting date:", error);
      return 'Invalid Date';
    }
  };

  const getTypeIcon = () => {
    switch (feedback.type) {
      case 'bug report':
        return <AlertTriangle className="text-red-500" size={16} />;
      case 'feature request':
        return <span className="text-blue-500 text-lg">✨</span>;
      case 'general feedback':
      default:
        return <span className="text-purple-500 text-lg">💬</span>;
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <div 
        className="relative flex justify-between items-end p-4 bg-gray-50 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className='flex flex-col items-start gap-2 md:flex-row md:gap-5 justify-between md:items-center'>
          <div className="flex items-center space-x-2">
            {getStatusIcon()}
            <div className="font-medium truncate max-w-[150px] sm:max-w-[250px]">
              {feedback.type}
            </div>
          </div>
          <div>
            {feedback.amount ? (
              <span className="text-sm px-2 py-1 bg-green-100 text-green-700 rounded-full flex flex-wrap gap-2 items-center justify-center">
                Credited {feedback.amount} 
                <Check size={16} color='green'/>
              </span>
            ) : (
              <span className="text-sm px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                Credits Pending
              </span>
            )}
          </div>
          <div className="text-sm text-gray-500">
            {formatDate(feedback.created_at)}
          </div>
        </div>
        
        <div className='absolute top-[25%] right-5'><DropDown size='32' /></div>
      </div>
      
      {isExpanded && (
        <div className="p-4 border-t">
          <div className="mb-2 grid grid-cols-[80%_20%]">

            <div className="flex flex-col justify-between items-start mb-2">
              <div className="flex items-start space-x-2">
                {getTypeIcon()}
                <p className="text-gray-800 whitespace-pre-wrap">{feedback.feedback}</p>
              </div>
              <div className="mt-4 text-sm text-gray-500">
              Status: <span className="font-medium capitalize">{feedback.status}</span>
            </div>  
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackStatus;