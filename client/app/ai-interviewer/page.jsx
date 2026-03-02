// This file should be named page.js or similar in your Next.js app directory structure

import InterviewerClient from "@/components/interviewer/InterviewerClient";// Define metadata for the page
export const metadata = {
  title: "AI Mock Interviewer - Practice With AI For Your Next Job Interview | Vokely.io",
  description:
    "Get interview-ready with Vokely's free AI Mock Interviewer. Practice unlimited job interviews with personalized feedback and improve your interview skills.",
  keywords: [
    "AI interview free",
    "AI interview practice",
    "AI mock interviewer",
    "Free interview practice",
    "Job interview preparation",
    "AI interview coach",
    "AI interview simulator",
    "Interview questions practice",
    "Technical interview practice",
    "AI job interview",
    "Free AI career tools",
    "Interview preparation online",
    "AI resume free",
    "AI roadmap free",
    "AI learning free",
    "Vokely interview",
  ],
  author: "Vokely Team",
  robots: "index, follow",
  openGraph: {
    title: "Practice Interviews With AI - Free Mock Interview Simulator | Vokely.io",
    description:
      "Prepare for your next job interview with our AI-powered mock interviewer. Upload your resume, enter the job description, and practice with realistic interview questions.",
    url: "https://www.vokely.io/ai-interviewer",
    siteName: "Vokely.io",
    images: [
      {
        images: ["https://storage.googleapis.com/genresume_bucket/public/images/laptop-ai.png"], // Replace with actual Twitter image URL
        width: 1200,
        height: 630,
        alt: "AI Mock Interview Practice - Vokely.io",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free AI Interview Practice Tool - Vokely.io",
    description:
      "Practice unlimited AI-powered job interviews tailored to your resume and target role. Improve your interview skills with instant feedback.",
      images: ["https://storage.googleapis.com/genresume_bucket/public/images/laptop-ai.png"], // Replace with actual Twitter image URL
    },
  alternates: {
    canonical: "https://www.vokely.io/ai-interviewer",
  },
};

// Server Component that wraps your client component
export default function AIInterviewerPage() {
  return <InterviewerClient />;
}