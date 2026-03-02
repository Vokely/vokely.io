import Cookies from "js-cookie";
import { AuthService } from "./authUtils";
import { useAuthStore } from "@/store/authStore";

export async function customFetch(url, options = {}) {
  try {
    const csrfToken = Cookies.get('csrf-token')

    const headers = {
      'X-CSRF-Token': csrfToken,
      ...(options.headers || {})
    };

    const res = await fetch(url, {
      credentials: 'include',
      ...options,
      headers
    });

    if (res.status === 401) {
      // await AuthService.signOut();
      // useAuthStore.getState().clearUser();
      // window.location.href = '/signin';
      return; 
    }

    return res;
  } catch (err) {
    console.error('API fetch error:', err);
    throw err;
  }
}