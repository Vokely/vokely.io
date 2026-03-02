export const SECTION_HEADINGS = [
  {
    name: "Personal Info",
    included_in: ["Simple","Impact", "ATS", "Modern", "Creative"], 
  },
  {
    name: "Links",
    included_in: ["ATS","Modern", "Creative"], 
  },
  {
    name: "Skills",
    included_in: ["Simple","Impact", "ATS", "Modern", "Creative"], 
  },
  {
    name: "Experience",
    included_in: ["Simple","Impact", "ATS", "Modern", "Creative"], 
  },
  {
    name: "Projects",
    included_in: ["Simple","Impact", "ATS", "Modern", "Creative"], 
  },
  {
    name: "Education",
    included_in: ["Simple","Impact", "ATS", "Modern", "Creative"], 
  },
  {
    name: "Certifications",
    included_in: ["Simple","Impact", "ATS", "Modern", "Creative"], 
  },
  {
    name: "Achievements",
    included_in: ["Simple","Impact", "ATS", "Modern", "Creative"], 
  },
  {
    name: "Hobbies",
    included_in: ["Modern", "Creative"], 
  },
  {
    name: "Languages",
    included_in: ["Modern", "Creative"], 
  },
];

export const getPersonalInfoFields = (data, updatePersonal) => [
  {
    row: 1,
    fields: [
      {
        id: "title",
        label: "Professional Title",
        type: "text",
        value: data.title,
        onChange: (e) => updatePersonal("title", e.target.value),
        included_in: ["Simple","Impact","ATS", "Modern", "Creative","Impact"], 
      },
      {
        id: "image",
        label: "Profile Photo",
        type: "file",
        value: data.imgFileName,
        placeholder: "LastName |",
        onChange: (filename) => updatePersonal("profileImage", filename),
        included_in: ["Modern", "Creative"], 
      },
    ],
  },
  {
    row: 2,
    fields: [
      {
        id: "firstName",
        label: "First Name",
        type: "text",
        value: data.firstName,
        placeholder: "FirstName |",
        onChange: (e) => updatePersonal("firstName", e.target.value),
        included_in: ["Simple", "ATS", "Modern", "Creative","Impact"], 
      },
      {
        id: "lastName",
        label: "Last Name",
        type: "text",
        value: data.lastName,
        placeholder: "LastName |",
        onChange: (e) => updatePersonal("lastName", e.target.value),
        included_in: ["Simple", "ATS", "Modern", "Creative","Impact"], 
      },
    ],
  },
  {
    row: 3,
    fields: [
      {
        id: "email",
        label: "Email",
        type: "email",
        value: data.email,
        onChange: (e) => updatePersonal("email", e.target.value),
        included_in: ["Simple", "ATS", "Modern", "Creative","Impact"], 
      },
      {
        id: "phone",
        label: "Phone",
        type: "text",
        value: data.phone,
        onChange: (e) => updatePersonal("phone", e.target.value),
        included_in: ["Simple", "ATS", "Modern", "Creative","Impact"], 
      },
    ],
  },
  {
    row: 4,
    fields: [
      {
        id: "location",
        label: "Location",
        type: "text",
        value: data.location,
        onChange: (e) => updatePersonal("location", e.target.value),
        included_in: ["Simple", "ATS", "Modern", "Creative","Impact"], 
      },
    ],
  },
  {
    row: 5,
    fields: [
      {
        id: "summary",
        label: "Professional Summary",
        type: "textarea",
        value: data.summary,
        onChange: (e) => updatePersonal("summary", e.target.value),
        rows: 8,
        included_in: ["Simple", "ATS", "Modern", "Creative","Impact"], 
      },
    ],
  },
];

