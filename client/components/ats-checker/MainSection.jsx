// components/MainSection.jsx
export const MainSection = ({ title, children }) => {
    return (
      <div className="bg-white rounded-lg shadow-sm border-l-4 border-blue-500">
        <div className="p-6">
          <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
        </div>
      </div>
    );
  };
  