'use client';
import { useState, useRef } from 'react';
import { ArrowLeft } from 'lucide-react';
import LogoText from '@/components/reusables/LogoText';
import { Button } from '@/components/ui/button';
import { requestPasswordReset, resetPassword, verifyForgetPasswordOtp } from '@/lib/passwordUtil';
import OtpInput from '../reusables/OTPInput';

const ResetPassword = ({ onGoBack , addToast}) => {
  const [step, setStep] = useState('email'); // 'email', 'otp', 'newPassword'
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [cooldownActive, setCooldownActive] = useState(false);
  const cooldownRef = useRef(null);
  const [errors, setErrors] = useState({
    email: '',
  });

  const validateEmail = (value) => {
    setErrors((prev) => ({
      ...prev,
      email:
        value.trim() === ''
          ? 'Email is required'
          : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
            ? 'Enter a valid email address'
            : '',
    }));
  };

const handleEmailSubmit = async (e) => {
    e.preventDefault();
    validateEmail(email);
    if (errors.email) return;

    setIsLoading(true);
    try {
    const response = await requestPasswordReset(email);
    if (response.ok) {
        setStep('otp');
        startResendCooldown();
    } else {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to reset password')
    }
    } catch (error) {
    console.error(error);
    addToast(error.message, 'error', 'top-middle', 3000);
    } finally {
    setIsLoading(false);
    }
};

  const startResendCooldown = () => {
    if (cooldownRef.current) clearInterval(cooldownRef.current);
    setCooldownActive(true);
    setResendCooldown(60);

    cooldownRef.current = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(cooldownRef.current);
          setCooldownActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleResendOtp = async () => {
    if (cooldownActive && resendCooldown > 0) {
      addToast(`Wait ${resendCooldown}s before resending.`,'warning',3000)
      return;
    }
    setIsSending(true);
    try {
      const response = await requestPasswordReset(email);
      if (response.ok) {
        setOtp(["", "", "", "", "", ""])
        addToast(`OTP Sent!.`,'success',3000);
        startResendCooldown();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to resend OTP');
      }
    } catch (error) {
      console.error(error);
      addToast(error.message,'error',3000)
    } finally {
      setIsSending(false);
    }
  };

  const handleVerifyOtp = async () => {
    setIsVerifying(true);
    try {
      const response = await verifyForgetPasswordOtp(email,otp.join(""));
      if (response.ok) {
        setStep('newPassword');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Invalid OTP');
      }
    } catch (error) {
      console.error(error);
      addToast(error.message, 'error', 'top-middle', 3000);
    } finally {
      setIsVerifying(false);
    }
  };
  
  const confirmEnabled = otp.every((digit) => digit !== "");

  if (step === 'otp') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white px-4">
        <div className="absolute left-5 top-5">
          <LogoText color='#342EE5'/>
        </div>
        <div className="w-full max-w-md flex flex-col items-center">
          <div className="flex items-center self-start mb-6">
            <button 
              onClick={() => setStep('email')}
              className="flex items-center text-primary hover:text-primary-dark transition-colors"
            >
              <ArrowLeft size={20} className="mr-1" />
              <span>Back</span>
            </button>
          </div>
          <h1 className="text-xl font-semibold mb-4">Verify Code</h1>
          <p className="text-center text-gray-600 mb-2">
            Enter the 6-digit code sent to:
          </p>
          <p className="text-center font-medium mb-6">{email}</p>
          <OtpInput value={otp} onChange={setOtp} />
          <div className="flex flex-col w-full gap-4 mt-6">
            <Button
              disabled={!confirmEnabled || isVerifying}
              onClick={handleVerifyOtp}
              className="w-full py-3 text-lg font-semibold text-white"
            >
              {isVerifying ? "Verifying..." : "Confirm Code"}
            </Button>
            <p className="text-sm text-gray-600 text-center">
              Didn&apos;t receive the code?{" "}
              {cooldownActive ? (
                <span className="text-gray-500">Resend in {resendCooldown}s</span>
              ) : (
                <span
                  onClick={handleResendOtp}
                  className="text-primary cursor-pointer hover:underline"
                >
                  Resend Code
                </span>
              )}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'newPassword') {
    return (
      <NewPasswordForm 
        email={email} 
        onGoBack={onGoBack}
        onComplete={onGoBack}
        addToast={addToast}
      />
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white px-4">
      <div className="w-full max-w-md">
        <div className="flex items-center mb-6">
          <button 
            onClick={onGoBack}
            className="flex items-center text-primary hover:text-primary-dark transition-colors"
          >
            <ArrowLeft size={20} className="mr-1" />
            <span>Back to Login</span>
          </button>
        </div>

        <h1 className="text-xl font-semibold text-center mb-2">
          Reset Password
        </h1>
        <p className="text-gray-600 text-center mb-8">
          Enter your email address and we'll send you a code to reset your password.
        </p>

        <form onSubmit={handleEmailSubmit} className="space-y-4">
          <div className="flex flex-col">
            <label htmlFor="reset-email" className="mb-2 text-sm font-medium">
              Email Address
            </label>
            <input
              type="email"
              id="reset-email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => {
                const value = e.target.value;
                setEmail(value);
                validateEmail(value);
              }}
              className="form-input px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              disabled={isLoading}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          <Button 
            type="submit"
            className="w-full py-3 rounded-full text-lg font-semibold text-white mt-6"
            disabled={isLoading || !email.trim()}
          >
            {isLoading ? 'SENDING...' : 'SEND RESET CODE'}
          </Button>
        </form>
      </div>
    </div>
  );
};

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

export default ResetPassword;