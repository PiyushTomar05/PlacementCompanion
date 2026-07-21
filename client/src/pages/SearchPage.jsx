import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import GlassCard from '../components/GlassCard';
import { FiSearch, FiBookOpen, FiCpu, FiMessageSquare, FiFileText } from 'react-icons/fi';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState({ words: [], topics: [], questions: [], notes: [] });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const q = searchParams.get('q') || '';
    setQuery(q);
    if (q) performSearch(q);
  }, [searchParams]);

  const performSearch = async (searchQuery) => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      if (res.data.success) {
        setResults(res.data.data);
      }
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchParams({ q: query.trim() });
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Search Header */}
      <div className="border-b border-slate-800 pb-6">
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <FiSearch className="text-indigo-400" /> Global Search
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Search across 10 daily words, core CS concepts, mock interview questions, personal notes, and bookmarks.
        </p>

        <form onSubmit={handleSearchSubmit} className="mt-6 max-w-2xl flex gap-3">
          <div className="relative flex-1">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for closures, primary key, articulate, OSI model..."
              className="w-full pl-12 pr-4 py-3.5 bg-slate-900 border border-slate-800 rounded-2xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm transition-all"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-md"
          >
            Search
          </button>
        </form>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-8 max-w-4xl">
          {/* Matched Words */}
          {results.words?.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                <FiBookOpen /> English Vocabulary Results ({results.words.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {results.words.map((w) => (
                  <GlassCard key={w.id} onClick={() => navigate('/english')} className="p-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-white text-base">{w.word}</h4>
                      <span className="text-xs text-cyan-400 font-mono">{w.pronunciation}</span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1 line-clamp-2">{w.meaning}</p>
                  </GlassCard>
                ))}
              </div>
            </div>
          )}

          {/* Matched Topics */}
          {results.topics?.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                <FiCpu /> Core CS Concept Results ({results.topics.length})
              </h3>
              <div className="space-y-3">
                {results.topics.map((t) => (
                  <GlassCard key={t.id} onClick={() => navigate('/cs')} className="p-4">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">{t.subject}</span>
                    <h4 className="font-bold text-white text-base">{t.topicName}</h4>
                    <p className="text-xs text-slate-300 mt-1 line-clamp-2">{t.definition}</p>
                  </GlassCard>
                ))}
              </div>
            </div>
          )}

          {/* Matched Questions */}
          {results.questions?.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-2">
                <FiMessageSquare /> Interview Preparation Results ({results.questions.length})
              </h3>
              <div className="space-y-3">
                {results.questions.map((q) => (
                  <GlassCard key={q.id} onClick={() => navigate('/interview')} className="p-4">
                    <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">{q.category}</span>
                    <h4 className="font-bold text-white text-base">{q.question}</h4>
                  </GlassCard>
                ))}
              </div>
            </div>
          )}

          {results.words.length === 0 && results.topics.length === 0 && results.questions.length === 0 && query && (
            <div className="p-8 text-center text-slate-400 text-sm">
              No matching records found for "{query}". Try searching for keywords like "closure", "primary key", or "articulate".
            </div>
          )}
        </div>
      )}
    </div>
  );
}
