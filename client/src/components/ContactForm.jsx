import React, { useState } from "react";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";

export default function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  function onChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function onSubmit(e) {
    e.preventDefault();
    setStatus(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (res.ok) {
        setStatus({ ok: true, msg: "Message sent. Thank you!" });
        setForm({ name: "", email: "", subject: "", message: "" });
      } else {
        setStatus({ ok: false, msg: data.error || "Failed to send" });
      }
    } catch (err) {
      console.error(err);
      setStatus({ ok: false, msg: "Network error: failed to contact server" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="bg-white p-6 rounded shadow">
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Full name</label>
          <input name="name" value={form.name} onChange={onChange}
                 className="mt-1 block w-full border rounded px-3 py-2" required />
        </div>

        <div>
          <label className="block text-sm font-medium">Email</label>
          <input name="email" type="email" value={form.email} onChange={onChange}
                 className="mt-1 block w-full border rounded px-3 py-2" required />
        </div>

        <div>
          <label className="block text-sm font-medium">Subject</label>
          <input name="subject" value={form.subject} onChange={onChange}
                 className="mt-1 block w-full border rounded px-3 py-2" />
        </div>

        <div>
          <label className="block text-sm font-medium">Message</label>
          <textarea name="message" value={form.message} onChange={onChange} rows="6"
                    className="mt-1 block w-full border rounded px-3 py-2" required />
        </div>

        <div className="flex items-center gap-3">
          <button type="submit"
                  disabled={loading}
                  className="bg-sky-600 text-white px-4 py-2 rounded">
            {loading ? "Sending..." : "Send Message"}
          </button>

          <button type="button"
                  onClick={() => setForm({ name: "", email: "", subject: "", message: "" })}
                  className="border px-3 py-2 rounded">
            Reset
          </button>
        </div>

        {status && (
          <div className={`mt-3 p-3 rounded ${status.ok ? "bg-green-50 border-green-300" : "bg-red-50 border-red-300"} border`}>
            <div className={`${status.ok ? "text-green-700" : "text-red-700"}`}>{status.msg}</div>
          </div>
        )}
      </form>

      <footer className="mt-4 text-xs text-slate-400">
        Note: uses Gmail SMTP. Configure <code>VITE_API_URL</code> or run server on <code>http://localhost:8000</code>.
      </footer>
    </section>
  );
}