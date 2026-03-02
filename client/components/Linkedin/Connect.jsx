import { useState } from 'react';
import {InputField} from "./InputField";
import { Button } from '../FileUpload/Button';

export const ConnectLinkedin = () => {
  const [useEmail, setUseEmail] = useState('');
  const [checked,setChecked] = useState(false)
  const handleConnect = () => {
    // Handle connection logic
  };

  return (
    <form className="flex overflow-hidden flex-col mt-10 p-7 mx-auto my-0 w-full bg-white rounded-xl border border-solid shadow-sm border-zinc-400 max-w-[720px] max-md:p-5 max-md:mx-4 max-md:my-0 max-sm:p-4 max-sm:rounded-xl">
      <div className="flex flex-col w-full">
        <h1 className="mb-1.5 text-2xl font-semibold leading-none text-stone-900 max-sm:text-xl">
          Connect with LinkedIn
        </h1>
        <p className="text-base leading-none text-zinc-800 max-sm:text-sm">
          Import your LinkedIn profile instantly and let AI craft your resume.
        </p>
      </div>
      
      <div className="mt-9 w-full">
        <input type="text" className='border-[1px] border-[#bababa] w-full rounded-md py-3 px-2 focus:outline-none'
         placeholder='https://www.linkedin.com/in/arun-karthik-3b08b5218'  
         value={useEmail}
         onChange={(e)=>setUseEmail(e.target.value)}
        />
        <div className="flex gap-2 items-center mt-3">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
          className="ml-3 relative rounded border-2 accent-primary border-violet-500 border-solid cursor-pointer"
          id="useEmail"
        />
        <label 
          htmlFor="useEmail" 
          className="text-xl font-medium text-zinc-500 text-semibold max-md:text-lg max-sm:text-base"
        >
          Use login email address
        </label>
      </div>
      </div>

      <div className="flex justify-end mt-9 w-full">
        <Button onClick={handleConnect}>
          Connect Now
        </Button>
      </div>
    </form>
  );
};