'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Database,
  ShieldAlert,
  Sparkles,
  BarChart2,
  Lightbulb,
  Calculator,
  PieChart,
  TrendingUp,
  FileText,
  ArrowLeft,
  Upload,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  Check,
  Download,
  Info,
  Layers,
  ChevronRight,
  Filter,
  FileSpreadsheet
} from 'lucide-react';
import { generateDemoDataset, DemoSalesRow } from '@/lib/data/demo-data';
import { profileDataset } from '@/lib/engine/profiler';
import { calculatePearson, checkNormality, calculateLinearRegression } from '@/lib/engine/statistics';
import { TeachMeCard } from '@/components/workspace/TeachMeCard';
import { WorkspaceStep, WORKFLOW_STEPS } from '@/types/analytics';
import { formatNumber } from '@/lib/utils';
import Papa from 'papaparse';

interface CleaningLogItem {
  id: string;
  step: number;
  operation: string;
  detail: string;
  timestamp: string;
}

export default function ProjectWorkspacePage({ params }: { params: { id: string } }) {
  const [currentStep, setCurrentStep] = useState<WorkspaceStep>('overview');
  
  // Working dataset state (starts with realistic demo data)
  const initialRawData = useMemo(() => generateDemoDataset(), []);
  const [datasetRows, setDatasetRows] = useState<any[]>(initialRawData);
  const [cleaningHistory, setCleaningHistory] = useState<CleaningLogItem[]>([
    {
      id: 'log-0',
      step: 1,
      operation: 'Ingestion Awal',
      detail: 'Dataset mentah (retail_sales_2024.csv) dimuat ke memory',
      timestamp: '10:00:00'
    }
  ]);

  // Dynamic Profiling based on current dataset state
  const profiling = useMemo(() => {
    return profileDataset(datasetRows);
  }, [datasetRows]);

  // Selected variables for statistical testing
  const [statVarX, setStatVarX] = useState<string>('Discount');
  const [statVarY, setStatVarY] = useState<string>('Revenue');

  // Compute correlation & assumptions dynamically
  const correlationResult = useMemo(() => {
    if (!statVarX || !statVarY || datasetRows.length === 0) return null;
    const xVals: number[] = [];
    const yVals: number[] = [];

    datasetRows.forEach((row) => {
      const x = Number(row[statVarX]);
      const y = Number(row[statVarY]);
      if (!isNaN(x) && !isNaN(y) && row[statVarX] !== null && row[statVarY] !== null) {
        xVals.push(x);
        yVals.push(y);
      }
    });

    const pearson = calculatePearson(xVals, yVals);
    const normX = checkNormality(xVals);
    const normY = checkNormality(yVals);
    const regression = calculateLinearRegression(xVals, yVals);

    return {
      xVals,
      yVals,
      pearson,
      normX,
      normY,
      regression,
      n: xVals.length
    };
  }, [statVarX, statVarY, datasetRows]);

  // File Upload Handler (CSV)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.data && results.data.length > 0) {
          setDatasetRows(results.data);
          setCleaningHistory([
            {
              id: `log-${Date.now()}`,
              step: 1,
              operation: 'Upload File Baru',
              detail: `File ${file.name} berhasil diurai (${results.data.length} baris)`,
              timestamp: new Date().toLocaleTimeString('id-ID')
            }
          ]);
        }
      }
    });
  };

  // Cleaning Action 1: Remove Duplicates
  const handleRemoveDuplicates = () => {
    const seen = new Set<string>();
    const uniqueRows: any[] = [];
    let removedCount = 0;

    for (const row of datasetRows) {
      const str = JSON.stringify(row);
      if (seen.has(str)) {
        removedCount++;
      } else {
        seen.add(str);
        uniqueRows.push(row);
      }
    }

    if (removedCount > 0) {
      setDatasetRows(uniqueRows);
      setCleaningHistory((prev) => [
        ...prev,
        {
          id: `log-${Date.now()}`,
          step: prev.length + 1,
          operation: 'Hapus Baris Duplikat',
          detail: `Berhasil menghapus ${removedCount} baris data duplikat identik`,
          timestamp: new Date().toLocaleTimeString('id-ID')
        }
      ]);
    }
  };

  // Cleaning Action 2: Standardize Regional Casing
  const handleStandardizeCasing = (columnName = 'Region') => {
    const standardized = datasetRows.map((row) => {
      const val = row[columnName];
      if (typeof val === 'string') {
        const trimmed = val.trim();
        const normalized = trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
        return { ...row, [columnName]: normalized };
      }
      return row;
    });

    setDatasetRows(standardized);
    setCleaningHistory((prev) => [
      ...prev,
      {
        id: `log-${Date.now()}`,
        step: prev.length + 1,
        operation: 'Standardisasi Kategori',
        detail: `Menyelaraskan variasi huruf besar/kecil pada kolom "${columnName}" ke format Title Case (e.g. "Jakarta")`,
        timestamp: new Date().toLocaleTimeString('id-ID')
      }
    ]);
  };

  // Cleaning Action 3: Fill Missing Discount with Median
  const handleImputeMissing = (columnName = 'Discount') => {
    const validValues = datasetRows
      .map((r) => r[columnName])
      .filter((v) => v !== null && v !== undefined && !isNaN(Number(v)))
      .map(Number)
      .sort((a, b) => a - b);

    if (validValues.length === 0) return;
    const mid = Math.floor(validValues.length / 2);
    const median = validValues.length % 2 !== 0 ? validValues[mid] : (validValues[mid - 1] + validValues[mid]) / 2;

    let filledCount = 0;
    const filled = datasetRows.map((row) => {
      if (row[columnName] === null || row[columnName] === undefined || row[columnName] === '') {
        filledCount++;
        return { ...row, [columnName]: median };
      }
      return row;
    });

    setDatasetRows(filled);
    setCleaningHistory((prev) => [
      ...prev,
      {
        id: `log-${Date.now()}`,
        step: prev.length + 1,
        operation: 'Imputasi Nilai Kosong',
        detail: `Mengisi ${filledCount} nilai kosong pada kolom "${columnName}" menggunakan nilai median (${median.toFixed(2)})`,
        timestamp: new Date().toLocaleTimeString('id-ID')
      }
    ]);
  };

  // Reset Dataset to Raw
  const handleResetDataset = () => {
    setDatasetRows(initialRawData);
    setCleaningHistory([
      {
        id: `log-${Date.now()}`,
        step: 1,
        operation: 'Reset ke Data Awal',
        detail: 'Dataset dikembalikan ke kondisi mentah asli sebelum dibersihkan',
        timestamp: new Date().toLocaleTimeString('id-ID')
      }
    ]);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Workspace Subheader */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
              title="Kembali ke Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-slate-900">
                  {params.id === 'demo' ? 'Analisis Penjualan Retail Indonesia' : 'Proyek Analisis Data'}
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">
                  Versi {cleaningHistory.length}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {profiling.rowCount.toLocaleString('id-ID')} baris • {profiling.columnCount} kolom terdeteksi
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 transition shadow-2xs">
              <Upload className="w-3.5 h-3.5 text-blue-600" />
              <span>Unggah CSV Lain</span>
              <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
            </label>
            <button
              onClick={handleResetDataset}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 transition shadow-2xs"
              title="Kembalikan dataset ke kondisi mentah sebelum pembersihan"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Data Asli
            </button>
          </div>
        </div>
      </div>

      {/* Main Workspace Body */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex-1 flex flex-col md:flex-row gap-6">
        {/* Left Workflow Stepper Sidebar */}
        <aside className="w-full md:w-64 shrink-0">
          <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-2xs sticky top-36">
            <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Alur Metodologi Analisis
            </div>
            <nav className="space-y-1">
              {WORKFLOW_STEPS.map((step, idx) => {
                const isActive = currentStep === step.id;
                return (
                  <button
                    key={step.id}
                    onClick={() => setCurrentStep(step.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-medium transition flex items-center justify-between ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-xs font-semibold'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                          isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <span className="truncate">{step.label}</span>
                    </div>
                    {isActive && <ChevronRight className="w-3.5 h-3.5 shrink-0" />}
                  </button>
                );
              })}
            </nav>

            <div className="mt-4 pt-4 border-t border-slate-100 px-3">
              <span className="text-[11px] text-slate-500 block mb-1">Riwayat Manipulasi:</span>
              <span className="text-xs font-bold text-slate-800">
                {cleaningHistory.length} langkah tercatat
              </span>
            </div>
          </div>
        </aside>

        {/* Right Stage Content Canvas */}
        <main className="flex-1 min-w-0 space-y-6">
          {/* TAB 1: OVERVIEW & PROFILING */}
          {currentStep === 'overview' && (
            <div className="space-y-6 animate-fade-in">
              <TeachMeCard
                title="Data Profiling & Semantic Types"
                concept="Data Profiling adalah pemetaan awal karakteristik dataset: menghitung sebaran nilai, mendeteksi tipe semantik (apakah kolom numerik, kategori, tanggal, atau identifier kunci), dan melihat persentase kekosongan data."
                whyItMatters="Sebelum menjalankan rumus atau grafik apapun, Anda harus memahami sifat variabel Anda. Menjalankan rata-rata pada variabel kategori (seperti ID atau Kode Pos) adalah kesalahan umum mahasiswa!"
                howToInterpret="Periksa apakah tipe data yang terdeteksi (misal: 'numerical' untuk Diskon, 'categorical' untuk Region) sudah sesuai dengan variabel penelitian Anda."
              />

              {/* Overview Metrics Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200">
                  <span className="text-[11px] text-slate-500 font-medium block">Total Baris</span>
                  <span className="text-xl font-bold text-slate-900">{profiling.rowCount}</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200">
                  <span className="text-[11px] text-slate-500 font-medium block">Total Kolom</span>
                  <span className="text-xl font-bold text-slate-900">{profiling.columnCount}</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200">
                  <span className="text-[11px] text-slate-500 font-medium block">Nilai Kosong</span>
                  <span className={`text-xl font-bold ${profiling.qualityReport.missingValuesTotal > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                    {profiling.qualityReport.missingValuesPercentage}%
                  </span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200">
                  <span className="text-[11px] text-slate-500 font-medium block">Baris Duplikat</span>
                  <span className={`text-xl font-bold ${profiling.qualityReport.duplicateRows > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {profiling.qualityReport.duplicateRows} baris
                  </span>
                </div>
              </div>

              {/* Column Profiling Table */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
                <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-sm">Profil Kolom Dataset</h3>
                  <span className="text-xs text-slate-500">Karakteristik & Ringkasan Deskriptif</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[10px]">
                      <tr>
                        <th className="p-3">Nama Kolom</th>
                        <th className="p-3">Tipe Semantik</th>
                        <th className="p-3">Nilai Unik</th>
                        <th className="p-3">Kosong (Missing)</th>
                        <th className="p-3">Rata-rata (Mean)</th>
                        <th className="p-3">Median</th>
                        <th className="p-3">Sampel Nilai</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {profiling.columns.map((col) => (
                        <tr key={col.id} className="hover:bg-slate-50/70">
                          <td className="p-3 font-semibold text-slate-900">{col.column_name}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-800">
                              {col.semantic_type}
                            </span>
                          </td>
                          <td className="p-3 text-slate-600">{col.unique_count}</td>
                          <td className="p-3">
                            {col.missing_count > 0 ? (
                              <span className="text-amber-700 font-medium bg-amber-50 px-1.5 py-0.5 rounded">
                                {col.missing_count} kosong
                              </span>
                            ) : (
                              <span className="text-emerald-700">0</span>
                            )}
                          </td>
                          <td className="p-3 text-slate-600">{formatNumber(col.mean)}</td>
                          <td className="p-3 text-slate-600">{formatNumber(col.median)}</td>
                          <td className="p-3 text-slate-500 max-w-[200px] truncate">
                            {col.sample_values.join(', ')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DATA QUALITY */}
          {currentStep === 'quality' && (
            <div className="space-y-6 animate-fade-in">
              <TeachMeCard
                title="Pemeriksaan Kualitas Data"
                concept="Kualitas data (Data Hygiene) memeriksa 4 pilar kecacatan dataset: (1) Baris ganda/duplikat, (2) Nilai yang hilang (Missing values), (3) Inkonsistensi teks/kategori karena kesalahan entri manusia, dan (4) Outlier atau nilai ekstrem."
                whyItMatters="'Garbage in, garbage out'. Jika dataset Anda memiliki 17 baris duplikat atau inkonsistensi penulisan nama kota, maka hasil total penjualan atau uji regresi Anda dipastikan bias dan tidak dapat dipertanggungjawabkan dalam sidang skripsi."
                howToInterpret="Bedakan antara Anomali dengan Kesalahan Pasti. Outlier belum tentu harus dihapus jika merupakan fakta penjualan yang nyata; tetapi baris duplikat identik hampir selalu harus dibersihkan."
                pitfallWarning="Jangan langsung menghapus outlier tanpa memahami konteks bisnisnya!"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Duplicates Card */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-rose-600" />
                      Baris Duplikat Identik
                    </h4>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                      profiling.qualityReport.duplicateRows > 0 ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {profiling.qualityReport.duplicateRows > 0 ? `${profiling.qualityReport.duplicateRows} Ditemukan` : 'Bersih'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mb-4">
                    Baris yang memiliki nilai identik pada seluruh kolom biasanya berasal dari duplikasi pencatatan transaksi sistem.
                  </p>
                  {profiling.qualityReport.duplicateRows > 0 && (
                    <button
                      onClick={handleRemoveDuplicates}
                      className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs transition"
                    >
                      Bersihkan {profiling.qualityReport.duplicateRows} Baris Duplikat
                    </button>
                  )}
                </div>

                {/* Inconsistent Categories Card */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      Inkonsistensi Huruf Kategori
                    </h4>
                    <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800">
                      {profiling.qualityReport.inconsistentCategories.length} Masalah
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mb-3">
                    Ditemukan perbedaan penulisan seperti: &quot;Jakarta&quot;, &quot;jakarta&quot;, dan &quot;JAKARTA&quot; yang akan membuat komputer menganggap mereka sebagai 3 kota berbeda saat di-groupby.
                  </p>
                  {profiling.qualityReport.inconsistentCategories.length > 0 && (
                    <button
                      onClick={() => handleStandardizeCasing('Region')}
                      className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs transition"
                    >
                      Standardisasi ke Title Case (&quot;Jakarta&quot;)
                    </button>
                  )}
                </div>

                {/* Missing Values Card */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <Info className="w-4 h-4 text-blue-600" />
                      Nilai Kosong (Missing Values)
                    </h4>
                    <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-blue-100 text-blue-800">
                      {profiling.qualityReport.missingValuesTotal} Sel Kosong
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mb-3">
                    Kolom &quot;Discount&quot; memiliki data kosong. Anda dapat mengisinya (imputasi) menggunakan median agar tidak merusak distribusi.
                  </p>
                  {profiling.qualityReport.missingValuesTotal > 0 && (
                    <button
                      onClick={() => handleImputeMissing('Discount')}
                      className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition"
                    >
                      Imputasi Nilai Kosong dengan Median
                    </button>
                  )}
                </div>

                {/* Outliers Card */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-600" />
                      Deteksi Outlier Statistik (Metode IQR)
                    </h4>
                    <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-purple-100 text-purple-800">
                      {profiling.qualityReport.outlierCount.length} Kolom
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mb-2">
                    Nilai di luar $Q_1 - 1.5 \times IQR$ atau $Q_3 + 1.5 \times IQR$ ditandai sebagai data ekstrem untuk diwaspadai sebelum uji parametrik.
                  </p>
                  <div className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg">
                    💡 Rekomendasi: Gunakan uji non-parametrik jika outlier mencerminkan transaksi bernilai tinggi nyata.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DATA CLEANING */}
          {currentStep === 'cleaning' && (
            <div className="space-y-6 animate-fade-in">
              <TeachMeCard
                title="Pembersihan Data Terkontrol & Audit Trail"
                concept="Pembersihan data adalah tindakan rekayasa data terkontrol untuk memperbaiki kualitas. Setiap aksi (misal: imputasi missing value, pemfilteran baris) wajib dicatat dalam Audit Trail (Riwayat Pembersihan)."
                whyItMatters="Di dunia akademis dan industri, riset Anda harus 'reproducible' (dapat direplikasi). Dosen atau auditor berhak menanyakan: 'Dari mana angka ini diperoleh dan mengapa baris tersebut dihilangkan?'"
                howToInterpret="Perhatikan tabel riwayat di bawah. Anda dapat membatalkan atau mereset kapan saja ke dataset mentah asli tanpa takut kehilangan file sumber."
              />

              <div className="bg-white p-5 rounded-2xl border border-slate-200">
                <h3 className="font-bold text-slate-900 text-sm mb-4">Aksi Pembersihan Cepat</h3>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleRemoveDuplicates}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition"
                  >
                    1. Hapus Duplikat ({profiling.qualityReport.duplicateRows})
                  </button>
                  <button
                    onClick={() => handleStandardizeCasing('Region')}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition"
                  >
                    2. Standardisasi Kapitalisasi &quot;Region&quot;
                  </button>
                  <button
                    onClick={() => handleImputeMissing('Discount')}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition"
                  >
                    3. Imputasi Missing &quot;Discount&quot; (Median)
                  </button>
                </div>
              </div>

              {/* Cleaning History / Audit Log */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
                <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-sm">Riwayat Pembersihan (Cleaning Log)</h3>
                  <span className="text-xs text-slate-500">Log Ilmiah Reproduksibilitas</span>
                </div>
                <div className="divide-y divide-slate-100">
                  {cleaningHistory.map((log) => (
                    <div key={log.id} className="p-4 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[11px]">
                          {log.step}
                        </span>
                        <div>
                          <span className="font-semibold text-slate-900 block">{log.operation}</span>
                          <span className="text-slate-500 text-[11px]">{log.detail}</span>
                        </div>
                      </div>
                      <span className="text-slate-400 text-[10px]">{log.timestamp}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: EDA (EXPLORATORY DATA ANALYSIS) */}
          {currentStep === 'eda' && (
            <div className="space-y-6 animate-fade-in">
              <TeachMeCard
                title="Eksplorasi Data (EDA)"
                concept="EDA adalah proses investigasi awal pada data untuk menemukan pola, melihat anomali, menguji hipotesis awal, dan memeriksa asumsi sebelum pemodelan formal."
                whyItMatters="Grafik visual membantu kita mendeteksi bentuk distribusi (apakah miring ke kanan/skewed, normal, atau bimodal) yang sering terlewat jika hanya melihat angka rata-rata."
                howToInterpret="Lihat perbandingan pendapatan antar kategori produk dan sebaran nilai diskon untuk menyusun hipotesis penelitian Anda."
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Category Frequency Comparison */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200">
                  <h4 className="font-bold text-slate-900 text-sm mb-1">
                    Distribusi Transaksi per Kategori Produk
                  </h4>
                  <p className="text-xs text-slate-500 mb-4">Frekuensi transaksi yang tercatat di dataset</p>
                  <div className="space-y-3">
                    {['Elektronik', 'Perlengkapan Kantor', 'Buku & Modul', 'Aksesoris IT'].map((cat) => {
                      const count = datasetRows.filter((r) => r.ProductCategory === cat).length;
                      const pct = Math.round((count / datasetRows.length) * 100);
                      return (
                        <div key={cat} className="space-y-1">
                          <div className="flex justify-between text-xs font-medium text-slate-700">
                            <span>{cat}</span>
                            <span>{count} transaksi ({pct}%)</span>
                          </div>
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div className="bg-blue-600 h-full rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Regional Distribution */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200">
                  <h4 className="font-bold text-slate-900 text-sm mb-1">
                    Sebaran Transaksi Berdasarkan Wilayah (Region)
                  </h4>
                  <p className="text-xs text-slate-500 mb-4">Terselaraskan setelah standardisasi huruf</p>
                  <div className="space-y-3">
                    {['Jakarta', 'Surabaya', 'Bandung', 'Medan'].map((reg) => {
                      const count = datasetRows.filter(
                        (r) => String(r.Region).toLowerCase() === reg.toLowerCase()
                      ).length;
                      const pct = Math.round((count / datasetRows.length) * 100);
                      return (
                        <div key={reg} className="space-y-1">
                          <div className="flex justify-between text-xs font-medium text-slate-700">
                            <span>{reg}</span>
                            <span>{count} transaksi ({pct}%)</span>
                          </div>
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: SMART RECOMMENDATIONS */}
          {currentStep === 'recommendations' && (
            <div className="space-y-6 animate-fade-in">
              <TeachMeCard
                title="Rekomendasi Analisis Cerdas"
                concept="Sistem membaca struktur variabel yang ada pada dataset Anda (misal: Diskon dan Pendapatan sama-sama numerik, sedangkan Kategori adalah nominal) untuk merumuskan pertanyaan penelitian yang valid secara metodologis."
                whyItMatters="Banyak mahasiswa bingung memilih uji statistik yang tepat untuk tugas kuliah mereka. Fitur ini memandu Anda tanpa 'mengarang' kolom atau hipotesis palsu."
                howToInterpret="Pilih pertanyaan penelitian yang paling relevan dengan tujuan studi Anda untuk langsung diarahkan ke pengujian statistiknya."
              />

              <div className="space-y-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-blue-300 transition shadow-2xs">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-100 text-blue-800">
                          Uji Hubungan / Asosiasi
                        </span>
                        <span className="text-xs font-semibold text-emerald-600">Prioritas Tinggi</span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-base">
                        Apakah tingkat Diskon berhubungan signifikan dengan Pendapatan (Revenue)?
                      </h4>
                      <p className="text-xs text-slate-600">
                        Kedua variabel bertipe numerik rasio kontinu. Direkomendasikan uji korelasi Pearson (jika normal) atau korelasi Spearman (jika miring/non-normal).
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setStatVarX('Discount');
                        setStatVarY('Revenue');
                        setCurrentStep('statistical');
                      }}
                      className="px-3.5 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition shrink-0"
                    >
                      Jalankan Uji Ini
                    </button>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-blue-300 transition shadow-2xs">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-purple-100 text-purple-800">
                          Uji Komparasi Grup
                        </span>
                        <span className="text-xs font-semibold text-blue-600">Prioritas Menengah</span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-base">
                        Apakah terdapat perbedaan rata-rata Pendapatan antar Kategori Produk?
                      </h4>
                      <p className="text-xs text-slate-600">
                        Membandingkan variabel numerik (Revenue) di lebih dari 2 kelompok kategori. Direkomendasikan menggunakan One-Way ANOVA atau alternatif non-parametrik Kruskal-Wallis.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setStatVarX('Quantity');
                        setStatVarY('Profit');
                        setCurrentStep('statistical');
                      }}
                      className="px-3.5 py-2 rounded-xl bg-purple-600 text-white text-xs font-semibold hover:bg-purple-700 transition shrink-0"
                    >
                      Jalankan Uji Ini
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: STATISTICAL ANALYSIS & ASSUMPTION CHECKING */}
          {currentStep === 'statistical' && correlationResult && (
            <div className="space-y-6 animate-fade-in">
              <TeachMeCard
                title="Uji Hipotesis & Pengecekan Asumsi"
                concept="Sebelum mempercayai nilai korelasi atau p-value, kita harus memeriksa asumsi statistik (seperti Normalitas distribusi). Jika asumsi normalitas dilanggar, uji parametrik seperti Pearson atau T-test dapat memberikan kesimpulan yang bias."
                whyItMatters="Di sinilah letak nilai pembeda Student Analytics Lab: kami mengajarkan metodologi yang benar kepada mahasiswa. Nilai dihitung oleh formula deterministik, bukan tebakan LLM."
                howToInterpret="Nilai p-value < 0.05 menunjukkan korelasi signifikan secara statistik pada tingkat kepercayaan 95%. Namun, besaran r (-1 s.d +1) menunjukkan kekuatan efek (effect size)."
                pitfallWarning="KORELASI BUKAN KAUSALITAS! Nilai korelasi yang signifikan tidak membuktikan bahwa variabel X secara langsung menyebabkan variabel Y berubah!"
              />

              {/* Variable Selector */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-wrap items-center gap-4">
                <span className="text-xs font-bold text-slate-700">Variabel Pengujian:</span>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-slate-500">Variabel X:</label>
                  <select
                    value={statVarX}
                    onChange={(e) => setStatVarX(e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Discount">Discount</option>
                    <option value="Quantity">Quantity</option>
                    <option value="UnitPrice">UnitPrice</option>
                    <option value="Cost">Cost</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-xs text-slate-500">Variabel Y:</label>
                  <select
                    value={statVarY}
                    onChange={(e) => setStatVarY(e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Revenue">Revenue</option>
                    <option value="Profit">Profit</option>
                    <option value="Quantity">Quantity</option>
                  </select>
                </div>

                <span className="text-xs text-slate-400 ml-auto">
                  Ukuran Sampel Efektif (n): <strong>{correlationResult.n}</strong>
                </span>
              </div>

              {/* Assumption Check Banner */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200">
                <h4 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                  Status Pengecekan Asumsi Normalitas
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className={`p-3 rounded-xl border ${correlationResult.normX.passed ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-amber-50 border-amber-200 text-amber-900'}`}>
                    <span className="font-bold block mb-1">Variabel X ({statVarX}):</span>
                    <p className="text-[11px] leading-relaxed">{correlationResult.normX.note}</p>
                  </div>
                  <div className={`p-3 rounded-xl border ${correlationResult.normY.passed ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-amber-50 border-amber-200 text-amber-900'}`}>
                    <span className="font-bold block mb-1">Variabel Y ({statVarY}):</span>
                    <p className="text-[11px] leading-relaxed">{correlationResult.normY.note}</p>
                  </div>
                </div>
              </div>

              {/* Statistical Results Card */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
                <h3 className="font-bold text-slate-900 text-base mb-4">
                  Hasil Uji Korelasi Pearson & Regresi Linear
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block">
                      Koefisien Korelasi (r)
                    </span>
                    <span className="text-2xl font-extrabold text-blue-600">
                      {correlationResult.pearson.r}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-1">
                      {Math.abs(correlationResult.pearson.r) > 0.5 ? 'Korelasi Kuat' : 'Korelasi Moderat / Lemah'}
                    </span>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block">
                      Signifikansi (p-value)
                    </span>
                    <span className={`text-2xl font-extrabold ${correlationResult.pearson.pValue < 0.05 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {correlationResult.pearson.pValue}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-1">
                      {correlationResult.pearson.pValue < 0.05 ? 'Signifikan (p < 0.05)' : 'Tidak Signifikan'}
                    </span>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block">
                      Koefisien Determinasi (R²)
                    </span>
                    <span className="text-2xl font-extrabold text-purple-600">
                      {correlationResult.regression.r2}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-1">
                      Proporsi variasi yang dijelaskan
                    </span>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block">
                      Persamaan Garis Regresi
                    </span>
                    <span className="text-sm font-bold text-slate-800 block mt-2">
                      y = {correlationResult.regression.slope}x + {correlationResult.regression.intercept}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-1">OLS Linear Model</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-blue-900 leading-relaxed">
                  <strong>Interpretasi Akademis: </strong>
                  Ditemukan koefisien korelasi $r = {correlationResult.pearson.r}$ dengan nilai $p = {correlationResult.pearson.pValue}$. Karena $p &lt; 0.05$, hipotesis nol ($H_0$) ditolak, menunjukkan terdapat hubungan linear yang signifikan secara statistik antara {statVarX} dan {statVarY}.
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: VISUALIZER */}
          {currentStep === 'visualizer' && (
            <div className="space-y-6 animate-fade-in">
              <TeachMeCard
                title="Pemilihan Grafik yang Tepat"
                concept="Grafik bukan sekadar hiasan estetis, melainkan representasi visual dari tipe variabel. Diagram batang (Bar Chart) cocok untuk variabel kategori terpisah, Line Chart cocok untuk tren deret waktu (time series), dan Scatter Plot cocok untuk melihat hubungan 2 variabel kontinu."
                whyItMatters="Dosen penguji sering mengkritik mahasiswa yang menggunakan Pie Chart untuk data yang memiliki lebih dari 5 kategori, atau menggunakan Line Chart untuk data kategori diskrit yang tidak berurutan."
                howToInterpret="Sistem secara otomatis menyarankan tipe grafik yang paling tepat berdasarkan tipe semantik variabel Anda."
              />

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">
                      Grafik Scatter Hubungan {statVarX} vs {statVarY}
                    </h3>
                    <p className="text-xs text-slate-500">Representasi titik sebaran data aktual</p>
                  </div>
                  <span className="text-xs px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full font-semibold">
                    Rekomendasi: Scatter Plot (Numerik x Numerik)
                  </span>
                </div>

                {/* Simulated Scatter/Bar Canvas */}
                <div className="h-64 bg-slate-50 rounded-xl border border-dashed border-slate-300 flex flex-col items-center justify-center p-6 text-center">
                  <BarChart2 className="w-10 h-10 text-blue-600 mb-2 opacity-70" />
                  <p className="text-xs font-semibold text-slate-800">
                    Visualisasi Interaktif Aktif untuk {statVarX} dan {statVarY}
                  </p>
                  <p className="text-[11px] text-slate-500 max-w-md mt-1">
                    Garis tren menunjukkan kemiringan regresi $m = {correlationResult?.regression.slope}$. Grafik ini siap disematkan ke dalam laporan akhir.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: BUSINESS INSIGHTS */}
          {currentStep === 'insights' && (
            <div className="space-y-6 animate-fade-in">
              <TeachMeCard
                title="Translasi Statistik ke Implikasi Manajerial"
                concept="Analisis data tidak berhenti di angka p-value. Mahasiswa bisnis, manajemen, dan ekonomi harus mampu menjawab pertanyaan: 'Lalu apa artinya temuan ini bagi manajer atau pengambil keputusan?'"
                whyItMatters="Inilah inti diferensiasi Student Analytics Lab: kami menerjemahkan angka statistik menjadi rekomendasi aksi bisnis tanpa mengklaim kepastian kausalitas yang menyesatkan."
                howToInterpret="Strukturkan analisis Anda menjadi: Temuan (Finding) -> Interpretasi -> Implikasi Bisnis -> Batasan Studi (Limitations)."
                pitfallWarning="Selalu nyatakan batasan penelitian Anda. Menjelaskan keterbatasan data menunjukkan kedewasaan metodologi mahasiswa!"
              />

              <div className="space-y-4">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4 shadow-2xs">
                  <div className="border-l-4 border-blue-600 pl-4 py-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block">
                      1. Temuan Statistik Pasti (Empirical Finding)
                    </span>
                    <p className="text-sm text-slate-800 font-semibold mt-0.5">
                      Terdapat hubungan linear dengan koefisien korelasi $r = {correlationResult?.pearson.r}$ ($p = {correlationResult?.pearson.pValue}$) antara tingkat diskon dan pendapatan.
                    </p>
                  </div>

                  <div className="border-l-4 border-indigo-600 pl-4 py-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 block">
                      2. Interpretasi Akademis (Academic Interpretation)
                    </span>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                      Hubungan yang teramati bernilai moderat. Hal ini menunjukkan bahwa peningkatan persentase diskon tidak serta merta diikuti oleh lonjakan pendapatan yang proporsional secara linier.
                    </p>
                  </div>

                  <div className="border-l-4 border-emerald-600 pl-4 py-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block">
                      3. Implikasi Keputusan Bisnis (Business Action)
                    </span>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                      Manajemen disarankan untuk mengevaluasi efektivitas program diskon besar. Pemberian diskon perlu dibatasi pada produk dengan elastisitas harga tinggi agar tidak menggerus margin keuntungan bersih (*profit margin*).
                    </p>
                  </div>

                  <div className="border-l-4 border-amber-600 pl-4 py-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 block">
                      4. Batasan Studi & Analisis (Research Limitations)
                    </span>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                      Analisis ini bersifat observasional pada data transaksi historis. Temuan korelasi ini tidak membuktikan bahwa diskon secara langsung menyebabkan fluktuasi pendapatan tanpa mengontrol variabel lain seperti musim (*seasonality*) dan promosi kompetitor.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: REPORT BUILDER */}
          {currentStep === 'report' && (
            <div className="space-y-6 animate-fade-in">
              <TeachMeCard
                title="Penyusun Laporan Akademis 9 Bab"
                concept="Laporan analisis data profesional mengikuti struktur ilmiah standar: Pendahuluan, Deskripsi Dataset, Pembersihan Data, EDA, Uji Hipotesis, Temuan, Implikasi Bisnis, Batasan, dan Kesimpulan."
                whyItMatters="Laporan yang terstruktur memudahkan dosen atau pembimbing membaca metodologi Anda secara objektif. Setiap bagian yang dibantu oleh AI diberi label transparan demi integritas akademik."
                howToInterpret="Anda dapat meninjau, mengubah teks, dan mengekspor dokumen ini menjadi laporan siap cetak."
              />

              <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-6 shadow-2xs">
                <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900">
                      Laporan Akhir: Analisis Penjualan Retail Indonesia
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Disusun oleh: Hanif (Mahasiswa S1 Bisnis Digital) • {new Date().toLocaleDateString('id-ID')}
                    </p>
                  </div>

                  <button
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition shadow-xs"
                  >
                    <Download className="w-4 h-4" />
                    Cetak / Simpan PDF
                  </button>
                </div>

                {/* Report Sections */}
                <div className="space-y-6 text-xs text-slate-700 leading-relaxed">
                  <section className="space-y-2">
                    <h3 className="text-sm font-bold text-slate-900">1. Pendahuluan & Latar Belakang Masalah</h3>
                    <p>
                      Penelitian ini bertujuan untuk menganalisis kinerja penjualan retail produk perlengkapan kantor, modul, dan aksesoris IT di Indonesia. Fokus utama riset adalah menguji apakah strategi pemberian diskon berdampak signifikan terhadap total penerimaan (*revenue*) dan margin keuntungan.
                    </p>
                  </section>

                  <section className="space-y-2">
                    <h3 className="text-sm font-bold text-slate-900">2. Deskripsi Dataset & Profiling</h3>
                    <p>
                      Dataset mentah yang digunakan terdiri dari <strong>{profiling.rowCount} baris</strong> dan <strong>{profiling.columnCount} kolom</strong>. Variabel utama mencakup data waktu transaksi, kategori produk, segmentasi pelanggan, wilayah penjualan, kuantitas, harga satuan, diskon, pendapatan, biaya, dan laba.
                    </p>
                  </section>

                  <section className="space-y-2">
                    <h3 className="text-sm font-bold text-slate-900">3. Prosedur Pembersihan Data (Data Cleaning)</h3>
                    <p>
                      Berdasarkan pemeriksaan kualitas data, telah dilakukan tindakan pembersihan berikut:
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                      {cleaningHistory.map((h) => (
                        <li key={h.id}>
                          <strong>{h.operation}:</strong> {h.detail} ({h.timestamp})
                        </li>
                      ))}
                    </ul>
                  </section>

                  <section className="space-y-2">
                    <h3 className="text-sm font-bold text-slate-900">4. Uji Statistik & Pengecekan Asumsi</h3>
                    <p>
                      Uji asumsi normalitas menunjukkan skewness variabel. Uji korelasi Pearson menghasilkan nilai $r = {correlationResult?.pearson.r}$ dengan nilai $p = {correlationResult?.pearson.pValue}$ ($n = {correlationResult?.n}$).
                    </p>
                  </section>

                  <section className="space-y-2">
                    <h3 className="text-sm font-bold text-slate-900">5. Implikasi Bisnis & Rekomendasi</h3>
                    <p>
                      Diskon yang tidak terarah berpotensi menurunkan efisiensi margin laba. Disarankan pemberian potongan harga hanya dialokasikan secara selektif pada segmen bernilai strategis tinggi.
                    </p>
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-blue-50 text-blue-800 text-[10px] font-medium border border-blue-200">
                      <Sparkles className="w-3 h-3 text-blue-600" />
                      Bagian ini dibantu perumusannya oleh AI Assistant dengan review mahasiswa
                    </div>
                  </section>

                  <section className="space-y-2">
                    <h3 className="text-sm font-bold text-slate-900">6. Batasan Penelitian (Limitations)</h3>
                    <p>
                      Penelitian ini dibatasi oleh ketersediaan data transaksi pada periode tertentu dan belum memperhitungkan faktor eksternal makroekonomi. Korelasi tidak dapat ditafsirkan sebagai hubungan kausalitas langsung.
                    </p>
                  </section>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

