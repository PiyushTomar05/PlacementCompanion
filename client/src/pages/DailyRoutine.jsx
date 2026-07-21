import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import GlassCard from '../components/GlassCard';
import { 
  FiCheckCircle, 
  FiBookOpen, 
  FiCpu, 
  FiRepeat, 
  FiMessageSquare, 
  FiArrowRight, 
  FiPlay, 
  FiAward 
} from 'react-icons/fi';

export default function DailyRoutine() {
  const [words, setWords] = useState([]);
  const [csTopics, setCsTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [wRes, cRes] = await Promise.all([
          axios.get('/api/english/words'),
          axios.get('/api/cs/topics')
        ]);
        if (wRes.data.success) setWords(wRes.data.data);
        if (cRes.data.success) setCsTopics(cRes.data.data);
      } catch (err) {
        console.error('Daily Routine load error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <FiPlay className="text-indigo-400" /> Daily Placement Routine
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Follow today's learning pathway step-by-step to maximize your placement readiness.
          </p>
        </div>
        <button
          onClick={() => navigate('/english')}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-md flex items-center gap-2 self-start md:self-auto"
        >
          <span>Start English First</span>
          <FiArrowRight />
        </button>
      </div>

      {/* Step 1: English Module Timeline */}
      <GlassCard hover={false} className="border-l-4 border-l-cyan-500">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold text-lg border border-cyan-500/30">
              1
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FiBookOpen className="text-cyan-400" /> English Communication (10 Words)
              </h2>
              <p className="text-xs text-slate-400">Generate 10 words, write sentences & trigger AI evaluation</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/english')}
            className="px-4 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold flex items-center gap-1.5"
          >
            <span>Open English Module</span>
            <FiArrowRight />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-4">
          {words.slice(0, 10).map((w, idx) => (
            <div key={w.id} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
              <span className="text-[10px] font-mono text-cyan-400 font-bold">#Word {idx + 1}</span>
              <h4 className="font-bold text-sm text-slate-200 truncate">{w.word}</h4>
              <p className="text-[11px] text-slate-400 italic truncate">{w.meaning}</p>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Step 2: Core CS Module Timeline */}
      <GlassCard hover={false} className="border-l-4 border-l-emerald-500">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-lg border border-emerald-500/30">
              2
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FiCpu className="text-emerald-400" /> Core CS Topics (10 Subjects)
              </h2>
              <p className="text-xs text-slate-400">Read concept definition, analogy, code example & mini quiz</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/cs')}
            className="px-4 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5"
          >
            <span>Open CS Module</span>
            <FiArrowRight />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mt-4">
          {csTopics.map((topic) => (
            <div 
              key={topic.id} 
              onClick={() => navigate('/cs')}
              className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 cursor-pointer transition-all"
            >
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">{topic.subject}</span>
              <h4 className="font-bold text-sm text-slate-200 truncate">{topic.topicName}</h4>
              <div className="flex items-center justify-between mt-2 text-[10px] text-slate-400">
                <span>{topic.readingTime}</span>
                {topic.completed ? (
                  <span className="text-emerald-400 font-bold flex items-center gap-1"><FiCheckCircle /> Done</span>
                ) : (
                  <span className="text-slate-500">Pending</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Step 3: Revision Module */}
      <GlassCard hover={false} className="border-l-4 border-l-amber-500">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-lg border border-amber-500/30">
              3
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FiRepeat className="text-amber-400" /> Spaced Repetition Revision
              </h2>
              <p className="text-xs text-slate-400">Review 5 previous words & 1 topic per subject</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/revision')}
            className="px-4 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center gap-1.5"
          >
            <span>Start Revision Deck</span>
            <FiArrowRight />
          </button>
        </div>
      </GlassCard>

      {/* Step 4: Interview Prep */}
      <GlassCard hover={false} className="border-l-4 border-l-purple-500">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold text-lg border border-purple-500/30">
              4
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FiMessageSquare className="text-purple-400" /> Mock Interview Answer Evaluation
              </h2>
              <p className="text-xs text-slate-400">Answer Technical & HR questions; get instant AI feedback & scores</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/interview')}
            className="px-4 py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-semibold flex items-center gap-1.5"
          >
            <span>Start Mock Practice</span>
            <FiArrowRight />
          </button>
        </div>
      </GlassCard>
    </div>
  );
}
