'use client'
import { useState } from 'react';
import { Trash2, BookOpen, Award, Calendar, BarChart3 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { calculateStats, deleteRoadmap } from '@/lib/roadmapUtil';
import useToastStore from '@/store/toastStore';
import useAlertStore from '@/store/alertDialogstore';
import { getTimeAgo } from '@/lib/dateUtil';

const Roadmaps = ({ roadmaps, loading, fetchRoadmaps, session }) => {
  const addToast = useToastStore((state) => state.addToast);
  const openAlertDialog = useAlertStore((state) => state.openAlert);
  const router = useRouter();

  const formatDate = (dateString) => getTimeAgo(dateString);
  
  const handleEdit = (id) => {
    router.push(`/ai-learning-guide/learn/${id}`);
  };

  const handleDelete = async (roadmapId) => {
    const confirmed = await openAlertDialog(
      'Delete Roadmap',
      'Are you sure you want to delete this roadmap? This action cannot be undone.'
    );

    if (confirmed) {
      try {
        const response = await deleteRoadmap(roadmapId, session?.user);
        if (response?.status !== 200) {
          addToast('Failed to delete roadmap', 'error', 'top-middle', 3000);
        } else {
          addToast('Roadmap deleted successfully', 'success', 'top-middle', 3000);
        }
      } catch (error) {
        addToast('An unexpected error occurred', 'error', 'top-middle', 3000);
      } finally {
        await fetchRoadmaps();
      }
    }
  };

  if (loading) {
    return (
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white/90 p-4 sm:p-5 shadow-sm">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg md:text-xl font-semibold text-slate-900">My learning roadmaps</h2>
        </div>
        <div className="flex flex-col items-center py-8">
          <div className="mb-3 h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-slate-500">Loading your roadmaps...</p>
        </div>
      </div>
    );
  }

  if (!roadmaps || roadmaps.length === 0) {
    return (
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white/90 p-4 sm:p-5 shadow-sm">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg md:text-xl font-semibold text-slate-900">My learning roadmaps</h2>
        </div>
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/70 py-8 text-center">
          <p className="text-sm text-slate-500 mb-3">
            You haven&apos;t created any AI learning roadmaps yet.
          </p>
          <button 
            onClick={() => router.push('/ai-learning-guide')}
            className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2 text-xs font-medium text-white hover:bg-primary/90"
          >
            Create your first roadmap
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 rounded-2xl border border-slate-200 bg-white/90 p-4 sm:p-5 shadow-sm backdrop-blur">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-3">
        <div>
          <h2 className="text-lg md:text-xl font-semibold text-slate-900">
            My learning roadmaps
          </h2>
          <p className="text-xs text-slate-500">
            Track your AI-generated learning paths and keep your streak alive.
          </p>
        </div>
        <button 
          onClick={() => router.push('/ai-learning-guide')}
          className="mt-1 inline-flex items-center justify-center rounded-full bg-primary px-4 py-1.5 text-xs font-medium text-white hover:bg-primary/90 sm:mt-0"
        >
          New roadmap
        </button>
      </div>

      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4 md:max-h-[40vh] overflow-y-auto">
        {roadmaps.map((roadmap) => {
          const stats = calculateStats(roadmap.roadmap);
          const completion = stats.totalCompletionPercentage ?? 0;

          return (
            <div 
              key={roadmap.id}
              className="flex flex-col rounded-2xl border border-slate-200 bg-slate-50/70 shadow-sm overflow-hidden"
            >
              <div className="flex flex-col gap-2 border-b border-slate-200 bg-white/90 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-slate-900">
                    {roadmap.skill}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(roadmap.created_at)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Award className="h-3 w-3" />
                      <span className="font-semibold">{roadmap.streak}</span>
                      <span>day streak</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <BarChart3 className="h-3 w-3" />
                      <span>{completion}% complete</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 justify-end sm:justify-start">
                  <button 
                    onClick={() => handleEdit(roadmap.id)}
                    className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-[11px] font-medium text-white hover:bg-primary/90"
                  >
                    <BookOpen size={14} />
                    Continue
                  </button>
                  <button 
                    onClick={() => handleDelete(roadmap.id)}
                    className="p-2 text-slate-500 hover:text-red-500"
                    aria-label="Delete roadmap"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="bg-slate-100 px-4 py-2">
                <div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
                  <div 
                    className="h-1.5 rounded-full bg-primary transition-all duration-300"
                    style={{ width: `${completion}%` }}
                  />
                </div>
                <p className="mt-1 text-[11px] text-slate-500">
                  {completion === 100
                    ? "Nice work — roadmap completed!"
                    : "Keep learning to complete your roadmap."}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Roadmaps;
