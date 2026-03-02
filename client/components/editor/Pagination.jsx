import DropDown from '../icons/DropDown';
import { useRouter } from 'next/navigation';
import { TEMPLATES } from '@/data/defaultData';
import { useMemo, useRef, useState } from 'react';
import Pagination from '../icons/PaginationIcon';
import { usePathname } from 'next/navigation';
import useClickOutside from '@/hooks//useClickOutside';

const PaginationEl = ({ currentTemplate }) => {
  const router = useRouter();
  const [templateToggled, setTemplateToggled] = useState(false);
  const pathname = usePathname();
  const segments = pathname.split('/');
  const id = segments[segments.length - 1];

  const dropdownRef = useRef(null);

  useClickOutside(dropdownRef, () => setTemplateToggled(false));

  const handleCategoryChange = (template) => {
    setTemplateToggled(false);
    router.push(`/resumes/${template.toLowerCase()}/1/edit/${id}`);
  };

  const categories = useMemo(() => {
    return [...new Set(TEMPLATES.map((template) => template.category))];
  }, []);

  const templates = useMemo(() => {
    return TEMPLATES.filter((template) => template.category === currentTemplate.category);
  }, [currentTemplate.category]);

  const currentIndex = Number(currentTemplate.id);
  const previousTemplateIndex = currentIndex > 1 ? currentIndex - 1 : null;
  const nextTemplateIndex = templates.length > currentIndex ? currentIndex + 1 : null;

  return (
    <div className="lap:mb-2 w-screen lap:w-[85%] sticky bottom-2">
      <div className="relative flex gap-2 items-center justify-center mt-4 border-[1px] border-black w-full rounded-full px-4 bg-[#F7F5FA]">
        <div className="border-r-[1px] border-black py-2 px-2 flex-1 relative">
          <div 
            className="flex justify-center items-center gap-2 cursor-pointer" 
            onClick={() => setTemplateToggled((cur) => !cur)}
            id='resume-tour-3'
          >
            <p className='text-xs md:text-base'>Category - <span className="uppercase font-semibold">{currentTemplate.category}</span></p>
            <div className="rotate-180">
              <DropDown color="rgb(143, 86, 232)" size="22" />
            </div>
          </div>

          {/* Dropdown Menu */}
          <div
            ref={dropdownRef}
            className={`z-[99] w-[200px] absolute bottom-[50px] rounded-md bg-white text-black border border-primary mt-1 shadow-xl transition-all duration-200 ease-in-out transform ${
              templateToggled
                ? "opacity-100 translate-y-0 max-h-[200px]"
                : "opacity-0 -translate-y-2 max-h-0"
            } overflow-hidden`}
          >
            <div className="flex flex-col py-1">
              {categories.map((category, i) => (
                <p key={i} onClick={() => handleCategoryChange(category)} className="cursor-pointer mx-1 text-center hover:bg-primary hover:text-white hover:rounded-full smooth">
                  {category}
                </p>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between flex-1 px-2 py-2" id='resume-tour-4'>
          <button
            className={`rotate-[180deg] justify-self-start ${previousTemplateIndex ? "cursor-pointer text-primary" : "cursor-not-allowed opacity-50"}`}
            onClick={() => previousTemplateIndex && router.push(`/resumes/${currentTemplate.category}/${previousTemplateIndex}/edit/${id}`)}
            disabled={!previousTemplateIndex}
          >
            <Pagination/>
          </button>
          <p className='text-xs md:text-base'>{currentTemplate.name}</p>
          <button
            className={`justify-self-end ${nextTemplateIndex ? "cursor-pointer text-primary p-1" : "cursor-not-allowed opacity-50"}`}
            onClick={() => nextTemplateIndex && router.push(`/resumes/${currentTemplate.category}/${nextTemplateIndex}/edit/${id}`)}
            disabled={!nextTemplateIndex}
          >
            <Pagination/>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaginationEl;
