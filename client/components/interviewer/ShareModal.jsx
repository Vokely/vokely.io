import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { fetchLinksByRelationId,deleteShareableLink } from '@/lib/externalLinksUtil';
import ShareLinkForm from './ShareLinkForm';
import ShareLinkList from './ShareLinkList';

const ShareModal = ({ isOpen, onClose, interview_id, conclusion, candidateName }) => {
  const [previousLinks, setPreviousLinks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedLink, setCopiedLink] = useState(null);

  // Fetch previously created links when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchPreviousLinks();
    }
  }, [isOpen]);

  const fetchPreviousLinks = async () => {
    try {
      setIsLoading(true);
      // Get user from store or local storage
      const response = await fetchLinksByRelationId(interview_id);
      const data = await response.json();
      setPreviousLinks(data.links || []);
    } catch (error) {
      console.error('Error fetching links:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLinkCreated = (newLink) => {
    setPreviousLinks([newLink, ...previousLinks]);
    // Refetch links to ensure we have the latest data
    fetchPreviousLinks();
  };

  const copyToClipboard = (link, id) => {
    navigator.clipboard.writeText(link);
    setCopiedLink(id);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const handleDeleteLink = async (linkId) => {
    try {
      await deleteShareableLink(linkId);
      setPreviousLinks(prev => prev.filter(link => link.id !== linkId));
    } catch (error) {
      console.error("Failed to delete link:", error);
    }
  };
  

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Share Interview Report</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Create New Link Form */}
        <div className="mb-6 border-b pb-6">
          <ShareLinkForm 
            interview_id={interview_id}
            conclusion={conclusion}
            onLinkCreated={handleLinkCreated}
            candidateName={candidateName}
          />
        </div>
        
        {/* Previous Links */}
        <div>
          <h3 className="font-medium mb-3">Previous Shareable Links</h3>
          
          <ShareLinkList 
            links={previousLinks}
            isLoading={isLoading}
            copiedLink={copiedLink}
            onCopyLink={copyToClipboard}
            onDeleteLink={handleDeleteLink}
          />
        </div>
      </div>
    </div>
  );
};

export default ShareModal;