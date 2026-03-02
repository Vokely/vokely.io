import { customFetch } from "./apiWrapper";

/**
 * Fetch a shareable link by its ID
 * @param {string} id - The ID of the shareable link
 * @returns {Promise<Response>} - The fetch response
 */
export const fetchShareableLinkById = async (id) => {
  try {
    const response = await customFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/public/external-links/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response;
  } catch (error) {
    console.error('Error fetching link:', error);
    throw error;
  }
};

/**
 * Verify a password for a protected shareable link
 * @param {string} id - The ID of the shareable link
 * @param {string} password - The password to verify
 * @returns {Promise<Response>} - The fetch response
 */
export const verifyShareableLinkPassword = async (id, password) => {
  try {
    const response = await customFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/public/external-links/${id}/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ password })
    });
    return response;
  } catch (error) {
    console.error('Error verifying password:', error);
    throw error;
  }
};

export const fetchLinksByRelationId = async (relationId) => {
    try {
      const response = await customFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/external-links/relation/${relationId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
  
      return response;
    } catch (error) {
      console.error('Error fetching links by relation ID:', error);
      throw error;
    }
  };

  
export const createShareableLink = async (linkData) => {
try {
    const response = await customFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/external-links/add`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify(linkData),
    });
    return response;
} catch (error) {
    console.error('Error creating link:', error);
    throw error;
}
};

export const updateShareableLink = async (linkId, updateData) => {
try {
    const response = await customFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/external-links/${linkId}`, {
    method: 'PUT',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify(updateData),
    });
    return response;
} catch (error) {
    console.error('Error updating link:', error);
    throw error;
}
};

export const deleteShareableLink = async (linkId) => {
try {
    const response = await customFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/external-links/${linkId}`, {
    method: 'DELETE',
    });
    return response;
} catch (error) {
    console.error('Error deleting link:', error);
    throw error;
}
};

export const formatExpiryDate = (expiryOption) => {
    if (expiryOption === "never") {
      return "never";
    }
    
    const now = new Date();
    
    switch (expiryOption) {
      case "24h":
        now.setHours(now.getHours() + 24);
        return now.toISOString();
      case "7d":
        now.setDate(now.getDate() + 7);
        return now.toISOString();
      case "30d":
        now.setDate(now.getDate() + 30);
        return now.toISOString();
      default:
        return expiryOption; // Return as is if it's already a date string
    }
  };

  export const formatDateTime = (dateTime) => {
    if (!dateTime || dateTime === "never") return "Never expires";
    
    const date = new Date(dateTime);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    }).format(date);
  };