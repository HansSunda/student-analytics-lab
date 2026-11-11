# Panduan Konfigurasi Supabase - Student Analytics Lab

Skema basis data dan kebijakan keamanan (Row Level Security) telah disiapkan di file:
`supabase/migrations/20240101000000_initial_schema.sql`

## Langkah Memasukkan Skema ke Supabase:

1. **Buka Dashboard Supabase**:
   - Masuk ke [https://app.supabase.com](https://app.supabase.com).
   - Buat proyek baru atau pilih proyek yang sudah ada.

2. **Jalankan SQL Migration**:
   - Masuk ke menu **SQL Editor** di sidebar kiri.
   - Klik **New Query**.
   - Salin seluruh isi file `supabase/migrations/20240101000000_initial_schema.sql` dan tempelkan (*paste*) ke dalam editor.
   - Klik tombol **Run** (Ctrl+Enter / Cmd+Enter).
   - Pastikan muncul pesan `Success: No rows returned`.

3. **Verifikasi Storage Bucket**:
   - Skema secara otomatis membuat storage bucket bernama `datasets` dengan mode Private dan batas ukuran file 50 MB.
   - Anda dapat memeriksa di menu **Storage** -> **Buckets** bahwa bucket `datasets` sudah aktif.

4. **Ambil Kredensial API untuk Frontend**:
   - Masuk ke **Project Settings** -> **API**.
   - Salin **Project URL** dan **anon / public key**.
   - Buat file `.env.local` di folder utama proyek (lihat panduan di `.env.example`).
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

