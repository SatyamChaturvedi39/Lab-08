import React from "react";
import ContactForm from "./components/ContactForm.jsx";

export default function App() {
  return (
    <div className="max-w-3xl mx-auto p-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Digvijay Express — Contact Us</h1>
        <p className="text-sm text-slate-500">Send us a message and we'll reply via email.</p>
      </header>

      <ContactForm />
    </div>
  );
}