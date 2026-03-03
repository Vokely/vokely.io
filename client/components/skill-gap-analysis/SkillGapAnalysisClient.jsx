'use client'
import { getAllResumes, updateResume } from '@/lib/resumeUtils';
import { useEffect, useState } from 'react'
import Loader from '../reusables/Loader';
import Navbar from '../layouts/Navbar';
import ResumesDropdownItems from '../reusables/ResumeDropDownItems';
import { createSkillGap } from '@/lib/skillGap';
import useToastStore from '@/store/toastStore';
import { useRouter } from 'next/navigation';
import useSkillGapStore from '@/store/skillGapStore';
import NewSideBar from '../layouts/NewSideBar';

export default function SkillGapAnalysisClient() {
  const router = useRouter()
  const [resumes,setResumes] = useState([])
  const [jobDescription,setJobDescription] = useState('');
  const [selectedFile,setSelectedFile] = useState(null)
  const [updateJd,setUpdateJd] = useState(false)
  const [loading,setLoading] = useState(false)
  const addToast = useToastStore((state) => state.addToast);
  const {updateFromResponse,setSkillGapReport} = useSkillGapStore()

  useEffect(() => {
    if(resumes.length===0){
      fetchResumes()
    } else {
      setLoading(false); 
    }
  }, []); 

  const fetchResumes = async () => {
    setLoading(true);
    try {
      const resumeData = await getAllResumes();
      setResumes(resumeData.data || []);
    } catch (error) {
      console.error("Failed to fetch resumes:", error);
      setResumes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelection = (resume)=>{
    setSelectedFile(resume);
    setJobDescription(resume.job_description)
  }

  const checkDetails = ()=>{
    if(!selectedFile){
      addToast('Please select a resume', 'warning', 'top-middle', 3000)
      return false;
    }
    if(!jobDescription){
      addToast('Please update the Job Description', 'warning', 'top-middle', 3000)
      setUpdateJd(true)
      return ;
    }
    return true
  }

  const handleAnalyze = async()=>{
    try {
      if(!checkDetails()) return;
      setLoading(true)
      if(updateJd){
        const update = await updateResume(selectedFile._id,jobDescription)
      }
      const response = await createSkillGap(selectedFile._id);
      const json = await response.json()
      setSkillGapReport(json.data)
      updateFromResponse(json)
      router.push(`/skill-gap-analysis/results/${json.data.id}`)
    } catch (error) {
      addToast('Error occured. Please try again', 'error', 'top-middle', 3000)
    }finally{
      setLoading(false)
    }
  }
  
  return (
    <div className='h-screen relative'>
      {loading ? (<Loader/>) :
        (
          <>
            <div className='absolute top-0 left-0 z-[999]'><NewSideBar/></div>
            <div className='w-[90vw] h-screen grid place-items-center md:w-full flex flex-col items-center mt-3 xxs:mt-4 sm:mt-5 mx-5 md:mx-0'>
              <h1 className='text-primary text-center text-xl xxs:text-2xl md:text-3xl mb-1 xxs:mb-2 font-semibold'>Let's get you prepared for your Dream Job</h1>
              <p className='text-center text-sm xxs:text-base tracking-wide max-w-3xl'>We'll personalize the report based on your resume and the role you're aiming for. It only takes a minute!</p>
              
                  <div className='border-[1px] border-[#bababa] rounded-xl w-full md:max-w-[50vw] p-4 space-y-4 h-fit mt-5'>
                  <h2 className='text-xl font-semibold'>1.&nbsp;Select Your Resume</h2>
                  <ResumesDropdownItems
                    resumes={resumes}
                    selectedFile={selectedFile}
                    handleSelection={handleSelection}
                    loading={loading}
                  />
                </div>

                <div className='border-[1px] border-[#bababa] rounded-xl w-full md:max-w-[50vw] p-4 space-y-4 h-fit mt-5'>
                  <h2 className='text-xl font-semibold'>2.&nbsp;Update Job Description</h2>
                  <textarea name="job_description" id="jd" className='outline-none w-full border-[1px] border-[#bababa] px-4 py-2 rounded-xl' rows={8}
                  placeholder='Paste your Job Description or preferred Job Title' onChange={(e)=>setJobDescription(e.target.value)} value={jobDescription}
                  />                
                </div>
              <button className='border-[1px] mt-5 bg-primary text-white rounded-full px-6 py-1.5 transition-colors duration-200' onClick={handleAnalyze}>
                {loading ? 'Analyzing':'Analyze'}
              </button>
            </div>
          </>
        )
      }
    </div>
  )
}