export const getExperienceFields = (data, updateExperience, index) => [
    {
      row: 1,
      fields: [
        {
          id: `title-${index}`,
          label: "Job Title",
          type: "text",
          value: data[index].title,
          onChange: (e) => updateExperience(index, "title", e.target.value),
        },
      ],
    },
    {
      row: 2,
      fields: [
        {
          id: `company-${index}`,
          label: "Company",
          type: "text",
          value: data[index].company,
          onChange: (e) => updateExperience(index, "company", e.target.value),
        },
        {
          id: `location-${index}`,
          label: "Location",
          type: "text",
          value: data[index].location,
          onChange: (e) => updateExperience(index, "location", e.target.value),
        },
      ],
    },
    {
      row: 3,
      fields: [
        {
          id: `startDate-${index}`,
          label: "Start Date",
          type: "text",
          value: data[index].startDate,
          onChange: (e) => updateExperience(index, "startDate", e.target.value),
        },
        {
          id: `endDate-${index}`,
          label: "End Date",
          type: "text",
          value: data[index].endDate,
          onChange: (e) => updateExperience(index, "endDate", e.target.value),
        },
      ],
    },
    {
      row: 4,
      fields: [
        {
          id: `description-${index}`,
          label: "Description",
          type: "textarea",
          value: data[index].description,
          onChange: (e) => updateExperience(index, "description", e.target.value),
          rows: 8,
        },
      ],
    },
];

export const getEducationFields = (data, updateEducation, index) => [
    {
      row: 1,
      fields: [
        {
          id: `degree-${index}`,
          label: "Degree",
          type: "text",
          value: data[index].degree,
          onChange: (e) => updateEducation(index, "degree", e.target.value),
        },
        {
          id: `school-${index}`,
          label: "School",
          type: "text",
          value: data[index].school,
          onChange: (e) => updateEducation(index, "school", e.target.value),
        },
      ],
    },
    {
      row: 2,
      fields: [
        {
          id: `startDate-${index}`,
          label: "Start Date",
          type: "text",
          value: data[index].startDate,
          onChange: (e) => updateEducation(index, "startDate", e.target.value),
        },
        {
          id: `endDate-${index}`,
          label: "End Date",
          type: "text",
          value: data[index].endDate,
          onChange: (e) => updateEducation(index, "endDate", e.target.value),
        },
      ],
    },
    {
      row: 3,
      fields: [
        {
          id: `location-${index}`,
          label: "Location",
          type: "text",
          value: data[index].location,
          onChange: (e) => updateEducation(index, "location", e.target.value),
        },
        {
          id: `gpa-${index}`,
          label: "GPA",
          type: "text",
          value: data[index].gpa,
          onChange: (e) => updateEducation(index, "gpa", e.target.value),
        },
      ],
    },
  ];

  export const getProjectsFields = (data, updateProjects, index) => [
    {
      row: 1,
      fields: [
        {
          id: `name-${index}`,
          label: "Project Name",
          type: "text",
          value: data[index].name,
          onChange: (e) => updateProjects(index, "name", e.target.value),
        },
        {
          id: `link-${index}`,
          label: "Project Link",
          type: "text",
          value: data[index].link,
          onChange: (e) => updateProjects(index, "link", e.target.value),
        }
      ],
    },
    {
      row: 2,
      fields: [
        {
          id: `description-${index}`,
          label: "Description",
          type: "textarea",
          value: data[index].description,
          onChange: (e) => updateProjects(index, "description", e.target.value),
          rows: 8,
        },
      ],
    }
  ];
  export const geLinkFields = (data, updateLinks, index) => [
    {
      row: 1,
      fields: [
        {
          id: `name-${index}`,
          label: "Platform",
          type: "text",
          value: data[index].platform,
          onChange: (e) => updateLinks(index, "platform", e.target.value),
        },
        {
          id: `link-${index}`,
          label: "Link",
          type: "text",
          value: data[index].url,
          onChange: (e) => updateLinks(index, "url", e.target.value),
        }
      ],
    },
    {
      row: 2,
      fields: [
        {
          id: `image-${index}`,
          label: "image",
          type: "file",
          value: data[index].icon,
          onChange: (e) => updateProjects(index, "icon", e.target.value),
        },
      ],
    }
  ];