import External from "@/components/icons/External";

export const simpleTemplate = {
  personalInfo: {
    render: (content) => (
      <div className="text-center">
        <div className="flex items-center justify-center">
          <h1 className="text-lg font-bold">
            {content.firstName} {content.lastName}
          </h1>
          <p className="text-base text-gray-600">&nbsp;-&nbsp;{content.title}</p>
        </div>
        <div className="text-sm text-gray-600">
          <p>{content.email} | {content.phone} | {content.location}</p>
        </div>
      </div>
    ),
    toHTML: (content) => `
      <div class="text-center">
        <div class="flex items-center justify-center">
        <h1 class="text-lg font-bold">
          ${content.firstName} ${content.lastName}
        </h1>
        <p class="text-base text-gray-600">&nbsp;-&nbsp;${content.title}</p>
      </div>
      <div class="text-sm text-gray-600">
        <p>${content.email} | ${content.phone} | ${content.location}</p>
      </div>
      </div>
    `
  },

  summary: {
    render: (content) => (
      <div className="mt-2 flex flex-col gap-1">
        <h2 className="border-b border-gray-200 text-base font-semibold">Summary</h2>
        <p className="text-sm">{content}</p>
      </div>
    ),
    toHTML: (content) => `
      <div class="mt-2 flex flex-col gap-1">
        <h2 class="border-b border-gray-200 text-base font-semibold">Summary</h2>
        <p class="text-sm">${content}</p>
      </div>
    `
  },

  skills: {
    render: (content) => (
      <div className="mb-1">
        <div className="border-b border-gray-200">
          <h2 className="text-base font-semibold">Skills</h2>
        </div>
        <div className="flex flex-col gap-1 mt-1">
          {Object.entries(content).map(([category, skillsList]) => (
            skillsList.length > 0 && (
              <div key={category} className="flex flex-wrap items-center">
                <h3 className="text-sm font-bold capitalize">{category.replace("_", " ")}:</h3>
                {skillsList.map((skill, i) => (
                  <p key={i} className="text-sm px-1 border-r border-gray-400">{skill}</p>
                ))}
              </div>
            )
          ))}
        </div>
      </div>
    ),
    toHTML: (content) => `
      <div class="mb-1">
        <div class="border-b border-gray-200">
          <h2 class="text-base font-semibold">Skills</h2>
        </div>
        <div class="flex flex-col gap-1 mt-1">
          ${Object.entries(content)
            .filter(([_, skillsList]) => skillsList.length > 0)
            .map(([category, skillsList]) => `
              <div class="flex flex-wrap items-center">
                <h3 class="text-sm font-bold capitalize">${category.replace("_", " ")}:</h3>
                ${skillsList.map(skill => `
                  <p class="text-sm px-1 border-r border-gray-400">${skill}</p>
                `).join('')}
              </div>
            `).join('')}
        </div>
      </div>
    `
  },

  heading: {
    render: (content) => (
      <div>
        <h2 className="border-b border-gray-200 text-base font-semibold">{content}</h2>
      </div>
    ),
    toHTML: (content) => `
      <div>
        <h2 class="border-b border-gray-200 text-base font-semibold">${content}</h2>
      </div>
    `
  },

  experience: {
    render: (item) => (
      <div className="mb-1 mt-1">
        <h3 className="text-base font-semibold">{item.title}</h3>
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            {item.company} | {item.location}
          </p>
          <p className="text-sm text-gray-500">
            {item.startDate} - {item.endDate}
          </p>
        </div>
        {item.description.map((desc, idx) => (
          <li key={idx} className="text-sm list-disc ">{desc}</li>
        ))}
      </div>
    ),
    toHTML: (item) => `
      <div class="mb-1 mt-1">
        <h3 class="text-base font-semibold">${item.title}</h3>
        <div class="flex items-center justify-between">
          <p class="text-sm text-gray-600">
            ${item.company} | ${item.location}
          </p>
          <p class="text-sm text-gray-500">
            ${item.startDate} - ${item.endDate}
          </p>
        </div>
        ${item.description.map(desc => `
          <li class="text-sm list-disc ">${desc}</li>
        `).join('')}
      </div>
    `
  },
  education: {
    render: (item) => (
      <div className="grid grid-cols-4 gap-2 text-sm mt-1">
        <p className="w-fit">{item.degree}</p>
        <p className="w-fit">{item.school}</p>
        <p className="w-fit">{item.startDate} - {item.endDate}</p>
        <p className="w-fit">{item.gpa}</p>
      </div>
    ),
    toHTML: (item) => `
      <div class="grid grid-cols-4 gap-2 text-sm mt-1">
        <p class="w-fit">${item.degree}</p>
        <p class="w-fit">${item.school}</p>
        <p class="w-fit">${item.startDate} - ${item.endDate}</p>
        <p class="w-fit">${item.gpa || ''}</p>
      </div>
    `
  },
  projects: {
    render: (item) => (
      <div className="mb-1 mt-1">
        <h3 className="text-base font-semibold inline-flex items-center gap-1">
          {item.name}
          <a href={item.link} target="_blank" rel="noopener noreferrer" style={{ color: 'gray' }}>
            <External size="16" />
          </a>
        </h3>
        {item.description.map((desc, idx) => (
          <li key={idx} className="text-sm list-disc ">{desc}</li>
        ))}
      </div>
    ),
    toHTML: (item) => `
      <div class="mb-1 mt-1">
        <h3 class="text-base font-semibold inline-flex items-center gap-1">
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
          <li class="text-sm list-disc ">${desc}</li>
        `).join('')}
      </div>
    `
  },

  achievements: {
    render: (item) => (
      <li className="text-sm">{item}</li>
    ),
    toHTML: (item) => `
      <li class="text-sm">${item}</li>
    `
  },
  certifications: {
    render: (item) => (
      <li className="text-sm">{item}</li>
    ),
    toHTML: (item) => `
      <li class="text-sm">${item}</li>
    `
  },

  bullet: {
    render: (content) => (
      <li className="text-sm list-disc">{content}</li>
    ),
    toHTML: (content) => `
      <li class="text-sm list-disc">${content}</li>
    `
  },

  experienceHeading: {
    render: (item) => (
      <div className="mb-1 mt-1">
        <h3 className="text-base font-semibold">{item.title}</h3>
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            {item.company} | {item.location}
          </p>
          <p className="text-sm text-gray-500">
            {item.startDate} - {item.endDate}
          </p>
        </div>
      </div>
    ),
    toHTML: (item) => `
      <div class="mb-1 mt-1">
        <h3 class="text-base font-semibold">${item.title}</h3>
        <div class="flex items-center justify-between">
          <p class="text-sm text-gray-600">
            ${item.company} | ${item.location}
          </p>
          <p class="text-sm text-gray-500">
            ${item.startDate} - ${item.endDate}
          </p>
        </div>
      </div>
    `
  },

  projectHeading: {
    render: (item) => (
      <div className="mb-1 mt-1">
        <h3 className="text-base font-semibold inline-flex items-center gap-1">
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
      <div class="mb-1 mt-1">
        <h3 class="text-base font-semibold inline-flex items-center gap-1">
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

export const getSimpleTemplate = (item) => {
  if (item.type === "personalInfo") return simpleTemplate.personalInfo;
  if (item.type === "summary") return simpleTemplate.summary;
  if (item.type === "skills") return simpleTemplate.skills;
  if (item.type === "heading") return simpleTemplate.heading;
  if (item.type === "bullet") return simpleTemplate.bullet;
  if (item.type === "experienceHeading") return simpleTemplate.experienceHeading;
  if (item.type === "projectHeading") return simpleTemplate.projectHeading;
  if (item.type === "item") {
    switch (item.section) {
      case "experience": return simpleTemplate.experience;
      case "education": return simpleTemplate.education;
      case "projects": return simpleTemplate.projects;
      case "achievements": return simpleTemplate.achievements;
      case "certifications": return simpleTemplate.certifications;
      default: return null;
    }
  }
  return null;
};