import Link from 'next/link';
import {
  Database,
  ShieldCheck,
  Sparkles,
  BarChart3,
  Calculator,
  FileSpreadsheet,
  ArrowRight,
  GraduationCap,
  TrendingUp,
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto py-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100/80 text-blue-800 text-xs font-semibold mb-6">
          <GraduationCap className="w-4 h-4 text-blue-700" />
          Dirancang Khusus untuk Mahasiswa & Peneliti Akademis
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Pahami Dataset Anda, Analisis dengan Tepat,{' '}
          <span className="text-blue-600">Ubah Menjadi Insight Bermakna</span>
        </h1>
        <p className="mt-5 text-base sm:text-lg text-slate-600 leading-relaxed">
          Bukan sekadar “AI pembuat tugas instan”. Student Analytics Lab adalah ruang kerja analitik
          interaktif yang membantu Anda menguasai setiap langkah metodologi: dari pembersihan data, uji
          asumsi statistik, hingga laporan bisnis profesional.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 shadow-md hover:shadow-lg transition"
          >
            Masuk ke Dashboard
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/project/demo"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-slate-700 border border-slate-300 font-medium hover:bg-slate-50 transition shadow-xs"
          >
            <Sparkles className="w-4 h-4 text-blue-600" />
            Coba Demo Dataset Penjualan
          </Link>
        </div>
      </div>

      {/* Workflow Steps Preview */}
      <div className="mt-12 bg-white rounded-2xl border border-slate-200 p-8 shadow-xs">
        <h2 className="text-xl font-bold text-slate-900 text-center mb-8">
          Alur Kerja Analisis Data yang Terstruktur & Ilmiah
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-5 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 font-bold mb-3">
              1
            </div>
            <h3 className="font-semibold text-slate-900 mb-1">Profiling & Kualitas</h3>
            <p className="text-xs text-slate-500">
              Deteksi otomatis baris duplikat, nilai kosong (*missing*), anomali, dan inkonsistensi
              kategori tanpa merusak dataset asli.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600 font-bold mb-3">
              2
            </div>
            <h3 className="font-semibold text-slate-900 mb-1">Pembersihan Terkontrol</h3>
            <p className="text-xs text-slate-500">
              Imputasi median/mean, standardisasi huruf kapital, serta riwayat manipulasi data
              lengkap yang dapat di-undo.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold mb-3">
              3
            </div>
            <h3 className="font-semibold text-slate-900 mb-1">Uji Statistik & Asumsi</h3>
            <p className="text-xs text-slate-500">
              Korelasi Pearson/Spearman, uji beda t-test, ANOVA, dan cek normalitas otomatis agar
              metodologi tugas tidak salah.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600 font-bold mb-3">
              4
            </div>
            <h3 className="font-semibold text-slate-900 mb-1">Insight & Laporan</h3>
            <p className="text-xs text-slate-500">
              AI membantu menjelaskan makna angka ke bahasa bisnis tanpa mengarang kausalitas semu,
              dilengkapi draf laporan akademis.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

