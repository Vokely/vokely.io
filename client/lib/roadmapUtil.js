import { customFetch } from "./apiWrapper";

/**
 * Generate a skill roadmap from the API
 * @param {string} skill - The skill to generate a roadmap for (e.g. "React.js")
 * @returns {Promise} - The API response with the generated roadmap
 */
export const generateRoadmap = async (skill) => {
    try {
      const response = await customFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/roadmap/generate`, {
        method: 'POST',
        body: JSON.stringify({ skill }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      return response;
    } catch (error) {
      console.error('Error generating roadmap:', error);
      throw error;
    }
};

/**
 * Fetch a roadmap by its ID from the API
 * @param {string} roadmapId - The MongoDB ObjectId of the roadmap
 * @returns {Promise} - The API response with the roadmap data
 */
export const getRoadmapById = async (roadmapId) => {
  try {
    const response = await customFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/roadmap/${roadmapId}`, {
      method: 'GET',
      headers: {
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to customFetch roadmap: ${response.statusText}`);
    }

    return response;
  } catch (error) {
    console.error('Error customFetching roadmap by ID:', error);
    throw error;
  }
};

/**
 * Generate roadmap links using roadmap ID and heading
 * @param {string} id - The MongoDB ObjectId of the roadmap
 * @param {string} heading - The heading of the roadmap section
 * @returns {Promise} - The API response with generated links
 */
export const generateRoadmapLinks = async (id, heading) => {
  try {
    const response = await customFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/roadmap/generate-links`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ id, heading })
    });

  return response;
  } catch (error) {
    console.error('Error generating roadmap links:', error);
    throw error;
  }
};

/**
 * Update the status of a roadmap heading or subheading
 * @param {string} roadmapId - The ID of the roadmap (MongoDB ObjectId)
 * @param {string} heading - The heading of the roadmap item
 * @param {string|null} subheading - The optional subheading to update
 * @param {string} newStatus - The new status to set (e.g., "not_started", "in_progress", "completed")
 * @param {string} type - The type of update: "task" or "content"
 * @returns {Promise<Response>} - The API response
 */
export const updateRoadmapStatus = async (roadmapId, heading, subheading, newStatus, type) => { 
  try {
    const response = await customFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/roadmap/${roadmapId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        heading,
        subheading: subheading || null,
        new_status: newStatus,
        type // should be either "task" or "content"
      })
    });

    return response;
  } catch (error) {
    console.error('Error updating roadmap status:', error);
    throw error;
  }
};

/**
 * Update the streak for a given roadmap
 * @param {string} roadmapId - The ID of the roadmap (MongoDB ObjectId)
 * @returns {Promise<Response>} - The API response
 */
export const updateRoadmapStreak = async (roadmapId) => {
  try {
    const response = await customFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/roadmap/${roadmapId}/update-streak`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return response;
  } catch (error) {
    console.error('Error updating roadmap streak:', error);
    throw error;
  }
};

/**
 * Fetch all roadmaps for the authenticated user
 * @returns {Promise<object[]>} - The array of roadmaps
 */
export const getAllRoadmapsOfUser = async () => {
  try {
    const response = await customFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/roadmap/all/roadmaps`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Error customFetching roadmaps: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to customFetch user roadmaps:', error);
    throw error;
  }
};

export const deleteRoadmap = async (roadmapId) =>{
  try {
    const response = await customFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/roadmap/${roadmapId}`, {
      method: 'DELETE'
    });

    return response;
  } catch (error) {
    console.error('Error deleting roadmap:', error.message);
    throw error;
  }
}


export const calculateStats = (roadmap) =>{
      let allTasks = 0;
      let completedTasks = 0;
      let allSubHeadings = 0;
      let completedSubHeadings = 0;
        
      roadmap.forEach((section) => {     
        // Count the main heading task
        allTasks++;
        if (section.heading_task_status === 'completed') {
          completedTasks++;
        }

        // Count subheading tasks
        if (Array.isArray(section.sub_headings)) {
          allTasks += section.sub_headings.length;
          allSubHeadings += section.sub_headings.length;
          completedTasks += section.sub_headings.filter(
            (sub) => sub.sub_heading_task_status === 'completed'
          ).length;
          completedSubHeadings += section.sub_headings.filter(
            (sub) => sub.sub_heading_status === 'completed'
          ).length;
        }
      });    
      const completionPercentage =
        allTasks > 0 ? Math.round((completedTasks / allTasks) * 100) : 0;

      const subHeadingCompletionPercentage =
        allSubHeadings > 0 ? Math.round((completedSubHeadings / allSubHeadings) * 100) : 0;
      
      let totalCompletionPercentage = Math.round((completionPercentage + subHeadingCompletionPercentage) / 2);
      totalCompletionPercentage = totalCompletionPercentage > 100 ? 100 : totalCompletionPercentage;
      totalCompletionPercentage = totalCompletionPercentage < 0 ? 0 : totalCompletionPercentage;
      return {
        allTasks,
        completedTasks,
        totalCompletionPercentage,
      };
  }  
  
 export const getSkillStatus = (heading)=>{
    if(!heading)  return;
    if(heading.sub_headings.every((s) => s.sub_heading_status === 'completed') && heading.heading_task_status === 'completed'){
      return 'completed';
    }
    else if(heading.sub_headings.some((s) => s.sub_heading_status === 'in_progress' || s.sub_heading_status === "completed" || heading.heading_task_status === 'in_progress')){
      return 'in_progress';
    }
    else{
      return 'not_started';
    }
  }