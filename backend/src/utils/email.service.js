const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === "true", // true = 465, false = 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// =========================
//  ENVÍO DE EMAIL (HTML + TEXTO PLANO)
// =========================
const sendEmail = async (to, subject, html, text = "") => {
  try {
    await transporter.sendMail({
      from: `"Divisor de Gastos" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
      text
    });

    console.log("Email enviado a:", to);
  } catch (error) {
    console.error("Error enviando email:", error);
  }
};

module.exports = { sendEmail };



