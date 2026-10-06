// const transporter = require("../config/emailConfig");

// const sendEmail = async (to, subject, html) => {
//   try {
//     await transporter.sendMail({
//       from: `"Civix" <${process.env.EMAIL_USER}>`,
//       to,
//       subject,
//       html,
//     });
//   } catch (error) {
//     console.error("Email error:", error);
//     throw new Error("Email sending failed");
//   }
// };

// module.exports = sendEmail;
const nodemailer = require("nodemailer");

const hasValidEmailConfig = () => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) return false;
  if (user === "your_gmail_address") return false;
  if (pass === "your_gmail_app_password") return false;

  return true;
};

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async ({ to, subject, html }) => {
  if (!hasValidEmailConfig()) {
    throw new Error(
      "Email is not configured. Set valid EMAIL_USER and EMAIL_PASS in backend/.env",
    );
  }

  try {
    await transporter.sendMail({
      from: `"Civix" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log("Email sent successfully");
  } catch (error) {
    console.error("Email sending failed:", error.message);
    throw new Error(`Email sending failed: ${error.message}`);
  }
};

module.exports = sendEmail;
