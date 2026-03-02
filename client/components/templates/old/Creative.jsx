import Image from 'next/image';

export default function CreativeTemplate({ data }) {
  const { personal, skills, experience, education, projects, achievements, hobbies, languages, userImage } = data;

  return (
    <div className="resume-template bg-rose-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-rose-400 to-rose-600 text-white p-12">
        <div className="mx-auto flex items-center gap-8">
          <div className="relative w-40 h-40 rounded-full overflow-hidden border-4 border-white/80 shadow-xl">
            <Image
              src={userImage}
              alt={`${personal.firstName} ${personal.lastName}`}
              fill
              className="object-cover"
            />
          </div>
          <div>
            <h1 className="text-4xl font-bold mb-2">
              {personal.firstName} {personal.lastName}
            </h1>
            <p className="text-2xl opacity-90 mb-3">{personal.title}</p>
            <div className="text-sm opacity-80">
              <p>{personal.email} • {personal.phone}</p>
              <p>{personal.location}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[800px] mx-auto p-8">
        {/* Summary */}
        <div className="mb-12 text-lg text-rose-900/80 leading-relaxed">
          {personalInfo.summary}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-3 gap-8">
          {/* Left Sidebar */}
          <div className="space-y-8">
            {/* Skills */}
            <div>
              <h2 className="text-xl font-semibold mb-4 text-rose-900">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, index) => (
                  <span
                    key={index}
                    className="bg-white px-3 py-1 rounded-full text-sm shadow-sm text-rose-700"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Languages */}
            <div>
              <h2 className="text-xl font-semibold mb-4 text-rose-900">Languages</h2>
              {languages.map((lang, index) => (
                <div key={index} className="mb-3">
                  <p className="font-medium text-rose-800">{lang.language}</p>
                  <p className="text-sm text-rose-600">{lang.proficiency}</p>
                </div>
              ))}
            </div>

            {/* Hobbies */}
            <div>
              <h2 className="text-xl font-semibold mb-4 text-rose-900">Hobbies</h2>
              <div className="space-y-2">
                {hobbies.map((hobby, index) => (
                  <p key={index} className="text-rose-700">{hobby}</p>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="col-span-2 space-y-8">
            {/* Experience */}
            <div>
              <h2 className="text-2xl font-semibold mb-6 text-rose-900">Experience</h2>
              {experience.map((exp, index) => (
                <div key={index} className="mb-6">
                  <div className="flex justify-between items-baseline mb-2">
                    <h3 className="font-semibold text-lg text-rose-800">{exp.title}</h3>
                    <span className="text-sm text-rose-600">{exp.startDate} - {exp.endDate}</span>
                  </div>
                  <p className="text-rose-700 mb-2">{exp.company} • {exp.location}</p>
                  <p className="text-rose-600">{exp.description}</p>
                </div>
              ))}
            </div>

            {/* Projects */}
            <div>
              <h2 className="text-2xl font-semibold mb-6 text-rose-900">Projects</h2>
              {projects.map((project, index) => (
                <div key={index} className="mb-6 bg-white p-4 rounded-lg shadow-sm">
                  <h3 className="font-semibold text-rose-800">{project.name}</h3>
                  <a href={project.link} className="text-sm text-rose-500 hover:text-rose-600">
                    {project.link}
                  </a>
                  <p className="mt-2 text-rose-700">{project.description}</p>
                </div>
              ))}
            </div>

            {/* Education */}
            <div>
              <h2 className="text-2xl font-semibold mb-6 text-rose-900">Education</h2>
              {education.map((edu, index) => (
                <div key={index} className="mb-4">
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-semibold text-rose-800">{edu.degree}</h3>
                    <span className="text-sm text-rose-600">{edu.startDate} - {edu.endDate}</span>
                  </div>
                  <p className="text-rose-700">{edu.school} • {edu.location}</p>
                  <p className="text-sm text-rose-600">GPA: {edu.gpa}</p>
                </div>
              ))}
            </div>

            {/* Achievements */}
            <div>
              <h2 className="text-2xl font-semibold mb-6 text-rose-900">Achievements</h2>
              <ul className="list-disc list-inside space-y-2">
                {achievements.map((achievement, index) => (
                  <li key={index} className="text-rose-700">{achievement}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}