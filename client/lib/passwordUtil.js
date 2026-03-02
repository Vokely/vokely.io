export const requestPasswordReset = async (email) => {
    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL}/api/password/request-reset`;
  
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
        }),
      });
  
      return response;
    } catch (error) {
      console.error('Error requesting password reset:', error);
      throw error;
    }
};

export const verifyForgetPasswordOtp = async (email,otp) => {
    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL}/api/password/verify-otp`;
  
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          otp,
        }),
      });
  
      return response;
    } catch (error) {
      console.error('Error verifying OTP:', error);
      throw error;
    }
};
  
export const resetPassword = async (email, newPassword) => {
    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL}/api/password/reset-password`;
  
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          new_password: newPassword,
        }),
      });
  
      return response;
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
};
  