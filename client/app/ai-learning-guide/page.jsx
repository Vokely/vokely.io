import RoadmapClient from "@/components/roadmap/RoadmapClient";

export const metadata = {
  title: "AI Learning Guide & Roadmap Generator | Vokely.io",
  description:
    "Create personalized AI learning roadmaps with Vokely's free AI Learning Guide. Get customized tutorials, resources, and step-by-step guidance to master AI concepts at your own pace.",
  keywords: [
    "AI learning free",
    "AI roadmap free",
    "AI learning guide",
    "AI tutor online",
    "AI education roadmap",
    "Free AI courses",
    "AI learning path",
    "Custom AI curriculum",
    "AI skills guide",
    "Learn artificial intelligence",
    "AI for beginners",
    "AI career roadmap",
    "AI study plan",
    "AI tutorial generator",
    "Personalized AI learning",
    "Vokely AI education",
  ],
  author: "Vokely Team",
  robots: "index, follow",
  openGraph: {
    title: "Create Your Free AI Learning Roadmap | Vokely.io",
    description:
      "Get a personalized AI learning roadmap based on your goals, experience level, and available time. Free AI tutor and customized resources to accelerate your AI journey.",
    url: "https://www.vokely.io/ai-learning-guide",
    siteName: "Vokely.io",
    images: [
      {
        url: "https://storage.googleapis.com/genresume_bucket/public/images/ai-learning-guide.png", // Update with actual OG image URL
        width: 1200,
        height: 630,
        alt: "AI Learning Roadmap Generator - Vokely.io",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free AI Tutor & Learning Path Generator - Vokely.io",
    description:
      "Create your customized AI learning journey with free roadmaps, tutorials, and resources tailored to your goals and experience level.",
      images: ["https://storage.googleapis.com/genresume_bucket/public/images/laptop-ai.png"], // Replace with actual Twitter image URL
    },
  alternates: {
    canonical: "https://www.vokely.io/ai-learning-guide",
  },
  verification: {
    google: "your-google-verification-code", // If you have one
  },
};


export default function AILearningGuidePage() {
  return <RoadmapClient />;
}