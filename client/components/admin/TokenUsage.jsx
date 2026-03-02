'use client';

import { useState, useEffect } from 'react';
import { 
  Target, BarChart3, Users, Zap, Trophy, TrendingUp, 
  Wrench, Bot, Calendar, Clock, Activity, ChevronRight, Mail, UserCircle
} from 'lucide-react';
import { 
  getDashboardSummary, 
  getTokensByUser, 
  getTokensByModule, 
  getTokensByModel,
  getTopUsers,
  getUsageOverTime 
} from '@/lib/adminUtil';
import formatBlogDate from "@/lib/dateUtil";
import useAPIWrapper from '@/hooks/useAPIWrapper';

export default function TokenUsage({ addToast }) {
  const [timeRange, setTimeRange] = useState('last-30-days');
  const [granularity, setGranularity] = useState('hour'); //<'day' | 'week' | 'month'>
  const [summary, setSummary] = useState(null);
  const [byUser, setByUser] = useState([]);
  const [byModule, setByModule] = useState([]);
  const [byModel, setByModel] = useState([]);
  const [topUsers, setTopUsers] = useState([]);
  const [timeSeriesData, setTimeSeriesData] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');//<'overview' | 'users' | 'modules' | 'models'>

  const { callApi, loading } = useAPIWrapper();

  // ----- helpers -----
  const getDateRange = () => {
    const now = new Date();
    let startDate;

    switch (timeRange) {
      case 'today': {
        startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        break;
      }
      case 'this-week': {
        const tmp = new Date();
        const dayOfWeek = tmp.getDay(); // 0–6
        tmp.setDate(tmp.getDate() - dayOfWeek);
        tmp.setHours(0, 0, 0, 0);
        startDate = tmp;
        break;
      }
      case 'this-month': {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      }
      case 'last-30-days':
      default: {
        const tmp = new Date();
        tmp.setDate(tmp.getDate() - 30);
        startDate = tmp;
      }
    }

    return {
      start_date: startDate.toISOString(),
      end_date: new Date().toISOString(),
    };
  };

  const normalizeTimeSeriesData = (timeSeriesRes) => {
    if (!timeSeriesRes) {
      setTimeSeriesData([]);
      return;
    }

    const rawArray = Array.isArray(timeSeriesRes)
      ? timeSeriesRes
      : Array.isArray(timeSeriesRes.data)
      ? timeSeriesRes.data
      : Array.isArray(timeSeriesRes.data?.data)
      ? timeSeriesRes.data.data
      : [];

    const normalized = rawArray.map((point) => ({
      ...point,
      total_tokens:
        point.total_tokens ??
        (point.total_input_tokens || 0) + (point.total_output_tokens || 0),
    }));

    setTimeSeriesData(normalized);
  };

  // ----- individual fetchers -----
  const fetchSummary = async () => {
    const { start_date, end_date } = getDateRange();

    try {
      const res = await callApi(getDashboardSummary, start_date, end_date);
      if (res?.summary) setSummary(res.summary);
    } catch (error) {
      addToast(`Failed to fetch summary: ${error.message}`, 'error');
    }
  };

  const fetchTopUsers = async () => {
    const { start_date, end_date } = getDateRange();

    try {
      const res = await callApi(getTopUsers, 10, start_date, end_date);
      if (res?.data) setTopUsers(res.data);
      else setTopUsers([]);
    } catch (error) {
      addToast(`Failed to fetch top users: ${error.message}`, 'error');
    }
  };

  const fetchTimeSeries = async () => {
    const { start_date, end_date } = getDateRange();

    try {
      const res = await callApi(getUsageOverTime, granularity, {
        start_date,
        end_date,
      });

      // Your example payload: { data: [...], count, granularity }
      normalizeTimeSeriesData(res);
    } catch (error) {
      addToast(`Failed to fetch usage over time: ${error.message}`, 'error');
      setTimeSeriesData([]);
    }
  };

  const fetchByUser = async () => {
    const { start_date, end_date } = getDateRange();

    try {
      const res = await callApi(getTokensByUser, start_date, end_date);
      if (res?.data) setByUser(res.data);
      else setByUser([]);
    } catch (error) {
      addToast(`Failed to fetch user usage: ${error.message}`, 'error');
      setByUser([]);
    }
  };

  const fetchByModule = async () => {
    const { start_date, end_date } = getDateRange();

    try {
      const res = await callApi(getTokensByModule, start_date, end_date);
      if (res?.data) setByModule(res.data);
      else setByModule([]);
    } catch (error) {
      addToast(`Failed to fetch module usage: ${error.message}`, 'error');
      setByModule([]);
    }
  };

  const fetchByModel = async () => {
    const { start_date, end_date } = getDateRange();

    try {
      const res = await callApi(getTokensByModel, start_date, end_date);
      if (res?.data) setByModel(res.data);
      else setByModel([]);
    } catch (error) {
      addToast(`Failed to fetch model usage: ${error.message}`, 'error');
      setByModel([]);
    }
  };

  // ----- effects -----

  // Summary is used in header & stat cards → always fetched when timeRange changes
  useEffect(() => {
    fetchSummary();
  }, [timeRange]);

  // Overview tab → needs top users + time series (and responds to granularity)
  useEffect(() => {
    if (activeTab === 'overview') {
      fetchTopUsers();
      fetchTimeSeries();
    }
  }, [activeTab, timeRange, granularity]);

  // Users tab
  useEffect(() => {
    if (activeTab === 'users') {
      fetchByUser();
    }
  }, [activeTab, timeRange]);

  // Modules tab
  useEffect(() => {
    if (activeTab === 'modules') {
      fetchByModule();
    }
  }, [activeTab, timeRange]);

  // Models tab
  useEffect(() => {
    if (activeTab === 'models') {
      fetchByModel();
    }
  }, [activeTab, timeRange]);

  // ----- helpers -----
  const formatNumber = (num) => {
    if (!num) return '0';
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(2)}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(2)}K`;
    return num.toLocaleString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 bg-purple-500/20 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-2xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent flex items-center gap-3">
                <Activity className="w-8 h-8 text-purple-400" />
                Token Usage Analytics
              </h1>
              <p className="text-slate-400 mt-1">Real-time insights into your API consumption</p>
            </div>
            
            <div className="flex gap-2">
              {['today', 'this-week', 'this-month', 'last-30-days'].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                    timeRange === range
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/50'
                      : 'bg-white/5 text-slate-400 hover:bg-white/10 border border-white/10'
                  }`}
                >
                  {range.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { 
              label: 'Total Tokens', 
              value: formatNumber(summary?.total_tokens || 0), 
              subValue: summary ? `(${formatNumber(summary.total_input_tokens || 0)} in / ${formatNumber(summary.total_output_tokens || 0)} out)` : '',
              icon: Target, 
              gradient: 'from-purple-500 to-pink-500',
              color: 'text-purple-400'
            },
            { 
              label: 'Total Requests', 
              value: formatNumber(summary?.total_requests || 0), 
              icon: BarChart3, 
              gradient: 'from-blue-500 to-cyan-500',
              color: 'text-blue-400'
            },
            { 
              label: 'Unique Users', 
              value: summary?.unique_users_count || 0, 
              icon: Users, 
              gradient: 'from-green-500 to-emerald-500',
              color: 'text-green-400'
            },
            { 
              label: 'Avg Tokens/Request', 
              value: formatNumber(summary?.avg_tokens_per_request || 0), 
              icon: Zap, 
              gradient: 'from-orange-500 to-red-500',
              color: 'text-orange-400'
            },
          ].map((stat, idx) => {
            const IconComponent = stat.icon;
            return (
              <div key={idx} className="group backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-slate-400 text-sm font-medium mb-2">{stat.label}</p>
                    {stat?.subValue && (
                      <p className="text-slate-400 text-xs mb-1">{stat.subValue}</p>
                    )}
                    <p className="text-3xl font-bold text-white">{stat.value}</p>
                  </div>
                  <div className={`${stat.color} bg-gradient-to-br ${stat.gradient} p-3 rounded-xl shadow-lg bg-opacity-20`}>
                    <IconComponent className="w-7 h-7" />
                  </div>
                </div>
                <div className={`mt-4 h-1 rounded-full bg-gradient-to-r ${stat.gradient} opacity-50 group-hover:opacity-100 transition-opacity`}></div>
              </div>
            );
          })}
        </div>

        {/* Additional Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Unique Modules</p>
                <p className="text-2xl font-bold text-white mt-1">{summary?.unique_modules_count || 0}</p>
              </div>
              <Wrench className="w-6 h-6 text-purple-400" />
            </div>
          </div>
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Unique Models</p>
                <p className="text-2xl font-bold text-white mt-1">{summary?.unique_models_count || 0}</p>
              </div>
              <Bot className="w-6 h-6 text-blue-400" />
            </div>
          </div>
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="flex items-center justify-center text-slate-400 text-sm">Avg Input Tokens</p>
                <p className="text-2xl font-bold text-white mt-1">{formatNumber(summary?.avg_input_tokens || 0)}</p>
              </div>
             
              
              {/* 👇 GRANULARITY TOGGLE */}
              <div className="flex flex-wrap gap-2 text-xs">
                {[
                  { value: 'hour', label: 'hourly' },
                  { value: 'day', label: 'Daily' },
                  { value: 'week', label: 'Weekly' },
                  { value: 'month', label: 'Monthly' },
                ].map((g) => (
                  <button
                    key={g.value}
                    onClick={() => setGranularity(g.value)}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-all duration-200 ${
                      granularity === g.value
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
                        : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-2 shadow-xl">
          <div className="flex gap-2 overflow-x-auto">
            {['overview', 'users', 'modules', 'models'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                  activeTab === tab
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                    : 'text-slate-400 hover:bg-white/5'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Top Users */}
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Trophy className="w-6 h-6 text-yellow-400" />
                Top Users by Token Usage
              </h2>
              {topUsers.length === 0 ? (
                <p className="text-slate-400 text-center py-8">No user data available</p>
              ) : (
                <div className="space-y-3">
                  {topUsers.slice(0, 5).map((user, idx) => {
                    const maxTokens = topUsers[0]?.total_tokens || 1;
                    const percentage = (user.total_tokens / maxTokens) * 100;
                    return (
                      <div key={idx} className="group backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all duration-300">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-4 flex-1">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0 ${
                              idx === 0 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                              idx === 1 ? 'bg-gradient-to-r from-slate-300 to-slate-500' :
                              idx === 2 ? 'bg-gradient-to-r from-orange-400 to-orange-600' :
                              'bg-gradient-to-r from-purple-500 to-pink-500'
                            }`}>
                              {idx + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <UserCircle className="w-4 h-4 text-purple-400 flex-shrink-0" />
                                <p className="text-white font-medium truncate">{user.user_name || 'Unknown User'}</p>
                              </div>
                              {user.user_email && (
                                <div className="flex items-center gap-2 mb-1">
                                  <Mail className="w-4 h-4 text-blue-400 flex-shrink-0" />
                                  <p className="text-slate-400 text-sm truncate">{user.user_email}</p>
                                </div>
                              )}
                              <div className="flex items-center gap-3 text-xs text-slate-500">
                                <span className="flex items-center gap-1">
                                  <BarChart3 className="w-3 h-3" />
                                  {formatNumber(user.total_requests)} requests
                                </span>
                                {user.user_created_at && (
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    Member since {formatBlogDate(user.user_created_at)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0 ml-4">
                            <p className="text-white font-bold text-lg">{formatNumber(user.total_tokens)}</p>
                            <p className="text-slate-400 text-sm">tokens</p>
                          </div>
                        </div>
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Time Series Chart */}
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-green-400" />
                Usage Over Time
              </h2>
              {timeSeriesData.length === 0 ? (
                <p className="text-slate-400 text-center py-8">No time series data available</p>
              ) : (
                <div className="h-64 flex gap-[5vw]">
                  {timeSeriesData.map((point, idx) => {
                    const maxTokens = Math.max(...timeSeriesData.map(p => p.total_tokens));
                    const height = maxTokens > 0 ? (point.total_tokens / maxTokens) * 100 : 0;
                    return (
                      <div key={idx} className="relative h-[95%] group cursor-pointer relative">
                        <div 
                          className="absolute bottom-0 bg-gradient-to-t from-purple-500 to-pink-500 rounded-t-lg transition-all duration-300 hover:from-purple-400 hover:to-pink-400 w-12"
                          style={{ height: `${height}%` }}
                        >
                          <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                            {formatNumber(point.total_tokens)} tokens
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Users className="w-6 h-6 text-purple-400" />
              Usage by User
            </h2>
            {byUser.length === 0 ? (
              <p className="text-slate-400 text-center py-8">No user data available</p>
            ) : (
              <div className="space-y-4">
                {byUser.map((user, idx) => (
                  <div key={idx} className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-all duration-300">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <UserCircle className="w-5 h-5 text-purple-400" />
                          <h3 className="text-white font-bold text-lg">{user.user_name || 'Unknown User'}</h3>
                        </div>
                        {user.user_email && (
                          <div className="flex items-center gap-2 mb-2">
                            <Mail className="w-4 h-4 text-blue-400" />
                            <p className="text-slate-400 text-sm">{user.user_email}</p>
                          </div>
                        )}
                        {user.user_created_at && (
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-green-400" />
                            <p className="text-slate-500 text-sm">Member since {formatBlogDate(user.user_created_at)}</p>
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                          {formatNumber(user.total_tokens)}
                        </p>
                        <p className="text-slate-400 text-sm">total tokens</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
                      <div className="text-center">
                        <p className="text-slate-400 text-xs mb-1">Input</p>
                        <p className="text-blue-400 font-medium">{formatNumber(user.total_input_tokens)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-slate-400 text-xs mb-1">Output</p>
                        <p className="text-purple-400 font-medium">{formatNumber(user.total_output_tokens)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-slate-400 text-xs mb-1">Requests</p>
                        <p className="text-green-400 font-medium">{formatNumber(user.total_requests)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'modules' && (
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Wrench className="w-6 h-6 text-blue-400" />
              Usage by Module
            </h2>
            {byModule.length === 0 ? (
              <p className="text-slate-400 text-center py-8">No module data available</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {byModule.map((module, idx) => (
                  <div key={idx} className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-all duration-300">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-white font-bold text-lg">{module.module_id || 'Unknown Module'}</h3>
                        <p className="text-slate-400 text-sm">{formatNumber(module.total_requests)} requests</p>
                      </div>
                      <Wrench className="w-6 h-6 text-purple-400" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Input Tokens</span>
                        <span className="text-blue-400 font-medium">{formatNumber(module.total_input_tokens)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Output Tokens</span>
                        <span className="text-purple-400 font-medium">{formatNumber(module.total_output_tokens)}</span>
                      </div>
                      <div className="flex justify-between text-sm pt-2 border-t border-white/10">
                        <span className="text-white font-medium">Total</span>
                        <span className="text-white font-bold">{formatNumber(module.total_tokens)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'models' && (
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Bot className="w-6 h-6 text-green-400" />
              Usage by Model
            </h2>
            {byModel.length === 0 ? (
              <p className="text-slate-400 text-center py-8">No model data available</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {byModel.map((model, idx) => (
                  <div key={idx} className="backdrop-blur-xl bg-gradient-to-br from-white/5 to-white/10 border border-white/10 rounded-xl p-6 hover:scale-105 transition-all duration-300 shadow-xl">
                    <div className="text-center">
                      <Bot className="w-12 h-12 mx-auto mb-3 text-purple-400" />
                      <h3 className="text-white font-bold text-lg mb-2">{model.model}</h3>
                      <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-3">
                        {formatNumber(model.total_tokens)}
                      </div>
                      <p className="text-slate-400 text-sm">{formatNumber(model.total_requests)} requests</p>
                    </div>
                    <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-2 gap-2 text-xs">
                      <div className="text-center">
                        <p className="text-slate-400 mb-1">Input</p>
                        <p className="text-blue-400 font-medium">{formatNumber(model.total_input_tokens)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-slate-400 mb-1">Output</p>
                        <p className="text-purple-400 font-medium">{formatNumber(model.total_output_tokens)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}