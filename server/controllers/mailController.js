// controllers/mailController.js
import nodemailer from "nodemailer";

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const RECEIVER_EMAIL = process.env.RECEIVER_EMAIL || EMAIL_USER;

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: EMAIL_USER, pass: EMAIL_PASS },
  // optional explicit host/port, uncomment to try explicit ports:
  // host: "smtp.gmail.com", port: 465, secure: true
});

// verify once at startup to print useful info
transporter.verify()
  .then(() => console.log("SMTP transporter verified"))
  .catch(err => console.error("SMTP verify failed:", err && err.message ? err.message : err));

export async function sendContact(req, res) {
  try {
    const { name, email, subject, message } = req.body || {};
    if (!name || !email || !message) {
      return res.status(400).json({ error: "name, email and message are required" });
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

    const info = await transporter.sendMail(mailOptions);
    return res.json({ ok: true, messageId: info.messageId });
  } catch (err) {
    // log full stack so Render logs show the cause
    console.error("sendContact error:", err && err.stack ? err.stack : err);

    // return friendly but informative message to client
    return res.status(500).json({
      error: err && err.message ? err.message : "Unknown server error"
    });
  }
}