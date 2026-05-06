"use client";

import { useState } from "react";
import Sidebar from "@/components/nav/Sidebar";
import { motion } from "framer-motion";

export default function AddDiagnosisPage() {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [signature, setSignature] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);
    try {
      const body = JSON.stringify({ code, name, signature });
      const tryUrls = ["/diagnoses", "http://127.0.0.1:8000/diagnoses"];
      let ok = false;
      let lastErr: string | null = null;
      for (const url of tryUrls) {
        try {
          const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body });
          const text = await res.text();
          let json: any = null;
          try { json = JSON.parse(text); } catch { json = null; }
          if (!res.ok) {
            const detail = (json && json.detail) || text || res.statusText;
            if (typeof detail === "string" && detail.trim().startsWith("<")) {
              lastErr = `Server returned ${res.status} ${res.statusText}`;
            } else {
              lastErr = String(detail);
            }
            continue;
          }
          setSuccess("Diagnosis created: " + (json?.code || ""));
          setCode(""); setName(""); setSignature(""); ok = true; break;
        } catch (err: any) {
          lastErr = err?.message || String(err);
        }
      }
      if (!ok) setError(lastErr || "Failed to create diagnosis");
    } catch (err: any) {
      setError(err?.message || String(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-1 overflow-hidden">
      <Sidebar />
      <main className="relative flex-1 overflow-y-auto overflow-x-hidden bg-[#0c0e11]">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -right-32 w-72 h-72 bg-cyan-500/10 blur-[140px]" />
          <div className="absolute top-1/3 -left-20 w-48 h-48 bg-amber-500/10 blur-[120px]" />
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="relative z-10 max-w-3xl mx-auto px-6 py-10">
          <div className="mb-6">
            <div className="font-mono text-xs uppercase tracking-[0.45em] text-cyan-300/70">Admin</div>
            <h1 className="font-syne text-4xl font-extrabold text-[#e2e2e6] tracking-tight mt-2">Add Diagnosis</h1>
            <p className="text-sm text-slate-400 mt-2">Create a new diagnosis code used across the app.</p>
          </div>

          <div className="border border-[#3c494e] bg-[#14171c]/80 p-6">
            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Code</label>
                <input required value={code} onChange={(e)=>setCode(e.target.value)} className="block w-full text-sm text-slate-200 bg-[#0b0c0f] border border-slate-700 rounded-md p-2" placeholder="e.g. ADHD" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input required value={name} onChange={(e)=>setName(e.target.value)} className="block w-full text-sm text-slate-200 bg-[#0b0c0f] border border-slate-700 rounded-md p-2" placeholder="Full diagnosis name" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Signature</label>
                <input required value={signature} onChange={(e)=>setSignature(e.target.value)} className="block w-full text-sm text-slate-200 bg-[#0b0c0f] border border-slate-700 rounded-md p-2" placeholder="short signature" />
              </div>

              {error && <div className="text-sm text-red-400">{error}</div>}
              {success && <div className="text-sm text-green-400">{success}</div>}

              <div className="pt-2">
                <button type="submit" disabled={submitting} className="bg-[#00d4ff] disabled:opacity-50 text-[#071119] px-4 py-2 rounded-md font-medium">{submitting ? 'Creating...' : 'Create'}</button>
              </div>
            </form>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
