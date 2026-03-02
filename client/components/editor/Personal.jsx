import { getPersonalInfoFields } from "@/data/editor";
import "@/styles/editor.css";
import { useMemo, useState } from "react"; 
import Profile from "../icons/Profile";
import { handleProfileUpload } from "@/lib/fetchUtil";
import useToastStore from "@/store/toastStore";

const PersonalInfoSection = ({ template="Simple",personalInfo,updatePersonalInfo,isProfile="false",resumeId=null }) => {
  const personaldata = useMemo(() => getPersonalInfoFields(personalInfo, updatePersonalInfo), [personalInfo, updatePersonalInfo]);
  const [useLoginEmail, setUseLoginEmail] = useState(false);
  // Add a state to track image timestamp for cache busting
  const [imageTimestamp, setImageTimestamp] = useState(Date.now());
  const addToast = useToastStore((state) => state.addToast);
  const [isLoading,setIsLoading] = useState(false);

  const getValidFields = (index) => {
    return personaldata[index].fields.filter((field) =>
      field.included_in.includes(template)
    );
  };
  const handleImageChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setIsLoading(true)
      const formData = new FormData();
      formData.append("file", file);
      try {
        const response = await handleProfileUpload(formData,isProfile,resumeId);
        if(!response.ok){
          throw new Error("Error Occured while updating resume")
        }
        const responseJson = await response.json()
        if (responseJson.imageUrl) {
          const updatedUrl = getImageUrl(responseJson.imageUrl)
          updatePersonalInfo("profileImage", updatedUrl);
          updatePersonalInfo("imgFileName", responseJson.filename);
          setImageTimestamp(Date.now());
        }
        addToast('Image Uploaded Successfully','success','top-middle',3000)
      } catch (error) {
        addToast(error.message,'error','top-middle',3000)
        console.error("Error uploading profile image:", error);
      }finally{
        setIsLoading(false)
      }
    }
  };

  // Function to create cache-busted image URL
  const getImageUrl = (url) => {
    // Add timestamp as query parameter to prevent caching
    return `${url}?t=${imageTimestamp}`;
  };

  return (
    <div className="space-y-2 h-full mx-2">
      {personaldata.map((row, rowIndex) => (
        <div key={rowIndex} className="row">
          {row.fields
            .filter((field) => field.included_in.includes(template))
            .map((field) => (
              <div key={field.id} className="flex flex-col flex-1">
                <label htmlFor={field.id}>{field.label}</label>
                {field.type === "file" ? (
                  <div className="flex items-center gap-4">
                    <label className="relative w-10 h-10 rounded-full overflow-hidden border border-gray-300 cursor-pointer">
                      <input
                        type="file"
                        id={field.id}
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                      {(personalInfo.profileImage?.length)>0 ? (
                        <img
                          src={getImageUrl(personalInfo.profileImage)}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs">
                          <Profile size="16" color="gray"/>
                        </div>
                      )}
                    </label>
                    {isLoading && (
                      <span className="text-yellow-500">Uploading..</span>
                    )}
                    {/* <span className="text-sm text-gray-600">{personalInfo.imgFileName || "No file selected"}</span> */}
                  </div>
                ) : field.type === "textarea" ? (
                  <textarea
                    id={field.id}
                    value={field.value}
                    onChange={field.onChange}
                    rows={field.rows || 4}
                    className="font-medium border-[1px] border-halfwhite hover:border-primary rounded-lg"
                  />
                ) : (
                  <input
                    id={field.id}
                    type={field.type}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder={field.placeholder || ""}
                    className={`border-[1px] border-halfwhite hover:border-primary rounded-lg input-colored ${field.id === "location" ? "w-[45%]" : ""}`}
                    disabled={field.type === "email" && useLoginEmail}
                  />
                )}
              </div>
            ))}
        </div>
      ))}
    </div> 
  );
};

export default PersonalInfoSection;