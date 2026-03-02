import { customFetch } from "./apiWrapper";
/**
 * Update onboarding details for the authenticated user.
 * @param {Object} user - The authenticated user object containing a valid token.
 * @param {Object} onboardingDetails - The onboarding details to update.
 * @returns {Promise<Response>} - The fetch response from the API.
 */
export async function updateOnboardingDetails(onboardingDetails) {
    try {
      const response = await customFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/onboard/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(onboardingDetails),
      });
      return response;
    } catch (error) {
      console.error('Error updating onboarding details:', error);
      throw error;
    }
}

  /**
 * Fetch onboarding details for the authenticated user.
 * @param {Object} user - The authenticated user object containing a valid token.
 * @returns {Promise<Object>} - The onboarding details from the API.
 */
export async function getOnboardingDetails() {
  try {
    const response = await customFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/onboard/details`, {
      method: 'GET',
      credentials : "include"
    });

    return response;
  } catch (error) {
    console.error('Error fetching onboarding details:', error);
    throw error;
  }
}

export async function getOnboardingDetailsUsingToken(token) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/onboard/details`, {
      method: 'GET',
      credentials : "include",
      headers:{
        "Authorization" : `Bearer ${token}`
      }
    });
    return response;
  } catch (error) {
    console.error('Error fetching onboarding details:', error);
    throw error;
  }
}
/**
 * Mark onboarding as completed for the authenticated user.
 * @param {Object} user - The authenticated user object containing a valid token.
 * @returns {Promise<Object>} - The updated onboarding details.
 */
export async function completeOnboarding() {
  try {
    const response = await customFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/onboard/complete`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to complete onboarding');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error completing onboarding:', error.message);
    throw error;
  }
}
