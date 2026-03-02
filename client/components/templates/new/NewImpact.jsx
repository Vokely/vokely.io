import { Roboto } from "next/font/google";
import React from "react";
import { useEffect, useMemo, useRef } from "react";
import PaginationEl from "../../editor/Pagination";
import { textToList } from "@/lib/resumeUtils";
import { getImpactTemplate } from "@/data/templates/impact";
import PageDots from "@/components/editor/PageDots";

const roboto = Roboto({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
});

export const renderNewImpact = (pages, currentPage) => {
  if (pages.length === 0) return null;
  
  return (
    <div>
      {pages[currentPage].map((item, index) => {
        const template = getImpactTemplate(item);
        if (!template) return null;
        
        return (
          <React.Fragment key={`${item.type}-${index}`}>
            {template.render(item.content || item.item)}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default function NewImpact({ data, pages, setPages, currentPage, setCurrentPage, template }) {
  const { personalInfo, skills, experience, education, projects, achievements, certifications } = data;
  
  const updatedExperience = useMemo(() => 
    experience.map(exp => ({
      ...exp,
      description: Array.isArray(exp.description) ? exp.description : textToList(exp.description)
    })), 
    [experience]
  );
  
  const updatedProjects = useMemo(() => 
    projects.map(prj => ({
      ...prj,
      description: Array.isArray(prj.description) ? prj.description : textToList(prj.description)
    })), 
    [projects]
  );  

  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      const container = containerRef.current;
      const containerHeight = 1100;
      const padding = 20;
      
      const measureHeight = (content) => {
        const tempElement = document.createElement("div");
        tempElement.style.position = "absolute";
        // tempElement.style.visibility = "hidden";
        tempElement.innerHTML = content;
        
        container.appendChild(tempElement);
        let height = tempElement.clientHeight;
        container.removeChild(tempElement);
        return height;
      };
  
      // Add initial sections
      const initialItems = [
        { type: "personalInfo", content: personalInfo },
        { type: "summary", content: personalInfo.summary },
        { type: "skills", content: skills }
      ];
  
      let currentPageItems = [];
      let currentPageHeight = 0;
  
      // Measure and add initial items
      initialItems.forEach(item => {
        const template = getImpactTemplate(item);
        if (template) {
          const itemHeight = measureHeight(template.toHTML(item.content));
          currentPageItems.push(item);
          currentPageHeight += itemHeight;
        }
      });
  
      // Process remaining sections
      const sections = [
        { name: "experience", heading: "Experience", items: updatedExperience },
        { name: "education", heading: "Education", items: education },
        { name: "projects", heading: "Projects", items: updatedProjects },
        { name: "certifications", heading: "Certifications", items: certifications },
        { name: "achievements", heading: "Achievements", items: achievements }
      ];
  
      const newPages = [currentPageItems];
  
      // Process each section
      sections.forEach(section => {
        if (section.items && section.items.length > 0) {
          // Create the section heading item but don't add it yet
          const headingItem = { type: "heading", content: section.heading };
          const headingTemplate = getImpactTemplate(headingItem);
          const headingHeight = measureHeight(headingTemplate.toHTML(headingItem.content));
          
          // Temporary storage for pending section heading
          let pendingHeading = { item: headingItem, height: headingHeight };
          
          // Process each item in the section
          let sectionInserted = false;
          
          section.items.forEach(item => {
            if (section.name === "experience") {
              // Create experience heading
              const expHeadingItem = { 
                type: "experienceHeading", 
                content: item 
              };
              const expHeadingTemplate = getImpactTemplate(expHeadingItem);
              const expHeadingHeight = measureHeight(expHeadingTemplate.toHTML(item));
  
              // Calculate total height needed for this item
              const totalHeightNeeded = (sectionInserted ? 0 : pendingHeading.height) + expHeadingHeight;
              
              // Check if both section heading and experience heading fit on current page
              if (currentPageHeight + totalHeightNeeded > containerHeight - padding) {
                // Start a new page
                currentPageItems = [];
                currentPageHeight = 0;
                newPages.push(currentPageItems);
                
                // Add section heading if not already added
                if (!sectionInserted) {
                  currentPageItems.push(pendingHeading.item);
                  currentPageHeight += pendingHeading.height;
                  sectionInserted = true;
                }
                
                // Add experience heading
                currentPageItems.push(expHeadingItem);
                currentPageHeight += expHeadingHeight;
              } else {
                // Add section heading if not already added
                if (!sectionInserted) {
                  currentPageItems.push(pendingHeading.item);
                  currentPageHeight += pendingHeading.height;
                  sectionInserted = true;
                }
                
                // Add experience heading to current page
                currentPageItems.push(expHeadingItem);
                currentPageHeight += expHeadingHeight;
              }
              
              // Process each bullet point individually
              if (Array.isArray(item.description)) {
                item.description.forEach(bulletText => {
                  const bulletItem = { 
                    type: "bullet", 
                    content: bulletText,
                    section: section.name
                  };
                  const bulletTemplate = getImpactTemplate(bulletItem);
                  const bulletHeight = measureHeight(bulletTemplate.toHTML(bulletText));
                  
                  // Check if bullet fits on current page
                  if (currentPageHeight + bulletHeight > containerHeight - padding) {
                    // Start a new page
                    currentPageItems = [];
                    currentPageHeight = 0;
                    newPages.push(currentPageItems);
                    
                    // Add bullet to new page
                    currentPageItems.push(bulletItem);
                    currentPageHeight += bulletHeight;
                  } else {
                    // Add bullet to current page
                    currentPageItems.push(bulletItem);
                    currentPageHeight += bulletHeight;
                  }
                });
              }
            } else if (section.name === "projects") {
              // Create project heading
              const projHeadingItem = { 
                type: "projectHeading", 
                content: item 
              };
              const projHeadingTemplate = getImpactTemplate(projHeadingItem);
              const projHeadingHeight = measureHeight(projHeadingTemplate.toHTML(item));
              
              // Calculate total height needed for this item
              const totalHeightNeeded = (sectionInserted ? 0 : pendingHeading.height) + projHeadingHeight;
              
              // Check if both section heading and project heading fit on current page
              if (currentPageHeight + totalHeightNeeded > (containerHeight - (padding+30))) {
                // Start a new page
                currentPageItems = [];
                currentPageHeight = 0;
                newPages.push(currentPageItems);
                
                // Add section heading if not already added
                if (!sectionInserted) {
                  currentPageItems.push(pendingHeading.item);
                  currentPageHeight += pendingHeading.height;
                  sectionInserted = true;
                }
                
                // Add project heading
                currentPageItems.push(projHeadingItem);
                currentPageHeight += projHeadingHeight;
              } else {
                // Add section heading if not already added
                if (!sectionInserted) {
                  currentPageItems.push(pendingHeading.item);
                  currentPageHeight += pendingHeading.height;
                  sectionInserted = true;
                }
                
                // Add project heading to current page
                currentPageItems.push(projHeadingItem);
                currentPageHeight += projHeadingHeight;
              }
              
              // Process each bullet point individually
              if (Array.isArray(item.description)) {
                item.description.forEach(bulletText => {
                  const bulletItem = { 
                    type: "bullet", 
                    content: bulletText,
                    section: section.name
                  };
                  const bulletTemplate = getImpactTemplate(bulletItem);
                  const bulletHeight = measureHeight(bulletTemplate.toHTML(bulletText));
                  
                  // Check if bullet fits on current page
                  if (currentPageHeight + bulletHeight > containerHeight - padding) {
                    // Start a new page
                    currentPageItems = [];
                    currentPageHeight = 0;
                    newPages.push(currentPageItems);
                    
                    // Add bullet to new page
                    currentPageItems.push(bulletItem);
                    currentPageHeight += bulletHeight;
                  } else {
                    // Add bullet to current page
                    currentPageItems.push(bulletItem);
                    currentPageHeight += bulletHeight;
                  }
                });
              }
            } else if (section.name === "education" || section.name === "achievements" || section.name === "certifications") {
              // Create item
              const sectionItem = { type: "item", section: section.name, item };
              const sectionTemplate = getImpactTemplate(sectionItem);
              const sectionHeight = measureHeight(sectionTemplate.toHTML(item));
              
              // Calculate total height needed for this item
              const totalHeightNeeded = (sectionInserted ? 0 : pendingHeading.height) + sectionHeight;
              
              // Check if both section heading and item fit on current page
              if (currentPageHeight + totalHeightNeeded > containerHeight - padding) {
                // Start a new page
                currentPageItems = [];
                currentPageHeight = 0;
                newPages.push(currentPageItems);
                
                // Add section heading if not already added
                if (!sectionInserted) {
                  currentPageItems.push(pendingHeading.item);
                  currentPageHeight += pendingHeading.height;
                  sectionInserted = true;
                }
                
                // Add section item
                currentPageItems.push(sectionItem);
                currentPageHeight += sectionHeight;
              } else {
                // Add section heading if not already added
                if (!sectionInserted) {
                  currentPageItems.push(pendingHeading.item);
                  currentPageHeight += pendingHeading.height;
                  sectionInserted = true;
                }
                
                // Add section item to current page
                currentPageItems.push(sectionItem);
                currentPageHeight += sectionHeight;
              }
            }
          });
          
          // Clear pending heading since it's either been used or the section had no items
          pendingHeading = null;
        }
      });
  
      setPages(newPages);
    }
  }, [
    personalInfo,
    skills,
    updatedExperience,
    education,
    updatedProjects,
    achievements,
    certifications,
  ]);

  return (
    <div className="flex flex-col items-center justify-around hide-scrollbar h-full">
      <div className="relative resume-container h-[70vh] w-[80vw] lap:h-[90%] lap:w-[80%] lap:w-[80%]"></div>
        <div
           ref={containerRef}
           className={`resume-template-2 p-4 box-border h-[1100px] w-[796px] bg-white shadow-lg rounded-lg mb-10 absolute top-[-9999px] opacity-100`}
           >
          {renderNewImpact(pages,currentPage)}
          </div>
         <PageDots
        currentPage={currentPage} 
        pages={pages} 
        onPageChange={setCurrentPage} 
        />
      <PaginationEl 
        currentTemplate={template}
      />
    </div>
  );
}
    