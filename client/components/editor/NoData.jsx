import React from 'react';

export default function NoData({ category = "Skills",handleClick }) {
  const messages = {
    Skills: `Showcase your expertise by adding key skills. AI will refine and highlight them to match your dream job! Click <span class='text-primary'>“+ Add Skills”</span> to showcase your expertise.`,
    Projects: `Projects highlight your real-world impact. Click <span class='text-primary'>“+ Add Projects”</span> to add your best work, and AI will help shape a compelling story for each!`,
    Certification: `Certifications add value to your resume. Let AI organize them for maximum impact! Click <span class='text-primary'>“+ Add Certification”</span>.`,
    Experience: `Employers love a strong experience section. Click <span class='text-primary'>“+ Add Experience”</span> to add your work history, and AI will enhance its appeal!`,
    Achievements: `Highlight what sets you apart! Click <span class='text-primary'>“+ Add Achievements”</span> to add your awards, and AI will ensure they stand out.`,
    Links: `Highlight what sets you apart! Click <span class='text-primary'>“+ Add Links”</span> to add your socialLinks, Help recruiters reach out easier.`,
    Hobby: `Showcase your personality beyond work! Click <span class='text-primary'>“+ Add Hobbies”</span> to highlight your interests, and AI will help present them engagingly.`,
    Language: `Highlight your multilingual skills! Click <span class='text-primary'>“+ Add Languages”</span> to showcase your proficiency, making your profile stand out globally.`,
  };

  const message = messages[category] || messages.Skills;

  return (
    <div className='grid place-items-center'>
      <div className='mx-8'>
        <p className='text-[#6B6B6B]' dangerouslySetInnerHTML={{ __html: message }} />
        <button className='text-primary font-medium hover:bg-lightviolet smooth px-4 py-2 rounded-md'
        onClick={handleClick}
        >
          <span className='text-primary'>+ Add {category}</span>
        </button>
      </div>
      <div className='img-container h-80vh w-80vh md:h-[50vh] md:w-[30vw]'>
        <img src={`${process.env.NEXT_PUBLIC_BUCKET_URL}/images/no-data.png`} alt="No data available" />
      </div>
    </div>
  );
}
