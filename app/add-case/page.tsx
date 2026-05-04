"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/nav/Sidebar";
import { motion } from "framer-motion";

type Diagnosis = {
  diagnosis_id: number;
  code: string;
  name: string;
  signature?: string | null;
};

export default function AddCasePage() {
  const [fileName, setFileName] = useState<string | null>(null);
  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchDiagnoses = async () => {
      const tryUrls = ["/diagnoses", "http://127.0.0.1:8000/diagnoses"];
      for (const url of tryUrls) {
        try {
          const res = await fetch(url);
          if (!res.ok) continue;
          const data = await res.json();
          setDiagnoses(data);
          return;
        } catch (err) {
          console.warn(`Failed to fetch diagnoses from ${url}`, err);
        }
      }
    };
    fetchDiagnoses();
  }, []);

  const validateFile = async (f: File) => {
    try {
      const slice = f.slice(0, 4);
      const buf = await slice.arrayBuffer();
      const view = new DataView(buf);
      const b0 = view.getUint8(0);
      const b1 = view.getUint8(1);
      if (b0 === 0x1f && b1 === 0x8b) return true;
      const int32 = view.getInt32(0, true);
      if (int32 === 348) return true;
    } catch (err) {
      // ignore
    }
    return false;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const fileInput = form.querySelector('input[name="mri"]') as HTMLInputElement | null;
    const file = fileInput?.files?.[0];
    if (!file) {
      setError("Please select an MRI file (.nii or .nii.gz)");
      return;
    }

    const ok = await validateFile(file);
    if (!ok) {
      setError("Selected file does not look like a NIfTI (.nii or .nii.gz)");
      return;
    }

    setError(null);
    setSuccess(null);
    setSubmitting(true);
    try {
      const tryUrls = ["/cases", "http://127.0.0.1:8000/cases"];
      let lastErr: string | null = null;
      for (const url of tryUrls) {
        try {
          const res = await fetch(url, { method: "POST", body: formData });
          const text = await res.text();
          let json: any = null;
          try { json = JSON.parse(text); } catch {}
          if (!res.ok) {
            lastErr = (json && json.detail) || text || res.statusText;
            continue;
          }
          setSuccess("Case created: " + ((json && json.participant_id) || ""));
          form.reset();
          setFileName(null);
          lastErr = null;
          break;
        } catch (err: any) {
          lastErr = err?.message || String(err);
        }
      }
      if (lastErr) setError(lastErr);
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
          <div className="absolute inset-0 opacity-[0.08] bg-[linear-gradient(to_right,#2a2f35_1px,transparent_1px),linear-gradient(to_bottom,#2a2f35_1px,transparent_1px)] bg-[size:32px_32px]" />
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="relative z-10 max-w-4xl mx-auto px-6 py-10">
          <div className="flex items-center justify-between gap-6 mb-6">
            <div>
              <div className="font-mono text-xs uppercase tracking-[0.45em] text-cyan-300/70">Admin</div>
              <h1 className="font-syne text-4xl font-extrabold text-[#e2e2e6] tracking-tight mt-2">Add New Case</h1>
              <p className="text-sm text-slate-400 mt-2">Upload a NIfTI MRI and metadata to create a new participant case.</p>
            </div>
          </div>

          <div className="border border-[#3c494e] bg-[#14171c]/80 p-6">
            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">MRI file (.nii/.nii.gz)</label>
                <input required name="mri" type="file" accept=".nii,.nii.gz" onChange={(e)=>setFileName(e.target.files?.[0]?.name??null)} className="block w-full text-sm text-slate-200 bg-[#0b0c0f] border border-slate-700 rounded-md p-2" />
                {fileName && <div className="text-xs text-slate-400 mt-1">Selected: {fileName}</div>}
              </div>

              <div className="flex gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Age</label>
                  <input required name="age" type="number" min={0} className="block w-40 text-sm text-slate-200 bg-[#0b0c0f] border border-slate-700 rounded-md p-2" />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Gender</label>
                  <select name="gender" required className="block w-40 text-sm text-slate-200 bg-[#0b0c0f] border border-slate-700 rounded-md p-2">
                    <option value="">Select</option>
                    <option value="F">Female</option>
                    <option value="M">Male</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Diagnosis</label>
                <select name="diagnosis_id" required className="block w-full text-sm text-slate-200 bg-[#0b0c0f] border border-slate-700 rounded-md p-2">
                  <option value="">Select diagnosis</option>
                  {diagnoses.length === 0 ? (
                    <option value="">No diagnoses available</option>
                  ) : (
                    diagnoses.map((d) => (
                      <option key={d.diagnosis_id} value={d.diagnosis_id}>{d.code} — {d.name}</option>
                    ))
                  )}
                </select>
              </div>

              {error && <div className="text-sm text-red-400">{error}</div>}
              {success && <div className="text-sm text-green-400">{success}</div>}

              <div className="pt-2">
                <button type="submit" disabled={submitting} className="bg-[#00d4ff] disabled:opacity-50 text-[#071119] px-4 py-2 rounded-md font-medium">{submitting? 'Submitting...' : 'Submit'}</button>
              </div>
            </form>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
