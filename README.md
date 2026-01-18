# ShortIT - URL Shortener

Platform pemendek URL modern dengan analitik lengkap dan antarmuka yang intuitif. Dibangun menggunakan Next.js, TypeScript, dan Tailwind CSS.

## 🚀 Fitur Utama

### **Pemendek URL Cepat**
- Konversi URL panjang menjadi link pendek yang mudah dibagikan
- Redireksi instan tanpa jeda
- Custom short code (opsional)

### **Analitik & Statistik**
- Dashboard interaktif untuk memantau performa link
- Tracking jumlah klik, lokasi pengunjung, dan perangkat
- Grafik real-time untuk visualisasi data

### **Manajemen Pengguna**
- Sistem registrasi dan login yang aman
- Profil pengguna dengan pengaturan personal
- Session management dengan token JWT

### **QR Code Generator**
- Generate QR code otomatis untuk setiap URL yang dipendekkan
- Download QR code dalam format PNG

### **Keamanan**
- Validasi URL otomatis
- Deteksi link berbahaya
- HTTPS enforcement

### **Responsive Design**
- Tampilan optimal di desktop, tablet, dan mobile
- UI modern dengan Tailwind CSS
- Animasi dan transisi yang halus

## 🛠️ Teknologi yang Digunakan

- **Frontend**: Next.js 16.1.3, React 19.2.3
- **Styling**: Tailwind CSS 4
- **Icons**: Lucide React
- **QR Code**: qrcode.js
- **Language**: TypeScript
- **Development**: ESLint, PostCSS

## 📋 Persyaratan Sistem

Sebelum memulai, pastikan sistem Anda memiliki:

- **Node.js** versi 18.0 atau lebih tinggi
- **npm** (biasanya sudah termasuk dengan Node.js) atau **yarn**/**pnpm**
- **Git** (untuk clone repository)

## 🚀 Cara Setup & Menjalankan

### 1. Clone Repository

```bash
git clone <repository-url>
cd url-shortener
```

### 2. Install Dependencies

```bash
# Menggunakan npm (rekomendasi)
npm install

# Atau menggunakan yarn
yarn install

# Atau menggunakan pnpm
pnpm install

# Atau menggunakan bun
bun install
```

### 3. Jalankan Development Server

```bash
# Menggunakan npm
npm run dev

# Atau menggunakan yarn
yarn dev

# Atau menggunakan pnpm
pnpm dev

# Atau menggunakan bun
bun dev
```

### 4. Buka Aplikasi

Buka browser Anda dan navigasi ke:
```
http://localhost:3000
```

Aplikasi akan otomatis reload saat Anda melakukan perubahan pada kode.

## 📁 Struktur Proyek

```
url-shortener/
├── app/                          # Next.js App Router
│   ├── components/              # Komponen reusable
│   │   └── Header.tsx          # Header dengan user dropdown
│   ├── dashboard/              # Halaman dashboard
│   │   └── [shortCode]/        # Detail analytics URL
│   ├── analytics/              # Halaman analitik
│   ├── login/                  # Halaman login
│   ├── register/               # Halaman registrasi
│   ├── profile/                # Halaman profil user
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Landing page
│   └── globals.css             # Global styles
├── public/                     # Static assets
├── package.json                # Dependencies & scripts
├── tsconfig.json              # TypeScript configuration
├── next.config.ts             # Next.js configuration
├── tailwind.config.js         # Tailwind configuration
└── README.md                  # Dokumentasi proyek
```

## 🎯 Cara Penggunaan

### 1. Registrasi Akun
- Kunjungi halaman registrasi
- Isi form dengan email dan password
- Verifikasi akun (jika diperlukan)

### 2. Login
- Masuk dengan email dan password yang terdaftar
- Anda akan diarahkan ke dashboard

### 3. Memendekkan URL
- Pada dashboard, klik "Create New URL"
- Masukkan URL panjang yang ingin dipendekkan
- (Opsional) Masukkan custom short code
- Klik "Singkatkan"

### 4. Melihat Analitik
- Pada dashboard, klik URL yang ingin dilihat analitiknya
- Lihat statistik klik, lokasi, dan perangkat pengunjung
- Download QR code jika diperlukan

### 5. Manajemen Profil
- Klik avatar user di header
- Pilih "Profile" untuk mengatur profil
- Pilih "Analytics" untuk melihat statistik keseluruhan

## 🔧 Build untuk Production

```bash
# Build aplikasi
npm run build

# Jalankan production server
npm start
```

## 🐛 Development Commands

```bash
# Jalankan development server
npm run dev

# Build untuk production
npm run build

# Start production server
npm start

# Lint kode
npm run lint
```

## 🎨 Customization

### Mengubah Warna Tema
Edit file `tailwind.config.js` untuk mengubah warna tema utama:

```javascript
theme: {
  extend: {
    colors: {
      primary: '#2563eb', // Warna biru utama
      // Tambahkan warna custom lainnya
    }
  }
}
```

### Mengubah Logo dan Branding
- Ganti logo di `app/page.tsx` dan `app/components/Header.tsx`
- Update nama brand di seluruh aplikasi

## 🔒 Environment Variables

Buat file `.env.local` di root proyek:

```env
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
DATABASE_URL=your-database-url
```

## 📝 Catatan Development

- Proyek menggunakan Next.js App Router
- State management menggunakan React hooks
- Styling dengan Tailwind CSS utility classes
- TypeScript untuk type safety
- Responsive design untuk mobile-first approach

## 🤝 Kontribusi

1. Fork proyek ini
2. Buat branch fitur baru (`git checkout -b feature/AmazingFeature`)
3. Commit perubahan Anda (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buka Pull Request

## 📄 Lisensi

Proyek ini dilisensikan under MIT License - lihat file [LICENSE](LICENSE) untuk detailnya.

## 🆘 Bantuan & Support

Jika Anda mengalami masalah atau memiliki pertanyaan:

1. Cek [Issues](../../issues) untuk masalah yang sudah dilaporkan
2. Buat issue baru jika masalah Anda belum ada
3. Join diskusi untuk bertanya atau berbagi ide

## 🌟 Terima Kasih

Terima kasih telah menggunakan ShortIT! Jika Anda menyukai proyek ini, jangan lupa untuk memberikan ⭐ pada repository ini.
