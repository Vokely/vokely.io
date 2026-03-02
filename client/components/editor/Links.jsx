import { useState } from "react";
import { geLinkFields } from "@/data/editor";
import { Plus, Save, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import "@/styles/editor.css";
import DropDown from "../icons/DropDown";
import EditName from "../icons/EditName";
import NoData from "./NoData";

export default function LinksSection({template="Simple",socialLinks,addLink,updateLinks,removeLink}) {
  const [isOpen, setIsOpen] = useState(false);
  const [openIndex, setOpenIndex] = useState(null);

  if(socialLinks== null || socialLinks.length ===0){
    return (<NoData category="Links" handleClick={()=>{addLink();setIsOpen(true);setOpenIndex(socialLinks.length);}}/>)
  }
  // const {socialLinks, addSocialLink:addLink, updateSocialLink:updateLinks, removeSocialLink:removeLink } = useProfileStore()
  return (
    <div className="editor mx-2">
      {socialLinks.map((link, index) => (
        <div key={index} className="mb-4 border-[1px] border-halfwhite rounded-xl w-full hover:border-primary smooth">
          <div className="space-y-4 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-normal font-semibold">
                  {link.platform}
                </h3>
                <button onClick={() => {setIsOpen((cur)=>!cur);setOpenIndex(index)}}>
                    <EditName size="22px" color="red" className="cursor-pointer"/>
                </button>
              </div>
              <button
                onClick={() => {
                  setIsOpen((cur) => !cur);
                  setOpenIndex(index);
                }}
                className="bg-transparent hover:bg-none"
              >
                {isOpen && openIndex === index ? (
                  <div className="rotate-180 cursor-pointer">
                    <DropDown size="32" />
                  </div>
                ) : (
                  <Trash2 size="22px" color="red" onClick={()=>removeLink(index)}/>
                )}
              </button>
            </div>

            {isOpen && openIndex === index && (
              geLinkFields(socialLinks, updateLinks, index).map((row) => (
                <div key={row.row} className={row.fields[0].type === "textarea" ? "" : "grid grid-cols-2"}>
                  {row.fields.map((field) => (
                    <div key={field.id} className="flex flex-col">
                      <label htmlFor={field.id}>{field.label}</label>
                      {field.type === "file" ? (
                        <input id={field.id} type={field.type} onChange={field.onChange} />
                      ) : (
                        <input id={field.id} type={field.type} value={field.value} onChange={field.onChange} />
                      )}
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>

          {/* Buttons */}
          {isOpen && openIndex === index && (
            <div className="border-t-[#bababa] border-[1px] p-4 flex justify-between">
              <button
                onClick={() => {setIsOpen((cur) => !cur);setOpenIndex(null);removeLink(index)}}
                className="px-4 py-2 rounded-full flex gap-2 items-center hover:bg-[#FBEBE7] text-[#FB4A1D] transition-all duration-300 ease-in-out"
              >
                <Trash2 size={20} color="#ff5c5c" />
                <span>Delete</span>
              </button>
              <button
                onClick={() => {
                  setIsOpen((cur) => !cur);
                  setOpenIndex(null);
                }}
                className="px-4 py-2 rounded-full flex gap-2 items-center bg-[#F6F1FD] hover:bg-[#dbc2ff] text-[#7E4CCC] transition-all duration-300 ease-in-out"
              >
                <Save size={20} color="#7E4CCC" />
                <span>Save</span>
              </button>
            </div>
          )}
        </div>
      ))}
      <Button onClick={()=>{addLink();setIsOpen(true);setOpenIndex(socialLinks.length);}} className="add-button w-fit">
        <Plus className="h-4 w-4 mr-2" />
        Add Link
      </Button>
    </div>
  );
}
