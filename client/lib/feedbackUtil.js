import { customFetch } from "./apiWrapper"

export const createFeedback = async (feedbackData) => {
    try {
      const response = await customFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/beta-feedback`, {
        method: 'POST',
        body: JSON.stringify(feedbackData),
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error creating feedback:', error);
      throw error;
    }
  };
export const getAllFeedbacks = async () => {
    try {
      const response = await customFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/beta-feedback`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error creating feedback:', error);
      throw error;
    }
  };
  
  export const uploadFeedbackFile = async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
  
      const response = await customFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/beta-feedback/upload/feedback`, {
        method: 'POST',
        body: formData,
      });
  
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  };