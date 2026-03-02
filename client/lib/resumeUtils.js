import { customFetch } from "./apiWrapper";

export function textToList(text) {
    if (typeof text !== 'string') {
        return []
    }
    return text
      .split('.')
      .map(line => line.trim())
      .filter(line => line.length > 0);
  }

export const getAllResumes = async()=>{
    try {
      const response = await customFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/resumes/all-resumes`,
        {
          method: 'GET',
        }
      );
  
      if (!response.ok) {
        throw new Error('Failed to customFetch resumes');
      }
      const result = await response.json()
      return result
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
}

export const createResume = async(resume_details)=>{
    try {
        const jsonbody = {
          "data" : resume_details,
          "name" : "Untitled-Resume"
        }
        const response = await customFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/resumes/create`,
        {
          method: 'POST',
          body : JSON.stringify(jsonbody),
          headers: {
            'Content-Type' : "application/json",
          },
        }
      );

      return response
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
}

export const updateResume = async (resumeId, JD=null, updatedData=null, resumeName=null) => {
  try {
    let jsonBody = {}
    if(resumeName!==null){
      jsonBody["name"] = resumeName
    }
    if(updatedData!==null){
      jsonBody["data"] = updatedData
    }
    if(JD!==null){
      jsonBody["job_description"] = JD;
    };
      const response = await customFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/resumes/save/${resumeId}`, {
          method: 'PATCH',
          body: JSON.stringify(jsonBody),
          headers: {
              'Content-Type': 'application/json',
          }
      });

      if (!response.ok) {
          throw new Error(`Failed to update resume: ${response.statusText}`);
      }

      const result = await response.json();
      return result;
  } catch (error) {
      console.error('Error updating resume:', error);
      throw error;
  }
};

export const deleteResume = async (resumeId) => {
  try {
      const response = await customFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/resumes/${resumeId}`, {
          method: 'DELETE',
          headers: {
              'Content-Type': 'application/json',
          }
      });

      const result = await response.json();
      return result;
  } catch (error) {
      console.error('Error updating resume:', error);
      throw error;
  }
};

export const getResumeDetails = async(resumeId)=>{
  try {
    const response = await customFetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/resumes/${resumeId}`,
      {
        method: 'GET',
      }
    );

    if (!response.ok) {
      console.error('Failed to customFetch resumes');
    }
    const result = await response.json()
    return result
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

export const updateGeneratedData = async (generated_data, resumeId) => {
  try {
      const response = await customFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/resumes/save/enhancedData/${resumeId}`, {
          method: 'PATCH',
          body: JSON.stringify(generated_data),
          headers: {
              'Content-Type': 'application/json',
          }
      });

      if (!response.ok) {
          throw new Error(`Failed to update resume: ${response.statusText}`);
      }

      const result = await response.json();
      return result;
  } catch (error) {
      console.error('Error updating resume:', error);
      throw error;
  }
}; 