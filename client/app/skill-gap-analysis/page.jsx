import SkillGapClient from "@/components/skill-gap-analysis/SkillGapAnalysisClient";

export const metadata = {
  title: "AI Skill Gap Analysis - Know What to Learn Next | Vokely.io",
  description:
    "Upload your resume and job description to get a personalized skill gap report using AI. Start your career growth with actionable insights.",
  keywords: [
    "AI skill gap analysis",
    "skill gap AI",
    "AI career tool",
    "resume vs job description analysis",
    "AI skill analysis",
    "AI roadmap builder",
  ],
  author: "Vokely Team",
  robots: "index, follow",
  openGraph: {
    title: "Find Your Skill Gap with AI | Vokely.io",
    description:
      "Use AI to analyze your resume and job description. Find missing skills, get improvement suggestions, and roadmap your growth.",
    url: "https://www.vokely.io/skill-gap-analysis",
    siteName: "Vokely.io",
    images: [
      {
        url: "https://storage.googleapis.com/genresume_bucket/public/images/skill-gap-cover.png",
        width: 1200,
        height: 630,
        alt: "Skill Gap Analysis by Vokely.io",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Skill Gap Analysis Tool | Vokely.io",
    description:
      "Upload your resume and a job description to get an AI-generated report of missing skills and improvement tips.",
    images: ["https://storage.googleapis.com/genresume_bucket/public/images/skill-gap-cover.png"],
  },
  alternates: {
    canonical: "https://www.vokely.io/skill-gap-analysis",
  },
};

export default function SkillGapAnalysisPage() {
  return <SkillGapClient />;
}
