import { customFetch } from "./apiWrapper";

// LiveKit Voice Interview Functions
export const startVoiceInterview = async (resume_id, job_description) => {
  try {
    const response = await customFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/voice-interview/start-voice-interview`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        resume_id,
        job_description
      })
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      console.error('Failed to start voice interview:', response.statusText);
      return null;
    }
  } catch (error) {
    console.error('Error starting voice interview:', error);
    return null;
  }
};

// LiveKit Voice Interview Functions
export const startInterview = async (resume_id, job_description) => {
  try {
    const response = await customFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/interview/start_interview`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        resume_id,
        job_description
      })
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      console.error('Failed to start voice interview:', response.statusText);
      return null;
    }
  } catch (error) {
    console.error('Error starting voice interview:', error);
    return null;
  }
};

export const endVoiceInterview = async (session_id) => {
  try {
    const response = await customFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/voice-interview/end-voice-interview`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ session_id })
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      console.error('Failed to end voice interview:', response.statusText);
      return null;
    }
  } catch (error) {
    console.error('Error ending voice interview:', error);
    return null;
  }
};

export const getVoiceInterviewStatus = async (session_id) => {
  try {
    const response = await customFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/voice-interview/voice-interview-status/${session_id}`, {
      method: 'GET',
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      console.error('Failed to get voice interview status:', response.statusText);
      return null;
    }
  } catch (error) {
    console.error('Error getting voice interview status:', error);
    return null;
  }
};

export const getSesionId = async(file)=>{
    const formData = new FormData();
    formData.append('file', file);

  try {
    const response = await customFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/interview/upload_resume`, {
      method: 'POST',
      body: formData,
                
    });

    if (response.ok) {
      const data = await response.json();
      return data.session_id;
    } else {
      console.error('Failed to upload file:', response.statusText);
    }
    return null;
  } catch (error) {
    console.error('Error uploading file:', error);
  }
}

export const getSesionIdViaJson = async (id) => {
  const jsonBody = {
    "resume_id" : id,
  }
  try {
    const response = await customFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/interview/get_session_id`, {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(jsonBody)
    });

    // if (response.ok) {
    //   const data = await response.json();
    //   console.log(data);
    //   return data.session_id;
    // } else {
    //   console.error('Failed to get session ID:', response.statusText);
    // }
    // return null;
    return response;
  } catch (error) {
    console.error('Error getting session ID:', error);
  }
};

// Voice Interview Session Creation (Alternative to getSesionIdViaJson)
export const createVoiceInterviewSession = async (resume_id, job_description) => {
  try {
    const response = await startVoiceInterview(resume_id, job_description);

    if (response && response.success) {
      return {
        success: true,
        session_id: response.session_id,
        isVoiceInterview: true,
        ...response
      };
    } else {
      console.error('Failed to create voice interview session');
      return null;
    }
  } catch (error) {
    console.error('Error creating voice interview session:', error);
    return null;
  }
};


export const getInterview = async (sessionId, JD) => { 
  try {
    const jsonBody = { "session_id":sessionId, "job_description": JD }; // Corrected JSON body
    const response = await customFetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/interview/start_interview`, 
      {
        method: 'POST',
        credentials: 'include',
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify(jsonBody)
      }
    );
    return response;
  } catch (error) {
    console.error("Error starting the interview:", error); // Fixed error handling
  }
};

export const speechToText = async(audioBlob) => {
  const formData = new FormData();
  formData.append('file', audioBlob, 'recording.wav');
  try {
      const response = await customFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/interview/stt`, {
          method: 'POST',
          body: formData
      });
      const data = await response.json(); 
      return data.message;
  } catch (error) {
      console.error('Error sending audio:', error);
  }
}

export const tts = async(text) => {
  try {
      const jsonBody = { "text": text }
      const response = await customFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/interview/tts`, {
          method: 'POST',
          headers: { 
              "Content-Type": "application/json",
          },
          body: JSON.stringify(jsonBody)
      });
      const audioBlob = await response.blob();
      return audioBlob;
  } catch (error) {
      console.error('Error sending audio:', error);
  }
}

export const getNextQuestion = async(answer, session_id) => {
  try {
      const jsonBody = {
          "session_id": session_id,
          "answer": answer
      };
      const response = await customFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/interview/next_question`, {
          method: 'POST',
          headers: { 
              "Content-Type": "application/json",
          },
          body: JSON.stringify(jsonBody)
      });
      const data = await response.json();
      return data;
  } catch (error) {
      console.error('Error customFetching:', error);
  }
}

export const endInterview = async(session_id) => {
  try {
      const jsonBody = {
          "session_id": session_id
      };
      const response = await customFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/interview/end_interview`, {
          method: 'POST',
          headers: { 
              "Content-Type": "application/json",
          },
          body: JSON.stringify(jsonBody)
      });
      const data = await response.json();
      return data;
  } catch (error) {
      console.error('Error customFetching:', error);
  }
}

export const getInterviewDetails = async(session_id) => {
  try {
      const response = await customFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/interview/${session_id}`, {
          method: 'GET',
      });
      const data = await response.json();
      return data;
  } catch (error) {
      console.error('Error customFetching:', error);
  }
}

export const getInterviewHistory = async() => {
  try {
      const response = await customFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/interview/all-interviews/history`, {
          method: 'GET',
      });
      const data = await response.json();
      return data;
  } catch (error) {
      console.error('Error customFetching:', error);
  }
}

export const deleteInterviewFromDB = async (interview_id) => {
  try {
    const response = await customFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/interview/delete/${interview_id}`, {
      method: 'DELETE',
                
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response;
  } catch (error) {
    console.error('Error deleting interview:', error);
    throw error;
  }
};