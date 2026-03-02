import NewUpload from '@/components/FileUpload/NewUpload';
import { ConnectLinkedin } from '@/components/Linkedin/Connect';
import { completeOnboarding } from '@/lib/onBoardUtil';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const ResumeUploadStep = ({ onNext}) => {
  const router= useRouter();
  const [selectedFile, setSelectedFile] = useState(null);
  const [activeOption, setActiveOption] = useState('Resume');

  const handleContinue= async()=>{
    const response = await completeOnboarding()
    router.push('/profile');
  } 
  return (
    <div className="w-full">
      <h2 className="text-xl font-semibold text-center mb-4">Upload Your Resume</h2>
      <div className="w-full mx-auto h-[350px]">
        {activeOption === 'Resume' ? (
          <div className='h-full w-full grid place-items-center'>
            <NewUpload selectedFile={selectedFile} setSelectedFile={setSelectedFile} />
          </div>
        ) : (
          <ConnectLinkedin />
        )}
      </div>

      <button
        className='mt-6 bg-purple-600 text-white font-semibold px-6 py-3 rounded-full block mx-auto'
        onClick={handleContinue}
      >
        Skip Now
      </button>
    </div>
  );
};

export default ResumeUploadStep;