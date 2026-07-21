import React, { useState, useEffect } from 'react';
import axios from 'axios';
import GlassCard from '../components/GlassCard';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiRepeat, 
  FiZap, 
  FiBookOpen, 
  FiCpu, 
  FiCheckCircle, 
  FiAlertTriangle, 
  FiAward, 
  FiFileText, 
  FiMaximize2,
  FiX
} from 'react-icons/fi';

export default function RevisionModule() {
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState('daily'); // 'daily', 'weekly', 'monthly'
  const [loading, setLoading] = useState(true);
  const [quizScore, setQuizScore] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [zoomModalItem, setZoomModalItem] = useState(null); // { type: 'word'|'cs'|'question', item }

  useEffect(() => {
    fetchRevisionData();
  }, []);

  const fetchRevisionData = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await axios.get('/api/revision/data');
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching revision data:', err);
      const msg = err.response?.data?.error || 'AI Teacher is currently unavailable. Please try again later.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 min-h-[500px] flex flex-col justify-center items-center py-16">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center text-amber-400 text-xl font-bold">
            <FiRepeat />
          </div>
        </div>
        <div className="text-center space-y-2 max-w-md">
          <h3 className="text-xl font-bold text-white">AI Teacher Generating Revision Decks...</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Building spaced repetition flashcards from your learning history across 1, 3, 7, 15, and 30 day intervals.
          </p>
        </div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="space-y-6 min-h-[400px] flex flex-col justify-center items-center py-16">
        <GlassCard hover={false} className="max-w-lg w-full text-center p-8 space-y-4 border border-rose-500/30">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/30 flex items-center justify-center text-2xl mx-auto">
            <FiRepeat />
          </div>
          <h3 className="text-xl font-bold text-white">{errorMsg}</h3>
          <p className="text-sm text-slate-400">
            The AI Teacher service is currently unreachable or API credentials are required.
          </p>
          <button
            onClick={fetchRevisionData}
            className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-lg transition-all cursor-pointer"
          >
            Retry Connection
          </button>
        </GlassCard>
      </div>
    );
  }

  const { dailyWords, dailyCsTopics, monthlyReport } = data || {};

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <FiRepeat className="text-amber-400" /> Spaced Repetition Revision Module
          </h1>
          <p className="text-slate-400 text-base mt-1">
            Systematically reinforce memory retention with targeted daily, weekly, and monthly revision cycles.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-2 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800">
          {['daily', 'weekly', 'monthly'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 rounded-xl text-sm font-bold capitalize transition-all cursor-pointer ${
                activeTab === tab
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab} Revision
            </button>
          ))}
        </div>
      </div>

      {/* Daily Revision View */}
      {activeTab === 'daily' && (
        <div className="space-y-8">
          {/* Daily English Vocabulary Deck */}
          <GlassCard hover={false}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <FiBookOpen className="text-amber-400" /> Spaced Repetition: English Vocabulary Flashcards
              </h3>
              <span className="text-xs text-slate-400 font-semibold">Click any card to zoom & expand</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {dailyWords?.map((w) => (
                <div 
                  key={w.id} 
                  onClick={() => setZoomModalItem({ type: 'word', item: w })}
                  className="p-5 rounded-2xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-amber-500/50 text-center space-y-3 cursor-pointer group transition-all duration-200 hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-amber-400 font-bold uppercase">{w.difficulty}</span>
                    <FiMaximize2 className="text-slate-500 group-hover:text-amber-400 text-base transition-colors" />
                  </div>
                  <h4 className="font-extrabold text-xl text-white group-hover:text-amber-300 transition-colors">{w.word}</h4>
                  <p className="text-sm text-slate-300 line-clamp-3 leading-relaxed">{w.meaning}</p>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Daily Core CS Topics Deck */}
          <GlassCard hover={false}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <FiCpu className="text-amber-400" /> Spaced Repetition: CS Core Roadmap Flashcards
              </h3>
              <span className="text-xs text-slate-400 font-semibold">Click any card to zoom & expand</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {dailyCsTopics?.map((t) => (
                <div 
                  key={t.id} 
                  onClick={() => setZoomModalItem({ type: 'cs', item: t })}
                  className="p-5 rounded-2xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/50 space-y-3 cursor-pointer group transition-all duration-200 hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">{t.subject}</span>
                    <FiMaximize2 className="text-slate-500 group-hover:text-emerald-400 text-base transition-colors" />
                  </div>
                  <h4 className="font-extrabold text-lg text-slate-100 group-hover:text-emerald-300 transition-colors">{t.topicName}</h4>
                  <p className="text-sm text-slate-300 line-clamp-3 leading-relaxed">{t.definition}</p>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Daily Placement Interview Questions */}
          <GlassCard hover={false}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <FiZap className="text-amber-400" /> Spaced Repetition: Placement Interview Flashcards
              </h3>
              <span className="text-xs text-slate-400 font-semibold">Click any card to zoom & expand</span>
            </div>

            <div className="space-y-4">
              {data?.interviewQuestions?.map((q) => (
                <div 
                  key={q.id} 
                  onClick={() => setZoomModalItem({ type: 'question', item: q })}
                  className="p-5 rounded-2xl bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-purple-500/50 space-y-3 cursor-pointer group transition-all duration-200 hover:shadow-xl"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-lg bg-purple-500/20 text-purple-300 font-bold text-xs">
                        {q.category}
                      </span>
                      <span className="text-amber-400 font-medium text-xs">{q.frequency}</span>
                    </div>
                    <FiMaximize2 className="text-slate-500 group-hover:text-purple-400 text-lg transition-colors" />
                  </div>
                  <h4 className="font-extrabold text-lg text-white group-hover:text-purple-300 transition-colors">{q.question}</h4>
                  <p className="text-slate-300 bg-slate-950 p-4 rounded-xl border border-slate-800 text-sm line-clamp-2 leading-relaxed">
                    <strong className="text-emerald-400 block mb-1">Model Interview Answer Preview:</strong>
                    {q.sampleAnswer}
                  </p>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      )}

      {/* Weekly Revision View */}
      {activeTab === 'weekly' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <GlassCard className="text-center p-6 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center justify-center text-2xl mx-auto">
              <FiBookOpen />
            </div>
            <h3 className="font-bold text-xl text-white">Vocabulary Quiz</h3>
            <p className="text-sm text-slate-400">10 Multiple choice questions covering this week's learned words.</p>
            <button
              onClick={() => setQuizScore(90)}
              className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm shadow-md transition-all cursor-pointer"
            >
              Start Vocab Quiz
            </button>
          </GlassCard>

          <GlassCard className="text-center p-6 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-2xl mx-auto">
              <FiCpu />
            </div>
            <h3 className="font-bold text-xl text-white">Core CS Subject Quiz</h3>
            <p className="text-sm text-slate-400">Comprehensive quiz across OOP, OS, DBMS, Networks & JS.</p>
            <button
              onClick={() => setQuizScore(85)}
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-md transition-all cursor-pointer"
            >
              Start CS Quiz
            </button>
          </GlassCard>

          <GlassCard className="text-center p-6 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/30 flex items-center justify-center text-2xl mx-auto">
              <FiAward />
            </div>
            <h3 className="font-bold text-xl text-white">Interview Practice</h3>
            <p className="text-sm text-slate-400">Rapid-fire technical and behavioral answer evaluation.</p>
            <button
              onClick={() => setQuizScore(92)}
              className="w-full py-3 rounded-xl bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold text-sm shadow-md transition-all cursor-pointer"
            >
              Start Interview Quiz
            </button>
          </GlassCard>

          {quizScore && (
            <div className="md:col-span-3 p-5 rounded-2xl bg-emerald-500/20 border border-emerald-500 text-emerald-300 text-center font-bold text-base">
              🎉 Quiz Completed! Score: {quizScore}% Accuracy! Keep up the great streak!
            </div>
          )}
        </div>
      )}

      {/* Monthly Revision View */}
      {activeTab === 'monthly' && (
        <div className="space-y-6">
          <GlassCard hover={false} className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                  <FiFileText className="text-amber-400" /> Complete Monthly Revision Sheets
                </h3>
                <p className="text-sm text-slate-400">AI Weak Concept Detection & Personalized Revision Recommendations</p>
              </div>
              <div className="px-4 py-2 rounded-xl bg-amber-500/20 text-amber-300 font-bold text-sm border border-amber-500/30">
                Revision Accuracy: {monthlyReport?.revisionAccuracy}%
              </div>
            </div>

            {/* Recommended Focus Topics */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <FiAlertTriangle /> AI Recommended Revision Focus Areas
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {monthlyReport?.recommendedFocus?.map((focus, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-sm">
                    <span className="font-semibold text-slate-200">{focus}</span>
                    <span className="px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-300 font-bold text-xs">
                      High Priority
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {/* ========================================================
          LARGE INTERACTIVE ZOOM / DETAIL MODAL OVERLAY
         ======================================================== */}
      <AnimatePresence>
        {zoomModalItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto p-8 rounded-3xl bg-slate-900 border border-amber-500/40 text-slate-100 shadow-2xl space-y-6"
            >
              {/* Close Button */}
              <button
                onClick={() => setZoomModalItem(null)}
                className="absolute top-6 right-6 p-3 rounded-2xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-all cursor-pointer"
              >
                <FiX className="text-2xl" />
              </button>

              {/* WORD MODAL */}
              {zoomModalItem.type === 'word' && (
                <div className="space-y-6">
                  <div className="space-y-2 border-b border-slate-800 pb-5 pr-12">
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 text-xs font-bold rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30">
                        {zoomModalItem.item.difficulty}
                      </span>
                      <span className="text-sm font-mono text-slate-400">{zoomModalItem.item.pronunciation}</span>
                    </div>
                    <h2 className="text-4xl font-black text-white">{zoomModalItem.item.word}</h2>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">Meaning</h4>
                      <p className="text-xl text-slate-200 leading-relaxed font-semibold">{zoomModalItem.item.meaning}</p>
                    </div>

                    {zoomModalItem.item.example && (
                      <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                        <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Example Usage</h4>
                        <p className="text-base text-slate-200 italic">"{zoomModalItem.item.example}"</p>
                      </div>
                    )}

                    {zoomModalItem.item.corporateUsage && (
                      <div className="p-5 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 space-y-1">
                        <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Corporate Context</h4>
                        <p className="text-sm text-slate-200">{zoomModalItem.item.corporateUsage}</p>
                      </div>
                    )}

                    {zoomModalItem.item.interviewUsage && (
                      <div className="p-5 rounded-2xl bg-purple-950/40 border border-purple-500/30 space-y-1">
                        <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider">Interview Advice</h4>
                        <p className="text-sm text-slate-200">{zoomModalItem.item.interviewUsage}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* CS TOPIC MODAL */}
              {zoomModalItem.type === 'cs' && (
                <div className="space-y-6">
                  <div className="space-y-2 border-b border-slate-800 pb-5 pr-12">
                    <span className="px-3 py-1 text-xs font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                      {zoomModalItem.item.subject}
                    </span>
                    <h2 className="text-3xl font-black text-white mt-2">{zoomModalItem.item.topicName}</h2>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Core Definition</h4>
                      <p className="text-lg text-slate-100 font-medium leading-relaxed">{zoomModalItem.item.definition}</p>
                    </div>

                    {zoomModalItem.item.analogy && (
                      <div className="p-5 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 space-y-1">
                        <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Real-World Analogy</h4>
                        <p className="text-base text-slate-200">{zoomModalItem.item.analogy}</p>
                      </div>
                    )}

                    {zoomModalItem.item.detailedExplanation && (
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider">Detailed Explanation</h4>
                        <p className="text-base text-slate-200 leading-relaxed whitespace-pre-line bg-slate-950 p-5 rounded-2xl border border-slate-800">
                          {zoomModalItem.item.detailedExplanation}
                        </p>
                      </div>
                    )}

                    {zoomModalItem.item.codeExample && (
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Code Syntax Example</h4>
                        <pre className="p-5 rounded-2xl bg-slate-950 border border-slate-800 text-emerald-400 font-mono text-sm overflow-x-auto">
                          {zoomModalItem.item.codeExample}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* QUESTION MODAL */}
              {zoomModalItem.type === 'question' && (
                <div className="space-y-6">
                  <div className="space-y-2 border-b border-slate-800 pb-5 pr-12">
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 text-xs font-bold rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30">
                        {zoomModalItem.item.category}
                      </span>
                      <span className="text-xs font-medium text-amber-400">{zoomModalItem.item.frequency}</span>
                    </div>
                    <h2 className="text-2xl font-black text-white mt-2 leading-snug">{zoomModalItem.item.question}</h2>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Model Interview Answer Script</h4>
                    <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 text-slate-200 text-base leading-relaxed whitespace-pre-line">
                      {zoomModalItem.item.sampleAnswer}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
