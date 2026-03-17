"use client";

import { useState } from "react";
import Image from "next/image";
import { Question } from "@/lib/mock-data";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, ArrowRight, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface QuestionCardProps {
    question: Question;
    onAnswer: (isCorrect: boolean) => void;
    onNext: () => void;
}

const QuestionCard = ({ question, onAnswer, onNext }: QuestionCardProps) => {
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSelect = (id: string) => {
        if (isSubmitted) return;
        setSelectedId(id);
    };

    const handleSubmit = () => {
        if (!selectedId || isSubmitted) return;
        setIsSubmitted(true);
        onAnswer(selectedId === question.correctDiagnosisId);
    };

    return (
        <div className="w-full max-w-4xl mx-auto space-y-8">
            <div className="relative rounded-2xl border border-cyan-500/20 bg-[#0f1117] p-6 shadow-2xl overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />

                <div className="space-y-6">
                    <div className="text-center space-y-2">
                        <h2 className="text-2xl font-bold font-syne text-white">
                            Classify this MRI scan
                        </h2>
                        <p className="text-slate-500 font-mono text-xs uppercase tracking-widest">
                            Analyze the radiological findings below
                        </p>
                    </div>

                    <div className="relative aspect-square max-w-md mx-auto rounded-xl border border-slate-800 bg-black overflow-hidden group">
                        <Image
                            src={question.mriImage}
                            alt="Test MRI"
                            fill
                            className="object-contain grayscale contrast-125"
                        />
                        <div className="absolute inset-0 bg-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                        <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md border border-cyan-500/30 px-2 py-1 rounded text-[10px] font-mono text-cyan-400">
                            SCAN_ID: {question.id.toUpperCase()}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {question.options.map((option) => {
                            const isSelected =
                                selectedId === option.diagnosisId;
                            const isCorrect =
                                option.diagnosisId ===
                                question.correctDiagnosisId;
                            const showResult = isSubmitted;

                            return (
                                <button
                                    key={option.diagnosisId}
                                    onClick={() =>
                                        handleSelect(option.diagnosisId)
                                    }
                                    disabled={isSubmitted}
                                    className={cn(
                                        "relative flex flex-col items-start p-4 rounded-xl border-2 text-left transition-all duration-200",
                                        !showResult &&
                                            !isSelected &&
                                            "border-slate-800 bg-slate-900/50 hover:border-cyan-500/50 hover:bg-cyan-500/5",
                                        !showResult &&
                                            isSelected &&
                                            "border-cyan-500 bg-cyan-500/10 shadow-[0_0_15px_rgba(0,212,255,0.2)]",
                                        showResult &&
                                            isCorrect &&
                                            "border-green-500 bg-green-500/10",
                                        showResult &&
                                            isSelected &&
                                            !isCorrect &&
                                            "border-red-500 bg-red-500/10",
                                        showResult &&
                                            !isCorrect &&
                                            !isSelected &&
                                            "border-slate-800 bg-slate-900/50 opacity-50",
                                    )}
                                >
                                    <div className="flex w-full justify-between items-center mb-1">
                                        <span
                                            className={cn(
                                                "font-bold text-sm",
                                                showResult && isCorrect
                                                    ? "text-green-400"
                                                    : showResult &&
                                                        isSelected &&
                                                        !isCorrect
                                                      ? "text-red-400"
                                                      : isSelected
                                                        ? "text-cyan-400"
                                                        : "text-slate-200",
                                            )}
                                        >
                                            {option.name}
                                        </span>
                                        {showResult && isCorrect && (
                                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                                        )}
                                        {showResult &&
                                            isSelected &&
                                            !isCorrect && (
                                                <XCircle className="h-4 w-4 text-red-500" />
                                            )}
                                    </div>
                                    <span className="text-xs text-slate-500 font-mono leading-tight">
                                        {option.hint}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    <div className="flex justify-center pt-4">
                        {!isSubmitted ? (
                            <Button
                                onClick={handleSubmit}
                                disabled={!selectedId}
                                className="bg-cyan-600 hover:bg-cyan-500 text-white px-8 py-6 rounded-full font-bold tracking-wide transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                            >
                                CHECK ANSWER
                            </Button>
                        ) : (
                            <Button
                                onClick={onNext}
                                className="bg-white text-black hover:bg-slate-200 px-8 py-6 rounded-full font-bold tracking-wide transition-all hover:scale-105 flex items-center gap-2"
                            >
                                NEXT QUESTION <ArrowRight className="h-5 w-5" />
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {isSubmitted && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                            "p-6 rounded-xl border-l-4 shadow-lg",
                            selectedId === question.correctDiagnosisId
                                ? "bg-green-500/10 border-green-500 text-green-200"
                                : "bg-red-500/10 border-red-500 text-red-200",
                        )}
                    >
                        <div className="flex items-center gap-3 mb-2">
                            {selectedId === question.correctDiagnosisId ? (
                                <CheckCircle2 className="h-6 w-6 text-green-500" />
                            ) : (
                                <AlertCircle className="h-6 w-6 text-red-500" />
                            )}
                            <h3 className="font-bold text-lg">
                                {selectedId === question.correctDiagnosisId
                                    ? "Correct Diagnosis!"
                                    : "Not quite."}
                            </h3>
                        </div>
                        <p className="text-sm opacity-90 leading-relaxed">
                            {question.explanation}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default QuestionCard;
