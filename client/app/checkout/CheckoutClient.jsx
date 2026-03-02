'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { DodoPayments } from 'dodopayments-checkout';
import CheckoutUI from '@/components/checkout/CheckoutUI';

export default function CheckoutClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const productId = searchParams.get('productId');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sdkInitialized, setSdkInitialized] = useState(false);
  const [useOverlay, setUseOverlay] = useState(true);
  const [showCheckoutUI, setShowCheckoutUI] = useState(false);
  const [hasAttemptedCheckout, setHasAttemptedCheckout] = useState(false);

  useEffect(() => {
    if (useOverlay && !sdkInitialized) {
      try {
        DodoPayments.Initialize({ 
          publicKey: process.env.NEXT_PUBLIC_DODO_PUBLIC_KEY,
          mode: process.env.NEXT_PUBLIC_DODO_ENVIRONMENT || 'test',
          displayType: 'overlay',
          theme: 'light',
          linkType: 'static',
          onEvent: (event) => {
            console.log('Checkout event:', event);

            switch (event.event_type) {
              case 'checkout.opened':
                console.log('Checkout overlay opened');
                setLoading(false);
                setHasAttemptedCheckout(true);
                break;
              case 'checkout.closed':
                console.log('Checkout overlay closed');
                setLoading(false);
                setShowCheckoutUI(true); // Show the persuasive UI
                break;
              case 'checkout.redirect':
                // Handle successful payment
                console.log('Payment successful, redirecting...');
                router.push('/dashboard');
                break;
              case 'checkout.error':
                console.error('Checkout error:', event.data);
                setError(`Checkout error: ${event.data?.message || 'Unknown error'}`);
                setLoading(false);
                setShowCheckoutUI(true);
                break;
              default:
                console.log('Unknown checkout event:', event.event_type);
            }
          }
        });
        setSdkInitialized(true);
        console.log('Dodo Payments SDK initialized for overlay checkout');
      } catch (error) {
        console.error('Failed to initialize Dodo SDK:', error);
        setUseOverlay(false); 
      }
    }
  }, [router]);

  console.log(DodoPayments.mode)
  useEffect(() => {
    if (sdkInitialized && user) {
      // Auto-open checkout when page loads
      createCheckoutSession();
    }
  }, [sdkInitialized, user]);

  const createCheckoutSession = async () => {
    console.log('Creating checkout session...', { 
      productId, 
      user: user?.email, 
      useOverlay,
      sdkInitialized 
    });
    
    if (!productId) {
      setError('Product ID is required');
      return;
    }
    if (!user) {
      console.log('User not found')
      router.push('/signin')
    }
    setLoading(true);
    setError(null);

    try {
      if (useOverlay && sdkInitialized) {
        console.log('Opening overlay checkout with:', {
          productId,
          redirectUrl: `${window.location.origin}/dashboard`,
          email: user.email,
          name: user.name || user.email?.split('@')[0]
        });

        try {
          await DodoPayments.Checkout.open({
            products: [
              {
                productId: productId,
                quantity: 1,
              },
            ],
          redirectUrl: `${window.location.origin}/dashboard`,
            queryParams: {
              email: user.email,
              name: user.name || user.email?.split('@')[0],
              disableEmail: "true"
            },
          });

          return;
        } catch (overlayError) {
          setError(`Overlay checkout failed: ${overlayError.message}. Try switching to redirect checkout or contact support.`);
          setLoading(false);
          setShowCheckoutUI(true);
        }
      }
    } catch (exception) {
      console.log('Exception occurred:', exception)
      setLoading(false);
      setShowCheckoutUI(true);
    }
  }

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-2 text-gray-600">Checking authentication...</p>
          </div>
        </div>
      </div>
    );
  }

  if (showCheckoutUI) {
    return (
      <CheckoutUI 
        onRetryCheckout={createCheckoutSession}
        loading={loading}
        error={error}
        hasAttemptedCheckout={hasAttemptedCheckout}
      />
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      {loading && (
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {useOverlay && sdkInitialized
              ? 'Opening Payment Overlay...'
              : 'Setting Up Your Checkout...'}
          </h3>
          <p className="text-gray-600">
            {useOverlay && sdkInitialized
              ? 'Your secure payment form is loading'
              : 'Creating your secure checkout session'}
          </p>
          <div className="mt-4 flex items-center justify-center">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            </div>
          </div>
        </div>
      )}

      {!productId && (
        <div className="text-center">
          <p className="text-red-600">No product ID provided</p>
        </div>
      )}
    </div>
  );
}