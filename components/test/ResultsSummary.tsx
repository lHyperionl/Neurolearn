"use client";

import { motion } from "framer-motion";
import { Trophy, RotateCcw, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ResultsSummaryProps {
    score: number;
    total: number;
    onReset: () => void;
}

const ResultsSummary = ({ score, total, onReset }: ResultsSummaryProps) => {
    const percentage = Math.round((score / total) * 100);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl mx-auto rounded-2xl border border-cyan-500/20 bg-[#0f1117] p-10 shadow-2xl text-center space-y-8 relative overflow-hidden"
        >
            {/* Background Glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,212,255,0.1),transparent_70%)] pointer-events-none" />

            <div className="relative z-10 space-y-4">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-cyan-500/10 border border-cyan-500/30 mb-4">
                    <Trophy className="h-10 w-10 text-cyan-400" />
                </div>

                <h2 className="text-4xl font-bold font-syne text-white glow-text">
                    Assessment Complete
                </h2>
                <p className="text-slate-400 font-mono uppercase tracking-widest text-sm">
                    Your diagnostic accuracy has been calculated
                </p>
            </div>

            <div className="relative z-10 flex flex-col items-center gap-6">
                <div className="text-6xl font-bold font-syne text-cyan-400">
                    {score}{" "}
                    <span className="text-2xl text-slate-600">/ {total}</span>
                </div>

                <div className="w-full max-w-md space-y-2">
                    <div className="flex justify-between text-[10px] font-mono text-slate-500 uppercase tracking-tighter">
                        <span>Accuracy Rating</span>
                        <span>{percentage}%</span>
                    </div>
                    <div className="flex h-4 w-full gap-1">
                        {Array.from({ length: total }).map((_, i) => (
                            <div
                                key={i}
                                className={cn(
                                    "flex-1 rounded-sm",
                                    i < score
                                        ? "bg-cyan-500 shadow-[0_0_10px_rgba(0,212,255,0.3)]"
                                        : "bg-slate-800",
                                )}
                            />
                        ))}
                    </div>
                </div>
            </div>

            <div className="relative z-10 flex flex-col sm:flex-row gap-4 justify-center pt-6">
                <Button
                    disabled
                    variant="outline"
                    className="border-slate-800 text-slate-500 px-8 py-6 rounded-full flex items-center gap-2 cursor-not-allowed"
                >
                    <EyeOff className="h-4 w-4" /> REVIEW MISTAKES
                </Button>
                <Button
                    onClick={onReset}
                    className="bg-cyan-600 hover:bg-cyan-500 text-white px-8 py-6 rounded-full font-bold flex items-center gap-2 transition-all hover:scale-105"
                >
                    <RotateCcw className="h-4 w-4" /> TRY AGAIN
                </Button>
            </div>
        </motion.div>
    );
};

export default ResultsSummary;
