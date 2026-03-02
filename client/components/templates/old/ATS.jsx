import { Roboto } from "next/font/google";
import External from "../../icons/External";
import PaginationEl from "../../editor/Pagination";
import { useEffect, useRef } from "react";

const roboto = Roboto({
  weight: ["400", "500", "700"],
  subsets: ["latin"], 
  display: "swap", 
});
export const renderATSResume = (pages, currentPage) => {
  if (pages.length === 0) return null;

  const page = pages[currentPage];
  return (
    <div>
      {page.map((item, index) => {
        if (item.type === "personalInfo") {
          return (
            <div key={`personalInfo-${index}`} className="flex justify-between items-end mb-2">
              <div className="ml-2">
                <h1 className="text-xl font-bold">
                  {item.content.firstName} {item.content.lastName}
                </h1>
                  <p className="text-xl text-gray-600">{item.content.title}</p>
                  <div className="text-normal text-gray-600">
                    <p>{item.content.email} | {item.content.phone}</p>
                    <p>{item.content.location}</p>
                  </div>
              </div>

              {/* Social Links */}
              <div>
                {item.content.links?.map((link, i) => (
                  <div className="flex items-center gap-1 w-full" key={i}>
                    <a href={link.url} target="_blank" rel="noopener noreferrer" style={{ color: 'gray' }} className="flex items-center gap-1">
                    <span className="text-sm font-semibold text-blue-700">{link.platform}</span>
                      <External size="16" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          );
        } else if (item.type === "summary") {
          return (
            <div key={`summary-${index}`} className="flex flex-col gap-2">
              <h2 className="bg-gray-200 text-center rounded-md py-1 text-xl font-semibold">Summary</h2>
              <p className="text-normal ml-2">{item.content}</p>
            </div>
          );
        } else if (item.type === "skills") {
          return (
            <div key={`skills-${index}`} className="my-2">
              <div className="bg-gray-200 text-center rounded-md py-1">
                <h2 className="text-xl font-semibold">Skills</h2>
              </div>
              <div className="flex flex-col flex-wrap gap-2 mt-2 ml-2">
                {Object.entries(item.content).map(([category, skillsList]) => (
                  <div key={category} className="flex flex-wrap items-end">
                    <h3 className="font-bold capitalize">{category.replace("_", " ")}:</h3>
                      {skillsList.map((skill, i) => (
                        <p key={i} className="text-sm bg-gray-200 px-2 py-1 mt-1 rounded ml-1">
                          {skill}
                        </p>
                      ))}
                  </div>
                ))}
              </div>
            </div>
          );
        } else if (item.type === "heading") {
          return (
            <div key={`heading-${index}`} className="bg-gray-200 text-center rounded-md py-1">
              <h2 className="bg-gray-200 text-xl font-semibold">{item.content}</h2>
            </div>
          );
        }else {
          switch (item.section) {
            case "experience":
              return (
                <div key={`experience-${index}`} className="my-2">
                  <h3 className="text-xl font-semibold">{item.item.title}</h3>
                  <div className="flex items-center justify-between">
                    <p className="text-normal text-gray-600">
                      {item.item.company} | {item.item.location}
                    </p>
                    <p className="text-normal text-gray-500">
                      {item.item.startDate} - {item.item.endDate}
                    </p>
                  </div>
                  <p className="text-normal">{item.item.description}</p>
                </div>
              );
            case "education":
              return (
                  <div className="my-2 grid grid-cols-4 gap-3 text-normal ml-2" key={`education-${index}}`}>
                    <p className="w-fit">{item.item.degree}</p>
                    <p className="w-fit">{item.item.school}</p>
                    <p className="w-fit">{item.item.startDate} - {item.item.endDate}</p>
                    <p className="w-fit">{item.item.gpa}</p>
                </div>
              );
            case "projects":
              return (
                <div key={`projects-${index}`} className="my-2">
                  <h3 className="text-xl font-semibold inline-flex items-center gap-1">
                    {item.item.name}
                    <a href={item.item.link} target="_blank" rel="noopener noreferrer" style={{ color: 'gray' }}>
                      <External size="16" />
                    </a>
                  </h3>
                  <p>{item.item.description}</p>
                </div>
              );
            case "achievements":
              return (
                <ul key={`achievements-${index}`} className="list-disc list-inside mt-2 ml-2">
                  <li className="mb-1">{item.item}</li>
                </ul>
              );
            default:
              return null;
          }
        }
      })}
    </div>
  );
};

export default function ATS({ data,pages,setPages,currentPage,setCurrentPage,template}) {
  const { personal, skills, experience, education, projects, achievements,socialLinks } = data;
  const containerRef = useRef(null);

    useEffect(() => {
      if (containerRef.current) {
        const container = containerRef.current;
        let containerHeight = 1000;
        const padding = 100;
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
          <div class="text-center">
            <h1 class="text-3xl font-bold">${personal.firstName} ${personal.lastName}</h1>
            <p class="text-xl text-gray-600">${personal.title}</p>
            <div class="text-normal text-gray-600">
              <p>${personal.email} | ${personal.phone}</p>
              <p>${personal.location}</p>
            </div>
          </div>
        `;
        const personalInfoHeight = measureHeight(personalInfoContent);
  
        const summaryContent = `
          <div class="mt-[12px] flex flex-col gap-[8px]">
            <h2 class="border-b-[1px] border-gray-200 text-[24px] font-semibold">Summary</h2>
            <p class="text-[16px]">${personalInfo.summary}</p>
          </div>
        `;
        const summaryHeight = measureHeight(summaryContent);
  
        const skillsContent = `
          <div class="mb-3">
            <div class="border-b-[1px] border-gray-200"><h2 class="text-xl font-semibold">Skills</h2></div>
            <div class="flex flex-wrap gap-2 mt-2">
              ${Object.entries(skills).map(([category, skillsList]) => (
                <div key={category} className="flex flex-wrap items-center">
                  <h3 className="font-bold capitalize">{category.replace("_", " ")}:</h3>
                    {skillsList.map((skill, i) => (
                      <p key={i} className="text-sm bg-gray-200 px-2 mt-1 py-1 rounded ml-1">
                        {skill}
                      </p>
                    ))}
                </div>
              ))}
            </div>
          </div>
        `;
        const skillsHeight = measureHeight(skillsContent);
  
        // Collect all items from sections, including headings
        const sections = [
          {
            name: "experience",
            heading: "Experience",
            items: experience,
          },
          {
            name: "education",
            heading: "Education",
            items: education,
          },
          {
            name: "projects",
            heading: "Projects",
            items: projects,
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
        
        if(socialLinks){
          personal.links = socialLinks
        }
        // Add personal info, summary, and skills only to the first page
        currentPageItems.push({
          type: "personalInfo",
          content: personal,
        });
  
        currentPageItems.push({
          type: "summary",
          content: personalInfo.summary,
        });
  
        if(socialLinks){
          currentPageItems.push({
            type: "skills",
            content: skills,
          });
        }
  
        allItems.forEach((item) => {
          const itemElement = document.createElement("div");
          itemElement.style.visibility = "hidden"; 
          container.appendChild(itemElement);
  
          if (item.type === "heading") {
            itemElement.innerHTML = `
              <h2 class="border-b-2 border-gray-200 text-xl font-semibold">${item.content}</h2>
            `;
          } else {
            // Render content based on section (experience, education, projects, achievements)
            switch (item.section) {
              case "experience":
                itemElement.innerHTML = `
                  <div class="mb-3 mt-1">
                    <h3 class="text-xl font-semibold">${item.item.title}</h3>
                    <div class="flex items-center justify-between">
                      <p class="text-normal text-gray-600">${item.item.company} | ${item.item.location}</p>
                      <p class="text-normal text-gray-500">${item.item.startDate} - ${item.item.endDate}</p>
                    </div>
                    <p class="text-normal">${item.item.description}</p>
                  </div>
                `;
                break;
              case "education":
                itemElement.innerHTML = `
                  <div class="grid grid-cols-4 gap-3 text-normal">
                    <p class="w-fit">${item.item.degree}</p>
                    <p class="w-fit">${item.item.school}</p>
                    <p class="w-fit">${item.item.startDate} - ${item.item.endDate}</p>
                    <p class="w-fit">${item.item.gpa}</p>
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
                    <p>${item.item.description}</p>
                  </div>
                `;
                break;
              case "achievements":
                itemElement.innerHTML = `
                  <li class="mb-1">${item.item}</li>
                `;
                break;
              default:
                break;
            }
          }
  
        const itemHeight = itemElement.clientHeight; 
        // console.log(item.section,"itemHeight:"+itemHeight+"-----page:"+currentPageHeight)
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
    }, [personal, skills, experience, education, projects, achievements,socialLinks]);
  
  return (
    <div className="flex flex-col items-center">
      {/* Resume Container */}
      <div
        ref={containerRef}
        className={`resume-template p-4 box-border h-[1122px] w-[100%] font-sans bg-white shadow-lg rounded-lg`}
      >
        {/* Render Current Page Items */}
        {renderATSResume(pages,currentPage)}
      </div>
      {/* Pagination */}
        <PaginationEl currentPage={currentPage} pages={pages} onPageChange={setCurrentPage} currentTemplate={template}/>
    </div>
  );
}