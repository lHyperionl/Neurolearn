"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Sidebar from "@/components/nav/Sidebar";
import { motion } from "framer-motion";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type GroupedCases = Record<string, string[]>;

export default function LearnCasesPage() {
    const [groupedCases, setGroupedCases] = useState<GroupedCases>({});
    const [selectedDiagnosis, setSelectedDiagnosis] = useState<string | null>(
        null,
    );
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        fetch(`${API_URL}/cases/grouped`)
            .then((res) => res.json())
            .then((data) => {
                setGroupedCases(data);
                // Nastavíme kategóriu ALL ako predvolenú, ak existuje
                if (data["ALL"]) {
                    setSelectedDiagnosis("ALL");
                } else {
                    const diagnoses = Object.keys(data);
                    if (diagnoses.length > 0) {
                        setSelectedDiagnosis(diagnoses[0]);
                    }
                }
                setLoading(false);
            })
            .catch(() => {
                setError("Failed to load cases.");
                setLoading(false);
            });
    }, []);

    // Kategórie zoradíme tak, aby "ALL" bola prvá, ostatné abecedne
    const diagnoses = Object.keys(groupedCases).sort((a, b) => {
        if (a === "ALL") return -1;
        if (b === "ALL") return 1;
        return a.localeCompare(b);
    });
    const currentCases =
        selectedDiagnosis && Array.isArray(groupedCases[selectedDiagnosis])
            ? groupedCases[selectedDiagnosis]
            : [];

    return (
        <div className="flex flex-1 overflow-hidden">
            <Sidebar />
            <main className="relative flex-1 overflow-y-auto overflow-x-hidden bg-[#0c0e11]">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute -top-24 -right-32 w-72 h-72 bg-cyan-500/10 blur-[140px]" />
                    <div className="absolute top-1/3 -left-20 w-48 h-48 bg-amber-500/10 blur-[120px]" />
                    <div className="absolute inset-0 opacity-[0.08] bg-[linear-gradient(to_right,#2a2f35_1px,transparent_1px),linear-gradient(to_bottom,#2a2f35_1px,transparent_1px)] bg-[size:32px_32px]" />
                </div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="relative z-10 max-w-6xl mx-auto px-6 py-10"
                >
                    <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
                        <div>
                            <div className="font-mono text-xs uppercase tracking-[0.45em] text-cyan-300/70">
                                Neurolearn Learn Lab
                            </div>
                            <h1 className="font-syne text-5xl md:text-6xl font-extrabold text-[#e2e2e6] tracking-tight mt-3">
                                Select a pathology
                            </h1>
                            <p className="text-xl text-slate-400 mt-4 max-w-2xl">
                                Explore cases categorized by diagnosis and
                                clinical context.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                            <div className="border border-[#3c494e] bg-[#14171c]/90 px-4 py-3">
                                <div className="text-[11px] uppercase tracking-[0.35em] text-slate-500">
                                    Total Categories
                                </div>
                                <div className="text-4xl font-syne text-[#e2e2e6] mt-2">
                                    {diagnoses.length || "--"}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-10 flex flex-wrap gap-4">
                        <Link
                            href="/add-case"
                            className="flex items-center gap-2 px-6 py-3 font-mono text-xs uppercase tracking-widest border border-cyan-400 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 transition-all shadow-[0_0_20px_rgba(34,211,238,0.1)]"
                        >
                            <span className="material-symbols-outlined text-sm">add_circle</span>
                            Add Case
                        </Link>
                        <Link
                            href="/add-diagnosis"
                            className="flex items-center gap-2 px-6 py-3 font-mono text-xs uppercase tracking-widest border border-amber-400 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 transition-all shadow-[0_0_20px_rgba(251,191,36,0.1)]"
                        >
                            <span className="material-symbols-outlined text-sm">diagnosis</span>
                            Add Diagnosis
                        </Link>
                    </div>

                    {/* Diagnosis Selector Tabs */}
                    <div className="mt-8 flex flex-wrap gap-2">
                        {diagnoses.map((diag) => (
                            <button
                                key={diag}
                                onClick={() => setSelectedDiagnosis(diag)}
                                className={`px-6 py-3 font-mono text-xs uppercase tracking-widest transition-all border ${
                                    selectedDiagnosis === diag
                                        ? "bg-cyan-500/10 border-cyan-400 text-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.1)]"
                                        : "bg-[#14171c]/50 border-[#3c494e] text-slate-500 hover:border-slate-400"
                                }`}
                            >
                                {diag}
                                <span className="ml-3 opacity-40 text-[10px]">
                                    ({groupedCases[diag].length})
                                </span>
                            </button>
                        ))}
                    </div>

                    <div className="mt-8 border border-[#3c494e] bg-[#14171c]/80">
                        <div className="flex items-center justify-between px-4 py-3 border-b border-[#3c494e]">
                            <h2 className="font-mono text-sm uppercase tracking-widest text-[#a8e8ff]">
                                {selectedDiagnosis
                                    ? `${selectedDiagnosis} Cases`
                                    : "Select a category"}
                            </h2>
                            <div className="text-sm font-mono uppercase tracking-[0.3em] text-slate-500">
                                {currentCases.length} entries
                            </div>
                        </div>
                        <div className="p-4">
                            {loading && (
                                <div className="text-lg font-mono text-cyan-400 animate-pulse">
                                    Scanning database...
                                </div>
                            )}
                            {error && (
                                <div className="text-lg font-mono text-red-400">
                                    {error}
                                </div>
                            )}
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                {currentCases.map((caseId, index) => (
                                    <Link
                                        key={caseId}
                                        href={`/learn/${caseId}?category=${selectedDiagnosis}`}
                                        className="group relative border border-[#3c494e] bg-[#0f1117] px-4 py-4 text-left transition-all hover:border-cyan-400/60"
                                    >
                                        <div className="absolute right-4 top-4 text-[10px] font-mono text-slate-500">
                                            {String(index + 1).padStart(2, "0")}
                                        </div>
                                        <div className="text-[11px] uppercase tracking-[0.35em] text-slate-500">
                                            Subject ID
                                        </div>
                                        <div className="text-2xl font-syne text-[#e2e2e6] mt-2 group-hover:text-cyan-200">
                                            {caseId}
                                        </div>
                                        <div className="mt-4 flex items-center gap-2 text-sm font-mono uppercase text-cyan-300">
                                            Analyze Case
                                            <span className="material-symbols-outlined text-sm">
                                                arrow_forward
                                            </span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                            {!loading &&
                                currentCases.length === 0 &&
                                !error && (
                                    <div className="py-12 text-center text-slate-500 font-mono">
                                        No cases found for this category.
                                    </div>
                                )}
                        </div>
                    </div>
                </motion.div>
            </main>
        </div>
    );
}
