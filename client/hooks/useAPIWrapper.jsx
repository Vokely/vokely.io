import { useState } from 'react';
import useToastStore from '@/store/toastStore';

export default function useAPIWrapper() {
  const addToast = useToastStore((state) => state.addToast);
  const [loading, setLoading] = useState(false);

  const callApi = async (apiFn, ...args) => {
    setLoading(true);
    try {
      const response = await apiFn(...args);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Something went wrong');
      }

      return data;
    } catch (error) {
      addToast(error.message, 'error', 'top-middle', 3000);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { callApi, loading };
}
