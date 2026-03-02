import { useState } from 'react';
import { Share } from 'lucide-react';
import ShareModal from './ShareModal';

const ShareButton = ({ interview_id, conclusion, candidateName }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      {/* Share Button */}
      <button 
        onClick={() => setIsModalOpen(true)}
        className="flex items-center bg-purple-600 hover:bg-purple-700 text-white rounded px-4 py-2 text-sm"
      >
        <Share className="w-4 h-4 mr-2" />
        Share Externally
      </button>

      {/* Share Modal */}
      {isModalOpen && (
        <ShareModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          interview_id={interview_id}
          conclusion={conclusion}
          candidateName={candidateName}
        />
      )}
    </>
  );
};

export default ShareButton;