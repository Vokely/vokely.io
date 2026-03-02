import { Button } from "../ui/button";
import { Plus, X } from "lucide-react";
import NoData from "./NoData";

export default function SkillsSection({skills, addSkill, updateSkill, removeSkill, heading = "Skill" }) {
  const hasSkills = (skills!== undefined && skills) && (Object.values(skills).some((skillsList) => skillsList.length > 0))
  const addSkillCustom = ()=>{
    addSkill("technical_skills", `New Skill`)
  }
  if (!hasSkills) {
    return (
      <NoData category="Skills" handleClick={addSkillCustom}/>
    )
  }
  return (
    <div className="space-y-4 flex flex-col">
      {Object.entries(skills).map(([category, skillsList]) => (
        <div key={category}>
          <h3 className="text-lg font-semibold capitalize">{category.replace("_", " ")}</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-2 border-blue-400">
            {skillsList.map((skill, index) => (
              <div
                key={index}
                className="px-1 group flex items-center justify-between gap-2 text-black border-[1px] border-halfwhite hover:border-primary rounded-lg relative my-[5px]"
              >
                <input
                  value={skill}
                  onChange={(e) => updateSkill(category, index, e.target.value)}
                  placeholder="Enter skill"
                  className="border-none outline-none focus:border-none w-[85%]"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => removeSkill(category, index)}
                  className="rounded-full h-[30px] w-[30px] cursor-pointer hover:border-red-500 opacity-0 group-hover:opacity-100 smooth"
                >
                  <X className="stroke-red-500" size={16} />
                </Button>
              </div>
            ))}
          </div>
          <Button
            variant="default"
            onClick={() => addSkill(category, `New ${heading}`)}
            className="add-button"
          >
            <Plus className="h-4 w-4 mr-2" strokeWidth={3} />
            <span>Add {heading}</span>
          </Button>
        </div>
      ))}
    </div>
  );
}
