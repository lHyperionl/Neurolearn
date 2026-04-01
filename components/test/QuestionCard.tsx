"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Question } from "@/lib/mock-data";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface QuestionCardProps {
    question: Question;
    onAnswer: (isCorrect: boolean) => void;
    onNext: () => void;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
const QuestionCard = ({ question, onAnswer, onNext }: QuestionCardProps) => {
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [responseTime, setResponseTime] = useState<number>(0);
    // Store start time in a ref; set after mount via effect (avoids impure call during render)
    const startTimeRef = useRef<number>(0);
    useEffect(() => {
        startTimeRef.current = performance.now();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [question.id]);

    const handleSelect = (id: string) => {
        if (isSubmitted) return;
        setSelectedId(id);
    };

    const handleSubmit = () => {
        if (!selectedId || isSubmitted) return;
        const elapsed =
            Math.round(
                (performance.now() - (startTimeRef.current ?? 0)) / 100,
            ) / 10;
        setResponseTime(elapsed);
        setIsSubmitted(true);
        onAnswer(selectedId === question.correctDiagnosisId);
    };

    const isCorrectAnswer = selectedId === question.correctDiagnosisId;
    const confidenceScore = isCorrectAnswer
        ? Math.max(
              60,
              Math.min(99, Math.round(99 - responseTime * 0.5)),
          ).toFixed(1)
        : Math.max(
              10,
              Math.min(45, Math.round(45 - responseTime * 0.3)),
          ).toFixed(1);

    return (
        <div className="w-full max-w-5xl mx-auto space-y-6">
            {/* Question Card */}
            <div className="w-full bg-[#1a1c1f] border border-[#a8e8ff]/20 p-8 flex flex-col md:flex-row gap-8 relative overflow-hidden">
                {/* Subtle grid overlay */}
                <div className="absolute inset-0 opacity-5 pointer-events-none bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px]" />

                {/* Ref ID corner label */}
                <div className="absolute top-4 right-4 font-mono text-[10px] text-[#a8e8ff]/40 uppercase">
                    REF_ID: SCAN_{question.id.toUpperCase()}
                </div>

                {/* ── Image Section ── */}
                <div className="flex-1 space-y-4 relative z-10">
                    <div className="h-[400px] w-full bg-black flex items-center justify-center border border-[#3c494e] relative group overflow-hidden">
                        <Image
                            src={question.mriImage}
                            alt="Test MRI Scan"
                            fill
                            sizes="(max-width: 768px) 100vw, 50vw"
                            className="object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                        />
                        {/* HUD overlays */}
                        <div className="absolute top-2 left-2 flex gap-2 z-10">
                            <span className="font-mono text-[10px] bg-black/60 px-1 text-[#a8e8ff]">
                                L
                            </span>
                            <span className="font-mono text-[10px] bg-black/60 px-1 text-[#a8e8ff]">
                                P
                            </span>
                        </div>
                        <div className="absolute bottom-4 left-4 font-mono text-[10px] text-white/40 z-10">
                            CONTRAST: +1.2EV
                            <br />
                            SEQUENCE: T2W_FLAIR
                        </div>
                        <div className="absolute inset-0 border border-[#a8e8ff]/10 pointer-events-none" />
                    </div>

                    <div className="flex gap-2">
                        <button className="flex-1 bg-[#1e2023] hover:bg-[#282a2d] text-[#e2e2e6] py-2 font-mono text-[10px] uppercase transition-colors flex items-center justify-center gap-2">
                            <span
                                className="material-symbols-outlined"
                                style={{ fontSize: "14px" }}
                            >
                                zoom_in
                            </span>
                            ENLARGE_VIEW
                        </button>
                        <button className="flex-1 bg-[#1e2023] hover:bg-[#282a2d] text-[#e2e2e6] py-2 font-mono text-[10px] uppercase transition-colors flex items-center justify-center gap-2">
                            <span
                                className="material-symbols-outlined"
                                style={{ fontSize: "14px" }}
                            >
                                layers
                            </span>
                            TOGGLE_SEQUENCE
                        </button>
                    </div>
                </div>

                {/* ── Content Section ── */}
                <div className="flex-1 flex flex-col justify-between relative z-10">
                    <div>
                        <h2 className="font-syne font-bold text-3xl mb-4 tracking-tight text-[#e2e2e6] uppercase">
                            Classify this MRI scan
                        </h2>
                        <p className="text-[#bbc9cf] leading-relaxed mb-8">
                            The patient presents with progressive symptoms. The
                            sequence shown highlights a significant lesion.
                            Select the most likely pathological classification.
                        </p>

                        {/* Answer Options */}
                        <div className="grid grid-cols-1 gap-3">
                            {question.options.map((option) => {
                                const isSelected =
                                    selectedId === option.diagnosisId;
                                const isCorrect =
                                    option.diagnosisId ===
                                    question.correctDiagnosisId;

                                let containerCls =
                                    "group bg-[#1e2023] hover:bg-[#282a2d] p-4 flex flex-col text-left transition-all border-l-2 border-transparent hover:border-[#a8e8ff]";
                                let titleCls =
                                    "font-syne font-bold text-sm tracking-wide text-[#e2e2e6] group-hover:text-[#a8e8ff] transition-colors";
                                let subtitleCls =
                                    "font-mono text-[10px] text-[#bbc9cf] uppercase mt-1";

                                if (isSubmitted) {
                                    if (isCorrect) {
                                        containerCls =
                                            "bg-[#333538] p-4 flex flex-col text-left border-l-2 border-[#a8e8ff] shadow-[0_0_15px_rgba(0,212,255,0.1)]";
                                        titleCls =
                                            "font-syne font-bold text-sm tracking-wide text-[#00d4ff]";
                                        subtitleCls =
                                            "font-mono text-[10px] text-[#00d4ff]/70 uppercase mt-1";
                                    } else if (isSelected && !isCorrect) {
                                        containerCls =
                                            "bg-[#1e2023] p-4 flex flex-col text-left border-l-2 border-[#ffb4ab]";
                                        titleCls =
                                            "font-syne font-bold text-sm tracking-wide text-[#ffb4ab]";
                                        subtitleCls =
                                            "font-mono text-[10px] text-[#ffb4ab]/70 uppercase mt-1";
                                    } else {
                                        containerCls =
                                            "bg-[#1e2023] p-4 flex flex-col text-left border-l-2 border-transparent opacity-50";
                                        titleCls =
                                            "font-syne font-bold text-sm tracking-wide text-[#e2e2e6]";
                                        subtitleCls =
                                            "font-mono text-[10px] text-[#bbc9cf] uppercase mt-1";
                                    }
                                } else if (isSelected) {
                                    containerCls =
                                        "bg-[#282a2d] p-4 flex flex-col text-left border-l-2 border-[#00d4ff] shadow-[0_0_15px_rgba(0,212,255,0.1)]";
                                    titleCls =
                                        "font-syne font-bold text-sm tracking-wide text-[#00d4ff]";
                                    subtitleCls =
                                        "font-mono text-[10px] text-[#00d4ff]/70 uppercase mt-1";
                                }

                                return (
                                    <button
                                        key={option.diagnosisId}
                                        onClick={() =>
                                            handleSelect(option.diagnosisId)
                                        }
                                        disabled={isSubmitted}
                                        className={containerCls}
                                    >
                                        <div className="flex justify-between items-center w-full">
                                            <span className={titleCls}>
                                                {option.name.toUpperCase()}
                                            </span>
                                            {isSubmitted && isCorrect && (
                                                <span
                                                    className="material-symbols-outlined text-[#00d4ff]"
                                                    style={{ fontSize: "18px" }}
                                                >
                                                    check_circle
                                                </span>
                                            )}
                                            {isSubmitted &&
                                                isSelected &&
                                                !isCorrect && (
                                                    <span
                                                        className="material-symbols-outlined text-[#ffb4ab]"
                                                        style={{
                                                            fontSize: "18px",
                                                        }}
                                                    >
                                                        cancel
                                                    </span>
                                                )}
                                        </div>
                                        <span className={subtitleCls}>
                                            {option.hint}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Action Bar */}
                    <div className="mt-8 pt-6 border-t border-[#3c494e] flex gap-4">
                        <button
                            onClick={handleSubmit}
                            disabled={!selectedId || isSubmitted}
                            className="flex-1 bg-[#00d4ff] disabled:opacity-40 text-[#00586b] py-4 font-syne font-extrabold uppercase text-xs tracking-[0.2em] hover:shadow-[0_0_20px_rgba(0,212,255,0.4)] transition-all"
                        >
                            CHECK_ANSWER
                        </button>
                        <button className="px-6 border border-[#3c494e] text-[#e2e2e6] hover:bg-[#1e2023] transition-colors flex items-center justify-center">
                            <span
                                className="material-symbols-outlined"
                                style={{ fontSize: "20px" }}
                            >
                                flag
                            </span>
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Feedback Panel ── */}
            <AnimatePresence>
                {isSubmitted && (
                    <motion.div
                        initial={{ opacity: 0, y: -16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className={cn(
                            "w-full bg-[#1e2023] border p-6 flex flex-col md:flex-row items-start gap-6",
                            isCorrectAnswer
                                ? "border-[#a8e8ff]/30"
                                : "border-[#ffb4ab]/30",
                        )}
                    >
                        {/* Status Icon */}
                        <div
                            className={cn(
                                "p-3 shrink-0",
                                isCorrectAnswer
                                    ? "bg-[#a8e8ff]/10"
                                    : "bg-[#ffb4ab]/10",
                            )}
                        >
                            <span
                                className="material-symbols-outlined"
                                style={{
                                    fontSize: "36px",
                                    color: isCorrectAnswer
                                        ? "#00d4ff"
                                        : "#ffb4ab",
                                    fontVariationSettings:
                                        "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 36",
                                }}
                            >
                                {isCorrectAnswer ? "verified" : "cancel"}
                            </span>
                        </div>

                        {/* Explanation */}
                        <div className="flex-grow">
                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                                <h3
                                    className={cn(
                                        "font-syne font-bold text-xl uppercase tracking-tight",
                                        isCorrectAnswer
                                            ? "text-[#a8e8ff]"
                                            : "text-[#ffb4ab]",
                                    )}
                                >
                                    {isCorrectAnswer
                                        ? "DIAGNOSTIC_CONFIRMED"
                                        : "DIAGNOSTIC_ERROR"}
                                </h3>
                                {isCorrectAnswer && (
                                    <span className="font-mono text-[10px] bg-[#a8e8ff]/20 text-[#a8e8ff] px-2 py-0.5">
                                        +50 XP
                                    </span>
                                )}
                            </div>

                            <p className="text-sm text-[#bbc9cf] leading-relaxed max-w-3xl">
                                {question.explanation}
                            </p>

                            <div className="mt-4 flex gap-6">
                                <div className="flex flex-col">
                                    <span className="font-mono text-[9px] text-[#859398] uppercase tracking-wider">
                                        Confidence Score
                                    </span>
                                    <span
                                        className={cn(
                                            "font-mono text-sm",
                                            isCorrectAnswer
                                                ? "text-[#a8e8ff]"
                                                : "text-[#ffb95f]",
                                        )}
                                    >
                                        {confidenceScore}%
                                    </span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-mono text-[9px] text-[#859398] uppercase tracking-wider">
                                        Response Time
                                    </span>
                                    <span className="font-mono text-sm text-[#e2e2e6]">
                                        {responseTime.toFixed(1)}s
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Next button */}
                        <button
                            onClick={onNext}
                            className="w-full md:w-auto shrink-0 bg-[#a8e8ff] text-[#003642] px-10 py-4 font-syne font-extrabold uppercase text-xs tracking-widest hover:brightness-110 transition-all self-center shadow-[0_0_30px_rgba(168,232,255,0.2)]"
                        >
                            NEXT_SEQUENCE
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default QuestionCard;
