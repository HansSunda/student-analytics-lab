'use client';

import React from 'react';
import { useTeachMe } from './TeachMeContext';
import { GraduationCap, Sparkles, AlertCircle } from 'lucide-react';

interface TeachMeCardProps {
  title: string;
  concept: string;
  whyItMatters: string;
  howToInterpret: string;
  pitfallWarning?: string;
}

export function TeachMeCard({
  title,
  concept,
  whyItMatters,
  howToInterpret,
  pitfallWarning,
}: TeachMeCardProps) {
  const { isTeachMeActive } = useTeachMe();

  if (!isTeachMeActive) return null;

  return (
    <div className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border border-blue-200 rounded-xl p-4 my-4 shadow-xs animate-fade-in">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-blue-600 text-white rounded-lg shadow-xs shrink-0 mt-0.5">
          <GraduationCap className="w-5 h-5" />
        </div>
        <div className="space-y-2 flex-1 text-sm text-slate-700">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-blue-950 flex items-center gap-1.5 text-base">
              Mode Ajari Saya: {title}
              <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full font-medium">
                Edukasi Mahasiswa
              </span>
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            <div className="bg-white/80 p-3 rounded-lg border border-blue-100">
              <span className="font-semibold text-blue-900 block text-xs uppercase tracking-wider mb-1">
                📚 Apa Konsep Ini?
              </span>
              <p className="text-slate-600 leading-relaxed text-xs">{concept}</p>
            </div>

            <div className="bg-white/80 p-3 rounded-lg border border-blue-100">
              <span className="font-semibold text-blue-900 block text-xs uppercase tracking-wider mb-1">
                🎯 Mengapa Kita Menggunakannya?
              </span>
              <p className="text-slate-600 leading-relaxed text-xs">{whyItMatters}</p>
            </div>
          </div>

          <div className="bg-white/90 p-3 rounded-lg border border-blue-100">
            <span className="font-semibold text-blue-900 block text-xs uppercase tracking-wider mb-1">
              🔍 Cara Membaca & Menafsirkan Hasil:
            </span>
            <p className="text-slate-600 leading-relaxed text-xs">{howToInterpret}</p>
          </div>

          {pitfallWarning && (
            <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 p-2.5 rounded-lg text-amber-900 text-xs">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold text-amber-950">Catatan Kritis Mahasiswa: </strong>
                {pitfallWarning}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

