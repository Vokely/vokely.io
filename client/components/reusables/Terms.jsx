import { terms } from "@/data/terms";

const TermsAndConditions = () => {
  return (
    <div className="terms-container px-6 py-10 max-w-4xl mx-auto bg-white p-4 rounded-md">
      <h1 className="font-semibold">Terms and Conditions</h1>
      {/* <p className="text-sm text-gray-500 mb-10">Effective Date: {termsData.effectiveDate}</p> */}

      {terms.sections.map((section, index) => (
        <section key={index} className="">
          <h2 className="text-sm">{section.title}</h2>
          {Array.isArray(section.content) ? (
            <ul className="list-disc text-sm ml-5 text-gray-700">
              {section.content.map((point, idx) => (
                <li key={idx}>{point}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-700">{section.content}</p>
          )}
        </section>
      ))}
    </div>
  );
};

export default TermsAndConditions;
