'use client'
import { useCallback, useState, useRef } from "react";

export default function UploadFile({ setSelectedFile, handleUpload,errorMessage,validateFile }) {
  const [dragging, setDragging] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const dropZoneRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleDrop = useCallback(async (event) => {
    event.preventDefault();
    setDragging(false);
    
    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile && validateFile(droppedFile)) {
      setSelectedFile(droppedFile);
      handleUpload(droppedFile);
    }
  }, [setSelectedFile, validateFile, handleUpload]);

  const handleFileSelect = async (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && validateFile(selectedFile)) {
      setSelectedFile(selectedFile);
      handleUpload(selectedFile);
    }
  };

  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div
      ref={dropZoneRef}
      className="relative flex flex-col items-center justify-center h-full w-full border-dashed border-2 border-gray-400 p-6 cursor-pointer"
      onDrop={handleDrop}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragEnter={() => setDragging(true)}
      onDragLeave={() => setDragging(false)}
      onClick={handleClick}
    >
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept=".pdf,.doc,.docx,.txt"
        onChange={handleFileSelect}
      />
      <div className="w-[50px] h-[50px]">
        <img
          src={`${process.env.NEXT_PUBLIC_BUCKET_URL}/images/upload.png`}
          alt="upload"
        />
      </div>
      <p className="text-[18px] font-semibold">Drop or Browse File</p>
      <p className="text-[#6b6b6b]">Format: pdf, docx, doc & Max File size: 25MB</p>

      {errorMessage && <p className="text-red-500 mt-2">{errorMessage}</p>}

      {dragging && (
        <div
          className="absolute w-[50px] h-[50px] pointer-events-none"
          style={{
            top: `${cursorPos.y}px`,
            left: `${cursorPos.x}px`,
            zIndex: 9999,
            transition: "top 0.1s ease, left 0.1s ease",
          }}
        >
          <img
            src={`${process.env.NEXT_PUBLIC_BUCKET_URL}/images/upload.png`}
            alt="file icon"
            className="w-full h-full"
          />
        </div>
      )}
    </div>
  );
}
