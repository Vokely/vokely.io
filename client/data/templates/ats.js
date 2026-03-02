import External from "@/components/icons/External";
import { title } from "process";

export const atsTemplate = {
  personalInfo: {
    render: (content) => (
      <div className="flex justify-between items-end mb-[8px]">
        <div className="ml-[8px]">
          <h1 className="text-[16px]">
            <span className="font-bold">{content.firstName} {content.lastName}</span> - <span className="font-normal">{content.title}</span>
          </h1>
          <div className="text-[14px] text-[#6B7280]">
            <p>{content.email} | {content.phone}</p>
            <p>{content.location}</p>
          </div>
        </div>
        <div>
          {content.links?.map((link, i) => (
            <div className="flex items-center gap-[4px] w-full" key={i}>
              <a href={link.url} target="_blank" rel="noopener noreferrer" style={{ color: 'gray' }} className="flex items-center gap-[4px]">
                <span className="text-[14px] font-semibold text-[#1D4ED8]">{link.platform}</span>
                <External size="16" />
              </a>
            </div>
          ))}
        </div>
      </div>
    ),
    toHTML: (content) => `
      <div class="flex justify-between items-end mb-[8px]">
        <div class="ml-[8px]">
          <h1 className="text-[16px]">
            <span className="font-bold">${content.firstName} ${content.lastName}</span> -&nbsp; <span className="font-normal">${content.title}</span>
          </h1>
          <p class="text-[14px] text-[#6B7280]">${content.title}</p>
          <div class="text-[14px] text-[#6B7280]">
            <p>${content.email} | ${content.phone}</p>
            <p>${content.location}</p>
          </div>
        </div>
        <div>
          ${content.links ? content.links.map((link) => `
            <div class="flex items-center gap-[4px] w-full">
              <a href="${link.url}" target="_blank" rel="noopener noreferrer" style="color: gray" class="flex items-center gap-[4px]">
                <span class="text-[14px] font-semibold text-[#1D4ED8]">${link.platform}</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                  <polyline points="15 3 21 3 21 9"></polyline>
                  <line x1="10" y1="14" x2="21" y2="3"></line>
                </svg>
              </a>
            </div>
          `).join('') : ''}
        </div>
      </div>
    `
  },

  summary: {
    render: (content) => (
      <div className="">
        <h2 className="bg-gray-200 rounded-md text-center text-[16px] font-semibold">Summary</h2>
        <p className="text-[14px] ml-[8px] py-1">{content}</p>
      </div>
    ),
    toHTML: (content) => `
      <div class="">
        <h2 class="bg-gray-200 rounded-md text-center text-[16px] font-semibold">Summary</h2>
        <p class="text-[14px] ml-[8px] py-1">${content}</p>
      </div>
    `
  },

  skills: {
    render: (content) => (
      <div className="">
        <div className="bg-gray-200 rounded-sm text-center">
          <h2 className="text-[16px] font-semibold mb-1">Skills</h2>
        </div>
        <div className="flex flex-col flex-wrap gap-[8px] my-1 ml-[8px]">
          {Object.entries(content).map(([category, skillsList]) => (
            <div key={category} className="flex flex-wrap items-center">
              <h3 className="text-[14px] font-semibold capitalize mr-1">{category.replace("_", " ")}</h3>
              {skillsList.map((skill, i) => (
                <p key={i} className="text-[14px] bg-gray-200 p-[4px] text-gray-600 mr-1 text-sm px-1 py-1/2 mb-1 rounded ml-[4px]">
                  {skill}
                </p>
              ))}
            </div>
          ))}
        </div>
      </div>
    ),
    toHTML: (content) => `
      <div class="">
        <div class="bg-gray-200 rounded-sm text-center">
          <h2 class="text-[16px] font-semibold mb-1">Skills</h2>
        </div>
        <div class="flex flex-col flex-wrap gap-[8px] my-1 ml-[8px]">
          ${Object.entries(content).map(([category, skillsList]) => `
            <div class="flex flex-wrap items-center">
              <h3 class="text-[14px] font-semibold capitalize mr-1">${category.replace("_", " ")}:</h3>
              ${skillsList.map(skill => `
                <p class="text-[14px] bg-gray-200 text-gray-600 mr-1 text-sm px-1 py-1/2 mb-1 rounded ml-[4px]">${skill}</p>
              `).join('')}
            </div>
          `).join('')}
        </div>
      </div>
    `
  },

  heading: {
    render: (content) => (
      <div className="bg-gray-200 rounded-sm text-center py-[4px] my-1">
        <h2 className="text-[16px] font-semibold">{content}</h2>
      </div>
    ),
    toHTML: (content) => `
      <div class="bg-gray-200 rounded-sm text-center py-[4px] my-1">
        <h2 class="text-[16px] font-semibold">${content}</h2>
      </div>
    `
  },
  

  experience: {
    render: (item) => (
      <div className="">
        <h3 className="text-[16px] font-semibold">{item.title}</h3>
        <div className="flex items-center justify-between">
          <p className="text-[14px] text-[#6B7280]">
            {item.company} | {item.location}
          </p>
          <p className="text-[14px] text-[#6B7280]">
            {item.startDate} - {item.endDate}
          </p>
        </div>
        {item.description.map((desc, idx) => (
          <li key={idx} className="text-[14px] list-disc ml-[16px]">{desc}</li>
        ))}
      </div>
    ),
    toHTML: (item) => `
      <div class="">
        <h3 class="text-[16px] font-semibold">${item.title}</h3>
        <div class="flex items-center justify-between">
          <p class="text-[14px] text-[#6B7280]">
            ${item.company} | ${item.location}
          </p>
          <p class="text-[14px] text-[#6B7280]">
            ${item.startDate} - ${item.endDate}
          </p>
        </div>
        ${item.description.map(desc => `
          <li class="text-[14px] list-disc ml-[16px]">${desc}</li>
        `).join('')}
      </div>
    `
  },

  education: {
    render: (item) => (
      <div className="grid grid-cols-4 gap-[12px] text-[14px] ml-[8px]">
        <p className="w-fit">{item.degree}</p>
        <p className="w-fit">{item.school}</p>
        <p className="w-fit">{item.startDate} - {item.endDate}</p>
        <p className="w-fit">{item.gpa}</p>
      </div>
    ),
    toHTML: (item) => `
      <div class="grid grid-cols-4 gap-[12px] text-[14px] ml-[8px]">
        <p class="w-fit">${item.degree}</p>
        <p class="w-fit">${item.school}</p>
        <p class="w-fit">${item.startDate} - ${item.endDate}</p>
        <p class="w-fit">${item.gpa || ''}</p>
      </div>
    `
  },

  projects: {
    render: (item) => (
      <div className="">
        <h3 className="text-[16px] font-semibold inline-flex items-center gap-[4px]">
          {item.name}
          <a href={item.link} target="_blank" rel="noopener noreferrer" style={{ color: 'gray' }}>
            <External size="16" />
          </a>
        </h3>
        {item.description.map((desc, idx) => (
          <li key={idx} className="text-[14px] list-disc ml-[16px]">{desc}</li>
        ))}
      </div>
    ),
    toHTML: (item) => `
      <div class="">
        <h3 class="text-[16px] font-semibold inline-flex items-center gap-[4px]">
          ${item.name}
          <a href="${item.link}" target="_blank" rel="noopener noreferrer" style="color: gray">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
          </a>
        </h3>
        ${item.description.map(desc => `
          <li class="text-[14px] list-disc ml-[16px]">${desc}</li>
        `).join('')}
      </div>
    `
  },

  achievements: {
    render: (item) => (
      <ul className="list-disc list-inside mt-[8px] ml-[8px]">
        <li className="text-[14px] mb-1/2">{item}</li>
      </ul>
    ),
    toHTML: (item) => `
      <ul class="list-disc list-inside mt-[8px] ml-[8px]">
        <li class="text-[14px] mb-1/2">${item}</li>
      </ul>
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
      <li className="text-[14px] list-disc ml-[16px]">{content}</li>
    ),
    toHTML: (content) => `
      <li class="text-[14px] list-disc ml-[16px]">${content}</li>
    `
  },

  experienceHeading: {
    render: (item) => (
      <div className="">
        <h3 className="text-[16px] font-semibold">{item.title}</h3>
        <div className="flex items-center justify-between">
          <p className="text-[14px] text-[#6B7280]">
            {item.company} | {item.location}
          </p>
          <p className="text-[14px] text-[#6B7280]">
            {item.startDate} - {item.endDate}
          </p>
        </div>
      </div>
    ),
    toHTML: (item) => `
      <div class="">
        <h3 class="text-[16px] font-semibold">${item.title}</h3>
        <div class="flex items-center justify-between">
          <p class="text-[14px] text-[#6B7280]">
            ${item.company} | ${item.location}
          </p>
          <p class="text-[14px] text-[#6B7280]">
            ${item.startDate} - ${item.endDate}
          </p>
        </div>
      </div>
    `
  },

  projectHeading: {
    render: (item) => (
      <div className="">
        <h3 className="text-[16px] font-semibold inline-flex items-center gap-[4px]">
          {item.name}
          {item.link && (
            <a href={item.link} target="_blank" rel="noopener noreferrer" style={{ color: 'gray' }}>
              <External size="16" />
            </a>
          )}
        </h3>
      </div>
    ),
    toHTML: (item) => `
      <div class="">
        <h3 class="text-[16px] font-semibold inline-flex items-center gap-[4px]">
          ${item.name}
          ${item.link ? `
            <a href="${item.link}" target="_blank" rel="noopener noreferrer" style="color: gray">
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

export const getATSTemplate = (item) => {
  if (item.type === "personalInfo") return atsTemplate.personalInfo;
  if (item.type === "summary") return atsTemplate.summary;
  if (item.type === "skills") return atsTemplate.skills;
  if (item.type === "heading") return atsTemplate.heading;
  if (item.type === "bullet") return atsTemplate.bullet;
  if (item.type === "experienceHeading") return atsTemplate.experienceHeading;
  if (item.type === "projectHeading") return atsTemplate.projectHeading;
  if (item.type === "item") {
    switch (item.section) {
      case "experience": return atsTemplate.experience;
      case "education": return atsTemplate.education;
      case "projects": return atsTemplate.projects;
      case "achievements": return atsTemplate.achievements;
      case "certifications": return atsTemplate.certifications;
      default: return null;
    }
  }
  return null;
};