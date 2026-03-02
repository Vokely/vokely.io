// components/CheckoutUI.jsx
'use client';
export default function CheckoutUI({ 
  onRetryCheckout, 
  loading = false, 
  error = null, 
  hasAttemptedCheckout = false 
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto ">
        {/* Header */}
        <div className="flex items-center justify-center ">
            <div className="w-auto h-[20vh] ">
              <img 
                src={`${process.env.NEXT_PUBLIC_BUCKET_URL}/images/checkout-banner.png`} 
                alt="Checkout illustration"
                className="w-full h-full object-contain"
              />
            </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Complete Your Purchase
            </h1>
            <p className="text-lg text-gray-600">
                You're just one step away from unlocking premium features
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center max-w-lg mx-auto">
          {/* Main Card */}
          <div className="w-full">
            <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8 relative overflow-hidden">
              {/* Sule background pattern */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10"></div>
              <div className="relative z-10">
                {hasAttemptedCheckout ? (
                  <div className="text-center space-y-2">
                   {/* Urgency indicator */}
                    <div className="p-2 bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl border border-orange-200/50 backdrop-blur-sm">
                    <div className="flex items-center space-y-2">
                        <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center mr-4">
                        <svg className="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        </div>
                        <div className="flex-1">
                        <p className="text-base font-semibold text-orange-800">Limited Time Offer</p>
                        <p className="text-sm text-orange-600">Special pricing ends soon!</p>
                        </div>
                    </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      Still thinking it over?
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Thousands of users are already enjoying premium features. Don't miss out!
                    </p>
                  </div>
                ) : (
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      Ready to get started?
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Join thousands of satisfied customers
                    </p>
                  </div>
                )}

                {error && (
                  <div className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200/50 rounded-xl p-4 mb-6 backdrop-blur-sm">
                    <div className="flex items-start">
                      <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                        <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-red-800 mb-1">
                          Payment Setup Error
                        </h4>
                        <p className="text-xs text-red-700 leading-relaxed">{error}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Main CTA Button */}
                <button
                  onClick={onRetryCheckout}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white font-bold py-5 px-8 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl disabled:opacity-50 disabled:transform-none shadow-xl my-6 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  {loading ? (
                    <div className="flex items-center justify-center relative z-10">
                      <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                      <span className="text-lg">Processing...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center relative z-10">
                      <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      <span className="text-lg">Complete Your Purchase</span>
                    </div>
                  )}
                </button>

                {/* Trust badges */}
                <div className="flex items-center justify-center space-x-6 mb-6 text-sm text-gray-500">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    SSL Secure
                  </div>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    30-Day Guarantee
                  </div>
                </div>

                {/* Secondary actions */}
                <div className="text-center space-y-3">
                  <p className="text-sm text-gray-500">
                    Having trouble? <a href="#" className="text-primary hover:text-primary/80 font-medium transition-colors">Contact support</a>
                  </p>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    By proceeding, you agree to our Terms of Service and Privacy Policy
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Social proof */}
        <div className="mt-16 text-center">
          <p className="text-gray-600 mb-6 text-lg">Trusted by over 10,000+ customers worldwide</p>
        </div>
      </div>
    </div>
  );
}