import { ChevronDown, CircleCheck } from 'lucide-react'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import NewUpload from '../FileUpload/NewUpload';
import ResumesDropDown from './ResumesDropDown';
import useJobStore from '@/store/prepareInterview';

export default function SelectResumes({isResumeUploaded,setIsResumeUploaded,setJobDescription,isResumesOpen,setIsResumesOpen}) {
  const {selectedFile, setSelectedFile,isExistingResume,setIsExistingResume,activeOption, setActiveOption} = useJobStore()
  const [resumes, setResumes] = useState([]);
  
  useEffect(()=>{
    if(isResumeUploaded){
      setIsResumesOpen(false);
    }
  },[isResumeUploaded])

  return (
    <div className='w-full md:w-[50vw] border-[1px] border-[#bababa] hover:border-primary smooth rounded-xl py-3 px-4 xxs:py-4 xxs:px-5 sm:py-5 sm:px-6 md:py-6 md:px-8'>
    <div className='flex items-center justify-between cursor-pointer' onClick={()=>setIsResumesOpen()}>
      <div className='flex items-center gap-1 xxs:gap-2'>
        <h3 className='text-start font-semibold text-base xxs:text-lg sm:text-xl'>Choose Your Resume</h3>
        {isResumeUploaded && (<CircleCheck color='green' size={18} className="xxs:w-5 sm:w-6" />)}
      </div>
      <motion.div
        animate={{ rotate: isResumesOpen ? 180 : 0 }} 
        transition={{ duration: 0.3, ease: "easeInOut" }} 
        style={{ originX: 0.5, originY: 0.5 }} 
      >
        <ChevronDown
          size={30} 
          className="w-7 xxs:w-8 sm:w-10"
          color='#999999'
          strokeWidth={2}
        />
      </motion.div>
    </div>
  
    <AnimatePresence>
      {isResumesOpen && (
        <motion.div
          key="accordion"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
          className="overflow-hidden"
        >
          <span className='text-xs xxs:text-sm text-start text-[#6b6b6b] block mt-1 xxs:mt-2'>
            We'll securely scan it to tailor your interview
          </span>
  
          {/* Open Content */}
          <div className="">
            <div className='flex flex-col xxs:flex-row justify-between items-start xxs:items-center gap-2 xxs:gap-4 sm:gap-6 mt-3 xxs:mt-4 w-full md:w-[80%] lap:w-[60%] lg:w-[80%]'>
              <label className='flex items-center gap-1 xxs:gap-2 font-medium text-sm xxs:text-base'>
                <input
                  type="radio"
                  name="resumeOption"
                  value="import"
                  checked={activeOption === 'import'}
                  onChange={() => setActiveOption('import')}
                  className='accent-[#8F56E8]'
                />
                Choose from Existing
              </label>
              <label className='flex items-center gap-1 xxs:gap-2 font-medium text-sm xxs:text-base'>
                <input
                  type="radio"
                  name="resumeOption"
                  value="upload"
                  checked={activeOption === 'upload'}
                  onChange={() => setActiveOption('upload')}
                  className='accent-[#8F56E8]'
                />
                Import Resume
              </label>
            </div>
  
            {activeOption === 'upload' ? (
              <div className='mt-3 xxs:mt-4 sm:mt-5 h-[25vh] xxs:h-[28vh] sm:h-[30vh]'>
                <NewUpload 
                  selectedFile={selectedFile} 
                  setSelectedFile={setSelectedFile} 
                  isResumeUploaded={isResumeUploaded} 
                  setIsResumeUploaded={setIsResumeUploaded}
                  isExistingResume={isExistingResume} 
                  setIsExistingResume={setIsExistingResume}
                  setJobDescription={setJobDescription}
                />
              </div>
            ):(
              <div className='mt-3 xxs:mt-4 sm:mt-5'>
                <ResumesDropDown 
                  setIsResumeUploaded={setIsResumeUploaded} 
                  setJobDescription={setJobDescription}
                  selectedFile={selectedFile} 
                  setSelectedFile={setSelectedFile}
                  closeAccordian={()=>setIsResumesOpen()}
                  resumes={resumes} 
                  setResumes={setResumes}
                  isExistingResume={isExistingResume} 
                  setIsExistingResume={setIsExistingResume}
                />
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
  );
}
