'use client';

import { useEffect, useState } from 'react';
import {
  Users,
  Activity,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
  UserCheck,
  Calendar,
  X,
  FileText,
  Video,
  Map,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import { customFetch } from '@/lib/apiWrapper';

export default function UserCards() {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(false);
  const [activitiesCount, setActivitiesCount] = useState([]);

  // Date filtering states
  const [singleDate, setSingleDate] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filterMode, setFilterMode] = useState('none');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const [selected, setSelected] = useState('Users');

  // Detect mobile screen
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const fetchUsers = async (pageNumber, pageLimit) => {
    setLoading(true);
    try {
      // Simulate API call with mock data
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // In production, replace this with actual API call:
      const params = new URLSearchParams({
        page: pageNumber,
        limit: pageLimit,
      });
      if (filterMode === 'single' && singleDate) {
        params.append('date', singleDate);
      } else if (filterMode === 'range') {
        if (startDate) params.append('start_date', startDate);
        if (endDate) params.append('end_date', endDate);
      }
      const url = `${process.env.NEXT_PUBLIC_API_URL}/api/internal/signedusers?${params.toString()}`;
      const res = await customFetch(url, { method: 'GET' });
      const data = await res.json();
            
      setUsers(data.users);
      setTotalUsers(data.total.users_count);
      setActivitiesCount(data.total.activities_count || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(page, limit);
  }, [page, limit, filterMode, singleDate, startDate, endDate, selected]);

  const totalPages = Math.ceil(totalUsers / limit);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      const contentArea = document.getElementById('user-content-area');
      if (contentArea) {
        contentArea.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handleLimitChange = (event) => {
    setLimit(Number(event.target.value));
    setPage(1);
  };

  const handleFilterModeChange = (mode) => {
    setFilterMode(mode);
    if (mode === 'none') {
      setSingleDate('');
      setStartDate('');
      setEndDate('');
    }
    setPage(1);
  };

  const handleFilterApply = () => {
    setIsFilterOpen(false);
  };

  const clearFilters = () => {
    setFilterMode('none');
    setSingleDate('');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      let startPage = Math.max(2, page - 1);
      let endPage = Math.min(totalPages - 1, page + 1);

      if (page <= 3) {
        endPage = Math.min(4, totalPages - 1);
      }
      if (page >= totalPages - 2) {
        startPage = Math.max(2, totalPages - 3);
      }
      if (startPage > 2) {
        pages.push('...');
      }
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      if (endPage < totalPages - 1) {
        pages.push('...');
      }
      pages.push(totalPages);
    }
    return pages;
  };

  const formatDisplayDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const getActiveFilterText = () => {
    if (filterMode === 'single' && singleDate) {
      return `Filtered by date: ${formatDisplayDate(singleDate)}`;
    } else if (filterMode === 'range') {
      if (startDate && endDate) {
        return `Filtered by period: ${formatDisplayDate(startDate)} to ${formatDisplayDate(endDate)}`;
      } else if (startDate) {
        return `Filtered from: ${formatDisplayDate(startDate)}`;
      } else if (endDate) {
        return `Filtered until: ${formatDisplayDate(endDate)}`;
      }
    }
    return '';
  };

  const getActivityInfo = (featureName) => {
    let key = featureName.toLowerCase(); // normalize

    if (key.includes('resume')) {
      key = 'resume';
    } else if (key.includes('interview')) {
      key = 'interview';
    } else if (key.includes('roadmap')) {
      key = 'roadmap';
    }


    const configs = {
      resume: { icon: FileText, color: 'blue', label: 'Resumes' },
      interview: { icon: Video, color: 'green', label: 'Interviews' },
      roadmap: { icon: Map, color: 'purple', label: 'Roadmaps' },
    };

    return configs[key] || { icon: Activity, color: 'red', label: featureName };
  };


  // Calculate total activity count for a user
  const getTotalActivityCount = (activities) => {
    return activities.reduce((sum, activity) => sum + (activity.count || 0), 0);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Fixed Header */}
      <div className={`z-10 fixed right-0 top-0 z-10 backdrop-blur-xl bg-white/80 border-b border-gray-200/50 shadow-lg ${isMobile ? 'left-0' : 'left-0 ml-64'}`}>
        <div className="flex flex-col p-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Users Dashboard
                </h1>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-2 shadow-md">
                <UserCheck className="h-4 w-4 text-white" />
                <span className="font-bold text-white">{totalUsers}</span>
                <span className="text-xs text-blue-100">total</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium shadow-md hover:shadow-lg transition-all duration-200 hover:bg-gray-50"
              >
                <Calendar className="h-4 w-4" />
                {isFilterOpen ? 'Hide Filters' : 'Date Filters'}
              </button>

              {filterMode !== 'none' && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600 shadow-md hover:shadow-lg transition-all duration-200 hover:bg-red-100"
                >
                  <X className="h-4 w-4" />
                  Clear
                </button>
              )}
            </div>
          </div>

          {filterMode !== 'none' && getActiveFilterText() && (
            <div className="mt-3 inline-flex items-center self-start rounded-lg bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700 shadow-md">
              <Calendar className="mr-2 h-4 w-4" />
              {getActiveFilterText()}
            </div>
          )}

          {isFilterOpen && (
            <div className="mt-4 rounded-2xl border border-gray-200 bg-white/90 backdrop-blur-sm p-6 shadow-xl">
              <div className="flex flex-col space-y-4">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex gap-4">
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="radio"
                        value="none"
                        checked={filterMode === 'none'}
                        onChange={() => handleFilterModeChange('none')}
                        className="form-radio h-4 w-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm font-medium text-gray-700">No filter</span>
                    </label>
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="radio"
                        value="single"
                        checked={filterMode === 'single'}
                        onChange={() => handleFilterModeChange('single')}
                        className="form-radio h-4 w-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm font-medium text-gray-700">Single date</span>
                    </label>
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="radio"
                        value="range"
                        checked={filterMode === 'range'}
                        onChange={() => handleFilterModeChange('range')}
                        className="form-radio h-4 w-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm font-medium text-gray-700">Date range</span>
                    </label>
                  </div>
                </div>

                {filterMode === 'single' && (
                  <div className="flex items-center gap-3">
                    <label className="block w-24 text-sm font-semibold text-gray-700">Date:</label>
                    <input
                      type="date"
                      value={singleDate}
                      onChange={(e) => setSingleDate(e.target.value)}
                      className="block w-full max-w-xs rounded-lg border border-gray-300 bg-white px-4 py-2.5 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                  </div>
                )}

                {filterMode === 'range' && (
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-3">
                      <label className="block w-24 text-sm font-semibold text-gray-700">Start:</label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="block w-full max-w-xs rounded-lg border border-gray-300 bg-white px-4 py-2.5 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="block w-24 text-sm font-semibold text-gray-700">End:</label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="block w-full max-w-xs rounded-lg border border-gray-300 bg-white px-4 py-2.5 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                      />
                    </div>
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleFilterApply}
                    className="rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:from-blue-700 hover:to-indigo-700"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main content area */}
      <div id="user-content-area" className="flex-1 overflow-y-auto pb-24 pt-32">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">Loading users...</p>
            </div>
          </div>
        ) : (
          <div>
            {/* Activities */}
            <div className="mb-6 px-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {activitiesCount.map((activity, idx) => {
                  const info = getActivityInfo(activity.feature_name);
                  const IconComponent = info.icon;
                  return (
                    <div
                      key={idx}
                      className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100"
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
                      <div className="relative flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600 mb-1">
                            Total {info.label}
                          </p>
                          <h3 className={`text-3xl font-bold bg-gradient-to-r from-${info.color}-600 to-${info.color}-400 bg-clip-text text-primary`}>
                            {activity.total_count}
                          </h3>
                          <p className="text-xs text-gray-500 mt-1 capitalize">
                            {activity.action_type} action
                          </p>
                        </div>
                        <div className={`rounded-2xl bg-gradient-to-br from-${info.color}-100 to-${info.color}-50 p-4 shadow-inner`}>
                          <IconComponent className={`h-8 w-8 text-${info.color}-600`} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 px-6 md:grid-cols-2 lg:grid-cols-3">
              {users.length === 0 ? (
                <div className="col-span-full rounded-2xl bg-white p-12 text-center shadow-lg border border-gray-200">
                  <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-lg font-semibold text-gray-900 mb-2">No users found</p>
                  <p className="text-sm text-gray-500">Try adjusting your filters or check back later</p>
                </div>
              ) : (
                users.map((user) => (
                  <div
                    key={user._id}
                    className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-blue-200"
                  >
                    {/* User Header */}
                    <div className="relative overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 p-6">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
                      <div className="relative">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h2 className="text-xl font-bold text-white mb-1 truncate">
                              {user.name}
                            </h2>
                            <p className="text-sm text-blue-100 truncate">{user.email}</p>
                          </div>
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-sm px-3 py-1 text-xs font-semibold text-white shadow-lg">
                            <Sparkles className="h-3 w-3" />
                            {user.provider}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-blue-100">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>Joined {new Date(user.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Activities Section */}
                    <div className="flex-1 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                          <Activity className="h-5 w-5 text-blue-600" />
                          Activities
                        </h3>
                        {user.activities.length > 0 && (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                            <TrendingUp className="h-3 w-3" />
                            {getTotalActivityCount(user.activities)} total
                          </span>
                        )}
                      </div>

                      <div className="bt h-[20vh] overflow-y-scroll space-y-3">
                        {user.activities.length === 0 ? (
                          <div className="rounded-xl bg-gray-50 border border-gray-200 p-8 text-center">
                            <Activity className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                            <p className="text-sm font-medium text-gray-900">No activities yet</p>
                            <p className="text-xs text-gray-500 mt-1">User hasn't performed any actions</p>
                          </div>
                        ) : (
                          user.activities.map((activity, idx) => {
                            const info = getActivityInfo(activity.feature_name);
                            const originalFeatureName = activity.feature_name.toLowerCase();
                            const IconComponent = info.icon;
                            return (
                              <div
                                key={idx}
                                className="group/item flex items-center justify-between rounded-xl bg-gradient-to-r from-gray-50 to-white border border-gray-200 p-4 hover:shadow-md transition-all duration-200 hover:border-blue-200"
                              >
                                <div className="flex items-center gap-3">
                                  <div className={`rounded-lg bg-gradient-to-br from-${info.color}-100 to-${info.color}-50 p-2.5`}>
                                    <IconComponent className={`h-5 w-5 text-${info.color}-600`} />
                                  </div>
                                  <div>
                                    <p className="text-sm font-bold text-gray-900">
                                      {info.label} <span className='text-xs font-normal text-gray-400'>({originalFeatureName})</span>
                                    </p>
                                    <p className="text-xs text-gray-500 capitalize">
                                      {activity.action_type} action
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className={`text-2xl font-bold bg-gradient-to-r from-${info.color}-600 to-${info.color}-400 bg-clip-text text-secondary`}>
                                    {activity.count}
                                  </div>
                                  <p className="text-xs text-gray-500">times</p>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Fixed Pagination */}
      <div className={`fixed bottom-0 right-0 z-10 backdrop-blur-xl bg-white/90 border-t border-gray-200/50 shadow-2xl ${isMobile ? 'left-0' : 'left-0 ml-64'}`}>
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-6 py-4 sm:flex-row">
          <div className="flex items-center gap-3">
            <label htmlFor="limit" className="text-sm font-semibold text-gray-700">
              Show:
            </label>
            <select
              id="limit"
              value={limit}
              onChange={handleLimitChange}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="text-sm text-gray-600">per page</span>
          </div>

          <div className="text-sm font-medium text-gray-700">
            Showing <span className="font-bold text-blue-600">{users.length}</span> of{' '}
            <span className="font-bold text-blue-600">{totalUsers}</span> users
            <span className="text-gray-500 ml-2">
              (Page {page} of {totalPages})
            </span>
          </div>

          <nav className="flex items-center gap-1">
            <button
              onClick={() => handlePageChange(1)}
              disabled={page === 1}
              className="rounded-lg p-2.5 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent transition-all"
            >
              <ChevronsLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className="rounded-lg p-2.5 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent transition-all"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            {getPageNumbers().map((pageNum, index) =>
              pageNum === '...' ? (
                <span key={`ellipsis-${index}`} className="px-3 py-2 text-gray-400">
                  ...
                </span>
              ) : (
                <button
                  key={`page-${pageNum}`}
                  onClick={() => handlePageChange(pageNum)}
                  className={`h-10 w-10 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    page === pageNum
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg scale-105'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {pageNum}
                </button>
              )
            )}

            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= totalPages}
              className="rounded-lg p-2.5 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent transition-all"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <button
              onClick={() => handlePageChange(totalPages)}
              disabled={page >= totalPages}
              className="rounded-lg p-2.5 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent transition-all"
            >
              <ChevronsRight className="h-5 w-5" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
}