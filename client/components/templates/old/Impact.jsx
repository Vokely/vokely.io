import { Roboto } from "next/font/google";
import External from "../../icons/External";
import { useEffect, useMemo, useRef } from "react";
import PaginationEl from "../../editor/Pagination";
import { textToList } from "@/lib/resumeUtils";

const roboto = Roboto({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
});

export const renderImpactResume = (pages, currentPage) => {
  if (pages.length === 0) return null;
  return (
    <div>
      {pages[currentPage].map((item, index) => {
        if (item.type === "personalInfo") {
          return (
            <div key={`personalInfo-${index}`} className="pb-2 border-b-2 border-b-black">
              <h1 className="text-2xl font-bold">
                {item.content.firstName} {item.content.lastName} 
                <span className="text-[#1F2937] font-normal text-[20px]">{item.content.title && `- ${item.content.title}`}</span>
              </h1>
              <div className="flex gap-2 text-[#1F2937]">
                <p>
                  {item.content.email} 
                </p>
                <p>{item.content.phone}</p>
                <p>{item.content.location}</p>
              </div>
            </div>
          );
        } else if (item.type === "summary") {
          return (
            <div key={`summary-${index}`} className="mt-[12px] flex flex-col gap-[8px] mb-3">
              <p className="text-[14px] text-[#1F2937]">{item.content}</p>
            </div>
          );
        } else if (item.type === "skills") {
          return (
          <div key={`skills-${index}`} className="mb-3">
            {item.content && Object.keys(item.content).length > 0 && (
              <>
                <h2 className="text-normal uppercase font-semibold text-[#374151]">CORE COMPETENCIES</h2>
                <div>
                  {Object.entries(item.content).map(([category, skillsList]) => (
                    Array.isArray(skillsList) && skillsList.length > 0 && (
                      <div key={category}>
                        <h3 className="capitalize text-[#374151] text-[14px] font-semibold my-1">{category.replace("_", " ")}</h3>
                        <div className="flex flex-wrap items-center">
                          {skillsList.map((skill, i) => (
                            <p key={i} className="text-[14px] text-[#4B5563] px-2 bg-gray-100 mr-1 mb-1 rounded-sm">
                              {skill}
                            </p>
                          ))}
                        </div>
                      </div>
                    )
                  ))}
                </div>
              </>
            )}
          </div>
          );
        } else if (item.type === "heading") {
          return (
              <h2 key={index} className="text-normal font-semibold uppercase text-[#374151] mt-2 mb-1">{item.content}</h2>
          );
        } else {
          switch (item.section) {
            case "experience":
              return (
                <div key={`experience-${item.index}`} className="mb-3 mt-1">
                  <h3 className="text-[16px] font-semibold text-[#374151]">{item.item.title}</h3>
                  <div className="flex items-center justify-between text-[14px]">
                    <p className=" text-[#374151] font-semibold">
                      {item.item.company} | {item.item.location}
                    </p>
                    <p className=" text-gray-500">
                      {item.item.startDate} - {item.item.endDate}
                    </p>
                  </div>
                  {item.item.description.map((list,inx)=>(
                    <li key={inx} className="text-[14px] text-[#4B5563] list-disc marker:text-[#374151]">{list}</li>
                  ))}
                </div>
              );
            case "education":
              return (
                <div key={`education-${item.index}`} className="text-normal">
                  <p className="text-[16px] font-semibold text-[#374151]">{item.item.degree}</p>
                  <div className="flex justify-between">
                    <p className="text-[14px] text-[#4B5563]">{item.item.school}</p>
                    <p className="text-[14px] text-[#4B5563]">
                      {item.item.startDate} - {item.item.endDate}
                      <span className="text-[14px]"> {item.item.gpa}</span>
                    </p>
                  </div>
                </div>
              );
            case "projects":
              return (
                <div key={`projects-${item.index}`} className="mb-1">
                  <h3 className="text-[16px] text-[#374151] font-semibold inline-flex items-center gap-1">
                    {item.item.name}
                    <a href={item.item.link} target="_blank" rel="noopener noreferrer" style={{ color: "gray" }}>
                      <External size="16" />
                    </a>
                  </h3>
                  {item.item.description.map((list,inx)=>(
                    <li key={inx} className="text-[14px] text-[#4B5563] list-disc marker:text-[#374151]">{list}</li>
                  ))}
                </div>
              );
            case "achievements":
              return (
                <li key={`achievements-${item.index}`} className="mb-1 text-[14px] text-[#4B5563]">
                  {item.item}
                </li>
              );
            default:
              return null;
          }
        }
      })}
    </div>
  );
};


