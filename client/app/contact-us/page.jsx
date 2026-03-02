import ContactPage from "@/components/client-wrappers/ContactClient";


export const metadata = {
  title: "Contact Vokely.io - Get Support & Connect With Our Team",
  description:
    "Have questions about our AI resume builder, mock interviewer, or learning guides? Get in touch with the Vokely team for quick support, feature requests, or partnership opportunities.",
  keywords: [
    "Vokely contact",
    "AI resume builder support",
    "AI interviewer help",
    "Contact AI career platform",
    "Vokely customer service",
    "AI learning guide support",
    "Technical assistance AI tools",
    "AI career tools contact",
    "Vokely feedback",
    "AI resume help",
    "Vokely partnership",
    "AI career platform support",
    "Contact Vokely team",
    "Resume builder questions",
    "AI interview practice support",
  ],
  author: "Vokely Team",
  robots: "index, follow",
  openGraph: {
    title: "Contact Us - Get Help With Vokely's AI Career Tools",
    description:
      "Reach out to the Vokely team for support with our AI resume builder, mock interviewer, or learning guides. We're here to help you succeed in your career journey.",
    url: "https://www.vokely.io/contact-us",
    siteName: "Vokely.io",
    images: [
      {
        url: "https://storage.googleapis.com/genresume_bucket/public/images/contact-us.png", // Update with actual OG image URL
        width: 1200,
        height: 630,
        alt: "Contact Vokely.io - AI Career Tools Support",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Need Help With Vokely's AI Tools? Contact Our Support Team",
    description:
      "Questions about our AI resume builder, interview simulator, or learning guides? Our team is ready to assist you. Get in touch with Vokely.io support today.",
      images: ["https://storage.googleapis.com/genresume_bucket/public/images/laptop-ai.png"], // Replace with actual Twitter image URL
    },
  alternates: {
    canonical: "https://www.vokely.io/contact-us",
  },
  other: {
    'application/ld+json': JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'ContactPage',
      'name': 'Vokely.io Contact Page',
      'description': 'Contact information for Vokely.io AI career tools including AI resume builder, interview simulator and learning guides.',
      'url': 'https://www.vokely.io/contact-us',
      'contactPoint': {
        '@type': 'ContactPoint',
        'telephone': '+91 8300454953', // Replace with actual phone if available
        'contactType': 'customer service',
        'email': 'support@vokely.io', // Replace with actual email
        'availableLanguage': ['English']
      },
      'sameAs': [
        'https://twitter.com/VokelyAI', // Replace with actual social URLs
        'https://www.linkedin.com/company/genresume',
        'https://www.facebook.com/VokelyAI'
      ]
    })
  }
};


export default function ContactUsPage() {
  return <ContactPage />;
}