import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

import Dashboard from './pages/Dashboard';
import DailyRoutine from './pages/DailyRoutine';
import EnglishModule from './pages/EnglishModule';
import CsModule from './pages/CsModule';
import RevisionModule from './pages/RevisionModule';
import InterviewPrep from './pages/InterviewPrep';
import Analytics from './pages/Analytics';
import SearchPage from './pages/SearchPage';

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <div className="flex min-h-screen bg-slate-950 text-slate-100 transition-colors duration-200">
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0 pl-72">
            <Navbar />
            <main className="flex-1 p-8 md:p-10 overflow-y-auto">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/routine" element={<DailyRoutine />} />
                <Route path="/english" element={<EnglishModule />} />
                <Route path="/cs" element={<CsModule />} />
                <Route path="/revision" element={<RevisionModule />} />
                <Route path="/interview" element={<InterviewPrep />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/search" element={<SearchPage />} />
              </Routes>
            </main>
          </div>
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}
