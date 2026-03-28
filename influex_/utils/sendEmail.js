import nodemailer from "nodemailer";

// --------------------------
// Configure transporter
// --------------------------
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // 🔥 MUST
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// --------------------------
// Send Email Function
// --------------------------
const sendEmail = async (to, subject, htmlContent, textContent) => {
  try {
    await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME || "Your App"}" <${process.env.EMAIL_USER}>`,
      to,           // recipient email
      subject,      // email subject
      text: textContent || "Please use an HTML compatible client", // fallback plain text
      html: htmlContent
    });
    console.log(`Email sent to ${to}`);
  } catch (err) {
    console.error("Email sending error:", err);
    throw new Error("Failed to send email");
  }
};

export default sendEmail;