'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import CareerForm from '@/components/onboard/CareerForm';
import ResumeUploadStep from '@/components/onboard/ResumeUpload';
import '@/styles/login.css';
import { CustomStepper } from '@/components/reusables/CustomStepper';
import Loader from '@/components/reusables/Loader';
import { getOnboardingDetails } from '@/lib/onBoardUtil';

const steps = [
  { name: 'Basic Details', status: 'pending' },
  { name: 'Upload Resume', status: 'pending' },
  { name: 'Finish', status: 'pending' },
];

export default function OnBoard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isIsLoading,setIsLoading] = useState(true)

  const handleNext = () => {
    setStep((prev) => prev + 1);
    if(step > 2) handleFinish()
  };

  const handleFinish = () => {
    router.push('/profile');
  };

  const fetchOnboarding = async () => {
    try {
      const data = await getOnboardingDetails();
      const response = await data.json();
      setStep(response.step || 1)
      if(response.step>2 || response.resume_uploaded){
        handleFinish()
      }
    } catch (err) {
      console.error('Failed to refresh onboarding status', err);
    } finally {
      setIsLoading(false);
    }
};

  useEffect(() => {
      fetchOnboarding();
  }, [router,step]);  


  if (isIsLoading) return(<Loader/>)

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-8">
            <div className="mt-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Help us build your resume with the existing data of your choice!
              </h1>
              <p className="text-gray-600">
                You are one step away from your perfect resume
              </p>
            </div>
          </div>
          
          {/* Centered Stepper */}
          <div className="flex justify-center mb-8">
            <div className="w-full max-w-md">
              <CustomStepper steps={steps} currentStep={step} />
            </div>
          </div>
          
          {/* Form Content */}
          <div className="rounded-lg shadow-sm p-6">
            {step === 1 && <CareerForm onNext={handleNext}/>}
            {step === 2 && <ResumeUploadStep onNext={handleNext}/>}
          </div>
        </div>
      </div>
    </div>
  );
}