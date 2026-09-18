const nodemailer = require("nodemailer");

exports.sendPaymentEmail = async (
  customer_email,
  customer_name,
  transaction_id,
  gross_amount,
  items,
  payment_url
) => {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(amount);

  const itemsRows = items
    .map(
      (item) => `
      <tr>
        <td style="padding:12px 16px;border-bottom:1px solid #f0f0f0;color:#1a1a1a;font-size:14px;">${item.name}</td>
        <td style="padding:12px 16px;border-bottom:1px solid #f0f0f0;text-align:center;color:#555;font-size:14px;">${item.quantity}x</td>
        <td style="padding:12px 16px;border-bottom:1px solid #f0f0f0;text-align:right;font-weight:600;color:#1a1a1a;font-size:14px;">${formatCurrency(item.quantity * item.price)}</td>
      </tr>`
    )
    .join("");

  const html = `<!DOCTYPE html>
<html lang="id">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Selesaikan Pembayaran – Vailovent</title></head>
<body style="margin:0;padding:0;background-color:#f5f5f5;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f5;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

        <!-- Logo -->
        <tr>
          <td style="text-align:center;padding:24px 0 16px;background:#ffffff;">
            <img src="https://ta-project-soundbox-payment-180294196054-us-east-1-an.s3.us-east-1.amazonaws.com/vailovent-logo-black" alt="Vailovent" style="max-height:40px;border:none;display:block;margin:0 auto;">
          </td>
        </tr>

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#f59e0b,#d97706);padding:36px 40px;text-align:center;">
            <div style="display:inline-block;background:rgba(255,255,255,0.15);border-radius:50%;width:64px;height:64px;line-height:64px;font-size:28px;margin-bottom:16px;">🛒</div>
            <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:-0.3px;">Pesanan Berhasil Dibuat!</h1>
            <p style="margin:8px 0 0;color:rgba(255,255,255,0.88);font-size:14px;">Segera selesaikan pembayaran Anda</p>
          </td>
        </tr>

        <!-- Greeting -->
        <tr>
          <td style="padding:32px 40px 0;">
            <p style="margin:0;font-size:15px;color:#374151;line-height:1.6;">Halo, <strong>${customer_name}</strong> 👋</p>
            <p style="margin:8px 0 0;font-size:15px;color:#6b7280;line-height:1.6;">Pesanan Anda di <strong style="color:#d97706;">Vailovent</strong> telah berhasil dibuat. Silakan selesaikan pembayaran agar pesanan segera diproses ke dapur.</p>
          </td>
        </tr>

        <!-- Info Card -->
        <tr>
          <td style="padding:24px 40px 0;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#fffbeb;border:1px solid #fde68a;border-radius:12px;overflow:hidden;">
              <tr>
                <td style="padding:20px 24px;">
                  <table width="100%" cellpadding="0" cellspacing="4">
                    <tr>
                      <td style="font-size:13px;color:#92400e;font-weight:500;padding:4px 0;">ID Transaksi</td>
                      <td style="font-size:13px;color:#1a1a1a;font-weight:700;text-align:right;padding:4px 0;font-family:monospace;">${transaction_id}</td>
                    </tr>
                    <tr>
                      <td style="font-size:13px;color:#92400e;font-weight:500;padding:4px 0;">Status</td>
                      <td style="text-align:right;padding:4px 0;"><span style="display:inline-block;padding:2px 10px;background:#fef3c7;color:#92400e;border-radius:20px;font-size:12px;font-weight:700;">Menunggu Pembayaran</span></td>
                    </tr>
                    <tr>
                      <td style="font-size:13px;color:#92400e;font-weight:500;padding:8px 0 4px;border-top:1px solid #fde68a;">Total Tagihan</td>
                      <td style="font-size:18px;color:#d97706;font-weight:800;text-align:right;padding:8px 0 4px;border-top:1px solid #fde68a;">${formatCurrency(gross_amount)}</td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Items Table -->
        <tr>
          <td style="padding:24px 40px 0;">
            <p style="margin:0 0 12px;font-size:14px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:0.5px;">Rincian Pesanan</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #f0f0f0;border-radius:10px;overflow:hidden;">
              <thead>
                <tr style="background:#f9fafb;">
                  <th style="padding:10px 16px;text-align:left;font-size:12px;color:#9ca3af;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Menu</th>
                  <th style="padding:10px 16px;text-align:center;font-size:12px;color:#9ca3af;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Jml</th>
                  <th style="padding:10px 16px;text-align:right;font-size:12px;color:#9ca3af;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Subtotal</th>
                </tr>
              </thead>
              <tbody>${itemsRows}</tbody>
              <tfoot>
                <tr style="background:#f9fafb;">
                  <td colspan="2" style="padding:14px 16px;font-size:14px;font-weight:700;color:#374151;">Total</td>
                  <td style="padding:14px 16px;text-align:right;font-size:15px;font-weight:800;color:#d97706;">${formatCurrency(gross_amount)}</td>
                </tr>
              </tfoot>
            </table>
          </td>
        </tr>

        <!-- CTA Button -->
        <tr>
          <td style="padding:32px 40px;text-align:center;">
            <a href="${payment_url}" style="display:inline-block;padding:14px 40px;background:linear-gradient(135deg,#f59e0b,#d97706);color:#ffffff;text-decoration:none;border-radius:10px;font-size:15px;font-weight:700;letter-spacing:0.2px;box-shadow:0 4px 12px rgba(217,119,6,0.35);">
              💳 &nbsp;Bayar Sekarang
            </a>
            <p style="margin:16px 0 0;font-size:12px;color:#9ca3af;">Tautan pembayaran ini bersifat unik dan hanya untuk Anda.</p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f9fafb;border-top:1px solid #f0f0f0;padding:24px 40px;text-align:center;">
            <p style="margin:0;font-size:13px;color:#9ca3af;line-height:1.6;">Ada pertanyaan? Hubungi kami di <a href="mailto:vailovent@gmail.com" style="color:#d97706;text-decoration:none;font-weight:600;">vailovent@gmail.com</a></p>
            <p style="margin:8px 0 0;font-size:12px;color:#d1d5db;">&copy; 2024 <strong style="color:#6b7280;">Vailovent</strong>. All rights reserved.</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const mailOptions = {
    from: `"Vailovent" <${process.env.EMAIL_USER}>`,
    to: customer_email,
    subject: `🛒 Pesanan Dibuat – Selesaikan Pembayaran Anda | Vailovent`,
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Payment email sent successfully.");
  } catch (error) {
    console.log("Failed to send payment email:", error);
  }
};
