# Student Analytics Lab 🎓📊

> **SaaS Workspace & Asisten Pembelajaran Analisis Data untuk Mahasiswa & Peneliti Akademis**

Aplikasi web modern yang memandu mahasiswa dari **Dataset Mentah → Pemahaman Data → Pembersihan Terkontrol → EDA → Uji Asumsi & Statistik → Visualisasi → Insight Bisnis → Laporan Akademis**.

---

## 💡 Prinsip Utama Produk
> **"Computation by code. Explanation by AI."**
- **Kalkulasi Numerik & Statistik**: Dihitung secara deterministik menggunakan kode (Python / SciPy / Statsmodels / TypeScript Profiler).
- **Peran AI**: Menjelaskan arti angka, merekomendasikan arah analisis, menerjemahkan ke implikasi bisnis, dan menyusun draf laporan.
- **Kausalitas vs Asosiasi**: Sistem secara eksplisit membedakan korelasi dari kausalitas semu demi integritas ilmiah mahasiswa.
- **Mode Ajari Saya**: Menjelaskan konsep metodologi di setiap tahapan analisis agar mahasiswa memahami prosesnya dan bukan sekadar menerima hasil instan.

---

## 🛠️ Stack Teknologi

- **Frontend**: Next.js 14 (App Router), React, TypeScript (Strict Mode), Tailwind CSS, Lucide Icons
- **Backend Database**: Supabase PostgreSQL + Row Level Security (RLS) untuk multi-tenant user isolation
- **Storage**: Supabase Storage (`datasets` private bucket)
- **Komputasi Analitik**: Engine Profiling deterministik & Uji Statistik Hipotesis (Pearson, Normalitas, Regresi OLS, IQR Outliers)

---

## 🚀 Panduan Setup Cepat

### 1. Masukkan Skema ke Supabase
1. Buka dashboard proyek Anda di [Supabase Console](https://app.supabase.com).
2. Masuk ke menu **SQL Editor**.
3. Salin dan jalankan seluruh isi file migrasi:
   [`supabase/migrations/20240101000000_initial_schema.sql`](file:///c:/Users/Hanif/OneDrive/Documents/AI_DATA_ANALYTICS_TOOLS/supabase/migrations/20240101000000_initial_schema.sql)
4. Skema akan membuat seluruh tabel (`profiles`, `projects`, `datasets`, `dataset_columns`, `cleaning_operations`, `analyses`, `visualizations`, `reports`), trigger profil otomatis, storage bucket `datasets`, dan kebijakan RLS.

### 2. Konfigurasi Environment Variable
Salin file `.env.example` menjadi `.env.local`:
```bash
cp .env.example .env.local
```
Isi dengan kredensial Supabase Anda:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Jalankan Aplikasi
Jalankan dev server:
```bash
npm run dev
```
Buka browser di `http://localhost:3000`.

---

## 📂 Struktur Direktori

```text
├── src/
│   ├── app/
│   │   ├── (auth)/             # Halaman Login & Registrasi Mahasiswa
│   │   ├── (dashboard)/        # Dashboard Siswa, Quick Stats, & Empty States
│   │   ├── (workspace)/        # Project Workspace Studio (8 Tahapan Metodologi)
│   │   ├── globals.css         # Styling global
│   │   ├── layout.tsx          # Root layout & Navbar
│   │   └── page.tsx            # Halaman Pengenalan & Hero
│   ├── components/
│   │   ├── layout/Navbar.tsx   # Header & Indikator Status Backend
│   │   └── workspace/          # Mode Ajari Saya Context & Card Edukasi
│   ├── lib/
│   │   ├── data/demo-data.ts   # Dataset Retail Indonesia (Realistis dengan Anomali)
│   │   ├── engine/profiler.ts  # Mesin Profiling & Cek Kualitas Deterministik
│   │   ├── engine/statistics.ts# Uji Korelasi, Normalitas, & Regresi
│   │   └── supabase/           # Client Supabase Browser & Server
│   └── types/                  # Definisi TypeScript Lengkap
├── supabase/
│   ├── migrations/             # Skema SQL Lengkap + RLS Policy
│   └── README.md               # Panduan Langkah demi Langkah Supabase
└── package.json
```

