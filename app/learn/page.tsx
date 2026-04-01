"use client";

import MRIViewer from "@/components/learn/MRIViewer";
import DiagnosisCard from "@/components/learn/DiagnosisCard";
import ChatPanel from "@/components/learn/ChatPanel";
import Sidebar from "@/components/nav/Sidebar";
import { diagnoses } from "@/lib/mock-data";
import { motion } from "framer-motion";

export default function LearnPage() {
    const currentDiagnosis = diagnoses[0];

    return (
        <div className="flex flex-1 overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto p-6 bg-[#0c0e11]">
                <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 min-h-full">
                    {/* Left Panel - MRI Viewer (60%) */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="lg:col-span-6 flex flex-col gap-4"
                        style={{ minHeight: "calc(100vh - 73px - 3rem)" }}
                    >
                        <MRIViewer images={currentDiagnosis.mriImages} />
                    </motion.div>

                    {/* Right Panel - Info + Chat (40%) */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="lg:col-span-4 flex flex-col gap-6"
                    >
                        <div className="flex-shrink-0">
                            <DiagnosisCard diagnosis={currentDiagnosis} />
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
