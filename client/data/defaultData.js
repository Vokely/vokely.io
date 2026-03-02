export const DEFAULT_PERSONAL_INFO = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phone: '+1 (555) 123-4567',
  location: 'New York, NY',
  title: 'Senior Software Engineer',
  summary: 'Experienced software engineer with a passion for building scalable applications and solving complex problems.',
};

export const DEFAULT_SKILLS = [
  'JavaScript',
  'TypeScript',
  'React',
  'Node.js',
  'Python',
  'SQL',
  'AWS',
  'Docker',
];

export const SOCIAL_LINKS = [
  {
    platform: 'GitHub',
    url: 'https://github.com/username',
    icon: 'github',
    label: 'Follow me on GitHub', 
  },
  {
    platform: 'LinkedIn',
    url: 'https://linkedin.com/in/username',
    icon: 'linkedin',
    label: 'Connect with me on LinkedIn',
  },
  {
    platform: 'Portfolio',
    url: 'https://myportfolio.com',
    icon: 'globe',
    label: 'Visit my portfolio',
  },
];

export const DEFAULT_EXPERIENCE = [
  {
    title: 'Senior Software Engineer',
    company: 'Tech Corp',
    location: 'San Francisco, CA',
    startDate: '2020-01',
    endDate: 'Present',
    description: 'Led development of microservices architecture, improving system scalability by 200%.',
  },
  {
    title: 'Software Engineer',
    company: 'StartUp Inc',
    location: 'Boston, MA',
    startDate: '2018-03',
    endDate: '2019-12',
    description: 'Developed and maintained full-stack web applications using React and Node.js.',
  },
];

export const DEFAULT_EDUCATION = [
  {
    degree: 'MCA',
    school: 'Stanford University',
    location: 'Stanford, CA',
    startDate: '2016',
    endDate: '2018',
    gpa: '3.8',
  },
  {
    degree: 'Bsc CS',
    school: 'MIT',
    location: 'Cambridge, MA',
    startDate: '2012',
    endDate: '2016',
    gpa: '3.9',
  },
];

export const EDUCATION_HEADINGS = ["DEGEREE","INSTITUTE","YEAR","CGPA"]

export const DEFAULT_PROJECTS = [
  {
    name: 'E-commerce Platform',
    description: 'Built a full-stack e-commerce platform using Next.js, TypeScript, and PostgreSQL.',
    link: 'https://github.com/johndoe/ecommerce',
  },
  {
    name: 'AI Chat Application',
    description: 'Developed a real-time chat application with AI-powered responses.',
    link: 'https://github.com/johndoe/ai-chat',
  },
];

export const DEFAULT_ACHIEVEMENTS = [
  'Filed 3 patents in distributed systems',
  'Winner of National Coding Championship 2022',
  'Published research paper in IEEE Conference',
  'Open source contributor with 1000+ GitHub stars',
];

export const DEFAULT_HOBBIES = [
  'Photography',
  'Playing Guitar',
  'Mountain Climbing',
  'Reading',
];

export const DEFAULT_LANGUAGES = [
  { language: 'English', proficiency: 'Native' },
  { language: 'Spanish', proficiency: 'Professional' },
  { language: 'French', proficiency: 'Intermediate' },
];

export const TEMPLATES = [
  {
    id: '1',
    name: 'Impact',
    category: 'Simple',
    sections: ['personal', 'skills', 'experience', 'education', 'projects', 'achievements'],
  },
  {
    id: '2',
    name: 'Minimalist',
    category: 'Simple',
    sections: ['personal', 'skills', 'experience', 'education', 'projects', 'achievements'],
  },
  {
    id: '1',
    name: 'Professional',
    category: 'ATS',
    sections: ['personal', 'skills', 'experience', 'education', 'projects', 'achievements'],
  },
  // {
  //   id: '1',
  //   name: 'Tech Modern',
  //   category: 'Modern',
  //   image: 'https://images.unsplash.com/photo-1512486130939-2c4f79935e4f?q=80&w=300',
  //   sections: ['personal', 'userImage', 'skills', 'experience', 'education', 'projects', 'achievements', 'languages'],
  //   backgroundColor: 'bg-slate-50',
  // },
  {
    id: '1',
    name: 'Creative Portfolio',
    category: 'Creative',
    sections: ['personal', 'userImage', 'skills', 'experience', 'education', 'projects', 'achievements', 'hobbies', 'languages'],
    backgroundColor: 'bg-rose-50',
  },
];
