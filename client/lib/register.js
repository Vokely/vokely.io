import { customFetch } from "./apiWrapper";

export async function sendOtp(email) {
    try {
        const response = await customFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/verification/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email }) 
        });

        return response;
    } catch (error) {
        console.error("Error sending OTP:", error);
        return { success: false, message: "Failed to send OTP. Please try again." };
    }
}
export async function verifyOtp(email,code) {
    let jsonBody = {
        email,code
    }
    try {
        const response = await customFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/verification/verify`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(jsonBody) 

        });

        return response;
    } catch (error) {
        console.error("Error sending OTP:", error);
        return { success: false, message: "Failed to send OTP. Please try again." };
    }
}

export async function registerUser(name, mail, phone,activeCategory,course,selectedOption) {
    try {
        let jsonBody = {
            email: mail,
            name,
            "career_stage": activeCategory,
            "domain": course
        };
        if(activeCategory==="Professional"){
            jsonBody["experience"] = selectedOption
        }

        if (phone !== null && phone !== undefined) {
            jsonBody.phone_number = phone; // Ensure the key matches the expected model
        }

        const response = await customFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/beta-users/add`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(jsonBody)
        });

        return response;
    } catch (error) {
        console.error("Error registering user:", error);
        return { success: false, message: "Error occurred." };
    }
}