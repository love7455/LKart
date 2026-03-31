import "dotenv/config";
import { createMailer } from "../utils/mailer.js";

const ADMIN_SUPPORT_EMAIL = "2578LT@GMAIL.COM";

const sendSupportNotification = async (ticket) => {
  try {
    const { transporter, from } = createMailer();

    const mailDetails = {
      from,
      to: ADMIN_SUPPORT_EMAIL,
      subject: `New Support Ticket: ${ticket.subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 16px;">
          <h2>New LKart Support Ticket</h2>
          <p><b>Ticket ID:</b> ${ticket._id}</p>
          <p><b>Name:</b> ${ticket.name}</p>
          <p><b>Email:</b> ${ticket.email}</p>
          <p><b>Subject:</b> ${ticket.subject}</p>
          <p><b>Order ID:</b> ${ticket.orderId || "N/A"}</p>
          <p><b>Message:</b></p>
          <div style="background:#f5f5f5;padding:10px;border-radius:6px;">
            ${ticket.message}
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailDetails);
  } catch (error) {
    console.log(
      "Error sending support notification:",
      error?.message || error,
      "code:",
      error?.code,
      "responseCode:",
      error?.responseCode,
    );
  }
};

export default sendSupportNotification;
