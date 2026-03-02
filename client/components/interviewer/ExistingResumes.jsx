import { getSesionId, getSesionIdViaJson } from '@/lib/interviewUtil';
import { getAllResumes } from '@/lib/resumeUtils';
import useInterviewStore from '@/store/interviewStore';
import { useEffect, useState } from 'react';

export default function ExistingResumes({ setIsResumeUploaded,user,setJobDescription,handleStart }) {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingText, setLoadingText] = useState('Fetching resumes');
  const { setSessionId } = useInterviewStore();

  const loadingMessages = [
    'Fetching resumes...',
    'Scanning database...',
    'Loading candidate profiles...',
    'Retrieving documents...',
    'Almost done...'
  ];

  useEffect(() => {
    let messageIndex = 0;
    const interval = setInterval(() => {
      setLoadingText(loadingMessages[messageIndex]);
      messageIndex = (messageIndex + 1) % loadingMessages.length;
    },3000);

    fetchResumes().finally(() => clearInterval(interval));
    return () => clearInterval(interval);
  }, []);

  const fetchResumes = async () => {
    setLoading(true);
    const resumes = await getAllResumes(user);
    setResumes(resumes.data);
    setLoading(false);
  };

  const handleUpload = async (data) => {
    if(data.job_description)  setJobDescription(data.job_description)
    const sessionId = await getSesionIdViaJson(data._id,data.resume_data,data?.job_description,user);
    if (sessionId) setSessionId(sessionId);
    if(data.job_description){
      await handleStart(data.job_description)
    }else{
      setIsResumeUploaded(true);
    }
  };

  return (
    <div className='border-[1px] border-gray-200 rounded-md bg-white h-[400px] w-[90vw] shadow-sm py-2 px-4 overflow-hidden'>
      <h2 className='text-2xl'>Resumes</h2>
      {loading ? (
        <div className='text-primary h-[90%] grid place-items-center'>
          {loadingText}
        </div>
      ) : (
        <div className='mt-10 grid grid-cols-4 gap-x-10 gap-y-[20%] h-[80%] w-[100%] bg-gray-50 p-4 rounded-md overflow-y-scroll place-items-center'>
          {resumes && resumes.length > 0 ? (
            resumes.map((resume, index) => (
              <div key={index} className='relative grid place-items-center h-[250px] hover:scale-105 hover:shadow-xl hover:shadow-[#8F56E8]/70 smooth cursor-pointer'>
                <h3 className='font-semibold'>{resume.name}</h3>
                <div className='resume flex-1 img-container h-[100%] w-[100%] border-[1px] border-gray-200' onClick={() => handleUpload(resume)}>
                  <img src={`${process.env.NEXT_PUBLIC_BUCKET_URL}/templates/Impact.png`} />
                </div>
              </div>
            ))
          ) : (
            <div className='col-span-4 flex flex-col gap-5 items-center justify-center h-full'>
              <h2 className='text-xl font-semibold'>OOPS..No resumes found!</h2>
              <a href="/dashboard"><button className='border-[1px] border-primary text-primary rounded-md px-8 py-2'>Create Resume</button></a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}