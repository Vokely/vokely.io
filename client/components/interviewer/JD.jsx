import { AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import {motion} from 'framer-motion'

export default function JD({jobDescription,setJobDescription,isResumesOpen,setIsResumesOpen}) {

  return (
    <div className='mt-5 w-full md:w-[50vw] border-[1px] border-[#bababa] hover:border-primary smooth rounded-xl py-6 px-8'>
        <div className='flex items-center justify-between' onClick={() => setIsResumesOpen(cur => !cur)}>
            <h1 className='text-start font-semibold md:text-xl'>Add Your Job Description</h1>
            <motion.div
                animate={{ rotate: isResumesOpen ? 180 : 0 }} 
                transition={{ duration: 0.3, ease: "easeInOut" }} 
                style={{ originX: 0.5, originY: 0.5 }} 
            >
                <ChevronDown
                size={42} 
                color='#999999'
                strokeWidth={2}
                />
            </motion.div>
        </div>


      <AnimatePresence>
        {!isResumesOpen && (
          <motion.div
            key="accordion"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <h3 className='text-xl mt-2 text-start'>Your JD, Your Dream Role — Let’s Begin</h3>
            <p className='text-[#6b6b6b] text-sm text-start my-2'>Even a short blurb or job title is helpful!</p>
            <textarea name="job_description" id="jd" className='outline-none w-full border-[1px] border-[#bababa] px-4 py-2 rounded-xl' rows={8}
            placeholder='Paste your Job Description or preferred Job Title' onChange={(e)=>setJobDescription(e.target.value)} value={jobDescription}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
