import nodemailer from "nodemailer";
import "dotenv/config";

const verifyEmail = async (token, user) => {
  let mailTranspoter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  let mailDetails = {
    from: process.env.EMAIL,
    to: user.email,
    subject: "Verify Your Email - LKart",
    html: `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>Email Verification</h2>
      <p>Hi ${user.firstName},</p>
      <p>Thank you for registering with LKart.</p>
      <p>Please click the button below to verify your email:</p>

      <a href="${process.env.VERIFICATION_LINK + token}"
         style="
           display: inline-block;
           padding: 10px 20px;
           background-color: #4CAF50;
           color: white;
           text-decoration: none;
           border-radius: 5px;
         ">
         Verify Email
      </a>

      <p style="margin-top: 20px;">
        If you did not create this account, please ignore this email.
      </p>
    </div>
  `,
  };

  mailTranspoter.sendMail(mailDetails, function (err, data) {
    if (err) {
      console.log("Error Occurs");
    } else {
      console.log("Email sent successfully");
    }
  });
};

export default verifyEmail;
