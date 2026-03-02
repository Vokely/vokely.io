'use client'
import useAPIWrapper from '@/hooks/useAPIWrapper';
import { useEffect, useState } from 'react'
import { getATSReportDetails } from '@/lib/atsChecker';
import Loader from '@/components/reusables/Loader';
import useIsMobile from '@/hooks/IsMobile';
import { useATSStore } from '@/store/atsStore';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronsUpDown } from 'lucide-react';
import NewSideBar from '@/components/layouts/NewSideBar';
import { LeftPanel } from '@/components/ats-checker/LeftPanel';
import { RightPanel } from '@/components/ats-checker/RightPanel';

export default function page({params}) {
  const result_id = params.result_id;
  const isMobile = useIsMobile();
  const [isSideBarOpen,setIsSideBarOpen] = useState(true)
  const {callApi,loading} = useAPIWrapper();
  const {setEssentials,setGrammarErrors,setScore,setResumeId,setReportId,setJDAnalysis} = useATSStore()

  const fetchReportDetails = async()=>{
      const responseJson = await callApi(getATSReportDetails,result_id);
      if(responseJson){
        setEssentials(responseJson.resume_essentials);
        setGrammarErrors(responseJson.basic_analysis);
        setScore(responseJson.scoring)
        setResumeId(responseJson.resume_id)
        setReportId(responseJson.id)
        setJDAnalysis(responseJson.jd_analysis)
    }
  }
  useEffect(()=>{
    fetchReportDetails();
  },[]);

  return (
    <div className='relative h-screen w-full overflow-hidden'>

    <div className='absolute left-0 top-0'><NewSideBar /></div>

    {loading ? <Loader/> : (
      <div className='lap:ml-[8vw] lap:w-[90vw]'>
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
    )}
    </div>
  )
}
