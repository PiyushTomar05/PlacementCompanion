import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  FiGrid, 
  FiCheckSquare, 
  FiBookOpen, 
  FiCpu, 
  FiRepeat, 
  FiMessageSquare, 
  FiTrendingUp, 
  FiSearch,
  FiAward
} from 'react-icons/fi';

const navItems = [
  { path: '/', label: 'Dashboard', icon: FiGrid },
  { path: '/routine', label: 'Daily Routine', icon: FiCheckSquare, badge: 'Daily' },
  { path: '/english', label: 'English Module', icon: FiBookOpen },
  { path: '/cs', label: 'Core CS Module', icon: FiCpu },
  { path: '/revision', label: 'Spaced Repetition', icon: FiRepeat },
  { path: '/interview', label: 'Interview Prep', icon: FiMessageSquare },
  { path: '/analytics', label: 'Analytics', icon: FiTrendingUp },
  { path: '/search', label: 'Global Search', icon: FiSearch },
];

export default function Sidebar() {
  return (
    <aside className="fixed top-0 left-0 h-screen w-72 glass-panel border-r border-slate-800/90 dark:border-slate-800/90 light:border-slate-300 flex flex-col justify-between z-40 overflow-y-auto shadow-2xl bg-slate-950/95 dark:bg-slate-950/95 light:bg-white text-slate-100 dark:text-slate-100 light:text-slate-900">
      <div>
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-indigo-500/30">
            <FiAward />
          </div>
          <div>
            <h1 className="font-extrabold text-xl text-slate-100 dark:text-slate-100 light:text-slate-900 leading-tight">
              Placement
            </h1>
            <span className="text-sm font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 dark:from-indigo-400 dark:to-purple-400 light:from-indigo-600 light:to-purple-600">
              Companion AI
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center justify-between px-4 py-3.5 rounded-2xl text-base font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30 border border-indigo-400/40 translate-x-1'
                      : 'text-slate-300 dark:text-slate-300 light:text-slate-700 hover:text-white dark:hover:text-white light:hover:text-indigo-600 hover:bg-slate-800/70 dark:hover:bg-slate-800/70 light:hover:bg-slate-100'
                  }`
                }
              >
                <div className="flex items-center gap-3.5">
                  <Icon className="text-2xl" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-2.5 py-1 text-xs font-extrabold rounded-full bg-indigo-500/25 text-indigo-300 dark:text-indigo-300 light:text-indigo-700 border border-indigo-500/40">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* System Status Card */}
      <div className="p-4 m-4 rounded-2xl bg-gradient-to-b from-slate-900 to-indigo-950/60 dark:from-slate-900 dark:to-indigo-950/60 light:from-slate-100 light:to-indigo-50 border border-slate-800/90 dark:border-slate-800/90 light:border-slate-300 text-sm">
        <div className="flex items-center gap-2.5 text-emerald-400 dark:text-emerald-400 light:text-emerald-600 font-bold mb-1.5 text-base">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span>Placement Ready AI</span>
        </div>
        <p className="text-slate-300 dark:text-slate-300 light:text-slate-700 leading-relaxed text-xs">
          10 English Words & 10 CS Roadmap topics generated for today.
        </p>
      </div>
    </aside>
  );
}
