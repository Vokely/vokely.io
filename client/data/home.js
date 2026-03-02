// JSON data structure
export const sectionsData = [
  {
    header: {
      subtitle: "AI RESUME BUILDER",
      title: "Make it to Top 1% of Resumes",
      description: "No more guesswork. Our AI Resume Builder crafts impactful resumes that align with the roles you want — ensuring your profile rises to the top of the recruiter's stack.",
      buttonText: "Optimize My Resume Now",
      buttonLink:"/dashboard"
    },
    stats: [
      {
        id: "left-stat",
        value: "50k",
        label: "Resumes Created",
        position: "left"
      },
      {
        id: "right-stat", 
        value: "50k",
        label: "Resumes Created",
        position: "right"
      },
      {
        id: "bottom-stat", 
        value: "84",
        label: "Average ATS Score",
        position: "bottom"
      },
    ],
    centerContent: {
      topRow: [
        {
          type: "image",
          src: `${process.env.NEXT_PUBLIC_BUCKET_URL}/images/Aisuggestions.png?t=${Date.now()}`,
          alt: "AI Resume Suggestions Interface",
          fallback: "https://via.placeholder.com/300x200/f3f4f6/6b7280?text=AI+Suggestions"
        },
        {
          type: "summary",
          title: "Crafts compelling summaries tailored to your goals",
        }
      ],
      bottomRow: [
        {
          type: "text",
          title: "Transforms your resume to match job-specific language"
        },
        {
          type: "image",
          src: `${process.env.NEXT_PUBLIC_BUCKET_URL}/images/resumehand.png?t=${Date.now()}`,
          alt: "Resume in hand",
          fallback: "https://via.placeholder.com/120x96/14b8a6/ffffff?text=Resume"
        }
      ]
    },
    bottomSection: {
      title: "Boosts visibility with ATS-friendly formatting",
    }
  },
  {
    header: {
      subtitle: "AI INTERVIEW COACH",
      title: "Crack Every Interview with AI-Powered Practice",
      description: "Turn nerves into confidence. Simulate real-world interview scenarios, receive instant AI feedback, and walk into every interview fully prepared to impress.",
      buttonText: "Start Mock Interview",
      buttonLink:"/ai-interviewer"
    },
    stats: [
      {
        id: "left-stat",
        value: "24/7",
        label: "Availability",
        position: "left"
      },
      {
        id: "right-stat", 
        value: "72%",
        label: "Increased Callback",
        position: "right"
      },
      {
        id : "bottom-stat",
        value: "1000+",
        label: "Curated Questions",
        position: "bottom"
      },
    ],
    centerContent: {
      topRow: [
        {
          type: "image",
          src: `${process.env.NEXT_PUBLIC_BUCKET_URL}/images/interviewfeedback.png?t=${Date.now()}`,
          alt: "Interview Feedback Interface",
          fallback: "https://via.placeholder.com/300x200/f3f4f6/6b7280?text=Interview+Feedback"
        },
        {
          type: "summary",
          title: "Instant feedback on your responses and tone",
          description: "Get real-time analysis of your answers, speaking pace, and communication style"
        }
      ],
      bottomRow: [
        {
          type: "text",
          title: "Mock interviews based on your targeted roles",
          description: "Practice with questions specific to your industry and role"
        },
        {
          type: "image",
          src: `${process.env.NEXT_PUBLIC_BUCKET_URL}/images/interviewperson.png?t=${Date.now()}`,
          alt: "Person in interview",
          fallback: "https://via.placeholder.com/120x96/f3f4f6/6b7280?text=Interview"
        }
      ]
    },
    bottomSection: {
      title: "Improves confidence, clarity, and storytelling",
      description: "Our AI helps you articulate your experiences compellingly and answer with confidence"
    }
  },
  {
    header: {
      subtitle: "AI CAREER ROADMAP",
      title: "Design a Future-Proof Career with AI Guidance",
      description: "Unsure what's next? Our AI Roadmap tool builds a customized career plan with clear, actionable milestones — helping you grow with confidence and direction.",
      buttonText: "Generate My Roadmap",
      buttonLink:"/ai-learning-guide"
    },
    stats: [
      {
        id: "left-stat",
        value: "100%",
        label: "Personalized plans",
        position: "left"
      },
      {
        id: "right-stat", 
        value: "80%",
        label: "User Satisfaction",
        position: "right"
      },
      {
        id: "bottom-stat",
        value: "3x",
        label: "Faster Clarity",
        position: "bottom"
      },
    ],
    centerContent: {
      topRow: [
        {
          type: "image",
          src: `${process.env.NEXT_PUBLIC_BUCKET_URL}/images/roadmaptracker.png?t=${Date.now()}`,
          alt: "Career Roadmap Interface",
          fallback: "https://via.placeholder.com/300x200/f3f4f6/6b7280?text=Roadmap+Table"
        },
        {
          type: "summary",
          title: "Maps your journey to roles that match your goals",
          items: [
            "Career Progression",
            "Skill Development", 
            "Goal Alignment"
          ]
        }
      ],
      bottomRow: [
        {
          type: "text",
          title: "Identifies gaps and recommends skills to learn next",
          description: ""
        },
        {
          type: "image",
          src: `${process.env.NEXT_PUBLIC_BUCKET_URL}/images/roadmaptable.png?t=${Date.now()}`,
          alt: "Career planning session",
          fallback: "https://via.placeholder.com/120x96/06b6d4/ffffff?text=Planning"
        }
      ]
    },
    bottomSection: {
      title: "Adapts to transitions, upskilling, and new ambitions",
      description: "Our AI roadmap evolves with your career changes and helps you navigate pivots with confidence"
    }
  }
]

export const companies = [
  { name: 'Webflow', logo: 'webflow-logo.png' },
  { name: 'Amazon', logo: 'amazon-logo.png' },
  { name: 'Resume', logo: 'relume-logo.png' },
  { name: 'Google', logo: 'google-logo.png' },
  { name: 'GitHub', logo: 'github-logo.png' },
  { name: 'Mitsubishi', logo: 'mitsubishi-logo.png' },
  { name: 'ProductBoard', logo: 'productboard-logo.png' },
  { name: 'Squarespace', logo: 'squarespace-logo.png' },
  { name: 'HelloSign', logo: 'hellosign-logo.png' },
];