import { useEffect, useMemo, useRef, useState } from 'react';
import NewResumePlus from '../icons/NewResumePlus';
import "@/styles/dashboard.css";
import useProfileStore from '@/store/profileStore';
import { useRouter } from 'next/navigation';
import { deleteResume } from '@/lib/resumeUtils';
import useNavigationStore from '@/store/navigationStore';

export default function Resumes({ resumes, setResumes, createNewResume, fetchDetails }) {
  const router = useRouter();
  const { resetAllState } = useProfileStore();
  const { setActiveSection, setActiveMenu } = useNavigationStore();
  const [selectedJD, setSelectedJD] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const dropdownRef = useRef(null);

  const handleViewJD = (jobDescription) => {
    setSelectedJD(jobDescription?.trim() ? jobDescription : "No job description found for this resume.");
  };

  const closeModal = () => setSelectedJD(null);

  const toggleDropdown = (index) => {
    setDropdownOpen(dropdownOpen === index ? null : index);
  };

  const handleResumeOpen = (resume) => {
    resetAllState();
    localStorage.removeItem("profile-store");
    setActiveSection("Personal Info");
    setActiveMenu("");
    router.push(`/resumes/simple/1/edit/${resume._id}`);
  };

  const handleDeleteClick = (resumeId) => {
    setDeleteConfirm(resumeId);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    setDropdownOpen(null);
    await deleteResume(deleteConfirm);
    setResumes(resumes.data.filter((resume) => resume._id !== deleteConfirm));
    setDeleteConfirm(null);
    await fetchDetails();
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const formattedResumes = useMemo(() => {
    return resumes?.data?.map((resume) => ({
      ...resume,
      formattedDate: resume.modified_at
        ? new Date(resume.modified_at).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          })
        : null,
    }));
  }, [resumes]);

  return (
    <div className="mt-6 rounded-2xl border border-slate-200 bg-white/90 p-4 sm:p-5 shadow-sm backdrop-blur">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-3">
        <div>
          <h2 className="text-lg md:text-xl font-semibold text-slate-900">
            Your resumes
          </h2>
          <p className="text-xs text-slate-500">
            Manage AI-generated, role-specific resumes and keep them up to date.
          </p>
        </div>
        <button
          onClick={createNewResume}
          className="mt-1 inline-flex items-center justify-center rounded-full bg-primary px-4 py-1.5 text-xs font-medium text-white hover:bg-primary/90 sm:mt-0"
        >
          Create new resume
        </button>
      </div>

      <div className="mt-3 rounded-xl bg-slate-50/80 p-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[50vh] overflow-y-auto">
          {/* Create New Resume Card */}
          <button
            type="button"
            onClick={createNewResume}
            className="flex flex-col items-center justify-center rounded-xl border border-dashed border-primary/50 bg-white/90 px-3 py-5 text-center shadow-sm transition hover:-translate-y-1 hover:border-primary hover:shadow-md"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <NewResumePlus size={26} />
            </span>
            <span className="mt-3 text-sm font-medium text-slate-900">
              New resume
            </span>
            <span className="mt-1 text-xs text-slate-500">
              Generate a tailored resume for a specific role.
            </span>
          </button>

          {/* Existing Resumes */}
          {formattedResumes?.map((resume, index) => (
            <div
              key={index}
              className="relative flex flex-col rounded-xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="flex items-start justify-between px-3 pt-3">
                <div className="flex-1 pr-2">
                  <h3 className="text-sm font-semibold text-slate-900">
                    {resume.name.length > 30
                      ? `${resume.name.slice(0, 24)}…`
                      : resume.name}
                  </h3>
                  {resume.formattedDate && (
                    <p className="mt-1 text-[11px] text-slate-500">
                      Updated {resume.formattedDate}
                    </p>
                  )}
                </div>
                <div
                  className="flex flex-col gap-[2px] cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleDropdown(index);
                  }}
                >
                  <div className="h-[4px] w-[4px] rounded-full bg-slate-500" />
                  <div className="h-[4px] w-[4px] rounded-full bg-slate-500" />
                  <div className="h-[4px] w-[4px] rounded-full bg-slate-500" />
                </div>
              </div>

              <button
                onClick={() => handleResumeOpen(resume)}
                className="mt-2 h-44 w-full overflow-hidden rounded-b-xl border-t border-slate-100 transition hover:brightness-[1.03]"
              >
                <img
                  src={`${process.env.NEXT_PUBLIC_BUCKET_URL}/templates/Impact.png`}
                  className="h-full w-full object-cover"
                  alt="Resume preview"
                />
              </button>

              {dropdownOpen === index && (
                <div
                  ref={dropdownRef}
                  className="absolute right-2 top-8 z-20 w-36 rounded-md border border-slate-200 bg-white shadow-lg"
                >
                  <button
                    className="block w-full px-3 py-2 text-left text-xs hover:bg-slate-50"
                    onClick={() => handleResumeOpen(resume)}
                  >
                    Edit
                  </button>
                  <button
                    className="block w-full px-3 py-2 text-left text-xs hover:bg-slate-50"
                    onClick={() => handleViewJD(resume.job_description)}
                  >
                    View JD
                  </button>
                  <button
                    className="block w-full px-3 py-2 text-left text-xs text-red-600 hover:bg-red-50"
                    onClick={() => handleDeleteClick(resume._id)}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* JD Modal */}
      {selectedJD && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/50">
          <div className="relative max-h-[70vh] w-[90%] max-w-xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl">
            <h2 className="text-base font-semibold text-slate-900 mb-3">
              Job description
            </h2>
            <p className="text-sm text-slate-700 whitespace-pre-line">
              {selectedJD}
            </p>
            <button
              className="mt-4 rounded-full bg-slate-900 px-4 py-1.5 text-xs font-medium text-white hover:bg-slate-800 absolute top-3 right-3"
              onClick={closeModal}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/50">
          <div className="w-[90%] max-w-sm rounded-lg bg-white p-6 text-center shadow-xl">
            <h2 className="text-base font-semibold text-slate-900 mb-2">
              Delete resume?
            </h2>
            <p className="text-sm text-slate-600">
              Are you sure you want to delete this resume? This action cannot be undone.
            </p>
            <div className="mt-5 flex justify-center gap-3">
              <button
                className="rounded-full bg-slate-100 px-4 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200"
                onClick={() => setDeleteConfirm(null)}
              >
                Cancel
              </button>
              <button
                className="rounded-full bg-red-500 px-4 py-1.5 text-xs font-medium text-white hover:bg-red-600"
                onClick={confirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
