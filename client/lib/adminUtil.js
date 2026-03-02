import { customFetch } from "./apiWrapper";

export const getAdminAccess = async()=>{
  try {
    const response = await customFetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/internal/check-access`,
      {
        method: 'GET',
      }
    );

    return response;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}
export const getBetaUseretails = async (status) => {
  try {
    let url = `${process.env.NEXT_PUBLIC_API_URL}/api/internal/beta/user-details`;
    if(status) {
      url += `?status=${encodeURIComponent(status)}`;
    }
    const response = await customFetch(url,{
        method: 'GET',
      }
    );

    return response;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};


export const udpateUserStatus = async(email,status)=>{
  const jsonBody = {
    "email":email,
    "status": status
  }
  try {
    const response = await customFetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/internal/beta/update-status`,
      {
        method: 'PATCH',
        body: JSON.stringify(jsonBody)
      }
    );

    return response;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

export const sendConfirmationEmails = async (selectedEmails) => {
  try {
    const response = await customFetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/internal/send-confirmation-emails`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ emails: selectedEmails }),
      }
    );

   return response;
  } catch (error) {
    console.error('Error sending emails:', error);
    throw error;
  }
};    

/*---------------------------------------------------FEEDBACKS MODULE-----------------------------------------------------------*/
/**
 * Get all feedback entries with optional filters
 * @param {string} priority - Optional priority filter ('low', 'medium', 'high')
 * @param {string} status - Optional status filter ('pending', 'approved')
 * @returns {Promise<Object>} The API response with feedback entries
 */
export const getAllFeedbacks = async (priority = null, status = null) => {
  try {
    let url = `${process.env.NEXT_PUBLIC_API_URL}/api/internal/all-feedbacks`;
    
    // Add query parameters if provided
    const params = new URLSearchParams();
    if (priority) {
      params.append('priority', priority);
    }
    if (status) {
      params.append('status', status);
    }
    
    // Append query parameters to URL if any exist
    const queryString = params.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
    
    const response = await customFetch(url, {
      method: 'GET',
    });

    if (!response.ok) {
      console.error('Server error:', response.status);
      try {
        const errorData = await response.json();
        console.error('Error details:', errorData);
      } catch (e) {
        console.error('Could not parse error response');
      }
    }

    return response;
  } catch (error) {
    console.error('Error fetching feedbacks:', error);
    throw error;
  }
};
/**
 * Updates the status of a feedback
 * @param {string} feedbackId - The ID of the feedback to update
 * @param {string} status - The new status (pending, approved, rejected)
 * @returns {Promise<Response>} - The fetch response
 */
export async function updateFeedbackStatus(feedbackId, status) {
  try {
    const response = await customFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/internal/feedback/${feedbackId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });
    
    return response;
  } catch (error) {
    console.error('Error updating feedback status:', error);
    throw error;
  }
}

/**
 * Update the priority of a feedback entry
 * @param {string} feedbackId - The ID of the feedback to update
 * @param {string} priority - The new priority ('low', 'medium', 'high')
 * @returns {Promise<Response>} The API response
 */
export const updateFeedbackPriority = async (feedbackId, priority) => {
  try {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/api/internal/feedback/${feedbackId}/priority`;
    
    const response = await customFetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ priority }),
    });

    return response;
  } catch (error) {
    console.error('Error updating feedback priority:', error);
    throw error;
  }
};


/**
 * Fetch the user's plan details by email.
 * @param {string} email - The email of the user whose plan needs to be retrieved.
 * @returns {Promise<Response>} The API response containing the user's plan details.
 */
export const getUserPlanByEmail = async (email) => {
  try {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/api/internal/user-plan?email=${encodeURIComponent(email)}`;

    const response = await customFetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return response;
  } catch (error) {
    console.error('Error fetching user plan:', error);
    throw error;
  }
};

/**
 * Upgrade the user's subscription plan.
 * @param {string} userId - The user's ID.
 * @param {string} expiryDate - The new plan expiry date (must be a future ISO datetime).
 * @param {object} planDetails - Object containing plan details (e.g. { plan_id: 'gold' }).
 * @returns {Promise<Response>} The API response after upgrading the plan.
 */
export const upgradeUserPlan = async (payload) => {

  try {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/api/internal/user-plan/upgrade`;

    const response = await customFetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    return response;
  } catch (error) {
    console.error('Error upgrading user plan:', error);
    throw error;
  }
};

