export const creativeTemplate = {
  header: {
    render: (content) => (
      <div className="text-white p-2"> 
        <div className="mx-auto flex items-center gap-4">
          <div className={`relative img-conatiner w-32 h-32 mb-2 rounded-full overflow-hidden border-2 border-white/80 shadow-xl ${!content.userImage || content.userImage.length === 0 ? 'flex items-center justify-center' : ''}`}>
            {content.userImage && content.userImage.length > 0 ? (
              <img
                src={content.userImage}
                alt={`${content.personalInfo.firstName} ${content.personalInfo.lastName}`}
                className="object-cover h-[100%] w-[100%]"
              />
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" height={42} width={42} fill="currentColor" viewBox="0 0 448 512">
                <path d="M304 128a80 80 0 1 0 -160 0 80 80 0 1 0 160 0zM96 128a128 128 0 1 1 256 0A128 128 0 1 1 96 128zM49.3 464l349.5 0c-8.9-63.3-63.3-112-129-112l-91.4 0c-65.7 0-120.1 48.7-129 112zM0 482.3C0 383.8 79.8 304 178.3 304l91.4 0C368.2 304 448 383.8 448 482.3c0 16.4-13.3 29.7-29.7 29.7L29.7 512C13.3 512 0 498.7 0 482.3z"
                />
              </svg>
            )}
          </div>
          <div className="flex-1">
            <div className="flex gap-1 items-center">
              <h1 className="text-[24px] font-bold">
                {content.personalInfo.firstName} {content.personalInfo.lastName}
              </h1>
              <h1 className="text-[24px] opacity-90">-{content.personalInfo.title}</h1>
            </div>
            <div className="text-[14px] opacity-80">
              <p>{content.personalInfo.email} • {content.personalInfo.phone} • {content.personalInfo.location}</p>
            </div>
            {content.personalInfo.summary && (
              <p className="text-[14px] font-medium text-white/90 leading-relaxed pt-1 border-t border-white/20">
                {content.personalInfo.summary}
              </p>
            )}
          </div>
        </div>
      </div>
    ),
    toHTML: (content) => `
    <div class="text-white p-2">
      <div class="mx-auto flex items-center gap-4">
        <div class="relative img-conatiner w-32 h-32 mb-2 rounded-full overflow-hidden border-2 border-white/80 shadow-xl${!content.userImage || content.userImage.length === 0 ? ' flex items-center justify-center' : ''}">
          ${content.userImage && content.userImage.length > 0 ? `
            <img
              src="${content.userImage}"
              alt="${content.personalInfo.firstName} ${content.personalInfo.lastName}"
              style="object-cover; height: 100%; width: 100%;"
            />
          ` : `
            <svg xmlns="http://www.w3.org/2000/svg" height="42" width="42" fill="currentColor" viewBox="0 0 448 512">
              <path d="M304 128a80 80 0 1 0 -160 0 80 80 0 1 0 160 0zM96 128a128 128 0 1 1 256 0A128 128 0 1 1 96 128zM49.3 464l349.5 0c-8.9-63.3-63.3-112-129-112l-91.4 0c-65.7 0-120.1 48.7-129 112zM0 482.3C0 383.8 79.8 304 178.3 304l91.4 0C368.2 304 448 383.8 448 482.3c0 16.4-13.3 29.7-29.7 29.7L29.7 512C13.3 512 0 498.7 0 482.3z"/>
            </svg>
          `}
        </div>
        <div class="flex-1">
          <div class="flex gap-1 items-center">
            <h1 class="text-[24px] font-bold">
              ${content.personalInfo.firstName} ${content.personalInfo.lastName}
            </h1>
            <h1 class="text-[24px] opacity-90">-${content.personalInfo.title}</h1>
          </div>
          <div class="text-[14px] opacity-80">
            <p>${content.personalInfo.email} • ${content.personalInfo.phone} • ${content.personalInfo.location}</p>
          </div>
          ${content.personalInfo.summary ? `
            <p class="text-[14px] font-medium text-white/90 leading-relaxed pt-1 border-t border-white/20">
              ${content.personalInfo.summary}
            </p>
          ` : ''}
        </div>
      </div>
    </div>
    `
},

  summary: {
    render: (content) => (
      <div className="mb-12 text-lg text-gray-900/80 leading-relaxed">
        {content}
      </div>
    ),
    toHTML: (content) => `
      <div class="mb-12 text-lg text-gray-900/80 leading-relaxed">
        ${content}
      </div>
    `
  },

  skills: {
    render: (content) => (
      <div className="mb-8">
        {content && Object.keys(content).length > 0 && (
          <>
            <h2 className="text-[18px] font-semibold mb-1 text-gray-900">Skills</h2>
            <div>
              {Object.entries(content).map(([category, skillsList]) =>
                Array.isArray(skillsList) && skillsList.length > 0 && (
                  <div key={category} className="mb-3">
                    <h3 className="capitalize text-[16px] text-gray-800 font-semibold mb-2">
                      {category.replace("_", " ")}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {skillsList.map((skill, i) => (
                        <span
                          key={i}
                          className="bg-white px-3 py-1 rounded-full text-[14px] text-gray-700"
                        >
                          {skill}
                        </span>
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
      <div class="mb-8">
        ${content && Object.keys(content).length > 0 ? `
          <h2 class="text-[18px] font-semibold mb-1 text-gray-900">Skills</h2>
          <div>
            ${Object.entries(content)
              .map(([category, skillsList]) =>
                Array.isArray(skillsList) && skillsList.length > 0
                  ? `
                    <div class="mb-3">
                      <h3 class="capitalize text-[16px] text-gray-800 font-semibold mb-2">
                        ${category.replace("_", " ")}
                      </h3>
                      <div class="flex flex-wrap gap-2">
                        ${skillsList
                          .map(
                            (skill) => `
                            <span class="bg-white px-3 py-1 rounded-full text-[14px] text-gray-700">
                              ${skill}
                            </span>
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

  languages: {
    render: (content) => (
      <div className="mb-8">
        <h2 className="text-[18px] font-semibold text-gray-900">Languages</h2>
        {content.map((lang, index) => (
          <div key={index} className="mb-3">
            <p className="text-[16px] text-gray-800">{lang}</p>
          </div>
        ))}
      </div>
    ),
    toHTML: (content) => `
      <div class="mb-8">
        <h2 class="text-[18px] font-semibold text-gray-900">Languages</h2>
        ${content.map(lang => `
          <div class="mb-3">
            <p class="text-[16px] text-gray-800">${lang}</p>
          </div>
        `).join('')}
      </div>
    `
  },

  hobbies: {
    render: (content) => (
      <div className="mb-8">
        <h2 className="text-[18px] font-semibold text-gray-900">Hobbies</h2>
        <div className="space-y-1">
          {content.map((hobby, index) => (
            <p key={index} className="text-[16px] text-gray-700">{hobby}</p>
          ))}
        </div>
      </div>
    ),
    toHTML: (content) => `
      <div class="mb-8">
        <h2 class="text-[18px] font-semibold text-gray-900">Hobbies</h2>
        <div class="space-y-1">
          ${content.map(hobby => `
            <p class="text-[16px] font-medium text-gray-700">${hobby}</p>
          `).join('')}
        </div>
      </div>
    `
  },

  experience: {
    render: (items) => (
      <div className="mb-6">
        <h2 className="text-[18px] font-semibold mb-4 text-gray-900">Experience</h2>
        {Array.isArray(items) ? items.map((item, index) => (
          <div key={index} className="mb-6">
            <div className="flex justify-between items-baseline mb-2">
              <h3 className="text-[16px] font-semibold text-gray-800">{item.title}</h3>
              <span className="text-[14px] text-gray-600">{item.startDate} - {item.endDate}</span>
            </div>
            <p className="text-[14px] text-gray-700 mb-2">{item.company} • {item.location}</p>
            {Array.isArray(item.description) ? (
              item.description.map((list, idx) => (
                <li key={idx} className="text-[14px] text-gray-600 list-disc marker:text-gray-800 ml-4">
                  {list}
                </li>
              ))
            ) : (
              <p className="text-[14px] text-gray-600">{item.description}</p>
            )}
          </div>
        )) : (
          // Single item render
          <div className="mb-6">
            <div className="flex justify-between items-baseline mb-2">
              <h3 className="text-[16px] font-semibold text-gray-800">{items.title}</h3>
              <span className="text-[14px] text-gray-600">{items.startDate} - {items.endDate}</span>
            </div>
            <p className="text-[14px] text-gray-700 mb-2">{items.company} • {items.location}</p>
            {Array.isArray(items.description) ? (
              items.description.map((list, idx) => (
                <li key={idx} className="text-[14px] text-gray-600 list-disc marker:text-gray-800 ml-4">
                  {list}
                </li>
              ))
            ) : (
              <p className="text-[14px] text-gray-600">{items.description}</p>
            )}
          </div>
        )}
      </div>
    ),
    toHTML: (items) => `
      <div class="mb-6">
        <h2 class="text-[18px] font-semibold mb-4 text-gray-900">Experience</h2>
        ${Array.isArray(items) ? items.map(item => `
          <div class="mb-6">
            <div class="flex justify-between items-baseline mb-2">
              <h3 class="text-[16px] font-semibold text-gray-800">${item.title}</h3>
              <span class="text-[14px] text-gray-600">${item.startDate} - ${item.endDate}</span>
            </div>
            <p class="text-[14px] text-gray-700 mb-2">${item.company} • ${item.location}</p>
            ${Array.isArray(item.description) 
              ? item.description
                  .map(list => `
                    <li class="text-[14px] text-gray-600 list-disc marker:text-gray-800 ml-4">
                      ${list}
                    </li>
                  `).join('')
              : `<p class="text-[14px] text-gray-600">${item.description}</p>`
            }
          </div>
        `).join('') : `
          <div class="mb-6">
            <div class="flex justify-between items-baseline mb-2">
              <h3 class="text-[16px] font-semibold text-gray-800">${items.title}</h3>
              <span class="text-[14px] text-gray-600">${items.startDate} - ${items.endDate}</span>
            </div>
            <p class="text-[14px] text-gray-700 mb-2">${items.company} • ${items.location}</p>
            ${Array.isArray(items.description) 
              ? items.description
                  .map(list => `
                    <li class="text-[14px] text-gray-600 list-disc marker:text-gray-800 ml-4">
                      ${list}
                    </li>
                  `).join('')
              : `<p class="text-[14px] text-gray-600">${items.description}</p>`
            }
          </div>
        `}
      </div>
    `
  },

  projects: {
    render: (item) => (
      <div className="mb-2">
        <h3 className="text-[16px] font-semibold text-gray-800">{item.name}</h3>
        {item.link && (
          <a href={item.link} className="text-[14px] text-gray-500 hover:text-gray-600">
            {item.link}
          </a>
        )}
        {Array.isArray(item.description) && (
          <ul className="mt-1">
            {item.description.map((list, idx) => (
              <li key={idx} className="text-[14px] text-gray-600 list-disc marker:text-gray-800 ml-4">
                {list}
              </li>
            ))}
          </ul>
        )}
      </div>
    ),
    toHTML: (item) => `
      <div class="mb-2">
        <h3 class="text-[16px] font-semibold text-gray-800">${item.name}</h3>
        ${item.link ? `
          <a href="${item.link}" class="text-[14px] text-gray-500 hover:text-gray-600">
            ${item.link}
          </a>
        ` : ''}
        ${Array.isArray(item.description) ? `
          <ul class="mt-1">
            ${item.description
              .map(list => `
                <li class="text-[14px] text-gray-600 list-disc marker:text-gray-800 ml-4">
                  ${list}
                </li>
              `).join('')}
          </ul>
        ` : ''}
      </div>
    `
  },

  education: {
    render: (item) => (
      <div className="mb-3">
        <div className='flex justify-between items-center'>
            <h3 className="text-[15px] font-semibold text-gray-800">{item.degree}</h3>
            <span className='text-gray-500'>{item.startDate} - {item.endDate}</span>
        </div>
        <div className="text-sm text-gray-700">{item.school}</div>
        <div className="flex justify-between items-center text-[12px] text-gray-600">
          <span>{item.location}</span>
        </div>
        {item.gpa && <p className="text-sm text-gray-600">GPA- {item.gpa}</p>}
      </div>
    ),
    toHTML: (item) => `
      <div class="mb-3">
        <div class='flex justify-between items-center'>
            <h3 class="text-[15px] font-semibold text-gray-800">${item.degree}</h3>
            <span class='text-gray-500'>${item.startDate} - ${item.endDate}</span>
        </div>
        <div class="text-sm text-gray-700">${item.school}</div>
        <div class="flex justify-between items-center text-[12px] text-gray-600">
          <span>${item.location}</span>
        </div>
        ${item.gpa ? `<p class="text-sm text-gray-600">GPA- ${item.gpa}</p>` : ''}
      </div>
    `
  },

  educationItem: {
    render: (item) => (
      <div className="mb-3">
        <div className='flex justify-between items-center'>
            <h3 className="text-[15px] font-semibold text-gray-800">{item.degree}</h3>
            <span className='text-gray-500'>{item.startDate} - {item.endDate}</span>
        </div>
        <div className="text-sm text-gray-700">{item.school}</div>
        <div className="flex justify-between items-center text-[12px] text-gray-600">
          <span>{item.location}</span>
        </div>
        {item.gpa && <p className="text-[12px] text-gray-600">GPA- {item.gpa}</p>}
      </div>
    ),
    toHTML: (item) => `
      <div class="mb-3">
        <div class='flex justify-between items-center'>
            <h3 class="text-[15px] font-semibold text-gray-800">${item.degree}</h3>
            <span class='text-gray-500'>${item.startDate} - ${item.endDate}</span>
        </div>
        <div class="text-sm text-gray-700">${item.school}</div>
        <div class="flex justify-between items-center text-[12px] text-gray-600">
          <span>${item.location}</span>
        </div>
        ${item.gpa ? `<p class="text-[12px] text-gray-600">GPA- ${item.gpa}</p>` : ''}
      </div>
    `
  },

  achievements: {
    render: (item) => (
      <li className="text-[14px] text-[#4B5563] ml-4">{item}</li>
    ),
    toHTML: (item) => `
      <li class="text-[14px] text-[#4B5563] ml-4">${item}</li>
    `
  },

  heading: {
    render: (content) => (
      <h2 className="text-black text-[18px] font-semibold mb-2">
        {content}
      </h2>
    ),
    toHTML: (content) => `
      <h2 class="text-black text-[18px] font-semibold mb-2">
        ${content}
      </h2>
    `
  },

  bullet: {
    render: (content) => (
      <li className="text-[14px] text-gray-600 list-disc marker:text-gray-800 ml-4">
        {content}
      </li>
    ),
    toHTML: (content) => `
      <li class="text-[14px] text-gray-600 list-disc marker:text-gray-800 ml-4">
        ${content}
      </li>
    `
  },

  projectTitle: {
    render: (content) => (
      <div className="mb-2">
        <h3 className="text-[16px] font-semibold text-gray-800">{content.name}</h3>
        {content.link && (
          <a href={content.link} className="text-[14px] text-gray-500 hover:text-gray-600">
            {content.link}
          </a>
        )}
      </div>
    ),
    toHTML: (content) => `
      <div class="mb-2">
        <h3 class="text-[16px] font-semibold text-gray-800">${content.name}</h3>
        ${content.link ? `
          <a href="${content.link}" class="text-[14px] text-gray-500 hover:text-gray-600">
            ${content.link}
          </a>
        ` : ''}
      </div>
    `
  },

  experienceTitle: {
    render: (content) => (
      <div className="mb-2">
        <h3 className="text-[16px] font-semibold text-gray-800">{content.title}</h3>
        <div className="text-[14px] text-gray-600">
          {content.company} | {content.location}
          <span className="text-gray-500 ml-2">
            {content.startDate} - {content.endDate}
          </span>
        </div>
      </div>
    ),
    toHTML: (content) => `
      <div class="mb-2">
        <h3 class="text-[16px] font-semibold text-gray-800">${content.title}</h3>
        <div class="text-[14px] text-gray-600">
          ${content.company} | ${content.location}
          <span class="text-gray-500 ml-2">
            ${content.startDate} - ${content.endDate}
          </span>
        </div>
      </div>
    `
  },

  subHeading: {
    render: (content) => (
      <h3 className="capitalize text-[16px] text-gray-800 font-semibold mb-2">
        {content.replace("_", " ")}
      </h3>
    ),
    toHTML: (content) => `
      <h3 class="capitalize text-[16px] text-gray-800 font-semibold mb-2">
        ${content.replace("_", " ")}
      </h3>
    `
  },

  skill: {
    render: (content) => (
      <span className="bg-white px-3 py-1 rounded-full text-[14px] text-gray-700">
        {content}
      </span>
    ),
    toHTML: (content) => `
      <span class="bg-white px-3 py-1 rounded-full text-[14px] text-gray-700">
        ${content}
      </span>
    `
  },
  certifications: {
    render: (item) => (
      <li className="text-[14px] text-[#4B5563] ml-4">{item}</li>
    ),
    toHTML: (item) => `
      <li class="text-[14px] text-[#4B5563] ml-4">${item}</li>
    `
  },

};

export const getCreativeTemplate = (item) => {
  if (!item) return null;
  // console.log(item.type)
  return creativeTemplate[item.type];
}; 