'use client';

import React, { useState, useEffect } from 'react';
import { createSubscription } from '../../../services/dodoPayments';

const EnhancedCheckout = ({ 
  productId, 
  productName = 'Subscription',
  productPrice,
  className = '',
  onSuccess,
  onError,
  onLoading,
  enableSDK = false,
  prefillData = {}
}) => {
  const [formData, setFormData] = useState({
    street: '',
    city: '',
    state: '',
    zipcode: '',
    country: 'IN',
    email: '',
    name: '',
    phone_number: '',
    ...prefillData
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  useEffect(() => {
    if (onLoading) {
      onLoading(loading);
    }
  }, [loading, onLoading]);

  const validateForm = () => {
    const errors = {};
    
    // Customer validation
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Email is invalid';
    
    // Billing address validation
    if (!formData.street.trim()) errors.street = 'Street address is required';
    if (!formData.city.trim()) errors.city = 'City is required';
    if (!formData.state.trim()) errors.state = 'State is required';
    if (!formData.zipcode.trim()) errors.zipcode = 'ZIP code is required';
    if (!/^\d+$/.test(formData.zipcode)) errors.zipcode = 'ZIP code must be numeric';
    
    // Terms validation
    if (!agreedToTerms) errors.terms = 'You must agree to the terms and conditions';
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setValidationErrors({});

    if (!validateForm()) {
      return;
    }

    if (!productId) {
      setError('Product ID is required');
      return;
    }

    setLoading(true);

    try {
      const subscriptionData = {
        billing: {
          city: formData.city,
          country: formData.country,
          state: formData.state,
          street: formData.street,
          zipcode: parseInt(formData.zipcode),
        },
        customer: {
          email: formData.email,
          name: formData.name,
          phone_number: formData.phone_number || undefined,
          customer_id: `customer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        },
        product_id: productId,
        payment_link: true,
        return_url: `${window.location.origin}/subscription/success`,
        quantity: 1,
      };

      const result = await createSubscription(subscriptionData, enableSDK);

      if (onSuccess) {
        onSuccess(result);
      }

      // Redirect to payment link
      window.location.href = result.payment_link;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Subscription creation failed';
      setError(errorMessage);
      
      if (onError) {
        onError(err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const renderInput = (field, label, type = 'text', required = true, options = null) => {
    const hasError = validationErrors[field];
    
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label} {required && '*'}
        </label>
        {options ? (
          <select
            value={formData[field]}
            onChange={(e) => handleInputChange(field, e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
              hasError 
                ? 'border-red-300 focus:ring-red-500' 
                : 'border-gray-300 focus:ring-blue-500'
            }`}
            required={required}
          >
            {options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            type={type}
            value={formData[field]}
            onChange={(e) => handleInputChange(field, e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
              hasError 
                ? 'border-red-300 focus:ring-red-500' 
                : 'border-gray-300 focus:ring-blue-500'
            }`}
            required={required}
          />
        )}
        {hasError && (
          <p className="mt-1 text-sm text-red-600">{validationErrors[field]}</p>
        )}
      </div>
    );
  };

  const countryOptions = [
    { value: 'IN', label: 'India' },
    { value: 'US', label: 'United States' },
    { value: 'UK', label: 'United Kingdom' },
    { value: 'CA', label: 'Canada' },
    { value: 'AU', label: 'Australia' },
    { value: 'DE', label: 'Germany' },
    { value: 'FR', label: 'France' },
    { value: 'SG', label: 'Singapore' },
    { value: 'JP', label: 'Japan' },
  ];

  return (
    <div className={`max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg ${className}`}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Subscribe to {productName}</h2>
        {productPrice && (
          <p className="text-lg text-gray-600 mt-2">
            ${productPrice}/month
          </p>
        )}
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Customer Information</h3>
          
          {renderInput('name', 'Full Name')}
          {renderInput('email', 'Email Address', 'email')}
          {renderInput('phone_number', 'Phone Number', 'tel', false)}
        </div>

        {/* Billing Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Billing Address</h3>
          
          {renderInput('street', 'Street Address')}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderInput('city', 'City')}
            {renderInput('state', 'State')}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderInput('zipcode', 'ZIP Code', 'number')}
            {renderInput('country', 'Country', 'select', true, countryOptions)}
          </div>
        </div>

        {/* Terms and Conditions */}
        <div className="space-y-4">
          <div className="flex items-start">
            <input
              type="checkbox"
              id="terms"
              checked={agreedToTerms}
              onChange={(e) => {
                setAgreedToTerms(e.target.checked);
                if (validationErrors.terms) {
                  setValidationErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors.terms;
                    return newErrors;
                  });
                }
              }}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="terms" className="ml-2 text-sm text-gray-700">
              I agree to the{' '}
              <a href="/terms" target="_blank" className="text-blue-600 hover:underline">
                Terms and Conditions
              </a>{' '}
              and{' '}
              <a href="/privacy" target="_blank" className="text-blue-600 hover:underline">
                Privacy Policy
              </a>
            </label>
          </div>
          {validationErrors.terms && (
            <p className="text-sm text-red-600">{validationErrors.terms}</p>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Error
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  {error}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !agreedToTerms}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-semibold"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Creating Subscription...
            </div>
          ) : (
            `Subscribe Now ${productPrice ? `- $${productPrice}/month` : ''}`
          )}
        </button>

        {/* SDK Badge */}
        {enableSDK && (
          <div className="text-center">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Powered by Dodo SDK
            </span>
          </div>
        )}
      </form>
    </div>
  );
};

export default EnhancedCheckout;