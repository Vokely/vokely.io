'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Discord from '../icons/Discord';

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      question: "How does the AI Resume Builder work?",
      answer: "Our AI Resume Builder analyzes your existing resume and the job description you're applying for. It then suggests tailored improvements to match your skills and experience with the job requirements, optimizing your resume for ATS systems and human recruiters alike."
    },
    {
      question: "Is Vokely completely free to use?",
      answer: "Vokely offers a free tier that includes basic resume optimization and limited interview practice. We also offer premium plans with advanced features like unlimited optimizations, in-depth interview feedback, and personalized career roadmaps."
    },
    {
      question: "How realistic is the AI Interview Coach?",
      answer: "Our AI Interview Coach is trained on thousands of real interview questions and scenarios across various industries. It simulates realistic interview experiences, adapts to your responses, and provides constructive feedback to help you improve your interview skills."
    },
    {
      question: "Can I use Vokely for any job or industry?",
      answer: "Yes! Vokely is designed to work across all industries and job types. Our AI tools adapt to specific job requirements and industry standards to provide tailored recommendations for your unique career path."
    },
    {
      question: "How secure is my personal information?",
      answer: "We take data security very seriously. All your personal information and resume data are encrypted and stored securely. We never share your information with third parties without your explicit consent. You can review our privacy policy for more details."
    }
  ];

  const toggleQuestion = (index) => {
    if(openIndex===index) return;
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id='faq' className="px-4 md:px-0 py-16 md:py-24 bg-white flex flex-col-reverse md:flex-row justify-between items-center">
      {/* Left Menu */}
      <div className="mt-[10vh] md:mt-0 relative w-full md:w-1/2 text-center md:text-left px-4 md:px-0 flex flex-col md:flex-row items-center justify-center">
        <h2 className="subheading relative text-2xl inline-flex flex-col gap-4">
            <span className="hidden md:block absolute font-medium -top-[50px] text-[#999999] font-caveat">Community</span>
            Whatever help you
            <span>need, we're here</span>
            <span>for you.</span>
        </h2>

        <video
          src={`${process.env.NEXT_PUBLIC_BUCKET_URL}/videos/curvy-arrow.webm`}
          autoPlay
          muted
          loop
          playsInline
          type="video/mp4"
          height={100}
          className="hidden md:block absolute -top-[50px] md:-top-[130px] -left-[10vw] md:-left-[10px] rotate-[55deg]"
        ></video>
        <a href="https://discord.gg/FbVWkM6Y" target="_blank" rel="noopener noreferrer">
          <button className="bg-black text-white font-medium rounded-md px-4 py-2 mt-6 md:mt-10 flex gap-2 mx-auto md:mx-0 items-center hover:scale-105 transition-transform duration-300">
                <Discord size="22"/>
                Join Discord
          </button>
        </a>
      </div>
      <div className="mx-auto px-4 md:px-8">
        <div className="max-w-3xl mx-auto">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className="mb-4 border-b border-gray-200 pb-4 last:border-b-0"
            >
              <button
                className="flex justify-between items-center w-full text-left py-4 focus:outline-none"
                onClick={() => toggleQuestion(index)}
                aria-expanded={openIndex === index}
              >
                <h3 className="text-lg md:text-xl font-semibold">{faq.question}</h3>
                <span className="ml-4 flex-shrink-0">
                  <svg
                    className={`w-6 h-6 transition-transform duration-300 ${
                      openIndex === index ? 'transform rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    ></path>
                  </svg>
                </span>
              </button>
              
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <p className="py-4 text-gray-600">{faq.answer}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
