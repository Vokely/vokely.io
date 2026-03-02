'use client'
import { Check, ShieldAlert, ShieldQuestion, X } from 'lucide-react';
import { useState, useEffect } from 'react';

const PermissionsComponent = ({ onPermissionsGranted }) => {
  const [cameraPermission, setCameraPermission] = useState('pending');
  const [micPermission, setMicPermission] = useState('pending');
  // const [popupPermission, setPopupPermission] = useState('pending');
  const [isCheckingPermissions, setIsCheckingPermissions] = useState(false);

  // Check if permissions were already granted
  useEffect(() => {
    const checkExistingPermissions = async () => {
      try {
        // Check camera permission
        const cameraDevices = await navigator.mediaDevices.enumerateDevices();
        const cameras = cameraDevices.filter(device => device.kind === 'videoinput');
        if (cameras.length > 0) {
          // We can't directly check permission status, but we can try accessing
          try {
            await navigator.mediaDevices.getUserMedia({ video: true });
            setCameraPermission('granted');
          } catch {
            setCameraPermission('denied');
          }
        } else {
          setCameraPermission('unavailable');
        }
        
        // Check microphone permission
        const audioDevices = cameraDevices.filter(device => device.kind === 'audioinput');
        if (audioDevices.length > 0) {
          try {
            await navigator.mediaDevices.getUserMedia({ audio: true });
            setMicPermission('granted');
          } catch {
            setMicPermission('denied');
          }
        } else {
          setMicPermission('unavailable');
        }

        // For popup permission, we'll assume it's needed unless proven otherwise
        // setPopupPermission('unknown');
      } catch (error) {
        console.error("Error checking permissions:", error);
      }
    };

    checkExistingPermissions();
  }, []);

  const requestPermissions = async () => {
    setIsCheckingPermissions(true);
    
    try {
      // Request camera permission
      if (cameraPermission !== 'granted' && cameraPermission !== 'unavailable') {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          setCameraPermission('granted');
          // Stop the stream after checking
          stream.getTracks().forEach(track => track.stop());
        } catch (error) {
          setCameraPermission('denied');
          console.error("Camera permission denied:", error);
        }
      }
      
      // Request microphone permission
      if (micPermission !== 'granted' && micPermission !== 'unavailable') {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          setMicPermission('granted');
          // Stop the stream after checking
          stream.getTracks().forEach(track => track.stop());
        } catch (error) {
          setMicPermission('denied');
          console.error("Microphone permission denied:", error);
        }
      }
      
      // For popup permission, we can only notify users and test when attempting
      // setPopupPermission('granted');
      
      // Test popup by opening and closing a small window
      // const testPopup = window.open('about:blank', '_blank', 'width=1,height=1');
      // if (testPopup) {
      //   testPopup.close();
      //   setPopupPermission('granted');
      // } else {
      //   setPopupPermission('denied');
      // }
    } catch (error) {
      console.error("Error requesting permissions:", error);
    } finally {
      setIsCheckingPermissions(false);
    }
  };

  // Check if all required permissions are granted
  const allPermissionsGranted = () => {
    const isCameraGranted = cameraPermission === 'granted' || cameraPermission === 'unavailable';
    const isMicGranted = micPermission === 'granted' || micPermission === 'unavailable';
    // const isPopupGranted = popupPermission === 'granted';
    
    return isCameraGranted && isMicGranted;
  };

  // Call the parent callback when all permissions are granted
  useEffect(() => {
    if (allPermissionsGranted()) {
      onPermissionsGranted();
    }
  }, [cameraPermission, micPermission, onPermissionsGranted]);

  const getPermissionIcon = (status) => {
    switch(status) {
      case 'granted':
        return <span className="text-green-500">
            <Check size={16} />
        </span>;
      case 'denied':
        return <span className="text-red-500">
            <X size={16}/>
        </span>;
      case 'unavailable':
        return <span className="text-yellow-500"><ShieldAlert size={16} /></span>;
      default:
        return <span className="text-gray-400"><ShieldQuestion size={16} /></span>;
    }
  };

  return (
    <div className="bg-white rounded-lg p-4 shadow-md max-w-md mx-auto">
      <h2 className="text-lg font-semibold mb-4">Interview Permissions</h2>
      <p className="text-sm text-gray-600 mb-4">
        For the best interview experience, we need the following permissions:
      </p>
      
      <ul className="space-y-3 mb-4">
        <li className="flex items-center justify-between">
          <div>
            <span className="font-medium">Camera Access</span>
            <p className="text-xs text-gray-500">For video interview functionality</p>
          </div>
          <div>{getPermissionIcon(cameraPermission)}</div>
        </li>
        
        <li className="flex items-center justify-between">
          <div>
            <span className="font-medium">Microphone Access</span>
            <p className="text-xs text-gray-500">To record your responses</p>
          </div>
          <div>{getPermissionIcon(micPermission)}</div>
        </li>
{/*         
        <li className="flex items-center justify-between">
          <div>
            <span className="font-medium">Open New Tab</span>
            <p className="text-xs text-gray-500">Interview will open in a new tab</p>
          </div>
          <div>{getPermissionIcon(popupPermission)}</div>
        </li> */}
      </ul>
      
      {!allPermissionsGranted() && (
        <button
          onClick={requestPermissions}
          disabled={isCheckingPermissions}
          className={`w-full py-2 rounded-md font-medium ${
            isCheckingPermissions 
              ? 'bg-gray-300 text-gray-500' 
              : 'bg-primary text-white hover:bg-primary/90'
          }`}
        >
          {isCheckingPermissions ? 'Checking Permissions...' : 'Grant Permissions'}
        </button>
      )}
      
      {allPermissionsGranted() && (
        <div className="bg-green-50 border border-green-200 rounded-md p-3 text-sm text-green-800">
          All permissions granted! You're ready to start the interview.
        </div>
      )}
    </div>
  );
};

export default PermissionsComponent;