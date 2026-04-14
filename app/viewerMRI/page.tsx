"use client";
import React, { useEffect, useState } from "react";
import MRIViewerNiiVue from "../../components/learn/MRIViewerNiiVue";

interface CaseList {
  cases: string[];
}

interface FileList {
  files: string[];
}

interface PatientInfo {
  participant_id?: string;
  diagnosis?: string;
  age?: string;
  gender?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function ViewerMRIPage() {
  const [cases, setCases] = useState<string[]>([]);
  const [selectedCase, setSelectedCase] = useState<string | null>(null);
  const [files, setFiles] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [showOverlay, setShowOverlay] = useState<boolean>(false);
  const [overlayFile, setOverlayFile] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [patientInfo, setPatientInfo] = useState<PatientInfo | null>(null);
  const [patientLoading, setPatientLoading] = useState(false);
  const [patientError, setPatientError] = useState<string | null>(null);

  // Fetch all cases on mount
  useEffect(() => {
    setLoading(true);
    fetch(`${API_URL}/cases`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCases(data);
        } else if (typeof data === "object" && data !== null && Array.isArray(data.cases)) {
          setCases(data.cases);
        } else {
          setCases([]);
        }
        setLoading(false);
      })
      .catch((e) => {
        setError("Failed to load cases.");
        setLoading(false);
      });
  }, []);

  // Fetch files for selected case
  useEffect(() => {
    if (!selectedCase) return;
    setLoading(true);
    fetch(`${API_URL}/cases/${selectedCase}/files`)
      .then((res) => res.json())
      .then((data) => {
        // Debug: log what came from the server
        console.log("Files fetch result:", data);
        if (Array.isArray(data)) {
          setFiles(data);
        } else if (typeof data === "object" && data !== null && Array.isArray(data.files)) {
          setFiles(data.files);
        } else {
          setFiles([]);
        }
        setSelectedFile(null);
        setOverlayFile(null);
        setLoading(false);
      })
      .catch((e) => {
        setError("Failed to load case files.");
        setFiles([]);
        setSelectedFile(null);
        setOverlayFile(null);
        setLoading(false);
      });
  }, [selectedCase]);

  // Fetch patient info for selected case
  useEffect(() => {
    if (!selectedCase) {
      setPatientInfo(null);
      setPatientError(null);
      setPatientLoading(false);
      return;
    }
    setPatientLoading(true);
    setPatientError(null);
    fetch(`${API_URL}/participants/${selectedCase}`)
      .then(async (res) => {
        if (!res.ok) {
          throw new Error("Patient not found");
        }
        return res.json();
      })
      .then((data) => {
        setPatientInfo(data);
        setPatientLoading(false);
      })
      .catch(() => {
        setPatientInfo(null);
        setPatientError("Patient not found");
        setPatientLoading(false);
      });
  }, [selectedCase]);

  // Find overlay file (seg.nii) if present
  useEffect(() => {
    if (!files.length) return;
    const seg = files.find((f) => f.toLowerCase().includes("seg"));
    setOverlayFile(seg || null);
  }, [files]);

  return (
    <div className="w-full max-w-[1400px] mx-auto mt-10 p-8 bg-[#0f1117] rounded-2xl border border-cyan-500/20 shadow-2xl relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none" />
      <h1 className="text-3xl font-bold font-syne text-white glow-text mb-8 text-center">MRI Case Viewer</h1>
      {loading && <div className="text-cyan-400 font-mono mb-4">Loading...</div>}
      {error && <div className="text-red-400 font-mono mb-4">{error}</div>}
      {/* Výber prípadu */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center gap-3">
        <label className="font-mono text-slate-300">Case:&nbsp;</label>
        <select
          value={selectedCase || ""}
          onChange={(e) => setSelectedCase(e.target.value)}
          className="bg-[#181b22] border border-cyan-500/30 text-cyan-300 font-mono rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-colors"
        >
          <option value="">-- Select a case --</option>
          {Array.isArray(cases) && cases.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      {/* Výber modality */}
      {selectedCase && Array.isArray(files) && files.length > 0 && (
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <span className="font-mono text-slate-300">Modalities:</span>
          {files.map((f) => (
            <button
              key={f}
              className={`px-4 py-2 rounded-md font-mono border transition-colors text-xs
                ${selectedFile === f
                  ? 'bg-cyan-500 text-white border-cyan-500 shadow-[0_0_10px_rgba(0,212,255,0.3)]'
                  : 'bg-[#181b22] text-cyan-300 border-cyan-500/30 hover:bg-cyan-500/10'}
              `}
              onClick={() => setSelectedFile(f)}
            >
              {f}
            </button>
          ))}
        </div>
      )}
      {/* Zobrazenie vieweru */}
      {selectedCase && selectedFile && (
        <div>
          <MRIViewerNiiVue
            url={`${API_URL}/files/${selectedCase}/${selectedFile}`}
            patientInfo={
              patientInfo
                ? {
                    participantId: patientInfo.participant_id ?? selectedCase,
                    diagnosis: patientInfo.diagnosis ?? "n/a",
                    age: patientInfo.age ?? "n/a",
                    gender: patientInfo.gender ?? "n/a",
                  }
                : null
            }
            patientLoading={patientLoading}
            patientError={patientError}
            overlayToggleUrl={
              showOverlay && overlayFile && selectedFile !== overlayFile
                ? `${API_URL}/files/${selectedCase}/${overlayFile}`
                : undefined
            }
          />
          {overlayFile && selectedFile !== overlayFile && (
            <button
              className={`mt-4 px-4 py-2 rounded-md font-mono border transition-colors text-xs
                ${showOverlay
                  ? 'bg-amber-500 text-white border-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                  : 'bg-[#181b22] text-amber-400 border-amber-500/30 hover:bg-amber-500/10'}
              `}
              onClick={() => setShowOverlay((v) => !v)}
            >
              {showOverlay ? "Hide segmentation" : "Show segmentation"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
