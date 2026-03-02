import { comingSoonData } from "@/data/comingSoon";
import Navbar from "../layouts/Navbar";

export default function ComingSoon() {
  const randomIndex = Math.floor(Math.random() * comingSoonData.length);
  const randomItem = comingSoonData[randomIndex];

  const images = ["coming-soon.png", "working-hard.png"];
  const randomImage = images[Math.floor(Math.random() * images.length)];

  return (
    <div>
      <Navbar />
      <div className="grid place-items-center h-[90vh] text-center p-6">
        <div className="space-y-2">
          <span className="text-[#6B6B6B]">{randomItem.heading}</span>
          <p className="text-xl font-semibold">{randomItem.text}</p>
          <p className="text-primary font-semibold">{randomItem.spanText}</p>
        </div>

        <div className="img-container h-[50vh] w-[60vw]">
          <img
            src={`${process.env.NEXT_PUBLIC_BUCKET_URL}/images/${randomImage}`}
            alt="coming-soon"
          />
        </div>


        <div className="space-y-5">
            <h2>Explore our AI-powered tools to boost your job search.</h2>
            <div className="flex gap-5">
                <a href="/ai-interviewer">
                <button className="border-[1px] rounded-md text-primary border-primary px-12 py-2">AI Interviewer</button>
                </a>

                <a href="/dashboard">
                <button className="rounded-md bg-primary text-white px-12 py-2">AI Resume Builder</button>
                </a>      
            </div>
        </div>
      </div>
    </div>
  );
}
