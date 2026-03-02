import useProfileStore from "@/store/profileStore";
import { User } from "lucide-react";

export default function UserProgress({ percentage }) {
  const {personalInfo} = useProfileStore();
  const getColor = (percentage) => {
    if (percentage <= 30) return '#f02a2a';
    if (percentage <= 50) return '#ff9800';
    if (percentage <= 70) return '#7ce980';
    if (percentage <= 89) return 'rgb(143,86,232)';
    return 'conic-gradient(from 90deg at 50% 50%, #fb4a1d 0%, #f48164 22%, #e7439d 48%, #6684ff 69.5%, #843bf8 87%, #a03cf8 100%)';
  };

  const scoreColor = getColor(percentage);
  return (
    <div className="score-container">
        <div className="relative w-[50px] h-[50px] rounded-full border-[8px] border-transparent flex items-center justify-center">
          <div
            className="circle-fill" 
            style={{
              background: percentage > "89" ? scoreColor : `conic-gradient(${scoreColor} ${percentage}%, #e0e0e0 ${percentage}%)`,
            }}
          />
          <div className="absolute w-[30px] h-[30px] bg-white rounded-full flex items-center justify-center">
            <div className="h-full w-full rounded-full">
              {personalInfo.profileImage ? (
                <div className="img-container h-[100%] w-[100%] rounded-full bg-black">
                  <img src={personalInfo.profileImage} alt="profile-image"/>
                  </div>
              ):(
              <div className="grid place-items-center w-[100%] h-[100%]"><User size="16"/></div>
              )}
            </div>
          </div>
        </div>
    </div>
  );
}

