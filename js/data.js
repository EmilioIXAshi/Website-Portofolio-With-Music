/* =====================================================================
   DATA PERSONAL, ubah semuanya di file ini saja.
   Semua teks di bawah hanyalah contoh. Ganti dengan isi milikmu.
   Simpan file (Ctrl+S), lalu refresh browser.
   ===================================================================== */
window.SITE = {
  name: "Trian Emilio Izani ",
  role: "Pengembang web",
  location: "Bogor Kota Hujan",
  timezone: "Asia/Jakarta",          // dipakai untuk jam di sisi kiri
  email: "emilkocak52@gmail.com",
  music: {
    title: "The Panturas — Béntang Sagara",
    src: "music/bentang-sagara.mp3"
  },
  cv: "",                            // isi "assets/cv.pdf" kalau ada, kosongkan kalau tidak
  status: { open: true, text: "Terbuka untuk proyek baru" },
  footerNote: "Dibuat dengan jari jari dan doa ortu",

  /* Layar pembuka. Muncul sekali per sesi browser. */
  loader: {
    enabled: true,
    everyVisit: false,               // true = muncul setiap halaman Beranda dibuka
    duration: 2600,                  // milidetik
    messages: ["Minum Teh Pucuk", "Merapikan layout", "Mengecek warna", "Hampir selesai"]
  },

  /* Halaman. `color` = warna latar judul halaman, `on` = warna teks di atasnya. */
  pages: [
    { id: "home", href: "index.html", label: "Beranda",
      color: "#ff5a36", on: "#0e1a2b",
      hint: "Kembali ke halaman pembuka" },
    { id: "about", href: "tentang.html", label: "Tentang",
      title: ["Tentang", "saya."],
      sub: "Bagian yang tidak muat di CV.",
      color: "#2fbf71", on: "#0e1a2b",
      hint: "Latar belakang, perjalanan, dan alat yang saya pakai" },
    { id: "work", href: "karya.html", label: "Karya",
      title: ["Yang sudah", "saya buat."],
      sub: "Setiap proyek saya tulis dari masalahnya dulu, baru hasilnya.",
      color: "#1f4fff", on: "#e8ecef",
      hint: "Proyek lengkap dengan masalah dan hasilnya" },
    { id: "contact", href: "kontak.html", label: "Kontak",
      title: ["Mari", "bicara."],
      sub: "Gmail saya baca setiap pagi. Balasan biasanya datang dalam sehari.",
      color: "#ffd23f", on: "#0e1a2b",
      hint: "Gmail, media sosial, dan formulir singkat" },
    { id: "feedback", href: "kritik-saran.html", label: "Kritik & Saran",
      title: ["Ketik saja,", "saya baca."],
      sub: "Kritik yang tajam lebih berguna daripada pujian basa-basi. Pesanmu langsung tampil di bawah.",
      color: "#ff8fb1", on: "#0e1a2b",
      hint: "Tulis pesanmu dan lihat langsung muncul" }
  ],

  /* Halaman Karya sementara ditahan. Setelah `seconds` detik pengunjung otomatis
     dikembalikan ke halaman sebelumnya. Ganti enabled ke false untuk membuka Karya. */
  workComingSoon: {
    enabled: true,
    seconds: 4,
    title: ["Coming", "soon."],
    note: "Halaman karya sedang saya rapikan."
  },

  home: {
    photo: "assets/lol.jpeg",        // foto Beranda (rasio 4:5 paling pas)
    headline: ["Halo, saya", "Emilio lio alileo"],
    intro: "Saya membuat situs ini untuk menulis tentang hal-hal yang saya buat, dan hal-hal yang saya pelajari.",
    caption: "Kota Bogor, 2026",
    marquee: [
      "Sedang belajar database",
      "Sedang ngulik gitar",
      "Sedang mencari kopi susu paling enak di kota",
      "Hampir tertidur"
    ],
    pathsTitle: "Mau lihat apa dulu?"
  },

  about: {
    photo: "assets/okepa.jpg",        // foto Tentang; bisa memakai file yang berbeda
    paragraphs: [
      "Saya mulai membuat web waktu iseng untuk menambah skill saya, dan hingga saat ini, saya tidak pernah berhenti.",
      "Yang saya suka dari pekerjaan ini adalah momen ketika saya bisa menyelesaikan masalah orang lain dengan kode yang saya tulis. Itu membuat saya merasa berguna.",
      "Di luar layar, saya memotret jalanan dan menulis musik untuk menambah karya"
    ],
    facts: [
      { k: "Berbasis di", v: "Bogor Kota Hujan" },
      { k: "Sekarang", v: "Siswa SMK" },
      { k: "Bahasa", v: "Indonesia, English" },
      { k: "Paling cepat dihubungi lewat", v: "Gmail" }
    ],
    timeline: [
      { year: "2026", title: "SMKS Wikrama Bogor",
        text: "Siswa semester 1 jurusan PPLG" },
      { year: "2023 - 2026", title: "SMPN 1 Ciawi",
        text: "Saat terjadinya character development" },
      { year: "2017 - 2023", title: "SDN Harjasari 1",
        text: "Waktu merekam memori indah masa kecil" }
    ],
    skills: [
      { group: "Dipakai setiap hari", items: ["HTML", "CSS", "JavaScript", "Git", "Figma"] },
      { group: "Sedang dipelajari", items: ["GSAP", "TypeScript", "Aksesibilitas web"] },
      { group: "Di luar kode", items: ["Fotografi jalanan", "Main gitar", "Menulis musik"] }
    ]
  },

  /* Proyek. Tambah/hapus blok sesuka hati. `image` boleh dikosongkan. */
  projects: [
    { title: "Kas Warga", year: "2026", role: "Desain dan kode sendiri",
      headline: "Iuran RT tanpa buku tulis.",
      summary: "Pencatatan iuran dan pengeluaran RT dari ponsel.",
      problem: "Catatan iuran RT masih di buku tulis, sering selisih, dan tidak ada yang bisa mengeceknya selain bendahara.",
      did: "Membuat aplikasi web ringan: input iuran dalam dua ketukan, rekap bulanan otomatis, dan halaman baca-saja untuk warga.",
      result: "Bendahara menutup buku bulanan dalam sekitar sepuluh menit, dan warga bisa mengecek sendiri.",
      tags: ["Web app", "JavaScript"], image: "",
      links: [{ label: "Lihat situs", href: "" }, { label: "Kode di GitHub", href: "" }] },

    { title: "Peta Warung", year: "2025", role: "Desain dan kode sendiri",
      headline: "Makan siang murah, dekat kampus.",
      summary: "Peta warung makan sekitar kampus dengan harga rata-rata.",
      problem: "Mahasiswa baru selalu bingung makan di mana, dan info harga hanya beredar dari mulut ke mulut.",
      did: "Mengumpulkan 60 warung, memetakannya, dan menambahkan penyaring berdasarkan harga dan jam buka.",
      result: "Dipakai angkatan baru saat masa orientasi dan terus ditambah oleh teman-teman.",
      tags: ["Peta", "JavaScript"], image: "",
      links: [{ label: "Lihat situs", href: "" }] },

    { title: "Jadwal Piket", year: "2025", role: "Kode, dengan satu teman desain",
      headline: "Piket kos, tanpa debat.",
      summary: "Bot yang membagi dan mengingatkan jadwal piket.",
      problem: "Jadwal piket kos selalu jadi debat karena tidak ada yang ingat giliran siapa.",
      did: "Membuat bot Telegram yang membagi giliran adil dan mengingatkan pagi hari.",
      result: "Debat soal piket berhenti. Bot tetap jalan sampai sekarang.",
      tags: ["Bot", "Node.js"], image: "",
      links: [{ label: "Kode di GitHub", href: "" }] },

    { title: "Catatan Kopi", year: "2024", role: "Desain, kode, dan tulisan",
      headline: "Resep seduh yang bisa diulang.",
      summary: "Blog pribadi tentang resep seduh dan hasil cicipnya.",
      problem: "Resep seduh yang berhasil sering lupa dicatat, jadi tidak pernah bisa diulang.",
      did: "Membuat situs statis kecil dengan format catatan tetap: biji, gilingan, rasio, waktu, rasa.",
      result: "Sudah lebih dari seratus catatan, dan resep favorit saya akhirnya bisa saya ulang.",
      tags: ["Situs statis", "Menulis"], image: "",
      links: [{ label: "Baca catatan", href: "" }] }
  ],

  contact: {
    note: "Untuk proyek, kolaborasi, atau sekadar berkenalan.",
    socials: [
      { name: "GitHub", handle: "github.com/EmilioIXAshi", href: "https://github.com/EmilioIXAshi" },
      { name: "LinkedIn", handle: "Coming Soon", href: "#", comingSoon: "LinkedIn — Coming Soon" },
      { name: "Instagram", handle: "@emilioixa", href: "https://instagram.com/emilioixa" }
    ]
  },

  /* Atur URL dan publishable key Supabase di sini untuk menyimpan masukan bersama. */
  feedback: {
    supabase: {
      url: "jtlkqieeeqzxbsmuomzh.supabase.co",
      publishableKey: "sb_publishable_qLjAMCZOXgp75wP9W_PA6w_77O7J5TN"
    },
    maxLength: 400,
    cooldownSeconds: 20
  }
};
