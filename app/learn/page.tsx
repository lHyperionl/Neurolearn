"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Sidebar from "@/components/nav/Sidebar";
import { motion } from "framer-motion";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function LearnCasesPage() {
    const [cases, setCases] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
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
                setLoading(false);
            })
            .catch(() => {
                setError("Failed to load cases.");
                setLoading(false);
            });
    }, []);

    return (
        <div className="flex flex-1 overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto p-6 bg-[#0c0e11]">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="max-w-5xl mx-auto"
                >
                    <div className="bg-[#1e2023] border border-[#3c494e] p-4">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="font-mono text-xs uppercase tracking-widest text-[#a8e8ff]">
                                Select case
                            </h2>
                        </div>
                        {loading && (
                            <div className="text-xs font-mono text-cyan-400">Loading cases...</div>
                        )}
                        {error && (
                            <div className="text-xs font-mono text-red-400">{error}</div>
                        )}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {cases.map((caseId) => (
                                <Link
                                    key={caseId}
                                    href={`/learn/${caseId}`}
                                    className="border border-[#3c494e] bg-[#0f1117] px-3 py-2 text-left text-slate-300 font-mono text-xs hover:border-cyan-500/40"
                                >
                                    <div className="text-[9px] uppercase tracking-widest text-slate-500">Case</div>
                                    <div className="text-xs">{caseId}</div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </main>
        </div>
    );
}
