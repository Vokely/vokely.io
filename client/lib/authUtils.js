// lib/authUtils.js - Authentication utility functions
import { customFetch } from "./apiWrapper";
import { signUp as signUpAPI, signIn as signInAPI } from "./fetchUtil"; // alias to avoid naming conflict

export class AuthService {
    static async signUp(name, email, password) {
      try {
        const response = await signUpAPI(name, email, password );
        return response;
      } catch (error) {
        console.error("Signup failed:", error);
        throw error;
      }
    }
  
    static async signIn(email, password) {
      try {
        const response = await signInAPI(email, password);
        return response;
      } catch (error) {
        throw error;
      }
    }
  
    static async signOut() {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_CURRENT_URL}/api/auth/signout`);
        return response
      } catch (error) {
        throw error;
      }
    }
  
    static async getCurrentUser() {
      try {
        const response = await customFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/me`);
  
        if (!response.ok) {
          return null;
        }
  
        const userData = await response.json();
        return userData;
      } catch (error) {
        console.error('Get current user error:', error);
        return null;
      }
    }
  
    static async makeAuthenticatedRequest(url, options = {}) {
      const defaultOptions = {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      };
  
      const mergedOptions = { ...defaultOptions, ...options };
  
      try {
        const response = await fetch(url, mergedOptions);
        return response;
      } catch (error) {
        console.error('Authenticated request error:', error);
        throw error;
      }
    }
  }
  