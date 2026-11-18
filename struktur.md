webdesign_namaTim_technoversary_vol.II/
├── public/
│   ├── favicon.svg
│   └── images/
│       ├── hero/                        # Ilustrasi lanskap utama (format .webp)
│       └── alam/                        # Foto lokal objek alam (gunung-kerinci.webp, danau-toba.webp, dll.)
├── src/
│   ├── assets/                          # Aset vektor internal yang di-bundle Vite
│   │   ├── logo.svg
│   │   └── topo-contour.svg             # Pola garis kontur topografi orisinal (non-template)
│   ├── data/
│   │   └── alam_indonesia.json          # File JSON utama (metadata, ringkasan_nasional, data_terperinci, direktori)
│   ├── utils/                           # Fungsi pengolah data murni (tanpa kode tampilan UI)
│   │   ├── coordinateParser.js          # Konversi koordinat DMS ("04°03'48\"S") & desimal ("8.108°S") ke [lat, lng]
│   │   ├── statusParser.js              # Deteksi otomatis Level I/II/III PVMBG & Danau Prioritas Nasional
│   │   └── nullSafeFormatter.js         # Penanganan aman atribut bernilai null agar UI tidak error/kosong
│   ├── services/                        # Lapisan akses dan penggabungan data JSON
│   │   └── alamService.js               # Mengelola query data_terperinci (54 objek) & direktori_wilayah
│   ├── hooks/                           # Custom React Hooks untuk logika interaktif
│   │   ├── useAlamFilter.js             # Filter instan multi-kriteria (Kategori, Pulau, Status, Pencarian)
│   │   └── useDocumentTitle.js          # Mengubah judul tab browser secara otomatis tiap pindah halaman
│   ├── components/                      # Komponen UI buatan sendiri (100% custom Tailwind CSS)
│   │   ├── layout/                      # Kerangka global di semua halaman
│   │   │   ├── MainLayout.jsx           # Pembungkus Navbar + konten halaman + Footer
│   │   │   ├── Navbar.jsx               # Navigasi 4 halaman wajib + menu responsif mobile
│   │   │   └── Footer.jsx               # Kredit sumber data (PVMBG/BRIN/Perpres 60/2021) & info tim
│   │   ├── ui/                          # Komponen kecil yang dipakai berulang kali
│   │   │   ├── StatusBadge.jsx          # Badge warna hijau/kuning/merah sesuai status gunung/danau
│   │   │   ├── FallbackCover.jsx        # Ilustrasi vektor topografi otomatis saat gambar_gunung bernilai null
│   │   │   ├── SearchBar.jsx            # Kolom pencarian cepat dengan tombol reset
│   │   │   └── EmptyState.jsx           # Tampilan informatif jika hasil pencarian tidak ditemukan
│   │   ├── home/                        # Bagian khusus Halaman Home
│   │   │   ├── HeroSection.jsx          # Headline, quick search bar, & latar belakang topografi
│   │   │   ├── NationalStatsGrid.jsx    # Kartu statistik dari ringkasan_nasional (127 gunung aktif, 15 danau prioritas)
│   │   │   ├── NusantaraMap.jsx         # Peta interaktif Leaflet berbasis koordinat_geografis
│   │   │   └── HighlightCards.jsx       # Sorotan destinasi utama dari data_terperinci
│   │   ├── explore/                     # Bagian khusus Halaman Konten / Galeri
│   │   │   ├── FilterControls.jsx       # Tab Kategori (Gunung/Bukit/Danau), Pulau, & Level Status
│   │   │   ├── AlamCard.jsx             # Kartu katalog untuk 54 objek pada data_terperinci
│   │   │   ├── DetailModal.jsx          # Modal/Drawer detail 12 atribut (dibagi 4 tab agar rapi)
│   │   │   └── RegionalDirectory.jsx    # Daftar indeks ratusan nama per pulau dari direktori_wilayah_indonesia
│   │   ├── about/                       # Bagian khusus Halaman About
│   │   │   ├── EdukasiStatus.jsx        # Penjelasan Level I-IV PVMBG & Danau Prioritas Nasional
│   │   │   └── TeamGrid.jsx             # Profil anggota tim (maks. 3 orang sesuai ketentuan peserta)
│   │   └── contact/                     # Bagian khusus Halaman Contact
│   │       ├── ContributionForm.jsx     # Formulir usulan data baru / laporan kondisi lingkungan
│   │       └── LeaveNoTraceList.jsx     # Checklist interaktif etika pendakian & wisata alam
│   ├── pages/                           # 4 Halaman Wajib sesuai Ketentuan Guidebook
│   │   ├── HomePage.jsx                 # 1. Halaman Home (/)
│   │   ├── AboutPage.jsx                # 2. Halaman About (/tentang)
│   │   ├── ExplorePage.jsx              # 3. Halaman Konten / Artikel / Galeri (/jelajah)
│   │   └── ContactPage.jsx              # 4. Halaman Contact (/kontak)
│   ├── router/
│   │   └── AppRouter.jsx                # Pengaturan rute URL antar 4 halaman + fallback 404
│   ├── App.jsx                          # Komponen akar aplikasi
│   ├── main.jsx                         # Entry point Vite
│   └── index.css                        # Import Tailwind CSS, Google Fonts, & styling kustom
├── .gitignore
├── index.html                           # Dokumen HTML utama & pemuatan font
├── package.json
├── vite.config.js
└── README.md                            # Dokumentasi wajib lomba (Judul, Deskripsi, Instalasi, Nama Tim)