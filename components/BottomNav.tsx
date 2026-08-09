'use client';

import React from 'react';
import { Home, BookOpen, GraduationCap, HelpCircle } from 'lucide-react';

interface BottomNavProps {
  activeTab: 'home' | 'library' | 'courses' | 'help';
  onSelectTab: (tab: 'home' | 'library' | 'courses' | 'help') => void;
  unlockedCount?: number;
}

export function BottomNav({
  activeTab,
  onSelectTab,
  unlockedCount = 0
}: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/98 backdrop-blur-md border-t-2 border-slate-200 shadow-xl px-2 py-1.5 transition-all">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {/* Home */}
        <button
          onClick={() => onSelectTab('home')}
          className={`flex-1 py-1 flex flex-col items-center justify-center gap-0.5 rounded-xl transition active-press ${
            activeTab === 'home'
              ? 'text-[#1976D2] font-black'
              : 'text-slate-700 hover:text-slate-950 font-extrabold'
          }`}
        >
          <div className={`p-1.5 rounded-xl ${activeTab === 'home' ? 'bg-[#1976D2] text-white' : 'bg-slate-100 text-slate-800'}`}>
            <Home className="w-5 h-5 stroke-[2.2]" />
          </div>
          <span className="text-[11px] tracking-tight">Home</span>
        </button>

        {/* Purchased Page */}
        <button
          onClick={() => onSelectTab('library')}
          className={`flex-1 py-1 flex flex-col items-center justify-center gap-0.5 rounded-xl transition active-press relative ${
            activeTab === 'library'
              ? 'text-[#1976D2] font-black'
              : 'text-slate-700 hover:text-slate-950 font-extrabold'
          }`}
        >
          <div className={`p-1.5 rounded-xl ${activeTab === 'library' ? 'bg-[#1976D2] text-white' : 'bg-slate-100 text-slate-800'}`}>
            <BookOpen className="w-5 h-5 stroke-[2.2]" />
          </div>
          <span className="text-[11px] tracking-tight">Purchased</span>
          {unlockedCount > 0 && (
            <span className="absolute top-0.5 right-3 px-1.5 min-w-4 h-4 bg-emerald-600 text-white text-[9px] font-black rounded-full flex items-center justify-center border border-white shadow-xs">
              {unlockedCount}
            </span>
          )}
        </button>

        {/* Courses */}
        <button
          onClick={() => onSelectTab('courses')}
          className={`flex-1 py-1 flex flex-col items-center justify-center gap-0.5 rounded-xl transition active-press ${
            activeTab === 'courses'
              ? 'text-[#1976D2] font-black'
              : 'text-slate-700 hover:text-slate-950 font-extrabold'
          }`}
        >
          <div className={`p-1.5 rounded-xl ${activeTab === 'courses' ? 'bg-[#1976D2] text-white' : 'bg-slate-100 text-slate-800'}`}>
            <GraduationCap className="w-5 h-5 stroke-[2.2]" />
          </div>
          <span className="text-[11px] tracking-tight">Courses</span>
        </button>

        {/* Help */}
        <button
          onClick={() => onSelectTab('help')}
          className={`flex-1 py-1 flex flex-col items-center justify-center gap-0.5 rounded-xl transition active-press ${
            activeTab === 'help'
              ? 'text-[#1976D2] font-black'
              : 'text-slate-700 hover:text-slate-950 font-extrabold'
          }`}
        >
          <div className={`p-1.5 rounded-xl ${activeTab === 'help' ? 'bg-[#1976D2] text-white' : 'bg-slate-100 text-slate-800'}`}>
            <HelpCircle className="w-5 h-5 stroke-[2.2]" />
          </div>
          <span className="text-[11px] tracking-tight">Help</span>
        </button>
      </div>
    </nav>
  );
}

