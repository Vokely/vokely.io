// components/EssentialsSection.jsx
import { useState } from 'react';
import { MainSection } from './MainSection';
import { SubSection } from './SubSection';
import { resumeEssentialsSections } from '@/data/ats-sections';
import { useATSStore } from '@/store/atsStore';

export const EssentialsSection = () => {
  const [openSubSections, setOpenSubSections] = useState({});
  const { essentials } = useATSStore();
  
  const toggleSubSection = (subSectionId) => {
    setOpenSubSections(prev => ({
      ...prev,
      [subSectionId]: !prev[subSectionId]
    }));
  };

  // Helper function to determine status based on boolean or validation
  const getItemStatus = (hasItem, isValid = true) => {
    if (hasItem && isValid) return 'complete';
    if (hasItem && !isValid) return 'warning';
    return 'missing';
  };

  // Helper function to get hyperlink status
  const getHyperlinkStatus = (hyperlink) => {
    if (hyperlink.is_valid === 'Valid' && hyperlink.is_clickable) return 'complete';
    if (hyperlink.is_valid === 'Valid' && !hyperlink.is_clickable) return 'warning';
    return 'missing';
  };

  // Edit resumeEssentialsSections with essentials data
  const getUpdatedSections = () => {
    if (!essentials) {
      // Return original sections if no essentials data
      return resumeEssentialsSections;
    }

    // Clone the original sections to avoid mutation, but preserve React components
    const updatedSections = resumeEssentialsSections.map(section => ({
      ...section,
      gridItems: [...section.gridItems] // Clone grid items array
    }));

    updatedSections.forEach(section => {
      switch (section.id) {
        case 'profile-contact':
          if (essentials.profile_contact) {
            const profileContact = essentials.profile_contact;
            
            // Update description with actual notes or generate based on data
            if (profileContact.notes) {
              section.description = profileContact.notes;
            }

            // Update grid items with actual status
            section.gridItems = section.gridItems.map(item => {
              switch (item.label.toLowerCase()) {
                case 'name':
                  return { ...item, status: getItemStatus(profileContact.has_name) };
                case 'number':
                case 'phone':
                  return { ...item, status: getItemStatus(profileContact.has_phone) };
                case 'email-id':
                case 'email':
                  return { ...item, status: getItemStatus(profileContact.has_email) };
                default:
                  return item;
              }
            });

            // Update bottom description based on completion
            const completedItems = section.gridItems.filter(item => item.status === 'complete').length;
            const totalItems = section.gridItems.length;
            
            if (completedItems === totalItems) {
              section.bottomDescription = 'Perfect! All contact information is present and ready for ATS scanning.';
            } else {
              section.bottomDescription = `${completedItems}/${totalItems} contact fields complete. Let's fill in the missing pieces.`;
            }
          }
          break;

        case 'mandatory':
          if (essentials.mandatory_sections) {
            const mandatorySections = essentials.mandatory_sections;
            
            section.gridItems = section.gridItems.map(item => {
              const sectionKey = item.label.toLowerCase().replace(' ', '_');
              const sectionData = mandatorySections[sectionKey];
              
              if (sectionData) {
                return { ...item, status: getItemStatus(sectionData.has_section) };
              }
              return item;
            });

            // Generate description based on missing sections
            const missingSections = Object.entries(mandatorySections)
              .filter(([_, sectionData]) => !sectionData.has_section)
              .map(([key, _]) => key.charAt(0).toUpperCase() + key.slice(1).replace('_', ' '));
            
            const completedCount = Object.values(mandatorySections).filter(s => s.has_section).length;
            const totalCount = Object.keys(mandatorySections).length;

            if (missingSections.length === 0) {
              section.description = 'Excellent! All mandatory sections are present. Your resume has solid structure.';
            } else {
              section.description = `Your resume includes ${completedCount}/${totalCount} mandatory sections.`;
            }

            // Update bottom description
            if (missingSections.length === 0) {
              section.bottomDescription = 'Your resume structure is complete and ATS-friendly!';
            } else {
              section.bottomDescription = `${missingSections.length} section${missingSections.length > 1 ? 's' : ''} need attention. We'll help you add them seamlessly.`;
            }
          }
          break;

        case 'hyperlinks':
          if (essentials.hyperlinks && essentials.hyperlinks.length > 0) {
            const hyperlinks = essentials.hyperlinks;
            
            // Update grid items with actual hyperlink data
            section.gridItems = section.gridItems.map(item => {
              const hyperlink = hyperlinks.find(link => 
                link.name.toLowerCase() === item.label.toLowerCase()
              );
              
              if (hyperlink) {
                return { ...item, status: getHyperlinkStatus(hyperlink) };
              }
              return { ...item, status: 'missing' };
            });

            // Add any additional hyperlinks from essentials that aren't in the original grid
            hyperlinks.forEach(hyperlink => {
              const exists = section.gridItems.some(item => 
                item.label.toLowerCase() === hyperlink.name.toLowerCase()
              );
              
              if (!exists) {
                section.gridItems.push({
                  label: hyperlink.name,
                  status: getHyperlinkStatus(hyperlink)
                });
              }
            });

            // Generate description based on hyperlinks status
            const validLinks = hyperlinks.filter(link => link.is_valid === 'Valid').length;
            const clickableLinks = hyperlinks.filter(link => link.is_clickable).length;
            const totalLinks = hyperlinks.length;

            if (validLinks === totalLinks && clickableLinks === totalLinks) {
              section.description = `Perfect! Found ${totalLinks} valid and clickable link${totalLinks > 1 ? 's' : ''}.`;
            } else if (validLinks === totalLinks) {
              section.description = `Found ${validLinks} valid link${validLinks > 1 ? 's' : ''}, but ${validLinks - clickableLinks} ${validLinks - clickableLinks === 1 ? 'is' : 'are'} not clickable.`;
            } else {
              section.description = `Found ${totalLinks} link${totalLinks > 1 ? 's' : ''}: ${validLinks} valid, ${clickableLinks} clickable.`;
            }

            // Update bottom description
            if (clickableLinks === totalLinks && validLinks === totalLinks) {
              section.bottomDescription = 'All links are working perfectly and will boost your resume\'s effectiveness!';
            } else {
              section.bottomDescription = 'Let\'s make sure all your links are valid and clickable for maximum impact.';
            }
          }
          break;
      }
    });

    return updatedSections;
  };

  const sectionsToRender = getUpdatedSections();

  return (
    <>
      <MainSection title="Resume Essentials" />
      {(sectionsToRender && sectionsToRender.length > 0) && sectionsToRender.map((sectionData) => (
        <SubSection
          key={sectionData.id}
          sectionData={sectionData}
          isOpen={!!openSubSections[sectionData.id]}
          onToggle={() => toggleSubSection(sectionData.id)}
        />
      ))}
    </>
  );
};