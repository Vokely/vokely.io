'use client'
import Resumes from '@/components/dashboard/Resumes';
import Interviews from '@/components/dashboard/Interviews';
import Roadmaps from '@/components/dashboard/Roadmaps';
import TriStar from '@/components/icons/TriStar';
import NewSideBar from '@/components/layouts/NewSideBar';
import useProfileStore from '@/store/profileStore';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { createResume, getAllResumes } from '@/lib/resumeUtils';
import { getProfileDetails } from '@/lib/fetchUtil';
import useUserDetailsStore from '@/store/userDetails';
import useAlertStore from '@/store/alertDialogstore';
import useNavigationStore from '@/store/navigationStore';
import Templates from '@/components/dashboard/Templates';
import useIsMobile from '@/hooks/IsMobile';
import { getInterviewHistory } from '@/lib/interviewUtil';
import { getAllRoadmapsOfUser } from '@/lib/roadmapUtil';
import useAPIWrapper from '@/hooks/useAPIWrapper';
import { useAuth } from '@/hooks/useAuth';

const DashBoard = () => {
  const isMobile = useIsMobile()
  const [resumes, setResumes] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [roadmaps, setRoadmaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roadmapsLoading, setRoadmapsLoading] = useState(true);
  const [interviewsLoading, setInterviewsLoading] = useState(true);
  const { setUserDetails, setUserId } = useUserDetailsStore();
  const [id, setId] = useState(null)
  const router = useRouter();
  const { user_details } = useUserDetailsStore();
  const { setModified, resetAllState, resetUntrackedChanges } = useProfileStore();
  const { isTemplatesVisible, setIsTemplatesVisible } = useNavigationStore()
  const openAlertDialog = useAlertStore((state) => state.openAlert);
  const { callApi } = useAPIWrapper();
  const { checkAuth } = useAuth();

  const buttons = [
    { name: "Create a learning roadmap", key: "roadmap" },
    { name: "Start a mock interview", key: "interview" },
    { name: "Generate new Resume", key: "resume" },
  ];

  useEffect(() => {
    if (typeof window !== "undefined" && id !== null) {
      localStorage.setItem("id", id);
    }
  }, [id]);

  function isEmptyValue(value) {
    if (value == null) return true;
    if (typeof value === 'string') return value.trim().length === 0;
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === 'object') return isObjectEmpty(value);
    return false;
  }

  function isObjectEmpty(obj) {
    return (
      obj &&
      typeof obj === 'object' &&
      Object.values(obj).every((val) => isEmptyValue(val))
    );
  }

  const createNewResume = async () => {
    const isEmpty = isObjectEmpty(user_details)
    if (isEmpty) {
      const route = await openAlertDialog(
        'Alert',
        'Please fill in your details to create a resume.',
        { confirmText: 'Fill Details', cancelText: 'Cancel' }
      );
      if (route === true) {
        router.push("/profile")
      }
      return
    }
    resetAllState()
    localStorage.removeItem("profile-store");
    const createdResumeDetails = await callApi(createResume, user_details);
    if (createdResumeDetails) {
      setId(createdResumeDetails.resume_id)
      setIsTemplatesVisible(true)
    }
  };

  const clickHandler = async (name) => {
    if (name === "resume") {
      await createNewResume();
    } else if (name === "interview") {
      router.push("/ai-interviewer")
    } else if (name === "roadmap") {
      router.push("/ai-learning-guide")
    } else if (name === "skill-gap") {
      router.push("/ai-skill-gap-analysis") // adjust to your actual route
    }
  };

  const fetchDetails = async () => {
    setLoading(true);
    const resumes = await getAllResumes();
    setResumes(resumes);
    const storedData = localStorage.getItem("user-details-storage");
    if (!storedData) {
      const response = await getProfileDetails();
      if (response.profile_details?.resume_data) {
        setUserDetails(response.profile_details?.resume_data);
        setUserId(response?.profile_details?.user_id)
        resetUntrackedChanges()
      }
    }
    setLoading(false);
  }

  const fetchAllInterviews = async () => {
    setInterviewsLoading(true)
    const response = await getInterviewHistory();
    setInterviews(response.all_interviews)
    setInterviewsLoading(false)
  }

  const fetchAllRoadmaps = async () => {
    setRoadmapsLoading(true)
    const response = await getAllRoadmapsOfUser();
    setRoadmaps(response.all_roadmaps)
    setRoadmapsLoading(false)
  }

  useEffect(() => {
    fetchDetails();
    fetchAllInterviews();
    fetchAllRoadmaps();
    checkAuth();
  }, []);

  if (isTemplatesVisible) {
    return (<Templates id={id} />)
  }

  const firstName = user_details?.personalInfo?.firstName || "";
  const lastName = user_details?.personalInfo?.lastName || "";

  return (
    <div className="min-h-screen bg-bgviolet flex flex-col md:flex-row">
      {/* Sidebar */}
      {isMobile ? (
        <div className="sticky top-0 z-[999] w-full bg-bgviolet/80 backdrop-blur py-3 px-2 flex justify-between items-center">
          <NewSideBar />
        </div>
      ) : (
        <div className="h-screen sticky top-0 flex-shrink-0">
          <NewSideBar />
        </div>
      )}

      {/* Main Content */}
      <main className="flex-grow mx-auto md:mx-8 lg:mx-10 md:mt-[6vh] w-full p-4 sm:p-6 lg:p-8">
        {/* Top header & quick summary */}
        <section className="space-y-3">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold tracking-[0.2em] uppercase text-slate-500">
                Dashboard
              </p>
              <h1 className="mt-1 text-2xl md:text-3xl font-semibold text-slate-900">
                Welcome back{" "}
                <span className="text-primary">
                  {firstName} {lastName}
                </span>
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                Redefining your job search & hiring journey with AI-powered roadmaps, interviews and resumes.
              </p>
            </div>

            {/* Quick actions (desktop, condensed) */}
            <div className="hidden md:flex flex-wrap gap-2 justify-end">
              {buttons.map((btn, i) => (
                <button
                  key={i}
                  onClick={() => clickHandler(btn.key)}
                  className="inline-flex items-center gap-2 rounded-full border border-primary/70 bg-white px-4 py-2 text-xs font-medium text-primary shadow-sm transition hover:bg-primary hover:text-white"
                >
                  <TriStar size="18" />
                  {btn.name}
                </button>
              ))}
            </div>
          </div>

          {/* Metrics / Feature cards */}
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {/* Roadmaps */}
            <button
              onClick={() => clickHandler("roadmap")}
              className="group rounded-2xl border border-slate-200 bg-white/80 p-4 text-left shadow-sm backdrop-blur transition hover:-translate-y-1 hover:shadow-md"
            >
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                AI roadmaps
              </p>
              <h3 className="mt-2 text-sm font-semibold text-slate-900">
                Guidance tailored to your role
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                {roadmapsLoading ? "Loading..." : `${roadmaps?.length || 0} active roadmaps`}
              </p>
              <p className="mt-3 inline-flex items-center text-[11px] font-medium text-primary group-hover:underline">
                Open roadmaps
              </p>
            </button>

            {/* Interviews */}
            <button
              onClick={() => clickHandler("interview")}
              className="group rounded-2xl border border-slate-200 bg-white/80 p-4 text-left shadow-sm backdrop-blur transition hover:-translate-y-1 hover:shadow-md"
            >
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                AI interviews
              </p>
              <h3 className="mt-2 text-sm font-semibold text-slate-900">
                Practice real interviews on demand
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                {interviewsLoading ? "Loading..." : `${interviews?.length || 0} past sessions`}
              </p>
              <p className="mt-3 inline-flex items-center text-[11px] font-medium text-primary group-hover:underline">
                Start a mock session
              </p>
            </button>

            {/* Resumes */}
            <button
              onClick={() => clickHandler("resume")}
              className="group rounded-2xl border border-slate-200 bg-white/80 p-4 text-left shadow-sm backdrop-blur transition hover:-translate-y-1 hover:shadow-md"
            >
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                AI resumes
              </p>
              <h3 className="mt-2 text-sm font-semibold text-slate-900">
                Create role-ready resumes in minutes
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                {loading ? "Loading..." : `${resumes?.length || 0} saved resumes`}
              </p>
              <p className="mt-3 inline-flex items-center text-[11px] font-medium text-primary group-hover:underline">
                Generate new resume
              </p>
            </button>

            {/* Skill gap analysis */}
            <button
              onClick={() => clickHandler("skill-gap")}
              className="group rounded-2xl border border-dashed border-primary/30 bg-gradient-to-br from-white via-white to-primary/5 p-4 text-left shadow-sm backdrop-blur transition hover:-translate-y-1 hover:shadow-md"
            >
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                AI skill gap analysis
              </p>
              <h3 className="mt-2 text-sm font-semibold text-slate-900">
                Understand what’s missing for your next role
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Compare your profile with target roles & get an action plan.
              </p>
              <p className="mt-3 inline-flex items-center text-[11px] font-medium text-primary group-hover:underline">
                Run skill gap analysis
              </p>
            </button>
          </div>

          {/* Mobile quick actions (full width) */}
          <div className="mt-4 flex flex-col gap-2 md:hidden">
            {buttons.map((btn, i) => (
              <button
                key={i}
                onClick={() => clickHandler(btn.key)}
                className="flex items-center justify-center gap-2 rounded-xl border border-primary/60 bg-white px-4 py-2.5 text-sm font-medium text-primary shadow-sm transition hover:bg-primary hover:text-white"
              >
                <TriStar size="18" />
                {btn.name}
              </button>
            ))}
          </div>
        </section>

        {/* Detail sections (your existing components, in a clean stack) */}
        <section className="mt-6 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 sm:p-5 shadow-sm backdrop-blur">
            <Roadmaps
              roadmaps={roadmaps}
              loading={roadmapsLoading}
              fetchRoadmaps={fetchAllRoadmaps}
              user_details={user_details}
            />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 sm:p-5 shadow-sm backdrop-blur">
            <Interviews
              interviews={interviews}
              loading={interviewsLoading}
              fetchInterviews={fetchAllInterviews}
              user_details={user_details}
            />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 sm:p-5 shadow-sm backdrop-blur">
            <Resumes
              resumes={resumes}
              createNewResume={createNewResume}
              setResumes={setResumes}
              setModified={setModified}
              fetchDetails={fetchDetails}
              setId={setId}
              loading={loading}
            />
          </div>
        </section>
        {/* Floating Feedback / Feature Request Button */}
        <a
          href="https://vokely.featurebase.app"
          target="_blank"
          rel="noopener noreferrer"
          className="
            fixed bottom-5 right-5 z-[9999]
            flex items-center gap-2
            rounded-full bg-primary text-white shadow-lg
            px-4 py-3
            hover:bg-primary/90 transition-all 
            active:scale-95
          "
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M21 16a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="font-medium text-sm">Feature Request</span>
        </a>

      </main>
    </div>
  );
};

export default DashBoard;
