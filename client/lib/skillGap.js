import { customFetch } from "./apiWrapper";

export const createSkillGap = async (resumeId) => {
    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL}/api/skillgap`;
  
      const response = await customFetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resume_id: resumeId,
        }),
      });
  
        return response;
    } catch (error) {
      console.error('Error customFetching skill gap:', error);
      throw error;
    }
  };

  export const generateRoadmapFromReport = async (resumeId, skills) => {
    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL}/api/skillgap/generate-roadmap`;
  
      const response = await customFetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resume_id: resumeId,
          skills: skills
        }),
      });
  
      return response;
    } catch (error) {
      console.error('Error generating roadmap:', error);
      throw error;
    }
  };
  
  

export const getSkillGap = async (skillGapId) => {
  try {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/api/skillgap/${skillGapId}`;

    const response = await customFetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error customFetching skill gap:', error);
    throw error;
  }
};