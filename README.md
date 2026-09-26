## belajar Frontend Development.

---

# To-Do List App

Aplikasi daftar tugas (To-Do List) sederhana namun lengkap yang dibuat dengan **HTML, CSS, dan JavaScript** murni (tanpa framework).

Project ini cocok untuk pemula yang ingin belajar DOM manipulation, localStorage, event handling, dan membuat UI yang interaktif.

---

## Fitur

- Tambah, edit, dan hapus tugas
- Tandai tugas sebagai selesai
- Prioritas tugas (Tinggi / Sedang / Rendah) dengan warna
- Tanggal tenggat (opsional)
- Deteksi tugas yang sudah lewat tanggal (Overdue)
- Filter: Semua / Belum Selesai / Selesai
- Urutkan berdasarkan Prioritas atau Tanggal
- Dark Mode (tersimpan otomatis)
- Data tersimpan di localStorage (tidak hilang saat di-refresh)
- Konfirmasi sebelum menghapus
- Tampilan responsif (HP & Desktop)
- Animasi halus

---

## Tech Stack

- HTML5
- CSS3 (Custom Properties / CSS Variables)
- JavaScript (Vanilla)
- localStorage

---

## Cara Menjalankan

1. Clone repository ini:
   ```bash
   git clone https://github.com/SulthanAfif/todo-list-app.git

---

## Cara Menggunakan

- Ketik nama tugas di kolom input
- Pilih Prioritas (Rendah / Sedang / Tinggi)
- Pilih Tanggal jika diperlukan (opsional)
- Klik tombol + Tambah Tugas atau tekan Enter
- Centang kotak untuk menandai selesai
- Klik ikon ✎ atau double-click teks untuk mengedit
- Klik × untuk menghapus (akan muncul konfirmasi)
- Gunakan filter dan pilihan urutan di atas daftar tugas
- Klik ikon bulan/matahari untuk Dark Mode

---

## Struktur File

```
todo-list-app/
├── index.html      # Struktur halaman
├── style.css       # Tampilan & dark mode
├── script.js       # Logika aplikasi
└── README.md       # Dokumentasi
```

---

## Pengembangan Selanjutnya (Ide)

- Drag & drop untuk mengubah urutan
- Kategori / label tugas
- Notifikasi pengingat
- Export / Import data
- Progress bar penyelesaian