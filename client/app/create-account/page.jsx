'use client';
import Google from '@/components/icons/Google';
import { Button } from '@/components/ui/button';
import { useEffect, useState, useRef } from 'react';
import LinkedIn from '@/components/icons/LinkedIn';
import '@/styles/login.css';
import RightMenu from '@/components/auth/RightMenu';
import LogoText from '@/components/reusables/LogoText';
import { Eye, EyeOff, CircleCheckBig, AlertCircle, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import useToastStore from '@/store/toastStore';
import Loader from '@/components/reusables/Loader';
import OtpVerification from '@/components/reusables/OTP';
import { useAuth } from '@/hooks/useAuth';

export default function signup() {
  const [passwordVisible, setPasswordVisible] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [verifyEnabled, setVerifyEnabled] = useState(false);
  const [showVerifyDialog, setShowVerifyDialog] = useState(false);
  const [showTermsWarning, setShowTermsWarning] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  // Input values
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [isCheckboxChecked, setIsCheckboxChecked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { user, loading, signUp } = useAuth();
  const router = useRouter();
  const termsCheckboxRef = useRef(null);
  const addToast = useToastStore((state) => state.addToast);
  
  // Error Messages
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    name: '',
    checkbox: '',
  });

  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const mode = process.env.NEXT_PUBLIC_DEV_MODE;
  const isLocalMode = mode === 'local';

  // Redirect if already authenticated
  useEffect(() => {
    if (!loading && user) {
      if (user.status === 'new' || user?.onboarding_details?.status !== 'completed') {
        window.location.href(`${process.env.NEXT_PUBLIC_REDIRECT_URI}/onboard`);
      } else {
        window.location.href(`${process.env.NEXT_PUBLIC_REDIRECT_URI}/dashboard`);
      }
    }
  }, [user, loading, router]);

  // OAuth sign-in functions
  const signInWithOAuth = async (provider) => {
    try {
      window.location.href = `/api/auth/${provider}`;
    } catch (error) {
      console.error(`${provider} sign-in error:`, error);
      addToast(`Failed to sign in with ${provider}`, 'error', 'top-middle', 3000);
    }
  };
  
  // Validation Functions
  const validateEmail = (value) => {
    setErrors((prev) => ({
      ...prev,
      email:
        value.trim() === ''
          ? 'Email is required'
          : !emailPattern.test(value)
            ? 'Enter a valid email address'
            : '',
    }));
    
    // In local mode, enable verify button and auto-verify valid emails
    if (emailPattern.test(value)) {
      setVerifyEnabled(true);
      if (isLocalMode) {
        setIsVerified(true);
      }
    } else {
      setVerifyEnabled(false);
      setIsVerified(false);
    }
  };

  const validatePassword = (value) => {
    setErrors((prev) => ({
      ...prev,
      password:
        value.length < 6 ? 'Password must be at least 6 characters' : '',
    }));
  };

  const validateCheckbox = (currentValue) => {
    setErrors((prev) => ({
      ...prev,
      checkbox: currentValue ? '' : 'You must agree to the terms',
    }));
    setShowTermsWarning(!currentValue);
  };

  const validateName = (currentValue) => {
    setErrors((prev) => ({
      ...prev,
      name: currentValue ? '' : 'Please enter your name',
    }));
  };

  const handleVerifyClick = () => {
    // In local mode, automatically set as verified without OTP
    if (isLocalMode) {
      setIsVerified(true);
      toast.success("Email automatically verified in local mode", {
        position: "top-center",
        autoClose: 2000,
      });
      return;
    }
    
    // Show OTP verification dialog
    setShowVerifyDialog(true);
  };

  const handleVerificationComplete = () => {
    setIsVerified(true);
    setShowVerifyDialog(false);
  };

  const handleBackToForm = () => {
    setShowVerifyDialog(false);
  };

  // Handle Submit
  const handleSubmit = async () => {
    validateEmail(email);
    validatePassword(password);
    validateCheckbox(isCheckboxChecked);
    validateName(name);

    if (!isCheckboxChecked) {
      setShowTermsWarning(true);
      return;
    } else {
      setShowTermsWarning(false);
    }

    // In local mode, we can skip the verification check
    const emailVerificationPassed = isLocalMode || isVerified;

    if (!errors.email && !errors.password && !errors.name && isCheckboxChecked && emailVerificationPassed) {
      setIsSubmitting(true);
      
      try {
        const result = await signUp(name, email, password);
      } catch (error) {
        console.error('Signup error:', error);
        addToast(error.message, 'error', 'top-middle', 3000);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      if (!emailVerificationPassed && !isLocalMode) {
        toast.error("Please verify your email address", {
          position: "top-middle",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: false,
          theme: "light",
        });
      }
    }
  };

  if (loading || user) {
    return <Loader />;
  }

  // useEffect(() => {
  //   const url = new URL(window.location.href);
  //   const errorParam = url.searchParams.get('error');
  
  //   if (errorParam) {
  //     const errorMessage = decodeURIComponent(errorParam);
  //     addToast(errorMessage, 'error', 'top-middle', 3000);
  //     url.searchParams.delete('error');
  //     window.history.replaceState({}, document.title, url.pathname + url.search);
  //   }
  // }, []);

  return (
    <div className="relative flex flex-col md:flex-row min-h-screen w-full overflow-hidden">
 
      {/* Logo */}
      <div className="absolute left-4 top-4 md:left-6 md:top-6 z-10">
        <LogoText color='#342EE5'/>
      </div>

      {/* Left Section */}
      <div className="flex w-full md:w-1/2 flex-col mt-10 md:mt-0 items-center justify-center px-4 py-10 md:px-10">
        <ToastContainer
          autoClose={3000}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          className="w-full max-w-md"
        />

        {showVerifyDialog && !isLocalMode ? (
          <OtpVerification
            email={email}
            isLocalMode={isLocalMode}
            onVerificationComplete={handleVerificationComplete}
            onGoBack={handleBackToForm}
          />
        ) : (
          <>
            <h1 className="text-xl font-semibold text-center max-w-md">
              <p className="text-[16px] font-normal mb-1">LETS GET YOU STARTED</p>
              Start your dream journey
            </h1>

            <div className="form-container mt-4 flex flex-col items-center gap-2 w-full max-w-md">
              {/* Name */}
              <div className="flex flex-col">
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  placeholder="Name"
                  value={name}
                  onChange={(e) => {
                    const value = e.target.value;
                    setName(value);
                    validateName(value);
                  }}
                  className="form-input-sm"
                  disabled={isSubmitting}
                />
                {errors.name && <p className="error">{errors.name}</p>}
              </div>

              {/* Email */}
              <div className="flex flex-col">
                <label htmlFor="email">Email Address</label>
                <div className="flex flex-col items-center relative gap-2">
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => {
                      const value = e.target.value;
                      setEmail(value);
                      validateEmail(value);
                    }}
                    className="form-input-sm w-full"
                    disabled={isSubmitting}
                  />
                  <button
                    className={`px-4 py-2 rounded-full text-sm font-medium ${
                      isVerified
                        ? "bg-green-600 text-white"
                        : verifyEnabled
                        ? "bg-primary text-white"
                        : "bg-gray-300 text-gray-600 cursor-not-allowed"
                    }`}
                    onClick={handleVerifyClick}
                    disabled={!verifyEnabled || isSubmitting}
                  >
                    {isVerified ? (
                      <>
                        Verified
                        <CircleCheckBig size={16} className="inline ml-1" />
                      </>
                    ) : isLocalMode && verifyEnabled ? (
                      "Auto-Verify"
                    ) : (
                      "Verify"
                    )}
                  </button>
                </div>
                {errors.email && <p className="error">{errors.email}</p>}
                {isLocalMode && verifyEnabled && !isVerified && (
                  <p className="text-xs text-green-600">Click "Auto-Verify" to verify in local mode</p>
                )}
              </div>

              {/* Password */}
              <div className="flex flex-col">
                <label htmlFor="password">Password</label>
                <div className="form-input-sm relative flex items-center justify-between">
                  <input
                    type={passwordVisible ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => {
                      const value = e.target.value;
                      setPassword(value);
                      validatePassword(value);
                    }}
                    className="outline-none border-none bg-transparent w-full p-0"
                    disabled={isSubmitting}
                  />
                  <div
                    className="cursor-pointer ml-2"
                    onClick={() => setPasswordVisible((prev) => !prev)}
                  >
                    {passwordVisible ? <Eye color="#9ca3af" /> : <EyeOff color="#9ca3af" />}
                  </div>
                </div>
                {errors.password && <p className="error ml-2">{errors.password}</p>}
              </div>

              {/* Checkbox */}
              <div className={`flex items-center w-full my-2 gap-2 ${showTermsWarning ? 'bg-red-50 p-2 rounded-md border border-red-200' : ''}`}>
                <input
                  type="checkbox"
                  id="agree"
                  ref={termsCheckboxRef}
                  className={`h-3 w-3 accent-primary cursor-pointer ${showTermsWarning ? 'ring-2 ring-red-400' : ''}`}
                  checked={isCheckboxChecked}
                  onClick={() => setIsCheckboxChecked(true)}
                  disabled={isSubmitting}
                  readOnly
                />
                <a
                  className="text-sm text-[#6b6b6b] underline cursor-pointer"
                  href='/terms'
                >
                  Agree to terms & conditions
                </a>
                {showTermsWarning && (
                  <div className="flex items-center text-red-500 ml-2">
                    <AlertCircle size={16} className="mr-1" />
                    <span className="text-xs">Required</span>
                  </div>
                )}
              </div>

              {/* Local Mode Message */}
              {isLocalMode && (
                <div className="bg-blue-50 p-2 rounded border border-blue-200">
                  <p className="text-xs text-blue-600 flex items-center">
                    <CircleCheckBig size={16} className="mr-1" />
                    Local mode detected - email verification will be skipped
                  </p>
                </div>
              )}

              {/* Submit */}
              <div onClick={handleSubmit} className='w-full'>
                <Button 
                  className="h-[50px] w-full rounded-full text-xl font-semibold text-white"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creating Account...' : 'BEGIN JOURNEY'}
                </Button>
              </div>

              {/* Divider */}
              <div className="mt-6 relative flex items-center justify-center">
                <div className="w-full h-[1px] bg-[#e0e0e0]" />
                <p className="absolute px-2 text-sm bg-white font-semibold">Or</p>
              </div>

              {/* Providers */}
              <button 
                className="provider-buttons mt-5" 
                onClick={() => signInWithOAuth('google')}
                disabled={isSubmitting}
              >
                <Google size={20} />
                <p className="text-[#616161]">SignUp with Google</p>
              </button>
              <button 
                className="provider-buttons my-5" 
                onClick={() => signInWithOAuth('linkedin')}
                disabled={isSubmitting}
              >
                <LinkedIn size={20} />
                <p className="text-[#616161]">SignUp with LinkedIn</p>
              </button>

              <div className="flex justify-center gap-2">
                <h2 className="text-center">Already Have an Account?</h2>
                <a href="/signin" className="font-bold text-primary">
                  LOGIN HERE
                </a>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Right Section */}
      <RightMenu />
    </div>
  );
}