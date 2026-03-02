'use client';
import { useEffect, useState } from 'react';
import { fetchShareableLinkById, verifyShareableLinkPassword } from '@/lib/externalLinksUtil';
import InterviewSummary from '@/components/interviewer/InterviewSummary';
import Spinner from '@/components/reusables/Spinner';

export default function Page({ params }) {
  const feedback_id = params.feedback_id;
  const [shareableLink, setShareableLink] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPasswordProtected, setIsPasswordProtected] = useState(false);
  const [password, setPassword] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    const getLink = async () => {
      setIsLoading(true);
      try {
        const response = await fetchShareableLinkById(feedback_id);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Failed to load interview data');
        }
        
        const data = await response.json();
        
        if (data.protected && data.requires_password) {
          setIsPasswordProtected(true);
          setShareableLink(data); // Store basic info without the protected data
        } else {
          setShareableLink(data);
        }
      } catch (error) {
        console.error('Failed to fetch shareable link:', error);
        setError(error.message || 'Failed to load interview data. Please try again later.');
      } finally {
        setIsLoading(false);
      }     
    };
    
    getLink();
  }, [feedback_id]);

  const handlePasswordVerification = async (e) => {
    e.preventDefault();
    setIsVerifying(true);
    setPasswordError('');
    
    try {
      const response = await verifyShareableLinkPassword(feedback_id, password);
      
      if (!response.ok) {
        if (response.status === 401) {
          setPasswordError('Incorrect password. Please try again.');
        } else {
          const errorData = await response.json();
          setPasswordError(errorData.detail || 'Verification failed. Please try again.');
        }
        return;
      }
      
      const data = await response.json();
      setShareableLink(data);
      setIsPasswordProtected(false);
    } catch (error) {
      console.error('Password verification failed:', error);
      setPasswordError('Verification failed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center">
          <Spinner/>
          <p className="mt-4 text-lg font-medium text-gray-700">Loading interview data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="rounded-lg bg-red-50 p-6 text-center">
          <p className="text-lg font-medium text-red-800">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (isPasswordProtected) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <div className="w-full max-w-md rounded-lg border bg-white p-8 shadow-md">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold text-gray-800">Password Protected</h2>
            <p className="mt-2 text-gray-600">
              This interview summary for {shareableLink?.candidate_name || 'candidate'} is password protected.
            </p>
          </div>
          
          <form onSubmit={handlePasswordVerification}>
            <div className="mb-4">
              <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="Enter password"
                required
              />
              {passwordError && (
                <p className="mt-2 text-sm text-red-600">{passwordError}</p>
              )}
            </div>
            
            <button
              type="submit"
              disabled={isVerifying || !password}
              className="w-full rounded-md bg-indigo-600 py-2 px-4 text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-indigo-400"
            >
              {isVerifying ? 'Verifying...' : 'Access Interview Summary'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div>
      {shareableLink?.data ? (
        <InterviewSummary 
          conclusion={shareableLink.data} 
          isPublic={true} 
          candidateName={shareableLink.candidate_name}
        />
      ) : (
        <div className="flex h-screen w-full items-center justify-center">
          <p className="text-lg font-medium text-gray-700">No interview data found</p>
        </div>
      )}
    </div>
  );
}