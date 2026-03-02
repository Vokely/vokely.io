'use client'
import { useState } from 'react';
import { LeftPanel } from './LeftPanel';
import { RightPanel } from './RightPanel';
import NewUpload from '../FileUpload/NewUpload'
import { checkResumeATS } from '@/lib/atsChecker'
import useToastStore from '@/store/toastStore';
import { useATSStore } from '@/store/atsStore';
import { useAuthStore } from '@/store/authStore';
import SignInPopup from '../reusables/SignInPopUp';
import NewSideBar from '../layouts/NewSideBar';
import PremiumOverlay from '../reusables/PremiumOverlay';
import useIsMobile from '@/hooks/IsMobile';
import { ChevronsUpDown } from 'lucide-react';
import { AnimatePresence,motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

const ATSLayout = () => {
  const router = useRouter();
  const {user} = useAuthStore();
  const isMobile = useIsMobile();
  const [selectedFile,setSelectedFile] = useState(null)
  const addToast = useToastStore((state) => state.addToast);
  const [isResumeUploaded,setIsResumeUploaded] = useState(false);
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [iSideBarOpen,setIsSideBarOpen] = useState(true);
  const {setEssentials,setGrammarErrors,setScore,setResumeId,setReportId} = useATSStore()

  const handleSignInSuccess = () => {
    setIsSignInOpen(false);
    if (!isResumeUploaded && selectedFile) {
      setIsResumeUploaded(true);
      handleATSUpload(); 
    }
  };

  
  const handleATSUpload = async () => {
    if (!user) {
      setIsResumeUploaded(false)
      setIsSignInOpen(true);
      return;
    }
  
    try {
      const response = await checkResumeATS(selectedFile);
      const responseJson = await response.json();
      if (!response.ok) {
        throw new Error(responseJson.detail);
      } else {
        setIsResumeUploaded(true);
        setSelectedFile(null);
        router.push("/ats-checker/results/"+responseJson.id)
      }
    } catch (error) {
      addToast(error.message || 'An Error occurred. Please try again', 'error', 'top-middle', 3000);
    }
  };  

  return (
    <div className='relative h-screen w-full'>
    {/* Sidebar OpenPanel */}
    <div className='absolute left-0 top-0'><NewSideBar /></div>

    {isSignInOpen && <SignInPopup onClose={()=>setIsSignInOpen(false)} onSuccess={handleSignInSuccess} title='You are just a step away!'/>}
    {isResumeUploaded ? (
      <div className='w-full'>
        <div className="bg-gray-50">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
            {/* Left Panel - ATS Score Card */}
            <div className="lg:col-span-4 xl:col-span-3">
              <LeftPanel />
            </div>

            {/* Right Panel - Analysis Sections */}
            <div className="lg:col-span-8 xl:col-span-9">
              <RightPanel />
            </div>
          </div>
        </div>
      </div>
    ):(
      <div className='grid place-items-center h-screen pt-10 w-full mx-2'>
          <div className='text-center'>
            <h1 className='text-primary text-3xl font-medium'>Get your Resume ready for any JD</h1>
            <p className='mb-10 mt-5 text-[#333747]'>Let's see how well it performs against ATS and get instant feedback.</p>
          <PremiumOverlay featureName="ats_checker" className="h-full w-full">
            <div className='mx-auto h-[50vh] w-[80%] md:h-[40vh] md:w-[30vw]'>
                <NewUpload
                  selectedFile={selectedFile}
                  setSelectedFile={setSelectedFile}
                  isExistingResume={isResumeUploaded}
                  setIsResumeUploaded={setIsResumeUploaded}
                  handleATSUpload={handleATSUpload}
                />
            </div>              
          </PremiumOverlay>
          </div>
      </div>
    )}
    </div>
  );
};

export default ATSLayout;