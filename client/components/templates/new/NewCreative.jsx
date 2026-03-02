import React, { useEffect, useRef, useState, useMemo } from 'react';
import { getCreativeTemplate } from '@/data/templates/creative';
import PageDots from '@/components/editor/PageDots';
import PaginationEl from '@/components/editor/Pagination';
import { textToList } from "@/lib/resumeUtils";
import useProfileStore from '@/store/profileStore';

export const renderCreativePage = (pageContent) => {
  if (!pageContent) return null;

  const { header, leftColumn, rightColumn } = pageContent;

  return (
    <div className="bg-sky-50 h-full flex flex-col overflow-hidden">
     <div className='bg-gradient-to-r from-sky-500 to-sky-700 h-fit'>
      {header &&
        header.map((item, index) => {
          const template = getCreativeTemplate(item);
          return (
            <React.Fragment key={index}>
              {template?.render(item.content)}
            </React.Fragment>
          );
        })}
     </div>

      <div className={`flex-1`}>
        <div className="grid grid-cols-3 h-full">
          {/* Left Column */}
          <div className={`space-y-2 bg-gradient-to-r from-sky-200 to-sky-100 p-2`}>
            {leftColumn && leftColumn.map((item, index) => {
              const template = getCreativeTemplate(item);
              return (
                <React.Fragment key={index}>
                  {template?.render(item.content)}
                </React.Fragment>
              )
            })}
          </div>

          {/* Right Column */}
          <div className="col-span-2 space-y-1 p-2 h-full">
            {rightColumn && rightColumn.map((item, index) => {
              const template = getCreativeTemplate(item);
              return (
                <React.Fragment key={index}>
                  {template?.render(item.content)}
                </React.Fragment>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function ({ data,updatePersonal, template, pages, setPages,currentPage, setCurrentPage,remainingHeights, setRemainingHeights }) {
  const containerRef = useRef(null);
  const [pageHeights, setPageHeights] = useState([]); 
  const { personalInfo, skills, experience, education, projects, achievements,certifications } = data;
  const [imageTimestamp, setImageTimestamp] = useState(Date.now());
  const {hasUntrackedChanges,resetUntrackedChanges} = useProfileStore()
  // Function to create cache-busted image URL
  const getImageUrl = (url) => {
    if (!url) return "";
    // Add timestamp as query parameter to prevent caching
    return `${url}?t=${imageTimestamp}`;
  };
  if(hasUntrackedChanges){
    updatePersonal(updatePersonal("profileImage", getImageUrl(personalInfo.profileImage)))
    resetUntrackedChanges()
  }
  // useEffect(()=>  updatePersonal("profileImage", getImageUrl(personalInfo.profileImage)),[hasUntrackedChanges])
  // Add useMemo for processing experience and projects
  const updatedExperience = useMemo(() => 
    data.experience.map(exp => ({
      ...exp,
      description: Array.isArray(exp.description) ? exp.description : textToList(exp.description)
    })), 
    [data.experience]
  );
  
  const updatedProjects = useMemo(() => 
    data.projects.map(proj => ({
      ...proj,
      description: Array.isArray(proj.description) ? proj.description : textToList(proj.description)
    })), 
    [data.projects]
  );

  useEffect(() => {
    if (containerRef.current) {
      const container = containerRef.current;
      const containerHeight = 1100;
      const padding = 20;

      const measureHeight = (content, isLeftColumn = false, isHeading = false, isSubHeading = false) => {
        const tempElement = document.createElement('div');
        tempElement.style.position = 'absolute';
        tempElement.style.visibility = 'hidden';
        const containerWidth = containerRef.current.clientWidth;
        const maxWidth = Math.min(800, containerWidth - 64); 
        
        const leftColumnWidth = Math.floor(maxWidth / 3) + maxWidth%3 ;
        const rightColumnWidth = maxWidth-leftColumnWidth;
        tempElement.style.width = `${isLeftColumn ? leftColumnWidth : rightColumnWidth}px`;
        tempElement.innerHTML = content;

        if (isLeftColumn) {
          tempElement.className = 'flex ';
        }
        container.appendChild(tempElement);
        let height = tempElement.clientHeight;
        container.removeChild(tempElement);
        
        if (isHeading) {
          height += 50;
        } else if (isSubHeading) {
          height += 30; // Add smaller padding for subheadings
        }
        
        return height;
      };

      // Initialize first page with header
      const firstPage = {
        header: [
          { type: 'header', content: { personalInfo: data.personalInfo, userImage: data.userImage } }
        ],
        leftColumn: [],
        rightColumn: []
      };

      // Calculate header height
      const headerTemplate = getCreativeTemplate(firstPage.header[0]);
      const headerHeight = headerTemplate ? 
        measureHeight(headerTemplate.toHTML(firstPage.header[0].content),false,true) : 0;

      // Define sections for left and right columns with empty checks
      const leftSections = [
        { 
          name: 'skills', 
          items: data.skills && Object.keys(data.skills).length > 0 ? [
            { type: 'skills', content: data.skills }
          ] : []
        },
        { 
          name: 'education', 
          items: data.education && data.education.length > 0 ? [
            { type: 'heading', content: 'Education' },
            ...data.education.map(edu => ({ 
              type: 'educationItem',
              content: edu 
            }))
          ] : []
        },
        { 
          name: 'languages', 
          items: data.languages && data.languages.length > 0 ? 
            [{ type: 'languages', content: data.languages }] : [] 
        },
        { 
          name: 'hobbies', 
          items: data.hobbies && data.hobbies.length > 0 ? 
            [{ type: 'hobbies', content: data.hobbies }] : [] 
        }
      ].filter(section => section.items.length > 0);
      // Define sections with headings for right column
      const sections = [
        { 
          name: 'experience', 
          heading: 'Experience', 
          items: updatedExperience 
        },
        { 
          name: 'projects', 
          heading: 'Projects', 
          items: updatedProjects 
        },
        { 
          name: 'certifications', 
          heading: 'Certifications', 
          items: data.certifications 
        },
        { 
          name: 'achievements', 
          heading: 'Achievements', 
          items: data.achievements 
        }
      ];

      // Process sections for right column
      const rightSections = [];
      sections.forEach(section => {
        if (section.items && section.items.length > 0) {
          const headingItem = { type: 'heading', content: section.heading };
          
          if (section.name === 'projects') {
            const processedItems = [];
            section.items.forEach(item => {
              processedItems.push(
                { type: 'projectTitle', content: item },
                ...item.description.map(bullet => ({
                  type: 'bullet',
                  content: bullet
                }))
              );
            });
            
            rightSections.push({
              name: section.name,
              items: [headingItem, ...processedItems]
            });
          } 
          else if (section.name === 'experience') {
            const processedItems = [];
            section.items.forEach(item => {
              processedItems.push(
                { type: 'experienceTitle', content: item },
                ...item.description.map(bullet => ({
                  type: 'bullet',
                  content: bullet
                }))
              );
            });
            
            rightSections.push({
              name: section.name,
              items: [headingItem, ...processedItems]
            });
          } 
          else {
            rightSections.push({
              name: section.name,
              items: [
                headingItem,
                ...section.items.map(item => ({
                  type: section.name,
                  content: item
                }))
              ]
            });
          }
        }
      });


      let currentPage = { ...firstPage };
      const newPages = [];
      let isFirstPage = true;
      let leftHeight = 0;
      let rightHeight = 0;
      let currentPageAvailableHeight = 0;
      const newPageHeights = [];

      // Process sections for both columns
      let leftSectionIndex = 0;
      let rightSectionIndex = 0;
      let leftItemIndex = 0;
      let rightItemIndex = 0;
      let currentBulletPoints = [];
      let currentItemWithBullets = null;

      const addToColumn = (item, isLeft, itemHeight) => {
        const currentHeight = isLeft ? leftHeight : rightHeight;
        const availableHeight = currentPageAvailableHeight;
        const remainingHeight = availableHeight - currentHeight;

        // Check if there's space in the previous page
        if (newPages.length > 0 && newPageHeights.length > 0) {
          const prevPageHeights = newPageHeights[newPageHeights.length - 1];
          const prevPage = newPages[newPages.length - 1];
          
          // If there's enough space in the previous page's corresponding column
          if (isLeft && prevPageHeights.left >= itemHeight) {
            prevPage.leftColumn.push(item);
            newPageHeights[newPageHeights.length - 1].left -= itemHeight;
            return true;
          } else if (!isLeft && prevPageHeights.right >= itemHeight) {
            prevPage.rightColumn.push(item);
            newPageHeights[newPageHeights.length - 1].right -= itemHeight;
            return true;
          }
        }

        // If there's enough remaining height in the current page
        if (itemHeight <= remainingHeight) {
          if (isLeft) {
            currentPage.leftColumn.push(item);
            leftHeight += itemHeight;
          } else {
            currentPage.rightColumn.push(item);
            rightHeight += itemHeight;
          }
          return true;
        }

        // Start a new page if we can't fit in current or previous pages
        if (currentPage.leftColumn.length > 0 || currentPage.rightColumn.length > 0) {
          // Save remaining heights for the current page before creating new one
          newPageHeights.push({
            left: Math.max(0, currentPageAvailableHeight - leftHeight),
            right: Math.max(0, currentPageAvailableHeight - rightHeight)
          });
          newPages.push(currentPage);
          currentPage = { leftColumn: [], rightColumn: [] };
          leftHeight = isLeft ? itemHeight : 0;
          rightHeight = isLeft ? 0 : itemHeight;
          isFirstPage = false;
          
          if (isLeft) {
            currentPage.leftColumn.push(item);
          } else {
            currentPage.rightColumn.push(item);
          }
        }

        return true;
      };

      while (leftSectionIndex < leftSections.length || rightSectionIndex < rightSections.length) {
        currentPageAvailableHeight = isFirstPage ? 
          containerHeight - headerHeight - padding : 
          containerHeight - padding;

        // Process left column
        if (leftSectionIndex < leftSections.length) {
          const currentLeftSection = leftSections[leftSectionIndex];
          while (leftItemIndex < currentLeftSection.items.length) {
            const leftItem = currentLeftSection.items[leftItemIndex];
            const leftTemplate = getCreativeTemplate(leftItem);
            if (leftTemplate) {
              const isHeading = leftItem.type === 'heading';
              const isSubHeading = leftItem.type === 'subHeading';
              const itemHeight = measureHeight(
                leftTemplate.toHTML(leftItem.content), 
                true, 
                isHeading,
                isSubHeading
              );
              if (addToColumn(leftItem, true, itemHeight)) {
                leftItemIndex++;
              }
            }
          }

          if (leftItemIndex >= currentLeftSection.items.length) {
            leftSectionIndex++;
            leftItemIndex = 0;
          }
        }

        // Process right column
        if (rightSectionIndex < rightSections.length) {
          const currentRightSection = rightSections[rightSectionIndex];
          
          while (rightItemIndex < currentRightSection.items.length) {
            const rightItem = currentRightSection.items[rightItemIndex];
            if ((rightItem.type === 'experience' || rightItem.type === 'projects') && rightItem.bulletPoints) {
              if (!currentItemWithBullets) {
                currentItemWithBullets = { ...rightItem };
                currentBulletPoints = [...rightItem.bulletPoints];
              }

              while (currentBulletPoints.length > 0) {
                const bulletPoint = currentBulletPoints[0];
                const itemWithBullet = {
                  ...currentItemWithBullets,
                  content: {
                    ...currentItemWithBullets.content,
                    description: [...currentItemWithBullets.content.description, bulletPoint]
                  }
                };

                const rightTemplate = getCreativeTemplate(itemWithBullet);
                const itemHeight = measureHeight(rightTemplate.toHTML(itemWithBullet.content));

                if (addToColumn(itemWithBullet, false, itemHeight)) {
                  currentBulletPoints.shift();
                  if (currentBulletPoints.length === 0) {
                    currentItemWithBullets = null;
                    rightItemIndex++;
                  }
                } else {
                  break;
                }
              }
            } else {
              const rightTemplate = getCreativeTemplate(rightItem);
              if (rightTemplate) {
                const itemHeight = measureHeight(rightTemplate.toHTML(rightItem.content));
                if (addToColumn(rightItem, false, itemHeight)) {
                  rightItemIndex++;
                }
              }
            }
          }

          if (rightItemIndex >= currentRightSection.items.length) {
            rightSectionIndex++;
            rightItemIndex = 0;
          }
        }
      }

      // Add the last page if it has content
      if (currentPage.leftColumn.length > 0 || currentPage.rightColumn.length > 0) {
        newPageHeights.push({
          left: Math.max(0, currentPageAvailableHeight - leftHeight),
          right: Math.max(0, currentPageAvailableHeight - rightHeight)
        });
        newPages.push(currentPage);
      }
      
      setPages(newPages);
      setPageHeights(newPageHeights);
      // Update remaining heights for current page
      if (newPageHeights[currentPage]) {
        setRemainingHeights(newPageHeights[currentPage]);
      }
    }
  }, [personalInfo, skills, experience, education, projects, achievements,certifications]);

  // Add effect to update remainingHeights when page changes
  useEffect(() => {
    if (pageHeights[currentPage]) {
      setRemainingHeights(pageHeights[currentPage]);
    }
  }, [currentPage]);

  return (
    <div className="flex flex-col items-center justify-around hide-scrollbar h-full">
      <div className="relative resume-container h-[70vh] w-[80vw] lap:h-[90%] lap:w-[80%] lap:w-[70%]"></div>
      <div
        ref={containerRef}
        className={`resume-template-2 overflow-hidden box-border h-[1100px] w-[796px] bg-white shadow-lg rounded-lg  absolute top-[-9999px] opacity-100`}
        >
        {renderCreativePage(pages[currentPage])}
      </div>
      
      <PageDots
        currentPage={currentPage}
        pages={pages}
        onPageChange={setCurrentPage}
      />
      <PaginationEl currentTemplate={template} />
    </div>
  );
} 