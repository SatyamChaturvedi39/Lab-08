import nodemailer from "nodemailer";

export async function sendContact(req, res) {
  const EMAIL_USER = process.env.EMAIL_USER;
  const EMAIL_PASS = process.env.EMAIL_PASS;
  const RECEIVER_EMAIL = process.env.EMAIL_USER;

  console.log(EMAIL_USER);
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS
    }
  });
  

  if (!EMAIL_USER || !EMAIL_PASS) {
    console.warn("EMAIL_USER or EMAIL_PASS not set. Emails will not be sent.");
  }
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
    console.error("sendContact error:", err);
    return res.status(500).json({ error: "Failed to send email" });
  }
}