'use client'
import { useState, useEffect, useRef } from 'react';
import LogoText from '@/components/reusables/LogoText';
import "@/styles/editor.css";
import { TEMPLATE_CATGORIES } from '@/data/navItems';
import { TEMPLATES } from '@/data/defaultData';
import { useRouter } from 'next/navigation';
import useNavigationStore from '@/store/navigationStore';
import { ChevronLeft } from 'lucide-react';

export default function Templates({id}) {
  const [activeCategory, setActiveCategory] = useState("Simple");
  const [loadedImages, setLoadedImages] = useState({});
  const router = useRouter();
  const {setActiveMenu,setIsTemplatesVisible} = useNavigationStore();

  useEffect(() => {
    const prefetchImages = async () => {
      const imagePromises = TEMPLATES.map(template => {
        return new Promise((resolve) => {
          const img = new Image();
          const imageUrl = `${process.env.NEXT_PUBLIC_BUCKET_URL}/templates/${template.name}.png?t=${Date.now()}`;
          
          img.onload = () => {
            setLoadedImages(prev => ({
              ...prev,
              [template.name]: imageUrl
            }));
            resolve();
          };
          
          img.onerror = () => {
            setLoadedImages(prev => ({
              ...prev,
              [template.name]: '/api/placeholder/400/500'
            }));
            resolve();
          };
          
          img.src = imageUrl;
        });
      });
      
      await Promise.all(imagePromises);
    };
    
    prefetchImages();
  }, []);

  const handleClick = (template)=>{
    let url = "/dashboard";
    if(id!==null){
       url = `resumes/${template.category.toLocaleLowerCase()}/${template.id}/edit/${localStorage.getItem('id')}`;
       setActiveMenu("Resume Editor")
    }else{
      setActiveMenu("Dashboard")
    }
    router.push(url)
  };

  function getActiveTemplates(){
    const filteredTemplates = TEMPLATES.filter((template)=> template.category === activeCategory)
    return filteredTemplates
  }
  return (
  <div className='relative min-h-screen'>
    <div className='mt-3 md:mt-5 ml-3 md:ml-5 w-fit'>
      <LogoText color='#342EE5'/>
    </div>

    <div
      className='absolute top-3 md:top-4 lg:top-10 right-3 md:right-4 lg:right-10 flex items-center justify-center w-fit cursor-pointer'
      onClick={() => setIsTemplatesVisible(false)}
    >
      <ChevronLeft size={18} className="md:size-22" />
      <p className='font-medium text-base md:text-lg lg:text-xl ml-1 md:ml-2'>Go Back</p>
    </div>

    {/* Main */}
    <div className='mt-16 sm:mt-8 md:mt-10 px-3 sm:px-6 lg:px-8'>
      <h1 className='text-primary text-2xl sm:text-3xl md:text-4xl font-extrabold text-center'>
        Choose Your Resume Template
      </h1>
      <p className='mt-2 text-base sm:text-lg md:text-xl text-center font-bold text-gray-700 px-2'>
        Impress recruiters in seconds with stunning ATS-friendly resume templates powered by AI.
      </p>

      {/* Category */}
      <div className='flex flex-wrap gap-2 md:gap-4 justify-center mt-4 md:mt-6 lg:mt-8'>
        {TEMPLATE_CATGORIES.map((category, index) => (
          <div
            key={index}
            className={`flex gap-1 md:gap-2 items-center justify-center cursor-pointer px-2 md:px-3 py-1 md:py-2 rounded-md text-sm md:text-base lg:text-lg font-bold
              ${category === activeCategory ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'}`}
            onClick={() => setActiveCategory(category)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 32 32">
              <path
                d="M19.8 9l-.2.7a8 8 0 01-5 5l-.6.2.6.2a8 8 0 015 5l.2.6.3-.6a8 8 0 015-5l.6-.2-.7-.2a8 8 0 01-5-5l-.2-.6zM19 5.8a1 1 0 011.9 0L21.9 9a6 6 0 003.8 3.7L29 14a1 1 0 010 1.9L25.7 17a6 6 0 00-3.8 3.7l-1.1 3.4a1 1 0 01-1.9 0l-1.2-3.4A6 6 0 0014 17L10.6 16a1 1 0 010-2l3.4-1.1a6 6 0 003.7-3.7L19 5.7zM3.9 7c0-1.2 1.8-1.2 2 0v1c.1.4.5.8 1 .8l.9.1c1.2.1 1.2 1.9 0 2l-1 .1a1 1 0 00-.9.9v1c-.2 1.1-2 1.1-2 0l-.2-1A1 1 0 003 11l-1-.1c-1.2-.1-1.2-1.9 0-2h1c.4-.1.8-.5.8-1l.1-1zm6 14c-.2-1.2-2-1.2-2 0l-.2 1c0 .4-.4.8-.8.8l-1 .1c-1.2.1-1.2-1.9 0 2l1 .1c.4 0 .8.4.8.9l.1 1c.2 1.1 2 1.1 2 0l.1-1c.1-.5.5-.8 1-.9l.9-.1c1.2-.1 1.2-1.9 0-2h-1a1 1 0 01-.9-1v-1z"
                fill={category === activeCategory ? 'white' : '#666666'}
              />
            </svg>
            <p className={`${category === activeCategory ? 'text-white' : 'text-[#666666]'}`}>{category}</p>
          </div>
        ))}
      </div>

      {/* Resumes */}
      <div className='mt-6 mx-5 md:mx-0 md:mt-8 lg:mt-10 mb-10'>
        <div className='mx-auto'>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6'>
            {getActiveTemplates().map((template, i) => (
              <div
                key={i}
                className='p-2 w-full bg-primary/10 rounded-md shadow-lg hover:shadow-md hover:shadow-primary transition duration-300 ease-in-out cursor-pointer'
                onClick={() => handleClick(template)}
              >
                <div className='relative img-container overflow-hidden rounded-md aspect-[3/4]'>
                <h2 className='font-bold text-base sm:text-lg md:text-xl text-center text-primary mb-2'>
                  {template.name}
                </h2>
                {loadedImages[template.name] ? (
                        <img
                          src={loadedImages[template.name]}
                          alt={template.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                  <div className="h-full w-full bg-gray-100 animate-pulse flex items-center justify-center">
                    {/* Resume skeleton design */}
                    <div className="w-full h-full relative">
                      {/* Header area */}
                      <div className="absolute top-0 left-0 right-0 h-8 sm:h-10 bg-gray-200 rounded-t-md"></div>
                      
                      {/* Content skeleton */}
                      <div className="absolute top-10 sm:top-14 left-2 sm:left-3 right-2 sm:right-3 flex flex-col gap-1 sm:gap-2">
                        <div className="h-3 sm:h-4 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-1 sm:h-2 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-1 sm:h-2 bg-gray-200 rounded w-full"></div>
                        
                        <div className="mt-2 sm:mt-4 h-2 sm:h-3 bg-gray-200 rounded w-1/3"></div>
                        <div className="flex gap-1 sm:gap-2">
                          <div className="h-1 sm:h-2 bg-gray-200 rounded w-1/4"></div>
                          <div className="h-1 sm:h-2 bg-gray-200 rounded w-1/4"></div>
                          <div className="h-1 sm:h-2 bg-gray-200 rounded w-1/4"></div>
                        </div>
                        
                        <div className="mt-2 sm:mt-4 h-2 sm:h-3 bg-gray-200 rounded w-2/5"></div>
                        <div className="h-1 sm:h-2 bg-gray-200 rounded w-full"></div>
                        <div className="h-1 sm:h-2 bg-gray-200 rounded w-full"></div>
                        <div className="h-1 sm:h-2 bg-gray-200 rounded w-3/4"></div>
                        
                        <div className="mt-2 sm:mt-4 h-2 sm:h-3 bg-gray-200 rounded w-2/5"></div>
                        <div className="h-1 sm:h-2 bg-gray-200 rounded w-full"></div>
                        <div className="h-1 sm:h-2 bg-gray-200 rounded w-full"></div>
                        <div className="h-1 sm:h-2 bg-gray-200 rounded w-3/4"></div>
                      </div>
                    </div>
                  </div>
                )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
  );
}