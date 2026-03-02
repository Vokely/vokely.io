'use client'
import { useState, useContext, createContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/lib/authUtils';
import { useAuthStore } from '@/store/authStore';
const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const {user,setUser} = useAuthStore()
  const [loading, setLoading] = useState(true); // Start with loading true
  const router = useRouter();

  const checkAuth = async () => {
    try {
      const userData = await AuthService.getCurrentUser();
      setUser(userData);
      return userData;
    } catch (error) {
      console.log('Auth check failed:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const signIn = async (email, password, redirectPath = null) => {
    try {
      const result = await AuthService.signIn(email, password);
      const responseJson = await result.json()
      if (result.ok) {
        setUser(responseJson);
        
        // Use custom redirect path if provided, otherwise default behavior
        if (redirectPath) {
          router.push(redirectPath);
        } else if (responseJson.status === 'new' || responseJson?.onboarding_details?.status !== 'completed') {
          router.push(`${process.env.NEXT_PUBLIC_REDIRECT_URI || ''}/onboard`);
        } else {
          router.push(`${process.env.NEXT_PUBLIC_REDIRECT_URI || ''}/dashboard`);
        }
      }else{
        router.push(`/signin?error=${responseJson.detail}`)
      }
      return responseJson;
    } catch (error) {
      throw error;
    }
  };

  const signUp = async (name, email, password, redirectUrl = null) => {
    try {
      const result = await AuthService.signUp(name, email, password);
      const responseJson = await result.json()
      if (result.ok) {
        setUser(responseJson);
        
        // Check if there's a specific redirect URL
        if (redirectUrl) {
          router.push(redirectUrl);
        }
        // Otherwise, redirect based on user status
        else if (responseJson.status === 'new' || responseJson?.onboarding_details?.status !== 'completed') {
          router.push(`${process.env.NEXT_PUBLIC_REDIRECT_URI || ''}/onboard`);
        } else {
          router.push(`${process.env.NEXT_PUBLIC_REDIRECT_URI || ''}/dashboard`);
        }
      }else{
        router.push(`/create-account?error=${responseJson.detail}`)
      }
      return responseJson;
    } catch (error) {
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await AuthService.signOut();
      setUser(null);
      router.push('/signin');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};