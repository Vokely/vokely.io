import { getExperienceFields } from "@/data/editor";
import "@/styles/editor.css"
import { Plus, Save, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { useState } from "react";
import EditName from "../icons/EditName";
import DropDown from "../icons/DropDown";
import NoData from "./NoData";

const ExperienceSection = ({template="Simple",experience, updateExperience,removeExperience,addExperience}) => {
  // const { experience, updateExperience,removeExperience,addExperience } = useProfileStore()
  const [isOpen,setIsOpen] = useState(false)
  const [openIndex,setOpenIndex] = useState(null);
  if(experience== null || experience.length ===0){
    return (<NoData category="Experience" handleClick={()=>{addExperience();setIsOpen(true);setOpenIndex(experience.length);}}/>)
  }
  return (
    <div className="editor mx-2">
      {experience.map((exp, index) => (
        <div key={index} className="mb-4 border-[1px] border-halfwhite rounded-xl hover:border-primary smooth">
          <div className="space-y-4 p-4">
              <div className="flex items-center md:justify-between">
                <div className="flex items-center gap-4">
                  <h3 className="text-normal font-semibold">{exp.title} at {exp.company}</h3>
                  <button onClick={() => {setIsOpen((cur)=>!cur);setOpenIndex(index)}}>
                    <EditName size="22px" color="red" className="cursor-pointer"/>
                  </button>
                </div>
                <button
                size="icon"
                className="bg-transparent hover:bg-none"
                >
                {isOpen ? (
                  <div className="rotate-180 cursor-pointer" onClick={() => {setIsOpen((cur)=>!cur);setOpenIndex(index)}}><DropDown size="32"/></div>
                ) : (
                  <Trash2 color="red" size="20" onClick={()=>{removeExperience(index)}} className="hover:scale-125 smooth"/>
                )}
                </button>
              </div>
              {(isOpen && openIndex === index) && (
                getExperienceFields(experience, updateExperience, index).map((row) => (
                  <div key={row.row} className={`${row.fields[0].type === "textarea" ? "": "grid grid-cols-2"}`}>
                    {row.fields.map((field) => (
                      <div key={field.id} className="flex flex-col">
                        <label htmlFor={field.id}>{field.label}</label>
                        {field.type === "textarea" ? (
                            <textarea
                            id={field.id}
                            value={field.value}
                            onChange={field.onChange}
                            rows={field.rows || 3}
                          />
                        ) : (
                          <input
                            id={field.id}
                            type={field.type}
                            value={field.value}
                            onChange={field.onChange}
                            className="input-colored"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                ))
              )
              }
          </div>

          {/* Buttons */}
         {isOpen && openIndex===index && (
           <div className="border-t-[#bababa] border-[1px] p-4 flex justify-between">
           <button onClick={()=>{setIsOpen((cur)=>!cur);setOpenIndex(null);removeExperience(index)}} className="px-4 py-2 rounded-full flex gap-2 items-center hover:bg-[#FBEBE7] text-[#FB4A1D] transition-all duration-300 ease-in-out">
               <Trash2 size={20} color="#ff5c5c"/>
               <span>Delete</span>
           </button>
           <button onClick={() => {setIsOpen((cur)=>!cur);setOpenIndex(null)}} className="px-4 py-2 rounded-full flex gap-2 items-center bg-[#F6F1FD] hover:bg-[#dbc2ff] text-[#7E4CCC] transition-all duration-300 ease-in-out">
               <Save size={20} color="#7E4CCC" />
               <span>Save</span>
           </button>
           </div>
         )  
         }
        </div>
      ))}
        <Button onClick={()=>{addExperience();setIsOpen(true);setOpenIndex(experience.length);}} className="add-button w-fit">
          <Plus className="h-4 w-4 mr-2" />
          Add Experience
        </Button>
      </div>
  );
};

export default ExperienceSection;