import { ClaudeStar,PlayIcon } from "@/components/icons/ATSIcons";
import { Shapes } from "@/components/icons/SubHeadingIcons";

export const resumeEssentialsSections = [
    {
        id: 'profile-contact',
        title: 'Profile & Contact',
        description: 'Make it impossible to miss who you are and how to reach you. We found your name, phone, and a professional email—perfect! This is exactly what ATS software looks for first.',
        icon: <Shapes size={22} color="#2E53E5"/>,
        gridItems: [
            { label: 'Name', status: 'complete' },
            { label: 'Number', status: 'complete' },
            { label: 'Email-Id', status: 'missing' }
          ],
        bottomDescription: 'Recruiters and machines both want this up top. Keep it simple, clean, and scannable.',
        ctaButton: {
          text: 'Build My Profile',
          href: '/dashboard'
        }
    },
    {
      id: 'mandatory',
      title: 'Mandatory Sections',
      description: 'Cover all the bases—so nothing important slips through the cracks. Your resume includes Experience and Education — that\'s solid. But your Skills section is missing, and there\'s no Summary to introduce your profile.',
      icon: <ClaudeStar/>,
      gridItems: [
        { label: 'Summary', status: 'complete' },
        { label: 'Experience', status: 'complete' },
        { label: 'Skills', status: 'missing' },
        { label: 'Education', status: 'complete' },
        { label: 'Certifications', status: 'missing' },
        { label: 'Projects', status: 'complete' }
      ],
      bottomDescription: 'These core sections bring structure and clarity to your resume. We\'ll help you fill the rest — seamlessly.',
      ctaButton: {
        text: 'Complete with AI',
        href: '/dashboard'
      }
    },
    {
        id: 'hyperlinks',
        title: 'Hyperlinks',
        description: 'We found a LinkedIn URL, but it’s not clickable. No portfolio or personal site detected in the header.',
        icon: <PlayIcon />,
        gridItems: [
          { label: 'LinkedIn', status: 'complete' },
          { label: 'Portfolio', status: 'complete' },
          { label: 'GitHub', status: 'missing' }
        ],
        bottomDescription: 'Active, clickable links help your resume work harder — for you. We’ll make sure every link leads where it should.',
        ctaButton: {
          text: 'Fix My Links',
          href: '/dashboard'
        }
    }
  ];

export const categoryDescriptions = {
    active_voice: "Active voice makes your writing more direct and engaging. Passive voice should be avoided in professional resumes.",
    tense_consistency: "Maintain consistent verb tenses throughout your resume to ensure professional clarity.",
    repetitive_words: "Avoid overusing the same words. Use synonyms to make your resume more engaging and professional.",
    sentence_clarity: "Long, complex sentences can be hard to read. Break them into shorter, clearer statements.",
    first_person_pronouns: "Professional resumes should avoid first-person pronouns (I, me, my) and focus on achievements."
  };