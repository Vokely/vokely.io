import "@/styles/editor.css";

export default function JD({ jobDescription, setJobDescription }) {
  return (
    <div className="px-4 py-2">
      <h1 className="text-lg sm:text-xl md:text-2xl text-primary my-2">
        Paste JD and get your Resume tailored for it
      </h1>

        <textarea
          name="jd"
          id="jd"
          rows={15}
          placeholder="Enter your Job Description"
          className="w-full max-w-5xl rounded-md resize-none p-3 border border-gray-300 text-sm sm:text-base"
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          />
    </div>
  );
}
