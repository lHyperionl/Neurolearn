"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import InteractiveMRIViewer from "@/components/learn/InteractiveMRIViewer";
import DiagnosisCard, { DiagnosisInfo } from "@/components/learn/DiagnosisCard";
import ChatPanel from "@/components/learn/ChatPanel";
import Sidebar from "@/components/nav/Sidebar";
import { motion } from "framer-motion";

interface PatientInfo {
    participant_id?: string;
    diagnosis?: string;
    age?: string;
    gender?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const preferredSequences = ["t1ce", "t1", "t2", "flair"];

const isOverlayFile = (fileName: string) => /seg/i.test(fileName);

const pickDefaultFile = (files: string[]) => {
    const imageFiles = files.filter((file: string) => !isOverlayFile(file));
    const preferred = imageFiles.find((file: string) =>
        preferredSequences.some((seq) => file.toLowerCase().includes(seq)),
    );
    return preferred ?? imageFiles[0] ?? null;
};

const getSequenceLabel = (fileName?: string | null) => {
    if (!fileName) return "Unknown";
    const lower = fileName.toLowerCase();
    if (lower.includes("t1ce")) return "T1c";
    if (lower.includes("t1")) return "T1";
    if (lower.includes("t2")) return "T2";
    if (lower.includes("flair")) return "FLAIR";
    return fileName.replace(/\.nii(\.gz)?$/i, "");
};

export default function LearnCasePage() {
    const params = useParams<{ caseId: string }>();
    const router = useRouter();
    const selectedCase = Array.isArray(params.caseId) ? params.caseId[0] : params.caseId;

    const [cases, setCases] = useState<string[]>([]);
    const [caseListLoading, setCaseListLoading] = useState(false);
    const [caseListError, setCaseListError] = useState<string | null>(null);

    const [files, setFiles] = useState<string[]>([]);
    const [selectedFile, setSelectedFile] = useState<string | null>(null);
    const [overlayFile, setOverlayFile] = useState<string | null>(null);
    const [showOverlay, setShowOverlay] = useState(false);
    const [caseLoading, setCaseLoading] = useState(false);
    const [caseError, setCaseError] = useState<string | null>(null);

    const [patientInfo, setPatientInfo] = useState<PatientInfo | null>(null);
    const [patientLoading, setPatientLoading] = useState(false);
    const [patientError, setPatientError] = useState<string | null>(null);

    const [diagnosisInfo, setDiagnosisInfo] = useState<DiagnosisInfo | null>(null);
    const [diagnosisLoading, setDiagnosisLoading] = useState(false);
    const [diagnosisError, setDiagnosisError] = useState<string | null>(null);
    const [showDiagnosis, setShowDiagnosis] = useState(false);

    useEffect(() => {
        setCaseListLoading(true);
        fetch(`${API_URL}/cases`)
            .then((res) => res.json())
            .then((data) => {
                if (Array.isArray(data)) {
                    setCases(data);
                } else if (data && Array.isArray(data.cases)) {
                    setCases(data.cases);
                } else {
                    setCases([]);
                }
                setCaseListLoading(false);
            })
            .catch(() => {
                setCaseListError("Failed to load cases.");
                setCaseListLoading(false);
            });
    }, []);

    useEffect(() => {
        if (!selectedCase) return;
        setCaseLoading(true);
        setCaseError(null);
        setShowOverlay(false);
        setShowDiagnosis(false);
        fetch(`${API_URL}/cases/${selectedCase}/files`)
            .then((res) => res.json())
            .then((data) => {
                const nextFiles = Array.isArray(data)
                    ? data
                    : Array.isArray(data?.files)
                      ? data.files
                      : [];
                setFiles(nextFiles);
                setOverlayFile(nextFiles.find((file: string) => isOverlayFile(file)) ?? null);
                setSelectedFile(pickDefaultFile(nextFiles));
                setCaseLoading(false);
            })
            .catch(() => {
                setFiles([]);
                setSelectedFile(null);
                setOverlayFile(null);
                setCaseError("Failed to load case files.");
                setCaseLoading(false);
            });
    }, [selectedCase]);

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

    useEffect(() => {
        const diagnosisKey = patientInfo?.diagnosis?.trim();
        if (!diagnosisKey) {
            setDiagnosisInfo(null);
            setDiagnosisError(null);
            setDiagnosisLoading(false);
            return;
        }
        setDiagnosisLoading(true);
        setDiagnosisError(null);
        fetch(`${API_URL}/diagnoses/${encodeURIComponent(diagnosisKey)}`)
            .then(async (res) => {
                if (!res.ok) {
                    throw new Error("Diagnosis not found");
                }
                return res.json();
            })
            .then((data) => {
                setDiagnosisInfo(data);
                setDiagnosisLoading(false);
            })
            .catch(() => {
                setDiagnosisInfo(null);
                setDiagnosisError("Diagnosis not found");
                setDiagnosisLoading(false);
            });
    }, [patientInfo]);

    const imageFiles = useMemo(
        () => files.filter((file: string) => !isOverlayFile(file)),
        [files],
    );

    const sequenceLabel = getSequenceLabel(selectedFile);
    const viewLabel = "Interactive";
    const hasOverlay = Boolean(overlayFile && selectedFile && overlayFile !== selectedFile);

    const handleNextCase = () => {
        if (!cases.length || !selectedCase) return;
        const currentIndex = cases.indexOf(selectedCase);
        const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % cases.length : 0;
        router.push(`/learn/${cases[nextIndex]}`);
    };

    const handlePreviousCase = () => {
        if (!cases.length || !selectedCase) return;
        const currentIndex = cases.indexOf(selectedCase);
        const previousIndex = currentIndex > 0 ? currentIndex - 1 : cases.length - 1;
        router.push(`/learn/${cases[previousIndex]}`);
    };

    if (!selectedCase) {
        return (
            <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto p-6 bg-[#0c0e11]">
                    <div className="max-w-3xl mx-auto bg-[#1e2023] border border-[#3c494e] p-6">
                        <h2 className="font-mono text-xs uppercase tracking-widest text-[#a8e8ff] mb-2">
                            No case selected
                        </h2>
                        <p className="text-sm text-slate-400 font-mono">
                            Choose a case from the list to continue.
                        </p>
                        <Link
                            href="/learn"
                            className="inline-flex mt-4 px-3 py-2 text-xs font-mono uppercase border border-[#3c494e] text-slate-300 hover:border-[#a8e8ff]/60"
                        >
                            Back to cases
                        </Link>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="flex flex-1 overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto p-6 bg-[#0c0e11]">
                <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 min-h-full">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="lg:col-span-6 flex flex-col gap-4"
                        style={{ minHeight: "calc(100vh - 73px - 3rem)" }}
                    >
                        <div className="bg-[#1e2023] border border-[#3c494e] p-4">
                            <div className="flex items-center justify-between mb-3">
                                <h2 className="font-mono text-xs uppercase tracking-widest text-[#a8e8ff]">
                                    Case {selectedCase}
                                </h2>
                                <div className="flex items-center gap-2">
                                    <Link
                                        href="/learn"
                                        className="px-3 py-1 text-[10px] font-mono uppercase border border-[#3c494e] text-slate-300 hover:border-[#a8e8ff]/60"
                                    >
                                        Back
                                    </Link>
                                    <button
                                        type="button"
                                        onClick={handlePreviousCase}
                                        className="px-3 py-1 text-[10px] font-mono uppercase border border-[#3c494e] text-slate-300 hover:border-[#a8e8ff]/60"
                                    >
                                        Previous case
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleNextCase}
                                        className="px-3 py-1 text-[10px] font-mono uppercase border border-[#3c494e] text-slate-300 hover:border-[#a8e8ff]/60"
                                    >
                                        Next case
                                    </button>
                                </div>
                            </div>
                            {caseListLoading && (
                                <div className="text-xs font-mono text-cyan-400">Loading cases...</div>
                            )}
                            {caseListError && (
                                <div className="text-xs font-mono text-red-400">{caseListError}</div>
                            )}
                            {caseLoading && (
                                <div className="text-xs font-mono text-cyan-400">Loading case data...</div>
                            )}
                            {caseError && (
                                <div className="text-xs font-mono text-red-400">{caseError}</div>
                            )}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div className="bg-[#1a1c1f] border border-[#3c494e] p-3">
                                <div className="text-[9px] font-mono text-slate-500 uppercase">Case ID</div>
                                <div className="text-xs font-mono text-slate-200">
                                    {selectedCase}
                                </div>
                            </div>
                            <div className="bg-[#1a1c1f] border border-[#3c494e] p-3">
                                <div className="text-[9px] font-mono text-slate-500 uppercase">Sequence</div>
                                <div className="text-xs font-mono text-slate-200">
                                    {sequenceLabel}
                                </div>
                            </div>
                            <div className="bg-[#1a1c1f] border border-[#3c494e] p-3">
                                <div className="text-[9px] font-mono text-slate-500 uppercase">View</div>
                                <div className="text-xs font-mono text-slate-200">
                                    {viewLabel}
                                </div>
                            </div>
                            <div className="bg-[#1a1c1f] border border-[#3c494e] p-3">
                                <div className="text-[9px] font-mono text-slate-500 uppercase">Mask</div>
                                <div className="text-xs font-mono text-slate-200">
                                    {hasOverlay ? "Available" : "None"}
                                </div>
                            </div>
                        </div>

                        {selectedFile && (
                            <div className="flex flex-col gap-3">
                                <InteractiveMRIViewer
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
                                    overlayUrl={
                                        showOverlay && hasOverlay && overlayFile
                                            ? `${API_URL}/files/${selectedCase}/${overlayFile}`
                                            : undefined
                                    }
                                    className="h-full"
                                />
                                {hasOverlay && (
                                    <button
                                        className={
                                            showOverlay
                                                ? "px-4 py-2 rounded-md font-mono border transition-colors text-xs bg-amber-500 text-white border-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)]"
                                                : "px-4 py-2 rounded-md font-mono border transition-colors text-xs bg-[#181b22] text-amber-400 border-amber-500/30 hover:bg-amber-500/10"
                                        }
                                        onClick={() => setShowOverlay((value) => !value)}
                                    >
                                        {showOverlay ? "Hide segmentation" : "Show segmentation"}
                                    </button>
                                )}
                                {imageFiles.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {imageFiles.map((file: string) => (
                                            <button
                                                key={file}
                                                className={
                                                    selectedFile === file
                                                        ? "px-3 py-1 rounded-md font-mono border transition-colors text-[10px] bg-cyan-500 text-white border-cyan-500"
                                                        : "px-3 py-1 rounded-md font-mono border transition-colors text-[10px] bg-[#181b22] text-cyan-300 border-cyan-500/30 hover:bg-cyan-500/10"
                                                }
                                                onClick={() => setSelectedFile(file)}
                                            >
                                                {file}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="lg:col-span-4 flex flex-col gap-6"
                    >
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                                <h3 className="font-mono text-xs uppercase tracking-widest text-[#a8e8ff]">
                                    Diagnosis
                                </h3>
                                <button
                                    type="button"
                                    onClick={() => setShowDiagnosis((value) => !value)}
                                    className="px-3 py-1 text-[10px] font-mono uppercase border border-[#3c494e] text-slate-300 hover:border-[#a8e8ff]/60"
                                >
                                    {showDiagnosis ? "Hide" : "Show"}
                                </button>
                            </div>
                            {diagnosisLoading && (
                                <div className="text-xs font-mono text-cyan-400">Loading diagnosis...</div>
                            )}
                            {diagnosisError && (
                                <div className="text-xs font-mono text-red-400">{diagnosisError}</div>
                            )}
                            {showDiagnosis && diagnosisInfo && (
                                <DiagnosisCard diagnosis={diagnosisInfo} />
                            )}
                            {!showDiagnosis && (
                                <div className="bg-[#1e2023] border border-[#3c494e] p-4 text-xs text-slate-400 font-mono">
                                    Diagnosis is hidden. Use the toggle to reveal details.
                                </div>
                            )}
                        </div>
                        <div className="flex-1 min-h-0 flex flex-col">
                            <ChatPanel />
                        </div>
                    </motion.div>
                </div>
            </main>
        </div>
    );
}
