import HomeClientWrapper from '@/components/home/HomeClientWrapper';

// Metadata for SEO
export const metadata = {
  title: "Vokely.io - AI Resume Enhancer & AI Interviewer",
  description:
    "Create job-winning resumes and ace interviews with Vokely's AI-powered Career Toolkit.",
  keywords: [
    "AI Resume Editor",
    "Free AI Resume Builder",
    "AI Resume Enhancer",
    "AI Job Interview",
    "AI Mock Interview",
    "Resume Generator",
    "Resume Optimization",
    "Interview Preparation AI",
    "Job Search AI",
    "AI Career Portal",
    "Vokely AI",
    "Best Resume Builder",
    "AI CV Builder",
    "Resume Analysis",
    "Job-winning Resume",
  ],
  author: "Vokely Team",
  robots: "index, follow",
  openGraph: {
    title: "Vokely.io - AI Resume Enhancer & AI Interviewer",
    description:
      "Enhance your resume and prepare for job interviews using AI. Create the perfect resume for any job description with Vokely.io.",
    url: "https://www.vokely.io",
    siteName: "Vokely.io",
    images: [
      {
        url: "https://storage.googleapis.com/genresume_bucket/public/images/laptop.png", // Replace with actual OG image URL
        width: 1200,
        height: 630,
        alt: "Vokely.io - AI Career Portal",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vokely.io - AI Resume & Interview Preparation",
    description:
      "Free AI Resume Builder & AI Mock Interviewer to help you land your dream job. Try Vokely.io now!",
    images: ["https://storage.googleapis.com/genresume_bucket/public/images/laptop-ai.png"], // Replace with actual Twitter image URL
  },
};

export default function Home() {
  return <HomeClientWrapper/>
}