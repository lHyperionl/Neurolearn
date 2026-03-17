"use client";

import { useState } from "react";
import MRIViewer from "@/components/learn/MRIViewer";
import DiagnosisCard from "@/components/learn/DiagnosisCard";
import ChatPanel from "@/components/learn/ChatPanel";
import { diagnoses } from "@/lib/mock-data";
import { motion } from "framer-motion";

export default function LearnPage() {
    // For the prototype, we'll just show the first diagnosis
    const currentDiagnosis = diagnoses[0];

    return (
        <div className="container mx-auto px-4 py-8 h-[calc(100vh-64px)]">
            <div className="grid grid-cols-1 lg:grid-cols-10 gap-8 h-full">
                {/* Left Panel - MRI Viewer (60%) */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="lg:col-span-6 flex flex-col h-full"
                >
                    <MRIViewer images={currentDiagnosis.mriImages} />
                </motion.div>

                {/* Right Panel - Info + Chat (40%) */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="lg:col-span-4 flex flex-col gap-6 h-full overflow-hidden"
                >
                    <div className="flex-shrink-0">
                        <DiagnosisCard diagnosis={currentDiagnosis} />
                    </div>
                    <div className="flex-1 min-h-0">
                        <ChatPanel />
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
