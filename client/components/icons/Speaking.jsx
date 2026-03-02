import  { useState, useEffect } from 'react';

export default function Speaking({ isSpeaking,small }) {
  const [heights, setHeights] = useState([25, 15, 20]); // Initial heights

  useEffect(() => {
    if (isSpeaking) {
      const interval = setInterval(() => {
        setHeights([
          Math.floor(Math.random() * 20) + 10, // Random height between 10px and 30px
          Math.floor(Math.random() * 25) + 10,
          Math.floor(Math.random() * 20) + 10,
        ]);
      }, 300); // Change every 300ms

      return () => clearInterval(interval);
    } else {
      setHeights([25, 15, 20]); // Reset when speaking stops
    }
  }, [isSpeaking]);

  return (
    <div className="flex items-center gap-1">
      {heights.map((height, index) => (
        <i
          key={index}
          className={`bg-primary rounded-full ${small ? 'w-1':'w-2'} transition-all duration-300`}
          style={{ height: `${small ? '5' : height}px` }}
        ></i>
      ))}
    </div>
  );
}
