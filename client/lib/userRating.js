import { customFetch } from "./apiWrapper";

/**
 * {
    "module_name": "roadmap" || "resume_builder" || "ats_checker" || "mock_interview",
    "rating": 1-5,
    "comment": "Any Text"
  }
 * Create a new rating for a module
 * @param {Object} ratingData - The rating data
 * @param {string} ratingData.module_name - The module name (ats_checker, resume_builder, mock_interview, roadmap)
 * @param {number} ratingData.rating - Rating score between 0 and 5
 * @param {string} [ratingData.comment] - Optional comment about the module
 * @returns {Promise} - The API response with success message and created rating data
 */
export const createRating = async (ratingData) => {
  try {
    const response = await customFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/rating/`, {
      method: 'POST',
      body: JSON.stringify(ratingData),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return response;
  } catch (error) {
    console.error('Error creating rating:', error);
    throw error;
  }
};

/**
 * Get all ratings with optional filters (Admin only)
 * @param {Object} [filters] - Optional filters for the ratings
 * @param {number} [filters.rating] - Filter ratings greater than this value
 * @param {string} [filters.module_name] - Filter ratings by module name
 * @param {string} [filters.user_id] - Filter ratings by user ID
 * @returns {Promise} - The API response with ratings data and optional user details
 */
export const getAllRatings = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    // Add filters to query params if they exist
    if (filters.rating !== undefined && filters.rating !== null) {
      queryParams.append('rating', filters.rating.toString());
    }
    if (filters.module_name) {
      queryParams.append('module_name', filters.module_name);
    }
    if (filters.user_id) {
      queryParams.append('user_id', filters.user_id);
    }

    const queryString = queryParams.toString();
    const url = `${process.env.NEXT_PUBLIC_API_URL}/api/rating/${queryString ? `?${queryString}` : ''}`;

    const response = await customFetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return response;
  } catch (error) {
    console.error('Error fetching ratings:', error);
    throw error;
  }
};

/**
 * Get ratings filtered by minimum rating value
 * @param {number} minRating - Minimum rating value to filter by
 * @returns {Promise} - The API response with filtered ratings
 */
export const getRatingsByMinValue = async (minRating) => {
  return getAllRatings({ rating: minRating });
};

/**
 * Get ratings filtered by module name
 * @param {string} moduleName - Module name to filter by (ats_checker, resume_builder, mock_interview, roadmap)
 * @returns {Promise} - The API response with filtered ratings
 */
export const getRatingsByModule = async (moduleName) => {
  return getAllRatings({ module_name: moduleName });
};

/**
 * Get ratings filtered by user ID
 * @param {string} userId - User ID to filter by
 * @returns {Promise} - The API response with filtered ratings and user details
 */
export const getRatingsByUser = async (userId) => {
  return getAllRatings({ user_id: userId });
};

/**
 * Get ratings with multiple filters
 * @param {number} [minRating] - Minimum rating value
 * @param {string} [moduleName] - Module name
 * @param {string} [userId] - User ID
 * @returns {Promise} - The API response with filtered ratings
 */
export const getRatingsWithFilters = async (minRating, moduleName, userId) => {
  const filters = {};
  
  if (minRating !== undefined && minRating !== null) {
    filters.rating = minRating;
  }
  if (moduleName) {
    filters.module_name = moduleName;
  }
  if (userId) {
    filters.user_id = userId;
  }

  return getAllRatings(filters);
};