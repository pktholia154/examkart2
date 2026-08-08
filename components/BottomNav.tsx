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
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-lg px-2 py-1.5 transition-all">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {/* Home */}
        <button
          onClick={() => onSelectTab('home')}
          className={`flex-1 py-1 flex flex-col items-center justify-center gap-0.5 rounded-xl transition active-press ${
            activeTab === 'home'
              ? 'text-[#1976D2] font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className={`p-1 rounded-xl ${activeTab === 'home' ? 'bg-[#1976D2] text-white font-bold' : ''}`}>
            <Home className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-medium tracking-tight">Home</span>
        </button>

        {/* Purchased Page */}
        <button
          onClick={() => onSelectTab('library')}
          className={`flex-1 py-1 flex flex-col items-center justify-center gap-0.5 rounded-xl transition active-press relative ${
            activeTab === 'library'
              ? 'text-[#1976D2] font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className={`p-1 rounded-xl ${activeTab === 'library' ? 'bg-[#1976D2] text-white font-bold' : ''}`}>
            <BookOpen className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-bold tracking-tight">Purchased</span>
          {unlockedCount > 0 && (
            <span className="absolute top-1 right-2.5 px-1.5 min-w-4 h-4 bg-secondary text-white text-[9px] font-black rounded-full flex items-center justify-center">
              {unlockedCount}
            </span>
          )}
        </button>

        {/* Courses */}
        <button
          onClick={() => onSelectTab('courses')}
          className={`flex-1 py-1 flex flex-col items-center justify-center gap-0.5 rounded-xl transition active-press ${
            activeTab === 'courses'
              ? 'text-[#1976D2] font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className={`p-1 rounded-xl ${activeTab === 'courses' ? 'bg-[#1976D2] text-white font-bold' : ''}`}>
            <GraduationCap className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-medium tracking-tight">Courses</span>
        </button>

        {/* Help */}
        <button
          onClick={() => onSelectTab('help')}
          className={`flex-1 py-1 flex flex-col items-center justify-center gap-0.5 rounded-xl transition active-press ${
            activeTab === 'help'
              ? 'text-[#1976D2] font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className={`p-1 rounded-xl ${activeTab === 'help' ? 'bg-[#1976D2] text-white font-bold' : ''}`}>
            <HelpCircle className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-medium tracking-tight">Help</span>
        </button>
      </div>
    </nav>
  );
}
