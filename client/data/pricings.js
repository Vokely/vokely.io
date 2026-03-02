// Pricing data with regional pricing support
// Base prices are in INR, Parity Deals will handle regional conversion

export const individualPlans = [
    {
        name: "STARTER (FREE TRIAL)",
        price: 0, // Base price in INR
        desc: "Get started free — explore, edit, and experience before you commit. Explore the magic — no cost, no catch.",
        resume_generations: 4,
        interviews: 2,
        included_features: [
            "Basic Templates",
            "Free Downloads",
            "Resume Editor"
        ],
        excluded_features: [
            "Premium Templates",
            "Unlimited Resumes",
            "AI JD Resume",
            "Advanced AI Resume Models",
            "AI Interviewer",
            "Interview History Access",
            "Download Interview Transcript & Feedbacks",
        ]
    },
    {
        name: "SINGLE RESUME PACK",
        price: 40, // Base price in INR
        parityDealsProductId: process.env.NEXT_PUBLIC_PD_SINGLE_RESUME_ID || "promo_single_resume_xxxxx",
        credits_received: 20,
        rupee_per_credit: 2,
        resume_generations: 1,
        interviews: 0,
        desc: "One precision-built resume, no strings attached.",
        included_features: [
            "Basic Templates",
            "Free Downloads",
            "Resume Editor",
            "Premium Templates",
            "Unlimited Resumes",
            "AI JD Resume",
        ],
        excluded_features: [
            "Advanced AI Resume Models",
            "AI Interviewer",
            "Interview History Access",
            "Download Interview Transcript & Feedbacks",
        ]
    },
    {
        name: "SINGLE INTERVIEW PACK",
        price: 90, // Base price in INR
        credits_received: 50,
        rupee_per_credit: 1.80,
        resume_generations: 2,
        interviews: 1,
        desc: "One AI mock—get interview-ready instantly.",
        included_features: [
            "Basic Templates",
            "Free Downloads",
            "Resume Editor",
            "Premium Templates",
            "Unlimited Resumes",
            "AI JD Resume",
            "AI Interviewer",
            "Interview History Access",
            "Download Interview Transcript & Feedbacks",
        ],
        excluded_features: [
            "Advanced AI Resume Models",
        ]
    },
]

export const comboPlans = [
    {
        name: "VALUE SAVER",
        price: 240, // Base price in INR
        desc: "Smart picks for steady job explorers.",
        credits_received: 150,
        rupee_per_credit: 1.60,
        resume_generations: 7,
        interviews: 3,
        included_features: [
            "Basic Templates",
            "Free Downloads",
            "Resume Editor",
            "Premium Templates",
            "Unlimited Resumes",
            "AI JD Resume",
            "Advanced AI Resume Models",
            "AI Interviewer",
            "Interview History Access",
            "Download Interview Transcript & Feedbacks",
        ],
        excluded_features: []
    },
    {
        name: "GROWTH PACK",
        price: 420, // Base price in INR
        credits_received: 240,
        rupee_per_credit: 2,
        resume_generations: 15,
        interviews: 6,
        desc: "Built for busy job hunters on fire.",
        included_features: [
            "Basic Templates",
            "Free Downloads",
            "Resume Editor",
            "Premium Templates",
            "Unlimited Resumes",
            "AI JD Resume",
            "Advanced AI Resume Models",
            "AI Interviewer",
            "Interview History Access",
            "Download Interview Transcript & Feedbacks",
        ],
        excluded_features: []
    },
    {
        name: "ULTIMATE COMBO",
        price: 450, // Base price in INR
        credits_received: 450,
        rupee_per_credit: 1,
        resume_generations: 22,
        interviews: 9,
        desc: "Full-power AI kit for serious career wins.",
        included_features: [
            "Basic Templates",
            "Free Downloads",
            "Resume Editor",
            "Premium Templates",
            "Unlimited Resumes",
            "AI JD Resume",
            "Advanced AI Resume Models",
            "AI Interviewer",
            "Interview History Access",
            "Download Interview Transcript & Feedbacks",
        ],
        excluded_features: []
    },
]

export const allFeatures = [
    "Basic Templates",
    "Premium Templates",
    "Free Downloads",
    "Resume Editor",
    "Unlimited Resumes",
    "AI JD Resume",
    "Advanced AI Resume Models",
    "AI Interviewer",
    "Interview History Access",
    "Download Interview Transcript & Feedbacks",
  ];
  