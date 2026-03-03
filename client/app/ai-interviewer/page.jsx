// This file should be named page.js or similar in your Next.js app directory structure

import InterviewerClient from "@/components/interviewer/InterviewerClient";// Define metadata for the page

// Server Component that wraps your client component
export default function AIInterviewerPage() {
  return <InterviewerClient />;
}