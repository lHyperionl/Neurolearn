"use client";

import { useState } from "react";

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
          const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body,
          });
          const text = await res.text();
          let json: any = null;
          try {
            json = JSON.parse(text);
          } catch {
            json = null;
          }
          if (!res.ok) {
            const detail = (json && json.detail) || text || res.statusText;
            // If server returned an HTML page (Next 404), show concise message instead
            if (typeof detail === "string" && detail.trim().startsWith("<")) {
              lastErr = `Server returned ${res.status} ${res.statusText}`;
            } else {
              lastErr = String(detail);
            }
            // try next URL
            continue;
          }
          // success
          setSuccess("Diagnosis created: " + ((json && json.code) || ""));
          setCode("");
          setName("");
          setSignature("");
          ok = true;
          break;
        } catch (err: any) {
          lastErr = err?.message || String(err);
        }
      }
      if (!ok) {
        setError(lastErr || "Failed to create diagnosis");
      }
    } catch (err: any) {
      setError(err?.message || String(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Add Diagnosis</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Code</label>
          <input
            required
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="block w-full text-sm text-slate-200 bg-[#0b0c0f] border border-slate-700 rounded-md p-2"
            placeholder="e.g. ADH, MS"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="block w-full text-sm text-slate-200 bg-[#0b0c0f] border border-slate-700 rounded-md p-2"
            placeholder="Full diagnosis name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Signature</label>
          <input
            required
            value={signature}
            onChange={(e) => setSignature(e.target.value)}
            className="block w-full text-sm text-slate-200 bg-[#0b0c0f] border border-slate-700 rounded-md p-2"
            placeholder="short signature"
          />
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}
        {success && <p className="text-sm text-green-400">{success}</p>}

        <div className="pt-4">
          <button
            type="submit"
            disabled={submitting}
            className="bg-[#00d4ff] disabled:opacity-50 text-[#071119] px-4 py-2 rounded-md font-medium"
          >
            {submitting ? "Creating..." : "Create"}
          </button>
        </div>
      </form>
    </main>
  );
}
