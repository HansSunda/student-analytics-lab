'use client';

import React from 'react';
import { useTeachMe } from './TeachMeContext';
import { GraduationCap } from 'lucide-react';

export function TeachMeToggle() {
  const { isTeachMeActive, toggleTeachMe } = useTeachMe();

  return (
    <button
      onClick={toggleTeachMe}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all shadow-xs border ${
        isTeachMeActive
          ? 'bg-blue-600 text-white border-blue-700 hover:bg-blue-700'
          : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
      }`}
      title="Aktifkan penjelasan akademis pada setiap langkah analisis"
    >
      <GraduationCap className={`w-4 h-4 ${isTeachMeActive ? 'text-amber-300' : 'text-slate-500'}`} />
      <span>Mode Ajari Saya:</span>
      <span
        className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
          isTeachMeActive ? 'bg-white/20 text-white' : 'bg-slate-300 text-slate-700'
        }`}
      >
        {isTeachMeActive ? 'ON' : 'OFF'}
      </span>
    </button>
  );
}

