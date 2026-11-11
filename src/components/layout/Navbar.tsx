'use client';

import React from 'react';
import Link from 'next/link';
import { TeachMeToggle } from '@/components/workspace/TeachMeToggle';
import { Database, BookOpen, User, Sparkles, FolderKanban } from 'lucide-react';
import { isSupabaseConfigured } from '@/lib/supabase/client';

export function Navbar() {
  const isConnected = isSupabaseConfigured();

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-xs border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs group-hover:bg-blue-700 transition">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-slate-900 tracking-tight text-base sm:text-lg block leading-none">
                Student Analytics Lab
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                Workspace & Edukasi Analisis Data
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-4 text-sm font-medium text-slate-600">
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:text-blue-600 hover:bg-slate-50 transition"
            >
              <FolderKanban className="w-4 h-4" />
              Proyek Saya
            </Link>
            <Link
              href="/project/demo"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-blue-700 bg-blue-50/70 hover:bg-blue-100/70 transition"
            >
              <Sparkles className="w-4 h-4 text-blue-600" />
              Dataset Demo
            </Link>
          </nav>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Status Badge */}
          <div
            className={`hidden sm:flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border ${
              isConnected
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}
            title={
              isConnected
                ? 'Terhubung dengan Supabase Cloud Backend'
                : 'Mode Preview / Offline Demo (Supabase dapat dihubungkan di .env.local)'
            }
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`}
            />
            <span>{isConnected ? 'Supabase Terhubung' : 'Mode Demo Aktif'}</span>
          </div>

          {/* Mode Ajari Saya Toggle */}
          <TeachMeToggle />

          {/* User Profile */}
          <Link
            href="/dashboard"
            className="flex items-center gap-2 pl-2 border-l border-slate-200 hover:opacity-80 transition"
          >
            <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-700 font-semibold text-xs">
              M
            </div>
            <div className="hidden lg:block text-left text-xs leading-tight">
              <span className="font-semibold text-slate-900 block">Mahasiswa</span>
              <span className="text-slate-500">S1 Bisnis Digital</span>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}

