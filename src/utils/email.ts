import nodemailer from "nodemailer";
import { env } from "../env";

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: env.EMAIL_USER, // Your Gmail address
    pass: env.EMAIL_PASSWORD // Your App Password
  }
});

export const sendEmail = async (to: string, subject: string, text: string) => {
  const mailOptions = {
    from: env.EMAIL_USER,
    to,
    subject,
    text
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);
    return true;
  } catch (error) {
    console.error("Error sending email: ", error);
    return false;
  }
};
