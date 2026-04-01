"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ResultsSummaryProps {
    score: number;
    total: number;
    onReset: () => void;
}

const ResultsSummary = ({ score, total, onReset }: ResultsSummaryProps) => {
    const percentage = Math.round((score / total) * 100);

    const gradeLabel =
        percentage >= 90
            ? "EXPERT_DIAGNOSTICIAN"
            : percentage >= 70
              ? "PROFICIENT_ANALYST"
              : percentage >= 50
                ? "TRAINEE_RESIDENT"
                : "REQUIRES_REVIEW";

    const gradeColor =
        percentage >= 90
            ? "text-[#a8e8ff]"
            : percentage >= 70
              ? "text-[#ffb95f]"
              : percentage >= 50
                ? "text-[#ffd9a1]"
                : "text-[#ffb4ab]";

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl mx-auto bg-[#1a1c1f] border border-[#a8e8ff]/20 p-10 relative overflow-hidden"
        >
            {/* Subtle grid overlay */}
            <div className="absolute inset-0 opacity-5 pointer-events-none bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px]" />

            {/* Radial glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(0,212,255,0.08),transparent_70%)] pointer-events-none" />

            <div className="relative z-10 space-y-8 text-center">
                {/* Header */}
                <div className="space-y-2">
                    <p className="font-mono text-[10px] text-[#859398] uppercase tracking-[0.3em]">
                        SESSION_COMPLETE // DIAGNOSTIC_REPORT
                    </p>
                    <h2 className="font-syne font-extrabold text-4xl text-[#e2e2e6] tracking-tighter uppercase">
                        Assessment Complete
                    </h2>
                    <p
                        className={cn(
                            "font-mono text-sm uppercase tracking-widest font-bold",
                            gradeColor,
                        )}
                    >
                        {gradeLabel}
                    </p>
                </div>

                {/* Score display */}
                <div className="flex flex-col items-center gap-2">
                    <div className="font-syne text-7xl font-extrabold text-[#00d4ff] leading-none">
                        {score}
                        <span className="text-3xl text-[#3c494e]">
                            {" "}
                            / {total}
                        </span>
                    </div>
                    <p className="font-mono text-xs text-[#859398] uppercase tracking-widest">
                        Correct Diagnoses
                    </p>
                </div>

                {/* Progress bar */}
                <div className="w-full max-w-sm mx-auto space-y-2">
                    <div className="flex justify-between text-[10px] font-mono text-[#859398] uppercase tracking-tighter">
                        <span>Accuracy Rating</span>
                        <span className={gradeColor}>{percentage}%</span>
                    </div>
                    <div className="flex h-3 w-full gap-1">
                        {Array.from({ length: total }).map((_, i) => (
                            <div
                                key={i}
                                className={cn(
                                    "flex-1",
                                    i < score
                                        ? "bg-[#00d4ff] shadow-[0_0_8px_rgba(0,212,255,0.4)]"
                                        : "bg-[#333538]",
                                )}
                            />
                        ))}
                    </div>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-4 border border-[#3c494e] p-4">
                    <div className="flex flex-col items-center gap-1">
                        <span className="font-mono text-[9px] text-[#859398] uppercase tracking-wider">
                            Correct
                        </span>
                        <span className="font-syne text-xl font-bold text-[#a8e8ff]">
                            {score}
                        </span>
                    </div>
                    <div className="flex flex-col items-center gap-1 border-x border-[#3c494e]">
                        <span className="font-mono text-[9px] text-[#859398] uppercase tracking-wider">
                            Incorrect
                        </span>
                        <span className="font-syne text-xl font-bold text-[#ffb4ab]">
                            {total - score}
                        </span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                        <span className="font-mono text-[9px] text-[#859398] uppercase tracking-wider">
                            Accuracy
                        </span>
                        <span
                            className={cn(
                                "font-syne text-xl font-bold",
                                gradeColor,
                            )}
                        >
                            {percentage}%
                        </span>
                    </div>
                </div>

                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                    <button
                        disabled
                        className="flex-1 sm:flex-none sm:px-8 py-4 border border-[#3c494e] text-[#3c494e] font-syne font-bold uppercase text-xs tracking-widest cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        <span
                            className="material-symbols-outlined"
                            style={{ fontSize: "16px" }}
                        >
                            history
                        </span>
                        REVIEW_MISTAKES
                    </button>
                    <button
                        onClick={onReset}
                        className="flex-1 sm:flex-none sm:px-12 py-4 bg-[#00d4ff] text-[#003642] font-syne font-extrabold uppercase text-xs tracking-widest hover:shadow-[0_0_20px_rgba(0,212,255,0.4)] transition-all flex items-center justify-center gap-2"
                    >
                        <span
                            className="material-symbols-outlined"
                            style={{ fontSize: "16px" }}
                        >
                            restart_alt
                        </span>
                        RESTART_SESSION
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default ResultsSummary;
