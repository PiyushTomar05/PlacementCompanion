import React, { useState, useEffect } from 'react';
import axios from 'axios';
import GlassCard from '../components/GlassCard';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiMessageSquare, 
  FiSend, 
  FiCheckCircle, 
  FiAward, 
  FiHelpCircle, 
  FiRotateCw, 
  FiZap, 
  FiTrendingUp 
} from 'react-icons/fi';

export default function InterviewPrep() {
  const [questions, setQuestions] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [evaluating, setEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const res = await axios.get('/api/interview/questions');
      if (res.data.success) {
        setQuestions(res.data.data);
        if (res.data.data.length > 0) {
          setSelectedQuestion(res.data.data[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching interview questions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEvaluateAnswer = async () => {
    if (!selectedQuestion || !userAnswer.trim()) return;

    setEvaluating(true);
    setEvaluationResult(null);

    try {
      const res = await axios.post('/api/interview/evaluate', {
        questionId: selectedQuestion.id,
        question: selectedQuestion.question,
        category: selectedQuestion.category,
        answer: userAnswer
      });

      if (res.data.success) {
        setEvaluationResult(res.data.data);
      }
    } catch (err) {
      console.error('Interview evaluation error:', err);
    } finally {
      setEvaluating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <FiMessageSquare className="text-purple-400" /> Interview Preparation & AI Review
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Simulate software engineering interviews across Technical, HR, and Behavioral questions. Receive instant AI feedback on technical depth and communication.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left List: Questions Deck (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Select Mock Question ({questions.length})
          </h3>
          <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
            {questions.map((q) => {
              const isSelected = selectedQuestion?.id === q.id;
              return (
                <div
                  key={q.id}
                  onClick={() => {
                    setSelectedQuestion(q);
                    setUserAnswer('');
                    setEvaluationResult(null);
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-purple-950/80 to-slate-900 border-purple-500/60 shadow-lg shadow-purple-500/10 text-white'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase ${
                      q.category === 'Technical' 
                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                        : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    }`}>
                      {q.category}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{q.subject}</span>
                  </div>
                  <h4 className="font-semibold text-sm line-clamp-2 text-slate-100">{q.question}</h4>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Pane: Question & AI Evaluation (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {selectedQuestion && (
            <GlassCard hover={false} className="space-y-6">
              {/* Question Banner */}
              <div className="space-y-3 border-b border-slate-800 pb-5">
                <div className="flex items-center gap-2 text-xs font-bold text-purple-400 uppercase tracking-wider">
                  <FiHelpCircle /> {selectedQuestion.category} Question • {selectedQuestion.subject}
                </div>
                <h2 className="text-2xl font-bold text-white leading-snug">{selectedQuestion.question}</h2>
              </div>

              {/* Text area for candidate answer */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Type Your Verbal Answer Script:
                </label>
                <textarea
                  rows={6}
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Type your candidate response here... Focus on technical accuracy, STAR method, and confidence."
                  className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                />

                <div className="flex justify-end">
                  <button
                    onClick={handleEvaluateAnswer}
                    disabled={evaluating || !userAnswer.trim()}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-purple-500/20 flex items-center gap-2 transition-all"
                  >
                    {evaluating ? (
                      <>
                        <FiRotateCw className="animate-spin text-base" />
                        <span>AI Evaluating Answer...</span>
                      </>
                    ) : (
                      <>
                        <FiSend className="text-base" />
                        <span>Submit for AI Interview Evaluation</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* AI Evaluation Card */}
              <AnimatePresence>
                {evaluationResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-purple-950/40 border border-purple-500/40 space-y-5"
                  >
                    <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                      <div className="flex items-center gap-2 text-purple-300 font-bold text-sm">
                        <FiAward className="text-xl text-purple-400" />
                        <span>AI Interview Evaluation Score</span>
                      </div>
                      <div className="flex items-baseline gap-1 bg-purple-500/20 px-4 py-1.5 rounded-xl border border-purple-400/30">
                        <span className="text-3xl font-extrabold text-purple-200">{evaluationResult.overallScore}</span>
                        <span className="text-xs text-slate-400 font-bold">/ 10</span>
                      </div>
                    </div>

                    {/* Criteria Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
                      <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">Correctness</span>
                        <span className="font-bold text-indigo-300">{evaluationResult.correctnessScore}</span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">Confidence</span>
                        <span className="font-bold text-amber-300">{evaluationResult.confidenceScore}</span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">Grammar</span>
                        <span className="font-bold text-cyan-300">{evaluationResult.grammarScore}</span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">Comm.</span>
                        <span className="font-bold text-emerald-300">{evaluationResult.communicationScore}</span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">Tech Depth</span>
                        <span className="font-bold text-purple-300">{evaluationResult.technicalDepthScore}</span>
                      </div>
                    </div>

                    {/* Feedback & Suggestions */}
                    <div className="space-y-3 text-xs">
                      <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                        <span className="font-bold text-emerald-400 block mb-1">AI Review Feedback</span>
                        <p className="text-slate-200 leading-relaxed">{evaluationResult.feedback}</p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                        <span className="font-bold text-purple-400 block mb-1">Enhanced Candidate Answer Script</span>
                        <p className="text-purple-200 whitespace-pre-line leading-relaxed">{evaluationResult.improvedAnswer}</p>
                      </div>

                      {/* Follow up Question */}
                      {evaluationResult.followUpQuestion && (
                        <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30 text-amber-200">
                          <span className="font-bold text-amber-400 block mb-1 flex items-center gap-1.5">
                            <FiZap /> AI Follow-Up Challenge Question
                          </span>
                          <p className="font-semibold">{evaluationResult.followUpQuestion}</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
}
