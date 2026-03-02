// Metadata for SEO
export const metadata = {
  title: "Latest Blogs | Vokely.io - Career, Resume, & Interview Insights",
  description:
    "Stay updated with Vokely's latest blogs on AI resumes, interview strategies, and job search tips. Expert advice to boost your career.",
  keywords: [
    "AI Resume Blogs",
    "Interview Tips Blog",
    "Job Search Strategies",
    "AI Career Advice",
    "Resume Writing Insights",
    "Vokely Articles",
    "AI Mock Interview Tips",
    "Career Growth Blogs",
    "Resume Optimization Guide",
  ],
  author: "Vokely Team",
  robots: "index, follow",
  openGraph: {
    title: "Latest Blogs | Vokely.io",
    description:
      "Insights on resume building, interview preparation, and career success from Vokely's expert team.",
    url: "https://www.vokely.io/blogs",
    siteName: "Vokely.io",
    images: [
      {
        url: "https://storage.googleapis.com/genresume_bucket/public/images/laptop.png",
        width: 1200,
        height: 630,
        alt: "Vokely Blogs",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vokely Blogs | Career & Resume Insights",
    description:
      "Boost your career with Vokely's expert-written blogs on resume building and interview skills.",
    images: [
      "https://storage.googleapis.com/genresume_bucket/public/images/laptop-ai.png",
    ],
  },
}

import Navbar from '@/components/layouts/Navbar'
import Footer from '@/components/layouts/Footer'

export default function MainLayout({ children }) {
  return (
    <>
      <Navbar />
      <div className="min-h-screen">
        {children}
      </div>
      <Footer />
    </>
  )
}
