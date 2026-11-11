'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Plus,
  FolderKanban,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  BarChart,
  Search,
  Filter,
  AlertCircle
} from 'lucide-react';
import { TeachMeCard } from '@/components/workspace/TeachMeCard';

interface ProjectItem {
  id: string;
  name: string;
  description: string;
  datasetName: string;
  rowCount: number;
  status: 'active' | 'completed';
  updatedAt: string;
  progressPercent: number;
}

export default function DashboardPage() {
  const [projects, setProjects] = useState<ProjectItem[]>([
    {
      id: 'demo',
      name: 'Analisis Penjualan Retail Indonesia',
      description: 'Eksplorasi hubungan diskon dengan pendapatan serta perbandingan kategori produk untuk tugas Bisnis Digital.',
      datasetName: 'retail_sales_2024.csv',
      rowCount: 255,
      status: 'active',
      updatedAt: 'Baru saja',
      progressPercent: 65,
    },
    {
      id: 'proj-2',
      name: 'Studi Kepuasan Pelanggan E-Commerce',
      description: 'Uji hipotesis tingkat kepuasan sebelum dan sesudah pembaruan antarmuka checkout.',
      datasetName: 'customer_csat_survey.xlsx',
      rowCount: 450,
      status: 'completed',
      updatedAt: '2 hari lalu',
      progressPercent: 100,
    },
    {
      id: 'proj-3',
      name: 'Dataset Skripsi: Analisis Rasio Keuangan UMKM',
      description: 'Regresi linear berganda faktor modal kerja dan leverage terhadap laba bersih.',
      datasetName: 'umkm_financial_data.csv',
      rowCount: 120,
      status: 'active',
      updatedAt: '5 hari lalu',
      progressPercent: 40,
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    const newProj: ProjectItem = {
      id: `proj-${Date.now()}`,
      name: newProjectName.trim(),
      description: newProjectDesc.trim() || 'Proyek analisis data baru.',
      datasetName: 'Menunggu upload dataset',
      rowCount: 0,
      status: 'active',
      updatedAt: 'Baru saja',
      progressPercent: 10,
    };

    setProjects([newProj, ...projects]);
    setNewProjectName('');
    setNewProjectDesc('');
    setIsModalOpen(false);
  };

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header & Greeting */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 block mb-1">
            Student Analytics Lab Workspace
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Selamat Datang, Hanif 👋
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Siap menganalisis dataset untuk tugas kuliah, studi kasus, atau riset skripsi Anda hari ini?
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/project/demo"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium text-sm transition border border-blue-200"
          >
            <Sparkles className="w-4 h-4 text-blue-600" />
            Buka Proyek Demo
          </Link>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 font-medium text-sm shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            + Buat Proyek Baru
          </button>
        </div>
      </div>

      {/* Educational Guide Card */}
      <TeachMeCard
        title="Alur Metodologi Ilmiah"
        concept="Analisis data yang baik bukan langsung melompat ke grafik atau meminta kesimpulan AI, melainkan diawali dengan profiling struktur, menguji kebersihan data, memeriksa asumsi uji, lalu mengeksekusi komputasi numerik pasti."
        whyItMatters="Dosen pembimbing dan reviewer tugas selalu menilai validitas langkah metodologis Anda: apakah outlier sudah ditangani, apakah asumsi normalitas terpenuhi, dan apakah kesimpulan tidak melompati korelasi menjadi sebab-akibat."
        howToInterpret="Gunakan tombol tab navigasi di dalam proyek untuk memeriksa kesehatan dataset Anda langkah demi langkah secara runtut."
        pitfallWarning="Jangan pernah membersihkan data dengan menghapus baris tanpa alasan ilmiah yang tercatat di log pembersihan!"
      />

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2 text-xs font-medium">
            <span>Total Proyek</span>
            <FolderKanban className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{projects.length}</div>
          <span className="text-[11px] text-slate-500 mt-1 block">Tersimpan aman di ruang kerja</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2 text-xs font-medium">
            <span>Dataset Diunggah</span>
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {projects.filter((p) => p.rowCount > 0).length}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Format CSV & XLSX terindeks</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2 text-xs font-medium">
            <span>Analisis Selesai</span>
            <CheckCircle2 className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {projects.filter((p) => p.status === 'completed').length}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Uji hipotesis & regresi valid</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2 text-xs font-medium">
            <span>Proyek Aktif / Berjalan</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {projects.filter((p) => p.status === 'active').length}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Siap dilanjutkan kapan saja</span>
        </div>
      </div>

      {/* Projects List Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Proyek Analisis Anda</h2>
            <p className="text-xs text-slate-500">Kelola dan lanjutkan eksplorasi dataset tugas kuliah Anda</p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari proyek..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
            />
          </div>
        </div>

        {filteredProjects.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16 px-4">
            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mx-auto mb-4 border border-blue-100">
              <FolderKanban className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Belum ada proyek yang cocok</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6">
              Mulai analisis dataset pertama Anda sekarang. Unggah data CSV atau Excel untuk mendapatkan profiling instan.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white font-medium text-xs hover:bg-blue-700 transition"
            >
              <Plus className="w-4 h-4" />
              + Buat Proyek Pertama
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredProjects.map((proj) => (
              <div
                key={proj.id}
                className="p-5 hover:bg-slate-50/80 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2.5">
                    <Link
                      href={`/project/${proj.id}`}
                      className="font-semibold text-slate-900 hover:text-blue-600 transition text-base"
                    >
                      {proj.name}
                    </Link>
                    <span
                      className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${
                        proj.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {proj.status === 'completed' ? 'Selesai' : 'Aktif'}
                    </span>
                    {proj.id === 'demo' && (
                      <span className="text-[10px] font-semibold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        Demo Data
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2">{proj.description}</p>
                  <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 pt-1">
                    <span className="flex items-center gap-1">
                      <FileSpreadsheet className="w-3.5 h-3.5 text-slate-400" />
                      {proj.datasetName}
                    </span>
                    {proj.rowCount > 0 && (
                      <span>{proj.rowCount.toLocaleString('id-ID')} baris data</span>
                    )}
                    <span>Diperbarui: {proj.updatedAt}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="w-28 text-right hidden sm:block">
                    <div className="text-[11px] font-medium text-slate-600 mb-1">
                      Kemajuan: {proj.progressPercent}%
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-600 h-full rounded-full"
                        style={{ width: `${proj.progressPercent}%` }}
                      />
                    </div>
                  </div>

                  <Link
                    href={`/project/${proj.id}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 text-xs font-semibold transition"
                  >
                    Buka Workspace
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Buat Proyek Baru */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 animate-fade-in">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Buat Proyek Analisis Baru</h3>
            <p className="text-xs text-slate-500 mb-4">
              Tentukan nama tugas atau topik riset Anda sebelum mengunggah dataset.
            </p>

            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Proyek / Topik Analisis *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Analisis Churn Pelanggan Telko"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Deskripsi / Tujuan Tugas (Opsional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Contoh: Mengetahui faktor yang paling mempengaruhi kepuasan pelanggan..."
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-xs"
                >
                  Buat Proyek
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

