import React, { useEffect, useState } from 'react';

export const ScoreGauge = ({
  score = 0,
  maxScore = 100,
  size = 200,
  strokeWidth = 20,
  showScore = true,
  showLabel = true,
  label = 'Score',
  arcColor = '#22c55e',
  needleColor = '#374151',
}) => {
  const radius = (size - strokeWidth) / 2;
  const needleLength = radius - 10;

  const [needleAngle, setNeedleAngle] = useState(0);

  useEffect(() => {
    const normalizedScore = Math.min(Math.max(score / maxScore, 0), 1);
    const targetAngle = 180 * normalizedScore;

    // Start animation after 1s
    const startTimeout = setTimeout(() => {
      const interval = setInterval(() => {
        setNeedleAngle((prevAngle) => {
          if (Math.abs(prevAngle - targetAngle) < 1) {
            clearInterval(interval);
            return targetAngle;
          }

          // Animate step-by-step (adjust speed here)
          const step = 4; // degrees per frame
          return prevAngle < targetAngle
            ? Math.min(prevAngle + step, targetAngle)
            : Math.max(prevAngle - step, targetAngle);
        });
      }, 10); // Every 50ms
    }, 500); // Delay start by 1s

    return () => clearTimeout(startTimeout);
  }, [score, maxScore]);

  // Calculate needle position
  const needleAngleRad = (needleAngle * Math.PI) / 180;
  const needleX = Math.cos(Math.PI - needleAngleRad) * needleLength;
  const needleY = -Math.sin(Math.PI - needleAngleRad) * needleLength;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size / 2 + 40 }}>
        <svg width={size} height={size / 2 + 40} viewBox={`0 0 ${size} ${size / 2 + 40}`}>
          {/* Arc */}
          <path
            d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${
              size - strokeWidth / 2
            } ${size / 2}`}
            fill="none"
            stroke={arcColor}
            strokeWidth={strokeWidth}
          />

          {/* Needle */}
          <g transform={`translate(${size / 2}, ${size / 2})`}>
            <line
              x1="0"
              y1="0"
              x2={needleX}
              y2={needleY}
              stroke={needleColor}
              strokeWidth="3"
              strokeLinecap="round"
            />
            <circle cx="0" cy="0" r="6" fill={needleColor} />
          </g>

          {/* Score text */}
          {showScore && (
            <text
              x={size / 2}
              y={size / 2 + 30}
              textAnchor="middle"
              className="text-2xl font-bold fill-gray-800"
            >
              {Math.round(score)}/{maxScore}
            </text>
          )}

          {/* Label */}
          {showLabel && (
            <text
              x={size / 2}
              y={size / 2 + 55}
              textAnchor="middle"
              className="text-sm fill-gray-600"
            >
              {label}
            </text>
          )}
        </svg>

        {/* Min/Max */}
        <div className="absolute bottom-0 left-0 text-xs text-gray-500">0</div>
        <div className="absolute bottom-0 right-0 text-xs text-gray-500">{maxScore}</div>
      </div>
    </div>
  );
};
