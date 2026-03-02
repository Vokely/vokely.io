// components/History.jsx (or HistoryModal.js if that's what you're using)
import React from "react";

const History = ({ isOpen, onClose, history = [] }) => {
  if (!isOpen) return null;

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "";
    const d = new Date(timestamp);
    return d.toLocaleString(undefined, {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getMessageText = (item) => {
    if (typeof item.content === "object" && item.content?.conclusion) {
      return item.content.conclusion;
    }
    return item.content;
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            Interview history
          </h2>
          <p className="text-[11px] text-slate-500">
            Review the conversation between you and the AI interviewer.
          </p>
        </div>

        <button
          onClick={onClose}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 hover:text-slate-900 hover:border-slate-300"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.8}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-slate-50/70 px-3 py-4">
        {history && history.length > 0 ? (
          <div className="space-y-3">
            {history.map((item, index) => {
              const isInterviewer = item.role === "interviewer";
              const label = isInterviewer ? "Interviewer" : "You";
              const message = getMessageText(item);

              return (
                <div
                  key={index}
                  className={`flex ${
                    isInterviewer ? "justify-start" : "justify-end"
                  }`}
                >
                  <div
                    className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 shadow-sm ${
                      isInterviewer
                        ? "bg-white border border-slate-200"
                        : "bg-primary text-white"
                    }`}
                  >
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <span
                        className={`text-[10px] font-semibold tracking-wide uppercase ${
                          isInterviewer
                            ? "text-slate-500"
                            : "text-white/80"
                        }`}
                      >
                        {label}
                      </span>
                      {item.stage && (
                        <span
                          className={`rounded-full px-2 py-[2px] text-[9px] ${
                            isInterviewer
                              ? "bg-slate-100 text-slate-600"
                              : "bg-white/15 text-white/90"
                          }`}
                        >
                          {item.stage}
                        </span>
                      )}
                    </div>

                    <p
                      className={`text-sm whitespace-pre-wrap ${
                        isInterviewer ? "text-slate-800" : "text-white"
                      }`}
                    >
                      {message}
                    </p>

                    <div
                      className={`mt-1 text-[10px] ${
                        isInterviewer
                          ? "text-slate-400"
                          : "text-white/70"
                      } text-right`}
                    >
                      {formatTimestamp(item.timestamp)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="rounded-xl border border-dashed border-slate-300 bg-white/80 px-4 py-6 text-center">
              <p className="text-sm text-slate-500">
                No history available for this interview yet.
              </p>
              <p className="mt-1 text-[11px] text-slate-400">
                Run a mock session to start generating interview transcripts.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
