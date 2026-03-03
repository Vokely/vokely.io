'use client';
import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { requestPasswordReset } from '@/lib/passwordUtil';

const ResetPassword = ({ onGoBack , addToast}) => {
// New Password Form Component
const NewPasswordForm = ({ email, onGoBack, onComplete, addToast }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({
    password: '',
    confirmPassword: '',
  });

  const validatePassword = (value) => {
    setErrors((prev) => ({
      ...prev,
      password:
        value.length < 6 ? 'Password must be at least 6 characters' : '',
    }));
  };

  const validateConfirmPassword = (value) => {
    setErrors((prev) => ({
      ...prev,
      confirmPassword:
        value !== password ? 'Passwords do not match' : '',
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    validatePassword(password);
    validateConfirmPassword(confirmPassword);

    if (errors.password || errors.confirmPassword) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await resetPassword(email,password)

      if (response.ok) {
        addToast('Password reset successfull', 'success', 'top-middle', 3000);
        onComplete();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to reset password');
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      addToast(error.message, 'error', 'top-middle', 3000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white px-4">

      <div className="w-full max-w-md">
        <div className="flex items-center mb-6">
          <button 
            onClick={onGoBack}
            className="flex items-center text-primary hover:text-primary-dark transition-colors"
          >
            <ArrowLeft size={20} className="mr-1" />
            <span>Back</span>
          </button>
        </div>

        <h1 className="text-xl font-semibold text-center mb-2">
          Create New Password
        </h1>
        <p className="text-gray-600 text-center mb-8">
          Enter a new password for {email}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col">
            <label htmlFor="new-password" className="mb-2 text-sm font-medium">
              New Password
            </label>
            <input
              type="text"
              id="new-password"
              placeholder="Enter new password"
              value={password}
              onChange={(e) => {
                const value = e.target.value;
                setPassword(value);
                validatePassword(value);
              }}
              className="form-input px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              disabled={isLoading}
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          <div className="flex flex-col">
            <label htmlFor="confirm-password" className="mb-2 text-sm font-medium">
              Confirm New Password
            </label>
            <input
              type="text"
              id="confirm-password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => {
                const value = e.target.value;
                setConfirmPassword(value);
                validateConfirmPassword(value);
              }}
              className="form-input px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              disabled={isLoading}
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
            )}
          </div>

          <Button 
            type="submit"
            className="w-full py-3 rounded-full text-lg font-semibold text-white mt-6"
            disabled={isLoading || !password.trim() || !confirmPassword.trim()}
          >
            {isLoading ? 'UPDATING...' : 'UPDATE PASSWORD'}
          </Button>
        </form>
      </div>
    </div>
  );
};
}
export default ResetPassword;