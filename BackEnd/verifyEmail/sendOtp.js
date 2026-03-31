import "dotenv/config";
import { createMailer } from "../utils/mailer.js";

const sendOTPEmail = async (otp, user) => {
  try {
    const { transporter, from } = createMailer();

    await transporter.verify();

    const mailDetails = {
      from,
      to: user.email,
      subject: "Your OTP Code - LKart",
      html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Email OTP Verification</h2>
        <p>Hi ${user.firstName},</p>
        <p>Your One-Time Password (OTP) for verification is:</p>

        <div style="
          font-size: 24px;
          font-weight: bold;
          letter-spacing: 5px;
          background-color: #f4f4f4;
          padding: 10px 15px;
          display: inline-block;
          border-radius: 5px;
          margin: 10px 0;
        ">
          ${otp}
        </div>

        <p>This OTP is valid for <b>10 minutes</b>.</p>

        <p style="margin-top: 20px;">
          If you did not request this, please ignore this email.
        </p>

        <p>- Team LKart</p>
      </div>
      `,
    };

    const info = await transporter.sendMail(mailDetails);
    console.log(`OTP email sent to ${user.email}. Message ID: ${info.messageId}`);
  } catch (error) {
    console.error(
      "Error sending OTP email:",
      error?.message || error,
      "code:",
      error?.code,
      "responseCode:",
      error?.responseCode,
    );
    throw error;
  }
};

export default sendOTPEmail;
