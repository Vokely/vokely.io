import { Plus, Trash2, } from "lucide-react";
import { Button } from "../ui/button";
import "@/styles/editor.css";
import useProfileStore from "@/store/profileStore";
import NoData from "./NoData";

export default function AchievementsSection({items, addItem, updateItem,removeItem,heading}) {
  // const {achievements, addAchievement, updateAchievement,removeAchievement} = useProfileStore();
  const customAdd = ()=>{
    addItem(`New ${heading}`)
  }
  if(items== null || items.length ===0){
    return (<NoData category={heading} handleClick={customAdd}/>)
  }
  return (
    <div className="mx-2">
      {items.map((achievement, index) => (
        <div key={index} className="p-2 mb-4 border-[1px] border-halfwhite hover:border-primary smooth rounded-xl flex justify-between items-center">
          {heading === "Achievement" ? (
            <textarea rows="2" type="text" value={achievement} className="border-none text-normal font-semibold" onChange={(e)=>(updateItem(index,e.target.value))}/>
          ) : (
            <input type="text" value={achievement} className="border-none text-normal font-semibold" onChange={(e)=>(updateItem(index,e.target.value))}/>
          )}
              <Trash2 size={22} color="red"className="cursor-pointer hover:scale-125 transition-all ease-in-out duration-300 mr-2" onClick={()=>removeItem(index)}/>
        </div>
        ))}
        <Button onClick={()=>addItem(`New ${heading}`)} className="add-button w-fit">
          <Plus className="h-4 w-4 mr-2" />
          Add {heading}
        </Button>
      </div>
  )
}