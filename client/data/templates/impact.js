import External from "@/components/icons/External";

export const impactTemplate = {
  personalInfo: {
    render: (content) => (
      <div className="border-b-2 border-b-black">
        <h1 className="text-2xl font-bold">
          {content.firstName} {content.lastName}
          <span className="text-[#1F2937] font-normal text-[20px]">
            {content.title && `- ${content.title}`}
          </span>
        </h1>
        <div className="flex gap-2 text-[#1F2937]">
          <p>{content.email}</p>
          <p>{content.phone}</p>
          <p>{content.location}</p>
        </div>
      </div>
    ),
    toHTML: (content) => `
      <div class="border-b-2 border-b-black">
        <h1 class="text-2xl font-bold">
          ${content.firstName} ${content.lastName}
          <span class="text-[#1F2937] font-normal text-[20px]">
            ${content.title ? `- ${content.title}` : ''}
          </span>
        </h1>
        <div class="flex gap-2 text-[#1F2937]">
          <p>${content.email}</p>
          <p>${content.phone}</p>
          <p>${content.location}</p>
        </div>
      </div>
    `
  },

  summary: {
    render: (content) => (
      <div className="flex flex-col gap-[8px]">
        <p className="text-[14px] my-1 text-[#1F2937]">{content}</p>
      </div>
    ),
    toHTML: (content) => `
      <div class="flex flex-col gap-[8px]">
        <p class="text-[14px] my-1 text-[#1F2937]">${content}</p>
      </div>
    `
  },

  skills: {
    render: (content) => (
      <div className="">
        {content && Object.keys(content).length > 0 && (
          <>
            <h2 className="text-normal uppercase font-semibold text-black">
              CORE COMPETENCIES
            </h2>
            <div>
              {Object.entries(content).map(([category, skillsList]) =>
                Array.isArray(skillsList) && skillsList.length > 0 && (
                  <div key={category}>
                    <h3 className="capitalize text-[#374151] text-[14px] font-semibold">
                      {category.replace("_", " ")}
                    </h3>
                    <div className="flex flex-wrap items-center">
                      {skillsList.map((skill, i) => (
                        <p
                          key={i}
                          className="text-[14px] text-[#4B5563] mb-1 px-2 bg-gray-100 mr-1 rounded-sm"
                        >
                          {skill}
                        </p>
                      ))}
                    </div>
                  </div>
                )
              )}
            </div>
          </>
        )}
      </div>
    ),
    toHTML: (content) => `
      <div class="">
        ${content && Object.keys(content).length > 0 ? `
          <h2 class="text-normal uppercase font-bold text-black">
            CORE COMPETENCIES
          </h2>
          <div>
            ${Object.entries(content)
              .map(([category, skillsList]) =>
                Array.isArray(skillsList) && skillsList.length > 0
                  ? `
                    <div>
                      <h3 class="capitalize text-[#374151] text-[14px] font-semibold">
                        ${category.replace("_", " ")}
                      </h3>
                      <div class="flex flex-wrap items-center">
                        ${skillsList
                          .map(
                            (skill) => `
                            <p class="text-[14px] text-[#4B5563] px-2 bg-gray-100 mr-1 rounded-sm">
                              ${skill}
                            </p>
                          `
                          )
                          .join("")}
                      </div>
                    </div>
                  `
                  : ""
              )
              .join("")}
          </div>
        ` : ""}
      </div>
    `
  },

  heading: {
    render: (content) => (
      <h2 className="text-normal font-bold uppercase text-black mt-[4px]">
        {content}
      </h2>
    ),
    toHTML: (content) => `
      <h2 class="text-normal font-bold uppercase text-black mt-[4px]">
        ${content}
      </h2>
    `
  },

  experience: {
    render: (item) => (
      <div className="">
        <h3 className="text-[16px] font-semibold text-[#374151]">{item.title}</h3>
        <div className="flex items-center justify-between text-[14px]">
          <p className="text-[#374151] font-semibold">
            {item.company} | {item.location}
          </p>
          <p className="text-gray-500">
            {item.startDate} - {item.endDate}
          </p>
        </div>
        {item.description.map((list, idx) => (
          <li key={idx} className="text-[14px] text-[#4B5563] list-disc marker:text-[#374151]">
            {list}
          </li>
        ))}
      </div>
    ),
    toHTML: (item) => `
      <div class="">
        <h3 class="text-[16px] font-semibold text-[#374151]">${item.title}</h3>
        <div class="flex items-center justify-between text-[14px]">
          <p class="text-[#374151] font-semibold">
            ${item.company} | ${item.location}
          </p>
          <p class="text-gray-500">
            ${item.startDate} - ${item.endDate}
          </p>
        </div>
        ${item.description
          .map(
            (list) => `
          <li class="text-[14px] text-[#4B5563] list-disc marker:text-[#374151]">
            ${list}
          </li>
        `
          )
          .join("")}
      </div>
    `
  },

  education: {
    render: (item) => (
      <div className="text-normal">
        <p className="text-[16px] font-semibold text-[#374151]">{item.degree}</p>
        <div className="flex justify-between">
          <p className="text-[14px] text-[#4B5563]">{item.school}</p>
          <p className="text-[14px] text-[#4B5563]">
            {item.startDate} - {item.endDate}
            <span className="text-[14px]">{item.gpa && ` | GPA: ${item.gpa}`}</span>
          </p>
        </div>
      </div>
    ),
    toHTML: (item) => `
      <div class="text-normal">
        <p class="text-[16px] font-semibold text-[#374151]">${item.degree}</p>
        <div class="flex justify-between">
          <p class="text-[14px] text-[#4B5563]">${item.school}</p>
          <p class="text-[14px] text-[#4B5563]">
            ${item.startDate} - ${item.endDate}
            <span class="text-[14px]">${item.gpa ? ` | GPA: ${item.gpa}` : ""}</span>
          </p>
        </div>
      </div>
    `
  },

  projects: {
    render: (item) => (
      <div className="">
        <h3 className="text-[16px] text-[#374151] font-semibold inline-flex items-center gap-1">
          {item.name}
          <a href={item.link} target="_blank" rel="noopener noreferrer" style={{ color: "gray" }}>
            <External size="16" />
          </a>
        </h3>
        {item.description.map((list, idx) => (
          <li key={idx} className="text-[14px] text-[#4B5563] list-disc marker:text-[#374151]">
            {list}
          </li>
        ))}
      </div>
    ),
    toHTML: (item) => `
      <div class="">
        <h3 class="text-[16px] text-[#374151] font-semibold inline-flex items-center gap-1">
          ${item.name}
          <a href="${item.link}" target="_blank" rel="noopener noreferrer" style="color: gray;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
          </a>
        </h3>
        ${item.description
          .map(
            (list) => `
          <li class="text-[14px] text-[#4B5563] list-disc marker:text-[#374151]">
            ${list}
          </li>
        `
          )
          .join("")}
      </div>
    `
  },

  achievements: {
    render: (item) => (
      <li className="text-[14px] text-[#4B5563]">{item}</li>
    ),
    toHTML: (item) => `
      <li class="text-[14px] text-[#4B5563]">${item}</li>
    `
  },

  certifications: {
    render: (item) => (
      <li className="text-[14px] text-[#4B5563]">{item}</li>
    ),
    toHTML: (item) => `
      <li class="text-[14px] text-[#4B5563]">${item}</li>
    `
  },

  bullet: {
    render: (content) => (
      <li className="text-[14px] text-[#4B5563] list-disc marker:text-[#374151]">
        {content}
      </li>
    ),
    toHTML: (content) => `
      <li class="text-[14px] text-[#4B5563] list-disc marker:text-[#374151]">
        ${content}
      </li>
    `
  },

  experienceHeading: {
    render: (item) => (
      <div className="">
        <h3 className="text-[16px] font-semibold text-[#374151]">{item.title}</h3>
        <div className="flex items-center justify-between text-[14px]">
          <p className="text-[#374151] font-semibold">
            {item.company} | {item.location}
          </p>
          <p className="text-gray-500">
            {item.startDate} - {item.endDate}
          </p>
        </div>
      </div>
    ),
    toHTML: (item) => `
      <div class="">
        <h3 class="text-[16px] font-semibold text-[#374151]">${item.title}</h3>
        <div class="flex items-center justify-between text-[14px]">
          <p class="text-[#374151] font-semibold">
            ${item.company} | ${item.location}
          </p>
          <p class="text-gray-500">
            ${item.startDate} - ${item.endDate}
          </p>
        </div>
      </div>
    `
  },

  projectHeading: {
    render: (item) => (
      <div className="">
        <h3 className="text-[16px] text-[#374151] font-semibold inline-flex items-center gap-1">
          {item.name}
          {item.link && (
            <a href={item.link} target="_blank" rel="noopener noreferrer" style={{ color: "gray" }}>
              <External size="16" />
            </a>
          )}
        </h3>
      </div>
    ),
    toHTML: (item) => `
      <div class="">
        <h3 class="text-[16px] text-[#374151] font-semibold inline-flex items-center gap-1">
          ${item.name}
          ${item.link ? `
            <a href="${item.link}" target="_blank" rel="noopener noreferrer" style="color: gray;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15 3 21 3 21 9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
              </svg>
            </a>
          ` : ''}
        </h3>
      </div>
    `
  }
};

// Helper function to get the appropriate template
export const getImpactTemplate = (item) => {
  if (item.type === "personalInfo") return impactTemplate.personalInfo;
  if (item.type === "summary") return impactTemplate.summary;
  if (item.type === "skills") return impactTemplate.skills;
  if (item.type === "heading") return impactTemplate.heading;
  if (item.type === "bullet") return impactTemplate.bullet;
  if (item.type === "experienceHeading") return impactTemplate.experienceHeading;
  if (item.type === "projectHeading") return impactTemplate.projectHeading;
  
  if (item.type === "item") {
    switch (item.section) {
      case "experience": return impactTemplate.experience;
      case "education": return impactTemplate.education;
      case "projects": return impactTemplate.projects;
      case "achievements": return impactTemplate.achievements;
      case "certifications": return impactTemplate.certifications;
      default: return null;
    }
  }
  return null;
};