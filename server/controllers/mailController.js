// server/controllers/mailController.js
import nodemailer from "nodemailer";
import sgMail from "@sendgrid/mail";

export async function sendContact(req, res) {
  const EMAIL_USER = process.env.EMAIL_USER;
  const EMAIL_PASS = process.env.EMAIL_PASS;
  const RECEIVER_EMAIL = process.env.RECEIVER_EMAIL || EMAIL_USER;
  const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY; // optional (set this on Render)

  // Basic validation of request body
  try {
    const { name, email, subject, message } = req.body || {};
    if (!name || !email || !message) {
      return res.status(400).json({ error: "name, email and message are required" });
    }

    // If SENDGRID_API_KEY is present, prefer SendGrid (HTTP API)
    if (SENDGRID_API_KEY) {
      sgMail.setApiKey(SENDGRID_API_KEY);

      const mail = {
        to: RECEIVER_EMAIL,
        from: EMAIL_USER, // keep using EMAIL_USER as the sender email (no env rename)
        subject: subject || `Contact from ${name}`,
        text: `Sender: ${name} <${email}>\n\n${message}`,
        html: `<p><strong>Sender:</strong> ${name} &lt;${email}&gt;</p>
               <p><strong>Subject:</strong> ${subject || "-"}</p>
               <hr/>
               <p>${message.replace(/\n/g, "<br/>")}</p>`
      };

      try {
        const [response] = await sgMail.send(mail);
        // SendGrid usually returns 202 accepted
        return res.json({ ok: true, provider: "sendgrid", status: response?.statusCode || 202 });
      } catch (err) {
        console.error("sendContact SendGrid error:", err && err.response ? err.response.body : err);
        return res.status(500).json({ error: "Failed to send email (SendGrid)", detail: err.message || err });
      }
    }

    // Fallback: Nodemailer using Gmail (EMAIL_USER + EMAIL_PASS)
    if (!EMAIL_USER || !EMAIL_PASS) {
      console.warn("EMAIL_USER or EMAIL_PASS not set. Emails will not be sent.");
      return res.status(500).json({ error: "Email credentials missing on server" });
    }

    // Create transporter inside function as requested
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS
      }
    });

    // Optional: verify transporter quickly (catch and return helpful error)
    try {
      await transporter.verify();
    } catch (vErr) {
      console.error("Nodemailer verify failed:", vErr && vErr.message ? vErr.message : vErr);
      // continue to attempt send (but return a clearer error if send fails)
    }

    const mailOptions = {
      from: `"${name}" <${email}>`,
      to: RECEIVER_EMAIL,
      subject: subject || `Contact from ${name}`,
      text: `Sender: ${name} <${email}>\n\n${message}`,
      html: `<p><strong>Sender:</strong> ${name} &lt;${email}&gt;</p>
             <p><strong>Subject:</strong> ${subject || "-"}</p>
             <hr/>
             <p>${message.replace(/\n/g, "<br/>")}</p>`
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      return res.json({ ok: true, provider: "gmail", messageId: info.messageId });
    } catch (err) {
      console.error("sendContact Gmail error:", err);
      return res.status(500).json({ error: "Failed to send email (Gmail)", detail: err.message || err });
    }
  } catch (outerErr) {
    console.error("sendContact outer error:", outerErr);
    return res.status(500).json({ error: "Server error" });
  }
}