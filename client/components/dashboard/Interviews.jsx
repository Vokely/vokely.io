import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ExternalLink, Eye, Trash2, X, Menu } from 'lucide-react';
import useAlertStore from '@/store/alertDialogstore';
import History from './History';
import useToastStore from '@/store/toastStore';
import { deleteInterviewFromDB } from '@/lib/interviewUtil';
import InterviewSummary from '@/components/interviewer/InterviewSummary';

const Interviews = ({ interviews = [], loading, fetchInterviews, user_details }) => {
  const name = `${user_details?.personalInfo?.firstName || ""} ${user_details?.personalInfo?.lastName || ""}`.trim();
  const addToast = useToastStore((state) => state.addToast);
  const router = useRouter();
  const openAlertDialog = useAlertStore((state) => state.openAlert);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedInterviewHistory, setSelectedInterviewHistory] = useState([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  const openHistoryModal = (history) => {
    setSelectedInterviewHistory(history);
    setIsHistoryModalOpen(true);
  };
  
  const closeHistoryModal = () => {
    setIsHistoryModalOpen(false);
    setSelectedInterviewHistory([]);
  };

  const openFeedback = (interview) => {
    setSelectedInterviewHistory(interview);
    setShowFeedback(true);
  };

  const closeFeedback = () => {
    setShowFeedback(false);
    setSelectedInterviewHistory([]);
  };

  const toggleDropdown = (interviewId) => {
    setActiveDropdown(activeDropdown === interviewId ? null : interviewId);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };
  
  const deleteInterview = async (interviewId) => {
    const confirmed = await openAlertDialog(
      'Delete Interview',
      'Are you sure you want to delete this interview? This action cannot be undone.'
    );
    
    if (confirmed) {
      try {
        const response = await deleteInterviewFromDB(interviewId);
        if (!response.ok) {
          addToast('Failed to delete interview', 'error', 'top-middle', 3000);
        } else {
          addToast('Interview deleted successfully', 'success', 'top-middle', 3000);
        }
        fetchInterviews();
      } catch (error) {
        addToast('Failed to delete interview', 'error', 'top-middle', 3000);
      }
    }
  };
  
  const renderMobileView = () => {
    return (
      <div className="space-y-3">
        {interviews.map((interview, i) => (
          <div
            key={i}
            className="rounded-xl border border-slate-200 bg-white/90 p-3 shadow-sm"
          >
            <div className="flex justify-between items-start mb-1.5">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  {interview.interview.title || "Untitled Interview"}
                </h3>
                <p className="mt-1 text-[11px] text-slate-500">
                  Created {formatDate(interview.interview.created_at)}
                </p>
              </div>

              <div className="relative">
                <button 
                  onClick={() => toggleDropdown(interview.interview._id)}
                  className="p-1 rounded-full hover:bg-slate-100"
                >
                  <Menu size={18} />
                </button>
                
                {activeDropdown === interview.interview._id && (
                  <div className="absolute right-0 mt-2 w-40 rounded-md border border-slate-200 bg-white shadow-lg z-10">
                    <div className="py-1 text-sm">
                      <button 
                        onClick={() => {
                          openHistoryModal(interview.interview.history);
                          toggleDropdown(null);
                        }}
                        className="flex items-center px-3 py-2 text-slate-700 hover:bg-slate-50 w-full text-left"
                      >
                        <Eye size={16} className="mr-2" /> View chat
                      </button>
                      <button 
                        onClick={() => {
                          openFeedback(interview);
                          toggleDropdown(null);
                        }}
                        className="flex items-center px-3 py-2 text-slate-700 hover:bg-slate-50 w-full text-left"
                      >
                        {interview.interview.feedback?.summary ? (
                          <ExternalLink size={16} className="mr-2" />
                        ) : (
                          <span className="mr-2 text-[11px] text-slate-400">N/A</span>
                        )}
                        Feedback
                      </button>
                      <button 
                        onClick={() => {
                          deleteInterview(interview.interview._id);
                          toggleDropdown(null);
                        }}
                        className="flex items-center px-3 py-2 text-red-600 hover:bg-red-50 w-full text-left"
                      >
                        <Trash2 size={16} className="mr-2" /> Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-2 flex items-center text-xs text-slate-500">
              <span className="mr-2">Performance</span>
              <div className="flex items-center">
                <div
                  className={`h-2 rounded-full w-16 ${getPerformanceColorClass(
                    interview.interview.performance_rating
                  )}`}
                />
                <span className="ml-2 text-[11px] text-slate-600">
                  {interview.interview.performance_rating
                    ? `${interview.interview.performance_rating}`
                    : "N/A"}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="mt-6 rounded-2xl border border-slate-200 bg-white/90 p-4 sm:p-5 shadow-sm backdrop-blur">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-2">
        <div>
          <h2 className="text-lg md:text-xl font-semibold text-slate-900">
            Your mock interviews
          </h2>
          <p className="text-xs text-slate-500">
            Review past interviews, feedback and performance trends.
          </p>
        </div>
        <button
          onClick={() => router.push('/ai-interviewer')}
          className="mt-1 inline-flex items-center justify-center rounded-full bg-primary px-4 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-primary/90 sm:mt-0"
        >
          Start new mock interview
        </button>
      </div>
      
      {(isHistoryModalOpen || showFeedback) && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => {
            if (isHistoryModalOpen) closeHistoryModal();
            if (showFeedback) closeFeedback();
          }}
        />
      )}
      
      {isHistoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
          <div className="bg-white rounded-lg w-full h-full md:h-auto md:max-h-[80vh] md:max-w-4xl overflow-hidden shadow-xl">
            <div className="relative h-full overflow-auto">
              <button 
                className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-md z-10"
                onClick={closeHistoryModal}
              >
                <X size={20} className="text-slate-600" />
              </button>
              <History
                isOpen={isHistoryModalOpen}
                onClose={closeHistoryModal}
                history={selectedInterviewHistory}
              />
            </div>
          </div>
        </div>
      )}
      
      {showFeedback && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto hide-scrollbar">
          <div className="bg-white mt-[15vh] mx-1 w-full h-full md:h-auto md:max-h-[90vh] md:w-[90%] lg:w-[80%] rounded-lg shadow-xl overflow-y-auto md:mt-8 md:mx-0">
            <div className="relative p-1">
              <button 
                className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-md z-10"
                onClick={closeFeedback}
              >
                <X size={20} className="text-slate-600" />
              </button>
              <InterviewSummary 
                conclusion={selectedInterviewHistory.interview?.feedback} 
                interview_id={selectedInterviewHistory.interview?._id} 
                candidateName={name} 
                jobDescription={selectedInterviewHistory.resume?.job_description} 
              />
            </div>
          </div>
        </div>
      )}
      
        {loading ? (
          <div className="flex justify-center items-center py-6">
            <p className="text-primary text-sm">Loading interviews...</p>
          </div>
        ) : interviews.length === 0 ? (
          <div className="text-center py-8 rounded-xl border border-dashed border-slate-300 bg-slate-50/60">
            <p className="text-sm text-slate-500">
              You don't have any mock interviews yet.
            </p>
            <button 
              className="mt-3 inline-flex items-center rounded-full bg-primary px-5 py-2 text-xs font-medium text-white hover:bg-primary/90"
              onClick={() => router.push("/ai-interviewer")}
            >
              Start your first mock interview
            </button>
          </div>
        ) : (
          <>
            <div className="md:hidden mt-3">
              {renderMobileView()}
            </div>
            
            <div className="hidden md:block md:max-h-[40vh] overflow-y-auto mt-3 rounded-xl border border-slate-100">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      Title
                    </th>
                    <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      Created
                    </th>
                    <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      Performance
                    </th>
                    <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      Chat
                    </th>
                    <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      Feedback
                    </th>
                    <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      Delete
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {interviews.map((interview, i) => (
                    <tr key={i} className="border-t border-slate-100 hover:bg-slate-50/60">
                      <td className="px-5 py-3">
                        <div className="text-sm font-medium text-slate-900">
                          {interview.interview.title || "Untitled Interview"}
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="text-xs text-slate-500">
                          {formatDate(interview.interview.created_at)}
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center">
                          <div 
                            className={`h-2 rounded-full w-20 ${getPerformanceColorClass(
                              interview.interview.performance_rating
                            )}`}
                          />
                          <span className="ml-2 text-xs text-slate-500">
                            {interview.interview.performance_rating
                              ? `${interview.interview.performance_rating}`
                              : "N/A"}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-slate-500">
                        <button 
                          onClick={() => openHistoryModal(interview.interview.history)}
                          className="text-primary hover:text-primary/80"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                      <td className="px-5 py-3 text-slate-500">
                        {typeof interview.interview.feedback === 'object' &&
                        interview.interview.feedback?.strengths?.length > 0 ? (
                          <button 
                            className="text-slate-600 hover:text-slate-900"
                            onClick={() => openFeedback(interview)}
                          >
                            <ExternalLink size={16} />
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400">N/A</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-slate-500">
                        <button 
                          onClick={() => deleteInterview(interview.interview._id)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
    </div>
  );
};

function getPerformanceColorClass(rating) {
  if (!rating) return "bg-slate-200";
  const normalizedRating = rating / 5;
  if (normalizedRating >= 8) return "bg-emerald-500";
  if (normalizedRating >= 6) return "bg-indigo-500";
  if (normalizedRating >= 4) return "bg-amber-400";
  return "bg-rose-500";
}

export default Interviews;
