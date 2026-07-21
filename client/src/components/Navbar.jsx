import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { FiSun, FiMoon, FiSearch, FiCheckCircle } from 'react-icons/fi';
import { FaFire } from 'react-icons/fa';

export default function Navbar({ streak = 1, completionPercentage = 0 }) {
  const { isDarkMode, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-slate-800/80 px-6 py-3.5 transition-colors duration-200 shadow-md">
      <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
        {/* Left Title / Search */}
        <div className="flex items-center gap-6 flex-1">
          <form onSubmit={handleSearchSubmit} className="relative w-full max-w-lg">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
            <input
              type="text"
              placeholder="Search words, CS concepts, notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-2.5 bg-slate-900/80 dark:bg-slate-900/90 border border-slate-700/70 dark:border-slate-800 text-base text-slate-200 placeholder-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/60 transition-all"
            />
          </form>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-4">
          {/* Streak Indicator */}
          <div 
            title="Daily Learning Streak"
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/15 to-orange-500/15 border border-amber-500/30 text-amber-400 font-semibold text-base cursor-pointer hover:scale-105 transition-transform"
          >
            <FaFire className="text-orange-500 animate-pulse text-lg" />
            <span>{streak} Days Streak</span>
          </div>

          {/* Daily Completion Indicator */}
          <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 font-medium text-sm">
            <FiCheckCircle className="text-emerald-400 text-base" />
            <span>Daily Progress: {completionPercentage}%</span>
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            className="p-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 border border-slate-700/60 transition-all hover:rotate-12 cursor-pointer"
          >
            {isDarkMode ? <FiSun className="text-amber-400 text-xl" /> : <FiMoon className="text-indigo-400 text-xl" />}
          </button>

          {/* Personal User Avatar Badge */}
          <div className="flex items-center gap-3 pl-3 border-l border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center font-bold text-white shadow-md text-base">
              PC
            </div>
            <div className="hidden lg:block text-left text-sm">
              <p className="font-semibold text-slate-200">Placement Prep</p>
              <p className="text-slate-400 font-mono text-xs">AI Student Candidate</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
