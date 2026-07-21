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
          handleSelectWord(res.data.data[0]);
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

  const handleSelectWord = (word) => {
    setSelectedWord(word);
    setUserSentence('');
    setEvaluationResult(null);

    // Restore from localStorage if present
    try {
      const savedSubs = JSON.parse(localStorage.getItem('pc_english_submissions') || '{}');
      if (savedSubs[word.word]) {
        setUserSentence(savedSubs[word.word].sentence || '');
        setEvaluationResult(savedSubs[word.word].evaluation || null);
      }
    } catch (e) {}
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

    try {
      const res = await axios.post('/api/english/review', {
        wordId: selectedWord.id,
        word: selectedWord.word,
        sentence: userSentence
      });

      if (res.data.success) {
        setEvaluationResult(res.data.data);
        
        // Save to browser localStorage for 100% persistence across reloads / serverless restarts
        try {
          const savedSubs = JSON.parse(localStorage.getItem('pc_english_submissions') || '{}');
          savedSubs[selectedWord.word] = {
            sentence: userSentence,
            evaluation: res.data.data,
            timestamp: new Date().toISOString()
          };
          localStorage.setItem('pc_english_submissions', JSON.stringify(savedSubs));
        } catch (e) {}
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
          <h3 className="text-xl font-bold text-white">AI Teacher Generating Today's Vocabulary...</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Selecting 10 brand-new, placement-focused corporate vocabulary words tailored for software engineering interviews.
          </p>
        </div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="min-h-[400px] flex items-center justify-center py-12">
        <GlassCard hover={false} className="max-w-md text-center p-8 border-rose-500/30 space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center text-2xl mx-auto">
            <FiAlertCircle />
          </div>
          <h2 className="text-xl font-bold text-slate-100">AI System Notice</h2>
          <p className="text-sm text-slate-300 leading-relaxed">{errorMsg}</p>
          <button
            onClick={fetchWords}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-sm hover:shadow-lg transition-all cursor-pointer"
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
            <FiBookOpen className="text-cyan-400" /> AI-Teacher Placement English Vocabulary
          </h1>
          <p className="text-slate-400 text-base mt-1">
            Master high-yield corporate vocabulary for software engineering interviews. Get real-time AI sentence evaluation on grammar, fluency, and confidence.
          </p>
        </div>
      </div>

      {/* Word Selection Pills */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-3 scrollbar-none">
        {words.map((w) => {
          const isSelected = selectedWord?.id === w.id;
          const hasSubmission = Boolean(
            tryGetSavedSubmission(w.word)
          );

          return (
            <button
              key={w.id}
              onClick={() => handleSelectWord(w)}
              className={`px-4 py-2.5 rounded-2xl text-sm font-bold whitespace-nowrap transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                isSelected
                  ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/25 scale-105'
                  : 'bg-slate-900/80 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700'
              }`}
            >
              <span>{w.word}</span>
              {hasSubmission && (
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" title="Sentence Submitted" />
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Word Deep-Dive Card */}
      {selectedWord && (
        <GlassCard hover={false} className="space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
            <div>
              <div className="flex items-center gap-3">
                <span className="px-3.5 py-1 text-xs font-bold rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                  {selectedWord.category || 'Corporate English'}
                </span>
                <span className="text-sm font-mono text-slate-400">{selectedWord.pronunciation}</span>
              </div>
              <h2 className="text-4xl font-extrabold text-white mt-2 flex items-center gap-3">
                {selectedWord.word}
                <button
                  onClick={() => speakWord(selectedWord.word)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 transition-all cursor-pointer"
                  title="Listen Pronunciation"
                >
                  <FiVolume2 className="text-xl" />
                </button>
              </h2>
            </div>
          </div>

          {/* Meaning & Usage */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
              <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Meaning</h3>
              <p className="text-slate-200 text-lg leading-relaxed font-semibold">{selectedWord.meaning}</p>
              {selectedWord.synonyms && (
                <p className="text-xs text-slate-400 pt-1">
                  Synonyms: <strong className="text-slate-300">{selectedWord.synonyms.join(', ')}</strong>
                </p>
              )}
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
              <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Placement Example Sentence</h3>
              <p className="text-slate-200 text-base leading-relaxed italic">"{selectedWord.example}"</p>
            </div>
          </div>

          {/* Corporate & Interview Usage */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 space-y-2">
              <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Corporate Context</h3>
              <p className="text-slate-300 text-sm leading-relaxed">{selectedWord.corporateUsage}</p>
            </div>

            <div className="p-5 rounded-2xl bg-purple-950/30 border border-purple-500/20 space-y-2">
              <h3 className="text-xs font-bold text-purple-400 uppercase tracking-wider">Interview Advice</h3>
              <p className="text-slate-300 text-sm leading-relaxed">{selectedWord.interviewUsage}</p>
            </div>
          </div>

          {/* Interactive Sentence Submission & AI Evaluation */}
          <div className="space-y-4 border-t border-slate-800 pt-6">
            <label className="block text-sm font-bold text-slate-200 uppercase tracking-wider">
              Practice Exercise: Write a sentence using "{selectedWord.word}" for a technical interview:
            </label>
            <textarea
              rows={4}
              value={userSentence}
              onChange={(e) => setUserSentence(e.target.value)}
              placeholder={`Example: In our final year project, we took a ${selectedWord.word.toLowerCase()} approach to optimize response times...`}
              className="w-full p-4 rounded-2xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 text-base focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
            />

            <div className="flex justify-end">
              <button
                onClick={handleReviewSentence}
                disabled={evaluating || !userSentence.trim()}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-cyan-500/20 flex items-center gap-2 transition-all cursor-pointer"
              >
                {evaluating ? (
                  <>
                    <FiRotateCw className="animate-spin text-lg" />
                    <span>AI Reviewing Sentence...</span>
                  </>
                ) : (
                  <>
                    <FiSend className="text-lg" />
                    <span>Submit for AI Grammar & Fluency Evaluation</span>
                  </>
                )}
              </button>
            </div>

            {/* AI Evaluation Card Output */}
            <AnimatePresence>
              {evaluationResult && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-6 rounded-3xl bg-gradient-to-b from-slate-900 to-cyan-950/40 border border-cyan-500/40 space-y-6 mt-6"
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                    <div className="flex items-center gap-2 text-cyan-300 font-bold text-base">
                      <FiAward className="text-2xl text-cyan-400" />
                      <span>AI Sentence Review Analysis</span>
                    </div>
                    <div className="flex items-baseline gap-1 bg-cyan-500/20 px-4 py-2 rounded-2xl border border-cyan-400/30">
                      <span className="text-3xl font-extrabold text-cyan-200">{evaluationResult.overallScore}</span>
                      <span className="text-xs text-slate-400 font-bold">/ 10</span>
                    </div>
                  </div>

                  {/* Criteria Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center text-xs">
                    <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                      <span className="text-[11px] text-slate-400 block">Grammar</span>
                      <span className="font-bold text-cyan-300 text-base">{evaluationResult.grammarScore}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                      <span className="text-[11px] text-slate-400 block">Vocabulary</span>
                      <span className="font-bold text-indigo-300 text-base">{evaluationResult.vocabScore}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                      <span className="text-[11px] text-slate-400 block">Structure</span>
                      <span className="font-bold text-purple-300 text-base">{evaluationResult.structureScore}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                      <span className="text-[11px] text-slate-400 block">Naturalness</span>
                      <span className="font-bold text-emerald-300 text-base">{evaluationResult.naturalnessScore}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                      <span className="text-[11px] text-slate-400 block">Confidence</span>
                      <span className="font-bold text-amber-300 text-base">{evaluationResult.confidenceScore}</span>
                    </div>
                  </div>

                  {/* Feedback Details */}
                  <div className="space-y-4 text-sm">
                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                      <span className="font-bold text-emerald-400 block mb-1">Feedback Explanation</span>
                      <p className="text-slate-200 leading-relaxed">{evaluationResult.explanation}</p>
                    </div>

                    {evaluationResult.correctedSentence && (
                      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                        <span className="font-bold text-cyan-400 block mb-1">Suggested Correction</span>
                        <p className="text-cyan-200 font-medium leading-relaxed">{evaluationResult.correctedSentence}</p>
                      </div>
                    )}

                    {evaluationResult.betterAlternative && (
                      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                        <span className="font-bold text-purple-400 block mb-1">Corporate Interview Upgrade</span>
                        <p className="text-purple-200 font-medium leading-relaxed">{evaluationResult.betterAlternative}</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </GlassCard>
      )}
    </div>
  );
}

function tryGetSavedSubmission(wordStr) {
  try {
    const saved = JSON.parse(localStorage.getItem('pc_english_submissions') || '{}');
    return saved[wordStr] || null;
  } catch (e) {
    return null;
  }
}
