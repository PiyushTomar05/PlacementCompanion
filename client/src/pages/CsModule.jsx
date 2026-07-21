import React, { useState, useEffect } from 'react';
import axios from 'axios';
import GlassCard from '../components/GlassCard';
import { motion } from 'framer-motion';
import { 
  FiCpu, 
  FiCheckCircle, 
  FiBookmark, 
  FiEdit3, 
  FiHelpCircle, 
  FiClock, 
  FiZap, 
  FiCode, 
  FiLayers, 
  FiFileText,
  FiBookOpen
} from 'react-icons/fi';

export default function CsModule() {
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('');
  const [userNote, setUserNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [quizSelectedOption, setQuizSelectedOption] = useState(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await axios.get('/api/cs/topics');
      if (res.data.success) {
        setTopics(res.data.data);
        if (res.data.data.length > 0) {
          setSelectedTopic(res.data.data[0]);
          setSelectedSubjectFilter(res.data.data[0].subject);
          setUserNote(res.data.data[0].note || '');
        }
      }
    } catch (err) {
      console.error('Error fetching CS topics:', err);
      const msg = err.response?.data?.error || 'AI Teacher is currently unavailable. Please try again later.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSubjectSelect = (sub) => {
    setSelectedSubjectFilter(sub);
    const found = topics.find(t => t.subject === sub);
    if (found) {
      setSelectedTopic(found);
      setUserNote(found.note || '');
      setQuizSelectedOption(null);
      setQuizSubmitted(false);
    }
  };

  const handleToggleComplete = async () => {
    if (!selectedTopic) return;
    try {
      const res = await axios.post(`/api/cs/topic/${selectedTopic.id}/toggle`);
      if (res.data.success) {
        setTopics(prev => prev.map(t => t.id === selectedTopic.id ? { ...t, completed: !t.completed } : t));
        setSelectedTopic(prev => ({ ...prev, completed: !prev.completed }));
      }
    } catch (err) {
      console.error('Toggle error:', err);
    }
  };

  const handleSaveNote = async () => {
    if (!selectedTopic) return;
    setSavingNote(true);
    try {
      await axios.post('/api/cs/note', {
        topicId: selectedTopic.id,
        noteText: userNote
      });
    } catch (err) {
      console.error('Note save error:', err);
    } finally {
      setSavingNote(false);
    }
  };

  const handleToggleBookmark = async () => {
    if (!selectedTopic) return;
    try {
      await axios.post('/api/cs/bookmark', {
        itemId: selectedTopic.id,
        title: `${selectedTopic.subject}: ${selectedTopic.topicName}`
      });
      setSelectedTopic(prev => ({ ...prev, bookmarked: !prev.bookmarked }));
      setTopics(prev => prev.map(t => t.id === selectedTopic.id ? { ...t, bookmarked: !t.bookmarked } : t));
    } catch (err) {
      console.error('Bookmark error:', err);
    }
  };

  const subjectsList = Array.from(new Set(topics.map(t => t.subject)));

  if (loading) {
    return (
      <div className="space-y-6 min-h-[500px] flex flex-col justify-center items-center py-16">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center text-emerald-400 text-xl font-bold">
            <FiZap />
          </div>
        </div>
        <div className="text-center space-y-2 max-w-md">
          <h3 className="text-xl font-bold text-white">AI Teacher Generating Today's Lessons...</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Evaluating candidate learning history against the Placement Companion Master Roadmap across all 10 core CS subjects.
          </p>
        </div>
        
        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 opacity-60">
          <div className="h-28 rounded-2xl bg-slate-900 animate-pulse border border-slate-800" />
          <div className="h-28 rounded-2xl bg-slate-900 animate-pulse border border-slate-800" />
          <div className="h-28 rounded-2xl bg-slate-900 animate-pulse border border-slate-800" />
        </div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="min-h-[400px] flex items-center justify-center py-12">
        <GlassCard hover={false} className="max-w-md text-center p-8 border-rose-500/30 space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center text-2xl mx-auto">
            <FiZap />
          </div>
          <h2 className="text-xl font-bold text-slate-100">AI System Notice</h2>
          <p className="text-sm text-slate-300 leading-relaxed">{errorMsg}</p>
          <button
            onClick={fetchTopics}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-sm hover:shadow-lg transition-all"
          >
            Retry Connection
          </button>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <FiCpu className="text-emerald-400" /> AI-Teacher Core CS Module
          </h1>
          <p className="text-slate-400 text-base mt-1">
            Dynamic sequential lessons generated daily from the Master Roadmap for all 10 core computer science subjects.
          </p>
        </div>
      </div>

      {/* Subject Filter Pills */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-3 scrollbar-none">
        {subjectsList.map((sub) => {
          const isSelected = selectedSubjectFilter === sub;
          const subjectTopic = topics.find(t => t.subject === sub);
          const isCompleted = subjectTopic?.completed;

          return (
            <button
              key={sub}
              onClick={() => handleSubjectSelect(sub)}
              className={`px-4 py-2.5 rounded-2xl text-sm font-bold whitespace-nowrap transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                isSelected
                  ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/25 scale-105'
                  : 'bg-slate-900/80 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700'
              }`}
            >
              <span>{sub}</span>
              {isCompleted && (
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              )}
            </button>
          );
        })}
      </div>

      {/* Main Full-Width Content Layout */}
      {selectedTopic && (
        <GlassCard hover={false} className="space-y-8">
          {/* Topic Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
            <div>
              <span className="px-3.5 py-1 text-xs font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                {selectedTopic.subject}
              </span>
              <h2 className="text-3xl font-extrabold text-white mt-3">{selectedTopic.topicName}</h2>
              <div className="flex items-center gap-4 mt-2 text-sm text-slate-400">
                <span className="flex items-center gap-1.5"><FiClock className="text-emerald-400" /> Reading Time: {selectedTopic.readingTime}</span>
                <span>• Difficulty: <strong className="text-slate-200">{selectedTopic.difficulty}</strong></span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleToggleBookmark}
                className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                  selectedTopic.bookmarked
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
                title="Bookmark Topic"
              >
                <FiBookmark className="text-xl" />
              </button>

              <button
                onClick={handleToggleComplete}
                className={`px-5 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 border transition-all cursor-pointer ${
                  selectedTopic.completed
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                    : 'bg-emerald-500 text-slate-950 border-emerald-400 hover:bg-emerald-400 shadow-lg shadow-emerald-500/20'
                }`}
              >
                <FiCheckCircle className="text-lg" />
                <span>{selectedTopic.completed ? 'Marked Completed' : 'Mark Topic Completed'}</span>
              </button>
            </div>
          </div>

          {/* Quick Summary & Analogy */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
              <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                <FiZap /> 1-Sentence Placement Definition
              </h3>
              <p className="text-slate-200 text-base leading-relaxed font-medium">
                {selectedTopic.definition}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 space-y-2">
              <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
                <FiLayers /> Real-World Intuitive Analogy
              </h3>
              <p className="text-slate-200 text-base leading-relaxed font-medium">
                {selectedTopic.analogy}
              </p>
            </div>
          </div>

          {/* Detailed Concept Explanation */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <FiBookOpen className="text-emerald-400" /> Comprehensive Conceptual Deep-Dive
            </h3>
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-slate-200 text-base leading-relaxed space-y-4 whitespace-pre-line">
              {selectedTopic.detailedExplanation}
            </div>
          </div>

          {/* ASCII / Text Visualization Diagram */}
          {selectedTopic.visualization && (
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FiLayers className="text-purple-400" /> Visual Concept Diagram
              </h3>
              <pre className="p-5 rounded-2xl bg-slate-950 border border-purple-500/20 text-purple-300 font-mono text-sm leading-relaxed overflow-x-auto">
                {selectedTopic.visualization}
              </pre>
            </div>
          )}

          {/* Code Example */}
          {selectedTopic.codeExample && (
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FiCode className="text-indigo-400" /> Code Implementation & Syntax
              </h3>
              <pre className="p-5 rounded-2xl bg-slate-950 border border-slate-800 text-emerald-400 font-mono text-sm leading-relaxed overflow-x-auto">
                {selectedTopic.codeExample}
              </pre>
            </div>
          )}

          {/* High-Yield Interview Tips & Common Traps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
              <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                💡 High-Yield Interview Tips
              </h3>
              <p className="text-slate-200 text-sm leading-relaxed">
                {selectedTopic.interviewTips}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-rose-950/20 border border-rose-500/30 space-y-2">
              <h3 className="text-xs font-bold text-rose-400 uppercase tracking-wider">
                ⚠️ Top Traps & Candidate Mistakes
              </h3>
              <p className="text-slate-200 text-sm leading-relaxed">
                {selectedTopic.commonMistakes}
              </p>
            </div>
          </div>

          {/* One-Minute Notes */}
          {selectedTopic.oneMinuteNotes && (
            <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2">
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <FiFileText /> 1-Minute Revision Memory Notes
              </h3>
              <p className="text-slate-200 text-sm leading-relaxed font-medium">
                {selectedTopic.oneMinuteNotes}
              </p>
            </div>
          )}

          {/* Interactive Concept Quiz */}
          {selectedTopic.quiz && (
            <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-950/40 to-slate-900 border border-indigo-500/30 space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FiHelpCircle className="text-indigo-400" /> Placement Interview Quick Quiz
              </h3>
              <p className="text-slate-200 text-base font-semibold">
                {selectedTopic.quiz.question}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selectedTopic.quiz.options?.map((opt, idx) => {
                  const isSelected = quizSelectedOption === idx;
                  const isCorrect = idx === selectedTopic.quiz.correctIndex;

                  let optionStyle = 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700';
                  if (quizSubmitted) {
                    if (isCorrect) optionStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold';
                    else if (isSelected) optionStyle = 'bg-rose-500/20 border-rose-500 text-rose-300';
                  } else if (isSelected) {
                    optionStyle = 'bg-indigo-600 text-white border-indigo-400 shadow-md';
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => !quizSubmitted && setQuizSelectedOption(idx)}
                      className={`p-3.5 rounded-xl border text-sm text-left transition-all cursor-pointer ${optionStyle}`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              {!quizSubmitted && quizSelectedOption !== null && (
                <button
                  onClick={() => setQuizSubmitted(true)}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-500 transition-all cursor-pointer"
                >
                  Submit Answer
                </button>
              )}

              {quizSubmitted && (
                <div className="p-4 rounded-xl bg-slate-900 border border-indigo-500/30 text-sm text-slate-300 space-y-1">
                  <p className="font-bold text-emerald-400">
                    {quizSelectedOption === selectedTopic.quiz.correctIndex ? '✅ Correct Answer!' : '❌ Incorrect'}
                  </p>
                  <p>{selectedTopic.quiz.explanation}</p>
                </div>
              )}
            </div>
          )}

          {/* Candidate Personal Notes Section */}
          <div className="space-y-3 border-t border-slate-800 pt-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <FiEdit3 className="text-purple-400" /> Candidate Personal Notes & Key Takeaways
            </h3>
            <textarea
              rows={4}
              value={userNote}
              onChange={(e) => setUserNote(e.target.value)}
              placeholder="Write your custom notes, key formulas, or revision takeaways for this topic..."
              className="w-full p-4 rounded-2xl bg-slate-900 border border-slate-800 text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
            />
            <div className="flex justify-end">
              <button
                onClick={handleSaveNote}
                disabled={savingNote}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold text-sm hover:shadow-lg transition-all cursor-pointer"
              >
                {savingNote ? 'Saving...' : 'Save Personal Note'}
              </button>
            </div>
          </div>
        </GlassCard>
      )}
    </div>
  );
}
