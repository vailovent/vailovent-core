<div align="center">

# 🍽️ VAILOVENT
### Smart Restaurant Digital Ordering & IoT Soundbox Payment Gateway System

[![Vercel Deployment](https://img.shields.io/badge/Frontend-Vercel-black?style=for-the-badge&logo=vercel)](https://vailovent.vercel.app/)
[![Backend API](https://img.shields.io/badge/Backend-Express.js-000000?style=for-the-badge&logo=express)](https://backend-vailovent.vercel.app/)
[![Database](https://img.shields.io/badge/Database-MongoDB%20Atlas-47A248?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![Storage](https://img.shields.io/badge/Storage-AWS%20S3-569A31?style=for-the-badge&logo=amazons3)](https://aws.amazon.com/s3/)
[![Payment Gateway](https://img.shields.io/badge/Payment-Midtrans%20Snap-002B49?style=for-the-badge)](https://midtrans.com/)
[![IoT](https://img.shields.io/badge/Hardware-IoT%20Soundbox-FF6F00?style=for-the-badge&logo=espressif)](https://www.espressif.com/)

<p align="center">
  <b>Sistem Pemesanan Restoran Berbasis Web Pintar yang Terintegrasi Langsung dengan Payment Gateway Midtrans dan Speaker Suara Notifikasi IoT Soundbox Payment.</b>
</p>

[🌐 Kunjungi Website](https://vailovent.vercel.app/) • [📡 Backend API](https://backend-vailovent.vercel.app/) • [📖 Dokumentasi Fitur](#-fitur-utama-sistem)

---

</div>

## 📌 Tentang Proyek

**Vailovent** adalah platform pemesanan makanan dan minuman digital untuk restoran modern yang memungkinkan pelanggan memesan menu langsung dari meja mereka secara mandiri (*Self-Service Table Ordering*). 

Sistem ini terhubung secara *real-time* ke **Payment Gateway Midtrans** untuk pembayaran digital non-tunai (QRIS, GoPay, ShopeePay, Virtual Account Bank) dan secara otomatis memicu suara pada perangkat keras **IoT Soundbox** di kasir serta notifikasi langsung ke panel dapur tanpa perlu *refresh* halaman.

---

## ✨ Fitur Utama Sistem

### 🛒 1. Pelanggan & Pemesanan Mandiri (*Guest Ordering*)
- **Pemesanan Cepat Tanpa Wajib Akun:** Pelanggan cukup memilih menu, menentukan nomor meja, dan melakukan pembayaran secara instan.
- **Katalog Menu Responsif (Mobile 2-Column Grid):** Tampilan katalog modern dengan badge ketersediaan stok, deskripsi lengkap, dan penyesuaian porsi di keranjang.
- **Penyimpanan Riwayat Lokal (*Guest Order History*):** Transaksi dan struk digital tersimpan otomatis di browser pelanggan (`localStorage`), sehingga data tidak hilang saat tab ditutup atau HP di-restart.
- **Live Active Order Tracker:** Banner pintar di beranda yang menampilkan progres tahapan memasak dapur secara langsung (*live*).
- **Lacak Pesanan Antar-Perangkat:** Fitur pencarian cepat pesanan menggunakan *Order ID*.

### 💳 2. Payment Gateway & Notifikasi Otomatis
- **Integrasi Midtrans Snap & Webhook Callback:** Mendukung pembayaran QRIS otomatis, E-Wallet, dan Transfer Bank.
- **🔊 IoT Soundbox Speaker Alert:** Server backend langsung mengirim data transaksi ke modul IoT Soundbox untuk menyuarakan notifikasi pembayaran sukses (misal: *"Pembayaran QRIS Meja 5 sebesar Rp 75.000 Berhasil"*).
- **📧 Email Invoice Digital:** Otomatis mengirimkan struk bukti pembayaran resmi ke email pelanggan via Nodemailer.
- **🔄 Rekonsiliasi & Sinkronisasi Batch:** Fitur sinkronisasi massal seluruh transaksi pending dengan server Midtrans API secara berkala atau melalui 1-klik tombol admin.

### 👨‍🍳 3. Panel Admin & Kitchen Display Workflow
- **Algoritma Finite State Machine (FSM) Dapur:**
  Alur tahapan memasak bergerak maju ke depan (*One-Way Pipeline*) dan tidak dapat dimundurkan sembarangan:
  Pesanan Diterima ➔ Sedang Dimasak ➔ Siap Disajikan ➔ Pesanan Selesai.
- **Modal Konfirmasi Tindakan (*Action Confirmation*):** Seluruh aksi penting (perubahan status memasak, hapus produk, keluar admin) diproteksi dengan modal konfirmasi interaktif guna mencegah kesalahan operasional.
- **Real-Time Silent Auto-Sync (8 Detik):** Transaksi baru otomatis masuk ke tabel admin tanpa kedip atau reload layar, dilengkapi **lonceng audio synthesizer (*Web Audio API Synth Chime*)** saat ada order baru masuk.
- **Manajemen Menu & Upload AWS S3:** Admin dapat menambah, mengubah, mengunggah foto makanan beresolusi tinggi ke AWS S3, dan mengatur ketersediaan stok.

---

## 🗂️ Struktur Direktori Monorepo

```text
vailovent-first/
├── backend/                             # REST API Server (Node.js / Express.js)
│   ├── controllers/
│   │   ├── adminControllers/           # Manajemen status memasak & data dapur
│   │   ├── authControllers/            # Autentikasi Admin (JWT & Cookie)
│   │   ├── midtransControllers/        # Pembuatan Snap token & transaksi Midtrans
│   │   ├── paymentNotificationController/# Webhook callback listener
│   │   ├── productControllers/         # CRUD produk menu restoran
│   │   └── transactionController/      # Checkout, query status, & sync batch
│   ├── db/                             # Koneksi database MongoDB Atlas
│   ├── middlewares/                    # Validasi Joi, JWT Auth, Upload S3, Mailer
│   ├── models/                         # Mongoose Schema (Transactions, Products, Users)
│   ├── routes/                         # API Route Endpoints
│   └── index.js                        # Entry point server backend
│
├── frontend/                            # Client Application (React.js + Vite + TailwindCSS)
│   ├── src/
│   │   ├── components/                 # Reusable UI (Navbar, ConfirmModal, MyOrdersModal, dll)
│   │   ├── pages/                      # Halaman (HomePage, CartPage, PaymentStatus, Admin)
│   │   ├── store/                      # Global State Management (Zustand)
│   │   └── utils/                      # Helper (Currency, Local Storage Order History, Audio)
│   ├── index.html
│   └── vite.config.js
│
└── README.md                            # Dokumentasi utama proyek
```

---

## 🛠️ Panduan Instalasi Lokal

### 1. Prasyarat
- [Node.js](https://nodejs.org/) (versi 18.x atau lebih baru)
- [Git](https://git-scm.com/)
- Akun [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Akun [Midtrans Sandbox](https://dashboard.midtrans.com/)
- Akun [AWS S3](https://aws.amazon.com/s3/) (untuk media upload)

### 2. Clone Repositori
```bash
git clone https://github.com/valen-valen/vailovent-first.git
cd vailovent-first
```

### 3. Setup Backend
```bash
cd backend
npm install
```
Buat file `.env` di dalam folder `backend/`:
```env
PORT=8000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Database MongoDB
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/vailovent

# Autentikasi JWT
JWT_SECRET=your_super_secret_jwt_key

# Midtrans Payment Gateway
MIDTRANS_SERVER_KEY=SB-Mid-server-xxxxxxxxxxxxxxxxx
MIDTRANS_CLIENT_KEY=SB-Mid-client-xxxxxxxxxxxxxxxxx
MIDTRANS_IS_PRODUCTION=false

# AWS S3 Storage
AWS_S3_ACCESS_KEY=AKIAxxxxxxxxxxxxxxxx
AWS_S3_SECRET_ACCESS_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=ta-project-soundbox-payment

# Email Notification (Nodemailer)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```
Jalankan server backend:
```bash
npm run dev
```

### 4. Setup Frontend
Buka terminal baru di folder `frontend/`:
```bash
cd frontend
npm install
```
Buat file `.env` di dalam folder `frontend/`:
```env
VITE_API_URL=http://localhost:8000/api/v1
```
Jalankan aplikasi client:
```bash
npm run dev
```
Akses web melalui browser di `http://localhost:5173`.

---

## 📡 Ringkasan Endpoint REST API

| Method | Endpoint | Deskripsi | Hak Akses |
|---|---|---|---|
| `GET` | `/health` | Health check koneksi server & MongoDB | Publik |
| `GET` | `/api/v1/products` | Mendapatkan seluruh daftar menu | Publik |
| `POST` | `/api/v1/products/create` | Menambah menu makanan baru (Foto -> AWS S3) | Admin |
| `DELETE` | `/api/v1/products/delete/:id` | Menghapus menu makanan | Admin |
| `POST` | `/api/v1/transactions/create` | Membuat pesanan baru & redirect Midtrans | Publik |
| `GET` | `/api/v1/transactions/:id` | Mengambil detail transaksi & status memasak | Publik |
| `GET` | `/api/v1/transactions/status/:status` | Mengambil daftar transaksi berdasarkan status | Admin |
| `POST` | `/api/v1/transactions/sync-all-pending` | Sinkronisasi massal seluruh transaksi pending | Admin |
| `POST` | `/api/v1/midtrans/payment-notification` | Webhook callback penerima status dari Midtrans | Midtrans Server |
| `PUT` | `/api/v1/admin/transactions/:id/cooking-status` | Memperbarui tahap memasak dapur (Forward FSM) | Admin |

---

## 🔒 Lisensi & Pengembang

Proyek ini dikembangkan sebagai bagian dari **Proyek Tugas Akhir Sistem Informasi & IoT**:  
*"Pengembangan Web Penjualan & Payment Gateway Berbasis IoT Soundbox Payment"*.

Distributed under the **MIT License**.
