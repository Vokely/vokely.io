import { TEMPLATES } from '@/data/defaultData';
import dynamic from 'next/dynamic';
const ResumeEditor = dynamic(() => import('./editor'));

export function generateStaticParams() {
  return TEMPLATES.map((template) => ({
    category: template.category.toLowerCase(),
    templateid: template.id,
  }));
}

export default function EditorPage({ params }) {
  const category = params?.category ?? ""; 
  const templateid = params?.templateid ?? ""; 
  const resumeid = params?.resumeid ?? "";
  const template = TEMPLATES.find(
    (t) => t.id === templateid && t.category.toLowerCase() === category.toLowerCase()
  );
  
  if (!template) {
    return <div>Template not found</div>;
  }

  return <ResumeEditor template={template} resumeId={resumeid} />;
}