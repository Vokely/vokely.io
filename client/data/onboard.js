const formFields = [
  {
    id: 'careerStage',
    type: 'dropdown',
    label: 'What best describes your current career stage?',
    placeholder: 'Select where you are in your journey',
    options: [
    'Student or recent graduate(0-1 years)',
    'Actively job hunting(1-3 years)',
    'Switching careers(3-5 years)',
    'Employed, exploring options(5+ years)',
    'Just browsing(Varies)'
    ]
  },
  {
    id: 'roles',
    type: 'dropdown',
    label: 'What kind of roles or industries are you targeting?',
    placeholder: "Pick the fields you're aiming for",
    options: [
      'Technology, AI & Software',
      'Media, Design & Creative Arts',
      'Business, Sales & Marketing',
      'Education & Training',
      'Healthcare & Medicine',
      'Finance, Accounting & Legal',
      'Engineering (Mechanical, Civil, Electronics, etc.)',
      'Aviation, Marine & Defense',
      'Public Sector / Government / Policy',
      'NGO / Nonprofit / Social Impact',
      'Environmental & Sustainability',
      'Other',
    ],
  },
  {
    id: 'goal',
    type: 'dropdown',
    label: 'What’s your top goal right now?',
    placeholder: 'Tell us what matters most to you',
    options: [
      'Build or Improve my resume',
      'Prepare for interviews',
      'Learn new/missing skills',
      'All of the Above',
    ],
  },
  {
    id: 'referral',
    type: 'dropdown',
    label: 'How did you hear about us?',
    placeholder: 'Help us track how people discover us',
    options: [
      'Google',
      'LinkedIn',
      'Twitter / X',
      'Reddit',
      'Friend / Colleague',
      'Product Hunt',
      'Newsletter / Blog',
      'Online course or bootcamp',
      'Other',
    ],
  },
];

export default formFields;
