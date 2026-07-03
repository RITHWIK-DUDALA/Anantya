const nodemailer = require('nodemailer');

async function sendConfirmationEmail(email, name, regId, games, amount, paymentId, qrCodeDataUrl, isFree = false) {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const amountText = isFree ? 'Free' : `₹${amount}`;
    const paymentText = isFree ? 'N/A' : paymentId;

    const mailOptions = {
      from: `"Janmashtami Committee" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '✅ Janmashtami 2025 — Registration Confirmed!',
      text: `Hi ${name},\n\nYou're registered for Janmashtami 2025 at AVV Chennai! 🎉\n\nRegistration ID: ${regId}\nRole/Games: ${games}\nAmount Paid: ${amountText}\nPayment ID: ${paymentText}\n\nSee you on August 16th!\n— Janmashtami Committee, AVV Chennai`,
      html: `
        <p>Hi ${name},</p>
        <p>You're registered for Janmashtami 2025 at AVV Chennai! 🎉</p>
        <p><strong>Registration ID:</strong> ${regId}<br/>
        <strong>Role/Games:</strong> ${games}<br/>
        <strong>Amount Paid:</strong> ${amountText}<br/>
        <strong>Payment ID:</strong> ${paymentText}</p>
        <p>Please find your QR code attached. Show this QR at the event entry gate.</p>
        <p>See you on August 16th!<br/>— Janmashtami Committee, AVV Chennai</p>
      `,
      attachments: [
        {
          filename: 'qrcode.png',
          content: qrCodeDataUrl.split("base64,")[1],
          encoding: 'base64'
        }
      ]
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${email}`);
  } catch (error) {
    console.error(`Failed to send email to ${email}:`, error);
  }
}

module.exports = { sendConfirmationEmail };
