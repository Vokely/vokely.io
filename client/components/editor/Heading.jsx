import { useEffect, useState } from "react";
import EditName from "../icons/EditName";
import { updateResume } from "@/lib/resumeUtils";
import { usePathname } from "next/navigation";

export default function EditableHeading({ currentResume, setCurrentResume }) {

  const [isEditing, setIsEditing] = useState(false); // Track edit mode
  const [tempValue, setTempValue] = useState(""); 
  const pathname = usePathname();
  const pathSegments = pathname.split("/");
  const resumeId = pathSegments[pathSegments.length - 1]; // Get last part of URL
  
  const handleEditClick = () => {
    setIsEditing(true); // Enter edit mode
  };

  const handleBlur = async () => {
    setIsEditing(false); // Exit edit mode
    setCurrentResume(tempValue); // Save the updated value
    await updateResume(resumeId,null, null, tempValue)
  };

  const handleChange = (e) => {
    setTempValue(e.target.value); // Update temporary value
  };

  const handleKeyDown = async(e) => {
    if (e.key === "Enter") {
      await handleBlur(); // Save and exit edit mode when Enter is pressed
    }
  };

  useEffect(() => {
    setTempValue(currentResume)
  }, [currentResume])
  

  return (
  <div className="flex flex-wrap sm:flex-nowrap gap-2 sm:gap-3 items-center text-sm sm:text-base md:text-lg">
    {isEditing ? (
      <input
        type="text"
        value={tempValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        autoFocus
        className="border-b border-gray-300 focus:border-primary outline-none px-2 py-1 w-full sm:w-auto text-sm sm:text-base"
      />
    ) : (
      <h2
        onClick={handleEditClick}
        className="cursor-pointer break-words text-sm sm:text-base md:text-lg max-w-[90vw] sm:max-w-none"
      >
        {currentResume}
      </h2>
    )}
    <span
      onClick={handleEditClick}
      className="cursor-pointer text-gray-700 hover:text-primary"
    >
      <EditName size={18} className="sm:size-[20px]" />
    </span>
  </div>
  );
}