import { CheckCheck, CircleX, Copy } from 'lucide-react';
import React, { useState } from 'react';

export default function Suggestion({ data, onClose }) {
  const [displayedText, setDisplayedText] = useState("");
  const [showPopUp, setShowPopUp] = useState(false);

  // useEffect(() => {
  //   if (!data) return;

  //   setDisplayedText(""); // Reset before revealing text
  //   let index = 0;

  //   const interval = setInterval(() => {
  //     if (index < data.length) {
  //       setDisplayedText((prev) => prev + data.charAt(index)); // Fix undefined issue
  //       index++;
  //     } else {
  //       clearInterval(interval);
  //     }
  //   }, 10);

  //   return () => clearInterval(interval);
  // }, [data]);

  const copyToClipboard = () => {
    setShowPopUp(true);
    navigator.clipboard.writeText(data);
    const timer = setTimeout(() => {setShowPopUp(false);onClose();}, 2000);

    return () => clearTimeout(timer);     
  };

  return (
    <div className="bg-white relative rounded-md overflow-y-scroll border-[1px] border-gray-200 px-4 py-2">
      {/* Close Button */}
      <button 
        onClick={onClose} 
        className="float-end text-red-500 hover:scale-105 smooth"
      >
        <CircleX />
      </button>
      {/* Animated Text */}
      <p className="text-gradient">{data}</p>

      {/* Copy Button */}
      <div className='flex gap-2 w-full items-center justify-end'>
      <p className={`text-sm ${showPopUp ? 'text-green-500' : 'text-gray-500'}`}>{showPopUp ? 'Copied to Clipboard' : 'Copy to Clipboard'}</p>
      {showPopUp ? (
        <span className='text-green-500'>
          <CheckCheck size={16}/>
        </span>
      ):(
        <button 
        onClick={copyToClipboard} 
        className="text-gray-500 hover:text-gray-700"
      >
        <Copy size={14} />
      </button>
      )}
      </div>
    </div>
  );
}
