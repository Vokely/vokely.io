import html2canvas from 'html2canvas';

export const renderHtmlToCanvas = async (htmlContent) => {
    try { 
      const scaleFactor = 2
      const canvas = await html2canvas(htmlContent, {
        scale: scaleFactor, 
        useCORS: true, 
        logging: true, 
        letterRendering: true, 
        allowTaint: true, 
        width: htmlContent.offsetWidth,  // Capture at high resolution
        height: htmlContent.offsetHeight, // Maintain aspect ratio
      });
  
      return canvas;
    } catch (error) {
      console.error("Error rendering HTML to canvas:", error);
      throw error; 
    }
};