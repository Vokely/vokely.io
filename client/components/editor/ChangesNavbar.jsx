import { motion, AnimatePresence } from "framer-motion";
import useProfileStore from '@/store/profileStore';
import { handleGeneratedData, getUpdatedSections } from '@/lib/handleGeneratedData';
import useNavigationStore from '@/store/navigationStore';
import DropDown from '../icons/DropDown';
import EnhanceStar from '../icons/EnhanceStar';
import { updateGeneratedData, updateResume } from "@/lib/resumeUtils";

export default function ChangesNavbar({ isOpen, setIsOpen, openSection,setOptimizing,handleCanvas,resumeId}) {

    const {
        generatedData, setGeneratedData, setEnhancedData, setOldResume,
        setOldScore, setNewScore, setFilteredSection, jobDescription, currentResume,
    } = useProfileStore();
    const {
        personalInfo, skills, experience, education, education_headings,
        projects, achievements, socialLinks, hobbies, languages,
    } = useProfileStore();
    
    const data = {
        personalInfo, skills, experience, education, education_headings,
        projects, achievements, socialLinks, hobbies, languages
    };
    
    const { setActiveSection } = useNavigationStore();
    const changed_sections = getUpdatedSections(generatedData);

    const updateData = async() => {
        setOptimizing(true)
        setOldResume(data);
        const updatedData = handleGeneratedData(generatedData, setEnhancedData, data);
        if (generatedData.old_score) setOldScore(generatedData.old_score);
        if (generatedData.new_score) setNewScore(generatedData.new_score);
        setFilteredSection(null);
        setGeneratedData(null);
        await updateGeneratedData({},resumeId)
        await updateResume(resumeId, jobDescription, updatedData, currentResume);
        setTimeout(()=>(setOptimizing(false)),4000);
        handleCanvas();
    };


    return (
    <>
        {
            changed_sections.length > 0 && (
                <div className='rounded-md bg-multi-gradient p-[1px] mb-2 h-auto mx-2 sm:mx-4 md:mx-8'>
                <div className='bg-[rgb(243,238,250)] p-4 rounded-md'>
                    <div className='flex items-center justify-between cursor-pointer' onClick={() => setIsOpen(cur => !cur)}>
                    <p className='text-gradient font-semibold text-[18px] sm:text-[20px] md:text-[22px]'>
                        Enhance your ATS with our AI-generated content
                    </p>
                    <div className={`${isOpen ? 'rotate-180' : ''} smooth`}>
                        <DropDown size="28" className="sm:size-32" />
                    </div>
                    </div>

                    <AnimatePresence>
                    {isOpen && (
                        <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.5, ease: "easeIn" }}
                        className="overflow-hidden"
                        >
                        <div>
                            <p className='text-gray-600 mt-2 text-sm sm:text-base'>
                            Check out the enhancements we made in these sections
                            </p>

                            {/* Responsive grid: 1 column on small screens, 2 on md+ */}
                            <div className='grid grid-cols-1 sm:grid-cols-2 gap-2 my-4'>
                            {changed_sections.map((section, inx) => (
                                <p
                                className='inline-flex items-center gap-1 text-primary text-sm sm:text-base cursor-pointer hover:underline smooth'
                                key={inx}
                                onClick={() => {
                                    openSection(cur => !cur);
                                    setActiveSection(section.heading);
                                }}
                                >
                                <span><EnhanceStar /></span>
                                {section.content}
                                </p>
                            ))}
                            </div>

                            <div className="inline-block rounded-full p-[2px] bg-multi-gradient" onClick={updateData}>
                                <button className="rounded-full bg-multi-gradient px-4 py-2 text-white font-semibold text-sm sm:text-base w-full h-full">
                                    One Click Optimize
                                </button>
                            </div>
                        </div>
                        </motion.div>
                    )}
                    </AnimatePresence>
                </div>
                </div>
            )
        }
    </>
    );
}