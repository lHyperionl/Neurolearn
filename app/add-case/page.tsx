"use client";

import { useEffect, useState } from "react";

type Diagnosis = {
  diagnosis_id: number;
  code: string;
  name: string;
  signature?: string | null;
};

export default function AddCasePage() {
  const [fileName, setFileName] = useState<string | null>(null);
  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([]);

  useEffect(() => {
    const fetchDiagnoses = async () => {
      const tryUrls = ["http://127.0.0.1:8000/diagnoses"];
      for (const url of tryUrls) {
        try {
          const res = await fetch(url);
          if (!res.ok) {
            // try next
            continue;
          }
          const data = await res.json();
          setDiagnoses(data);
          return;
        } catch (err) {
          console.warn(`Failed to fetch diagnoses from ${url}`, err);
        }
      }
      console.error("Failed to load diagnoses from any known URL");
    };
    fetchDiagnoses();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    // validate selected file before sending
    const fileInput = form.querySelector(
      'input[name="mri"]',
    ) as HTMLInputElement | null;
    const file = fileInput?.files?.[0];
    if (!file) {
      setError("Please select an MRI file (.nii or .nii.gz)");
      return;
    }

    const validateFile = async (f: File) => {
      try {
        const slice = f.slice(0, 4);
        const buf = await slice.arrayBuffer();
        const view = new DataView(buf);
        const b0 = view.getUint8(0);
        const b1 = view.getUint8(1);
        // gzip magic
        if (b0 === 0x1f && b1 === 0x8b) return true;
        // check int32 little-endian equals 348
        const int32 = view.getInt32(0, true);
        if (int32 === 348) return true;
      } catch (err) {}
      return false;
    };

    const ok = await validateFile(file);
    if (!ok) {
      setError("Selected file does not look like a NIfTI (.nii or .nii.gz)");
      return;
    }
    setError(null);
    setSuccess(null);
    setSubmitting(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/cases", {
        method: "POST",
        body: formData,
      });
      const text = await res.text();
      let json: any = null;
      try {
        json = JSON.parse(text);
      } catch {}

      if (!res.ok) {
        const detail = (json && json.detail) || text || res.statusText;
        setError(String(detail));
      } else {
        setSuccess("Case created: " + ((json && json.participant_id) || ""));
        form.reset();
        setFileName(null);
      }
    } catch (err: any) {
      console.error(err);
      setError(String(err?.message || err));
    } finally {
      setSubmitting(false);
    }
  };

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Add New Case</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            MRI file (.nii.gz)
          </label>
          <input
            required
            name="mri"
            type="file"
            accept=".nii,.nii.gz"
            onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
            className="block w-full text-sm text-slate-200 bg-[#0b0c0f] border border-slate-700 rounded-md p-2"
          />
          {fileName && (
            <p className="text-xs text-slate-400 mt-1">Selected: {fileName}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Age</label>
          <input
            required
            name="age"
            type="number"
            min={0}
            className="block w-40 text-sm text-slate-200 bg-[#0b0c0f] border border-slate-700 rounded-md p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Gender</label>
          <select
            name="gender"
            required
            className="block w-40 text-sm text-slate-200 bg-[#0b0c0f] border border-slate-700 rounded-md p-2"
          >
            <option value="">Select</option>
            <option value="F">Female</option>
            <option value="M">Male</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Available diagnosis
          </label>
          <select
            name="diagnosis_id"
            required
            className="block w-full text-sm text-slate-200 bg-[#0b0c0f] border border-slate-700 rounded-md p-2"
          >
            <option value="">Select diagnosis</option>
            {diagnoses.length === 0 ? (
              <option value="">No diagnoses available</option>
            ) : (
              diagnoses.map((d) => (
                <option key={d.diagnosis_id} value={d.diagnosis_id}>
                  {d.code} — {d.name}
                </option>
              ))
            )}
          </select>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}
        {success && <p className="text-sm text-green-400">{success}</p>}

        <div className="pt-4">
          <button
            type="submit"
            disabled={submitting}
            className="bg-[#00d4ff] disabled:opacity-50 text-[#071119] px-4 py-2 rounded-md font-medium"
          >
            {submitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      </form>
    </main>
  );
}
