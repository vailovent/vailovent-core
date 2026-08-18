export default function PrivacyPage() {
  const sections = [
    {
      title: "1. Data yang Kami Kumpulkan",
      content:
        "Dalam proses pemesanan dan pembayaran, kami mengumpulkan data berikut:\n\u2022 Nama lengkap pelanggan\n\u2022 Alamat email pelanggan\n\u2022 Kode meja pemesanan\n\u2022 Rincian pesanan (nama produk, jumlah, harga)\n\u2022 Status dan riwayat pembayaran\n\nKami tidak mengumpulkan informasi kartu kredit atau data perbankan secara langsung. Proses pembayaran ditangani oleh Midtrans sebagai penyedia layanan pembayaran pihak ketiga yang telah bersertifikat PCI-DSS.",
    },
    {
      title: "2. Bagaimana Data Digunakan",
      content:
        "Data yang kami kumpulkan digunakan untuk:\n\u2022 Memproses dan mengkonfirmasi pesanan Anda\n\u2022 Mengirimkan notifikasi status pembayaran via email\n\u2022 Memungkinkan staf dapur memproses pesanan Anda\n\u2022 Menyimpan riwayat transaksi untuk keperluan administrasi\n\u2022 Meningkatkan kualitas layanan kami",
    },
    {
      title: "3. Berbagi Data dengan Pihak Ketiga",
      content:
        "Kami dapat berbagi data Anda dengan pihak ketiga berikut:\n\u2022 Midtrans: untuk memproses pembayaran digital\n\u2022 Amazon Web Services (AWS): untuk penyimpanan file dan infrastruktur sistem\n\nKami tidak menjual, menyewakan, atau membagikan data pribadi Anda kepada pihak lain di luar keperluan operasional layanan ini.",
    },
    {
      title: "4. Keamanan Data",
      content:
        "Kami mengambil langkah-langkah yang wajar untuk melindungi data Anda, termasuk:\n\u2022 Penggunaan protokol HTTPS untuk seluruh transmisi data\n\u2022 Autentikasi berbasis token untuk akses sistem\n\u2022 Pembatasan akses data hanya untuk personel yang berwenang\n\nNamun, tidak ada sistem yang 100% aman. Kami tidak dapat menjamin keamanan absolut dari data yang dikirimkan melalui internet.",
    },
    {
      title: "5. Retensi Data",
      content:
        "Data transaksi Anda disimpan selama diperlukan untuk keperluan operasional dan administrasi. Data dapat dihapus atas permintaan pengguna sesuai dengan hak-hak yang berlaku di bawah regulasi perlindungan data.",
    },
    {
      title: "6. Hak Pengguna",
      content:
        "Sesuai dengan regulasi perlindungan data yang berlaku (termasuk UU PDP Indonesia), Anda memiliki hak untuk:\n\u2022 Mengakses data pribadi yang kami miliki tentang Anda\n\u2022 Meminta koreksi atas data yang tidak akurat\n\u2022 Meminta penghapusan data pribadi Anda\n\u2022 Mencabut persetujuan pemrosesan data\n\nUntuk mengajukan permintaan, silakan hubungi kami melalui informasi kontak di bawah ini.",
    },
    {
      title: "7. Cookie",
      content:
        "Sistem kami menggunakan cookie teknis untuk keperluan autentikasi sesi dan fungsi dasar website. Cookie ini tidak digunakan untuk melacak aktivitas pengguna di luar platform kami.",
    },
    {
      title: "8. Perubahan Kebijakan Privasi",
      content:
        "Kami dapat memperbarui kebijakan privasi ini dari waktu ke waktu. Perubahan signifikan akan diberitahukan melalui pemberitahuan di website. Penggunaan layanan Anda setelah perubahan tersebut berlaku dianggap sebagai persetujuan terhadap kebijakan yang diperbarui.",
    },
    {
      title: "9. Hubungi Kami",
      content:
        "Jika Anda memiliki pertanyaan, kekhawatiran, atau permintaan terkait privasi data Anda, silakan hubungi kami melalui:\n\nEmail: vailovent@gmail.com\nWebsite: https://vailovent.vercel.app",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Kebijakan Privasi
        </h1>
        <p className="text-gray-500 text-sm">
          Kami berkomitmen untuk melindungi privasi dan data pribadi Anda.
        </p>
        <p className="text-gray-400 text-xs mt-1">
          Berlaku untuk layanan Vailovent (
          <a
            href="https://vailovent.vercel.app"
            className="text-blue-500 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            vailovent.vercel.app
          </a>
          )
        </p>
      </div>

      <div className="space-y-6">
        {sections.map((section, index) => (
          <div
            key={index}
            className="bg-white border border-gray-200 rounded-lg px-6 py-5"
          >
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              {section.title}
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
              {section.content}
            </p>
          </div>
        ))}
      </div>

      <p className="mt-10 text-xs text-gray-400 text-center">
        Dengan menggunakan layanan Vailovent, Anda menyatakan telah membaca dan
        menyetujui Kebijakan Privasi ini.
      </p>
    </div>
  );
}
