export const navItems = [
    {
      name: 'Services',
      dropdown: [
        {
          name : "AI Skill Gap Analysis",
          link : "/skill-gap-analysis",
          description: "Get a detailed report of what's missing in your resume for your target role.",
          storename : "AI Skill Gap Analysis"
        },
        {
          name: 'AI Learning Guide',
          link: '/ai-learning-guide',
          storename: "AI Learning Guide",
          description: "Get a custom guided learning roadmap for your target skill or role.",
          info : "New"
        },
        {
          name: 'AI Interviewer',
          link: '/ai-interviewer',
          storename: "AI Interview",
          description: "Ace your interviews with AI-driven mock interviews and feedback.",
          info : "Enhanced"
        },
        {
          name: 'ATS Checker',
          link: '/ats-checker',
          storename: "ATS Checker",
          description: "Analyze your resume's ATS compatibility and get actionable improvement tips.",
        },
        {
          name: 'AI Resume Builder',
          link: '/dashboard',
          storename: "Resume Editor",
          description: "Create, edit, and optimize your resume with AI-powered suggestions."
        },
      ]
    },
    {
      name: 'Upcoming Features',
      dropdown: [
        {
          name: 'Job Matcher',
          link: '/jobs',
          storename: "Smart-Jobs",
          description: "Discover AI-curated job listings tailored to your skills and preferences."
        },
        {
          name: 'AI Career Mentor',
          link: '/career-guidance',
          storename: "Career-Guidance",
          description: "Get personalized career advice and growth strategies with AI mentoring."
        },
        {
          name: 'Auto Apply',
          link: '/job-applier',
          storename: "Job-Applier",
          description: "Automate job applications and track your progress effortlessly."
        }
      ]
    },
    {
      name: 'Company',
      dropdown: [
        // {
        //   name: "About",
        //   link: "/about-us",
        //   storename: "About", 
        //   description: "Learn more about our company, mission, and values."
        // },
        {
          name: "Contact",
          link: "/contact-us",
          storename: "Contact", 
          description: "Get in touch with our team for support or inquiries."
        },
        {
          name: "Blog",
          link: "/blog",
          storename: "Blog", 
          description: "Discover articles on career growth, industry insights, platform tips, and company news."
        },
      ]
    },
    {
      name: 'Pricing',
      link: '/#pricing',
    }
  ];

export const products = [
  {
      "heading" : "Product",
      "columns":[
          {
              name : "AI Skill Gap Analysis",
              link : "/skill-gap-analysis",
              storename : "AI Skill Gap Analysis"
          },
          {
              name : "AI Learning Guide",
              link : "/ai-learning-guide",
              storename : "AI Learning Guide"
          },
          {
              name : "AI Interviewer",
              link : "/ai-interviewer",
              storename: "AI Interview"
          },
          {
              name : "AI Resume Builder",
              link : "/dashboard",
              storename: "AI Resume Builder"
          },
      ]
  },
  {
      "heading" : "Company",
      "columns":[
          // {
          //     name : "About",
          //     link : "/about-us"
          // },
          {
              name : "Contact",
              link : "/contact-us"
          },
          {
            name : "Blog",
            link : "/blog"
        },
      ]
  },
  {
      "heading" : "Resources",
      "columns":[
          {
              name : "Help Center",
              link : "/contact-us"
          },
          {
              name : "Guides",
              link : "/guides"
          },
      ]
  },
]
export const TEMPLATE_CATGORIES = ["Simple", "ATS","Creative"];

