import { sendFileToAPI } from "@/lib/fetchUtil";
import useProfileStore from "@/store/profileStore";
import { useRouter } from "next/navigation";
import useUserDetailsStore from "@/store/userDetails";
import { usePathname } from "next/navigation";
import useInterviewStore from "@/store/interviewStore";
import { getSesionId } from "@/lib/interviewUtil";
import useToastStore from '@/store/toastStore';
import { useState, useCallback, useRef, useEffect } from "react";
import { FileItem } from "./FileItem"; 
import { completeOnboarding } from "@/lib/onBoardUtil";
import useAPIWrapper from "@/hooks/useAPIWrapper";

function NewUpload({ selectedFile,setSelectedFile,setIsResumeUploaded,isResumeUploaded,isExistingResume,setIsExistingResume,setJobDescription,handleATSUpload}) {
  const { setExtractedResumeData } = useProfileStore();
  const { setUserDetails,setHasUntrackedChanges } = useUserDetailsStore();
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();
  const isOnBoard = pathname === "/onboard";
  const isProfile = pathname === "/profile";
  const isSkillGap = pathname === "/skill-gap-analysis"
  const isATSChecker = pathname === '/ats-checker'
  const isInterviewUpload = (!isOnBoard && !isProfile && !isATSChecker);
  const { setSessionId } = useInterviewStore();
  const addToast = useToastStore((state) => state.addToast);
  const [dragging, setDragging] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const dropZoneRef = useRef(null);
  const fileInputRef = useRef(null);
  const cancelled = useRef(false); 
  const { callApi } = useAPIWrapper();


  const loadingMessages = [
    "Only 80% of resumes get parsed accurately,",
    "we are trying our best to parse your resume",
    "Extracting key skills and experience from your resume...",
    "Matching resume with relevant job data...",
    "Formatting the data to our system...",
    "20% of resumes may not parse perfectly — but we're improving every day!",
  ];
  
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  useEffect(() => {
    let interval;
    if (isLoading) {
      setCurrentMessageIndex(0); // Reset message on new loading
      interval = setInterval(() => {
        setCurrentMessageIndex((prevIndex) =>
          (prevIndex + 1) % loadingMessages.length
        );
      }, 2000);
    } else {
      clearInterval(interval);
    }
  
    return () => clearInterval(interval);
  }, [isLoading]);
    

  const validateFile = useCallback((file) => {
    const validTypes = ["application/pdf","application/msword","application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    const maxSize = 25 * 1024 * 1024;

    if (!validTypes.includes(file.type)) {
      addToast('Invalid file format. Please upload a PDF','error','top-middle',3000)
      return false;
    }

    if (file.size > maxSize) {
      addToast('File size exceeds 25MB. Please upload a smaller file.','error','top-middle',3000)
      return false;
    }

    setErrorMessage("");
    return true;
  }, []);

  const setFile = (file) => {
    if (validateFile(file)) {
      handleRemoveSelectedFile();
      setSelectedFile(file);
    }
  };
  
  const handleDrop = useCallback(
    (event) => {
      event.preventDefault();
      setDragging(false);

      const droppedFile = event.dataTransfer.files[0];
      if (droppedFile && validateFile(droppedFile)) {
        setFile(droppedFile);
      }
    },
    [setFile, validateFile]
  );

  const handleDragOver = useCallback((event) => {
    event.preventDefault();
    setDragging(true);
    setCursorPos({ x: event.clientX, y: event.clientY });
  }, []);

  const handleDragEnter = useCallback(() => {
    setDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragging(false);
  }, []);

  const handleBrowseClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFile(file);
    }
  };

  const handleRemoveSelectedFile = () => {
    setSelectedFile(null);
    if(isInterviewUpload){
      setIsExistingResume(false)
      setIsResumeUploaded(false)
    }
  };

  const handleUpload = async (inputFile) => {
    if(!selectedFile || selectedFile == null){
      addToast('Please upload a file', 'warning', 'top-middle', 3000)
      return
    }
    setIsLoading(true)
    if(inputFile==null) inputFile=selectedFile
    if (inputFile && (isOnBoard||isProfile)) {
      const status = await callApi(sendFileToAPI,inputFile);
      if(status){
        addToast('Resume Uploaded successfully','success','top-middle',3000);
        setUserDetails(status.extracted_details)
        setExtractedResumeData(status.extracted_details);
      }
      if(isProfile){
        setSelectedFile(null)
        setIsResumeUploaded(false)
        setHasUntrackedChanges(false)
      }
      if (status && !cancelled.current && !isProfile) {
        const response = await completeOnboarding()
        router.push("/dashboard");
      }
    }else if(isATSChecker){
      await handleATSUpload()
    }else{
      const sessionId = await callApi(getSesionId,inputFile);
      if (sessionId){
        setSessionId(sessionId);
        addToast('Resume Uploaded successfully','success','top-middle',3000);
        setIsResumeUploaded(true);
        setJobDescription('')  
      }
    }
    setIsLoading(false)
  };

  return (
    <div
      ref={dropZoneRef}
      className={`relative flex flex-col items-center justify-center h-full w-full rounded-md border-2 border-dashed border-primary cursor-pointer ${selectedFile ? 'p-2':''}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      // onClick={handleBrowseClick}
    >
      <input
        ref={fileInputRef}
        id="file-upload"
        type="file"
        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      {isLoading ? (
        <div className="border-[1px] border-gray-200 rounded-md h-full w-full absolute top-0 left-0 overflow-hidden flex flex-col items-center justify-center bg-white bg-opacity-80">
          <h3 className="text-primary text-xl text-center mt-6">{loadingMessages[currentMessageIndex]}</h3>
          <video
            src={`${process.env.NEXT_PUBLIC_BUCKET_URL}/videos/file-loader.mp4`}
            autoPlay
            muted
            loop
            playsInline
            type="video/mp4"
            height={100}
          ></video>
        </div>
      ) : (isInterviewUpload ? (selectedFile && !isExistingResume):selectedFile) ? (
        <div className="w-full h-full flex flex-col items-center justify-between">
          <FileItem filename={selectedFile.name} onRemove={handleRemoveSelectedFile} />
          {isResumeUploaded ? (
            <p className="text-green-500 font-semibold mt-4">Resume Uploaded successfully</p>
          ) : (
            <button
              className="border-primary border-2 text-primary font-bold py-2 px-4 rounded-xl mt-4"
              onClick={() => handleUpload(selectedFile)}
            >
              Confirm Upload
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <div className="text-white rounded-md">
            <img
              src={`${process.env.NEXT_PUBLIC_BUCKET_URL}/images/upload.png`}
              alt="upload-file"
            />
          </div>

          <h2 className="text-lg font-semibold mb-2 text-center">
            {dragging
              ? 'Drop the file here...'
              : 'Drag your file here to start uploading'}
          </h2>

          <div className="flex items-center mb-4">
            <hr className="w-20 border-t border-gray-400" />
            <span className="text-gray-500 mx-2">OR</span>
            <hr className="w-20 border-t border-gray-400" />
          </div>

          <button
            className="border-primary border-2 text-primary font-bold py-2 px-4 rounded-xl"
            onClick={handleBrowseClick}
          >
            Browse files
          </button>
        </div>
      )}

      <p className="text-sm text-[#6b6b6b] mt-2 text-center">
        Format: pdf, doc, docx & Max file size: 25 MB
      </p>
{/* 
      {dragging && (
        <div
          className="absolute pointer-events-none"
          style={{
            top: `${cursorPos.y}px`,
            left: `${cursorPos.x}px`,
            zIndex: 9999,
            transition: "top 0.1s ease, left 0.1s ease",
          }}
        >
          <div className="text-white rounded-md">
            <img
              src={`${process.env.NEXT_PUBLIC_BUCKET_URL}/images/upload.png`}
              alt="file icon"
              className="w-16 h-16 opacity-100"
            />
          </div>
        </div>
      )} */}
    </div>
  );
}

export default NewUpload;