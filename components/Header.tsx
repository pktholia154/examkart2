'use client';

import React, { useState } from 'react';
import { Bell, Database, User, LogOut, Check } from 'lucide-react';

interface HeaderProps {
  userEmail?: string | null;
  userName?: string | null;
  userPhoto?: string | null;
  isGoogleUser?: boolean;
  isSigningIn?: boolean;
  onGoogleSignIn?: () => void;
  onSignOut?: () => void;
  onOpenSeedModal: () => void;
  unlockedCount: number;
}

export function Header({
  userEmail,
  userName,
  userPhoto,
  isGoogleUser = false,
  isSigningIn = false,
  onGoogleSignIn,
  onSignOut,
  onOpenSeedModal,
  unlockedCount
}: HeaderProps) {
  const [showUserDropdown, setShowUserDropdown] = useState<boolean>(false);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md px-4 py-3 border-b border-slate-100 flex items-center justify-between transition-all">
      {/* Brand Identity */}
      <div className="flex items-center gap-2.5">
        <div className="w-10 h-10 rounded-xl bg-[#1976D2] text-white flex items-center justify-center font-bold text-xl shadow-sm tracking-tight">
          E
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="text-xl font-extrabold tracking-tight text-[#1976D2]">
              ExamKart
            </h1>
            <span className="text-[10px] font-semibold bg-secondary-light text-secondary px-1.5 py-0.5 rounded-md border border-secondary/30">
              PRO
            </span>
          </div>
          <p className="text-[11px] font-medium text-slate-500 tracking-wide">
            Exam & Book Prep Portal
          </p>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Seed Database Button */}
        <button
          id="seed-db-btn"
          onClick={onOpenSeedModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-tertiary-light hover:bg-tertiary/20 text-slate-900 border border-tertiary/40 text-xs font-semibold transition active-press cursor-pointer"
          title="Seed Sample Data into Firebase DB 'examkart'"
        >
          <Database className="w-3.5 h-3.5 text-secondary" />
          <span className="hidden sm:inline">Seed DB</span>
        </button>

        {/* Notifications Icon */}
        <button 
          id="notifications-btn"
          className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition active-press cursor-pointer"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-tertiary rounded-full ring-2 ring-white"></span>
        </button>

        {/* Google Sign-In Button or User Profile at top right corner */}
        {isGoogleUser ? (
          <div className="relative">
            <button
              id="user-profile-menu-btn"
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-full hover:bg-slate-100 transition border border-slate-200 cursor-pointer"
              title={userName || userEmail || "Google Account"}
            >
              {userPhoto ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={userPhoto}
                  alt={userName || "Google User"}
                  className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-[#1976D2] text-white flex items-center justify-center font-bold text-xs">
                  {(userName || userEmail || 'G').charAt(0).toUpperCase()}
                </div>
              )}
              <span className="hidden md:inline-block text-xs font-bold text-slate-800 max-w-[90px] truncate">
                {userName?.split(' ')[0] || 'User'}
              </span>
            </button>

            {/* Dropdown Menu */}
            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-slate-100 py-2.5 z-50 animate-in fade-in zoom-in-95">
                <div className="px-4 py-2 border-b border-slate-100">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-secondary mb-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                    Signed in with Google
                  </div>
                  <p className="font-bold text-slate-900 text-xs truncate">{userName || 'Google User'}</p>
                  <p className="text-slate-500 text-[11px] truncate">{userEmail}</p>
                </div>

                <div className="px-2 pt-1">
                  <button
                    id="signout-btn"
                    onClick={() => {
                      setShowUserDropdown(false);
                      onSignOut?.();
                    }}
                    className="w-full text-left px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-xl font-semibold text-xs flex items-center gap-2 transition cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-500" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <button
            id="google-signin-btn"
            onClick={onGoogleSignIn}
            disabled={isSigningIn}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 border border-slate-200/90 shadow-xs hover:shadow-sm transition-all duration-150 font-medium text-xs disabled:opacity-60 cursor-pointer"
            title="Sign in with Google"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span className="font-semibold text-slate-800 tracking-tight whitespace-nowrap">
              {isSigningIn ? 'Signing in...' : 'Sign in with Google'}
            </span>
          </button>
        )}
      </div>
    </header>
  );
}
