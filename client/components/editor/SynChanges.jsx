import { CloudDownload, RefreshCcw } from 'lucide-react'

export default function SynChanges({ handleSaveChanges, isRotating, lastUpdatedTime = "Not Updated Yet" }) {
  return (
    <div className="flex flex-col items-center text-center" id='resume-tour-5'>
      <button
        onClick={handleSaveChanges}
        className="flex items-center gap-2 bg-lightviolet text-primary px-2 py-1 sm:px-3 md:px-4 rounded-sm md:rounded-full text-xs sm:text-sm md:text-base hover:bg-lightviolet/90 transition"
      >
        <span className="hidden sm:block">Sync Changes</span>
        <RefreshCcw size={16} className={isRotating ? "rotate" : ""} />
      </button>

      {lastUpdatedTime && (
        <p className="text-gray-600 text-[10px] sm:text-xs mt-1 flex items-center gap-1">
          <CloudDownload size={12} />
          {lastUpdatedTime}
        </p>
      )}
    </div>
  );
}
