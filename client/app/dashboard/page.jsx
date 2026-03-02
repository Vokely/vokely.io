import DashBoard from "@/components/dashboard/DashboardClient";

// Define metadata for the page
export const metadata = {
    title: "Your AI Career Dashboard | Vokely.io",
    description:
      "Access all your AI career tools in one place. Manage your resumes, practice interviews, track learning progress, and optimize your job search with Vokely's comprehensive dashboard.",
    keywords: [
      "AI career dashboard",
      "Resume management",
      "AI interview tracking",
      "Career progress tracker",
      "AI learning dashboard",
      "Job application manager",
      "Vokely dashboard",
      "AI career tools",
      "Resume analytics",
      "Interview practice history",
      "AI skill development",
      "Career planning tools",
      "AI resume tracking",
      "Interview preparation stats",
      "Job search management",
    ],
    author: "Vokely Team",
    robots: "noindex, nofollow", // Typically dashboards are not indexed
    openGraph: {
      title: "Manage Your AI Career Journey | Vokely Dashboard",
      description:
        "Your personalized dashboard for managing resumes, interview practice sessions, learning paths, and job applications. Track your progress and optimize your career journey.",
      url: "https://www.vokely.io/dashboard",
      siteName: "Vokely.io",
      images: [
        {
          url: "https://storage.googleapis.com/genresume_bucket/public/images/dashboard-preview.png", // Update with actual dashboard preview image
          width: 1200,
          height: 630,
          alt: "Vokely.io User Dashboard",
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "Your AI-Powered Career Command Center | Vokely Dashboard",
      description:
        "Track your resumes, interviews, learning progress and job applications all in one place. Your personalized career management hub by Vokely.io.",
      images: ["https://storage.googleapis.com/genresume_bucket/public/images/laptop-ai.png"],
    },
    alternates: {
      canonical: "https://www.vokely.io/dashboard",
    },
    other: {
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' https://storage.googleapis.com;",
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()'
    }
  };

export default function DashboardPage() {
  return <DashBoard />;
}