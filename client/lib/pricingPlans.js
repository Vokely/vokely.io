import { customFetch } from "./apiWrapper";

  
export async function createPlan(plan) {
try {
    const response = await customFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/internal/pricing_plans/`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify(plan),
    });
    return response;
} catch (error) {
    console.error('Error creating plan:', error);
    throw error;
}
}

export async function fetchPlan(planId) {
try {
    const response = await customFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/internal/pricing_plans/${planId}`);
    return response;
} catch (error) {
    console.error('Error fetching plan:', error);
    throw error;
}
}

export async function getAllPlans() {
try {
    const response = await customFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/internal/pricing_plans/`);
    return response;
} catch (error) {
    console.error('Error fetching plans:', error);
    throw error;
}
}

export async function updatePlan(planId, updatedPlan) {
try {
    const response = await customFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/internal/pricing_plans/${planId}`, {
    method: 'PUT',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify(updatedPlan),
    });
    return response;
} catch (error) {
    console.error('Error updating plan:', error);
    throw error;
}
}

export async function deletePlan(planId) {
try {
    const response = await customFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/internal/pricing_plans/${planId}`, {
    method: 'DELETE',
    });
    return response;
} catch (error) {
    console.error('Error deleting plan:', error);
    throw error;
}
}

export async function uploadPlanImage(planId, file) {
try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await customFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/internal/pricing_plans/${planId}/upload_image`, {
        method: 'PUT',
        body: formData,
    });

    return response;
} catch (error) {
    console.error('Error uploading image:', error);
    throw error;
}
}

export async function getRegionalPricing(country_code,currency) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/public/regional-pricing?country=${country_code}&currency=${currency}&t=${new Date()}`);
        return response;
    } catch (error) {
        console.error('Error fetching plans:', error);
        throw error;
    }
}

export async function addFeatureToAllPlans(feature) {
    try {
      const response = await customFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/internal/pricing_plans/add-feature`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(feature),
      });
      return response;
    } catch (error) {
      console.error('Error adding feature to all plans:', error);
      throw error;
    }
}