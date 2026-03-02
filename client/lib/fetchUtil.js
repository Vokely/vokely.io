import { customFetch } from "./apiWrapper";

export default async function generateResume(prompt, data, JD, resumeId) {
  // Construct the JSON payload
  let payload = {
    resume_details: {
      summary: data.personalInfo.summary,
      skills: data.skills,
      projects: data.projects.map((project) => ({
        name: project.name,
        duration: `${project.startDate}-${project.endDate}`,
        description: project.description,
      })),
      internship: [],
      experience: data.experience.map((exp) => ({
        role: exp.title,
        company: exp.company,
        location: exp.location,
        duration: `${exp.startDate}-${exp.endDate}`,
        description: exp.description,
      })),
      achievements: data.achievements,
    },
    job_details: {
      job_description: JD,
    },
    resumeId,
  };

  try {
    let URL = 'api/generate_resume';
    if (prompt !== null && prompt.length > 0) {
      URL = 'api/generate/custom_prompt';
      payload.prompt = prompt;
    }
    const FINAL_URL = `${process.env.NEXT_PUBLIC_API_URL}/${URL}`;
    const response = await customFetch(FINAL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    return response;
  } catch (error) {
    console.error('Error generating resume:', error);
    throw error;
  }
}

export const getCurrentUser = async(token)=> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/me`, {
      method: 'GET',
      headers:{
        'Authorization' : `Bearer ${token}`
      }
    });

    return response;
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
}

export const sendFileToAPI = async (
  file,
) => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await customFetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/extract_resume`,
      {
        method: 'POST',
        body: formData,
      }
    );

    return response;
  } catch (error) {
    console.error('Error uploading file:', error);
  }
};

export const authorizeUser = async (user) => {
  try {
    const response = await customFetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/authenticate-user`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: user,
        credentials: 'include',
      }
    );
    return response;
  } catch (error) {
    console.error('Error authorizing user:', error);
  }
};

export const findUser = async (email) => {
  try {
    const response = await customFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/find`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }), 
    });

    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.error('Error finding user:', error);
  }
};

export const signIn = async (email, password) => {
  try {
    const requestBody = JSON.stringify({
      email,
      password,
      provider: "email",
    });

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: requestBody,
      credentials: 'include',
    });
    return response;
  } catch (error) {
    console.error('Error signing in:', error);
    return null;
  }
};

export const signUp = async (name, email, password) => {
  try {
    const requestBody = JSON.stringify({
      name,
      email,
      password,
      provider: "email",
    });

    const response = await customFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: requestBody, 
      credentials: 'include',
    });

    return response;
  } catch (error) {
    console.error('Error signing up:', error);
    return null;
  }
};

export const handleProfileUpload = async (formData,isProfileUpload, resumeId) => {
  try {
    if (resumeId!=null) {
      formData.append('resumeId', resumeId);
    }
    
    formData.append('isProfileUpload', isProfileUpload);
    
    const response = await customFetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/upload-profile`,
      {
        method: 'POST',
        body: formData,
      }
    );

    return response;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

export const getProfileDetails = async () => {
  try {
    const response = await customFetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/profile-details`,
      {
        method: 'GET',
      }
    );
    if (response.ok) {
      return await response.json();
    } else if (response.status === 401) {
      return null; 
    }
  } catch (error) {
    console.error('Error authorizing user:', error);
  }
};

export const getPlanDetails = async () => {
  try {
    const response = await customFetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/credit`,
      {
        method: 'GET',
      }
    );
    if (response.ok) {
      return await response.json();
    } else if (response.status === 401) {
      return null; 
    }
  } catch (error) {
    console.error('Error', error);
  }
}

export const deductCredit = async (credit) => {
    try {
      const response = await customFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/credit/deduct`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body:JSON.stringify({amount:credit})
        }
      );
      if (response.ok) {
        return await response.json();
      } else if (response.status === 401) {
        return null; 
      }
    } catch (error) {
      console.error('Error', error);
    }
};

export const updateProfileDetails = async (profile_details) => {
  try {
    const response = await customFetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/update-profile`,
      {
        method: 'PATCH',
        body: JSON.stringify(profile_details),
        headers: {
          "Content-Type": "application/json", 
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to update profile');
    }

    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    // throw error;
  }
};

export const updateUserDetails = async (user_details) => {
  try {
    const response = await customFetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/update-user`,
      {
        method: 'PATCH',
        body: JSON.stringify(user_details),
        headers: {
          "Content-Type": "application/json", 
        },
      }
    );

    return response;
  } catch (error) {
    console.error('Error:', error);
  }
};

export const submitContactForm = async (formData) => {
  try {
    const response = await customFetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/contact-us`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          subject: formData.subject,
          message: formData.message,
        }),
      }
    );

    return response;
  } catch (error) {
    console.error('Error submitting contact form:', error);
    throw error;
  }
}

export const getGeoLocation = async () => {
  try {
    const response = await customFetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/geo`,
      {
        method: 'GET',
      }
    );

    return response
  } catch (error) {
    console.error('Error fetching geo location:', error);
    throw error;
  }
};

export const getIPDetails = async () => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/public/geo`,
      {
        method: 'GET',
      }
    );

    return response
  } catch (error) {
    console.error('Error fetching geo location:', error);
    throw error;
  }
};