export const sendBulkEmail = async (recipients, subject, body) => {
try {
    const response = await customFetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/internal/send-bulk-email`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipients,
          subject,
          body,
        }),
      }
    );
    return response;
  } catch (error) {
    console.error("Failed to send bulk emails:", error);
    return { success: false, error: error.message };
  }
};


export const getUsers = async ({
  username,
  email,
  offset = 0,
  limit = 20,
  sort_by = "created_at",
  sort_order = "desc",
}) => {
  try {
    const params = new URLSearchParams();

    if (username) params.append("username", username);
    if (email) params.append("email", email);

    params.append("offset", offset);
    params.append("limit", limit);

    if (sort_by) params.append("sort_by", sort_by);
    if (sort_order) params.append("sort_order", sort_order);

    const url = `${process.env.NEXT_PUBLIC_API_URL}/api/internal/users?${params.toString()}`;

    const response = await customFetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    return response;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

export const getTokenUsageRecords = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    if (filters.user_id) params.append("user_id", filters.user_id);
    if (filters.module_id) params.append("module_id", filters.module_id);
    if (filters.model) params.append("model", filters.model);
    if (filters.start_date) params.append("start_date", filters.start_date);
    if (filters.end_date) params.append("end_date", filters.end_date);
    if (filters.limit) params.append("limit", filters.limit);

    const queryString = params.toString();
    const url = `${process.env.NEXT_PUBLIC_API_URL}/api/internal/token-usage${queryString ? `?${queryString}` : ""}`;
    
    const response = await customFetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response;
  } catch (error) {
    console.error("Failed to get token usage records:", error);
    return { success: false, error: error.message };
  }
};


// ==================== ANALYTICS ====================

export const getDashboardSummary = async (startDate = null, endDate = null) => {
  try {
    const params = new URLSearchParams();
    if (startDate) params.append("start_date", startDate);
    if (endDate) params.append("end_date", endDate);

    const queryString = params.toString();
    const url = `${process.env.NEXT_PUBLIC_API_URL}/api/internal/token-usage/analytics/summary${queryString ? `?${queryString}` : ""}`;
    
    const response = await customFetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response;
  } catch (error) {
    console.error("Failed to get dashboard summary:", error);
    return { success: false, error: error.message };
  }
};

export const getTokensByUser = async (startDate = null, endDate = null) => {
  try {
    const params = new URLSearchParams();
    if (startDate) params.append("start_date", startDate);
    if (endDate) params.append("end_date", endDate);

    const queryString = params.toString();
    const url = `${process.env.NEXT_PUBLIC_API_URL}/api/internal/token-usage/analytics/by-user${queryString ? `?${queryString}` : ""}`;
    
    const response = await customFetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response;
  } catch (error) {
    console.error("Failed to get tokens by user:", error);
    return { success: false, error: error.message };
  }
};

export const getTokensByModule = async (startDate = null, endDate = null) => {
  try {
    const params = new URLSearchParams();
    if (startDate) params.append("start_date", startDate);
    if (endDate) params.append("end_date", endDate);

    const queryString = params.toString();
    const url = `${process.env.NEXT_PUBLIC_API_URL}/api/internal/token-usage/analytics/by-module${queryString ? `?${queryString}` : ""}`;
    
    const response = await customFetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response;
  } catch (error) {
    console.error("Failed to get tokens by module:", error);
    return { success: false, error: error.message };
  }
};

export const getTokensByModel = async (startDate = null, endDate = null) => {
  try {
    const params = new URLSearchParams();
    if (startDate) params.append("start_date", startDate);
    if (endDate) params.append("end_date", endDate);

    const queryString = params.toString();
    const url = `${process.env.NEXT_PUBLIC_API_URL}/api/internal/token-usage/analytics/by-model${queryString ? `?${queryString}` : ""}`;
    
    const response = await customFetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response;
  } catch (error) {
    console.error("Failed to get tokens by model:", error);
    return { success: false, error: error.message };
  }
};

export const getUsageOverTime = async (granularity = "day", filters = {}) => {
  try {
    const params = new URLSearchParams();
    params.append("granularity", granularity);
    
    if (filters.start_date) params.append("start_date", filters.start_date);
    if (filters.end_date) params.append("end_date", filters.end_date);
    if (filters.user_id) params.append("user_id", filters.user_id);
    if (filters.module_id) params.append("module_id", filters.module_id);

    const queryString = params.toString();
    const url = `${process.env.NEXT_PUBLIC_API_URL}/api/internal/token-usage/analytics/over-time?${queryString}`;
    
    const response = await customFetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response;
  } catch (error) {
    console.error("Failed to get usage over time:", error);
    return { success: false, error: error.message };
  }
};

export const getTopUsers = async (limit = 10, startDate = null, endDate = null) => {
  try {
    const params = new URLSearchParams();
    params.append("limit", limit);
    if (startDate) params.append("start_date", startDate);
    if (endDate) params.append("end_date", endDate);

    const queryString = params.toString();
    const url = `${process.env.NEXT_PUBLIC_API_URL}/api/internal/token-usage/analytics/top-users?${queryString}`;
    
    const response = await customFetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response;
  } catch (error) {
    console.error("Failed to get top users:", error);
    return { success: false, error: error.message };
  }
};

export const getUserModuleBreakdown = async (userId, startDate = null, endDate = null) => {
  try {
    const params = new URLSearchParams();
    if (startDate) params.append("start_date", startDate);
    if (endDate) params.append("end_date", endDate);

    const queryString = params.toString();
    const url = `${process.env.NEXT_PUBLIC_API_URL}/api/internal/token-usage/analytics/user/${userId}/breakdown${queryString ? `?${queryString}` : ""}`;
    
    const response = await customFetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response;
  } catch (error) {
    console.error("Failed to get user module breakdown:", error);
    return { success: false, error: error.message };
  }
};

export const getUsageComparison = async (currentStart, currentEnd, previousStart, previousEnd) => {
  try {
    const params = new URLSearchParams();
    params.append("current_start", currentStart);
    params.append("current_end", currentEnd);
    params.append("previous_start", previousStart);
    params.append("previous_end", previousEnd);

    const queryString = params.toString();
    const url = `${process.env.NEXT_PUBLIC_API_URL}/api/internal/token-usage/analytics/comparison?${queryString}`;
    
    const response = await customFetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response;
  } catch (error) {
    console.error("Failed to get usage comparison:", error);
    return { success: false, error: error.message };
  }
};

// ==================== QUICK/CONVENIENCE ====================

export const getTodaySummary = async () => {
  try {
    const response = await customFetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/internal/token-usage/analytics/quick/today`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response;
  } catch (error) {
    console.error("Failed to get today's summary:", error);
    return { success: false, error: error.message };
  }
};

export const getThisWeekSummary = async () => {
  try {
    const response = await customFetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/internal/token-usage/analytics/quick/this-week`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response;
  } catch (error) {
    console.error("Failed to get this week's summary:", error);
    return { success: false, error: error.message };
  }
};

export const getThisMonthSummary = async () => {
  try {
    const response = await customFetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/internal/token-usage/analytics/quick/this-month`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response;
  } catch (error) {
    console.error("Failed to get this month's summary:", error);
    return { success: false, error: error.message };
  }
};

export const getLast30DaysSummary = async () => {
  try {
    const response = await customFetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/internal/token-usage/analytics/quick/last-30-days`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response;
  } catch (error) {
    console.error("Failed to get last 30 days summary:", error);
    return { success: false, error: error.message };
  }
};