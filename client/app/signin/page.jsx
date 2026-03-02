'use client';
import Google from '@/components/icons/Google';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import LinkedIn from '@/components/icons/LinkedIn';
import '@/styles/login.css';
import RightMenu from '@/components/auth/RightMenu';
import LogoText from '@/components/reusables/LogoText';
import { Eye } from 'lucide-react';
import { EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import useToastStore from '@/store/toastStore';
import Loader from '@/components/reusables/Loader';
import { useAuth } from '@/hooks/useAuth';
import ResetPassword from '@/components/auth/ResetPassword';
import { useAuthStore } from '@/store/authStore';

export default function Login() {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const addToast = useToastStore((state) => state.addToast);
  const [isLoading, setIsLoading] = useState(false);
  
  // Use the auth context
  const { signIn, user, loading } = useAuth();

  const [errors, setErrors] = useState({
    email: '',
    password: '',
    checkbox: '',
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

  const validatePassword = (value) => {
    setErrors((prev) => ({
      ...prev,
      password:
        value.length < 6 ? 'Password must be at least 6 characters' : '',
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    validateEmail(email);
    validatePassword(password);

    if (errors.email || errors.password) {
      console.log('There are validation errors');
      return;
    }

    setIsLoading(true);

    try {
      // Check for redirect parameter
      const urlParams = new URLSearchParams(window.location.search);
      const redirectUrl = urlParams.get('redirect');
      
      // Pass redirect URL to signIn function
      const result = await signIn(email, password, redirectUrl ? decodeURIComponent(redirectUrl) : null);
    } catch (error) {
      addToast(error.message || 'An error occurred during login', 'error', 'top-middle', 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithOAuth = async (provider) => {
    try {
      // Preserve redirect parameter for OAuth flow
      const urlParams = new URLSearchParams(window.location.search);
      const redirectUrl = urlParams.get('redirect');
      
      let oauthUrl = `/api/auth/${provider}`;
      if (redirectUrl) {
        oauthUrl += `?redirect=${encodeURIComponent(redirectUrl)}`;
      }
      
      window.location.href = oauthUrl;
    } catch (error) {
      console.error(`${provider} sign-in error:`, error);
      addToast(`Failed to sign in with ${provider}`, 'error', 'top-middle', 3000);
    }
  };

  const handleForgetPassword = () => {
    setShowResetPassword(true);
  };

  const handleBackToLogin = () => {
    setShowResetPassword(false);
  };

  useEffect(() => {
    // This redirect logic is now handled by the useAuth hook's signIn function
    // Only redirect if user is already authenticated when page loads (not from login form)
    if (user && !loading && !isLoading){
      const urlParams = new URLSearchParams(window.location.search);
      const redirectUrl = urlParams.get('redirect');
      
      if (redirectUrl) {
        router.push(decodeURIComponent(redirectUrl));
      } else if (user.status === 'new' || user?.onboarding_details?.status !== 'completed') {
        router.push(`${process.env.NEXT_PUBLIC_REDIRECT_URI || ''}/onboard`);
      } else {
        router.push(`${process.env.NEXT_PUBLIC_REDIRECT_URI || ''}/dashboard`);
      }
    }
  }, [user, loading, router, isLoading]);

  useEffect(() => {
    const url = new URL(window.location.href);
    const errorParam = url.searchParams.get('error');
  
    if (errorParam) {
      const errorMessage = decodeURIComponent(errorParam);
      addToast(errorMessage, 'error', 'top-middle', 3000);
      url.searchParams.delete('error');
      window.history.replaceState({}, document.title, url.pathname + url.search);
    }
  }, [addToast]);
  

  if (loading || isLoading || user) {
    return <Loader />;
  }

  return (
    <div className="relative flex flex-col md:flex-row h-auto min-h-screen">
      {/* Left Side (Form Section) */}
      <div className="flex w-full md:w-[50%] mt-10 md:mt-0 flex-col items-center justify-center md:justify-center bg-white pt-[40px] px-4 md:px-0">
        <div className="absolute left-5 top-5">
          <LogoText color='#342EE5'/>
        </div>

        {showResetPassword ? (
          <ResetPassword onGoBack={handleBackToLogin} addToast={addToast}/>
        ):(
          <div>
          <h1 className="text-xl font-semibold text-center">
            <p className="text-[16px] font-normal">WELCOME BACK</p>
            Continue your dream journey
          </h1>

          <form 
            onSubmit={handleSubmit}
            className="form-container mt-4 flex flex-col items-center gap-4 w-full md:w-[30vw]"
          >
            {/* Email */}
            <div className="flex flex-col">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                placeholder="Email Address |"
                value={email}
                onChange={(e) => {
                  const value = e.target.value;
                  setEmail(value);
                  validateEmail(value);
                }}
                className="form-input"
                disabled={isLoading}
              />
              {errors.email && <p className="error ml-2">{errors.email}</p>}
            </div>

            {/* Password */}
            <div className="flex flex-col">
              <label htmlFor="password">Password</label>
              <div className="form-input relative inline-flex items-center justify-between pr-3">
                <input
                  type={passwordVisible ? 'text' : 'password'}
                  id="password"
                  placeholder="Password |"
                  value={password}
                  onChange={(e) => {
                    const value = e.target.value;
                    setPassword(value);
                    validatePassword(value);
                  }}
                  className="outline-none border-none bg-transparent w-full p-0"
                  disabled={isLoading}
                />
                <div
                  className="cursor-pointer"
                  onClick={() => setPasswordVisible((prev) => !prev)}
                >
                  {passwordVisible ? (
                    <Eye size={14} color="#9ca3af" />
                  ) : (
                    <EyeOff size={14} color="#9ca3af" />
                  )}
                </div>
              </div>
              {errors.password && <p className="error ml-2">{errors.password}</p>}
            </div>

            <p 
              className="text-primary font-medium cursor-pointer text-sm flex justify-end w-full"
              onClick={handleForgetPassword}
            >
              Forgot Password?
            </p>

            {/* Submit Button */}
            <div className="mt-4 w-full">
              <Button 
                type="submit"
                className="py-2 w-full rounded-full text-xl font-semibold text-white"
                disabled={isLoading}
              >
                {isLoading ? 'SIGNING IN...' : 'RESUME JOURNEY'}
              </Button>
            </div>
          </form>

          {/* Divider */}
          <div className="mt-6 flex items-center justify-center w-full md:w-[30vw]">
            <div className="h-[2px] w-full bg-[#e0e0e0] relative">
              <p className="absolute -top-2 left-1/2 -translate-x-1/2 bg-white px-2 text-sm font-semibold">
                Or
              </p>
            </div>
          </div>

          {/* Social Login */}
          <div className="w-full md:w-[30vw] flex flex-col items-center">
            <button 
              type="button"
              className="provider-buttons mt-5" 
              onClick={()=>signInWithOAuth('google')}
              disabled={isLoading}
            >
              <Google size={20} />
              <p className="text-[#616161]">Login with Google</p>
            </button>
            
            <button 
              type="button"
              className="provider-buttons my-5" 
              onClick={()=>signInWithOAuth('linkedin')}
              disabled={isLoading}
            >
              <LinkedIn size={20} />
              <p className="text-[#616161]">Login with LinkedIn</p>
            </button>

            {/* New User */}
            <div className="flex justify-center gap-2">
              <h2 className="text-center">New User?</h2>
              <a href="/create-account" className="font-bold text-primary">
                CREATE ACCOUNT HERE
              </a>
            </div>
          </div>
        </div>
        )}
      </div>

      {/* Right Side */}
      <RightMenu />
    </div>
  );
}