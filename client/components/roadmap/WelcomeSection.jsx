import useRoadmapStore from '@/store/roadmapStore';
import StatsSection from './StatsSection';

const WelcomeCard = ({ name, targetSkill, endDate}) => {
  const {stats} = useRoadmapStore()
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8 mb-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            Welcome back, {name}
          </h1>
          <p className="mt-1 text-gray-600">
            Let's bring your dream of mastering{' '}
            <span className="text-purple-600 font-bold uppercase">
              {targetSkill}
            </span></p>
        </div>

        <div className="mt-4 md:mt-0">
          <div className="flex items-center">
            <span className="text-sm text-gray-600 mr-2">Overall Progress:</span>
            <span className="font-semibold text-purple-600">
              {stats.totalCompletionPercentage}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
            <div
              className="bg-gradient-to-r from-purple-400 to-purple-600 h-2.5 rounded-full"
              style={{ width: `${stats.totalCompletionPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      <StatsSection stats={stats} endDate={endDate}/>
    </div>
  );
};

export default WelcomeCard;
