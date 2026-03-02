'use client';
import { useState, useRef, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { toast } from "react-toastify";
import { sendOtp, verifyOtp } from '@/lib/register';
import OtpInput from './OTPInput';

const OtpVerification = ({ 
  email, 
  isLocalMode = false,
  onVerificationComplete, 
  onGoBack,
  showBackButton = true,
  cooldownDuration = 60 
}) => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpMessage, setOtpMessage] = useState("OTP Sent");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [cooldownActive, setCooldownActive] = useState(false);
  const cooldownIntervalRef = useRef(null);

  useEffect(() => {
    if (!isLocalMode && email) {
      handleSendOtp();
    } else if (isLocalMode) {
      onVerificationComplete();
    }

    return () => {
      if (cooldownIntervalRef.current) {
        clearInterval(cooldownIntervalRef.current);
      }
    };
  }, []);

  const startResendCooldown = () => {
    if (cooldownIntervalRef.current) {
      clearInterval(cooldownIntervalRef.current);
    }
    setCooldownActive(true);
    setResendCooldown(cooldownDuration);

    cooldownIntervalRef.current = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(cooldownIntervalRef.current);
          cooldownIntervalRef.current = null;
          setCooldownActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendOtp = async () => {
    try {
      if (cooldownActive && resendCooldown > 0) {
        toast.info(`Please wait ${resendCooldown} seconds before requesting a new OTP`);
        return;
      }
      setIsSending(true);
      setOtpSent(false);
      const response = await sendOtp(email);
      const responseJson = await response.json();

      if(response.status === 200){
        setOtpMessage("OTP sent successfully");
        setOtpSent(true);
      } else if(response?.status === 429){
        toast.error("Too many requests");
      } else if(response?.status === 409){
        throw new Error(responseJson.detail);
      } else {
        setOtpMessage("Error sending OTP.");
      }
    } catch (error) {
      console.error(error.message);
      setOtpMessage("Error sending OTP.");
      toast.error(error.message, {
        position: "top-center",
        autoClose: 2000,
      });
    } finally {
      startResendCooldown();
      setIsSending(false);
    }
  };

  const handleVerifyOtp = async () => {
    try {
      setIsVerifying(true);
      const response = await verifyOtp(email, otp.join(""));
      const responseJson = await response.json();

      if (response.status === 200) {
        onVerificationComplete();
      } else if(response?.status === 429){
        toast.error("Too Many Requests");
      } else {
        toast.error("Invalid OTP. Please try again!", {
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: false,
          theme: "light",
        });
      }
    } catch (error) {
      console.log("An error occurred");
      toast.error(error?.message);
    } finally {
      setIsVerifying(false);
    }
  };

  const confirmEnabled = otp.every((digit) => digit !== "");

  return (
    <div className="verification-screen w-full max-w-md flex flex-col items-center">
      {showBackButton && (
        <div className="flex items-center self-start mb-6">
          <button 
            onClick={onGoBack}
            className="flex items-center text-primary hover:text-primary-dark transition-colors"
          >
            <ArrowLeft size={20} className="mr-1" />
            <span>Back</span>
          </button>
        </div>
      )}
      
      <h1 className="text-xl font-semibold mb-8">Email Verification</h1>
      
      <div className="w-full">
        <p className="text-center text-gray-600 mb-2">
          We've sent a 6-digit verification code to:
        </p>
        <p className="text-center font-medium mb-6">{email}</p>
        
        {isSending ? (
          <p className="text-yellow-600 text-sm text-center">Preparing your OTP...</p>
        ) : (
          <div className="flex flex-col items-center">
            <OtpInput
              value={otp}
              onChange={setOtp}
            />

            {otpMessage !== null && (
              <span className={`text-sm mt-2 mb-4 ${otpMessage === 'OTP Sent' || otpMessage === 'OTP sent successfully' ? 'text-green-600' : 'text-red-600'}`}>
                {otpMessage}
              </span>
            )}
            
            <div className="flex flex-col items-center gap-4 w-full mt-2">
              <button 
                className={`w-full py-3 rounded-full font-medium ${
                  confirmEnabled && !isVerifying 
                    ? 'bg-primary text-white' 
                    : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                }`} 
                onClick={handleVerifyOtp}
                disabled={!confirmEnabled || isVerifying}
              >
                {isVerifying ? "Verifying..." : "Confirm Code"}
              </button>
              
              <div className="text-sm text-gray-600">
                Didn't receive the code?{' '}
                {cooldownActive ? (
                  <span className="text-gray-500">Resend in {resendCooldown}s</span>
                ) : (
                  <span
                    className="text-primary cursor-pointer hover:underline"
                    onClick={handleSendOtp}
                  >
                    Resend Code
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OtpVerification;