export default function Impact({ data,pages,setPages,currentPage,setCurrentPage, template }) {
  let { personal, skills, experience, education_headings, education, projects, achievements } = data;
  
  const updatedExperience = useMemo(() => 
    experience.map(exp => ({
      ...exp,
      description: textToList(exp.description)
    })), 
    [experience] 
  );
  const updatedProjects = useMemo(() => 
    projects.map(prj => ({
      ...prj,
      description: textToList(prj.description)
    })), 
    [projects] 
  );
  console.log(updatedProjects)
  const containerRef = useRef(null);


  // Split content into pages
  useEffect(() => {
    if (containerRef.current) {
      const container = containerRef.current;
      let containerHeight = 297 * 3.78; // Convert 297mm to pixels (1mm ≈ 3.78px) subracted for
      containerHeight = 1100;
      const padding = 60;
      const allItems = []; 
  
      const measureHeight = (content) => {
        const tempElement = document.createElement("div");
        tempElement.style.position = "absolute"; 
        tempElement.style.visibility = "hidden"; 
        tempElement.innerHTML = content;
        container.appendChild(tempElement);
        const height = tempElement.clientHeight;
        container.removeChild(tempElement); 
        return height;
      };
  
      const personalInfoContent = `
        <div class="pb-2 border-b-2 border-b-black">
          <h1 class="text-2xl font-bold">
            ${personal.firstName} ${personal.lastName}
            ${personal.title ? `<span class="text-[#1F2937] font-normal text-[20px]">- ${personal.title}</span>` : ""}
          </h1>
          <div class="flex gap-2 text-[#1F2937]">
            <p>${personal.email}</p>
            <p>${personal.phone}</p>
            <p>${personal.location}</p>
          </div>
        </div>
        `;
        const personalInfoHeight = measureHeight(personalInfoContent);

        // Summary Template
      const summaryContent = `
        <div class="mt-[12px] flex flex-col gap-[8px] mb-3">
          <p class="text-[14px] text-[#1F2937]">${personalInfo.summary}</p>
        </div>
        `;
      const summaryHeight = measureHeight(summaryContent);
  
      const skillsContent = `
        <div class="mb-3">
          ${skills && Object.keys(skills).length > 0 ? `
            <h2 class="text-normal uppercase font-semibold">CORE COMPETENCIES</h2>
            <div>
              ${Object.entries(skills)
                .map(([category, skillsList]) => 
                  Array.isArray(skillsList) && skillsList.length > 0 ? `
                    <div>
                      <h3 class="capitalize text-[#374151] text-[14px] font-semibold my-1">${category.replace("_", " ")}</h3>
                      <div class="flex flex-wrap items-center">
                        ${skillsList.map(skill => `
                          <p class="text-[14px] text-[#4B5563] px-2 bg-gray-100 mr-1 mb-1 rounded-sm">${skill}</p>
                        `).join('')}
                      </div>
                    </div>
                  ` : ""
                ).join('')}
            </div>
          ` : ""}
        </div>
      `;
      const skillsHeight = measureHeight(skillsContent);
          
      // Collect all items from sections, including headings
      const sections = [
        {
          name: "experience",
          heading: "Experience",
          items: updatedExperience,
        },
        {
          name: "education",
          heading: "Education",
          items: education,
        },
        {
          name: "projects",
          heading: "Projects",
          items: updatedProjects,
        },
        {
          name: "achievements",
          heading: "Achievements",
          items: achievements,
        },
      ];
  
      sections.forEach((section) => {
        // Add section heading
        if(section.items.length>0){
          allItems.push({
            type: "heading",
            content: section.heading,
          });
    
          // Add section items
          section.items.forEach((item, index) => {
            allItems.push({
              type: "item",
              section: section.name,
              item,
              index,
            });
          });
        }
      });
  
      // Split items into pages based on their actual height
      const newPages = [];
      let currentPageItems = [];
      let currentPageHeight = personalInfoHeight + summaryHeight + skillsHeight;
  
      // Add personal info, summary, and skills only to the first page
      currentPageItems.push({
        type: "personalInfo",
        content: personal,
      });
  
      currentPageItems.push({
        type: "summary",
        content: personalInfo.summary,
      });
  
      currentPageItems.push({
        type: "skills",
        content: skills,
      });
  
      allItems.forEach((item) => {
        const itemElement = document.createElement("div");
        // itemElement.style.position = "absolute"; 
        // itemElement.style.left = 0; 
        itemElement.style.visibility = "hidden"; 
        container.appendChild(itemElement);
  
        if (item.type === "heading") {
          itemElement.innerHTML = `
            <h2 class="border-b-2 border-gray-200 text-2xl font-semibold">${item.content}</h2>
          `;
        } else {
          switch (item.section) {
            case "experience":
              itemElement.innerHTML = `
                <div class="mb-3 mt-1">
                  <h3 class="text-[16px] font-semibold text-[#374151]">${item.item.title}</h3>
                  <div class="flex items-center justify-between text-[14px]">
                    <p class="text-[#374151] font-semibold">${item.item.company} | ${item.item.location}</p>
                    <p class="text-gray-500">${item.item.startDate} - ${item.item.endDate}</p>
                  </div>
                  ${item.item.description.map(list => `
                    <li class="text-[14px] text-[#4B5563] marker:text-[#374151]">${list}</li>
                  `).join('')}
                </div>
              `;
              break;
            case "education":
                itemElement.innerHTML = `
                  <div class="text-normal">
                    <p class="text-[16px] font-semibold text-[#374151]">${item.item.degree}</p>
                    <div class="flex justify-between">
                      <p class="text-[14px]">${item.item.school}</p>
                      <p class="text-[14px] text-[#1F2937]">
                        ${item.item.startDate} - ${item.item.endDate}
                        ${item.item.gpa ? `<span class="text-[14px]"> | GPA: ${item.item.gpa}</span>` : ''}
                      </p>
                    </div>
                  </div>
                `;              
              break;
            case "projects":
              itemElement.innerHTML = `
                <div class="mb-1 mt-1">
                  <h3 class="text-xl font-semibold inline-flex items-center gap-1">${item.item.name}
                    <a href="${item.item.link}" target="_blank" rel="noopener noreferrer" style="color: gray;">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                        <polyline points="15 3 21 3 21 9"></polyline>
                        <line x1="10" y1="14" x2="21" y2="3"></line>
                      </svg>
                    </a>
                  </h3>
                  ${item.item.description.map(list => `
                    <li class="text-[14px] text-[#4B5563] marker:text-[#374151]">${list}</li>
                  `).join('')}
                </div>
              `;
              break;
            case "achievements":
              itemElement.innerHTML = `
                <li class="mb-1 text-[14px]">${item.item}</li>
              `;
              break;
            default:
              break;
          }
        }
  
        const itemHeight = itemElement.clientHeight; 
        // console.log("itemHeight:"+itemHeight+"-----page:"+currentPageHeight)
        container.removeChild(itemElement); // Remove the temporary element
        
        const isInsideRadius = (currentPageHeight + itemHeight) > (containerHeight-padding);
        if (isInsideRadius) {
          newPages.push(currentPageItems); // Add current page items to pages
          currentPageItems = [];
          currentPageHeight = 0; 
        }else if( item.type === "heading" && currentPageHeight + itemHeight > (containerHeight)){
          newPages.push(currentPageItems); 
          currentPageItems = []; 
          currentPageHeight = 0; 
        }
        
        currentPageItems.push(item); // Add item to the current page
        currentPageHeight += itemHeight; // Update current page height
      });
  
      if (currentPageItems.length > 0) {
        newPages.push(currentPageItems); 
      }
  
      setPages(newPages); // Update pages state
    }
  }, [ personal, skills, experience, education_headings, education, projects, achievements]);


  return (
    <div className="flex flex-col items-center resume-container">
      {/* Resume Container */}
      <div
        ref={containerRef}
        className={`${roboto.className} resume-template p-4 box-border h-[1100px] w-[100%] font-sans bg-white shadow-lg rounded-lg`}
      >
        {/* Render Current Page Items */}
        {renderImpactResume(pages,currentPage)}
      </div>
      {/* Pagination */}
      {/* <Pagination/> */}
      <PaginationEl currentPage={currentPage} pages={pages} onPageChange={setCurrentPage} currentTemplate={template}/>
    </div>
  );
}