import { customFetch } from "./apiWrapper";

export const checkResumeATS = async (file) => {
    try {
      if (!file) throw new Error("No file provided");

      const formData = new FormData();
      formData.append('file', file);
      console.log(file)
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/ats-checker`,
        {
          method: 'POST',
          body: formData,
          credentials: 'include',
        }
      );
  
      return response;
    } catch (error) {
      console.error('Error checking resume:', error);
    }
};

export async function analyzeJD(job_description, resume_id, report_id) {
  try {
    const response = await customFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ats-checker/analyze-jd`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ job_description, resume_id, report_id }),
    });

   return response;
  } catch (error) {
    console.error('Error analyzing JD:', error);
    throw error;
  }
}  

export const getATSReportDetails = async(result_id) =>{
  try {
    const response = await customFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ats-checker/results/${result_id}`, {
      method: 'GET'
    });
   return response;
   
  } catch (error) {
    console.error('Error analyzing JD:', error);
    throw error;
  }
}