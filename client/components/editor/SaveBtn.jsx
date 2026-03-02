import { updateResume } from "@/lib/resumeUtils"

export default function SaveBtn({resumeId, user, resumeName}) {
    const handleSave = async()=>{
        const response = await updateResume(user,resumeId,null,null,resumeName);
    }

  return (
   <div className='flex justify-end py-1'>
        <button className='bg-black text-white px-6 py-1 rounded-full hover:bg-[rgb(53,53,53)] font-semibold cursor-pointer' onClick={handleSave}>Save</button>
    </div>
  )
}
