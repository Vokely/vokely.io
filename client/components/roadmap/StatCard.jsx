// components/StatsCard.jsx

import React from 'react';

const StatsCard = ({ icon, bgColor, iconBgColor, label, value }) => {
  return (
    <div className={`${bgColor} rounded-lg p-4 flex items-start`}>
      <div className={`${iconBgColor} rounded-md p-2 mr-3`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-600">{label}</p>
        <p className="text-lg font-semibold text-gray-800">{value}</p>
      </div>
    </div>
  );
};

export default StatsCard;