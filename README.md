# Portofolio

Enam halaman: `index.html`, `tentang.html`, `karya.html`, `gallery.html`, `kontak.html`, `kritik-saran.html`. Navigasi internal tidak memuat ulang dokumen, baik di server maupun saat dibuka langsung dari disk (`file://`, alamat memakai `#`), jadi musik tidak pernah terputus.

**Transisi halaman**: tirai kolom dua lapis (gelap lalu warna halaman tujuan). Kecepatannya diatur lewat `COVER`, `REVEAL`, `STEP`, dan `INK` di `setupTransitions()` pada `js/app.js`; warna mengikuti `color` tiap halaman di `js/data.js`.

## Cara membuka
1. Buka folder ini di VS Code.
2. Pasang ekstensi **Live Server**, klik kanan `index.html`, pilih *Open with Live Server*.
   (Membuka file langsung dengan klik dua kali juga bisa, tapi Live Server lebih nyaman.)

## Yang kamu ubah
- **Semua teks, proyek, tautan, dan warna halaman**: `js/data.js` (sudah dikomentari).
- **Foto**: atur `home.photo` untuk foto Beranda, `about.photo` untuk foto Tentang, dan daftar `gallery.photos` untuk Gallery di `js/data.js`. Simpan file foto di folder `assets/` (rasio 4:5 paling pas), lalu isi jalur masing-masing.
- **Musik**: pemutar Béntang Sagara tersedia di semua halaman. Judul dan lokasi berkasnya dapat diatur lewat `music.title` dan `music.src` di `js/data.js`; berkas lagu bawaan ada di `music/bentang-sagara.mp3`. Musik dicoba diputar setelah layar pembuka mencapai 100% dan tetap berjalan saat berpindah halaman; posisi juga dipertahankan jika halaman dimuat ulang. Jika browser memblokir autoplay, pengunjung perlu menekan Putar.
- **Layar pembuka**: `loader` di `js/data.js` (matikan dengan `enabled: false`). Setelah mencapai 100%, layar tertahan selama 2 detik sambil musik mulai.
- Tampilan: `css/style.css`. Warna dasar ada di bagian `:root` paling atas.

## Komentar bersama dan admin
Komentar disimpan di Supabase agar semua pengunjung melihat riwayat yang sama. Halaman memuat semua komentar (berhalaman jika jumlahnya banyak) dan memperbarui daftar tiap 30 detik. Admin dapat login di halaman Kritik & Saran dan menghapus komentar satu per satu.

1. Buat proyek Supabase.
2. Buka **SQL Editor**, lalu jalankan isi [`supabase-setup.sql`](./supabase-setup.sql).
3. Di **Authentication > Users**, buat akun admin dengan email dan kata sandi. Salin UUID akun tersebut.
4. Tambahkan akun itu sebagai admin lewat SQL Editor:

   ```sql
   insert into public.feedback_admins (user_id)
   values ('GANTI-DENGAN-UUID-AKUN-ADMIN');
   ```

5. Salin **Project URL** dan **publishable key** dari Supabase ke `feedback.supabase.url` dan `feedback.supabase.publishableKey` di `js/data.js`.
6. Deploy seluruh folder situs, termasuk `js/`, `css/`, `assets/`, `music/`, dan `supabase-setup.sql`.

Publishable key memang digunakan di browser. Jangan pernah menaruh `service_role` key, kata sandi admin, atau secret Supabase di `data.js`. Akses publik dan hak hapus dilindungi oleh kebijakan RLS di SQL. Komentar lokal lama di browser tidak otomatis disalin ke Supabase.

## Tayang di internet
Unggah seluruh folder ke Netlify, Vercel, atau GitHub Pages. Tidak ada proses build.
