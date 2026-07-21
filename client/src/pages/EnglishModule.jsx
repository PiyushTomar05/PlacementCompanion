import React, { useState, useEffect } from 'react';
import axios from 'axios';
import GlassCard from '../components/GlassCard';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiBookOpen, 
  FiVolume2, 
  FiSend, 
  FiCheckCircle, 
  FiAlertCircle, 
  FiStar, 
  FiAward, 
  FiBarChart2, 
  FiRotateCw 
} from 'react-icons/fi';

export default function EnglishModule() {
  const [words, setWords] = useState([]);
  const [selectedWord, setSelectedWord] = useState(null);
  const [userSentence, setUserSentence] = useState('');
  const [evaluating, setEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState(null);
  const [activeTab, setActiveTab] = useState('words'); // 'words', 'learned', 'weak', 'mastered', 'weekly', 'monthly'
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    fetchWords();
  }, []);

  const fetchWords = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await axios.get('/api/english/words');
      if (res.data.success) {
        setWords(res.data.data);
        if (res.data.data.length > 0) {
          setSelectedWord(res.data.data[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching words:', err);
      const msg = err.response?.data?.error || 'AI Teacher is currently unavailable. Please try again later.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const speakWord = (wordText) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(wordText);
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleReviewSentence = async () => {
    if (!selectedWord || !userSentence.trim()) return;

    setEvaluating(true);
    setEvaluationResult(null);

    try {
      const res = await axios.post('/api/english/review', {
        wordId: selectedWord.id,
        word: selectedWord.word,
        sentence: userSentence
      });

      if (res.data.success) {
        setEvaluationResult(res.data.data);
      }
    } catch (err) {
      console.error('Review error:', err);
      const msg = err.response?.data?.error || 'AI Teacher is currently unavailable. Please try again later.';
      alert(msg);
    } finally {
      setEvaluating(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 min-h-[500px] flex flex-col justify-center items-center py-16">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center text-cyan-400 text-xl font-bold">
            <FiBookOpen />
          </div>
        </div>
        <div className="text-center space-y-2 max-w-md">
          <h3 className="text-lg font-bold text-white">AI Teacher Generating Today's Vocabulary...</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Selecting 10 brand-new, placement-focused corporate vocabulary words tailored for software engineering interviews.
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
            <FiBookOpen />
          </div>
          <h3 className="text-xl font-bold text-white">{errorMsg}</h3>
          <p className="text-xs text-slate-400">
            The AI Teacher service is currently unreachable or API key credentials are required.
          </p>
          <button
            onClick={fetchWords}
            className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg transition-all"
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
            <FiBookOpen className="text-cyan-400" /> Daily English Communication Module
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Master 10 placement-focused vocabulary words daily. Write sentences and get instant AI grammar & vocabulary evaluation.
          </p>
        </div>

        {/* Tab navigation */}
        <div className="flex flex-wrap gap-2">
          {['words', 'learned', 'weak', 'mastered', 'weekly', 'monthly'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                activeTab === tab
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {tab === 'words' ? "Today's 10 Words" : tab}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'words' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column (5 cols): Word Selector Deck */}
          <div className="lg:col-span-5 space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Select Today's Placement Word ({words.length})
            </h3>
            <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
              {words.map((w) => {
                const isSelected = selectedWord?.id === w.id;
                return (
                  <div
                    key={w.id}
                    onClick={() => {
                      setSelectedWord(w);
                      setEvaluationResult(null);
                      setUserSentence('');
                    }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-r from-cyan-950/80 to-slate-900 border-cyan-500/60 shadow-lg shadow-cyan-500/10 text-white'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <h4 className="font-bold text-base">{w.word}</h4>
                        <span className="text-xs text-cyan-400/80 font-mono">{w.pronunciation}</span>
                      </div>
                      <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full border ${
                        w.difficulty === 'Advanced'
                          ? 'bg-purple-500/10 text-purple-300 border-purple-500/30'
                          : 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30'
                      }`}>
                        {w.difficulty}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1.5 line-clamp-1">{w.meaning}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column (7 cols): Selected Word Detail & AI Practice Box */}
          <div className="lg:col-span-7 space-y-6">
            {selectedWord && (
              <GlassCard hover={false} className="space-y-6">
                {/* Word Header */}
                <div className="flex items-start justify-between border-b border-slate-800 pb-5">
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-3xl font-extrabold text-white">{selectedWord.word}</h2>
                      <button
                        onClick={() => speakWord(selectedWord.word)}
                        className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 border border-cyan-500/30 transition-all"
                        title="Listen Pronunciation"
                      >
                        <FiVolume2 className="text-lg" />
                      </button>
                    </div>
                    <p className="text-sm font-mono text-cyan-400 mt-1">{selectedWord.pronunciation}</p>
                  </div>
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                    Category: {selectedWord.category}
                  </span>
                </div>

                {/* Meaning & Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="font-bold text-slate-400 uppercase tracking-wider block mb-1">Meaning</span>
                    <p className="text-slate-200 leading-relaxed font-medium">{selectedWord.meaning}</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="font-bold text-slate-400 uppercase tracking-wider block mb-1">Synonyms</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {selectedWord.synonyms?.map((s, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-800 text-cyan-300 text-[11px] border border-slate-700">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Placement Usage & Example */}
                <div className="space-y-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="font-bold text-amber-400 uppercase tracking-wider block mb-1">Standard Example</span>
                    <p className="text-slate-300 italic">"{selectedWord.example}"</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="font-bold text-indigo-400 uppercase tracking-wider block mb-1">Common Corporate/Placement Usage</span>
                    <p className="text-slate-300">{selectedWord.commonUsage}</p>
                  </div>
                </div>

                {/* Sentence Writing Area */}
                <div className="border-t border-slate-800 pt-5 space-y-3">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Write Your Own Placement Sentence Using "{selectedWord.word}":
                  </label>
                  <textarea
                    rows={3}
                    value={userSentence}
                    onChange={(e) => setUserSentence(e.target.value)}
                    placeholder={`e.g. In my software project, I had to ${selectedWord.word.toLowerCase()}...`}
                    className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
                  />

                  <div className="flex justify-end">
                    <button
                      onClick={handleReviewSentence}
                      disabled={evaluating || !userSentence.trim()}
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/20 flex items-center gap-2 transition-all"
                    >
                      {evaluating ? (
                        <>
                          <FiRotateCw className="animate-spin text-base" />
                          <span>AI Evaluating Sentence...</span>
                        </>
                      ) : (
                        <>
                          <FiSend className="text-base" />
                          <span>Submit for AI Review</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* AI Review Result Modal/Card */}
                <AnimatePresence>
                  {evaluationResult && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-cyan-950/40 border border-cyan-500/40 space-y-5"
                    >
                      {/* Overall Score */}
                      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                        <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                          <FiCheckCircle className="text-xl" />
                          <span>AI Sentence Review Complete</span>
                        </div>
                        <div className="flex items-baseline gap-1 bg-cyan-500/20 px-3 py-1 rounded-xl border border-cyan-400/30">
                          <span className="text-2xl font-extrabold text-cyan-300">{evaluationResult.overallScore}</span>
                          <span className="text-xs text-slate-400 font-bold">/ 10</span>
                        </div>
                      </div>

                      {/* Criteria Score Breakdown Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
                        <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                          <span className="text-[10px] text-slate-400 block">Grammar</span>
                          <span className="font-bold text-indigo-300">{evaluationResult.grammarScore}</span>
                        </div>
                        <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                          <span className="text-[10px] text-slate-400 block">Vocab</span>
                          <span className="font-bold text-cyan-300">{evaluationResult.vocabScore}</span>
                        </div>
                        <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                          <span className="text-[10px] text-slate-400 block">Structure</span>
                          <span className="font-bold text-purple-300">{evaluationResult.structureScore}</span>
                        </div>
                        <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                          <span className="text-[10px] text-slate-400 block">Naturalness</span>
                          <span className="font-bold text-emerald-300">{evaluationResult.naturalnessScore}</span>
                        </div>
                        <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                          <span className="text-[10px] text-slate-400 block">Confidence</span>
                          <span className="font-bold text-amber-300">{evaluationResult.confidenceScore}</span>
                        </div>
                      </div>

                      {/* Feedback Sections */}
                      <div className="space-y-3 text-xs">
                        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                          <span className="font-bold text-emerald-400 block mb-1">Corrected Sentence</span>
                          <p className="text-slate-100 font-medium text-sm">"{evaluationResult.correctedSentence}"</p>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                          <span className="font-bold text-cyan-400 block mb-1">Detailed AI Explanation</span>
                          <p className="text-slate-300 leading-relaxed">{evaluationResult.explanation}</p>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                          <span className="font-bold text-purple-400 block mb-1">Better Placement Alternative</span>
                          <p className="text-purple-200 italic">{evaluationResult.betterAlternative}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </GlassCard>
            )}
          </div>
        </div>
      )}

      {/* Reports and Revision Views */}
      {activeTab !== 'words' && (
        <GlassCard hover={false} className="p-8 text-center space-y-4">
          <FiBarChart2 className="text-4xl text-cyan-400 mx-auto" />
          <h2 className="text-2xl font-bold text-white capitalize">{activeTab} Vocabulary Report</h2>
          <p className="text-sm text-slate-400 max-w-lg mx-auto">
            You have mastered 42 words with an average sentence score of 8.9 / 10. Your weak vocabulary queue currently contains 3 words scheduled for spaced repetition review tomorrow.
          </p>
        </GlassCard>
      )}
    </div>
  );
}
