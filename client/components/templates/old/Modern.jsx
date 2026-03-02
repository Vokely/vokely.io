import Image from 'next/image';

export default function Modern({ data }) {
  const { personal, skills, experience, education, projects, achievements, languages, userImage } = data;
  
  return (
    <div className="resume-template bg-slate-50">
      <div className="mx-auto p-8">
        {/* Header with Image */}
        <div className="flex items-center gap-8 mb-8">
          <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
            <Image
              src={userImage}
              alt={`${personal?.firstName} ${personal?.lastName}`}
              fill
              className="object-cover"
            />
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {personal?.firstName} {personal?.lastName}
            </h1>
            <p className="text-xl text-slate-600 mb-2">{personal?.title}</p>
            <div className="text-sm text-slate-500">
              <p>{personal.email} • {personal.phone}</p>
              <p>{personal.location}</p>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="col-span-1">
            {/* Skills */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-3 text-slate-800">Skills</h2>
              <div className="space-y-2">
                {skills.map((skill, index) => (
                  <div key={index} className="bg-white px-3 py-1.5 rounded-lg shadow-sm text-sm">
                    {skill}
                  </div>
                ))}
              </div>
            </div>

            {/* Languages */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-3 text-slate-800">Languages</h2>
              {languages.map((lang, index) => (
                <div key={index} className="mb-2">
                  <p className="font-medium">{lang.language}</p>
                  <p className="text-sm text-slate-600">{lang.proficiency}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column */}
          <div className="col-span-2">
            {/* Summary */}
            <div className="mb-8">
              <p className="text-slate-700 leading-relaxed">{personalInfo.summary}</p>
            </div>

            {/* Experience */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-slate-800">Experience</h2>
              {experience.map((exp, index) => (
                <div key={index} className="mb-6">
                  <div className="flex justify-between items-baseline mb-2">
                    <h3 className="font-semibold text-lg">{exp.title}</h3>
                    <span className="text-sm text-slate-500">{exp.startDate} - {exp.endDate}</span>
                  </div>
                  <p className="text-slate-600 mb-2">{exp.company} • {exp.location}</p>
                  <p className="text-sm text-slate-700">{exp.description}</p>
                </div>
              ))}
            </div>

            {/* Projects */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-slate-800">Projects</h2>
              {projects.map((project, index) => (
                <div key={index} className="mb-4">
                  <h3 className="font-semibold">{project.name}</h3>
                  <p className="text-sm text-blue-600 mb-1">{project.link}</p>
                  <p className="text-sm text-slate-700">{project.description}</p>
                </div>
              ))}
            </div>

            {/* Education */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-slate-800">Education</h2>
              {education.map((edu, index) => (
                <div key={index} className="mb-4">
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-semibold">{edu.degree}</h3>
                    <span className="text-sm text-slate-500">{edu.startDate} - {edu.endDate}</span>
                  </div>
                  <p className="text-slate-600">{edu.school} • {edu.location}</p>
                  <p className="text-sm text-slate-500">GPA: {edu.gpa}</p>
                </div>
              ))}
            </div>

            {/* Achievements */}
            <div>
              <h2 className="text-xl font-semibold mb-4 text-slate-800">Achievements</h2>
              <ul className="list-disc list-inside space-y-2">
                {achievements.map((achievement, index) => (
                  <li key={index} className="text-slate-700">{achievement}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}