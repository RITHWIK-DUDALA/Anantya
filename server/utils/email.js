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

async function sendContactEmail(name, email, message) {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"${name}" <${process.env.EMAIL_USER}>`, // Needs to be authenticated user, but replyTo is set to the submitter
      replyTo: email,
      to: process.env.EMAIL_USER, // Sends to the committee's email
      subject: `[Support Ticket] Message from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 10px; padding: 20px;">
          <h2 style="color: #B78B27; border-bottom: 2px solid #eaeaea; padding-bottom: 10px;">New Support Ticket</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-top: 20px;">
            <p style="margin: 0; white-space: pre-wrap;">${message}</p>
          </div>
          <p style="color: #888; font-size: 12px; margin-top: 20px;">* This message was sent via the Anantya 2026 Contact Form.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Contact email from ${name} sent successfully`);
  } catch (error) {
    console.error(`Failed to send contact email from ${name}:`, error);
    throw error;
  }
}

module.exports = { sendConfirmationEmail, sendContactEmail };
