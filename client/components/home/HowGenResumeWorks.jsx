'use client';
import { motion } from 'framer-motion';

export default function HowVokelyWorks() {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6
      }
    }
  };

  // Feature step data
  const features = [
    {
      id: 1,
      buttonText: 'Get an AI-Optimized Resume Instantly',
      buttonColor: 'bg-purple-100 text-purple-600 hover:bg-purple-200 border border-purple-200',
      description: 'Upload your resume and job post — our AI will rewrite your resume using the right words, format, and tone so it stands out and passes company filters.',
      imageSrc: '/images/resume-optimization-screen.png',
      imageAlt: 'AI Resume Optimization Interface'
    },
    {
      id: 2,
      buttonText: 'Practice Real Interviews with AI',
      buttonColor: 'bg-purple-100 text-purple-600 hover:bg-purple-200 border border-purple-200',
      description: 'Answer questions like in a real interview. Our AI listens, gives you feedback, and helps you speak clearly, confidently, and professionally.',
      imageSrc: '/images/interview-practice-screen.png',
      imageAlt: 'AI Interview Practice Interface'
    },
    {
      id: 3,
      buttonText: 'Get a Personalized Career Roadmap',
      buttonColor: 'bg-purple-100 text-purple-600 hover:bg-purple-200 border border-purple-200',
      description: 'Tell us your goal — and our AI will build a simple plan with clear steps and resources to help you reach it, whether you’re switching careers or growing in your field.',
      imageSrc: '/images/career-roadmap-screen.png',
      imageAlt: 'Career Roadmap Interface'
    }
  ];
    
  return (
    <section className="py-16 px-4 md:px-12 md:py-24 bg-white">
      <div className="rounded-md flex flex-col md:flex-col p-2 md:p-20 bg-[#fafafa]">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            How Vokely Works — AI That Actually<br />Understands You
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Just share your goal, job description, or skill you want to master — our AI handles the rest.<br />
            From resume to roadmap — Vokely guides you every step.
          </p>
        </motion.div>

        <motion.div
          className="space-y-16 md:space-y-24"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.id}
              className="flex flex-col md:flex-row items-center gap-8 md:gap-16"
              variants={itemVariants}
            >
              {/* Left side - Button and description */}
              <div className="space-y-2 w-full md:w-2/5 order-2 md:order-1">
              <p className="text-gray-400 mr-4 text-lg font-light">0{feature.id}</p>
              {/* <Link href={feature.id === 1 ? "/resume-builder" : feature.id === 2 ? "/mock-interview" : "/career-roadmap"}> */}
                <motion.button
                  className={`${feature.buttonColor} px-4 py-3 rounded-lg flex items-center justify-between min-w-[240px] transition-all duration-300`}
                >
                  <span className="font-medium">{feature.buttonText}</span>
                </motion.button>
              {/* </Link> */}
                <p className="text-gray-700 max-w-md leading-relaxed">
                  {feature.description}
                </p>
              </div>

              {/* Right side - Image */}
              <div className="w-full md:w-3/5 order-1 md:order-2">
                <div className="relative rounded-full overflow-hidden shadow-lg">
                  <img
                    src={`${process.env.NEXT_PUBLIC_BUCKET_URL}${feature.imageSrc}?t=${Date.now()}`}
                    alt={feature.imageAlt}
                    className="w-full h-auto object-cover rounded-xl"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `https://via.placeholder.com/800x500?text=${feature.imageAlt.replace(' ', '+')}`;
                    }}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
