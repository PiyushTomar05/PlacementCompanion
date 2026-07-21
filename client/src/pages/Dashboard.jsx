import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import GlassCard from '../components/GlassCard';
import { motion } from 'framer-motion';
import { 
  FiCheckCircle, 
  FiBookOpen, 
  FiCpu, 
  FiMessageSquare, 
  FiAward, 
  FiArrowRight, 
  FiZap,
  FiActivity
} from 'react-icons/fi';
import { FaFire } from 'react-icons/fa';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    try {
      const res = await axios.get('/api/dashboard');
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleTaskToggle = async (taskId) => {
    try {
      await axios.post(`/api/dashboard/task/${taskId}/toggle`);
      fetchDashboardData();
    } catch (err) {
      console.error('Task toggle error:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const { progress, tasks, dailyCompletionPercentage } = data || {};

  return (
    <div className="space-y-8 pb-10">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900/80 via-purple-900/60 to-slate-900 border border-indigo-500/20 p-8 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-xs font-semibold mb-3">
              <FiZap className="text-amber-400" /> Daily Placement Target
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              Ready to Conquer Today's CS & English Goals?
            </h1>
            <p className="mt-2 text-slate-300 max-w-xl text-sm leading-relaxed">
              Consistently revise Computer Science core fundamentals and refine your English communication for upcoming software engineering placement interviews.
            </p>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <button
              onClick={() => navigate('/routine')}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold text-sm shadow-lg shadow-indigo-500/30 flex items-center gap-2 transition-all hover:scale-105"
            >
              <span>Start Daily Routine</span>
              <FiArrowRight />
            </button>
          </div>
        </div>
      </div>

      {/* Overview Metric Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <GlassCard glow="glow-purple">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Current Streak</p>
              <h3 className="text-3xl font-extrabold text-white mt-1">{progress?.currentStreak ?? 1} Days</h3>
              <p className="text-xs text-emerald-400 font-medium mt-1">Longest: {progress?.longestStreak ?? 1} Days</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 text-2xl">
              <FaFire className="animate-pulse" />
            </div>
          </div>
        </GlassCard>

        <GlassCard glow="glow-cyan">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Words Learned</p>
              <h3 className="text-3xl font-extrabold text-white mt-1">{progress?.wordsLearned ?? 0} Words</h3>
              <p className="text-xs text-indigo-400 font-medium mt-1">{progress?.sentencesWritten ?? 0} AI Reviews</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 text-2xl">
              <FiBookOpen />
            </div>
          </div>
        </GlassCard>

        <GlassCard glow="glow-emerald">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Concepts Completed</p>
              <h3 className="text-3xl font-extrabold text-white mt-1">{progress?.conceptsCompleted ?? 0} Topics</h3>
              <p className="text-xs text-emerald-400 font-medium mt-1">{progress?.conceptCompletionPercentage ?? 0}% CS Mastery</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-2xl">
              <FiCpu />
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Interview Readiness</p>
              <h3 className="text-3xl font-extrabold text-white mt-1">{progress?.interviewReadinessScore ?? 0}%</h3>
              <p className="text-xs text-purple-400 font-medium mt-1">Avg Score: {progress?.avgGrammarScore ?? 0}/10</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 text-2xl">
              <FiAward />
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Main Content Split: Today's Progress & Quick Modules */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 cols): Today's Learning Tasks */}
        <div className="lg:col-span-2 space-y-6">
          <GlassCard hover={false}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <FiCheckCircle className="text-indigo-400" /> Today's Learning Tasks
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Complete tasks to extend your streak and raise your readiness score</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-extrabold text-indigo-400">{dailyCompletionPercentage}%</span>
                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Progress Bar</p>
              </div>
            </div>

            {/* Custom Progress Bar */}
            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden mb-6 p-0.5 border border-slate-700/50">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${dailyCompletionPercentage}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full"
              />
            </div>

            {/* Task Checklist */}
            <div className="space-y-2.5">
              {tasks?.map((t) => (
                <div
                  key={t.id}
                  onClick={() => handleTaskToggle(t.id)}
                  className={`flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer ${
                    t.completed
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-colors ${
                      t.completed ? 'bg-emerald-500 border-emerald-400 text-slate-950' : 'border-slate-600'
                    }`}>
                      {t.completed && <FiCheckCircle className="text-xs stroke-[3]" />}
                    </div>
                    <span className={`text-sm font-medium ${t.completed ? 'line-through opacity-75' : ''}`}>
                      {t.title}
                    </span>
                  </div>
                  <span className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-slate-800 text-slate-400 border border-slate-700/50">
                    {t.module}
                  </span>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Right Column: Quick Module Navigation & Heatmap Preview */}
        <div className="space-y-6">
          <GlassCard hover={false}>
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <FiActivity className="text-indigo-400" /> Subject Revision Overview
            </h3>
            <div className="space-y-3">
              {Object.entries(progress?.subjectProgress || {}).slice(0, 5).map(([subject, percent]) => (
                <div key={subject} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-300">{subject}</span>
                    <span className="text-indigo-400 font-mono font-bold">{percent}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => navigate('/analytics')}
              className="w-full mt-6 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-xs font-semibold text-indigo-300 border border-slate-700/50 transition-all flex items-center justify-center gap-2"
            >
              <span>View Detailed Analytics</span>
              <FiArrowRight />
            </button>
          </GlassCard>

          {/* Quick Launch Cards */}
          <div className="grid grid-cols-2 gap-4">
            <GlassCard onClick={() => navigate('/english')} className="text-center p-4">
              <FiBookOpen className="text-2xl text-cyan-400 mx-auto mb-2" />
              <h4 className="font-bold text-sm text-white">English</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">10 Words & AI Review</p>
            </GlassCard>

            <GlassCard onClick={() => navigate('/cs')} className="text-center p-4">
              <FiCpu className="text-2xl text-emerald-400 mx-auto mb-2" />
              <h4 className="font-bold text-sm text-white">Core CS</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">10 CS Concepts</p>
            </GlassCard>

            <GlassCard onClick={() => navigate('/revision')} className="text-center p-4">
              <FiZap className="text-2xl text-amber-400 mx-auto mb-2" />
              <h4 className="font-bold text-sm text-white">Revision</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Spaced Repetition</p>
            </GlassCard>

            <GlassCard onClick={() => navigate('/interview')} className="text-center p-4">
              <FiMessageSquare className="text-2xl text-purple-400 mx-auto mb-2" />
              <h4 className="font-bold text-sm text-white">Interview</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Mock Tech/HR</p>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
}
