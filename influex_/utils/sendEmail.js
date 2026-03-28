import nodemailer from "nodemailer";

export const getTransporter = () => {
  console.log("MAIL USER:", process.env.EMAIL_USER);
  console.log("MAIL PASS:", process.env.EMAIL_PASS);

  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// --------------------------
// Send Email Function
// --------------------------
const sendEmail = async (to, subject, htmlContent, textContent) => {
  try {
    const transporter = getTransporter(); // 🔥 YAHI ADD KARNA THA

    await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME || "Your App"}" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text: textContent || "Please use an HTML compatible client",
      html: htmlContent
    });

    console.log(`Email sent to ${to}`);
  } catch (err) {
    console.error("Email sending error:", err);
    throw new Error("Failed to send email");
  }
};

export default sendEmail;