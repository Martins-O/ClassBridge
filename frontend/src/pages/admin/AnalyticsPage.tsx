import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2, TrendingUp, Users, BarChart3, Award, Activity } from 'lucide-react';
import axios from 'axios';
import { useAuthStore } from '@/stores/auth';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

interface AnalyticsData {
  enrollmentTrend: { _id: string; count: number }[];
  gradeDistribution: { _id: string; count: number; avgPercentage: number }[];
  classPerformance: { name: string; studentCount: number; avgGrade: number; gradeCount: number }[];
  recentActivity: { _id: string; count: number }[];
  attendanceMetrics: { _id: string; gradesPosted: number; avgPercentage: number }[];
  summary: {
    totalStudents: number;
    activeStudents: number;
    activeRate: number;
  };
}

export function AnalyticsPage() {
  const user = useAuthStore((state) => state.user);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const { data } = await api.get('/stats/analytics');
        setAnalytics(data.analytics);
      } catch (err) {
        console.error('Failed to fetch analytics:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchAnalytics();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#064e3b]" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-bold text-slate-900">No Analytics Available</h2>
          <p className="text-sm text-slate-500 mt-2">Analytics data is not available for your school.</p>
        </div>
      </div>
    );
  }

  const gradeColors: Record<string, string> = {
    A: 'bg-emerald-500', B: 'bg-blue-500', C: 'bg-amber-500', D: 'bg-orange-500', F: 'bg-red-500',
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">School Analytics</h1>
        <p className="text-sm text-slate-500 font-medium mt-1">Comprehensive insights into academic performance and engagement.</p>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-50">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase">Total Students</p>
              <p className="text-2xl font-black text-slate-900">{analytics.summary.totalStudents}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-50">
              <Activity className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase">Active Students</p>
              <p className="text-2xl font-black text-slate-900">{analytics.summary.activeStudents}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-50">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase">Engagement Rate</p>
              <p className="text-2xl font-black text-slate-900">{analytics.summary.activeRate}%</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-50">
              <Award className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase">Classes Tracked</p>
              <p className="text-2xl font-black text-slate-900">{analytics.classPerformance.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Grade Distribution */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Grade Distribution</span>
          </div>
          <div className="p-6 space-y-4">
            {analytics.gradeDistribution.length === 0 ? (
              <p className="text-center text-sm text-slate-500 py-4">No grade data available</p>
            ) : (
              analytics.gradeDistribution.map(g => (
                <div key={g._id || 'unknown'} className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm ${gradeColors[g._id] || 'bg-slate-500'}`}>
                    {g._id || 'N/A'}
                  </div>
                  <div className="flex-1">
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${gradeColors[g._id] || 'bg-slate-500'}`}
                        style={{ width: `${Math.round((g.count / analytics.summary.totalStudents) * 100)}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-900">{g.count}</p>
                    <p className="text-xs text-slate-500">Avg {g.avgPercentage?.toFixed(1) || 0}%</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Class Performance */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
            <Award className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Top Classes</span>
          </div>
          <div className="divide-y divide-slate-100">
            {analytics.classPerformance.length === 0 ? (
              <p className="text-center text-sm text-slate-500 py-8">No class data available</p>
            ) : (
              analytics.classPerformance.map((cls, i) => (
                <div key={cls.name} className="px-6 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-black text-slate-400 w-4">{i + 1}</span>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{cls.name}</p>
                      <p className="text-xs text-slate-500">{cls.studentCount} students • {cls.gradeCount} grades</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-emerald-600">{cls.avgGrade.toFixed(1)}%</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Enrollment Trend */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Enrollment Trend</span>
          </div>
          <div className="p-6">
            {analytics.enrollmentTrend.length === 0 ? (
              <p className="text-center text-sm text-slate-500 py-4">No enrollment data available</p>
            ) : (
              <div className="flex items-end gap-2 h-32">
                {analytics.enrollmentTrend.map((month) => {
                  const maxCount = Math.max(...analytics.enrollmentTrend.map(m => m.count));
                  const height = maxCount > 0 ? (month.count / maxCount) * 100 : 0;
                  return (
                    <div key={month._id} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full bg-[#064e3b]/20 rounded-t-sm" style={{ height: `${height}%` }} />
                      <span className="text-[10px] text-slate-500">{month._id.slice(5)}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Activity Trend */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
            <Activity className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Recent Activity</span>
          </div>
          <div className="p-6">
            {analytics.recentActivity.length === 0 ? (
              <p className="text-center text-sm text-slate-500 py-4">No activity data available</p>
            ) : (
              <div className="flex items-end gap-1 h-32">
                {analytics.recentActivity.map((day) => {
                  const maxCount = Math.max(...analytics.recentActivity.map(d => d.count));
                  const height = maxCount > 0 ? (day.count / maxCount) * 100 : 0;
                  return (
                    <div key={day._id} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full bg-blue-500/30 rounded-t-sm" style={{ height: `${height}%` }} />
                      <span className="text-[10px] text-slate-500">{day._id.slice(8)}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnalyticsPage;
