'use client'
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Loader from '@/components/reusables/Loader';
import { useAuthStore } from '@/store/authStore';

export default function CallbackHandler() {
  const {setUser} = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    const { name, email, token } = Object.fromEntries(new URLSearchParams(window.location.search));

    if (!email || !name || !token) {
      router.push('/signin');
      return;
    }

    const login = async () => {
      const jsonBody = { name, email, provider: 'google' }
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/authenticate-user`, {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
              'X-OAUTH-TOKEN': `Bearer ${token}`,  
            },
            body: JSON.stringify(jsonBody),
          });
          
        const data = await response.json();
        setUser(data)
        if (!response.ok) {
          router.push(`/signin?error=${data.detail}`);
          return;
        }

        // Use redirect parameter if provided, otherwise default behavior
        let path;
        if (data.status === 'new' || data?.onboarding_details?.status !== 'completed') {
          path = '/onboard';
        } else {
          path = '/dashboard';
        }

        router.push(path);
      } catch (err) {
        console.error('Handler error:', err);
        router.push('/signin');
      }
    };

    login();
  }, [router]);

  return <Loader fullText="Authorizing user.."/>;
}