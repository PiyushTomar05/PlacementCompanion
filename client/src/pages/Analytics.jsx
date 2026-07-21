import React, { useState, useEffect } from 'react';
import axios from 'axios';
import GlassCard from '../components/GlassCard';
import { 
  FiTrendingUp, 
  FiBookOpen, 
  FiCpu, 
  FiAward, 
  FiActivity, 
  FiCalendar, 
  FiBarChart2 
} from 'react-icons/fi';
import { FaFire } from 'react-icons/fa';

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await axios.get('/api/dashboard');
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const { progress } = data || {};

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="border-b border-slate-800 pb-6">
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <FiTrendingUp className="text-indigo-400" /> Progress Analytics & Readiness Dashboard
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Track long-term learning consistency, grammar metrics, CS concept mastery, and placement readiness score.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <GlassCard glow="glow-purple">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Placement Readiness Score</p>
          <h2 className="text-4xl font-extrabold text-white mt-2">{progress?.interviewReadinessScore ?? 0}%</h2>
          <p className="text-xs text-purple-400 font-medium mt-1">Starting Day 1 Target</p>
        </GlassCard>

        <GlassCard glow="glow-cyan">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Average English Score</p>
          <h2 className="text-4xl font-extrabold text-cyan-300 mt-2">{progress?.avgEnglishScore ?? 0} / 10</h2>
          <p className="text-xs text-slate-400 font-medium mt-1">Grammar Avg: {progress?.avgGrammarScore ?? 0}</p>
        </GlassCard>

        <GlassCard glow="glow-emerald">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">CS Concept Completion</p>
          <h2 className="text-4xl font-extrabold text-emerald-300 mt-2">{progress?.conceptCompletionPercentage ?? 0}%</h2>
          <p className="text-xs text-emerald-400 font-medium mt-1">{progress?.conceptsCompleted ?? 0} Topics Mastered</p>
        </GlassCard>

        <GlassCard>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Revision Accuracy</p>
          <h2 className="text-4xl font-extrabold text-amber-300 mt-2">0%</h2>
          <p className="text-xs text-amber-400 font-medium mt-1">First Day Spaced Repetition</p>
        </GlassCard>
      </div>

      {/* Subject-Wise Progress Breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <GlassCard hover={false}>
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <FiCpu className="text-emerald-400" /> Subject-Wise Core CS Mastery
          </h3>
          <div className="space-y-4">
            {Object.entries(progress?.subjectProgress || {}).map(([subject, percent]) => (
              <div key={subject} className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-200">{subject}</span>
                  <span className="text-emerald-400 font-mono font-bold">{percent}%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Weekly Activity Grid & Heatmap */}
        <GlassCard hover={false}>
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <FiCalendar className="text-indigo-400" /> Weekly Activity Heatmap
          </h3>
          <div className="grid grid-cols-7 gap-3 text-center">
            {progress?.weeklyActivity?.map((dayData, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-slate-400 block">{dayData.day}</span>
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 font-bold text-xs flex items-center justify-center mx-auto">
                  {dayData.words}
                </div>
                <span className="text-[10px] text-slate-400 block">{dayData.cs} CS</span>
              </div>
            ))}
          </div>

          <div className="mt-8 p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">Streak Status</span>
            <span className="text-amber-400 font-bold flex items-center gap-1">
              <FaFire /> {progress?.currentStreak} Days Streak Active
            </span>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
