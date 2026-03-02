import ATSLayout from '@/components/ats-checker/ATSLayout';

export const metadata = {
  title: "Free AI Resume ATS Analyzer - Boost Your Job Match | Vokely.io",
  description:
    "Try our free AI-powered ATS analyzer to check how well your resume matches any job description. Get actionable tips to improve your chances of getting interviews.",
  keywords: [
    "free AI ATS analyzer",
    "free resume ATS scan",
    "ATS resume checker free",
    "resume job match tool",
    "AI resume checker",
    "free ATS optimization tool",
    "job match percentage AI",
  ],
  author: "Vokely Team",
  robots: "index, follow",
  openGraph: {
    title: "Free AI ATS Resume Analyzer | Vokely.io",
    description:
      "Analyze your resume for free against any job description using AI. Get your ATS score, keyword suggestions, and tips to optimize your resume.",
    url: "https://www.vokely.io/ats-analyzer",
    siteName: "Vokely.io",
    images: [
      {
        url: "https://storage.googleapis.com/genresume_bucket/public/images/ats-analyzer-cover.png",
        width: 1200,
        height: 630,
        alt: "Free ATS Analyzer by Vokely.io",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free AI Resume ATS Analyzer | Vokely.io",
    description:
      "Upload your resume and job description to check ATS compatibility for free. Get AI-powered tips to improve your resume and land more interviews.",
    images: ["https://storage.googleapis.com/genresume_bucket/public/images/ats-analyzer-cover.png"],
  },
  alternates: {
    canonical: "https://www.vokely.io/ats-analyzer",
  },
};

export default function Home() {
  return <ATSLayout />;
}
