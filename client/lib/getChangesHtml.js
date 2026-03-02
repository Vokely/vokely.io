export const getChangesHTML = (data, category,clickHandler,addedItems,handleSkillChange,addedSkills,handleAddedSkills,selectedExperience, handleExperienceChange,selectedProjects,handleProjectSelection,
    setAddedSkills,setAddedItems,setSelectedExperience,setSelectedProjects
) => {  
    switch (category) {
        case "Personal Info":
            return(
            <div className="w-full">
                <p className='text-gradient'>{data}</p>
                <div className='flex flex-col w-full md:flex-row items-center mt-1 md:w-[50%] gap-2'>
                        <button className='w-full bg-primary py-1 rounded-full text-white px-3' onClick={()=>{clickHandler(data)}}>Add {category}</button>
                        <button className='w-full py-1 rounded-full border-primary border-[1px]'>Add later</button>
                </div> 
            </div>
            );

        case "Projects":
            return (
                <div>
                <div className="mb-3">
                    {data.modified.length > 0 && (
                        <>
                            <h2>Enhance existing projects</h2>
                            {data.modified.map((modified_proj, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={selectedProjects.modified.some(item => item.project_name === modified_proj.project_name)}
                                        onChange={(e) => {handleProjectSelection("modified", modified_proj, e.target.checked)}}
                                        className="h-3 w-3"
                                    />
                                    <p className="text-gradient">{modified_proj.project_name}</p>
                                </div>
                            ))}
                        </>
                    )}

                    {data.added.length > 0 && (
                        <>
                            <h2>Add relevant projects</h2>
                            {data.added.map((added_proj, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={selectedProjects.added.some(item => item.project_name === added_proj.project_name)}
                                        onChange={(e) => handleProjectSelection("added", added_proj, e.target.checked)}
                                        className="h-3 w-3"
                                    />
                                    <p className="text-gradient">{added_proj.project_name}</p>
                                </div>
                            ))}
                        </>
                    )}

                    {data.removed.length > 0 && (
                        <>
                            <h2>Remove irrelevant projects</h2>
                            {data.removed.map((removed_proj, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={selectedProjects.removed.some(item => item.project_name === removed_proj.project_name)}
                                        onChange={(e) => handleProjectSelection("removed", removed_proj, e.target.checked)}
                                        className="h-3 w-3"
                                    />
                                    <p className="text-gradient">{removed_proj}</p>
                                </div>
                            ))}
                        </>
                    )}
                </div>

                <div className='flex flex-col w-full md:flex-row gap-2 items-center mt-1 md:ww-[50%]'>
                        <button 
                            className='w-full flex-1 bg-primary py-1 rounded-full text-white px-3' 
                            onClick={() => {setSelectedProjects({modified: [],added: [],removed: []}); clickHandler(data); }}
                        >
                            Apply all changes
                        </button>
                        <button className='w-full flex-1 py-1 rounded-full border-primary border-[1px]' 
                        onClick={()=>{setSelectedProjects({modified: [],added: [],removed: []}); clickHandler(selectedProjects)}}>
                             {selectedProjects.modified.length > 0 || 
                                selectedProjects.added.length > 0 || 
                                selectedProjects.removed.length > 0 
                                    ? 'Apply selected changes' 
                                    : 'Add some projects'}
                        </button>
                    </div>
                </div>
            );  
            case "Skills":
                return (
                    <div>
                        {Object.entries(data).map(([category, skills]) => 
                            skills.length > 0 && ( 
                                <div key={category}>
                                    <h4 className="font-semibold text-[16px] capitalize">
                                        {category.replace("_", " ")}
                                    </h4>
                                    <div className="grid grid-cols-2 gap-2 mb-3">
                                        {skills.map((skill, i) => (
                                            <div className="flex gap-2 items-center" key={i}>
                                                <input
                                                    type="checkbox"
                                                    checked={addedSkills[category]?.includes(skill)}
                                                    id={`${category}-skill-${i}`} 
                                                    className="ml-3 h-3 w-3 cursor-pointer appearance-none accent-primary"
                                                    onChange={(e) => handleAddedSkills(category, skill, e.target.checked)}
                                                />
                                                <p>{skill}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )
                        )}
                        <div className='flex gap-2 flex-col md:flex-row items-center mt-1'>
                            <button className='w-full md:w-fit px-4 py-1 bg-primary text-white rounded-full' 
                                onClick={() => {setAddedSkills({ technical_skills: [], soft_skills: [] });clickHandler(data)}}
                            >
                                Add all Skills
                            </button>
                            <button 
                                className='w-full md:w-fit border-primary border-[1px] py-1 rounded-full text-primary px-3'
                                onClick={() => {setAddedSkills({ technical_skills: [], soft_skills: [] });clickHandler(addedSkills)}}
                            >
                                {addedSkills.technical_skills.length > 0 || addedSkills.soft_skills.length > 0
                                    ? `Add Selected Skills`
                                    : `Please add some skills`}
                            </button>
                        </div>
                    </div>
                );             
                case "Experience":
                    return (
                        <div>
                        {data.experienceModified.length > 0 && (
                            <>
                                <h3 className="mb-2 font-semibold text-gradient">Updated Experience</h3>
                                <div className="flex flex-wrap gap-5">
                                    {data.experienceModified.map((exp, i) => (
                                        <div className="flex items-center gap-1" key={i}>
                                            <input
                                            type="checkbox"
                                            checked={selectedExperience.some(item => item.company === exp.company)} 
                                            onChange={(e) => handleExperienceChange(exp, e.target.checked)}
                                            className="h-3 w-3"
                                            />
                                            <p key={i} className="flex h-fit">
                                                {exp.company}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}              
                    <div className='mt-5 flex flex-col md:flex-row items-center gap-2'>
                        <button className='w-full md:w-fit px-4 py-1 bg-primary text-white rounded-full'onClick={()=>{ setSelectedExperience([]); clickHandler(data.experienceModified)}}>Add all Changes</button>
                            <button className='w-full md:w-fit border-primary border-[1px]  py-1 rounded-full text-primary px-3' onClick={()=>{setSelectedExperience([]); clickHandler(selectedExperience)}}>
                                {selectedExperience.length > 0 ? `Enhance Selected ${category}` : `Please add some ${category}`}
                            </button>
                        </div> 
                        </div>
                    );                        
        case "Achievements":
            return (
                <div>
                    {data.map((ach, i) => (
                        <div className="flex gap-2 items-center" key={i}>
                        <input
                            type="checkbox"
                            checked={addedItems.includes(ach)}
                            id={`skill-${i}`} 
                            className="ml-3 h-3 w-3 cursor-pointer appearance-none accent-primary"
                            onChange={(e) => handleSkillChange(ach, e.target.checked)}
                            />
                        <p>{ach}</p>
                    </div>
                    ))}
                    <div className='mt-5 flex flex-col md:flex-row items-center gap-2'>
                    <button className='w-full md:w-fit px-4 py-1 bg-primary text-white rounded-full'onClick={()=>{setAddedItems([]); clickHandler(data)}}>Add all {category}</button>
                        <button className='w-full md:w-fit border-primary border-[1px]  py-1 rounded-full text-primary px-3' onClick={()=>{setAddedItems([]); clickHandler(addedItems)}}>
                            {addedItems.length > 0 ? `Add Selected ${category}` : `Please add some ${category}`}
                        </button>
                    </div> 
                </div>
            );

        default:
            return <p>No data found</p>;
    }
};