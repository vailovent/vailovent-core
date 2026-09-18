const nodemailer = require("nodemailer");
const EmailLogs = require("../../models/emailLogSchema");

exports.sendSuccessEmail = async (customer_email, transaction, items) => {
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
        <td style="padding:12px 16px;border-bottom:1px solid #f0f0f0;color:#1a1a1a;font-size:14px;">${item.product_name}</td>
        <td style="padding:12px 16px;border-bottom:1px solid #f0f0f0;text-align:center;color:#555;font-size:14px;">${item.qty}x</td>
        <td style="padding:12px 16px;border-bottom:1px solid #f0f0f0;text-align:right;font-weight:600;color:#1a1a1a;font-size:14px;">${formatCurrency(item.amount)}</td>
      </tr>`
    )
    .join("");

  const html = `<!DOCTYPE html>
<html lang="id">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Pembayaran Berhasil – Vailovent</title></head>
<body style="margin:0;padding:0;background-color:#f5f5f5;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f5;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#10b981,#059669);padding:36px 40px;text-align:center;">
            <div style="display:inline-block;background:rgba(255,255,255,0.2);border-radius:50%;width:64px;height:64px;line-height:64px;font-size:28px;margin-bottom:16px;">✅</div>
            <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:-0.3px;">Pembayaran Berhasil!</h1>
            <p style="margin:8px 0 0;color:rgba(255,255,255,0.88);font-size:14px;">Pesanan Anda sedang diproses di dapur</p>
          </td>
        </tr>

        <!-- Greeting -->
        <tr>
          <td style="padding:32px 40px 0;">
            <p style="margin:0;font-size:15px;color:#374151;line-height:1.6;">Halo, <strong>${transaction.customer_name}</strong> 👋</p>
            <p style="margin:8px 0 0;font-size:15px;color:#6b7280;line-height:1.6;">Terima kasih! Pembayaran Anda di <strong style="color:#059669;">Vailovent</strong> telah dikonfirmasi. Pesanan Anda kini sedang disiapkan oleh dapur kami.</p>
          </td>
        </tr>

        <!-- Info Card -->
        <tr>
          <td style="padding:24px 40px 0;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#ecfdf5;border:1px solid #a7f3d0;border-radius:12px;overflow:hidden;">
              <tr>
                <td style="padding:20px 24px;">
                  <table width="100%" cellpadding="0" cellspacing="4">
                    <tr>
                      <td style="font-size:13px;color:#065f46;font-weight:500;padding:4px 0;">ID Transaksi</td>
                      <td style="font-size:13px;color:#1a1a1a;font-weight:700;text-align:right;padding:4px 0;font-family:monospace;">${transaction._id}</td>
                    </tr>
                    <tr>
                      <td style="font-size:13px;color:#065f46;font-weight:500;padding:4px 0;">Status Pembayaran</td>
                      <td style="text-align:right;padding:4px 0;"><span style="display:inline-block;padding:2px 10px;background:#d1fae5;color:#065f46;border-radius:20px;font-size:12px;font-weight:700;">Lunas ✓</span></td>
                    </tr>
                    <tr>
                      <td style="font-size:13px;color:#065f46;font-weight:500;padding:8px 0 4px;border-top:1px solid #a7f3d0;">Total Dibayar</td>
                      <td style="font-size:18px;color:#059669;font-weight:800;text-align:right;padding:8px 0 4px;border-top:1px solid #a7f3d0;">${formatCurrency(transaction.total_amount)}</td>
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
                  <td style="padding:14px 16px;text-align:right;font-size:15px;font-weight:800;color:#059669;">${formatCurrency(transaction.total_amount)}</td>
                </tr>
              </tfoot>
            </table>
          </td>
        </tr>

        <!-- Status Banner -->
        <tr>
          <td style="padding:24px 40px 0;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;">
              <tr>
                <td style="padding:16px 20px;text-align:center;">
                  <p style="margin:0;font-size:14px;color:#1e40af;font-weight:600;">🍳 &nbsp;Pesanan Anda sedang dimasak di dapur</p>
                  <p style="margin:6px 0 0;font-size:13px;color:#3b82f6;">Pantau status pesanan langsung dari aplikasi Vailovent</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f9fafb;border-top:1px solid #f0f0f0;padding:28px 40px;text-align:center;margin-top:24px;">
            <p style="margin:0;font-size:13px;color:#9ca3af;line-height:1.6;">Ada pertanyaan? Hubungi kami di <a href="mailto:vailovent@gmail.com" style="color:#059669;text-decoration:none;font-weight:600;">vailovent@gmail.com</a></p>
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
    subject: `✅ Pembayaran Berhasil – Terima Kasih, ${transaction.customer_name}! | Vailovent`,
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Success Payment Email sent successfully.");
  } catch (error) {
    console.log("Failed to send verification email:", error);
    throw error;
  }
};
