"use client";

import { useEffect, useState } from "react";
import InteractiveMRIViewer from "@/components/learn/InteractiveMRIViewer";
import DiagnosisCard from "@/components/learn/DiagnosisCard";
import ChatPanel from "@/components/learn/ChatPanel";
import Sidebar from "@/components/nav/Sidebar";
import { motion, AnimatePresence } from "framer-motion";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function LearnPage() {
    const [cases, setCases] = useState<string[]>([]);
    const [selectedCase, setSelectedCase] = useState<string | null>(null);
    const [files, setFiles] = useState<string[]>([]);
    const [selectedFile, setSelectedFile] = useState<string | null>(null);
    const [patientInfo, setPatientInfo] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showOverlay, setShowOverlay] = useState(false);
    const [overlayFile, setOverlayFile] = useState<string | null>(null);

    // Fetch initial cases
    useEffect(() => {
        fetch(`${API_URL}/cases`)
            .then((res) => res.json())
            .then((data) => {
                let caseList: string[] = [];
                if (Array.isArray(data)) {
                    caseList = data;
                } else if (
                    data &&
                    typeof data === "object" &&
                    Array.isArray(data.cases)
                ) {
                    caseList = data.cases;
                }
                // Filter out system folders and files
                caseList = caseList.filter(
                    (c) => c.startsWith("sub-") && !c.includes("."),
                );
                setCases(caseList);
                if (caseList.length > 0) setSelectedCase(caseList[0]);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Failed to fetch cases", err);
                setLoading(false);
            });
    }, []);

    // Fetch files and patient info when case changes
    useEffect(() => {
        if (!selectedCase) return;

        // Fetch Files
        fetch(`${API_URL}/cases/${selectedCase}/files`)
            .then((res) => res.json())
            .then((data) => {
                let fileList: string[] = [];
                if (Array.isArray(data)) {
                    fileList = data;
                } else if (
                    data &&
                    typeof data === "object" &&
                    Array.isArray(data.files)
                ) {
                    fileList = data.files;
                }
                setFiles(fileList);
                // Default to a non-segmentation file if possible
                const mainFile =
                    fileList.find(
                        (f: string) => !f.toLowerCase().includes("seg"),
                    ) || fileList[0];
                setSelectedFile(mainFile);

                const seg = fileList.find((f: string) =>
                    f.toLowerCase().includes("seg"),
                );
                setOverlayFile(seg || null);
            });

        // Fetch Patient Info
        fetch(`${API_URL}/participants/${selectedCase}`)
            .then((res) => res.json())
            .then((data) => {
                // Handle format mismatch if patient info differs from what DiagnosisCard expects
                setPatientInfo(data);
            })
            .catch(() =>
                setPatientInfo({
                    participant_id: selectedCase,
                    diagnosis: "Clinical Evaluation Pending",
                }),
            );
    }, [selectedCase]);

    // Construct URLs
    const mriUrl =
        selectedCase && selectedFile
            ? `${API_URL}/files/${selectedCase}/${selectedFile}`
            : "";

    const overlayUrl =
        showOverlay && selectedCase && overlayFile
            ? `${API_URL}/files/${selectedCase}/${overlayFile}`
            : undefined;

    return (
        <div className="flex flex-1 overflow-hidden h-screen bg-[#0c0e11]">
            <Sidebar />
            <main className="flex-1 overflow-hidden flex flex-col p-6">
                <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 h-full min-h-0">
                    {/* Left Panel - MRI Viewer (60%) */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="lg:col-span-6 flex flex-col gap-4 min-h-0"
                    >
                        {/* Case & Modality Selectors UI */}
                        <div className="flex flex-wrap items-center gap-4 bg-[#1e2023] border border-[#3c494e] p-3 rounded-sm shadow-inner">
                            <div className="flex items-center gap-2">
                                <span className="font-mono text-[10px] text-[#5c696e] uppercase tracking-tighter">
                                    CASE_ID:
                                </span>
                                <select
                                    value={selectedCase || ""}
                                    onChange={(e) =>
                                        setSelectedCase(e.target.value)
                                    }
                                    className="bg-[#0f1117] border border-cyan-500/20 text-cyan-400 font-mono text-xs rounded-none px-2 py-1 outline-none focus:border-cyan-500/50 hover:bg-[#15171d] transition-colors"
                                >
                                    {cases.map((c) => (
                                        <option key={c} value={c}>
                                            {c}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-center gap-2">
                                <span className="font-mono text-[10px] text-[#5c696e] uppercase tracking-tighter">
                                    SEQUENCE:
                                </span>
                                <select
                                    value={selectedFile || ""}
                                    onChange={(e) =>
                                        setSelectedFile(e.target.value)
                                    }
                                    className="bg-[#0f1117] border border-cyan-500/20 text-cyan-400 font-mono text-xs rounded-none px-2 py-1 outline-none focus:border-cyan-500/50 hover:bg-[#15171d] transition-colors max-w-[180px]"
                                >
                                    {files.map((f) => (
                                        <option key={f} value={f}>
                                            {f}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {overlayFile && (
                                <button
                                    onClick={() => setShowOverlay(!showOverlay)}
                                    className={cn(
                                        "px-3 py-1 font-mono text-[10px] border transition-all uppercase tracking-widest ml-auto",
                                        showOverlay
                                            ? "bg-amber-500/20 border-amber-500 text-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.2)]"
                                            : "bg-[#0d1117] border-[#3c494e]/40 text-[#5c696e] hover:text-amber-400/70",
                                    )}
                                >
                                    {showOverlay
                                        ? "[ SEGMENTATION: ON ]"
                                        : "[ SEGMENTATION: OFF ]"}
                                </button>
                            )}
                        </div>

                        <div className="flex-1 min-h-0">
                            {mriUrl ? (
                                <InteractiveMRIViewer
                                    url={mriUrl}
                                    overlayUrl={overlayUrl}
                                    className="h-full"
                                />
                            ) : (
                                <div className="h-full bg-[#1e2023] border border-[#3c494e] flex items-center justify-center font-mono text-slate-500">
                                    WAITING FOR NEURAL STREAM...
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Right Panel - Info + Chat (40%) */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="lg:col-span-4 flex flex-col gap-6 min-h-0"
                    >
                        <div className="h-[45%] flex-shrink-0 min-h-0">
                            <DiagnosisCard diagnosis={patientInfo || {}} />
                        </div>
                        <div className="flex-1 min-h-0 bg-[#1e2023] border border-[#3c494e] overflow-hidden">
                            <ChatPanel />
                        </div>
                    </motion.div>
                </div>
            </main>

            <style jsx global>{`
                .mri-glow {
                    box-shadow: 0 0 20px rgba(0, 212, 255, 0.05);
                }
                .neural-scanline {
                    background: linear-gradient(
                        to bottom,
                        transparent 50%,
                        rgba(0, 212, 255, 0.02) 50%
                    );
                    background-size: 100% 4px;
                }
            `}</style>
        </div>
    );
}

function cn(...classes: any[]) {
    return classes.filter(Boolean).join(" ");
}
