// components/auth/SignInPopup.tsx
'use client';
import { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';
import useToastStore from '@/store/toastStore';
import Google from '@/components/icons/Google';
import LinkedIn from '@/components/icons/LinkedIn';
import Loader from '@/components/reusables/Loader';
import '@/styles/login.css';

export default function SignInPopup({ onClose, onSuccess , title="SignIn"}) {
  const { signIn, checkAuth, user, loading } = useAuth();
  const setUser = useAuthStore((state) => state.setUser);
  const addToast = useToastStore((state) => state.addToast);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({ email: '', password: '' });

  const validateEmail = (value) => {
    if (!value) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Enter a valid email address';
    return '';
  };
  
  const validatePassword = (value) => {
    if (value.length < 6) return 'Password must be at least 6 characters';
    return '';
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
  
    setErrors({ email: emailError, password: passwordError });
  
    if (emailError || passwordError) return;
  
    setIsLoading(true);
    try {
      const result = await signIn(email, password);
      if (result?.user) {
        setUser(result.user);
        onSuccess();
        onClose();
      }
    } catch (error) {
      addToast(error.message || 'Login failed', 'error', 'top-middle', 3000);
    } finally {
      setIsLoading(false);
    }
  };  
  
  const signInWithOAuth = (provider) => {
    if (typeof window === "undefined") return;

    const popup = window.open(
      `/api/auth/${provider}`,
      "oauth-popup",
      "width=500,height=600"
    );

    if (!popup) {
      console.error("Popup blocked. Please allow popups for this site.", "error");
      return;
    }

    const checkPopupClosed = setInterval(async () => {
      try {
        const response = await checkAuth();

        if (response) {
          onSuccess();
          try {
            if (!popup.closed) {
              popup.close();
            }
          } catch (e) {
            console.warn("Could not close popup:", e);
          }
          clearInterval(checkPopupClosed);
          return;
        }

        // Safely check if popup is closed
        let isClosed = false;
        try {
          isClosed = popup.closed;
        } catch (e) {
          isClosed = true;
        }

        if (isClosed) {
          clearInterval(checkPopupClosed);
        }
      } catch (err) {
        console.error("Error checking auth:", err);
        clearInterval(checkPopupClosed);
      }
    }, 1000);
  };


  useEffect(() => {
    if (user && !loading) {
      setUser(user);
      onSuccess();
      onClose();
    }
  }, [user, loading]);

  if (loading || isLoading) return <Loader />;

  return (
    // <BackDropWrapper>
      <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
        <div className="p-6 w-full max-w-md bg-white shadow-sm shadow-white rounded-md">
            <h2 className="text-xl text-primary font-semibold mb-4 text-center">{title}</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <input
                type="email"
                placeholder="Email"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  validateEmail(e.target.value);
                }}
              />
              {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}

              <div className="relative">
                <input
                  type={passwordVisible ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    validatePassword(e.target.value);
                  }}
                  className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div
                  className="absolute top-2.5 right-3 cursor-pointer"
                  onClick={() => setPasswordVisible((prev) => !prev)}
                >
                  {passwordVisible ? <Eye size={16} /> : <EyeOff size={16} />}
                </div>
              </div>
              {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}

              <button type="submit" className="bg-primary text-white w-full py-2 rounded-full text-lg font-semibold">
                Sign In
              </button>
          </form>

            <div className="my-4 text-center text-sm text-gray-600">OR</div>

            <div className="flex flex-col gap-3">
              <button
                type="button"
                className="provider-buttons"
                onClick={() => signInWithOAuth('google')}
              >
                <Google size={18} /> <span>Login with Google</span>
              </button>
              <button
                type="button"
                className="provider-buttons"
                onClick={() => signInWithOAuth('linkedin')}
              >
                <LinkedIn size={18} /> <span>Login with LinkedIn</span>
              </button>
            </div>

            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <button
                  className="text-primary hover:text-primary-hover"
                  onClick={() => window.open('/create-account', '_blank')}
                >
                  Create Account
                </button>
              </p>
            </div>
          </div>
        </div>
      // </BackDropWrapper>
  );
}