import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';

const formatUpdateDate = (dateString) => {
  if (!dateString) return null;
  try {
    return new Date(dateString).toLocaleDateString(undefined, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return 'Invalid Date';
  }
};

function useOnClickOutside(ref, handler) {
  useEffect(() => {
    const listener = (event) => {
      if (!ref.current || ref.current.contains(event.target)) return;
      handler(event);
    };
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
}

export default function ResumesDropdownItems({
  resumes = [],
  selectedFile,
  loading = false,
  loadingText = 'Loading...',
  handleSelection,
  isExistingResume = true,
}) {
  const [isOpen, setIsOpen] = useState(true);
  const dropdownRef = useRef(null);

  useOnClickOutside(dropdownRef, () => setIsOpen(false));

  const toggleDropdown = () => {
    if (!loading && resumes.length > 0) {
      setIsOpen(!isOpen);
    }
  };

  const dropdownVariants = {
    hidden: { opacity: 0, y: -10, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1 },
  };

  return (
    <div ref={dropdownRef} className='relative w-full bg-white rounded-md border border-gray-200'>
      {loading ? (
        <div className='text-primary h-[52px] px-3 grid place-items-center text-left w-full'>
          {loadingText}
        </div>
      ) : (
        <>
          {resumes.length > 0 ? (
            <>
              <button
                type="button"
                onClick={toggleDropdown}
                className="relative w-full cursor-pointer bg-white py-3 pl-3 pr-10 text-left focus:outline-none sm:text-sm rounded-md border-b border-gray-200"
              >
                <span className={`block truncate ${(selectedFile && isExistingResume) ? 'text-primary font-semibold' : 'text-gray-500'}`}>
                  {(selectedFile && isExistingResume)
                    ? `${selectedFile.name} (${formatUpdateDate(selectedFile.created_at)})`
                    : "Select a Resume"}
                </span>
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center">
                  {isOpen ? (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronUp className="h-5 w-5 text-gray-400" />
                  )}
                </span>
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.ul
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    variants={dropdownVariants}
                    transition={{ duration: 0.15, ease: "easeInOut" }}
                    className="z-10 mt-1 max-h-40 w-full overflow-auto rounded-b-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
                  >
                    {resumes.map((resume) => (
                      <li
                        key={resume._id}
                        onClick={() => {toggleDropdown();handleSelection(resume)}}
                        className="relative cursor-pointer select-none py-3 pl-4 pr-4 text-gray-900 hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
                      >
                        <span className={`flex justify-between items-center w-full truncate ${selectedFile?._id === resume._id ? 'font-semibold' : 'font-normal'}`}>
                          {resume.name}
                          <span className='text-gray-600 text-sm'>{formatUpdateDate(resume.created_at)}</span>
                        </span>
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </>
          ) : (
            <div className='flex flex-col gap-5 items-center justify-center h-[100px] py-4 px-6'>
              <h2 className='text-lg font-semibold text-center text-gray-600'>OOPS..No resumes found!</h2>
              <a href="/dashboard">
                <button className='border-[1px] border-primary text-primary rounded-md px-6 py-1.5 text-sm hover:bg-primary hover:text-white transition-colors duration-200'>
                  Create Resume
                </button>
              </a>
            </div>
          )}
        </>
      )}
    </div>
  );
}
